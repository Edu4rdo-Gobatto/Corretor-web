import type { Imovel, StatusContato, StatusImovel } from '../tipos';

export const rotulosStatusImovel: Record<StatusImovel, string> = { DISPONIVEL: 'Disponível', RESERVADO: 'Reservado', VENDIDO: 'Vendido', ALUGADO: 'Alugado', RETIRADO: 'Retirado' };
/** Plural explícito: "Disponível" + "s" não é português. */
export const rotulosStatusImovelPlural: Record<StatusImovel, string> = { DISPONIVEL: 'Disponíveis', RESERVADO: 'Reservados', VENDIDO: 'Vendidos', ALUGADO: 'Alugados', RETIRADO: 'Retirados' };
/** "1 imóvel encontrado", "2 imóveis encontrados". */
export const plural = (quantidade: number, singular: string, formaPlural: string) => `${quantidade} ${quantidade === 1 ? singular : formaPlural}`;
export const rotulosStatusContato: Record<StatusContato, string> = { PENDENTE: 'Pendente', RESPONDIDO: 'Respondido', FINALIZADO: 'Finalizado' };
export const rotulosOrdenacao = { recentes: 'Mais recentes', valor_asc: 'Menor valor', valor_desc: 'Maior valor', area_asc: 'Menor área', area_desc: 'Maior área' } as const;

export const numero = (valor: string | number | null | undefined) => valor === null || valor === undefined || valor === '' ? null : Number(valor);
export const dinheiro = (valor: string | number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(valor));
export const dinheiroExato = (valor: string | number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
export const area = (valor: string | number) => `${new Intl.NumberFormat('pt-BR').format(Number(valor))} m²`;
export const data = (valor: string) => new Date(valor).toLocaleDateString('pt-BR');
export const dataCivil = (valor: string | null | undefined) => valor ? valor.slice(0, 10).split('-').reverse().join('/') : 'Não informado';
export const codigoImovel = (id: number) => `#${id}`;
export const mensagemErro = (erro: unknown) => erro instanceof Error ? erro.message : 'Não foi possível concluir. Tente novamente.';

/** Preço mostrado no site: venda tem prioridade; sem valores, o imóvel é "sob consulta". */
export function valorPrincipal(imovel: Pick<Imovel, 'valor_venda' | 'valor_locacao'>): { valor: number; tipo: 'venda' | 'locacao' } | null {
  if (imovel.valor_venda !== null) return { valor: Number(imovel.valor_venda), tipo: 'venda' };
  if (imovel.valor_locacao !== null) return { valor: Number(imovel.valor_locacao), tipo: 'locacao' };
  return null;
}

export const precoPorMetro = (valor: number, areaUtil: number) => {
  const resultado = valor / areaUtil;
  return Number.isFinite(valor) && Number.isFinite(areaUtil) && areaUtil > 0 && Number.isFinite(resultado) ? resultado : null;
};
export const somaMensal = (aluguel: number, condominio: number | null, iptu: number | null) => aluguel + (condominio ?? 0) + (iptu ?? 0);

/** Normaliza "1.234,56" ou "1234.5" para o decimal com duas casas que a API espera; devolve o texto original se não for número. */
export function normalizarDecimal(valor: string): string {
  let texto = valor.trim();
  if (/^\d{1,3}(?:\.\d{3})+,\d{1,2}$/.test(texto)) texto = texto.replaceAll('.', '');
  texto = texto.replace(',', '.');
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(texto)) return valor;
  const [inteiro, decimais = ''] = texto.split('.');
  return `${BigInt(inteiro)}.${decimais.padEnd(2, '0')}`;
}

export function rotuloCaracteristica(chave: string): string {
  const espacado = chave.replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim();
  return espacado ? espacado.charAt(0).toUpperCase() + espacado.slice(1) : chave;
}
export const valorCaracteristica = (valor: string | null) => valor && valor.trim() ? valor : 'Sim';
