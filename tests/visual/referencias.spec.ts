import { test, expect, abrir, aguardarTela } from './ajudantes';

const telas = [
  ['catalogo', '/', /Imóveis para alugar e comprar/],
  ['detalhe-publico', '/imoveis/sala-comercial-no-centro-100', 'Sala comercial no Centro'],
  ['entrada', '/admin/entrar', 'Área do corretor'],
  ['visao-geral', '/admin', 'Olá, Lucas.'],
  ['imoveis', '/admin/imoveis', 'Imóveis'],
  ['contatos', '/admin/contatos', 'Contatos'],
  ['ficha-imovel', '/admin/imoveis/42', 'Sala comercial no Centro'],
  ['perfil', '/admin/perfil', 'Meu perfil'],
] as const;
for (const [nome, rota, titulo] of telas) {
  test.describe(nome, () => {
    test.use({ cargo: nome === 'entrada' ? 'VISITANTE' : 'ADMIN' });
    test(`referência ${nome}`, async ({ page }, info) => {
      await abrir(page, rota, titulo);
      const escuro = info.project.use.colorScheme === 'dark';
      await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')), { message: 'Classe de tema corresponde ao projeto da referência' }).toBe(escuro);
      await page.mouse.move(0, 0);
      await page.locator('body').click({ position: { x: 1, y: 1 } });
      await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo(0, 0); });
      await aguardarTela(page);
      await expect(page).toHaveScreenshot(`${nome}.png`, { fullPage: false });
    });
  });
}
