import { test, expect, abrir, aguardarTela } from './ajudantes';
import type { Page } from '@playwright/test';

async function alugar(page: Page) {
  const menu = page.getByRole('button', { name: 'Abrir menu', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('link', { name: 'Alugar', exact: true }).filter({ visible: true }).first().click();
}

test.describe('autenticação visitante', () => {
  test.use({ cargo: 'VISITANTE' });
  test('login inválido, 429, válido, destino protegido e logout', async ({ page, api }) => {
    await page.goto('/admin/imoveis');
    await expect(page.getByRole('heading', { name: 'Área do corretor' })).toBeVisible();
    await page.getByLabel('E-mail', { exact: false }).fill('incorreto@exemplo.test');
    await page.getByLabel('Senha', { exact: false }).fill('errada');
    await page.getByRole('button', { name: 'Entrar na conta' }).click();
    await expect(page.getByText('E-mail ou senha inválidos.')).toBeVisible();
    await page.getByLabel('E-mail', { exact: false }).fill('limite@exemplo.test');
    await page.getByRole('button', { name: 'Entrar na conta' }).click();
    await expect(page.getByText(/Muitas tentativas/)).toBeVisible();
    await page.getByLabel('E-mail', { exact: false }).fill(api.usuario.email);
    await page.getByLabel('Senha', { exact: false }).fill('SenhaVisual123!');
    await page.getByRole('button', { name: 'Entrar na conta' }).click();
    await expect(page).toHaveURL('/admin/imoveis');
    await expect(page.getByRole('heading', { level: 1, name: 'Imóveis' })).toBeVisible();
    expect(api.autenticado).toBe(true);
    const conta = page.getByRole('button', { name: /Abrir conta de/ });
    if (await conta.isVisible()) await conta.click();
    await page.getByRole('button', { name: 'Sair da conta', exact: true }).filter({ visible: true }).click();
    await expect(page.getByRole('heading', { name: 'Área do corretor' })).toBeVisible();
    expect(api.autenticado).toBe(false);
    expect(api.pedidos.filter(p => p.caminho === '/autenticacao/entrar')).toHaveLength(3);
  });
});

test('SSR sem refetch; uma busca por filtro, cache no retorno e cards durante pendência', async ({ page, api }) => {
  await abrir(page, '/', /Imóveis para alugar/);
  expect(api.pedidos.filter(p => p.caminho === '/imoveis')).toHaveLength(0);
  let liberar!: () => void;
  api.regras.push({ metodo: 'GET', caminho: '/imoveis', esperar: new Promise<void>(r => { liberar = r; }), vezes: 1 });
  // Links da própria aplicação mantêm o roteador e o cache do catálogo vivos.
  await alugar(page);
  await expect(page.locator('[aria-busy="true"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sala comercial no Centro', exact: true })).toBeVisible();
  expect(api.pedidos.filter(p => p.caminho === '/imoveis')).toHaveLength(1);
  liberar();
  await aguardarTela(page);
  await expect(page.getByText('7 imóveis encontrados', { exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByText('11 imóveis encontrados', { exact: true })).toBeVisible();
  expect(api.pedidos.filter(p => p.caminho === '/imoveis')).toHaveLength(1);
  await page.goForward();
  await expect(page.getByText('7 imóveis encontrados', { exact: true })).toBeVisible();
  expect(api.pedidos.filter(p => p.caminho === '/imoveis')).toHaveLength(1);
});

test('falha de catálogo não entra no cache e retry consulta novamente', async ({ page, api }) => {
  await abrir(page, '/', /Imóveis para alugar/);
  api.regras.push({ metodo: 'GET', caminho: '/imoveis', status: 503, vezes: 1 });
  await alugar(page);
  await expect(page.getByText('O serviço está indisponível. Aguarde um momento e tente novamente.')).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByText('7 imóveis encontrados', { exact: true })).toBeVisible();
  expect(api.pedidos.filter(p => p.caminho === '/imoveis')).toHaveLength(2);
});

test('lista → ficha → Esc e edição modal alterada → dois Esc', async ({ page }) => {
  await abrir(page, '/admin/imoveis', 'Imóveis');
  await page.getByRole('link', { name: 'Sala comercial no Centro', exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL('/admin/imoveis/42');
  await page.locator('main').click({ position: { x: 1, y: 1 } });
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('/admin/imoveis');
  await page.goto('/admin/pessoas');
  await page.getByRole('button', { name: 'Editar Maria Proprietária', exact: true }).filter({ visible: true }).click();
  const dialogo = page.getByRole('dialog');
  await dialogo.getByLabel('Nome / razão social', { exact: false }).fill('Maria em edição');
  await page.keyboard.press('Escape');
  await expect(dialogo.getByText(/Há alterações não salvas/)).toBeVisible();
  await expect(dialogo).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialogo).toHaveCount(0);
});

test('falha ao salvar perfil preserva edição; sucesso atualiza estado e payload', async ({ page, api }) => {
  await abrir(page, '/admin/perfil', 'Meu perfil');
  api.regras.push({ metodo: 'PATCH', caminho: '/autenticacao/eu', status: 503, vezes: 1 });
  await page.getByLabel('Nome', { exact: true }).fill('Lucas Atualizado');
  await page.getByLabel('WhatsApp com DDI e DDD').fill('5566999991234');
  await page.getByLabel('CRECI', { exact: true }).fill('54321F');
  await page.getByRole('button', { name: 'Salvar perfil' }).click();
  await expect(page.getByText('O serviço está indisponível. Aguarde um momento e tente novamente.')).toBeVisible();
  await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('Lucas Atualizado');
  await expect(page.getByLabel('WhatsApp com DDI e DDD')).toHaveValue('5566999991234');
  await expect(page.getByLabel('CRECI', { exact: true })).toHaveValue('54321F');
  expect(api.usuario.nome).toBe('Lucas Gobatto');
  await page.getByRole('button', { name: 'Salvar perfil' }).click();
  await expect(page.getByText('Perfil atualizado.')).toBeVisible();
  expect(api.perfilSalvo).toEqual({ nome: 'Lucas Atualizado', whatsapp: '5566999991234', creci: '54321F' });
  expect(api.usuario.nome).toBe('Lucas Atualizado');
});

test('foto do perfil: só arquivo, enquadramento, recorte quadrado e envio', async ({ page, api }) => {
  await abrir(page, '/admin/perfil', 'Meu perfil');
  await expect(page.getByRole('button', { name: 'Usar URL' })).toHaveCount(0);
  await expect(page.getByLabel('URL da foto (HTTPS)')).toHaveCount(0);
  // Retrato 600×1000: metade de cima vermelha, metade de baixo azul.
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 1000;
    const contexto = canvas.getContext('2d')!;
    contexto.fillStyle = '#cc3333'; contexto.fillRect(0, 0, 600, 500);
    contexto.fillStyle = '#3366cc'; contexto.fillRect(0, 500, 600, 500);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const retrato = { name: 'retrato.png', mimeType: 'image/png', buffer: Buffer.from(base64, 'base64') };
  const escolher = () => page.getByLabel('Foto do perfil').setInputFiles(retrato);
  const dialogo = page.getByRole('dialog', { name: 'Ajustar foto' });
  const palco = dialogo.getByRole('application');
  const corNoPalco = (altura: number) => dialogo.locator('canvas').first().evaluate((canvas: HTMLCanvasElement, fracao) => [...canvas.getContext('2d')!.getImageData(canvas.width / 2, Math.floor(canvas.height * fracao), 1, 1).data.slice(0, 3)], altura);

  await escolher();
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByRole('button', { name: 'Usar foto' })).toBeEnabled();
  // Centralizado: 70% da altura do palco cai na metade azul.
  expect((await corNoPalco(0.7))[2]).toBeGreaterThan(150);
  // Cancelar descarta a escolha sem marcar o perfil como alterado.
  await dialogo.getByRole('button', { name: 'Cancelar' }).click();
  await expect(dialogo).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Remover foto' })).toHaveCount(0);

  await escolher();
  const caixa = (await palco.boundingBox())!;
  await page.mouse.move(caixa.x + caixa.width / 2, caixa.y + 20);
  await page.mouse.down();
  await page.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height - 4, { steps: 8 });
  await page.mouse.up();
  // Arrastar para baixo traz o topo da foto: o mesmo ponto passa a ser vermelho.
  await expect.poll(async () => (await corNoPalco(0.7))[0]).toBeGreaterThan(150);
  await dialogo.getByRole('slider', { name: 'Zoom' }).fill('2');
  await palco.focus();
  await page.keyboard.press('ArrowRight');
  await dialogo.getByRole('button', { name: 'Usar foto' }).click();
  await expect(dialogo).toHaveCount(0);
  await expect(page.getByText('Foto recortada. Será enviada ao salvar.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ajustar enquadramento' })).toBeVisible();

  await page.getByRole('button', { name: 'Salvar perfil' }).click();
  await expect(page.getByText('Perfil atualizado.')).toBeVisible();
  expect(api.fotoEnviada?.tipo).toMatch(/^image\/(webp|jpeg)$/);
  expect(api.fotoEnviada?.bytes).toBeGreaterThan(200);
  expect(api.fotoEnviada?.bytes).toBeLessThan(200_000);
  expect(api.inesperadas).toEqual([]);
});

