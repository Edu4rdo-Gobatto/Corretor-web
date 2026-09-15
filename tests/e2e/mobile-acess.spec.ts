// Viewport mobile (390px): menu hamburger, navegação por teclado e tema.
// Roda no projeto chromium-mobile; o restante da suíte cobre o desktop.
import { test, expect } from './fixtures';

test('menu mobile abre, navega e fecha com Escape', async ({ page }) => {
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Abrir menu' });
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);

  await menu.click();
  const nav = page.getByRole('navigation', { name: 'Principal' });
  await expect(nav.getByRole('link', { name: 'Alugar' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Área do corretor' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Alugar' })).toBeHidden();
});

test('menu mobile permite navegar só com Tab e Enter', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  const nav = page.getByRole('navigation', { name: 'Principal' });
  await expect(nav.getByRole('link', { name: 'Encontrar um imóvel' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('link', { name: 'Alugar' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('link', { name: 'Comprar' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/imoveis\/para-comprar/);
});

test('alternância de tema persiste escolha após recarregar', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /Ativar modo (claro|escuro)/ });
  await expect(toggle).toBeVisible();
  const before = await page.evaluate(() => localStorage.getItem('theme'));
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('theme')), { timeout: 10000 })
    .not.toBe(before);
  const saved = await page.evaluate(() => localStorage.getItem('theme'));
  expect(['light', 'dark']).toContain(saved);
  await page.reload();
  // Escolha preservada: mesmo valor no storage e classe aplicada no documento.
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('theme')), { timeout: 10000 })
    .toBe(saved);
  const darkApplied = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(darkApplied).toBe(saved === 'dark');
});
