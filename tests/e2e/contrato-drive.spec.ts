// Cadastro de contrato e comportamento em falha da integração documental.
// Sem credenciais do Workspace, o Drive falha de forma explícita (FALHOU) e
// o contrato é preservado — esse é o comportamento esperado aqui. A criação
// real no Drive compartilhado fica para a homologação externa (SIMULADO: não
// declara integração validada).
import { test, expect, loginViaUi, requireBackend } from './fixtures';
import {
  createContrato,
  createParte,
  createProperty,
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
  const property = await createProperty(session.token, e2eName('Sala E2E contrato'));
  try {
    const locador = await createParte(session.token, 'LOCADOR', e2eName('Locador E2E'));
    const locatario = await createParte(session.token, 'LOCATARIO', e2eName('Locatário E2E'));
    const contrato = await createContrato(session.token, {
      numero: e2eName('CTR-E2E'),
      imovelId: property.id,
      locadorId: locador.id,
      locatarioId: locatario.id,
    });
    // Sem Drive configurado, a integração falha sem derrubar o contrato.
    expect(contrato.status_pasta_drive).toBe('FALHOU');
    const lido = await getContrato(session.token, contrato.id);
    expect(lido.id).toBe(contrato.id);

    // Retentativa explícita também falha sem quebrar o contrato.
    const retentativa = await retryContratoDrive(session.token, contrato.id);
    expect(retentativa.status_pasta_drive).toBe('FALHOU');
  } finally {
    await deleteProperty(session.token, property.id);
  }
});

test('painel exibe o estado da pasta e oferece nova tentativa', async ({ page, backend }) => {
  requireBackend(backend);
  const credentials = adminCredentials();
  test.skip(!credentials, 'sem E2E_ADMIN_* — seed não executado');
  const session = await login(credentials!);
  const property = await createProperty(session.token, e2eName('Loja E2E contrato UI'));
  try {
    const locador = await createParte(session.token, 'LOCADOR', e2eName('Locador UI'));
    const locatario = await createParte(session.token, 'LOCATARIO', e2eName('Locatário UI'));
    const contrato = await createContrato(session.token, {
      numero: e2eName('CTR-UI'),
      imovelId: property.id,
      locadorId: locador.id,
      locatarioId: locatario.id,
    });
    await loginViaUi(page, credentials!.email, credentials!.senha);
    await page.goto(`/admin/contratos/${contrato.id}`);
    await expect(
      page.getByText('O contrato foi salvo. A criação ou atualização da pasta não foi concluída.'),
    ).toBeVisible({ timeout: 20000 });
    await expect(
      page.getByRole('button', { name: 'Tentar preparar pasta novamente' }),
    ).toBeVisible();
  } finally {
    await deleteProperty(session.token, property.id);
  }
});
