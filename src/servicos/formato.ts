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

export type ChaveDestaque = 'quartos' | 'banheiros' | 'salas' | 'pisos' | 'vagas' | 'piscina' | 'solar' | 'lazer';
export interface DestaqueImovel { chave: ChaveDestaque; caracteristica_id: number; quantidade: number | null; rotulo: string }

// Imóvel não tem campos estruturados para cômodos: os destaques saem das características cadastradas, pelo nome.
const regrasDestaque: { chave: ChaveDestaque; padrao: RegExp; singular: string; plural: string; contagem: boolean; excluir?: RegExp }[] = [
  { chave: 'quartos', padrao: /quarto|dormit|suite/, singular: 'Quarto', plural: 'Quartos', contagem: true },
  { chave: 'banheiros', padrao: /banheiro|lavabo|\bwc\b/, singular: 'Banheiro', plural: 'Banheiros', contagem: true },
  { chave: 'salas', padrao: /\bsalas?\b/, singular: 'Sala', plural: 'Salas', contagem: true },
  { chave: 'pisos', padrao: /\bpisos?\b|andar|pavimento/, singular: 'Piso', plural: 'Pisos', contagem: true, excluir: /piso (elevado|vinilico|porcelanato|laminado|ceramico|frio)/ },
  { chave: 'vagas', padrao: /\bvagas?\b|garagem|estacionamento/, singular: 'Vaga', plural: 'Vagas', contagem: true },
  { chave: 'piscina', padrao: /piscina/, singular: 'Piscina', plural: 'Piscina', contagem: false },
  { chave: 'solar', padrao: /solar|fotovolt/, singular: 'Energia solar', plural: 'Energia solar', contagem: false },
  { chave: 'lazer', padrao: /lazer|churrasq|playground|academia|gourmet/, singular: 'Área de lazer', plural: 'Área de lazer', contagem: false },
];

const normalizar = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function destaquesImovel(caracteristicas: { caracteristica_id: number; nome: string; valor: string | null }[]): DestaqueImovel[] {
  const itens = caracteristicas.map((item) => ({ id: item.caracteristica_id, nome: normalizar(rotuloCaracteristica(item.nome)), valor: item.valor ?? '' }));
  return regrasDestaque.flatMap((regra) => {
    const item = itens.find(({ nome }) => regra.padrao.test(nome) && !regra.excluir?.test(nome));
    if (!item) return [];
    if (!regra.contagem) return [{ chave: regra.chave, caracteristica_id: item.id, quantidade: null, rotulo: regra.singular }];
    const numero = Number(item.valor.match(/\d+/)?.[0] ?? item.nome.match(/\d+/)?.[0]);
    const quantidade = Number.isFinite(numero) && numero > 0 ? numero : null;
    // Um único piso não é destaque; só vale quando há mais de um andar.
    if (regra.chave === 'pisos' && (quantidade === null || quantidade < 2)) return [];
    return [{ chave: regra.chave, caracteristica_id: item.id, quantidade, rotulo: quantidade === 1 ? regra.singular : regra.plural }];
  });
}
