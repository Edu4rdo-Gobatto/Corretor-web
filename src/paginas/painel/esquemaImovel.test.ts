import { describe, expect, it } from 'vitest';
import { comClassificacoesDaFicha, opcoesCidade } from './esquemaImovel';
import type { Classificacao, Classificacoes } from '../../tipos';

const cidades: Classificacao[] = [
  { id: 1, nome: 'Juara', estado: 'MT', ativo: true },
  { id: 2, nome: 'Sinop', estado: 'MT', ativo: false },
  { id: 3, nome: 'Juara', estado: 'PR', ativo: true },
];
const lista: Classificacoes = { tipos: [], finalidades: [], caracteristicas: [], cidades };
const ficha = { tipo_id: 1, tipo: null, finalidade_id: 1, finalidade: null, caracteristicas: [], estado: 'MT' };

describe('Cidade no formulário do imóvel', () => {
  it('lista só as cidades ativas do estado escolhido', () => {
    expect(opcoesCidade(cidades, 'MT', '')).toEqual([{ valor: 'Juara', rotulo: 'Juara' }]);
    expect(opcoesCidade(cidades, 'PR', '').map((opcao) => opcao.valor)).toEqual(['Juara']);
  });

  it('mantém a cidade atual quando ela foi desativada, marcada como inativa', () => {
    expect(opcoesCidade(cidades, 'MT', 'Sinop')).toContainEqual({ valor: 'Sinop', rotulo: 'Sinop (inativa)' });
  });

  it('imóvel com cidade fora do cadastro continua com ela na lista, sem duplicar as cadastradas', () => {
    const fora = comClassificacoesDaFicha(lista, { ...ficha, cidade: 'Tabaporã' });
    expect(opcoesCidade(fora.cidades, 'MT', 'Tabaporã')).toContainEqual({ valor: 'Tabaporã', rotulo: 'Tabaporã (não cadastrada)' });
    expect(comClassificacoesDaFicha(lista, { ...ficha, cidade: 'JUARA' }).cidades).toHaveLength(cidades.length);
  });
});
