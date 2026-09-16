import type { Classificacoes, Imovel, Pagina } from '../tipos';
import { lerUrlCatalogo, urlCatalogo, urlImovel } from '../servicos/urls';
import { valorPrincipal } from '../servicos/formato';
import { brand } from '../config/brand';

export interface SeoConfig { siteUrl: string; indexable: boolean }
export interface DadosPublicos { classificacoes?: Classificacoes; catalogo?: Pagina<Imovel>; imovel?: Imovel }
export interface Bootstrap { url: string; config: SeoConfig; data: DadosPublicos; status: number }
export const defaultConfig: SeoConfig = { siteUrl: '', indexable: false };
const IMAGEM_PADRAO = '/assets/commercial-space-1200.webp';

export const serialize = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (caractere) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[caractere]!);
export function absolute(path: string, config: SeoConfig) { return config.siteUrl ? new URL(path, config.siteUrl).href : ''; }

const textoFinalidade = (slug?: string) => slug === 'locacao' ? ' para alugar' : slug === 'venda' ? ' para comprar' : '';

export function buildSeo(path: string, config: SeoConfig, data: DadosPublicos = {}, status = 200) {
  const url = new URL(path, 'http://local');
  const catalogo = lerUrlCatalogo(path);
  const consulta = catalogo || { pagina: 1, limite: 9 };
  const filtrado = Boolean(consulta.tipo || consulta.finalidade || consulta.cidade || consulta.bairro || consulta.valor_min !== undefined || consulta.valor_max !== undefined || consulta.area_min !== undefined || consulta.area_max !== undefined || consulta.ordenar);
  const admin = url.pathname === '/admin' || url.pathname.startsWith('/admin/');
  const caminhoCanonico = catalogo ? urlCatalogo(consulta) : url.pathname;
  let title = `Imóveis comerciais em ${brand.region.name} | ${brand.name}`;
  let description = `Encontre salas comerciais, lojas, galpões, prédios e terrenos para alugar ou comprar em ${brand.region.name}. Consulte os imóveis e fale com o corretor responsável.`;
  let image = absolute(IMAGEM_PADRAO, config);
  const canonical = absolute(caminhoCanonico, config);
  const graph: Record<string, unknown>[] = [];
  if (config.siteUrl) graph.push(
    { '@type': 'RealEstateAgent', '@id': `${config.siteUrl}/#organization`, name: brand.name, url: config.siteUrl, identifier: `CRECI ${brand.creci}`, areaServed: { '@type': brand.region.schemaType, name: brand.region.name } },
    { '@type': 'WebSite', '@id': `${config.siteUrl}/#website`, name: brand.name, url: config.siteUrl, inLanguage: 'pt-BR', publisher: { '@id': `${config.siteUrl}/#organization` } },
  );
  if (catalogo && filtrado) {
    const tipo = consulta.tipo ? data.classificacoes?.tipos.find((item) => item.slug === consulta.tipo || String(item.id) === consulta.tipo)?.nome || 'Imóveis comerciais' : 'Imóveis comerciais';
    const lugar = consulta.bairro && consulta.cidade ? `${consulta.bairro}, ${consulta.cidade}` : consulta.cidade || consulta.bairro || brand.region.name;
    title = `${tipo}${textoFinalidade(consulta.finalidade)} em ${lugar} | ${brand.name}`;
    description = `Confira ${tipo.toLowerCase()}${textoFinalidade(consulta.finalidade)} em ${lugar} e consulte valores e disponibilidade com o corretor.`;
  }
  if (catalogo && consulta.pagina > 1) title = `${title} — Página ${consulta.pagina}`;
  if (catalogo && data.catalogo && config.siteUrl) graph.push({ '@type': 'ItemList', itemListElement: data.catalogo.itens.map((item, indice) => ({ '@type': 'ListItem', position: (consulta.pagina - 1) * consulta.limite + indice + 1, name: item.titulo, url: absolute(urlImovel(item.slug), config) })) });
  if (url.pathname === '/privacidade') { title = `Política de privacidade | ${brand.name}`; description = `Saiba como ${brand.privacy.controller || brand.name} utiliza os dados fornecidos para atendimento sobre imóveis comerciais.`; }
  if (url.pathname === '/devs') { title = `Desenvolvedores | ${brand.name}`; description = 'Conheça Eduardo Gobatto (@e.gobatto) e Fernando Riad (@_riad777), responsáveis pelo front-end e back-end deste site.'; }
  const imovel = data.imovel;
  if (imovel) {
    const preco = valorPrincipal(imovel);
    const finalidade = imovel.finalidade?.slug === 'locacao' ? 'para alugar' : imovel.finalidade?.slug === 'venda' ? 'à venda' : imovel.finalidade?.nome || '';
    title = `${imovel.titulo} | ${imovel.cidade}/${imovel.estado} | ${brand.name}`;
    description = `${imovel.tipo?.nome || 'Imóvel'} ${finalidade} em ${imovel.bairro}, ${imovel.cidade}/${imovel.estado}, com ${Number(imovel.area_util)} m². ${imovel.descricao.replace(/\s+/g, ' ').trim()}`.slice(0, 170);
    const capa = imovel.midias.find((midia) => midia.tipo === 'IMAGEM' && midia.capa) || imovel.midias.find((midia) => midia.tipo === 'IMAGEM');
    if (capa && /^https?:\/\//.test(capa.url)) image = capa.url;
    else if (capa?.url.startsWith('/') && !capa.url.startsWith('//')) image = absolute(capa.url, config);
    if (config.siteUrl) graph.push(
      {
        '@type': 'RealEstateListing', '@id': canonical, url: canonical, name: imovel.titulo, description: imovel.descricao, image, dateModified: imovel.alterado_em,
        mainEntity: { '@type': 'Place', name: imovel.titulo, address: { '@type': 'PostalAddress', streetAddress: `${imovel.logradouro}, ${imovel.numero}`, addressLocality: imovel.cidade, addressRegion: imovel.estado, addressCountry: 'BR' } },
        ...(preco ? { offers: { '@type': 'Offer', price: preco.valor, priceCurrency: 'BRL', url: canonical, businessFunction: preco.tipo === 'locacao' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell' } } : {}),
      },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Imóveis comerciais', item: absolute('/', config) }, { '@type': 'ListItem', position: 2, name: imovel.titulo, item: canonical }] },
    );
  }
  if (admin) { title = `Área do corretor | ${brand.name}`; description = `Acesso ao painel do ${brand.name}.`; }
  if (status === 404) { title = `Página não encontrada | ${brand.name}`; description = 'Este endereço não está disponível. Consulte o catálogo de imóveis comerciais.'; }
  if (status >= 500) { title = `Serviço temporariamente indisponível | ${brand.name}`; description = 'Tente novamente em alguns instantes.'; }
  const semDados = (!catalogo && url.pathname.startsWith('/imoveis/') && !imovel) || (catalogo && !data.catalogo);
  const robots = !config.indexable || admin || url.pathname === '/devs' || status !== 200 || semDados ? (url.pathname === '/devs' && status === 200 ? 'noindex,follow' : 'noindex,nofollow') : filtrado ? 'noindex,follow' : 'index,follow';
  return { title, description, canonical, image, defaultImage: image === absolute(IMAGEM_PADRAO, config), robots, jsonLd: { '@context': 'https://schema.org', '@graph': status === 200 && !admin ? graph : [] } };
}

export function renderHead(seo: ReturnType<typeof buildSeo>) {
  const meta = (name: string, content: string, property = false) => `<meta data-seo ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(content)}"/>`;
  const imagem = seo.image ? meta('og:image', seo.image, true) + (seo.defaultImage ? meta('og:image:width', '1200', true) + meta('og:image:height', '900', true) + meta('og:image:alt', 'Ambiente comercial iluminado, com mesas, vegetação e janelas amplas', true) : '') : '';
  return `<title>${escapeHtml(seo.title)}</title>${meta('description', seo.description)}${meta('robots', seo.robots)}${seo.canonical ? `<link data-seo rel="canonical" href="${escapeHtml(seo.canonical)}"/>` : ''}${meta('og:title', seo.title, true)}${meta('og:description', seo.description, true)}${meta('og:type', 'website', true)}${meta('og:locale', 'pt_BR', true)}${meta('og:site_name', brand.name, true)}${seo.canonical ? meta('og:url', seo.canonical, true) : ''}${imagem}${meta('twitter:card', 'summary_large_image')}${meta('twitter:title', seo.title)}${meta('twitter:description', seo.description)}${seo.image ? meta('twitter:image', seo.image) : ''}<script data-seo type="application/ld+json">${serialize(seo.jsonLd)}</script>`;
}
