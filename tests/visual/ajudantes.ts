import path from 'node:path';
import { expect, type Page, type TestInfo } from '@playwright/test';

export const pastaPrints = path.join('test-results', 'visual', 'prints');

/** Registra cada requisição do navegador a `/api`; zere com `lista.length = 0` antes de medir uma ação. */
export function contarApi(page: Page): string[] {
  const lista: string[] = [];
  page.on('request', (pedido) => {
    const url = new URL(pedido.url());
    if (url.pathname.startsWith('/api/')) lista.push(`${pedido.method()} ${url.pathname}${url.search}`);
  });
  return lista;
}

/** Espera a rede acalmar e os estados de carregamento sumirem. */
export async function aguardarTela(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Verificando sua sessão')).toHaveCount(0);
  await expect(page.getByText(/^Carregando/)).toHaveCount(0, { timeout: 10_000 });
}

export async function salvarPrint(page: Page, info: TestInfo, nome: string, telaInteira = true): Promise<void> {
  await page.screenshot({ path: path.join(pastaPrints, info.project.name, `${nome}.png`), fullPage: telaInteira, animations: 'disabled' });
}

/** Anota o número de requisições e compara com o orçamento da tela (limite máximo). */
export function conferirOrcamento(info: TestInfo, tela: string, requisicoes: string[], limite: number): void {
  info.annotations.push({ type: 'requisicoes', description: `${tela}: ${requisicoes.length} (limite ${limite})\n${requisicoes.join('\n')}` });
  expect.soft(requisicoes.length, `${tela}: requisições /api acima do orçamento\n${requisicoes.join('\n')}`).toBeLessThanOrEqual(limite);
}

export async function conferirSemRolagemHorizontal(page: Page, tela: string): Promise<void> {
  const excesso = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect.soft(excesso, `${tela}: rolagem horizontal de ${excesso}px`).toBeLessThanOrEqual(0);
}

/**
 * O `<dialog>` aberto precisa estar centralizado na horizontal (±2px) e dentro da viewport. A referência é a largura do
 * `<html>`, que exclui qualquer faixa reservada à barra de rolagem (no Chrome sem janela o `clientWidth` a inclui).
 */
export async function conferirDialogoCentralizado(page: Page, tela: string): Promise<void> {
  const dialogo = page.locator('dialog[open]');
  await expect(dialogo).toBeVisible();
  const caixa = await dialogo.boundingBox();
  const viewport = page.viewportSize();
  if (!caixa || !viewport) throw new Error(`${tela}: sem medidas do diálogo`);
  const areaUtil = await page.evaluate(() => document.documentElement.getBoundingClientRect().width);
  const esquerda = caixa.x;
  const direita = areaUtil - (caixa.x + caixa.width);
  expect.soft(Math.abs(esquerda - direita), `${tela}: diálogo descentralizado (esquerda ${Math.round(esquerda)}px, direita ${Math.round(direita)}px)`).toBeLessThanOrEqual(2);
  expect.soft(caixa.y + caixa.height, `${tela}: diálogo passa da altura da tela`).toBeLessThanOrEqual(viewport.height + 1);
}

/** Abaixo de 1024px a lateral do painel vira barra no topo; ela não pode esticar em telas curtas. */
export async function conferirBarraPainel(page: Page, tela: string): Promise<void> {
  const viewport = page.viewportSize();
  if (!viewport || viewport.width >= 1024) return;
  const altura = await page.locator('aside').first().evaluate((elemento) => elemento.getBoundingClientRect().height);
  expect.soft(altura, `${tela}: barra do painel com ${Math.round(altura)}px`).toBeLessThanOrEqual(150);
}
