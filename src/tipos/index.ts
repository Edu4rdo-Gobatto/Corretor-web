// Vocabulário do domínio em português, igual ao contrato HTTP da API (contrato v2, 16/09/2026).

export type Cargo = 'ADMIN' | 'CORRETOR';

export interface Corretor {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  whatsapp: string;
  creci: string | null;
  cargo: Cargo;
  url_foto: string | null;
  ativo: boolean;
  criado_em: string;
}
export type CorretorPublico = Pick<Corretor, 'id' | 'nome' | 'whatsapp' | 'creci' | 'url_foto'>;
export interface DadosCorretor {
  nome: string;
  email: string;
  cpf?: string;
  whatsapp: string;
  creci: string | null;
  cargo: Cargo;
  url_foto: string | null;
  senha?: string;
  ativo?: boolean;
}

export interface Classificacao { id: number; nome: string; slug?: string; icone?: string | null; ativo: boolean }
export interface Classificacoes { tipos: Classificacao[]; finalidades: Classificacao[]; caracteristicas: Classificacao[] }
export type CategoriaClassificacao = 'tipos-imovel' | 'finalidades-imovel' | 'caracteristicas';

export type StatusImovel = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' | 'ALUGADO' | 'RETIRADO';
export type Ordenacao = 'recentes' | 'valor_asc' | 'valor_desc' | 'area_asc' | 'area_desc';

export interface Midia { id: number; tipo: 'IMAGEM' | 'VIDEO_EMBED' | 'VIDEO_ARQUIVO'; url: string; ordem: number; capa: boolean }
export interface CaracteristicaImovel { caracteristica_id: number; nome: string; icone: string | null; valor: string | null }

/** Campos do imóvel visíveis no site. Valores monetários e áreas chegam como texto decimal. */
export interface Imovel {
  id: number;
  titulo: string;
  slug: string;
  tipo_id: number;
  finalidade_id: number;
  tipo: Pick<Classificacao, 'id' | 'nome' | 'slug'> | null;
  finalidade: Pick<Classificacao, 'id' | 'nome' | 'slug'> | null;
  valor_venda: string | null;
  valor_locacao: string | null;
  valor_condominio: string | null;
  valor_iptu: string | null;
  area_util: string;
  area_total: string;
  cep: string | null;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  descricao: string;
  status: StatusImovel;
  destaque: boolean;
  ativo: boolean;
  corretor_id: number;
  corretor: CorretorPublico | null;
  midias: Midia[];
  caracteristicas: CaracteristicaImovel[];
  criado_em: string;
  alterado_em: string;
}

/** Ficha completa, só nas rotas do painel. */
export interface FichaImovel extends Imovel {
  proprietario_id: number | null;
  proprietario: { id: number; nome: string } | null;
  exclusividade: boolean;
  exclusividade_ate: string | null;
  data_captacao: string | null;
  chaves: string | null;
  matricula: string | null;
  inscricao_municipal: string | null;
  observacoes_internas: string | null;
  motivo_baixa: string | null;
}

export type TipoPessoa = 'PF' | 'PJ';
export type StatusContato = 'PENDENTE' | 'RESPONDIDO' | 'FINALIZADO';
export type OrigemPessoa = 'SITE' | 'MANUAL';

/** Cadastro único: o contato do site, o cliente, o proprietário e o inquilino são a mesma pessoa. */
export interface Pessoa {
  id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  tipo_pessoa: TipoPessoa | null;
  cpf_cnpj: string | null;
  data_nascimento: string | null;
  endereco: string | null;
  banco_nome: string | null;
  banco_agencia: string | null;
  banco_conta: string | null;
  chave_pix: string | null;
  observacoes: string | null;
  mensagem: string | null;
  imovel_id: number | null;
  corretor_id: number;
  origem: OrigemPessoa;
  status_contato: StatusContato;
  consentimento: boolean;
  consentimento_em: string | null;
  versao_termos: string | null;
  ativo: boolean;
  criado_em: string;
  alterado_em: string;
}

export interface Pagina<T> { itens: T[]; total: number; pagina: number; limite: number; total_paginas: number }
export interface Sessao { token_acesso: string; tipo_token: 'Bearer'; corretor: Corretor }

/** Filtros do catálogo público; tipo e finalidade são slugs das classificações. */
export interface ConsultaCatalogo {
  pagina: number;
  limite: number;
  tipo?: string;
  finalidade?: string;
  cidade?: string;
  bairro?: string;
  valor_min?: number;
  valor_max?: number;
  area_min?: number;
  area_max?: number;
  ordenar?: Ordenacao;
}

export interface Referencia { id: number; nome: string }
