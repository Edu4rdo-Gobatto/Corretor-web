import type { CadastroContrato, CategoriaClassificacao, CategoriaContrato, Classificacao, DadosCadastroContrato, Classificacoes, ConsultaCatalogo, Corretor, DadosCorretor, FichaImovel, Imovel, ImovelResumo, Midia, Pagina, Pessoa, Sessao, StatusContato, StatusImovel } from '../tipos';
import { ErroApi, http, definirTokenAcesso, renovarSessao } from './http';
import { consultaParaApi, montarParametros } from './catalogo';
import { locacoesApi } from './locacoes';
import { slugImovelValido, urlCatalogo } from './urls';
import { emCache, guardarCache, lerCache } from './cache';

const VALIDADE_CATALOGO_MS = 2 * 60_000;
const VALIDADE_CLASSIFICACOES_MS = 10 * 60_000;
const CHAVE_CLASSIFICACOES = 'classificacoes';
const chaveCatalogo = (consulta: ConsultaCatalogo) => `catalogo:${urlCatalogo(consulta)}`;

/** Leitura síncrona do cache público: um filtro já visto aparece sem requisição nem estado de carregamento. */
export const catalogoEmCache = (consulta: ConsultaCatalogo) => lerCache<Pagina<ImovelResumo>>(chaveCatalogo(consulta));
export const classificacoesEmCache = () => lerCache<Classificacoes>(CHAVE_CLASSIFICACOES);
/** O SSR já buscou estes dados para a URL de entrada; guardá-los evita repetir a busca ao voltar a ela. */
export const semearCatalogo = (consulta: ConsultaCatalogo, valor: Pagina<ImovelResumo>) => guardarCache(chaveCatalogo(consulta), valor, VALIDADE_CATALOGO_MS);
export const semearClassificacoes = (valor: Classificacoes) => guardarCache(CHAVE_CLASSIFICACOES, valor, VALIDADE_CLASSIFICACOES_MS);

const json = (metodo: string, corpo?: unknown): RequestInit => ({ method: metodo, ...(corpo === undefined ? {} : { body: JSON.stringify(corpo) }) });

/** Confere o mesmo SSR que abrirá a página, sem confundir saúde da API com dados disponíveis. */
export async function verificarPaginaPublica(caminho: string, sinal: AbortSignal): Promise<boolean> {
  const origem = window.location.origin;
  const destino = new URL(caminho, origem);
  if (destino.origin !== origem) return false;
  const resposta = await fetch(destino.pathname + destino.search, {
    method: 'HEAD', cache: 'no-store', credentials: 'omit', redirect: 'follow', signal: sinal,
  });
  return new URL(resposta.url || destino.href, origem).origin === origem && (resposta.status === 200 || resposta.status === 404);
}

/** Ids de referência só vão no PATCH quando mudaram, para não invalidar vínculos com cadastros inativos. */
const somenteAlterados = <T extends object, A extends object>(dados: T, anterior: A | undefined, chaves: (keyof T & keyof A)[]) =>
  Object.fromEntries(chaves.filter((chave) => anterior && (anterior[chave] as unknown) === (dados[chave] as unknown)).map((chave) => [chave, undefined]));

/** A lista pública vem do cache; a do painel (`gerenciadas`, com inativos) sempre busca. */
function classificacoes(gerenciadas = false): Promise<Classificacoes> {
  return gerenciadas ? buscarClassificacoes(true) : emCache(CHAVE_CLASSIFICACOES, VALIDADE_CLASSIFICACOES_MS, () => buscarClassificacoes(false));
}

