import { propertyUrl } from '../services/urls';
import type { Classifications } from '../services/portuguese';
import type { Page, Property } from '../types';
import { readCatalogUrl, catalogUrl } from '../services/urls';
import { propertyType } from '../services/format';
import { brand } from '../config/brand';

export interface SeoConfig { siteUrl: string; indexable: boolean }
export interface PublicData { classifications?: Classifications; catalog?: Page<Property>; property?: Property }
export interface Bootstrap { url: string; config: SeoConfig; data: PublicData; status: number }
export const defaultConfig: SeoConfig = { siteUrl: '', indexable: false };
export const serialize = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
export function absolute(path: string, config: SeoConfig) { return config.siteUrl ? new URL(path, config.siteUrl).href : ''; }

export function buildSeo(path: string, config: SeoConfig, data: PublicData = {}, status = 200) {
  const url = new URL(path, 'http://local');
  const catalog = readCatalogUrl(path);
  const query = catalog || { page: 1, limit: 9 };
  const filtered = Boolean(query.type || query.purpose || query.city || query.minPrice !== undefined || query.maxPrice !== undefined);
  const admin = url.pathname === '/admin' || url.pathname.startsWith('/admin/');
  const canonicalPath = catalog ? catalogUrl(query) : url.pathname;
  let title = `Imóveis comerciais em ${brand.region.name} | ${brand.name}`;
  let description = `Encontre salas comerciais, lojas, galpões, prédios e terrenos para alugar ou comprar em ${brand.region.name}. Consulte os imóveis e fale com o corretor responsável.`;
  let image = absolute('/assets/commercial-space-1200.webp', config);
  const canonical = absolute(canonicalPath, config);
  const graph: Record<string, unknown>[] = [];
  if (config.siteUrl) graph.push(
    { '@type': 'RealEstateAgent', '@id': `${config.siteUrl}/#organization`, name: brand.name, url: config.siteUrl, identifier: `CRECI ${brand.creci}`, areaServed: { '@type': brand.region.schemaType, name: brand.region.name } },
    { '@type': 'WebSite', '@id': `${config.siteUrl}/#website`, name: brand.name, url: config.siteUrl, inLanguage: 'pt-BR', publisher: { '@id': `${config.siteUrl}/#organization` } },
  );
  if (catalog && filtered) {
    const kind = query.type ? ((Object.hasOwn(propertyType,query.type)?propertyType[query.type]:undefined) || data.classifications?.types.find(t=>t.slug===query.type||t.id===query.type)?.nome || 'Imóveis comerciais') : 'Imóveis comerciais';
    const purpose = query.purpose === 'LOCACAO' ? ' para alugar' : query.purpose === 'VENDA' ? ' para comprar' : '';
    title = `${kind}${purpose} em ${query.city || brand.region.name} | ${brand.name}`;
    description = `Confira ${kind.toLowerCase()}${purpose} em ${query.city || brand.region.name} e consulte valores e disponibilidade com o corretor.`;
  }
  if (catalog && query.page > 1) title = `${title} — Página ${query.page}`;
  if (catalog && data.catalog && config.siteUrl) graph.push({ '@type': 'ItemList', itemListElement: data.catalog.items.map((p, index) => ({ '@type': 'ListItem', position: (query.page - 1) * query.limit + index + 1, name: p.title, url: absolute(propertyUrl(p.slug), config) })) });
  if (url.pathname === '/privacidade') { title = `Política de privacidade | ${brand.name}`; description = `Saiba como ${brand.privacy.controller || brand.name} utiliza os dados fornecidos para atendimento sobre imóveis comerciais.`; }
  if (url.pathname === '/devs') { title = `Desenvolvedores | ${brand.name}`; description = 'Conheça Eduardo Gobatto (@e.gobatto) e Fernando Riad (@_riad777), responsáveis pelo front-end e back-end deste site.'; }
  const p = data.property;
  if (p) {
    const purpose = p.purpose === 'LOCACAO' ? 'para alugar' : p.purpose === 'VENDA' ? 'à venda' : p.purposeName || '';
    title = `${p.title} | ${p.addressCity}/${p.addressState} | ${brand.name}`;
    description = `${p.typeName || propertyType[p.type] || 'Imóvel'} ${purpose} em ${p.neighborhood}, ${p.addressCity}/${p.addressState}, com ${p.usableArea} m². ${p.description.replace(/\s+/g, ' ').trim()}`.slice(0, 170);
    const cover = p.media.find(m => m.type === 'IMAGE' && m.isCover) || p.media.find(m => m.type === 'IMAGE');
    if (cover && /^https?:\/\//.test(cover.url)) image = cover.url;
    else if (cover?.url.startsWith('/') && !cover.url.startsWith('//')) image = absolute(cover.url, config);
    if (config.siteUrl) graph.push(
      { '@type': 'RealEstateListing', '@id': canonical, url: canonical, name: p.title, description: p.description, image, dateModified: p.updatedAt, mainEntity: { '@type': 'Place', name: p.title, address: { '@type': 'PostalAddress', streetAddress: `${p.addressStreet}, ${p.addressNumber}`, addressLocality: p.addressCity, addressRegion: p.addressState, addressCountry: 'BR' } }, offers: { '@type': 'Offer', price: p.price, priceCurrency: 'BRL', url: canonical, businessFunction: p.purpose === 'LOCACAO' ? 'http://purl.org/goodrelations/v1#LeaseOut' : p.purpose === 'VENDA' ? 'http://purl.org/goodrelations/v1#Sell' : undefined } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Imóveis comerciais', item: absolute('/', config) }, { '@type': 'ListItem', position: 2, name: p.title, item: canonical }] },
    );
  }
  if (admin) { title = `Área do corretor | ${brand.name}`; description = `Acesso ao painel do ${brand.name}.`; }
  if (status === 404) { title = `Página não encontrada | ${brand.name}`; description = 'Este endereço não está disponível. Consulte o catálogo de imóveis comerciais.'; }
  if (status >= 500) { title = `Serviço temporariamente indisponível | ${brand.name}`; description = 'Tente novamente em alguns instantes.'; }
  const missingData = (!catalog && url.pathname.startsWith('/imoveis/') && !p) || (catalog && !data.catalog);
  const robots = !config.indexable || admin || url.pathname === '/devs' || status !== 200 || missingData ? (url.pathname === '/devs' && status === 200 ? 'noindex,follow' : 'noindex,nofollow') : filtered ? 'noindex,follow' : 'index,follow';
  return { title, description, canonical, image, defaultImage: image === absolute('/assets/commercial-space-1200.webp', config), robots, jsonLd: { '@context': 'https://schema.org', '@graph': status === 200 && !admin ? graph : [] } };
}

export function renderHead(seo: ReturnType<typeof buildSeo>) {
  const meta = (name: string, content: string, property = false) => `<meta data-seo ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(content)}"/>`;
  return `<title>${escapeHtml(seo.title)}</title>${meta('description', seo.description)}${meta('robots', seo.robots)}${seo.canonical ? `<link data-seo rel="canonical" href="${escapeHtml(seo.canonical)}"/>` : ''}${meta('og:title', seo.title, true)}${meta('og:description', seo.description, true)}${meta('og:type', 'website', true)}${meta('og:locale', 'pt_BR', true)}${meta('og:site_name', brand.name, true)}${seo.canonical ? meta('og:url', seo.canonical, true) : ''}${seo.image ? meta('og:image', seo.image, true) + (seo.defaultImage ? meta('og:image:width', '1200', true) + meta('og:image:height', '900', true) : '') + meta('og:image:alt', seo.title, true) : ''}${meta('twitter:card', 'summary_large_image')}${meta('twitter:title', seo.title)}${meta('twitter:description', seo.description)}${seo.image ? meta('twitter:image', seo.image) : ''}<script data-seo type="application/ld+json">${serialize(seo.jsonLd)}</script>`;
}
