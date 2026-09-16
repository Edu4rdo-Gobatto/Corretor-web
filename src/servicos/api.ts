import type { CategoriaClassificacao, Classificacao, Classificacoes, ConsultaCatalogo, Corretor, DadosCorretor, FichaImovel, Imovel, Midia, Pagina, Pessoa, Sessao, StatusContato, StatusImovel } from '../tipos';
import { ErroApi, http, definirTokenAcesso } from './http';
import { consultaParaApi, montarParametros } from './catalogo';
import { locacoesApi } from './locacoes';
import { slugImovelValido } from './urls';

const json = (metodo: string, corpo?: unknown): RequestInit => ({ method: metodo, ...(corpo === undefined ? {} : { body: JSON.stringify(corpo) }) });

/** Ids de referência só vão no PATCH quando mudaram, para não invalidar vínculos com cadastros inativos. */
const somenteAlterados = <T extends object, A extends object>(dados: T, anterior: A | undefined, chaves: (keyof T & keyof A)[]) =>
  Object.fromEntries(chaves.filter((chave) => anterior && (anterior[chave] as unknown) === (dados[chave] as unknown)).map((chave) => [chave, undefined]));

async function classificacoes(gerenciadas = false): Promise<Classificacoes> {
  const carregar = async (categoria: CategoriaClassificacao) => {
    const itens: Classificacao[] = [];
    let pagina = 1;
    let totalPaginas = 1;
    do {
      const resultado = await http<Pagina<Classificacao>>(`${gerenciadas ? '/admin' : ''}/${categoria}?pagina=${pagina}&limite=100`, {}, gerenciadas);
      itens.push(...resultado.itens);
      totalPaginas = resultado.total_paginas ?? Math.ceil(resultado.total / resultado.limite);
      pagina++;
    } while (pagina <= totalPaginas);
    return itens;
  };
  const [tipos, finalidades, caracteristicas] = await Promise.all([carregar('tipos-imovel'), carregar('finalidades-imovel'), carregar('caracteristicas')]);
  return { tipos, finalidades, caracteristicas };
}

export interface DadosImovel {
  titulo: string;
  tipo_id: number;
  finalidade_id: number;
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
  corretor_id?: number;
  ativo?: boolean;
  proprietario_id: number | null;
  exclusividade: boolean;
  exclusividade_ate: string | null;
  data_captacao: string | null;
  chaves: string | null;
  matricula: string | null;
  inscricao_municipal: string | null;
  observacoes_internas: string | null;
  motivo_baixa: string | null;
  caracteristicas: { caracteristica_id: number; valor: string | null }[];
}

export interface DadosPessoa {
  nome: string;
  telefone: string;
  email?: string | null;
  tipo_pessoa?: 'PF' | 'PJ' | null;
  cpf_cnpj?: string | null;
  data_nascimento?: string | null;
  endereco?: string | null;
  banco_nome?: string | null;
  banco_agencia?: string | null;
  banco_conta?: string | null;
  chave_pix?: string | null;
  observacoes?: string | null;
  mensagem?: string | null;
  imovel_id?: number | null;
  corretor_id?: number;
  status_contato?: StatusContato;
  ativo?: boolean;
}

export interface FiltrosImoveis extends Partial<ConsultaCatalogo> { busca?: string; status?: StatusImovel; ativo?: boolean; corretor_id?: number; proprietario_id?: number; destaque?: boolean; id?: number }
export interface FiltrosPessoas { pagina?: number; limite?: number; busca?: string; status_contato?: StatusContato; imovel_id?: number; corretor_id?: number; ativo?: boolean; criado_desde?: string; criado_ate?: string; id?: number }

