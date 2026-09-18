import { describe, expect, it } from 'vitest';
import { buildSeo, renderHead } from './metadata';
import { classificacoesExemplo, imovelExemplo } from './fixture';
const config = { siteUrl: 'https://example.test', indexable: true };

describe('metadados', () => {
  it('publica dimensões e alt só da imagem padrão', () => {
    const head = renderHead(buildSeo('/', config));
    expect(head).toContain('property="og:image:width" content="1200"');
    expect(head).toContain('property="og:image:alt"');
    const foto = renderHead(buildSeo('/imoveis/sala-42', config, { imovel: { ...imovelExemplo, midias: [{ ...imovelExemplo.midias[0], url: 'https://media.example.test/foto.webp' }] } }));
    expect(foto).toContain('https://media.example.test/foto.webp');
    expect(foto).not.toContain('og:image:width');
  });
  it('descreve a oferta pelo valor disponível e omite oferta sob consulta', () => {
    const locacao = JSON.stringify(buildSeo('/imoveis/sala-42', config, { imovel: imovelExemplo }).jsonLd);
    expect(locacao).toContain('LeaseOut');
    expect(locacao).toContain('"price":2500');
    const venda = JSON.stringify(buildSeo('/imoveis/sala-42', config, { imovel: { ...imovelExemplo, valor_venda: '150000.00' } }).jsonLd);
    expect(venda).toContain('#Sell');
    expect(JSON.stringify(buildSeo('/imoveis/sala-42', config, { imovel: { ...imovelExemplo, valor_locacao: null } }).jsonLd)).not.toContain('offers');
  });
  it('monta título de catálogo filtrado com tipo, finalidade e bairro', () => {
    const seo = buildSeo('/imoveis/para-alugar/salas?bairro=Centro&cidade=Juara', config, { classificacoes: classificacoesExemplo, catalogo: { itens: [], total: 0, pagina: 1, limite: 9, total_paginas: 0 } });
    expect(seo.title).toBe('Salas comerciais para alugar em Centro, Juara | Lucas Gobatto');
    expect(seo.robots).toBe('noindex,follow');
    expect(buildSeo('/?ordenar=valor_asc', config, { catalogo: { itens: [], total: 0, pagina: 1, limite: 9, total_paginas: 0 } }).robots).toBe('noindex,follow');
  });
  it('preserva texto hostil no JSON-LD sem permitir quebrar a tag script', () => {
    const titulo = '<svg/onload=alert(document.cookie)>';
    const descricao = '</script><script>window.location="https://evil.test"</script>';
    const imovel = { ...imovelExemplo, titulo, descricao };
    const head = renderHead(buildSeo('/imoveis/sala-42', config, { imovel }));
    const match = head.match(/<script data-seo type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(match).not.toBeNull();
    const jsonLd = JSON.parse(match![1]);
    const listing = jsonLd['@graph'].find((item: { '@type'?: string }) => item['@type'] === 'RealEstateListing');
    expect(listing.name).toBe(titulo);
    expect(listing.description).toBe(descricao);
    expect(match![1]).not.toContain('</script>');
    expect(match![1]).toContain('\\u003c/script\\u003e');
    expect(head).toContain('content="&lt;svg/onload=alert(document.cookie)&gt; | Cuiabá/MT | Lucas Gobatto"');
    expect(head).toContain('content="Salas comerciais para alugar em Centro, Cuiabá/MT, com 60 m². &lt;/script&gt;');
  });
});
