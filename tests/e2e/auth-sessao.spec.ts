// Sessão: navegação autenticada, comportamento no recarregamento e logout.
// O cookie de renovação é Secure: só HTTPS mantém a sessão após reload.
// Em HTTP o teste confirma o comportamento real (volta ao login) em vez de
// enfraquecer a segurança.
import { test, expect, loginViaUi, requireBackend, requireAdminCredentials } from './fixtures';
import { isHttps } from './helpers/env';

test('navegação autenticada carrega listas do painel', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = requireAdminCredentials();
  await loginViaUi(page, credentials.email, credentials.senha);
  await page.getByRole('link', { name: 'Imóveis' }).click();
  await expect(page).toHaveURL(/\/admin\/imoveis/);
  await expect(page.getByRole('link', { name: '+ Novo imóvel' })).toBeVisible({ timeout: 20000 });
});

test('recarregamento mantém a sessão somente em HTTPS (cookie Secure)', async ({
  page,
  backend,
}) => {
  requireBackend(backend);
  const credentials = requireAdminCredentials();
  await loginViaUi(page, credentials.email, credentials.senha);
  await page.reload();
  if (isHttps) {
    await expect(page.getByRole('link', { name: 'Visão geral' })).toBeVisible({ timeout: 20000 });
  } else {
    // Sem HTTPS o navegador descarta o cookie Secure: comportamento correto
    // é voltar ao login. Não relaxar Secure para o teste passar.
    await expect(page).toHaveURL(/\/admin\/entrar/, { timeout: 20000 });
  }
});

test('logout encerra a sessão e exige novo login', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = requireAdminCredentials();
  await loginViaUi(page, credentials.email, credentials.senha);
  await page.getByRole('button', { name: 'Sair da conta' }).first().click();
  await expect(page).toHaveURL(/\/admin\/entrar/, { timeout: 20000 });
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/entrar/);
});