async function buscarClassificacoes(gerenciadas: boolean): Promise<Classificacoes> {
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
  const [tipos, finalidades, caracteristicas, cidades] = await Promise.all([carregar('tipos-imovel'), carregar('finalidades-imovel'), carregar('caracteristicas'),
    // Cidades vieram depois (16/10): sem a rota na API, o catálogo segue sem o filtro em vez de falhar inteiro.
    carregar('cidades').catch(() => [] as Classificacao[])]);
  return { tipos, finalidades, caracteristicas, cidades };
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
  corretor_id?: number;
  ativo?: boolean;
  proprietario_id: number | null;
  exclusividade: boolean;
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

export interface FiltrosImoveis extends Partial<ConsultaCatalogo> { busca?: string; status?: StatusImovel; ativo?: boolean; corretor_id?: number; proprietario_id?: number; id?: number }
export interface FiltrosPessoas { pagina?: number; limite?: number; busca?: string; status_contato?: StatusContato; imovel_id?: number; corretor_id?: number; ativo?: boolean; criado_desde?: string; criado_ate?: string; id?: number }

export const api = {
  ...locacoesApi,
  classificacoes,
  listarClassificacoes: (categoria: CategoriaClassificacao, pagina = 1) => http<Pagina<Classificacao>>(`/admin/${categoria}?pagina=${pagina}&limite=20`),
  obterClassificacao: (categoria: CategoriaClassificacao, id: number) => http<Classificacao>(`/admin/${categoria}/${id}`),
  salvarClassificacao: (categoria: CategoriaClassificacao, dados: { nome?: string; slug?: string; icone?: string | null; estado?: string; ativo?: boolean }, id?: number) =>
    http<Classificacao>(`/admin/${categoria}${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST', dados)),
  listarCadastrosContrato: (categoria: CategoriaContrato, pagina = 1) => http<Pagina<CadastroContrato>>(`/admin/${categoria}?pagina=${pagina}&limite=20`),
  obterCadastroContrato: (categoria: CategoriaContrato, id: number) => http<CadastroContrato>(`/admin/${categoria}/${id}`),
  salvarCadastroContrato: (categoria: CategoriaContrato, dados: DadosCadastroContrato, id?: number) =>
    http<CadastroContrato>(`/admin/${categoria}${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST', dados)),
  /** Opções ativas para o formulário de contrato (ADMIN e CORRETOR). */
  opcoesContrato: async (categoria: CategoriaContrato): Promise<CadastroContrato[]> => {
    const itens: CadastroContrato[] = [];
    for (let pagina = 1; ; pagina++) {
      const resultado = await http<Pagina<CadastroContrato>>(`/cadastros/${categoria}?pagina=${pagina}&limite=100`);
      itens.push(...resultado.itens);
      if (pagina >= resultado.total_paginas) return itens;
    }
  },

  /** Catálogo público: tipo e finalidade chegam como slug e são resolvidos pelas classificações. */
  listarImoveis: (consulta: ConsultaCatalogo): Promise<Pagina<ImovelResumo>> => emCache(chaveCatalogo(consulta), VALIDADE_CATALOGO_MS, async () => {
    const codificada = consultaParaApi(consulta, consulta.tipos?.length || consulta.finalidade ? await classificacoes() : { tipos: [], finalidades: [], caracteristicas: [], cidades: [] });
    if (codificada === null) return { itens: [], total: 0, pagina: consulta.pagina, limite: consulta.limite, total_paginas: 0 };
    return http<Pagina<ImovelResumo>>(`/imoveis?${codificada}`, {}, false);
  }),
  listarFichas: (filtros: FiltrosImoveis) => {
    const { tipos, finalidade, ...resto } = filtros;
    return http<Pagina<FichaImovel>>(`/admin/imoveis?${montarParametros({ ...resto, tipo_id: tipos?.join(','), finalidade_id: finalidade })}`);
  },
  obterImovel: async (slug: string) => {
    if (!slugImovelValido(slug)) throw new ErroApi('Registro não encontrado.', 404);
    return http<Imovel>(`/imoveis/${encodeURIComponent(slug)}`, {}, false);
  },
  obterFicha: (id: number) => http<FichaImovel>(`/admin/imoveis/${id}`),
  salvarImovel: (dados: DadosImovel, id?: number, anterior?: FichaImovel) =>
    http<FichaImovel>(`/admin/imoveis${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST', {
      ...dados, ...somenteAlterados(dados, anterior, ['tipo_id', 'finalidade_id', 'corretor_id', 'proprietario_id']),
      ...(id && anterior && dados.caracteristicas.length === anterior.caracteristicas.length && dados.caracteristicas.every(item => anterior.caracteristicas.some(atual => atual.caracteristica_id === item.caracteristica_id && atual.valor === item.valor)) ? { caracteristicas: undefined } : {}),
    })),
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
  obterCorretor: (id: number) => http<Corretor>(`/admin/corretores/${id}`),
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
  renovar: renovarSessao,
  sair: async () => {
    await http<void>('/autenticacao/sair', json('POST'), false);
    definirTokenAcesso(null);
  },
  eu: () => http<Corretor>('/autenticacao/eu'),
  /** `creci` omitido mantém o valor atual; null ou vazio limpa. A foto só entra como arquivo; `url_foto: null` remove a atual. */
  atualizarPerfil: (dados: { nome: string; whatsapp: string; creci?: string | null; url_foto?: null }, foto?: File) => {
    if (!foto) return http<Corretor>('/autenticacao/eu', json('PATCH', dados));
    const corpo = new FormData();
    corpo.set('nome', dados.nome); corpo.set('whatsapp', dados.whatsapp); if (dados.creci !== undefined) corpo.set('creci', dados.creci ?? ''); corpo.set('foto', foto);
    return http<Corretor>('/autenticacao/eu', { method: 'PATCH', body: corpo });
  },
  alterarSenha: (dados: { senha_atual: string; nova_senha: string }) => http<Corretor>('/autenticacao/eu/senha', json('PATCH', dados)),
};
