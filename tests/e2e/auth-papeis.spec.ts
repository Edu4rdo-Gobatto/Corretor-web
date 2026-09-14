// Acesso protegido e diferenças ADMIN x corretor.
import { test, expect, loginViaUi, requireBackend, requireAdminCredentials, requireCorretorCredentials } from './fixtures';

test('rota protegida sem sessão redireciona ao login', async ({ page }) => {
  await page.goto('/admin/imoveis');
  await expect(page).toHaveURL(/\/admin\/entrar/, { timeout: 20000 });
  await expect(page.getByRole('heading', { name: 'Bem-vindo de volta.' })).toBeVisible();
});

test('ADMIN enxerga a gestão de corretores', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = requireAdminCredentials();
  await loginViaUi(page, credentials.email, credentials.senha);
  await expect(page.getByRole('link', { name: 'Corretores' })).toBeVisible();
});

test('corretor não enxerga a gestão de corretores', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = requireCorretorCredentials();
  await loginViaUi(page, credentials.email, credentials.senha);
  await expect(page.getByRole('link', { name: 'Corretores' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Imóveis' })).toBeVisible();
});
