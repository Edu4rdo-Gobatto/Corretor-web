// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { handleRequest, serverConfig, sitemapChunks } from './server';
import { buildSeo, serialize } from './metadata';
import { classificacoesExemplo, imovelExemplo } from './fixture';

const config = { siteUrl: 'https://imoveis.example', apiOrigin: 'https://api.example', indexable: true };
const paginaVazia = { itens: [], total: 0, pagina: 1, limite: 9, total_paginas: 0 };
const fetcherCatalogo = () => vi.fn<typeof fetch>(async (entrada) => {
  const caminho = String(entrada);
  const itens = caminho.includes('/tipos-imovel') ? classificacoesExemplo.tipos : caminho.includes('/finalidades-imovel') ? classificacoesExemplo.finalidades : [];
  return new Response(JSON.stringify({ ...paginaVazia, itens, total: itens.length }));
});

describe('respostas públicas do SSR', () => {
  it('acrescenta cabeçalhos defensivos', async () => {
    const resposta = await handleRequest('/', config, fetcherCatalogo());
    expect(resposta.headers['X-Content-Type-Options']).toBe('nosniff');
    expect(resposta.headers['X-Frame-Options']).toBe('DENY');
    expect(resposta.headers['Permissions-Policy']).toContain('camera=()');
  });
  it('renderiza o catálogo sem JavaScript e ignora cookies do visitante', async () => {
    const fetcher = fetcherCatalogo();
    const resposta = await handleRequest('/', config, fetcher);
    expect(resposta.status).toBe(200);
    expect(resposta.body).toContain('Imóveis comerciais para alugar e comprar');
    expect(resposta.body).toContain('application/ld+json');
    expect(resposta.body).toContain('rel="canonical"');
    expect(fetcher.mock.calls[0][1]).not.toHaveProperty('headers.Cookie');
  });
  it('distingue imóvel inexistente de API indisponível', async () => {
    expect((await handleRequest('/imoveis/missing-9', config, vi.fn().mockResolvedValue(new Response('', { status: 404 })))).status).toBe(404);
    const falhou = await handleRequest('/', config, vi.fn().mockRejectedValue(new Error('offline')));
    expect(falhou.status).toBe(503);
    expect(falhou.headers['Cache-Control']).toBe('no-store');
  });
  it('responde 404 para slug malformado sem consultar a API', async () => {
    const fetcher = vi.fn();
    expect((await handleRequest("/imoveis/lojasOR%201=1--]'AND%20released=1", config, fetcher)).status).toBe(404);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('redireciona para o slug atual quando o título mudou', async () => {
    const resposta = await handleRequest('/imoveis/sala-antiga-42?utm_source=wa', config, vi.fn().mockResolvedValue(new Response(JSON.stringify(imovelExemplo))));
    expect(resposta.status).toBe(301);
    expect(resposta.headers.Location).toBe('/imoveis/sala-comercial-no-centro-42?utm_source=wa');
  });
  it('não indexa painel, prévias nem catálogos filtrados', async () => {
    expect((await handleRequest('/admin/login', config)).headers['X-Robots-Tag']).toContain('noindex');
    expect(buildSeo('/?cidade=Cuiab%C3%A1', config, { catalogo: paginaVazia }).robots).toBe('noindex,follow');
    expect(buildSeo('/', { ...config, indexable: false }).robots).toContain('noindex');
  });
  it('coleta todas as páginas do sitemap, escapa XML e nunca devolve sitemap parcial', async () => {
    const imovel = { ...imovelExemplo, slug: 'sala-&-loja-42', alterado_em: '2026-09-11T00:00:00Z' };
    const fetcher = vi.fn().mockImplementation(async (url: string) => new Response(JSON.stringify({ ...paginaVazia, total_paginas: 2, itens: url.includes('pagina=1') ? [imovel] : [{ ...imovel }, { ...imovel, slug: 'outro-43' }] })));
    const resultado = await handleRequest('/sitemap.xml', config, fetcher);
    expect(resultado.body.match(/<url>/g)).toHaveLength(4);
    expect(resultado.body).toContain('sala-%26-loja-42');
    expect(resultado.body).not.toContain('/devs');
    expect(fetcher).toHaveBeenCalledTimes(2);
    fetcher.mockRejectedValueOnce(new Error('offline'));
    expect((await handleRequest('/sitemap.xml', config, fetcher)).status).toBe(503);
  });
  it('serializa scripts com segurança', () => {
    expect(serialize({ texto: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
  it('renderiza imóvel, breadcrumbs e oferta sem expor a origem da API', async () => {
    const imovel = { ...imovelExemplo, titulo: 'Sala </script><script>injected</script>' };
    const resultado = await handleRequest(`/imoveis/${imovel.slug}`, config, vi.fn().mockResolvedValue(new Response(JSON.stringify(imovel))));
    expect(resultado.status).toBe(200);
    expect(resultado.body).toMatch(/<h1[^>]*>Sala &lt;\/script&gt;/);
    expect(resultado.body).toContain('BreadcrumbList');
    expect(resultado.body).toContain('RealEstateListing');
    expect(resultado.body).toContain('LeaseOut');
    expect(resultado.body).toMatch(/Ref\. (<!-- -->)?#42/);
    expect(resultado.body).not.toContain('<script>injected');
    expect(resultado.body).not.toContain(config.apiOrigin);
  });
  it('mantém respostas concorrentes isoladas', async () => {
    const fetcher = vi.fn().mockImplementation(async (url: string) => new Response(JSON.stringify({ ...imovelExemplo, slug: url.endsWith('/um-1') ? 'um-1' : 'dois-2', titulo: url.endsWith('/um-1') ? 'Anúncio um' : 'Anúncio dois' })));
    const [um, dois] = await Promise.all([handleRequest('/imoveis/um-1', config, fetcher), handleRequest('/imoveis/dois-2', config, fetcher)]);
    expect(um.body).toContain('Anúncio um'); expect(um.body).not.toContain('Anúncio dois');
    expect(dois.body).toContain('Anúncio dois'); expect(dois.body).not.toContain('Anúncio um');
  });
  it('divide sitemaps por quantidade e bytes', () => {
    expect(sitemapChunks(['<url>á</url>', '<url>b</url>'], 1)).toHaveLength(2);
    expect(sitemapChunks(['<url>á</url>', '<url>b</url>'], 100, 20)).toHaveLength(2);
  });
  it('normaliza canonicals de paginação e exclui rastreamento', () => {
    expect(buildSeo('/?page=2&utm_source=test', config, { catalogo: paginaVazia }).canonical).toBe('https://imoveis.example/?pagina=2');
    expect(buildSeo('/?page=1', config, { catalogo: paginaVazia }).canonical).toBe('https://imoveis.example/');
  });
  it('exige origens válidas em produção e tira prévias da indexação', () => {
    expect(serverConfig({}).indexable).toBe(false);
    expect(() => serverConfig({ SEO_INDEXABLE: 'true', NODE_ENV: 'production' })).toThrow();
    const env = { SITE_URL: config.siteUrl, API_ORIGIN: config.apiOrigin, SEO_INDEXABLE: 'true', NODE_ENV: 'production' };
    expect(serverConfig(env).indexable).toBe(true);
    expect(serverConfig({ ...env, VERCEL_ENV: 'preview' }).indexable).toBe(false);
    expect(() => serverConfig({ API_ORIGIN: 'http://api.example', NODE_ENV: 'production' })).toThrow(/API_ORIGIN requires HTTPS/);
    expect(serverConfig({ API_ORIGIN: 'http://localhost:3000', NODE_ENV: 'development' }).apiOrigin).toBe('http://localhost:3000');
  });
  it('devolve 404 real para rotas desconhecidas e paginação fora do intervalo', async () => {
    expect((await handleRequest('/does-not-exist', config)).status).toBe(404);
    expect((await handleRequest('/?pagina=2', config, fetcherCatalogo())).status).toBe(404);
  });
  it('renderiza a página de desenvolvedores sem consultar a API', async () => {
    const fetcher = vi.fn();
    const resultado = await handleRequest('/devs', config, fetcher);
    expect(resultado.status).toBe(200);
    expect(fetcher).not.toHaveBeenCalled();
    expect(resultado.body).toMatch(/<h1[^>]*>Desenvolvedores<\/h1>/);
    expect(resultado.headers['X-Robots-Tag']).toBe('noindex,follow');
  });
  it('preserva sequências de substituição do título no bootstrap', async () => {
    const imovel = { ...imovelExemplo, titulo: 'Sala $& $` exemplo' };
    const resultado = await handleRequest(`/imoveis/${imovel.slug}`, config, vi.fn().mockResolvedValue(new Response(JSON.stringify(imovel))));
    expect(resultado.body).toMatch(/<h1[^>]*>Sala \$&amp; \$` exemplo<\/h1>/);
    expect(resultado.body).not.toContain('<!--app-html-->');
    expect(resultado.body).toContain('"titulo":"Sala $\\u0026 $` exemplo"');
  });
});

describe('URLs amigáveis no SSR', () => {
  it('redireciona antes de buscar e não entra em laço', async () => {
    const fetcher = fetcherCatalogo();
    const antiga = await handleRequest('/?type=SALA&purpose=LOCACAO', config, fetcher);
    expect(antiga.status).toBe(301);
    expect(antiga.headers.Location).toBe('/imoveis/para-alugar/salas');
    expect(fetcher).not.toHaveBeenCalled();
    const resultado = await handleRequest(antiga.headers.Location!, config, fetcher);
    expect(resultado.status).toBe(200);
    expect(fetcher.mock.calls.some(([caminho]) => String(caminho).includes('tipo_id=1'))).toBe(true);
    expect(fetcher.mock.calls.some(([caminho]) => String(caminho).includes('finalidade_id=3'))).toBe(true);
    expect(resultado.headers['X-Robots-Tag']).toBe('noindex,follow');
    expect(resultado.body).toContain('https://imoveis.example/imoveis/para-alugar/salas');
    expect(resultado.body).toContain('ItemList');
  });
  it('mantém rastreamento fora do canonical e filtros em português dentro', () => {
    expect(buildSeo('/imoveis/salas?cidade=Juara&bairro=Centro&pagina=2&utm_source=wa', config, { catalogo: paginaVazia }).canonical).toBe('https://imoveis.example/imoveis/salas?cidade=Juara&bairro=Centro&pagina=2');
  });
  it('publica arquivos de descoberta conforme a configuração', async () => {
    const robots = await handleRequest('/robots.txt', config);
    expect(robots.body).toContain('Sitemap: https://imoveis.example/sitemap.xml');
    expect(robots.body).not.toContain('Disallow: /\n');
    expect((await handleRequest('/llms.txt', config)).body).toContain('https://imoveis.example/imoveis/para-alugar');
    expect((await handleRequest('/robots.txt', { ...config, indexable: false })).body).toContain('Disallow: /\n');
    expect((await handleRequest('/sitemap.xml', { ...config, indexable: false })).body).not.toContain('<url>');
  });
});
