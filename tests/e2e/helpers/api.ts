// Chamadas diretas à API (pelo proxy /api do SSR) para seed, assertions de
// persistência e limpeza. Usam backend e banco reais de teste — sem mocks.
import { apiUrl, assertSafeE2ETarget, type TestCredentials } from './env';

const origin = () =>
  process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173';

async function call(
  path: string,
  token: string | null,
  method: string,
  body?: unknown,
): Promise<{ status: number; data: unknown; setCookie: string }> {
  if (method !== 'GET') assertSafeE2ETarget();
  const response = await fetch(apiUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: origin(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;
  return { status: response.status, data, setCookie: response.headers.get('set-cookie') ?? '' };
}

export const get = (path: string, token: string | null) => call(path, token, 'GET');
export const post = (path: string, token: string | null, body?: unknown) =>
  call(path, token, 'POST', body);
export const patch = (path: string, token: string | null, body?: unknown) =>
  call(path, token, 'PATCH', body);
export const del = (path: string, token: string | null) => call(path, token, 'DELETE');

export interface Session {
  token: string;
  agentId: string;
  role: 'ADMIN' | 'CORRETOR';
  setCookie: string;
}

export async function login(credentials: TestCredentials): Promise<Session> {
  const { status, data, setCookie } = await post('/autenticacao/entrar', null, {
    email: credentials.email,
    senha: credentials.senha,
  });
  if (status !== 200) throw new Error(`login falhou com status ${status}`);
  const session = data as { token_acesso: string; corretor: { id: string; cargo: string } };
  return {
    token: session.token_acesso,
    agentId: session.corretor.id,
    role: session.corretor.cargo === 'ADMIN' ? 'ADMIN' : 'CORRETOR',
    setCookie,
  };
}

export async function classifications(token: string) {
  const [types, purposes] = await Promise.all([
    get('/tipos-imovel?pagina=1&limite=100', token),
    get('/finalidades-imovel?pagina=1&limite=100', token),
  ]);
  const first = (page: unknown, field: string) => {
    const itens = (page as { itens: { id: string; ativo: boolean }[] }).itens.filter(
      (item) => item.ativo,
    );
    if (!itens.length) throw new Error(`sem ${field} ativo para seed`);
    return itens[0].id;
  };
  return { tipoId: first(types.data, 'tipos'), finalidadeId: first(purposes.data, 'finalidades') };
}

export interface SeedProperty {
  id: string;
  slug: string;
  titulo: string;
}

export async function createProperty(token: string, titulo: string): Promise<SeedProperty> {
  const { tipoId, finalidadeId } = await classifications(token);
  const me = (await get('/autenticacao/eu', token)).data as { id: string };
  const { status, data } = await post('/admin/imoveis', token, {
    titulo,
    tipo_id: tipoId,
    finalidade_id: finalidadeId,
    valor: '250000.00',
    area_util: '60.00',
    area_total: '70.00',
    logradouro: 'Rua de teste E2E',
    numero: '100',
    bairro: 'Centro',
    cidade: 'Juara',
    estado: 'MT',
    descricao: 'Imóvel sintético de teste ponta a ponta, sem dados reais.',
    status: 'DISPONIVEL',
    corretor_id: (me as { id: string }).id,
    ativo: true,
    caracteristicas: [],
  });
  if (status !== 201 && status !== 200)
    throw new Error(`criação de imóvel falhou: ${status} ${JSON.stringify(data)}`);
  const property = data as { id: string; slug: string; titulo: string };
  return { id: property.id, slug: property.slug, titulo: property.titulo };
}

export async function deleteProperty(token: string, id: string): Promise<void> {
  await del(`/admin/imoveis/${id}`, token);
}

export async function findPropertyByTitle(
  token: string,
  titulo: string,
): Promise<{ id: string } | null> {
  const { data } = await get(`/admin/imoveis?busca=${encodeURIComponent(titulo)}`, token);
  const itens = (data as { itens: { id: string; titulo: string }[] }).itens;
  return itens.find((item) => item.titulo === titulo) ?? null;
}

export async function findLeadByName(
  token: string,
  nome: string,
): Promise<{ id: string } | null> {
  const { data } = await get(`/admin/clientes?busca=${encodeURIComponent(nome)}`, token);
  const itens = (data as { itens: { id: string; nome: string }[] }).itens;
  return itens.find((item) => item.nome === nome) ?? null;
}

export async function deleteLead(token: string, id: string): Promise<void> {
  await del(`/admin/clientes/${id}`, token);
}

export async function createManualClient(token: string, nome: string): Promise<{ id: string }> {
  const { status, data } = await post('/admin/clientes', token, {
    nome,
    telefone: '65999990000',
  });
  if (status !== 201 && status !== 200)
    throw new Error(`criação de cliente falhou: ${status} ${JSON.stringify(data)}`);
  return data as { id: string };
}

export interface SeedCommission {
  id: string;
  parcelaId: string;
}

export async function createCommission(
  token: string,
  input: { imovelId: string; clienteId: string; observacoes: string },
): Promise<SeedCommission> {
  const { status, data } = await post('/admin/comissoes', token, {
    tipo_operacao: 'VENDA',
    contrato_id: null,
    imovel_id: input.imovelId,
    cliente_id: input.clienteId,
    valor_total: '100.00',
    quantidade_parcelas: 1,
    primeiro_vencimento: '2026-10-05',
    observacoes: input.observacoes,
  });
  if (status !== 201 && status !== 200)
    throw new Error(`criação de comissão falhou: ${status} ${JSON.stringify(data)}`);
  const commission = data as {
    id: string;
    parcelas: { id: string }[];
  };
  return { id: commission.id, parcelaId: commission.parcelas[0].id };
}

// CPF sintético válido (dígitos verificadores reais, sem titular real).
const TEST_CPF = '52998224725';

export async function createParte(
  token: string,
  papel: 'LOCADOR' | 'LOCATARIO',
  nome: string,
): Promise<{ id: string }> {
  const { status, data } = await post('/admin/partes-locacao', token, {
    papel,
    tipo_pessoa: 'PF',
    nome,
    cpf_cnpj: TEST_CPF,
  });
  if (status !== 201 && status !== 200)
    throw new Error(`criação de parte falhou: ${status} ${JSON.stringify(data)}`);
  return data as { id: string };
}

export interface SeedContrato {
  id: string;
  status_pasta_drive: string;
}

export async function createContrato(
  token: string,
  input: { numero: string; imovelId: string; locadorId: string; locatarioId: string },
): Promise<SeedContrato> {
  const me = (await get('/autenticacao/eu', token)).data as { id: string };
  const { status, data } = await post('/admin/contratos', token, {
    numero_contrato: input.numero,
    imovel_id: input.imovelId,
    locador_id: input.locadorId,
    locatario_id: input.locatarioId,
    corretor_id: me.id,
    data_inicio: '2026-01-05',
    data_fim: '2027-01-04',
    valor_aluguel: '2500.00',
    dia_vencimento: 5,
    taxa_administracao: '8.00',
    garantia_locaticia: 'CAUCAO_E2E',
    indice_reajuste: 'IPCA_E2E',
    cobranca_iptu_condominio: 'LOCATARIO_E2E',
    status: 'ATIVO',
  });
  if (status !== 201 && status !== 200)
    throw new Error(`criação de contrato falhou: ${status} ${JSON.stringify(data)}`);
  const contrato = data as { id: string; status_pasta_drive: string };
  return { id: contrato.id, status_pasta_drive: contrato.status_pasta_drive };
}

export async function retryContratoDrive(token: string, id: string): Promise<SeedContrato> {
  const { data } = await post(`/admin/contratos/${id}/pasta-drive`, token, {});
  const contrato = data as { id: string; status_pasta_drive: string };
  return { id: contrato.id, status_pasta_drive: contrato.status_pasta_drive };
}

export async function getContrato(token: string, id: string): Promise<SeedContrato> {
  const { data } = await get(`/admin/contratos/${id}`, token);
  const contrato = data as { id: string; status_pasta_drive: string };
  return { id: contrato.id, status_pasta_drive: contrato.status_pasta_drive };
}
