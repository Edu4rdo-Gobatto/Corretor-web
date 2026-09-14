// Login válido e inválido pelo formulário real e proxy /api.
import { test, expect, loginViaUi, requireBackend, requireAdminCredentials } from './fixtures';

test('validação client-side barra e-mail inválido sem chamar a API', async ({ page }) => {
  await page.goto('/admin/entrar');
  await page.getByLabel('E-mail').fill('nao-e-email');
  await page.getByLabel('Senha').fill('qualquer-uma');
  await page.getByRole('button', { name: 'Entrar na conta →' }).click();
  await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/entrar/);
});

test('senha incorreta exibe alerta e mantém na tela de login', async ({ page, backend }) => {
  requireBackend(backend);
  await page.goto('/admin/entrar');
  await page.getByLabel('E-mail').fill('admin-inexistente-e2e@example.test');
  await page.getByLabel('Senha').fill('senha-errada-1234567890');
  await page.getByRole('button', { name: 'Entrar na conta →' }).click();
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 20000 });
  await expect(page).toHaveURL(/\/admin\/entrar/);
});

test('login válido abre o painel na visão geral', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = requireAdminCredentials();
  await loginViaUi(page, credentials.email, credentials.senha);
});
