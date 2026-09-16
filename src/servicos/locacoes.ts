import { http } from './http';
import { montarParametros } from './catalogo';
import type { Pagina } from '../tipos';

export type StatusContrato = 'ATIVO' | 'INATIVO';
export type StatusPastaDrive = 'PENDENTE' | 'CRIADA' | 'FALHOU';
export type TipoOperacao = 'LOCACAO' | 'VENDA';

export interface Contrato {
  id: number;
  numero_contrato: string;
  imovel_id: number;
  locador_id: number;
  locatario_id: number;
  corretor_id: number;
  data_inicio: string;
  data_fim: string;
  valor_aluguel: string;
  dia_vencimento: number;
  taxa_administracao: string;
  garantia_locaticia: string;
  indice_reajuste: string;
  cobranca_iptu_condominio: string;
  url_pasta_drive: string | null;
  status_pasta_drive: StatusPastaDrive;
  status: StatusContrato;
  observacoes: string | null;
  ativo: boolean;
  imovel_titulo: string | null;
  locador_nome: string | null;
  locatario_nome: string | null;
}
export interface DadosContrato {
  numero_contrato: string;
  imovel_id: number;
  locador_id: number;
  locatario_id: number;
  corretor_id: number;
  data_inicio: string;
  data_fim: string;
  valor_aluguel: string;
  dia_vencimento: number;
  taxa_administracao: string;
  garantia_locaticia: string;
  indice_reajuste: string;
  cobranca_iptu_condominio: string;
  status: StatusContrato;
  observacoes: string;
  ativo?: boolean;
}

export interface ParcelaComissao {
  id: number;
  numero_parcela: number;
  data_vencimento: string;
  valor: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  pago_em: string | null;
  observacao_pagamento: string | null;
  ativo: boolean;
}
export interface Comissao {
  id: number;
  tipo_operacao: TipoOperacao;
  contrato_id: number | null;
  imovel_id: number;
  pessoa_id: number;
  valor_total: string;
  quantidade_parcelas: number;
  observacoes: string | null;
  ativo: boolean;
  parcelas: ParcelaComissao[];
  valor_pago?: string;
  saldo_pendente?: string;
}
export interface DadosComissao {
  tipo_operacao: TipoOperacao;
  contrato_id: number | null;
  imovel_id: number;
  pessoa_id: number;
  valor_total: string;
  quantidade_parcelas: number;
  primeiro_vencimento: string;
  observacoes: string;
}
export interface DadosPagamento { confirmar_pagamento: true; observacao_pagamento: string }

type Filtros = { pagina?: number; limite?: number; busca?: string; ativo?: boolean };
const json = (metodo: string, corpo?: unknown): RequestInit => ({ method: metodo, body: corpo === undefined ? undefined : JSON.stringify(corpo) });

/** Contratos e comissões: mesma forma do contrato HTTP, sem tradução. */
export const locacoesApi = {
  listarContratos: (filtros: Filtros & { status?: StatusContrato; imovel_id?: number; corretor_id?: number; pessoa_id?: number } = {}) =>
    http<Pagina<Contrato>>(`/admin/contratos?${montarParametros(filtros)}`),
  obterContrato: (id: number) => http<Contrato>(`/admin/contratos/${id}`),
  salvarContrato: (dados: DadosContrato, id?: number) =>
    http<Contrato>(`/admin/contratos${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST', { ...dados, observacoes: dados.observacoes || null, ...(id ? {} : { ativo: undefined }) })),
  arquivarContrato: (id: number) => http<void>(`/admin/contratos/${id}`, json('DELETE')),
  prepararPastaDrive: (id: number) => http<Contrato>(`/admin/contratos/${id}/pasta-drive`, json('POST')),
  listarComissoes: (filtros: Filtros & { tipo_operacao?: TipoOperacao; contrato_id?: number; imovel_id?: number; pessoa_id?: number } = {}) =>
    http<Pagina<Comissao>>(`/admin/comissoes?${montarParametros(filtros)}`),
  obterComissao: (id: number) => http<Comissao>(`/admin/comissoes/${id}`),
  criarComissao: (dados: DadosComissao) =>
    http<Comissao>('/admin/comissoes', json('POST', { ...dados, contrato_id: dados.tipo_operacao === 'LOCACAO' ? dados.contrato_id : null, observacoes: dados.observacoes || null })),
  atualizarComissao: (id: number, dados: { ativo: boolean; observacoes: string }) =>
    http<Comissao>(`/admin/comissoes/${id}`, json('PATCH', { ...dados, observacoes: dados.observacoes || null })),
  pagarParcela: (id: number, dados: DadosPagamento) => http<ParcelaComissao>(`/admin/comissoes/parcelas/${id}/pagamento`, json('PATCH', dados)),
};
