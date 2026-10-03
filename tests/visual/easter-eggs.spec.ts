import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { conferirDialogoCentralizado, conferirSemRolagemHorizontal } from './ajudantes';

// Executar com --project=claro-1440: esta suíte define sua própria matriz de viewport e tema.
const instante = new Date('2026-10-02T12:00:00Z');
async function congelarTempo(page: Page) {
  await page.clock.install({ time: instante });
  await page.clock.pauseAt(instante);
}
const prints = path.join('test-results', 'easter-eggs');
for (const tema of ['light', 'dark'] as const) {
  for (const largura of [320, 390, 768, 1440]) {
    test(`cenas: ${tema} ${largura}px`, async ({ page }) => {
      const erros: string[] = [];
      page.on('pageerror', (erro) => erros.push(erro.message));
      await page.setViewportSize({ width: largura, height: largura === 320 ? 640 : 900 });
      await page.emulateMedia({ colorScheme: tema });
      await congelarTempo(page);
      expect((await page.goto('/devs'))?.status()).toBe(200);
      await expect(page.locator('dialog[open]')).toBeVisible();
      await expect(page.locator('html')).toHaveClass(tema === 'dark' ? /dark/ : /^$/);
      await conferirDialogoCentralizado(page, 'obra');
      await conferirSemRolagemHorizontal(page, 'obra');
      await page.clock.runFor(1200);
      await page.screenshot({ path: path.join(prints, `obra-construcao-${tema}-${largura}.png`) });
      await page.clock.runFor(2700);
      await page.screenshot({ path: path.join(prints, `obra-pronta-${tema}-${largura}.png`), animations: 'disabled' });
      await page.clock.runFor(1450);
      await expect(page.locator('dialog')).toHaveCount(0);
      await expect(page.getByRole('heading', { name: 'Desenvolvedores', exact: true })).toBeFocused();
      expect((await page.goto('/endereco-inexistente'))?.status()).toBe(404);
      await expect(page.getByRole('heading', { name: 'Página não encontrada.' })).toBeVisible();
      await page.getByRole('button', { name: 'Ficar aqui' }).click();
      await page.clock.runFor(3000);
      await conferirSemRolagemHorizontal(page, '404');
      await page.screenshot({ path: path.join(prints, `ruina-${tema}-${largura}.png`), fullPage: true, animations: 'disabled' });
      await page.clock.runFor(8000);
      expect(page.url()).toContain('endereco-inexistente');
      expect(erros).toEqual([]);
    });
  }
}

test('obra: teclado, clique fora, pular e isolamento do foco', async ({ page }) => {
  await congelarTempo(page);
  await page.goto('/devs');
  const dialogo = page.locator('dialog[open]');
  await expect(dialogo).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Ativar som da obra' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Pular' })).toBeFocused();
  await page.keyboard.press('Tab');
  // Chrome permite passar pela barra do navegador; o conteúdo atrás segue inerte.
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Fechar', exact: true })).toBeFocused();
  await page.getByRole('img', { name: /Casa em construção/ }).click();
  await expect(dialogo).toBeVisible();
  await page.keyboard.press('Escape');
  await page.clock.runFor(350);
  await expect(dialogo).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Desenvolvedores', exact: true })).toBeFocused();
  await page.reload();
  await expect(dialogo).toBeVisible();
  await page.mouse.click(1, 1);
  await page.clock.runFor(350);
  await expect(dialogo).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Pular' }).click();
  await page.clock.runFor(350);
  await expect(dialogo).toHaveCount(0);
});

test('obra: áudio bloqueado tem fallback e não interfere na navegação', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Autoplay bloqueado', 'NotAllowedError'));
  });
  await congelarTempo(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Desenvolvedores', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText(/O som não pôde tocar/);
  await expect(page.getByRole('button', { name: 'Ativar som da obra' })).toBeEnabled();
  await page.getByRole('button', { name: 'Pular' }).click();
  await page.clock.runFor(350);
  await expect(page.locator('dialog')).toHaveCount(0);
});

test('404: volta em 8s substituindo a entrada do histórico', async ({ page }) => {
  await congelarTempo(page);
  await page.goto('/devs');
  await page.getByRole('button', { name: 'Pular' }).click();
  await page.clock.runFor(350);
  await page.goto('/endereco-inexistente');
  await page.clock.runFor(7000);
  await expect(page.getByText(/Voltando ao catálogo em 1s/)).toBeVisible();
  await page.clock.runFor(1000);
  await expect(page).toHaveURL('http://127.0.0.1:4180/');
  await page.goBack();
  await expect(page).toHaveURL('http://127.0.0.1:4180/devs');
});

test('redução de movimento: casa completa, feno estático e tempos preservados', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await congelarTempo(page);
  await page.goto('/devs');
  await expect(page.locator('dialog[open]')).toBeVisible();
  const paredes = await page.locator('.obra-paredes').evaluate((el) => ({ opacity: getComputedStyle(el).opacity, animation: getComputedStyle(el).animationName }));
  expect(paredes).toEqual({ opacity: '1', animation: 'none' });
  await expect(page.locator('.obra-etapas')).toBeHidden();
  await page.screenshot({ path: path.join(prints, 'obra-reduced-motion.png') });
  await page.clock.runFor(5350);
  await expect(page.locator('dialog')).toHaveCount(0);
  await page.goto('/endereco-inexistente');
  expect(await page.locator('.animate-feno').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await page.clock.runFor(8000);
  await expect(page).toHaveURL('http://127.0.0.1:4180/');
});

