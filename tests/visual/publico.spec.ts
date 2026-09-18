import { expect, test } from '@playwright/test';
import { aguardarTela, conferirDialogoCentralizado, conferirOrcamento, conferirSemRolagemHorizontal, contarApi, salvarPrint } from './ajudantes';
import { orcamento } from './orcamento';

// Site público servido pelo SSR de produção com a API simulada do seo-smoke (127.0.0.1:4199).
const detalhe = '/imoveis/sala-comercial-no-centro-100';

test('público: catálogo', async ({ page }, info) => {
  const requisicoes = contarApi(page);
  await page.goto('/');
  await aguardarTela(page);
  await salvarPrint(page, info, 'publico-catalogo');
  await conferirSemRolagemHorizontal(page, 'catálogo');
  conferirOrcamento(info, 'publico/catalogo', requisicoes, orcamento['publico/catalogo']);
});

test('público: navegar por filtro no navegador', async ({ page }, info) => {
  const requisicoes = contarApi(page);
  await page.goto('/');
  await aguardarTela(page);
  requisicoes.length = 0;
  await page.getByRole('link', { name: /Para alugar|Alugar/ }).first().click();
  await page.waitForURL(/para-alugar/);
  await aguardarTela(page);
  await salvarPrint(page, info, 'publico-catalogo-alugar');
  conferirOrcamento(info, 'publico/navegar-filtro', requisicoes, orcamento['publico/navegar-filtro']);
});

test('público: detalhe do imóvel', async ({ page }, info) => {
  const requisicoes = contarApi(page);
  await page.goto(detalhe);
  await aguardarTela(page);
  await salvarPrint(page, info, 'publico-detalhe');
  await conferirSemRolagemHorizontal(page, 'detalhe');
  conferirOrcamento(info, 'publico/detalhe', requisicoes, orcamento['publico/detalhe']);
});

test('público: modal de contato centralizado', async ({ page }, info) => {
  await page.goto(detalhe);
  await aguardarTela(page);
  await page.getByRole('button', { name: /Falar com corretor/ }).filter({ visible: true }).first().click();
  await expect(page.locator('dialog[open]')).toBeVisible();
  await salvarPrint(page, info, 'publico-modal-contato', false);
  await conferirDialogoCentralizado(page, 'modal de contato');
});

test('público: página inexistente', async ({ page }, info) => {
  const resposta = await page.goto('/pagina-que-nao-existe');
  expect(resposta?.status()).toBe(404);
  await salvarPrint(page, info, 'publico-404');
  await conferirSemRolagemHorizontal(page, '404');
});
