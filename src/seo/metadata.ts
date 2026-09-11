import type { Page, Property } from '../types';
import { readCatalogQuery, buildCatalogQuery } from '../services/catalog';
import { propertyType } from '../services/format';

export interface SeoConfig { siteUrl: string; indexable: boolean; demo: boolean }
export interface PublicData { catalog?: Page<Property>; property?: Property }
export interface Bootstrap { url: string; config: SeoConfig; data: PublicData; status: number }
export const defaultConfig: SeoConfig = { siteUrl: '', indexable: false, demo: false };
export const serialize = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
export function absolute(path: string, config: SeoConfig) { return config.siteUrl ? new URL(path, config.siteUrl).href : ''; }

export function buildSeo(path: string, config: SeoConfig, data: PublicData = {}, status = 200) {
  const url = new URL(path, 'http://local');
  const query = readCatalogQuery(url.searchParams);
  const filtered = ['type', 'purpose', 'city', 'minPrice', 'maxPrice'].some(key => url.searchParams.has(key));
  const admin = url.pathname === '/admin' || url.pathname.startsWith('/admin/');
  let canonicalPath = url.pathname;
  if (url.pathname === '/') {
    const normalized = buildCatalogQuery({ ...query, limit: undefined, page: query.page > 1 ? query.page : undefined });
    canonicalPath = normalized ? `/?${normalized}` : '/';
  }
  let title = 'Imóveis comerciais em Mato Grosso | Corretor Comercial';
  let description = 'Encontre salas comerciais, lojas, galpões, prédios e terrenos para alugar ou comprar em Mato Grosso. Consulte os imóveis e fale com o corretor responsável.';
  let image = absolute('/assets/commercial-space-1200.webp', config);
  const canonical = absolute(canonicalPath, config);
  const graph: Record<string, unknown>[] = [];
  if (config.siteUrl) graph.push(
    { '@type': 'Organization', '@id': `${config.siteUrl}/#organization`, name: 'Corretor Comercial', url: config.siteUrl, areaServed: { '@type': 'State', name: 'Mato Grosso' } },
    { '@type': 'WebSite', '@id': `${config.siteUrl}/#website`, name: 'Corretor Comercial', url: config.siteUrl, inLanguage: 'pt-BR', publisher: { '@id': `${config.siteUrl}/#organization` } },
  );
  if (url.pathname === '/' && query.page > 1) title = `Imóveis comerciais em Mato Grosso — Página ${query.page} | Corretor Comercial`;
  if (url.pathname === '/' && data.catalog && config.siteUrl) graph.push({ '@type': 'ItemList', itemListElement: data.catalog.items.map((p, index) => ({ '@type': 'ListItem', position: (query.page - 1) * query.limit + index + 1, name: p.title, url: absolute(`/imoveis/${encodeURIComponent(p.slug)}`, config) })) });
  if (url.pathname === '/privacidade') { title = 'Política de privacidade | Corretor Comercial'; description = 'Saiba como o Corretor Comercial utiliza os dados fornecidos para atendimento sobre imóveis comerciais.'; }
  const p = data.property;
  if (p) {
    const purpose = p.purpose === 'LOCACAO' ? 'para alugar' : 'à venda';
    title = `${p.title} | ${p.addressCity}/${p.addressState} | Corretor Comercial`;
    description = `${propertyType[p.type]} ${purpose} em ${p.neighborhood}, ${p.addressCity}/${p.addressState}, com ${p.usableArea} m². ${p.description.replace(/\s+/g, ' ').trim()}`.slice(0, 170);
    const cover = p.media.find(m => m.type === 'IMAGE' && m.isCover) || p.media.find(m => m.type === 'IMAGE');
    if (cover && /^https?:\/\//.test(cover.url)) image = cover.url;
    else if (cover?.url.startsWith('/') && !cover.url.startsWith('//')) image = absolute(cover.url, config);
    if (config.siteUrl) graph.push(
      { '@type': 'RealEstateListing', '@id': canonical, url: canonical, name: p.title, description: p.description, image, dateModified: p.updatedAt, mainEntity: { '@type': 'Place', name: p.title, address: { '@type': 'PostalAddress', streetAddress: `${p.addressStreet}, ${p.addressNumber}`, addressLocality: p.addressCity, addressRegion: p.addressState, addressCountry: 'BR' } }, offers: { '@type': 'Offer', price: p.price, priceCurrency: 'BRL', url: canonical, businessFunction: p.purpose === 'LOCACAO' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell' } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Imóveis comerciais', item: absolute('/', config) }, { '@type': 'ListItem', position: 2, name: p.title, item: canonical }] },
    );
  }
  if (admin) { title = 'Área do corretor | Corretor Comercial'; description = 'Acesso ao painel do Corretor Comercial.'; }
  if (status === 404) { title = 'Página não encontrada | Corretor Comercial'; description = 'Este endereço não está disponível. Consulte o catálogo de imóveis comerciais.'; }
  if (status >= 500) { title = 'Serviço temporariamente indisponível | Corretor Comercial'; description = 'Tente novamente em alguns instantes.'; }
  const missingData = (url.pathname.startsWith('/imoveis/') && !p) || (url.pathname === '/' && !data.catalog);
  const robots = !config.indexable || config.demo || admin || status !== 200 || missingData ? 'noindex,nofollow' : filtered ? 'noindex,follow' : 'index,follow';
  return { title, description, canonical, image, robots, jsonLd: { '@context': 'https://schema.org', '@graph': status === 200 && !admin ? graph : [] } };
}

export function renderHead(seo: ReturnType<typeof buildSeo>) {
  const meta = (name: string, content: string, property = false) => `<meta data-seo ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(content)}"/>`;
  return `<title>${escapeHtml(seo.title)}</title>${meta('description', seo.description)}${meta('robots', seo.robots)}${seo.canonical ? `<link data-seo rel="canonical" href="${escapeHtml(seo.canonical)}"/>` : ''}${meta('og:title', seo.title, true)}${meta('og:description', seo.description, true)}${meta('og:type', 'website', true)}${meta('og:locale', 'pt_BR', true)}${meta('og:site_name', 'Corretor Comercial', true)}${seo.canonical ? meta('og:url', seo.canonical, true) : ''}${seo.image ? meta('og:image', seo.image, true) : ''}${meta('twitter:card', 'summary_large_image')}${meta('twitter:title', seo.title)}${meta('twitter:description', seo.description)}${seo.image ? meta('twitter:image', seo.image) : ''}<script data-seo type="application/ld+json">${serialize(seo.jsonLd)}</script>`;
}
