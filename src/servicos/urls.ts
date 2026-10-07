import type { ConsultaCatalogo } from '../tipos';
import { lerConsultaCatalogo } from './catalogo';

// Segmentos amigáveis das classificações originais; outros tipos usam ?tipo=<slug>.
export const segmentosTipo: Record<string, string> = { 'sala-comercial': 'salas', loja: 'lojas', galpao: 'galpoes', predio: 'predios', terreno: 'terrenos' };
export const segmentosFinalidade: Record<string, string> = { locacao: 'para-alugar', venda: 'para-comprar' };
// Chaves antigas em inglês e maiúsculas ainda chegam por links externos e são redirecionadas.
const chavesLegadas: Record<string, string> = { SALA: 'sala-comercial', LOJA: 'loja', GALPAO: 'galpao', PREDIO: 'predio', TERRENO: 'terreno', LOCACAO: 'locacao', VENDA: 'venda' };
const aliasesLegados: Record<string, string> = { type: 'tipo', purpose: 'finalidade', city: 'cidade', minPrice: 'preco-minimo', maxPrice: 'preco-maximo', page: 'pagina' };
const parametrosCatalogo: Record<keyof Omit<ConsultaCatalogo, 'limite'>, string> = {
  tipos: 'tipo', finalidade: 'finalidade', cidade: 'cidade', bairro: 'bairro', valor_min: 'preco-minimo', valor_max: 'preco-maximo',
  area_min: 'area-minima', area_max: 'area-maxima', ordenar: 'ordenar', pagina: 'pagina',
};
const chavesInternas = new Set([...Object.keys(aliasesLegados), ...Object.values(parametrosCatalogo), 'limit', 'limite']);

export const rotas = {
  inicio: '/', privacidade: '/privacidade', devs: '/devs', painel: '/admin', entrar: '/admin/entrar',
  imoveis: '/admin/imoveis', contatos: '/admin/contatos', pessoas: '/admin/pessoas', perfil: '/admin/perfil',
};
export const urlImovel = (slug: string) => `/imoveis/${encodeURIComponent(slug)}`;
export const slugImovelValido = (slug: string) => /^[a-z0-9-]{1,240}$/.test(slug);
export const caminhosCatalogo = [
  '/', ...Object.values(segmentosTipo).map((tipo) => `/imoveis/${tipo}`),
  ...Object.values(segmentosFinalidade).flatMap((finalidade) => [`/imoveis/${finalidade}`, ...Object.values(segmentosTipo).map((tipo) => `/imoveis/${finalidade}/${tipo}`)]),
];

const slugPorSegmento = (segmentos: Record<string, string>, segmento: string) => Object.entries(segmentos).find(([, valor]) => valor === segmento)?.[0];

export function lerUrlCatalogo(caminho: string): ConsultaCatalogo | null {
  const url = new URL(caminho, 'https://local');
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  if (!caminhosCatalogo.includes(pathname)) return null;
  const parametros = new URLSearchParams(url.search);
  for (const [antigo, novo] of Object.entries(aliasesLegados)) {
    if (parametros.has(antigo) && !parametros.has(novo)) parametros.set(novo, parametros.get(antigo)!);
  }
  const finalidadeLegada = parametros.get('finalidade');
  if (finalidadeLegada && chavesLegadas[finalidadeLegada]) parametros.set('finalidade', chavesLegadas[finalidadeLegada]);
  const tipos = parametros.getAll('tipo').flatMap((valor) => valor.split(',')).map((valor) => chavesLegadas[valor.trim()] ?? valor.trim());
  parametros.delete('tipo');
  for (const tipo of tipos) parametros.append('tipo', tipo);
  for (const segmento of pathname.split('/')) {
    const tipo = slugPorSegmento(segmentosTipo, segmento);
    const finalidade = slugPorSegmento(segmentosFinalidade, segmento);
    if (tipo) parametros.set('tipo', tipo);
    if (finalidade) parametros.set('finalidade', finalidade);
  }
  return lerConsultaCatalogo(parametros);
}

export function urlCatalogo(consulta: Partial<ConsultaCatalogo> = {}, extras = new URLSearchParams()): string {
  // Só um tipo com nome amigável vira segmento; vários tipos seguem como ?tipo=a&tipo=b.
  // Ordenados como na leitura: uma URL fora de ordem seria normalizada por redirecionamento e remontaria a página.
  const tipos = [...new Set(consulta.tipos ?? [])].sort();
  const tipoSegmento = tipos.length === 1 ? segmentosTipo[tipos[0]] : undefined;
  const segmentos = [consulta.finalidade && segmentosFinalidade[consulta.finalidade], tipoSegmento].filter(Boolean);
  const caminho = segmentos.length ? `/imoveis/${segmentos.join('/')}` : '/';
  const parametros = new URLSearchParams();
  for (const [campo, nome] of Object.entries(parametrosCatalogo) as [keyof typeof parametrosCatalogo, string][]) {
    if (campo === 'tipos') {
      if (!tipoSegmento) for (const tipo of tipos) parametros.append(nome, tipo);
      continue;
    }
    if (campo === 'finalidade' && consulta.finalidade && segmentosFinalidade[consulta.finalidade]) continue;
    const valor = consulta[campo];
    if (valor === undefined || valor === '' || (campo === 'pagina' && valor === 1) || (campo === 'ordenar' && valor === 'recentes')) continue;
    parametros.set(nome, String(valor));
  }
  for (const [chave, valor] of extras) if (!chavesInternas.has(chave)) parametros.append(chave, valor);
  return caminho + (parametros.size ? `?${parametros}` : '');
}

const aliasesPainel: Record<string, string> = {
  '/admin/login': rotas.entrar, '/admin/leads': rotas.contatos, '/admin/clientes': rotas.pessoas,
  '/admin/proprietarios': rotas.pessoas, '/admin/inquilinos': rotas.pessoas,
};
const caminhoPainel = /^\/admin(?:\/(?:entrar|contatos|perfil|corretores(?:\/\d+)?|cadastros(?:\/(?:tipos-imovel|finalidades-imovel|caracteristicas)\/\d+)?|comissoes(?:\/\d+)?|pessoas(?:\/\d+)?|imoveis(?:\/(?:novo|\d+(?:\/editar)?))?|contratos(?:\/\d+)?))?$/;

export const urlFichaCorretor = (id: number, proprioId?: number) => id === proprioId ? rotas.perfil : `/admin/corretores/${id}`;

/** URL canônica: catálogo em português, aliases antigos do painel e sem barra final. */
export function urlNormalizada(caminho: string): string {
  const url = new URL(caminho, 'https://local');
  const catalogo = lerUrlCatalogo(caminho);
  if (catalogo) return urlCatalogo(catalogo, url.searchParams) + url.hash;
  let pathname = url.pathname.replace(/\/+$/, '') || '/';
  pathname = aliasesPainel[pathname] ?? pathname;
  const conhecido = pathname === rotas.privacidade || pathname === rotas.devs || /^\/imoveis\/[^/]+$/.test(pathname) || caminhoPainel.test(pathname);
  return (conhecido ? pathname : url.pathname) + url.search + url.hash;
}
