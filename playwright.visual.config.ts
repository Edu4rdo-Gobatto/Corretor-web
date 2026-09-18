import { defineConfig, devices } from '@playwright/test';
import { assertSafeTarget } from './tests/e2e/helpers/env';

// Suíte visual (`npm run visual`): build de produção servido pelo seo-smoke em 127.0.0.1:4180, com a API
// pública simulada em 127.0.0.1:4199. O painel usa API simulada no navegador (tests/visual/api-simulada.ts),
// então não há credenciais, banco nem chamada a API real. Prints em test-results/visual/prints/<projeto>/.
const baseURL = 'http://127.0.0.1:4180';
assertSafeTarget();

const celular = { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } };

export default defineConfig({
  testDir: './tests/visual',
  globalSetup: './tests/visual/preparar.ts',
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  outputDir: 'test-results/visual/artefatos',
  // Chrome instalado no sistema (o download de navegadores do Playwright é bloqueado nesta máquina);
  // VISUAL_CANAL=msedge usa o Edge.
  use: { baseURL, trace: 'retain-on-failure', channel: process.env.VISUAL_CANAL ?? 'chrome' },
  projects: [
    { name: 'claro-1440', use: { viewport: { width: 1440, height: 900 }, colorScheme: 'light' } },
    { name: 'claro-1024', use: { viewport: { width: 1024, height: 768 }, colorScheme: 'light' } },
    { name: 'claro-768', use: { viewport: { width: 768, height: 1024 }, colorScheme: 'light' } },
    { name: 'claro-390', use: { ...celular, colorScheme: 'light' } },
    { name: 'claro-320', testMatch: '**/publico.spec.ts', use: { ...celular, viewport: { width: 320, height: 640 }, colorScheme: 'light' } },
    { name: 'escuro-1440', use: { viewport: { width: 1440, height: 900 }, colorScheme: 'dark' } },
    { name: 'escuro-390', use: { ...celular, colorScheme: 'dark' } },
  ],
  webServer: {
    command: 'node scripts/seo-smoke.mjs --serve',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
