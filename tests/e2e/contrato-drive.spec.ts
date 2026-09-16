// Cadastro de contrato e comportamento em falha da integração documental.
// Sem credenciais do Workspace, o Drive falha de forma explícita (FALHOU) e
// o contrato é preservado — esse é o comportamento esperado aqui. A criação
// real no Drive compartilhado fica para a homologação externa (SIMULADO: não
// declara integração validada).
import { test, expect, loginViaUi, requireBackend } from './fixtures';
import {
  archiveContrato,
  createContrato,
  createPessoa,
  createProperty,
  deletePessoa,
  deleteProperty,
  getContrato,
  login,
  retryContratoDrive,
} from './helpers/api';
import { adminCredentials, e2eName } from './helpers/env';

test('falha do Drive preserva o contrato com estado explícito', async ({ backend }) => {
  requireBackend(backend);
  const credentials = adminCredentials();
  test.skip(!credentials, 'sem E2E_ADMIN_* — seed não executado');
  const session = await login(credentials!);
  // IDs opcionais: se o seed falhar no meio, o finally limpa o parcial.
  let propertyId: number | null = null;
  let locadorId: number | null = null;
  let locatarioId: number | null = null;
  let contratoId: number | null = null;
  try {
    propertyId = (await createProperty(session.token, e2eName('Sala E2E contrato'))).id;
    locadorId = (await createPessoa(session.token, e2eName('Locador E2E'), true)).id;
    locatarioId = (await createPessoa(session.token, e2eName('Locatário E2E'))).id;
    const contrato = await createContrato(session.token, {
      numero: e2eName('CTR-E2E'),
      imovelId: propertyId,
      locadorId,
      locatarioId,
    });
    contratoId = contrato.id;
    // Sem Drive configurado, a integração falha sem derrubar o contrato.
    expect(contrato.status_pasta_drive).toBe('FALHOU');
    const lido = await getContrato(session.token, contrato.id);
    expect(lido.id).toBe(contrato.id);

    // Retentativa explícita também falha sem quebrar o contrato.
    const retentativa = await retryContratoDrive(session.token, contrato.id);
    expect(retentativa.status_pasta_drive).toBe('FALHOU');
  } finally {
    // Limpeza completa (soft-delete, FK-safe): contrato → imóvel → partes.
    if (contratoId) await archiveContrato(session.token, contratoId);
    if (propertyId) await deleteProperty(session.token, propertyId);
    if (locadorId) await deletePessoa(session.token, locadorId);
    if (locatarioId) await deletePessoa(session.token, locatarioId);
  }
});

test('painel exibe o estado da pasta e oferece nova tentativa', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = adminCredentials();
  test.skip(!credentials, 'sem E2E_ADMIN_* — seed não executado');
  const session = await login(credentials!);
  let propertyId: number | null = null;
  let locadorId: number | null = null;
  let locatarioId: number | null = null;
  let contratoId: number | null = null;
  try {
    propertyId = (await createProperty(session.token, e2eName('Loja E2E contrato UI'))).id;
    locadorId = (await createPessoa(session.token, e2eName('Locador UI'), true)).id;
    locatarioId = (await createPessoa(session.token, e2eName('Locatário UI'))).id;
    contratoId = (
      await createContrato(session.token, {
        numero: e2eName('CTR-UI'),
        imovelId: propertyId,
        locadorId,
        locatarioId,
      })
    ).id;
    await loginViaUi(page, credentials!.email, credentials!.senha);
    await page.goto(`/admin/contratos/${contratoId}`);
    await expect(
      page.getByText('O contrato foi salvo. A criação ou atualização da pasta não foi concluída.'),
    ).toBeVisible({ timeout: 20000 });
    await expect(
      page.getByRole('button', { name: 'Tentar preparar pasta novamente' }),
    ).toBeVisible();
  } finally {
    if (contratoId) await archiveContrato(session.token, contratoId);
    if (propertyId) await deleteProperty(session.token, propertyId);
    if (locadorId) await deletePessoa(session.token, locadorId);
    if (locatarioId) await deletePessoa(session.token, locatarioId);
  }
});
