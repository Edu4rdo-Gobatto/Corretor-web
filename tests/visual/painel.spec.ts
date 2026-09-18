import { expect, test } from '@playwright/test';
import { simularApiPainel } from './api-simulada';
import { aguardarTela, conferirBarraPainel, conferirDialogoCentralizado, conferirOrcamento, conferirSemRolagemHorizontal, contarApi, salvarPrint } from './ajudantes';
import { orcamento } from './orcamento';

// Painel com a API simulada no navegador: prints por largura/tema, layout e orçamento de requisições.
const telas = [
  { nome: 'visao-geral', caminho: '/admin' },
  { nome: 'imoveis', caminho: '/admin/imoveis' },
  { nome: 'imovel-novo', caminho: '/admin/imoveis/novo' },
  { nome: 'imovel-editar', caminho: '/admin/imoveis/42/editar' },
  { nome: 'contatos', caminho: '/admin/contatos' },
  { nome: 'pessoas', caminho: '/admin/pessoas' },
  { nome: 'ficha-pessoa', caminho: '/admin/pessoas/7' },
  { nome: 'corretores', caminho: '/admin/corretores' },
  { nome: 'cadastros', caminho: '/admin/cadastros' },
  { nome: 'contratos', caminho: '/admin/contratos' },
  { nome: 'detalhe-contrato', caminho: '/admin/contratos/5' },
  { nome: 'comissoes', caminho: '/admin/comissoes' },
  { nome: 'perfil', caminho: '/admin/perfil' },
];

for (const tela of telas) {
  test(`painel: ${tela.nome}`, async ({ page }, info) => {
    const api = await simularApiPainel(page);
    const requisicoes = contarApi(page);
    await page.goto(tela.caminho);
    await aguardarTela(page);
    await salvarPrint(page, info, `painel-${tela.nome}`);
    await conferirSemRolagemHorizontal(page, tela.nome);
    await conferirBarraPainel(page, tela.nome);
    conferirOrcamento(info, `painel/${tela.nome}`, requisicoes, orcamento[`painel/${tela.nome}`]);
    expect.soft(api.inesperadas, 'requisições fora da simulação').toEqual([]);
  });
}

const modais = [
  { nome: 'novo-corretor', caminho: '/admin/corretores', botao: '+ Novo corretor' },
  { nome: 'nova-pessoa', caminho: '/admin/pessoas', botao: '+ Nova pessoa' },
  { nome: 'novo-contrato', caminho: '/admin/contratos', botao: '+ Novo contrato' },
  { nome: 'novo-cadastro', caminho: '/admin/cadastros', botao: 'Novo cadastro' },
];

for (const modal of modais) {
  test(`painel: modal ${modal.nome}`, async ({ page }, info) => {
    await simularApiPainel(page);
    await page.goto(modal.caminho);
    await aguardarTela(page);
    await page.getByRole('button', { name: modal.botao, exact: true }).click();
    await expect(page.locator('dialog[open]')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await salvarPrint(page, info, `modal-${modal.nome}`, false);
    await conferirDialogoCentralizado(page, modal.nome);
  });
}

test('painel: corretor abre o formulário do próprio imóvel', async ({ page }, info) => {
  const api = await simularApiPainel(page, 'CORRETOR');
  await page.goto('/admin/imoveis/43/editar');
  await page.waitForLoadState('networkidle');
  await salvarPrint(page, info, 'corretor-imovel-editar');
  await expect.soft(page.getByText('Você não tem permissão para esta ação.')).toHaveCount(0);
  await expect.soft(page.getByLabel(/Título/).first()).toBeVisible();
  expect.soft(api.inesperadas, 'requisições fora da simulação').toEqual([]);
});
