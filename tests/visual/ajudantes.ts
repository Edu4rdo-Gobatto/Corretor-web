import { test as base, expect, type Page } from '@playwright/test';
import { agora, simularApi, type ApiSimulada } from './api-simulada';
import type { Cargo } from '../../src/tipos';

export const test = base.extend<{ api: ApiSimulada; cargo: Cargo | 'VISITANTE' }>({
  cargo: ['ADMIN', { option: true }],
  api: [async ({ context, page, cargo }, use) => {
    const api = await simularApi(context, cargo);
    const erros: string[] = [];
    context.on('page', pagina => pagina.on('pageerror', erro => erros.push(erro.message)));
    page.on('pageerror', erro => erros.push(erro.message));
    await page.clock.setFixedTime(new Date(agora));
    await use(api);
    expect(api.inesperadas, 'Tráfego inesperado foi bloqueado antes de chegar à rede').toEqual([]);
    expect(erros, 'Erros JavaScript no navegador').toEqual([]);
  }, { auto: true }],
});
export { expect };

export async function aguardarTela(page: Page): Promise<void> {
  await page.waitForLoadState('load');
  await expect(page.getByText('Verificando sua sessão')).toHaveCount(0);
  await expect(page.getByText(/^Carregando/)).toHaveCount(0);
  await expect(page.locator('[role="status"][aria-label^="Carregando"]')).toHaveCount(0);
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  if (await page.getByRole('button', { name: /^Ativar modo (claro|escuro)$/ }).count()) {
    await expect.poll(() => page.evaluate(() => document.documentElement.style.colorScheme), { message: 'Tema aplicado pelo cliente antes da captura' }).toMatch(/^(light|dark)$/);
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).filter(i => { const r = i.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (i.loading !== 'lazy' || r.top < innerHeight); }).map(i => i.complete ? Promise.resolve() : new Promise<void>(r => { i.addEventListener('load', () => r(), { once: true }); i.addEventListener('error', () => r(), { once: true }); })));
  });
}

export async function abrir(page: Page, caminho: string, titulo: string | RegExp): Promise<void> {
  await page.goto(caminho);
  await expect(page.getByRole('heading', { name: titulo, level: 1 })).toBeVisible();
  await aguardarTela(page);
}

export async function conferirLayout(page: Page): Promise<void> {
  const excesso = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect.soft(excesso, 'A página não deve ter rolagem horizontal').toBeLessThanOrEqual(0);
  const medidas = await page.locator('.acao-icone:visible').evaluateAll(elementos => elementos.map(e => { const r = e.getBoundingClientRect(); return { nome: e.getAttribute('aria-label'), largura: r.width, altura: r.height }; }));
  for (const medida of medidas) {
    expect.soft(medida.largura, `${medida.nome}: largura mínima 44px`).toBeGreaterThanOrEqual(44);
    expect.soft(medida.altura, `${medida.nome}: altura mínima 44px`).toBeGreaterThanOrEqual(44);
  }
  const linhas = await page.locator('.acoes-linha:visible').evaluateAll(elementos => elementos.map(e => {
    const r = e.getBoundingClientRect();
    const acoes = Array.from(e.querySelectorAll('.acao-icone')).map(a => a.getBoundingClientRect());
    return { desktop: Boolean(e.closest('td')), topos: acoes.map(a => a.top), direita: acoes.length ? Math.max(...acoes.map(a => a.right)) : r.right, limite: r.right };
  }));
  for (const linha of linhas) {
    if (linha.desktop && linha.topos.length) expect.soft(Math.max(...linha.topos) - Math.min(...linha.topos), 'Ações desktop na mesma linha').toBeLessThanOrEqual(1);
    if (!linha.desktop) expect.soft(Math.abs(linha.limite - linha.direita), 'Ações mobile à direita').toBeLessThanOrEqual(2);
  }
}

export async function conferirFoco(page: Page): Promise<void> {
  const controle = page.locator('main input:visible:not([type="file"]), main .buttonSecondary:visible, main .seletor:visible').first();
  await page.mouse.move(0, 0);
  await controle.evaluate(e => { if (e instanceof HTMLElement) e.blur(); });
  const bordaInicial = await controle.evaluate(e => getComputedStyle(e).borderColor);
  await controle.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(controle).toBeFocused();
  await expect.poll(() => controle.evaluate(e => e.matches(':focus-visible')), { message: 'Foco de teclado ativo no controle' }).toBe(true);
  await expect.poll(() => controle.evaluate(e => getComputedStyle(e).borderColor), { message: 'Foco altera a cor real da borda do controle' }).not.toBe(bordaInicial);
  expect(await controle.evaluate(e => parseFloat(getComputedStyle(e).borderTopWidth)), 'Borda de foco com espessura visível').toBeGreaterThan(0);
}

export async function conferirGrades(page: Page, seletor: string): Promise<void> {
  const blocos = await page.locator(seletor).evaluateAll(es => es.map(e => {
    const titulo = e.querySelector('h2');
    const superficie = e.querySelector(':scope > .superficie-painel');
    const r = e.getBoundingClientRect(), s = superficie?.getBoundingClientRect();
    const pais = Array.from(document.querySelectorAll('.grade-painel,.imovel-ficha-topo,.imovel-ficha-notas'));
    return { titulo: titulo?.textContent, associado: Boolean(titulo?.id && e.getAttribute('aria-labelledby') === titulo.id), grupo: pais.indexOf(e.parentElement!), topo: r.top, superficieTopo: s?.top, superficieBase: s?.bottom };
  }));
  expect(blocos.length, `Seções reais presentes para ${seletor}`).toBeGreaterThanOrEqual(2);
  for (const bloco of blocos) {
    expect(bloco.associado, `${bloco.titulo}: título associado à seção`).toBe(true);
    expect(bloco.superficieTopo, `${bloco.titulo}: superfície presente`).toBeDefined();
    expect(bloco.grupo, `${bloco.titulo}: grade pai conhecida`).toBeGreaterThanOrEqual(0);
    for (const outro of blocos.filter(b => b.grupo === bloco.grupo && Math.abs(b.topo - bloco.topo) <= 1)) {
      expect.soft(Math.abs(bloco.superficieTopo! - outro.superficieTopo!), `${bloco.titulo}/${outro.titulo}: início das superfícies na linha`).toBeLessThanOrEqual(1);
      expect.soft(Math.abs(bloco.superficieBase! - outro.superficieBase!), `${bloco.titulo}/${outro.titulo}: base das superfícies na linha`).toBeLessThanOrEqual(1);
    }
  }
}