test('menu responsivo e Ctrl+K navegam pelo painel', async ({ page }) => {
  await abrir(page, '/admin/imoveis', 'Imóveis');
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(page.getByRole('dialog', { name: 'Navegação do painel' })).toBeVisible();
    await page.getByRole('dialog').getByRole('link', { name: 'Pessoas', exact: true }).click();
    await expect(page).toHaveURL('/admin/pessoas');
    // O Ctrl+K é ignorado com qualquer diálogo aberto; esperar o menu fechar evita corrida no CI.
    await expect(page.getByRole('dialog', { name: 'Navegação do painel' })).toBeHidden();
  }
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Comandos do painel' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Buscar destino ou ação' }).fill('Meu perfil');
  await page.getByRole('combobox', { name: 'Buscar destino ou ação' }).press('Enter');
  await expect(page).toHaveURL('/admin/perfil');
});

test.describe('permissões CORRETOR', () => {
  test.use({ cargo: 'CORRETOR' });
  test('não edita imóvel alheio nem carrega classificações/corretores admin', async ({ page, api }) => {
    await abrir(page, '/admin/imoveis/42', 'Sala comercial no Centro');
    await expect(page.getByRole('link', { name: /^Editar / })).toHaveCount(0);
    await abrir(page, '/admin/imoveis/43/editar', /Editar imóvel/);
    await expect(page.getByLabel('Título', { exact: false })).toBeVisible();
    expect(api.pedidos.filter(p => /^\/admin\/(corretores|tipos-imovel|finalidades-imovel|caracteristicas|cidades)/.test(p.caminho))).toEqual([]);
  });
});
