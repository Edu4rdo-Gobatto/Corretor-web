// SSR/SEO pelo servidor real: robots, sitemap, llms, 404, noindex do painel
// e proxy /api. Roda sem backend (tolerando 503) e sem credenciais.
import { test, expect } from './fixtures';

test('robots.txt responde com diretivas de rastreamento', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('Disallow:');
  expect(body).toMatch(/Sitemap:|Disallow: \//);
});

test('sitemap.xml responde XML válido', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('<urlset');
});

test('llms.txt responde texto', async ({ request }) => {
  const response = await request.get('/llms.txt');
  expect(response.ok()).toBeTruthy();
  expect((await response.text()).length).toBeGreaterThan(0);
});

test('rota inexistente retorna 404 com página de erro', async ({ page }) => {
  const response = await page.goto('/rota-que-nao-existe-e2e');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Página não encontrada.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Voltar ao catálogo' })).toBeVisible();
});

test('painel de login não é indexado e renderiza o formulário', async ({ page }) => {
  const response = await page.goto('/admin/entrar');
  expect(response?.status()).toBe(200);
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  expect(robots).toContain('noindex');
  await expect(page.getByRole('heading', { name: 'Bem-vindo de volta.' })).toBeVisible();
});

test('proxy /api repassa saúde ao backend ou degrada com 503', async ({ request }) => {
  const response = await request.get('/api/saude');
  expect([200, 503]).toContain(response.status());
  if (response.ok()) {
    expect((await response.json()).status).toBe('ok');
  }
});

test('catálogo SSR entrega h1 no HTML bruto, sem executar JS', async ({ request }) => {
  const response = await request.get('/');
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  // h1 do hero (catálogo) ou da página de indisponibilidade (API fora do ar):
  // em ambos os casos, renderizado no servidor, não pelo React no navegador.
  expect(html).toMatch(/<h1[^>]*>.+<\/h1>/s);
  expect(html).not.toContain('<!--app-html-->');
});

test('catálogo renderiza com JavaScript desabilitado', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const response = await page.goto('/');
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByRole('form', { name: 'Buscar imóveis' })).toBeVisible();
  } finally {
    await context.close();
  }
});
