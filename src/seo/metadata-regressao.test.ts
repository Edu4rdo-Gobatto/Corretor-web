import { describe, expect, it } from 'vitest';
import { brand } from '../config/brand';
import type { Imovel } from '../tipos';
import { classificacoesExemplo, imovelExemplo } from './fixture';
import { buildSeo, escapeHtml, renderHead, serialize, type DadosPublicos, type SeoConfig } from './metadata';

const config: SeoConfig = { siteUrl: 'https://imoveis.example', indexable: true };
const detalhe = `/imoveis/${imovelExemplo.slug}`;
const dadosCatalogo: DadosPublicos = {
  classificacoes: classificacoesExemplo,
  catalogo: { itens: [imovelExemplo, { ...imovelExemplo, id: 43, slug: 'outra-sala-43', titulo: 'Outra sala' }], total: 11, pagina: 1, limite: 9, total_paginas: 2 },
};

function entidade(seo: ReturnType<typeof buildSeo>, tipo: string) {
  const resultado = seo.jsonLd['@graph'].find((item) => item['@type'] === tipo);
  expect(resultado, `entidade ${tipo}`).toBeDefined();
  if (!resultado) throw new Error(`Entidade ausente: ${tipo}`);
  return resultado;
}

describe('serialização contextual de SEO', () => {
  it('preserva o JSON sem permitir fechamento de script ou separadores literais', () => {
    const original = { texto: '</script><script>alert("x")</script> & > < \u2028 \u2029', aninhado: ['"', "'", '\\'] };
    const seguro = serialize(original);
    expect(JSON.parse(seguro)).toEqual(original);
    expect(seguro).not.toMatch(/[<>&\u2028\u2029]/);
    expect(seguro).toContain('\\u003c/script\\u003e');
    expect(seguro).toContain('\\u2028');
    expect(seguro).toContain('\\u2029');
  });

  it('escapa os cinco caracteres que atravessam texto e atributos HTML', () => {
    expect(escapeHtml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&#39;');
    expect(escapeHtml('Sala comercial')).toBe('Sala comercial');
  });

  it('renderiza conteúdo malicioso como dados em title/meta/canonical e um único JSON-LD', () => {
    const ataque = '</title><script>alert("x")</script><img src=x onerror=\'x\'> & \u2028\u2029';
    const seo = {
      ...buildSeo('/', config, dadosCatalogo),
      title: ataque, description: ataque, canonical: `https://imoveis.example/?q="&<>'`, image: ataque,
      jsonLd: { '@context': 'https://schema.org', '@graph': [{ '@type': 'Thing', name: ataque }] },
    };
    const html = renderHead(seo);
    expect(html).toContain(`<title>${escapeHtml(ataque)}</title>`);
    expect(html).toContain(`name="description" content="${escapeHtml(ataque)}"`);
    expect(html).toContain(`rel="canonical" href="${escapeHtml(seo.canonical)}"`);
    expect(html).toContain(`property="og:image" content="${escapeHtml(ataque)}"`);
    expect(html.match(/<script\b/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).not.toContain('<img');
    const json = html.match(/<script data-seo type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
    expect(json).toBeDefined();
    expect(JSON.parse(json!)).toEqual(seo.jsonLd);
  });
});

describe('canonical e indexação', () => {
  it.each([
    { caminho: '/?utm_source=campanha', canonico: '/', robots: 'index,follow', status: 200, dados: dadosCatalogo },
    { caminho: '/?tipo=galpao&finalidade=locacao&utm_source=campanha', canonico: '/imoveis/para-alugar/galpoes', robots: 'noindex,follow', status: 200, dados: dadosCatalogo },
    { caminho: '/?pagina=2&utm_source=campanha', canonico: '/?pagina=2', robots: 'index,follow', status: 200, dados: dadosCatalogo },
    { caminho: detalhe, canonico: detalhe, robots: 'index,follow', status: 200, dados: { imovel: imovelExemplo } },
    { caminho: '/admin', canonico: '/admin', robots: 'noindex,nofollow', status: 200, dados: {} },
    { caminho: '/admin/imoveis', canonico: '/admin/imoveis', robots: 'noindex,nofollow', status: 200, dados: {} },
    { caminho: '/devs', canonico: '/devs', robots: 'noindex,follow', status: 200, dados: {} },
    { caminho: '/inexistente', canonico: '/inexistente', robots: 'noindex,nofollow', status: 404, dados: {} },
    { caminho: '/', canonico: '/', robots: 'noindex,nofollow', status: 503, dados: dadosCatalogo },
  ])('$caminho / HTTP $status produz canonical e robots adequados', ({ caminho, canonico, robots, status, dados }) => {
    const seo = buildSeo(caminho, config, dados, status);
    expect(seo.canonical).toBe(`${config.siteUrl}${canonico}`);
    expect(seo.robots).toBe(robots);
    if (status !== 200 || caminho.startsWith('/admin')) expect(seo.jsonLd['@graph']).toEqual([]);
    const html = renderHead(seo);
    expect(html).toContain(`name="robots" content="${robots}"`);
    expect(html).toContain(`rel="canonical" href="${escapeHtml(seo.canonical)}"`);
  });

  it.each(['/', '/?pagina=2', detalhe])('bloqueia indexação quando a configuração está desligada: %s', (caminho) => {
    expect(buildSeo(caminho, { ...config, indexable: false }, { ...dadosCatalogo, imovel: imovelExemplo }).robots).toBe('noindex,nofollow');
  });

  it.each(['/', detalhe])('recusa indexação de página sem seus dados públicos: %s', (caminho) => {
    expect(buildSeo(caminho, config).robots).toBe('noindex,nofollow');
  });

  it('omite canonical, imagens absolutas padrão e grafo sem siteUrl', () => {
    const seo = buildSeo('/', { ...config, siteUrl: '' }, dadosCatalogo);
    expect(seo.canonical).toBe('');
    expect(seo.image).toBe('');
    expect(seo.jsonLd['@graph']).toEqual([]);
    const html = renderHead(seo);
    expect(html).not.toContain('rel="canonical"');
    expect(html).not.toContain('property="og:url"');
    expect(html).not.toContain('property="og:image"');
    expect(html).not.toContain('name="twitter:image"');
  });

  it('usa o slogan centralizado e acrescenta a página ao título da paginação', () => {
    const titulo = `${brand.tagline} | ${brand.name}`;
    expect(buildSeo('/', config, dadosCatalogo).title).toBe(titulo);
    expect(buildSeo('/?pagina=2', config, dadosCatalogo).title).toBe(`${titulo} — Página 2`);
    expect(buildSeo('/imoveis/para-alugar/galpoes', config, dadosCatalogo).title).toBe(`Galpões para alugar em ${brand.region.name} | ${brand.name}`);
  });
});

describe('dados estruturados de catálogo e imóvel', () => {
  it('continua as posições da ItemList na segunda página e usa URLs de detalhe', () => {
    const seo = buildSeo('/?pagina=2', config, dadosCatalogo);
    expect(entidade(seo, 'ItemList').itemListElement).toEqual([
      { '@type': 'ListItem', position: 10, name: imovelExemplo.titulo, url: `${config.siteUrl}${detalhe}` },
      { '@type': 'ListItem', position: 11, name: 'Outra sala', url: `${config.siteUrl}/imoveis/outra-sala-43` },
    ]);
  });

  it.each([
    { nome: 'capa marcada após a primeira foto', midias: [{ id: 1, tipo: 'IMAGEM', url: '/primeira.webp', capa: false, ordem: 0 }, { id: 2, tipo: 'IMAGEM', url: 'https://fotos.example/capa.webp', capa: true, ordem: 1 }], imagem: 'https://fotos.example/capa.webp' },
    { nome: 'primeira imagem quando nenhuma capa está marcada', midias: [{ id: 1, tipo: 'VIDEO_EMBED', url: 'https://youtu.be/dQw4w9WgXcQ', capa: true, ordem: 0 }, { id: 2, tipo: 'IMAGEM', url: '/primeira.webp', capa: false, ordem: 1 }], imagem: `${config.siteUrl}/primeira.webp` },
    { nome: 'imagem padrão para URL relativa insegura', midias: [{ id: 1, tipo: 'IMAGEM', url: '//terceiro.example/capa.webp', capa: true, ordem: 0 }], imagem: `${config.siteUrl}/assets/commercial-space-1200.webp` },
    { nome: 'imagem padrão sem mídia', midias: [], imagem: `${config.siteUrl}/assets/commercial-space-1200.webp` },
  ] satisfies { nome: string; midias: Imovel['midias']; imagem: string }[])('seleciona $nome', ({ midias, imagem }) => {
    const seo = buildSeo(detalhe, config, { imovel: { ...imovelExemplo, midias } });
    expect(seo.image).toBe(imagem);
    expect(entidade(seo, 'RealEstateListing')).toMatchObject({ '@id': seo.canonical, url: seo.canonical, image: imagem });
    expect(entidade(seo, 'BreadcrumbList')).toMatchObject({ itemListElement: [{ position: 1, item: `${config.siteUrl}/` }, { position: 2, item: seo.canonical }] });
  });

  it.each([
    { venda: '500000.00', locacao: '2500.00', preco: 500000, funcao: 'Sell' },
    { venda: null, locacao: '2500.00', preco: 2500, funcao: 'LeaseOut' },
  ])('Offer reflete a prioridade e finalidade do preço: $funcao', ({ venda, locacao, preco, funcao }) => {
    const seo = buildSeo(detalhe, config, { imovel: { ...imovelExemplo, valor_venda: venda, valor_locacao: locacao } });
    expect(entidade(seo, 'RealEstateListing').offers).toEqual({ '@type': 'Offer', price: preco, priceCurrency: 'BRL', url: seo.canonical, availability: 'https://schema.org/InStock', businessFunction: `http://purl.org/goodrelations/v1#${funcao}` });
  });

  it('não inventa uma oferta para imóvel sob consulta', () => {
    const seo = buildSeo(detalhe, config, { imovel: { ...imovelExemplo, valor_venda: null, valor_locacao: null } });
    expect(entidade(seo, 'RealEstateListing')).not.toHaveProperty('offers');
  });
});
