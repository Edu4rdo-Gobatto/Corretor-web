// Upload de imagem pelo painel e apresentação do resultado (capa no detalhe).
// Arquivo PNG sintético gerado no teste; R2 real de homologação; limpeza via API.
import type { Locator } from '@playwright/test';
import { test, expect, loginViaUi, requireBackend } from './fixtures';
import { createProperty, deleteProperty, get, login } from './helpers/api';
import { adminCredentials, e2eName } from './helpers/env';

// PNG 1x1 válido para o pipeline real (compressão + assinatura no navegador).
const pixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

async function assertImageLoaded(image: Locator) {
  await expect(image).toBeVisible();
  // Visível não basta: confere decodificação real (naturalWidth > 0).
  await expect
    .poll(
      () =>
        image.evaluate(
          (element: unknown) =>
            element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
        ),
      { timeout: 60000 },
    )
    .toBe(true);
}

test('upload de imagem persiste, carrega e vira capa pública', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = adminCredentials();
  test.skip(!credentials, 'sem E2E_ADMIN_* — seed do imóvel não executado');
  const session = await login(credentials!);
  const titulo = e2eName('Terreno E2E mídia');
  const property = await createProperty(session.token, titulo);
  try {
    await loginViaUi(page, credentials!.email, credentials!.senha);
    await page.goto(`/admin/imoveis/${property.id}/editar`);
    const midias = page.getByRole('heading', { name: '05. Fotos e vídeos' }).locator('..');
    await expect(midias).toBeVisible();
    await page.getByLabel(/Adicionar fotos ou vídeos/).setInputFiles({
      name: 'foto-e2e.png',
      mimeType: 'image/png',
      buffer: pixelPng,
    });
    await assertImageLoaded(midias.getByRole('img').first());
    await expect(midias.getByText('Capa').first()).toBeVisible();

    // Persistência confirmada no backend real: 1 mídia, marcada como capa.
    const { data } = await get(`/admin/imoveis/${property.id}`, session.token);
    const persisted = (data as { midias: { id: string; capa: boolean; url: string }[] }).midias;
    expect(persisted).toHaveLength(1);
    expect(persisted[0].capa).toBe(true);
    expect(persisted[0].url).toMatch(/^https?:\/\//);

    // Apresentação pública: detalhe com título e capa carregada.
    await page.goto(`/imoveis/${property.slug}`);
    await expect(page.locator('h1').first()).toContainText(titulo);
    await assertImageLoaded(page.getByRole('img').first());
  } finally {
    await deleteProperty(session.token, property.id);
  }
});

test('embed de vídeo inválido é recusado com alerta', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = adminCredentials();
  test.skip(!credentials, 'sem E2E_ADMIN_* — seed do imóvel não executado');
  const session = await login(credentials!);
  const titulo = e2eName('Prédio E2E vídeo');
  const property = await createProperty(session.token, titulo);
  try {
    await loginViaUi(page, credentials!.email, credentials!.senha);
    await page.goto(`/admin/imoveis/${property.id}/editar`);
    await page.getByLabel('Link do YouTube ou Vimeo').fill('https://example.test/video');
    await page.getByRole('button', { name: 'Adicionar vídeo' }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 20000 });
    const { data } = await get(`/admin/imoveis/${property.id}`, session.token);
    expect((data as { midias: unknown[] }).midias).toHaveLength(0);
  } finally {
    await deleteProperty(session.token, property.id);
  }
});
