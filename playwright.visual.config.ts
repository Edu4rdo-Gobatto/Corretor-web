import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4180';
export default defineConfig({
  testDir: './tests/visual',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  globalTeardown: './tests/visual/finalizar.ts',
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 8_000, toHaveScreenshot: { threshold: 0.2, maxDiffPixels: 100, animations: 'disabled' } },
  updateSnapshots: 'none',
  snapshotPathTemplate: '{testDir}/referencias/{projectName}/{arg}{ext}',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results/visual/artefatos',
  use: { baseURL, browserName: 'chromium', locale: 'pt-BR', timezoneId: 'America/Cuiaba', deviceScaleFactor: 1, serviceWorkers: 'block', contextOptions: { reducedMotion: 'reduce' }, trace: 'retain-on-failure',
    // O placeholder nativo do input de data segue o idioma da UI do Chromium, não o locale do contexto;
    // sem isso o runner do CI (en-US) renderiza mm/dd/yyyy em vez do dd/mm/aaaa das referências.
    launchOptions: { args: ['--lang=pt-BR'] } },
  projects: [
    { name: 'claro-1440', use: { viewport: { width: 1440, height: 900 }, colorScheme: 'light' } },
    { name: 'claro-1024', testIgnore: '**/referencias.spec.ts', use: { viewport: { width: 1024, height: 768 }, colorScheme: 'light' } },
    { name: 'claro-768', testIgnore: '**/referencias.spec.ts', use: { viewport: { width: 768, height: 1024 }, colorScheme: 'light' } },
    { name: 'claro-390', use: { viewport: { width: 390, height: 844 }, colorScheme: 'light' } },
    { name: 'claro-320', testMatch: '**/publico.spec.ts', use: { viewport: { width: 320, height: 640 }, colorScheme: 'light' } },
    { name: 'escuro-1440', use: { viewport: { width: 1440, height: 900 }, colorScheme: 'dark' } },
    { name: 'escuro-390', use: { viewport: { width: 390, height: 844 }, colorScheme: 'dark' } },
  ],
  webServer: { command: 'node scripts/visual-servidor.mjs', url: baseURL, reuseExistingServer: false, timeout: 60_000, gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 } },
});
