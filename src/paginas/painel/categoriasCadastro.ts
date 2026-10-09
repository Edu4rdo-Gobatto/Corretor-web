import type { CategoriaCadastro, CategoriaContrato } from '../../tipos';

/** Cadastros em dois grupos: os de imóveis alimentam o catálogo público e o SSR; os de contratos, não. */
export const GRUPOS_CADASTRO = [
  { id: 'imoveis', rotulo: 'Imóveis', descricao: 'Tipos, finalidades e características usados nos anúncios e no catálogo público.', categorias: ['tipos-imovel', 'finalidades-imovel', 'caracteristicas'] },
  { id: 'contratos', rotulo: 'Contratos', descricao: 'Tipos de contrato e índices de reajuste usados só nos contratos de locação do painel.', categorias: ['tipos-contrato', 'indices-reajuste'] },
] as const satisfies readonly { id: string; rotulo: string; descricao: string; categorias: readonly CategoriaCadastro[] }[];

export const ROTULOS_CADASTRO: Record<CategoriaCadastro, string> = {
  'tipos-imovel': 'Tipos de imóvel', 'finalidades-imovel': 'Finalidades', caracteristicas: 'Características',
  'tipos-contrato': 'Tipos de contrato', 'indices-reajuste': 'Índices de reajuste',
};

export const categoriaCadastro = (valor: string | undefined): CategoriaCadastro | null =>
  valor && valor in ROTULOS_CADASTRO ? valor as CategoriaCadastro : null;
export const ehCategoriaContrato = (categoria: CategoriaCadastro): categoria is CategoriaContrato =>
  categoria === 'tipos-contrato' || categoria === 'indices-reajuste';
export const grupoDaCategoria = (categoria: CategoriaCadastro) => GRUPOS_CADASTRO.find((grupo) => (grupo.categorias as readonly CategoriaCadastro[]).includes(categoria))!;
export const periodicidade = (meses: number) => `A cada ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
