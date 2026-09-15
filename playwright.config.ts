import { defineConfig, devices } from '@playwright/test';
import { assertSafeTarget } from './tests/e2e/helpers/env';

// Servidor SSR real (dev ou preview) com proxy /api. Suba com `npm run preview`
// em outro terminal, ou defina E2E_WEB_SERVER=1 para subir automaticamente.
const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173';

// Trava no carregamento: vale para todos os testes, inclusive os que não usam
// a fixture `backend`. Alvo fora de localhost/allowlist aborta a suíte inteira.
assertSafeTarget();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  use: {
    baseURL,
    // Cert autoassinado do HTTPS local (cookie Secure exige HTTPS real).
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      testIgnore: '**/mobile-acess.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'chromium-mobile',
      testMatch: ['**/mobile-acess.spec.ts', '**/catalogo.spec.ts'],
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: process.env.E2E_WEB_SERVER
    ? {
        command: 'npm run preview',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120000,
      }
    : undefined,
});