test('sem JavaScript: créditos acessíveis, modal fechado e links do 404 funcionais', async ({ browser }) => {
  const contexto = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await contexto.newPage();
    await page.goto('http://127.0.0.1:4180/devs');
    await expect(page.locator('dialog')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Fernando Riad' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'GitHub de Fernando Riad' })).toBeVisible();
    expect((await page.goto('http://127.0.0.1:4180/endereco-inexistente'))?.status()).toBe(404);
    await expect(page.getByRole('link', { name: 'Voltar agora' })).toBeVisible();
    await page.getByRole('link', { name: 'Voltar agora' }).click();
    await expect(page.getByRole('heading', { name: /Imóveis comerciais para alugar e comprar/ })).toBeVisible();
  } finally { await contexto.close(); }
});

test('obra: três MP3 reais tocam após o gesto e param ao sair da rota', async ({ page }) => {
  await page.addInitScript(() => {
    const faixas: HTMLAudioElement[] = [];
    Object.defineProperty(window, '__faixasObra', { value: faixas });
    const AudioOriginal = window.Audio;
    window.Audio = class extends AudioOriginal {
      constructor(src?: string) { super(src); faixas.push(this); }
    };
  });
  await congelarTempo(page);
  const pedidos: string[] = [];
  page.on('request', (req) => { if (req.url().includes('/assets/obra-')) pedidos.push(req.url()); });
  await page.goto('/');
  expect(pedidos).toEqual([]);
  await page.getByRole('link', { name: 'Desenvolvedores', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Desligar som da obra' })).toBeVisible();
  const estado = () => page.evaluate(() => (window as unknown as { __faixasObra: HTMLAudioElement[] }).__faixasObra.map((audio) => ({ paused: audio.paused, volume: audio.volume, loop: audio.loop })));
  await expect.poll(async () => (await estado()).filter((audio) => !audio.paused).length).toBe(3);
  expect(new Set(pedidos).size).toBe(3);
  await page.evaluate(() => window.history.back());
  await expect(page).toHaveURL('http://127.0.0.1:4180/');
  expect((await estado()).every((audio) => audio.paused)).toBe(true);
});

test('obra: animação real entrega a casa antes do fechamento', async ({ page }) => {
  await page.goto('/devs');
  await expect(page.locator('dialog[open]')).toBeVisible();
  await expect.poll(() => page.locator('.obra-pronto').evaluate((el) => getComputedStyle(el).opacity), { timeout: 4800 }).toBe('1');
  await expect(page.locator('.obra-paredes')).toHaveCSS('opacity', '1');
  await expect(page.locator('.obra-telhado')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: path.join(prints, 'obra-entrega-tempo-real.png') });
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Desenvolvedores', exact: true })).toBeFocused();
});

test('autoplay bloqueado no acesso direto permite ligar pelo botão', async ({ page }) => {
  await page.addInitScript(() => {
    const tocar = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (!navigator.userActivation.isActive) return Promise.reject(new DOMException('Gesto necessário', 'NotAllowedError'));
      return tocar.call(this);
    };
  });
  await congelarTempo(page);
  await page.goto('/devs');
  await expect(page.getByRole('status')).toHaveText(/O som não pôde tocar/);
  const botao = page.getByRole('button', { name: 'Ativar som da obra' });
  await expect(botao).toBeEnabled();
  await botao.click();
  await expect(page.getByRole('button', { name: 'Desligar som da obra' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.clock.runFor(5350);
  await expect(page.locator('dialog')).toHaveCount(0);
});

test('autoplay autorizado inicia as três faixas no acesso direto e respeita Mudo', async ({ playwright }) => {
  // Política apenas deste navegador de teste; o site não contorna o bloqueio.
  const navegador = await playwright.chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const contexto = await navegador.newContext({ baseURL: 'http://127.0.0.1:4180' });
  const page = await contexto.newPage();
  try {
    await page.addInitScript(() => {
      const faixas: HTMLAudioElement[] = [];
      Object.defineProperty(window, '__faixasObra', { value: faixas });
      const AudioOriginal = window.Audio;
      window.Audio = class extends AudioOriginal {
        constructor(src?: string) { super(src); faixas.push(this); }
      };
    });
    await congelarTempo(page);
    await page.goto('/devs');
    await expect(page.getByRole('button', { name: 'Desligar som da obra' })).toBeVisible();
    const pausados = () => page.evaluate(() => (window as unknown as { __faixasObra: HTMLAudioElement[] }).__faixasObra.map((audio) => audio.paused));
    await expect.poll(pausados).toEqual([false, false, false]);
    await page.getByRole('button', { name: 'Desligar som da obra' }).click();
    expect(await pausados()).toEqual([true, true, true]);
    await page.clock.runFor(2000);
    expect(await pausados()).toEqual([true, true, true]);
    await page.getByRole('button', { name: 'Ativar som da obra' }).click();
    await expect(page.getByRole('button', { name: 'Desligar som da obra' })).toBeVisible();
    await page.getByRole('button', { name: 'Pular' }).click();
    expect((await pausados()).every(Boolean)).toBe(true);
    await page.clock.runFor(350);
    await expect(page.locator('dialog')).toHaveCount(0);
  } finally { await navegador.close(); }
});
