// Atalhos compartilhados: login via UI e portões de infraestrutura.
// Testes que precisam de backend/credenciais pulam com motivo explícito
// (registrado como "não executado") em vez de falhar sem ambiente.
// O `use` abaixo é provedor de fixture do Playwright, não hook React.
/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect, type Page } from '@playwright/test';
import {
  adminCredentials,
  assertSafeTarget,
  backendReachable,
  corretorCredentials,
  isTestStack,
  type TestCredentials,
} from './helpers/env';

export { expect };

export const test = base.extend<{ backend: boolean }>({
  // eslint-disable-next-line no-empty-pattern
  backend: async ({}, use) => {
    // Trava fora do try: alvo não-local falha alto, nunca vira skip silencioso.
    assertSafeTarget();
    await use(await backendReachable());
  },
});

export function requireBackend(backend: boolean) {
  test.skip(
    !backend,
    'backend inacessível em /api/saude — suba API + SSR de teste (ver tests/e2e/README.md)',
  );
  test.skip(
    !isTestStack(),
    'stack de teste não declarado — aponte API+SSR ao banco de teste e defina E2E_STACK=teste (nunca produção)',
  );
}

export function requireAdminCredentials(): TestCredentials {
  const credentials = adminCredentials();
  test.skip(!credentials, 'sem E2E_ADMIN_EMAIL/E2E_ADMIN_SENHA — fluxo autenticado não executado');
  return credentials!;
}

export function requireCorretorCredentials(): TestCredentials {
  test.skip(
    !corretorCredentials(),
    'sem E2E_CORRETOR_EMAIL/E2E_CORRETOR_SENHA — comparação de papéis não executada',
  );
  return corretorCredentials()!;
}

// Login real via formulário (exercita proxy /api, sessão em memória e UI).
export async function loginViaUi(page: Page, email: string, senha: string) {
  await page.goto('/admin/entrar');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(senha);
  await page.getByRole('button', { name: 'Entrar na conta →' }).click();
  await expect(page).toHaveURL(/\/admin(\/|$)/, { timeout: 20000 });
  await expect(page.getByRole('link', { name: 'Visão geral' })).toBeVisible();
}
