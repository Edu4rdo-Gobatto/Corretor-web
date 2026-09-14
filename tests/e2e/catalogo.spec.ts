// Catálogo público: busca, filtros, navegação ao detalhe e deep-link.
// Roda em desktop e no viewport mobile (390px).
import { test, expect, requireBackend } from './fixtures';
import { createProperty, deleteProperty, login } from './helpers/api';
import { adminCredentials, e2eName } from './helpers/env';

test('formulário de busca está visível com filtros principais', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('form', { name: 'Buscar imóveis' });
  await expect(search).toBeVisible();
  await expect(search.getByLabel('O que você procura?')).toBeVisible();
  await expect(search.getByLabel('Tipo de imóvel')).toBeVisible();
  await expect(search.getByLabel('Onde?')).toBeVisible();
  await expect(search.getByRole('button', { name: 'Buscar' })).toBeVisible();
});

test('filtro por cidade sem resultado mostra estado vazio', async ({ page, backend }) => {
  requireBackend(backend);
  await page.goto('/');
  await page.getByLabel('Onde?').fill('Cidade Inexistente E2E');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('heading', { name: 'Nenhum ponto com esse filtro' })).toBeVisible({
    timeout: 20000,
  });
  await expect(page.getByRole('button', { name: 'Limpar filtros' }).first()).toBeVisible();
});

test('navegação do cartão leva ao detalhe e deep-link abre direto', async ({
  page,
  backend,
}) => {
  requireBackend(backend);
  const credentials = adminCredentials();
  test.skip(!credentials, 'sem E2E_ADMIN_* — seed do imóvel não executado');
  const session = await login(credentials!);
  const titulo = e2eName('Sala E2E catálogo');
  const property = await createProperty(session.token, titulo);
  try {
    await page.goto('/');
    const card = page.getByRole('link', { name: new RegExp(titulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).first();
    await expect(card).toBeVisible({ timeout: 20000 });
    await card.click();
    await expect(page).toHaveURL(new RegExp(`/imoveis/${property.slug}`));
    await expect(page.locator('h1').first()).toContainText(titulo);

    // Acesso direto à URL (SSR + hidratação).
    await page.goto(`/imoveis/${property.slug}`);
    await expect(page.locator('h1').first()).toContainText(titulo);
  } finally {
    await deleteProperty(session.token, property.id);
  }
});

test('URL amigável de finalidade preserva o catálogo', async ({ page, backend }) => {
  requireBackend(backend);
  await page.goto('/imoveis/para-alugar');
  await expect(page.getByRole('form', { name: 'Buscar imóveis' })).toBeVisible({ timeout: 20000 });
  expect(page.url()).toContain('/imoveis/para-alugar');
});
