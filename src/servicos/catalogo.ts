import type { Classificacao, Classificacoes, ConsultaCatalogo, Ordenacao } from '../tipos';

export const ORDENACOES: Ordenacao[] = ['recentes', 'valor_asc', 'valor_desc', 'area_asc', 'area_desc'];
export const LIMITE_CATALOGO = 9;
const SLUG = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,119}$/;

const numeroPositivo = (valor: string | null, maximo: number) => {
  if (!valor || !Number.isFinite(Number(valor)) || Number(valor) < 0) return undefined;
  return Math.min(Number(valor), maximo);
};

/** Lê os filtros do catálogo a partir dos parâmetros em português da URL. */
export function lerConsultaCatalogo(parametros: URLSearchParams): ConsultaCatalogo {
  const paginaPedida = Number(parametros.get('pagina') || 1);
  const consulta: ConsultaCatalogo = { pagina: Number.isInteger(paginaPedida) && paginaPedida > 0 ? Math.min(paginaPedida, 100000) : 1, limite: LIMITE_CATALOGO };
  const tipo = parametros.get('tipo');
  const finalidade = parametros.get('finalidade');
  if (tipo && SLUG.test(tipo)) consulta.tipo = tipo;
  if (finalidade && SLUG.test(finalidade)) consulta.finalidade = finalidade;
  for (const campo of ['cidade', 'bairro'] as const) {
    const valor = parametros.get(campo)?.trim();
    if (valor) consulta[campo] = valor.slice(0, 100);
  }
  const valorMin = numeroPositivo(parametros.get('preco-minimo'), 9999999999.99);
  const valorMax = numeroPositivo(parametros.get('preco-maximo'), 9999999999.99);
  const areaMin = numeroPositivo(parametros.get('area-minima'), 99999999.99);
  const areaMax = numeroPositivo(parametros.get('area-maxima'), 99999999.99);
  if (valorMin !== undefined) consulta.valor_min = valorMin;
  if (valorMax !== undefined) consulta.valor_max = valorMax;
  if (areaMin !== undefined) consulta.area_min = areaMin;
  if (areaMax !== undefined) consulta.area_max = areaMax;
  const ordenar = parametros.get('ordenar');
  if (ordenar && ORDENACOES.includes(ordenar as Ordenacao) && ordenar !== 'recentes') consulta.ordenar = ordenar as Ordenacao;
  return consulta;
}

/** Monta a query string com os nomes que a API espera, omitindo vazios. */
export const montarParametros = (valores: object) =>
  new URLSearchParams(Object.entries(valores).filter(([, valor]) => valor !== undefined && valor !== null && valor !== '').map(([chave, valor]) => [chave, String(valor)])).toString();

/** Aceita o slug da classificação ou o id numérico. */
export function idClassificacao(valor: string | undefined, itens: Classificacao[]): number | undefined {
  if (!valor) return undefined;
  return itens.find((item) => item.slug === valor || String(item.id) === valor)?.id;
}

/** Traduz os filtros do site para a API; devolve null quando o tipo ou a finalidade não existem. */
export function consultaParaApi(consulta: ConsultaCatalogo & { busca?: string }, classificacoes: Classificacoes): string | null {
  const tipo_id = idClassificacao(consulta.tipo, classificacoes.tipos);
  const finalidade_id = idClassificacao(consulta.finalidade, classificacoes.finalidades);
  if ((consulta.tipo && !tipo_id) || (consulta.finalidade && !finalidade_id)) return null;
  return montarParametros({
    pagina: consulta.pagina, limite: consulta.limite, tipo_id, finalidade_id, cidade: consulta.cidade, bairro: consulta.bairro,
    valor_min: consulta.valor_min, valor_max: consulta.valor_max, area_min: consulta.area_min, area_max: consulta.area_max,
    ordenar: consulta.ordenar, busca: consulta.busca,
  });
}
