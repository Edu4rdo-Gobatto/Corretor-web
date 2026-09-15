// Cadastro e edição de imóvel pelo painel, com persistência após recarregar.
// Seed via UI (fluxo real de formulário); limpeza via API.
import type { Page } from '@playwright/test';
import { test, expect, loginViaUi, requireBackend, requireAdminCredentials } from './fixtures';
import {
  createProperty,
  deleteProperty,
  findPropertyByTitle,
  login,
} from './helpers/api';
import { adminCredentials, e2eName } from './helpers/env';

async function fillRequiredFields(page: Page) {
  await page.getByLabel('Tipo de imóvel *').selectOption({ index: 1 });
  await page.getByLabel('Finalidade *').selectOption({ index: 1 });
  await page.getByLabel('Descrição *').fill('Imóvel sintético de teste ponta a ponta, sem dados reais.');
  await page.getByLabel('Preço de venda ou aluguel mensal (R$) *').fill('180000');
  await page.getByLabel('Área útil (m²) *').fill('60');
  await page.getByLabel('Área total (m²) *').fill('70');
  await page.getByLabel('Rua / avenida *').fill('Rua de teste E2E');
  await page.getByLabel('Número *').fill('100');
  await page.getByLabel('Bairro *').fill('Centro');
  await page.getByLabel('Cidade *').fill('Juara');
}

test('cadastra imóvel e persiste após recarregar', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = requireAdminCredentials();
  const titulo = e2eName('Sala E2E CRUD');
  const session = await login(credentials);
  let propertyId: string | null = null;
  try {
    await loginViaUi(page, credentials.email, credentials.senha);

    await page.goto('/admin/imoveis/novo');
    await page.getByLabel('Título do anúncio *').fill(titulo);
    await fillRequiredFields(page);
    await page.getByRole('button', { name: 'Salvar imóvel' }).click();
    await expect(page.getByRole('status')).toBeVisible({ timeout: 30000 });

    const created = await findPropertyByTitle(session.token, titulo);
    expect(created).not.toBeNull();
    propertyId = created!.id;

    await page.goto('/admin/imoveis');
    await expect(page.getByText(titulo).first()).toBeVisible({ timeout: 20000 });

    // Recarrega: o registro precisa continuar lá (persistência real).
    await page.reload();
    await expect(page.getByText(titulo).first()).toBeVisible({ timeout: 20000 });
  } finally {
    if (propertyId) await deleteProperty(session.token, propertyId);
  }
});

test('edição altera o título com sucesso', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = adminCredentials();
  test.skip(!credentials, 'sem E2E_ADMIN_* — seed do imóvel não executado');
  const session = await login(credentials!);
  const titulo = e2eName('Loja E2E editar');
  const novoTitulo = e2eName('Loja E2E editada');
  let propertyId: string | null = null;
  try {
    propertyId = (await createProperty(session.token, titulo)).id;
    await loginViaUi(page, credentials!.email, credentials!.senha);
    await page.goto(`/admin/imoveis/${propertyId}/editar`);
    await page.getByLabel('Título do anúncio *').fill(novoTitulo);
    await page.getByRole('button', { name: 'Salvar imóvel' }).click();
    await expect(page.getByRole('status')).toBeVisible({ timeout: 30000 });
    const found = await findPropertyByTitle(session.token, novoTitulo);
    expect(found).not.toBeNull();
  } finally {
    if (propertyId) await deleteProperty(session.token, propertyId);
  }
});
