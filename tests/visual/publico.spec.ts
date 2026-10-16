import { test, expect, abrir, conferirLayout, conferirFoco } from './ajudantes';

test.use({ cargo: 'VISITANTE' });
test('catálogo SSR, paginação real e detalhe', async ({ page, api }) => {
  await abrir(page, '/', /Imóveis para alugar e comprar/);
  await expect(page.getByRole('heading', { name: 'Sala comercial no Centro' })).toBeVisible();
  expect(api.pedidos.filter(p => p.caminho === '/imoveis')).toHaveLength(0);
  await conferirLayout(page);
  await conferirFoco(page);
  await page.getByRole('link', { name: 'Próxima página' }).click();
  await expect(page.getByText('Página 2 de 2')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sala comercial com recepção e copa' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sala comercial no Centro', exact: true })).toHaveCount(0);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Sala comercial no Centro', exact: true })).toBeVisible();
  expect(api.pedidos.filter(p => p.caminho === '/imoveis')).toHaveLength(1);
  await page.locator('a[href="/imoveis/sala-comercial-no-centro-100"]').first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Sala comercial no Centro' })).toBeVisible();
  await conferirLayout(page);
});

test('catálogo vazio e filtros reais no SSR', async ({ page }) => {
  await page.goto('/?bairro=NenhumResultado');
  await expect(page.getByRole('heading', { name: 'Nenhum imóvel com esses filtros' })).toBeVisible();
  await page.goto('/imoveis/para-comprar/galpoes');
  await expect(page.getByRole('heading', { name: 'Galpão com escritório e pátio' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Galpão logístico com doca' })).toHaveCount(0);
  await conferirLayout(page);
});

test('404 e indisponibilidade preservam status HTTP', async ({ page }) => {
  const ausente = await page.goto('/imoveis/ausente-999');
  expect(ausente?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/encontrad|disponível/i);
  const resposta = await page.goto('/?bairro=Cenario503');
  expect(resposta?.status()).toBe(503);
  expect(resposta?.headers()['retry-after']).toBe('30');
  await expect(page.getByRole('heading', { name: 'Serviço temporariamente indisponível' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tentar novamente' })).toBeVisible();
  await conferirLayout(page);
});
