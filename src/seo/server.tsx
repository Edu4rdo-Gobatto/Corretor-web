import { isValidPropertySlug, normalizedUrl, propertyUrl, readCatalogUrl } from '../services/urls';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { BootstrapContext } from './context';
import { absolute, buildSeo, escapeHtml, renderHead, serialize, type Bootstrap, type SeoConfig } from './metadata';
import { pageFromWire, propertyFromWire, wireCatalogQuery, type Classification, type Classifications, type WirePage, type WireProperty } from '../services/portuguese';
import type { Page, Property } from '../types';
import { brand } from '../config/brand';

export interface ServerConfig extends SeoConfig { apiOrigin: string }
const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()'
};
function withSecurityHeaders(headers: Record<string, string>): Record<string, string> {
  return { ...securityHeaders, ...headers };
}
export function serverConfig(env: Record<string, string | undefined>): ServerConfig {
  let siteUrl = '';
  let apiOrigin = '';
  for (const [key, value] of Object.entries({ site: env.SITE_URL, api: env.API_ORIGIN })) {
    if (!value) continue;
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new Error(`Invalid ${key} origin`);
    if (key === 'site') siteUrl = parsed.origin; else apiOrigin = parsed.origin;
  }
  const requested = env.SEO_INDEXABLE === 'true' && env.VERCEL_ENV !== 'preview' && env.NODE_ENV === 'production';
  const apiHost = apiOrigin ? new URL(apiOrigin).hostname : '';
  const localApi = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(apiHost);
  if (env.NODE_ENV === 'production' && apiOrigin && !apiOrigin.startsWith('https://') && !localApi) throw new Error('Production API_ORIGIN requires HTTPS');
  if (requested && (!siteUrl.startsWith('https://') || !apiOrigin.startsWith('https://'))) throw new Error('Indexing requires HTTPS SITE_URL and API_ORIGIN');
  return { siteUrl, apiOrigin, indexable: requested };
}
class PublicError extends Error { constructor(public status: number) { super('Public request failed'); } }
async function publicGet<T>(path: string, config: ServerConfig, fetcher: typeof fetch, allowNotFound = false): Promise<T> {
  if (!config.apiOrigin) throw new PublicError(503);
  const result = await fetcher(`${config.apiOrigin}${path}`, { headers: { Accept: 'application/json' }, credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(10000) });
  if (!result.ok) throw new PublicError(result.status === 404 && allowNotFound ? 404 : 503);
  return result.json();
}
async function publicClassifications(config:ServerConfig,fetcher:typeof fetch):Promise<Classifications> {
  const load=async(kind:string)=>{const items:Classification[]=[];let pagina=1;let total=1;do{const result=await publicGet<WirePage<Classification>>(`/${kind}?pagina=${pagina}&limite=100`,config,fetcher);items.push(...result.itens);total=result.total_paginas??Math.ceil(result.total/result.limite);pagina++;}while(pagina<=total);return items;};
  const [types,purposes,features]=await Promise.all([load('tipos-imovel'),load('finalidades-imovel'),load('caracteristicas')]);return {types,purposes,features};
}
const xml = (body: string, type: 'urlset' | 'sitemapindex' = 'urlset') => `<?xml version="1.0" encoding="UTF-8"?><${type} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</${type}>`;
export function sitemapChunks(entries: string[], maxCount = 45000, maxBytes = 45000000) {
  const chunks: string[][] = [[]];
  let bytes = 0;
  for (const entry of entries) {
    const size = new TextEncoder().encode(entry).length;
    if (size > maxBytes) throw new Error('Sitemap entry too large');
    if (chunks.at(-1)!.length >= maxCount || bytes + size > maxBytes) { chunks.push([]); bytes = 0; }
    chunks.at(-1)!.push(entry); bytes += size;
  }
  return chunks.map(chunk => xml(chunk.join('')));
}
async function sitemap(path: string, config: ServerConfig, fetcher: typeof fetch) {
  if (!config.siteUrl) throw new PublicError(503);
  const entries = new Map<string, string>();
  for (const url of ['/', '/privacidade']) entries.set(url, `<url><loc>${escapeHtml(absolute(url, config))}</loc></url>`);
  const deadline = AbortSignal.timeout(45000);
  const boundedFetch: typeof fetch = (input, init) => fetcher(input, { ...init, signal: AbortSignal.any([deadline, ...(init?.signal ? [init.signal] : [])]) });
  const collect = (result: Page<Property>) => {
    if (!Array.isArray(result.items) || !Number.isInteger(result.totalPages) || result.totalPages < 0) throw new PublicError(503);
    for (const property of result.items) {
      if (!property.slug || typeof property.slug !== 'string') throw new PublicError(503);
      const url = propertyUrl(property.slug);
      const date = new Date(property.updatedAt);
      entries.set(url, `<url><loc>${escapeHtml(absolute(url, config))}</loc>${Number.isNaN(date.valueOf()) ? '' : `<lastmod>${date.toISOString()}</lastmod>`}</url>`);
    }
  };
  const first = pageFromWire(await publicGet<WirePage<WireProperty>>('/imoveis?pagina=1&limite=100', config, boundedFetch), propertyFromWire);
  collect(first);
  let nextPage = 2;
  await Promise.all(Array.from({ length: Math.min(6, Math.max(0, first.totalPages - 1)) }, async () => {
    while (nextPage <= first.totalPages) {
      const current = nextPage++;
      deadline.throwIfAborted();
      collect(pageFromWire(await publicGet<WirePage<WireProperty>>(`/imoveis?pagina=${current}&limite=100`, config, boundedFetch), propertyFromWire));
    }
  }));
  const chunks = sitemapChunks([...entries].sort(([a], [b]) => a.localeCompare(b)).map(([, entry]) => entry));
  if (path === '/sitemap.xml') return chunks.length === 1 ? chunks[0] : xml(chunks.map((_, index) => `<sitemap><loc>${escapeHtml(absolute(`/sitemaps/${index + 1}.xml`, config))}</loc></sitemap>`).join(''), 'sitemapindex');
  const index = Number(path.match(/^\/sitemaps\/([1-9]\d*)\.xml$/)?.[1]) - 1;
  if (!chunks[index]) throw new PublicError(404);
  return chunks[index];
}
export async function handleRequest(path: string, config: ServerConfig, fetcher: typeof fetch = fetch, template = '<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"/><!--seo-head--></head><body><div id="root"><!--app-html--></div><!--bootstrap--></body></html>') {
  const url = new URL(path, 'http://local');
  const normalized = normalizedUrl(path);
  if (normalized !== url.pathname + url.search) return { status: 301, headers: withSecurityHeaders({ Location: normalized, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex,nofollow' }), body: '' };
  const catalog = readCatalogUrl(path);
  const admin = url.pathname === '/admin' || url.pathname.startsWith('/admin/');
  const headers: Record<string, string> = withSecurityHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': admin || !config.indexable ? 'no-store' : 'public, max-age=0, s-maxage=300', 'X-Robots-Tag': 'noindex,nofollow' });
  const boot: Bootstrap = { url: url.pathname + url.search, config: { siteUrl: config.siteUrl, indexable: config.indexable }, data: {}, status: 200 };
  try {
    if (url.pathname === '/robots.txt' || url.pathname === '/llms.txt') {
      headers['Content-Type'] = 'text/plain; charset=utf-8';
      const body = url.pathname === '/robots.txt'
        ? `User-agent: *\n${config.indexable ? 'Disallow: /api/\nDisallow: /api\n' : 'Disallow: /\n'}${config.siteUrl ? `Sitemap: ${absolute('/sitemap.xml', config)}\n` : ''}`
        : `# ${brand.name}\n\n> Catálogo de imóveis comerciais para alugar e comprar em ${brand.region.name}.\n\nSalas comerciais, lojas, galpões, prédios e terrenos. Valores e disponibilidade devem ser consultados no anúncio; o atendimento é realizado pelo corretor responsável.\n\n## Páginas públicas\n- [Catálogo](${absolute('/', config) || '/'}): imóveis disponíveis.\n- [Alugar](${absolute('/imoveis/para-alugar', config) || '/imoveis/para-alugar'}): imóveis para locação.\n- [Comprar](${absolute('/imoveis/para-comprar', config) || '/imoveis/para-comprar'}): imóveis à venda.\n- [Privacidade](${absolute('/privacidade', config) || '/privacidade'}): uso de dados no atendimento.\n- [Sitemap](${absolute('/sitemap.xml', config) || '/sitemap.xml'}): endereços públicos atualizados.\n`;
      return { status: 200, headers, body };
    }
    if (url.pathname === '/sitemap.xml' || url.pathname.startsWith('/sitemaps/')) {
      const body = !config.indexable ? xml('') : await sitemap(url.pathname, config, fetcher);
      headers['Content-Type'] = 'application/xml; charset=utf-8';
      return { status: 200, headers, body };
    }
    if (!admin) {
      if (catalog) {
        boot.data.classifications = await publicClassifications(config, fetcher);
        const encoded = wireCatalogQuery(catalog, boot.data.classifications);
        boot.data.catalog = encoded === null ? {items:[],total:0,page:catalog.page,limit:catalog.limit,totalPages:0} : pageFromWire(await publicGet<WirePage<WireProperty>>(`/imoveis?${encoded}`, config, fetcher), propertyFromWire);
        const query = catalog;
        if (query.page > Math.max(1, boot.data.catalog.totalPages)) boot.status = 404;
      } else if (/^\/imoveis\/[^/]+$/.test(url.pathname)) {
        const slug = decodeURIComponent(url.pathname.slice('/imoveis/'.length));
        if (!isValidPropertySlug(slug)) throw new PublicError(404);
        boot.data.property = propertyFromWire(await publicGet<WireProperty>(`/imoveis/${encodeURIComponent(slug)}`, config, fetcher, true));
      } else if (url.pathname !== '/privacidade' && url.pathname !== '/devs') boot.status = 404;
    }
  } catch (error) { boot.status = error instanceof PublicError ? error.status : error instanceof URIError ? 404 : 503; boot.data = {}; }
  if (boot.status !== 200) headers['Cache-Control'] = 'no-store';
  const seo = buildSeo(boot.url, config, boot.data, boot.status);
  headers['X-Robots-Tag'] = seo.robots;
  const content = admin ? '' : renderToString(<BootstrapContext.Provider value={boot}><StaticRouter location={boot.url}><AppRoutes/></StaticRouter></BootstrapContext.Provider>);
  const body = template.replace('<!--seo-head-->', () => renderHead(seo)).replace('<!--app-html-->', () => content).replace('<!--bootstrap-->', () => `<script id="seo-bootstrap" type="application/json">${serialize(boot)}</script>`);
  return { status: boot.status, headers, body };
}
