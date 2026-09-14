import { http } from './http';
import type { Commission, CommissionInput, CommissionInstallment, Lease, LeaseInput, PaymentInput, RentalOption, RentalPage, RentalParty, RentalPartyInput } from '../pages/admin/rentalSchema';

const json = (method: string, value?: unknown): RequestInit => ({ method, body: value === undefined ? undefined : JSON.stringify(value) });
const query = (input: object) => new URLSearchParams(Object.entries(input).filter(([, value]) => value !== undefined && value !== '').map(([key, value]) => [key, String(value)])).toString();
type ListQuery = { pagina?: number; limite?: number; busca?: string; ativo?: boolean };
const nullableParty = ['email', 'telefone', 'endereco', 'data_nascimento', 'banco_nome', 'banco_agencia', 'banco_conta', 'chave_pix', 'observacoes'] as const;
type RawParty = Omit<RentalParty, typeof nullableParty[number]> & { [Key in typeof nullableParty[number]]: string | null };
const party = (input: RawParty): RentalParty => Object.assign({}, input, Object.fromEntries(nullableParty.map(key => [key, input[key] ?? '']))) as RentalParty;
const lease = (input: Lease): Lease => ({ ...input, observacoes: input.observacoes ?? '' });
const partyBody = (input: RentalPartyInput, editing: boolean) => {
  const body: Record<string, unknown> = { papel: input.papel, tipo_pessoa: input.tipo_pessoa, nome: input.nome, cpf_cnpj: input.cpf_cnpj };
  for (const key of nullableParty) body[key] = input[key] || null;
  if (editing) body.ativo = input.ativo;
  return body;
};
const leaseBody = (input: LeaseInput, editing: boolean) => ({ numero_contrato: input.numero_contrato, imovel_id: input.imovel_id, locador_id: input.locador_id, locatario_id: input.locatario_id, corretor_id: input.corretor_id, data_inicio: input.data_inicio, data_fim: input.data_fim, valor_aluguel: input.valor_aluguel, dia_vencimento: input.dia_vencimento, taxa_administracao: input.taxa_administracao, garantia_locaticia: input.garantia_locaticia, indice_reajuste: input.indice_reajuste, cobranca_iptu_condominio: input.cobranca_iptu_condominio, status: input.status, observacoes: input.observacoes || null, ...(editing ? { ativo: input.ativo } : {}) });
export const rentalApi = {
  listRentalParties: async (input: ListQuery & { papel?: 'LOCADOR' | 'LOCATARIO'; cpf_cnpj?: string } = {}): Promise<RentalPage<RentalParty>> => {
    const page = await http<RentalPage<RawParty>>(`/admin/partes-locacao?${query(input)}`);
    return { ...page, itens: page.itens.map(party) };
  },
  getRentalParty: async (id: string) => party(await http<RawParty>(`/admin/partes-locacao/${encodeURIComponent(id)}`)),
  saveRentalParty: async (input: RentalPartyInput, id?: string) => party(await http<RawParty>(`/admin/partes-locacao${id ? `/${encodeURIComponent(id)}` : ''}`, json(id ? 'PATCH' : 'POST', partyBody(input, !!id)))),
  deleteRentalParty: (id: string) => http<RentalParty>(`/admin/partes-locacao/${encodeURIComponent(id)}`, json('DELETE')),
  listLeases: async (input: ListQuery & { status?: 'ATIVO' | 'INATIVO'; imovel_id?: string; corretor_id?: string } = {}): Promise<RentalPage<Lease>> => {
    const page = await http<RentalPage<Lease>>(`/admin/contratos?${query(input)}`);
    return { ...page, itens: page.itens.map(lease) };
  },
  getLease: async (id: string): Promise<Lease> => {
    const result = lease(await http<Lease>(`/admin/contratos/${encodeURIComponent(id)}`));
    const [property, owner, tenant] = await Promise.all([http<{ titulo: string }>(`/admin/imoveis/${result.imovel_id}`), http<{ nome: string }>(`/admin/partes-locacao/${result.locador_id}`), http<{ nome: string }>(`/admin/partes-locacao/${result.locatario_id}`)]);
    return { ...result, imovel_titulo: property.titulo, locador_nome: owner.nome, locatario_nome: tenant.nome };
  },
  saveLease: async (input: LeaseInput, id?: string) => lease(await http<Lease>(`/admin/contratos${id ? `/${encodeURIComponent(id)}` : ''}`, json(id ? 'PATCH' : 'POST', leaseBody(input, !!id)))),
  deleteLease: (id: string) => http<Lease>(`/admin/contratos/${encodeURIComponent(id)}`, json('DELETE')),
  retryLeaseDrive: (id: string) => http<Lease>(`/admin/contratos/${encodeURIComponent(id)}/pasta-drive`, json('POST')),
  listCommissions: (input: ListQuery & { tipo_operacao?: 'LOCACAO' | 'VENDA'; contrato_id?: string; imovel_id?: string; cliente_id?: string } = {}) => http<RentalPage<Commission>>(`/admin/comissoes?${query(input)}`),
  getCommission: (id: string) => http<Commission>(`/admin/comissoes/${encodeURIComponent(id)}`),
  createCommission: (input: CommissionInput) => http<Commission>('/admin/comissoes', json('POST', { ...input, contrato_id: input.tipo_operacao === 'LOCACAO' ? input.contrato_id : null, observacoes: input.observacoes || null })),
  updateCommission: (id: string, input: { ativo: boolean; observacoes: string }) => http<Commission>(`/admin/comissoes/${encodeURIComponent(id)}`, json('PATCH', { ...input, observacoes: input.observacoes || null })),
  payCommissionInstallment: (id: string, input: PaymentInput) => http<CommissionInstallment>(`/admin/comissoes/parcelas/${encodeURIComponent(id)}/pagamento`, json('PATCH', input)),
  rentalPropertyOptions: async (pagina = 1, busca = ''): Promise<RentalPage<RentalOption>> => {
    const page = await http<RentalPage<{ id: string; titulo: string; corretor_id: string }>>(`/admin/imoveis?${query({ pagina, limite: 15, busca, ativo: true })}`);
    return { ...page, itens: page.itens.map(item => ({ id: item.id, nome: item.titulo, corretor_id: item.corretor_id })) };
  },
  rentalPropertyOption: async (id: string): Promise<RentalOption> => {
    const property = await http<{ id: string; titulo: string; corretor_id: string }>(`/admin/imoveis/${encodeURIComponent(id)}`);
    return { id: property.id, nome: property.titulo, corretor_id: property.corretor_id };
  },
  rentalClientOption: (id: string) => http<RentalOption>(`/admin/clientes/${encodeURIComponent(id)}`),
  rentalClientOptions: async (pagina = 1, busca = ''): Promise<RentalPage<RentalOption>> => http<RentalPage<RentalOption>>(`/admin/clientes?${query({ pagina, limite: 15, busca, ativo: true })}`),
  rentalAgentOptions: async (pagina = 1, busca = ''): Promise<RentalPage<RentalOption>> => http<RentalPage<RentalOption>>(`/admin/corretores?${query({ pagina, limite: 15, busca, ativo: true })}`),
};
