// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { handleRequest, serverConfig, sitemapChunks } from './server';
import { buildSeo, serialize } from './metadata';
import { sampleWireProperty, sampleClassifications } from './fixture';

const config = { siteUrl: 'https://imoveis.example', apiOrigin: 'https://api.example', indexable: true };
const wirePage = {itens:[],total:0,pagina:1,limite:9,total_paginas:0};
const catalogFetcher = () => vi.fn<typeof fetch>(async (input,options)=>{void options;const path=String(input);const items=path.includes('/tipos-imovel')?sampleClassifications.types:path.includes('/finalidades-imovel')?sampleClassifications.purposes:[];return new Response(JSON.stringify({...wirePage,itens:items,total:items.length}));});
const page = { items: [], total: 0, page: 1, limit: 9, totalPages: 0 };
describe('public SEO responses', () => {
  it('renders the catalog without JavaScript and ignores visitor cookies', async () => {
    const fetcher = catalogFetcher();
    const response = await handleRequest('/', config, fetcher);
    expect(response.status).toBe(200);
    expect(response.body).toContain('Imóveis comerciais para alugar e comprar');
    expect(response.body).toContain('application/ld+json');
    expect(response.body).toContain('rel="canonical"');
    expect(fetcher.mock.calls[0][1]).not.toHaveProperty('headers.Cookie');
  });
  it('distinguishes missing properties from unavailable API', async () => {
    expect((await handleRequest('/imoveis/missing', config, vi.fn().mockResolvedValue(new Response('', { status: 404 })))).status).toBe(404);
    const failed = await handleRequest('/', config, vi.fn().mockRejectedValue(new Error('offline')));
    expect(failed.status).toBe(503);
    expect(failed.headers['Cache-Control']).toBe('no-store');
  });
  it('does not index administration, previews, or filtered catalogs', async () => {
    const admin = await handleRequest('/admin/login', config);
    expect(admin.headers['X-Robots-Tag']).toContain('noindex');
    expect(buildSeo('/?city=Cuiab%C3%A1', config, { catalog: page }).robots).toBe('noindex,follow');
    expect(buildSeo('/', { ...config, indexable: false }).robots).toContain('noindex');
  });
  it('collects every sitemap page, escapes XML and never returns a partial sitemap', async () => {
    const property = { ...sampleWireProperty, slug: 'sala-&-loja', alterado_em: '2026-09-11T00:00:00Z' };
    const fetcher = vi.fn().mockImplementation(async (url: string) => new Response(JSON.stringify({ ...wirePage, total_paginas: 2, itens: url.includes('pagina=1') ? [property] : [{ ...property }, { ...property, slug: 'outro' }] })));
    const result = await handleRequest('/sitemap.xml', config, fetcher);
    expect(result.body.match(/<url>/g)).toHaveLength(5);
    expect(result.body).toContain('sala-%26-loja');
    expect(result.body).toContain('/devs');
    expect(fetcher).toHaveBeenCalledTimes(2);
    fetcher.mockRejectedValueOnce(new Error('offline'));
    expect((await handleRequest('/sitemap.xml', config, fetcher)).status).toBe(503);
  });
  it('safely serializes script content', () => {
    expect(serialize({ text: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
  it('renders a property, breadcrumbs and offer safely without exposing the API origin', async () => {
    const property = { ...sampleWireProperty, titulo: 'Sala </script><script>injected</script>' };
    const result = await handleRequest(`/imoveis/${property.slug}`, config, vi.fn().mockResolvedValue(new Response(JSON.stringify(property))));
    expect(result.status).toBe(200);
    expect(result.body).toMatch(/<h1[^>]*>Sala &lt;\/script&gt;/);
    expect(result.body).toContain('BreadcrumbList');
    expect(result.body).toContain('RealEstateListing');
    expect(result.body).toContain('LeaseOut');
    expect(result.body).not.toContain('<script>injected');
    expect(result.body).not.toContain(config.apiOrigin);
  });
  it('keeps concurrent responses isolated', async () => {
    const fetcher = vi.fn().mockImplementation(async (url: string) => new Response(JSON.stringify({ ...sampleWireProperty, titulo: url.endsWith('/one') ? 'Anúncio um' : 'Anúncio dois' })));
    const [one, two] = await Promise.all([handleRequest('/imoveis/one', config, fetcher), handleRequest('/imoveis/two', config, fetcher)]);
    expect(one.body).toContain('Anúncio um'); expect(one.body).not.toContain('Anúncio dois');
    expect(two.body).toContain('Anúncio dois'); expect(two.body).not.toContain('Anúncio um');
  });
  it('returns 503 if a later sitemap page fails', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ ...wirePage, itens: [sampleWireProperty], total_paginas: 2 }))).mockRejectedValueOnce(new Error('offline'));
    const result = await handleRequest('/sitemap.xml', config, fetcher);
    expect(result.status).toBe(503); expect(result.body).not.toContain('<urlset');
  });
  it('splits sitemaps by URL count and UTF-8 byte size', () => {
    expect(sitemapChunks(['<url>á</url>', '<url>b</url>'], 1)).toHaveLength(2);
    expect(sitemapChunks(['<url>á</url>', '<url>b</url>'], 100, 20)).toHaveLength(2);
  });
  it('normalizes pagination canonicals and excludes tracking parameters', () => {
    expect(buildSeo('/?page=2&utm_source=test', config, { catalog: page }).canonical).toBe('https://imoveis.example/?pagina=2');
    expect(buildSeo('/?page=1', config, { catalog: page }).canonical).toBe('https://imoveis.example/');
  });
  it('requires valid production origins and forces previews out of indexing', () => {
    expect(serverConfig({}).indexable).toBe(false);
    expect(() => serverConfig({ SEO_INDEXABLE: 'true', NODE_ENV: 'production' })).toThrow();
    const env = { SITE_URL: config.siteUrl, API_ORIGIN: config.apiOrigin, SEO_INDEXABLE: 'true', NODE_ENV: 'production' };
    expect(serverConfig(env).indexable).toBe(true);
    expect(serverConfig({ ...env, VERCEL_ENV: 'preview' }).indexable).toBe(false);
  });
  it('returns real 404 for unknown routes and out of range pagination', async () => {
    expect((await handleRequest('/does-not-exist', config)).status).toBe(404);
    expect((await handleRequest('/?pagina=2', config, catalogFetcher())).status).toBe(404);
  });
  it('renders the developers page without fetching the API', async () => {
    const fetcher = vi.fn();
    const result = await handleRequest('/devs', config, fetcher);
    expect(result.status).toBe(200);
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.body).toMatch(/<h1[^>]*>Desenvolvedores<\/h1>/);
    expect(result.body).toContain('e.gobatto');
    expect(result.body).toContain('_riad777');
    expect(result.body).toContain('rel="canonical"');
    expect(result.body).toContain('https://imoveis.example/devs');
    expect(result.headers['X-Robots-Tag']).toBe('index,follow');
    expect(buildSeo('/devs', { ...config, indexable: false }).robots).toContain('noindex');
  });
  it('preserves dollar replacement sequences in titles and bootstrap data', async () => {
    const property = { ...sampleWireProperty, titulo: 'Sala $& $` exemplo' };
    const result = await handleRequest(`/imoveis/${property.slug}`, config, vi.fn().mockResolvedValue(new Response(JSON.stringify(property))));
    expect(result.body).toMatch(/<h1[^>]*>Sala \$&amp; \$` exemplo<\/h1>/);
    expect(result.body).not.toContain('<!--app-html-->');
    expect(result.body).toContain('"title":"Sala $\\u0026 $` exemplo"');
  });
});


