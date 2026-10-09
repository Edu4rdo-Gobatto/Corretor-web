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
  /** Texto exibido: livre nos contratos legados, nome do índice nos classificados. */
  indice_reajuste: string;
  cobranca_iptu_condominio: string;
  tipo_contrato_id: number | null;
  tipo_contrato_nome: string | null;
  indice_reajuste_id: number | null;
  indice_reajuste_nome: string | null;
  indice_reajuste_periodicidade_meses: number | null;
  indice_reajuste_regra: string | null;
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
  tipo_contrato_id: number;
  indice_reajuste_id: number;
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
  /** Plano de parcelas vigente; as parcelas retornadas são só deste plano. */
  versao_plano: number;
  /** Versão lida, enviada em toda alteração; divergente responde 409. */
  versao_registro: number;
  possui_recebimento: boolean;
  primeiro_vencimento?: string | null;
  parcelas: ParcelaComissao[];
  valor_pago?: string;
  saldo_pendente?: string;
}
export interface RevisaoComissao {
  id: number;
  versao_plano: number;
  tipo_operacao: TipoOperacao;
  contrato_id: number | null;
  numero_contrato: string | null;
  imovel_id: number;
  imovel_titulo: string;
  pessoa_id: number;
  pessoa_nome: string;
  valor_total: string;
  quantidade_parcelas: number;
  primeiro_vencimento: string;
  autor_id: number | null;
  autor_nome: string | null;
  origem: 'CRIACAO' | 'EDICAO' | 'MIGRACAO';
  criado_em: string;
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
  /** Clientes aceitos pelo registro de comissão do imóvel; `pessoa_id` revalida uma escolha antes do POST. */
  listarPessoasElegiveis: (filtros: { imovel_id: number; busca?: string; pagina?: number; limite?: number; pessoa_id?: number }) =>
    http<Pagina<{ id: number; nome: string }>>(`/admin/comissoes/pessoas-elegiveis?${montarParametros(filtros)}`),
  obterComissao: (id: number) => http<Comissao>(`/admin/comissoes/${id}`),
  criarComissao: (dados: DadosComissao) =>
    http<Comissao>('/admin/comissoes', json('POST', { ...dados, contrato_id: dados.tipo_operacao === 'LOCACAO' ? dados.contrato_id : null, observacoes: dados.observacoes || null })),
  /** Edição, arquivamento e reativação. A API só considera o que mudou de fato. */
  atualizarComissao: (id: number, versao_registro: number, dados: Partial<DadosComissao> & { ativo?: boolean }) =>
    http<Comissao>(`/admin/comissoes/${id}`, json('PATCH', {
      ...dados, versao_registro,
      ...(dados.tipo_operacao ? { contrato_id: dados.tipo_operacao === 'LOCACAO' ? dados.contrato_id : null } : {}),
      ...(dados.observacoes !== undefined ? { observacoes: dados.observacoes || null } : {}),
    })),
  revisoesComissao: (id: number) => http<{ itens: RevisaoComissao[] }>(`/admin/comissoes/${id}/revisoes`),
  pagarParcela: (id: number, dados: DadosPagamento) => http<ParcelaComissao>(`/admin/comissoes/parcelas/${id}/pagamento`, json('PATCH', dados)),
};
