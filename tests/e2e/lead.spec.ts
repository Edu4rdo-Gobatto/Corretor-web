// Captação de lead com consentimento LGPD e confirmação da persistência.
// O popup de WhatsApp é neutralizado no navegador de teste (window.open)
// sem alterar o fluxo do app: o registro via API continua real.
import { test, expect, requireBackend } from './fixtures';
import {
  createProperty,
  deleteLead,
  deleteProperty,
  findLeadByName,
  login,
} from './helpers/api';
import { adminCredentials, e2eName } from './helpers/env';

test('sem consentimento o envio é barrado com erro visível', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = adminCredentials();
  test.skip(!credentials, 'sem E2E_ADMIN_* — seed do imóvel não executado');
  const session = await login(credentials!);
  const titulo = e2eName('Loja E2E lead');
  let propertyId: string | null = null;
  let slug = '';
  try {
    const property = await createProperty(session.token, titulo);
    propertyId = property.id;
    slug = property.slug;
    await page.goto(`/imoveis/${slug}`);
    await page.getByRole('button', { name: 'Falar com corretor' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Seu nome').fill('Visitante E2E');
    await dialog.getByLabel('Telefone com DDD').fill('(65) 99999-0000');
    await dialog.getByRole('button', { name: 'Falar com corretor' }).click();
    await expect(dialog.getByText('Autorize o contato para continuar.')).toBeVisible();
  } finally {
    if (propertyId) await deleteProperty(session.token, propertyId);
  }
});

test('com consentimento registra e persiste o contato', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = adminCredentials();
  test.skip(!credentials, 'sem E2E_ADMIN_* — seed do imóvel não executado');
  const session = await login(credentials!);
  const titulo = e2eName('Galpão E2E lead');
  const nomeLead = e2eName('Visitante Lead');
  let propertyId: string | null = null;
  let slug = '';
  try {
    const property = await createProperty(session.token, titulo);
    propertyId = property.id;
    slug = property.slug;
    await page.goto(`/imoveis/${slug}`);
    // Evita abrir aba externa no teste; o registro via API segue real.
    await page.evaluate(() => {
      window.open = () => null;
    });
    await page.getByRole('button', { name: 'Falar com corretor' }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Seu nome').fill(nomeLead);
    await dialog.getByLabel('Telefone com DDD').fill('(65) 99999-0000');
    await dialog.getByLabel(/Autorizo o uso dos meus dados/).check();
    await dialog.getByRole('button', { name: 'Falar com corretor' }).click();
    await expect(dialog.getByText('Obrigado pelo seu interesse.')).toBeVisible({ timeout: 20000 });

    // Persistência confirmada no backend real (lead removido em seguida).
    const lead = await findLeadByName(session.token, nomeLead);
    expect(lead).not.toBeNull();
    await deleteLead(session.token, lead!.id);
  } finally {
    if (propertyId) await deleteProperty(session.token, propertyId);
  }
});