describe('friendly URL SSR', () => {
  it('redirects before fetching and does not loop', async () => {
    const fetcher = catalogFetcher();
    const old = await handleRequest('/?type=SALA&purpose=LOCACAO', config, fetcher);
    expect(old.status).toBe(301);
    expect(old.headers.Location).toBe('/imoveis/para-alugar/salas');
    expect(fetcher).not.toHaveBeenCalled();
    const result = await handleRequest(old.headers.Location!, config, fetcher);
    expect(result.status).toBe(200);
    expect(fetcher.mock.calls.some(([path])=>String(path).includes('tipo_id=11111111-1111-4111-8111-111111111111'))).toBe(true);
    expect(fetcher.mock.calls.some(([path])=>String(path).includes('finalidade_id=33333333-3333-4333-8333-333333333333'))).toBe(true);
    expect(result.headers['X-Robots-Tag']).toBe('noindex,follow');
    expect(result.body).toContain('https://imoveis.example/imoveis/para-alugar/salas');
    expect(result.body).toContain('ItemList');
  });
  it('keeps tracking out of canonicals and Portuguese filters in', () => {
    expect(buildSeo('/imoveis/salas?cidade=Juara&pagina=2&utm_source=wa', config, {catalog: page}).canonical).toBe('https://imoveis.example/imoveis/salas?cidade=Juara&pagina=2');
  });
  it('publishes discovery files only as configured', async () => {
    const robots = await handleRequest('/robots.txt', config);
    expect(robots.body).toContain('Sitemap: https://imoveis.example/sitemap.xml');
    expect(robots.body).not.toContain('Disallow: /\n');
    expect((await handleRequest('/llms.txt', config)).body).toContain('https://imoveis.example/imoveis/para-alugar');
    expect((await handleRequest('/llms.txt', config)).body).toContain('https://imoveis.example/devs');
    expect((await handleRequest('/robots.txt', {...config,indexable:false})).body).toContain('Disallow: /\n');
    expect((await handleRequest('/sitemap.xml', {...config,indexable:false})).body).not.toContain('<url>');
  });
});
