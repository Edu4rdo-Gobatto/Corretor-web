// Comissão VENDA: confirmação + referência exigidas na baixa, idempotência e
// persistência após recarregar. Seed via API; baixa via UI real.
import { test, expect, loginViaUi, requireBackend } from './fixtures';
import {
  createCommission,
  createManualClient,
  createProperty,
  deleteProperty,
  get,
  login,
  patch,
} from './helpers/api';
import { adminCredentials, e2eName } from './helpers/env';

test('baixa exige confirmação e referência do comprovante', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = adminCredentials();
  test.skip(!credentials, 'sem E2E_ADMIN_* — seed não executado');
  const session = await login(credentials!);
  const marca = e2eName('COM-E2E');
  const property = await createProperty(session.token, e2eName('Casa E2E comissão'));
  try {
    const client = await createManualClient(session.token, e2eName('Cliente Comissão'));
    const commission = await createCommission(session.token, {
      imovelId: property.id,
      clienteId: client.id,
      observacoes: marca,
    });

    // API exige os dois campos: sem confirmação ou referência curta → 400.
    const semConfirmacao = await patch(
      `/admin/comissoes/parcelas/${commission.parcelaId}/pagamento`,
      session.token,
      { confirmar_pagamento: false, observacao_pagamento: 'PIX comprovante E2E 123' },
    );
    expect(semConfirmacao.status).toBe(400);
    const refCurta = await patch(
      `/admin/comissoes/parcelas/${commission.parcelaId}/pagamento`,
      session.token,
      { confirmar_pagamento: true, observacao_pagamento: 'abc' },
    );
    expect(refCurta.status).toBe(400);

    // UI: confirmar sem marcar o checkbox é barrado no formulário.
    await loginViaUi(page, credentials!.email, credentials!.senha);
    await page.goto('/admin/comissoes');
    const linha = page.locator('tr', { hasText: marca });
    await expect(linha).toBeVisible({ timeout: 20000 });
    await linha.getByRole('button', { name: 'Ver 1 parcela(s)' }).click();
    await page.getByRole('button', { name: 'Registrar recebimento' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Referência do comprovante').fill('PIX comprovante E2E 123');
    await dialog.getByRole('button', { name: 'Confirmar recebimento' }).click();
    await expect(dialog.getByText('Confirme que o pagamento foi recebido.')).toBeVisible();

    // Baixa válida: checkbox + referência → Pago, persistindo no reload.
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Confirmar recebimento' }).click();
    await expect(page.getByText('Pago').first()).toBeVisible({ timeout: 20000 });
    await page.reload();
    const linhaRecarregada = page.locator('tr', { hasText: marca });
    await expect(linhaRecarregada).toBeVisible({ timeout: 20000 });
    await linhaRecarregada.getByRole('button', { name: 'Ver 1 parcela(s)' }).click();
    await expect(page.getByText('Pago').first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('PIX comprovante E2E 123').first()).toBeVisible();

    // Repetir a mesma baixa é idempotente (200, sem duplicar).
    const repetida = await patch(
      `/admin/comissoes/parcelas/${commission.parcelaId}/pagamento`,
      session.token,
      { confirmar_pagamento: true, observacao_pagamento: 'PIX comprovante E2E 123' },
    );
    expect(repetida.status).toBe(200);
    const { data } = await get(`/admin/comissoes/${commission.id}`, session.token);
    expect((data as { parcelas: { status: string }[] }).parcelas.filter((p) => p.status === 'PAGO')).toHaveLength(1);
  } finally {
    await deleteProperty(session.token, property.id);
  }
});