export const api = {
  ...locacoesApi,
  classificacoes,
  listarClassificacoes: (categoria: CategoriaClassificacao, pagina = 1) => http<Pagina<Classificacao>>(`/admin/${categoria}?pagina=${pagina}&limite=20`),
  salvarClassificacao: (categoria: CategoriaClassificacao, dados: { nome?: string; slug?: string; icone?: string | null; ativo?: boolean }, id?: number) =>
    http<Classificacao>(`/admin/${categoria}${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST', dados)),

  /** Catálogo público: tipo e finalidade chegam como slug e são resolvidos pelas classificações. */
  listarImoveis: async (consulta: ConsultaCatalogo): Promise<Pagina<Imovel>> => {
    const codificada = consultaParaApi(consulta, consulta.tipo || consulta.finalidade ? await classificacoes() : { tipos: [], finalidades: [], caracteristicas: [] });
    if (codificada === null) return { itens: [], total: 0, pagina: consulta.pagina, limite: consulta.limite, total_paginas: 0 };
    return http<Pagina<Imovel>>(`/imoveis?${codificada}`, {}, false);
  },
  listarFichas: (filtros: FiltrosImoveis) => {
    const { tipo, finalidade, ...resto } = filtros;
    return http<Pagina<FichaImovel>>(`/admin/imoveis?${montarParametros({ ...resto, tipo_id: tipo, finalidade_id: finalidade })}`);
  },
  obterImovel: async (slug: string) => {
    if (!slugImovelValido(slug)) throw new ErroApi('Registro não encontrado.', 404);
    return http<Imovel>(`/imoveis/${encodeURIComponent(slug)}`, {}, false);
  },
  obterFicha: (id: number) => http<FichaImovel>(`/admin/imoveis/${id}`),
  salvarImovel: (dados: DadosImovel, id?: number, anterior?: FichaImovel) =>
    http<FichaImovel>(`/admin/imoveis${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST', { ...dados, ...somenteAlterados(dados, anterior, ['tipo_id', 'finalidade_id', 'corretor_id', 'proprietario_id']) })),
  ativarImovel: (id: number, ativo: boolean) => http<FichaImovel>(`/admin/imoveis/${id}`, json('PATCH', { ativo })),

  /** Contato do site: só os campos do formulário e o consentimento. */
  criarContato: (dados: { imovel_id: number; nome: string; telefone: string; email?: string; mensagem?: string; consentimento: true }) =>
    http<{ id: number }>('/pessoas', json('POST', dados), false),
  listarPessoas: (filtros: FiltrosPessoas = {}) => http<Pagina<Pessoa>>(`/admin/pessoas?${montarParametros(filtros)}`),
  obterPessoa: (id: number) => http<Pessoa>(`/admin/pessoas/${id}`),
  salvarPessoa: (dados: DadosPessoa, id?: number, anterior?: Pessoa) =>
    http<Pessoa>(`/admin/pessoas${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST', { ...dados, ...somenteAlterados(dados, anterior, ['imovel_id', 'corretor_id']) })),
  desativarPessoa: (id: number) => http<void>(`/admin/pessoas/${id}`, json('DELETE')),

  listarCorretores: (pagina = 1, limite = 20, busca?: string) => http<Pagina<Corretor>>(`/admin/corretores?${montarParametros({ pagina, limite, busca })}`),
  salvarCorretor: (dados: DadosCorretor, id?: number) => http<Corretor>(`/admin/corretores${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST', dados)),

  enviarMidias: (imovelId: number, arquivos: File[]) => {
    const corpo = new FormData();
    arquivos.forEach((arquivo) => corpo.append('arquivos', arquivo));
    return http<Midia[]>(`/admin/imoveis/${imovelId}/midias`, { method: 'POST', body: corpo });
  },
  adicionarVideo: (imovelId: number, url: string) => http<Midia>(`/admin/imoveis/${imovelId}/midias/video-embed`, json('POST', { url })),
  reordenarMidias: (imovelId: number, midias_ids: number[]) => http<Midia[]>(`/admin/imoveis/${imovelId}/midias/ordem`, json('PATCH', { midias_ids })),
  definirCapa: (imovelId: number, midiaId: number) => http<Midia>(`/admin/imoveis/${imovelId}/midias/${midiaId}/capa`, json('PATCH')),
  excluirMidia: (imovelId: number, midiaId: number) => http<void>(`/admin/imoveis/${imovelId}/midias/${midiaId}`, json('DELETE')),

  entrar: async (email: string, senha: string) => {
    const sessao = await http<Sessao>('/autenticacao/entrar', json('POST', { email, senha }), false);
    definirTokenAcesso(sessao.token_acesso);
    return sessao;
  },
  renovar: async () => {
    const sessao = await http<Sessao>('/autenticacao/renovar', json('POST'), false);
    definirTokenAcesso(sessao.token_acesso);
    return sessao;
  },
  sair: async () => {
    await http<void>('/autenticacao/sair', json('POST'), false);
    definirTokenAcesso(null);
  },
  eu: () => http<Corretor>('/autenticacao/eu'),
  atualizarPerfil: (dados: { nome: string; whatsapp: string; creci: string | null; url_foto: string | null }) => http<Corretor>('/autenticacao/eu', json('PATCH', dados)),
  alterarSenha: (dados: { senha_atual: string; nova_senha: string }) => http<Corretor>('/autenticacao/eu/senha', json('PATCH', dados)),
};
