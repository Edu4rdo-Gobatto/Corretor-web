import { test, expect, abrir, conferirLayout, conferirFoco, conferirGrades } from './ajudantes';

const listas = [
  ['/admin/imoveis', 'Imóveis', 'Sala comercial no Centro'],
  ['/admin/pessoas', 'Pessoas', 'Maria Proprietária'],
  ['/admin/contatos', 'Contatos', 'Maria Proprietária'],
  ['/admin/corretores', 'Corretores', 'Lucas Gobatto'],
  ['/admin/contratos', 'Contratos de locação', 'LOC-2026-005'],
  ['/admin/comissoes', 'Comissões', '2.500'],
  ['/admin/cadastros/tipos-imovel', 'Cadastros', 'Salas comerciais'],
  ['/admin/cadastros/finalidades-imovel', 'Cadastros', 'Locação'],
  ['/admin/cadastros/caracteristicas', 'Cadastros', 'Acessibilidade'],
  ['/admin/cadastros/cidades', 'Cadastros', 'Juara'],
  ['/admin/cadastros/tipos-contrato', 'Cadastros', 'Comercial'],
  ['/admin/cadastros/indices-reajuste', 'Cadastros', 'IGP-M'],
] as const;
for (const [rota, titulo, conteudo] of listas) {
  test(`lista ${rota}: dados, alvos e alinhamento`, async ({ page }) => {
    await abrir(page, rota, titulo);
    await expect(page.getByRole('main').getByText(conteudo, { exact: false }).filter({ visible: true }).first()).toBeVisible();
    if (!['/admin/contratos', '/admin/comissoes'].includes(rota)) {
      expect(await page.locator('.acao-icone:visible').count(), `${rota}: ações presentes`).toBeGreaterThan(0);
      expect(await page.locator('.acoes-linha:visible').count(), `${rota}: linhas presentes`).toBeGreaterThan(0);
    }
    await conferirLayout(page);
  });
}

test('ficha e perfil completos sem overflow; foco e grades', async ({ page }) => {
  await abrir(page, '/admin/imoveis/42', 'Sala comercial no Centro');
  await expect(page.getByText('Maria Proprietária')).toBeVisible();
  await conferirLayout(page);
  await conferirGrades(page, '.imovel-bloco');
  await abrir(page, '/admin/perfil', 'Meu perfil');
  await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('Lucas Gobatto');
  await conferirLayout(page);
  await conferirGrades(page, '.grade-painel > .bloco-painel');
  await conferirFoco(page);
  const campos = await page.locator('input[name="nome"],input[name="whatsapp"]').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width }; }));
  expect(campos).toHaveLength(2);
  // A grade pode empilhar por container; quando divide a linha, as duas larguras devem coincidir.
  if (Math.abs(campos[0].y - campos[1].y) < 2) expect(Math.abs(campos[0].width - campos[1].width)).toBeLessThanOrEqual(1);
  else expect(Math.abs(campos[0].x - campos[1].x)).toBeLessThanOrEqual(1);
});

test('paginação e filtros do painel persistem na URL e no reload', async ({ page, api }) => {
  const modelo = api.fichas[0];
  api.fichas = Array.from({ length: 26 }, (_, indice) => ({ ...structuredClone(modelo), id: 500 + indice, slug: `imovel-visual-${500 + indice}`, titulo: `Imóvel visual ${String(indice + 1).padStart(2, '0')}`, status: indice % 2 ? 'RESERVADO' : 'DISPONIVEL' }));
  await abrir(page, '/admin/imoveis', 'Imóveis');
  await expect(page.getByText('Página 1 de 3')).toBeVisible();
  await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
  await expect(page).toHaveURL('/admin/imoveis?pagina=2');
  await expect(page.getByRole('link', { name: 'Imóvel visual 13', exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Imóvel visual 01', exact: true })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Situação do anúncio' }).click();
  await page.getByRole('option', { name: 'Disponível', exact: true }).click();
  await expect(page).toHaveURL('/admin/imoveis?status=DISPONIVEL');
  await expect(page.getByText('Página 1 de 2')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Imóvel visual 01', exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Imóvel visual 02', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page).toHaveURL('/admin/imoveis?status=DISPONIVEL');
  await expect(page.getByText('Página 1 de 2')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Situação do anúncio' })).toContainText('Disponível');
  const consultas = api.pedidos.filter(p => p.caminho === '/admin/imoveis');
  expect(consultas.some(p => new URLSearchParams(p.busca).get('pagina') === '2')).toBe(true);
  expect(new URLSearchParams(consultas.at(-1)!.busca).get('status')).toBe('DISPONIVEL');
  expect(new URLSearchParams(consultas.at(-1)!.busca).get('pagina')).toBe('1');
});

test('lista vazia, falha recuperável e ficha inexistente', async ({ page, api }) => {
  api.regras.push({ metodo: 'GET', caminho: '/admin/imoveis', status: 503, vezes: 1 });
  await page.goto('/admin/imoveis');
  await expect(page.getByText('O serviço está indisponível. Aguarde um momento e tente novamente.')).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('link', { name: 'Sala comercial no Centro', exact: true }).filter({ visible: true })).toBeVisible();
  api.pessoas.length = 0;
  await page.goto('/admin/pessoas');
  await expect(page.getByText(/Nenhuma pessoa encontrada/)).toBeVisible();
  await page.goto('/admin/imoveis/999');
  await expect(page.getByText('Imóvel indisponível.')).toBeVisible();
});
