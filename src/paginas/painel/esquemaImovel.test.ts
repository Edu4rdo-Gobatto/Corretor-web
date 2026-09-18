import { describe, expect, it } from 'vitest';
import { comClassificacoesDaFicha, dadosParaApi, esquemaImovel, imovelVazio } from './esquemaImovel';
import { classificacoesExemplo, imovelExemplo } from '../../seo/fixture';

const valido = { ...imovelVazio, titulo: 'Sala comercial', tipo_id: '1', finalidade_id: '3', valor_locacao: 2000, area_util: 40, area_total: 50, logradouro: 'Rua Central', numero: '100', cidade: 'Cuiabá', bairro: 'Centro', descricao: 'Sala com iluminação natural.' };
describe('validação do cadastro de imóveis', () => {
  it('aceita dados completos, valores opcionais vazios e ficha interna', () => {
    expect(esquemaImovel.safeParse(valido).success).toBe(true);
    expect(esquemaImovel.safeParse({ ...valido, valor_locacao: null, valor_venda: null, proprietario: { id: 3, nome: 'Dona' }, exclusividade: true, exclusividade_ate: '2027-01-31', chaves: 'Com o zelador' }).success).toBe(true);
  });
  it.each([{ area_util: 0 }, { area_total: 10 }, { valor_venda: -1 }, { valor_venda: 12.345 }, { estado: 'XX' }, { titulo: '  ' }, { tipo_id: '' }, { exclusividade_ate: '2026-02-30' }, { caracteristicas: [{ caracteristica_id: '', valor: '' }] }, { caracteristicas: [{ caracteristica_id: '5', valor: 'x'.repeat(501) }] }])('rejeita %o', (invalido) => {
    expect(esquemaImovel.safeParse({ ...valido, ...invalido }).success).toBe(false);
  });
  it('converte para o corpo da API com decimais em texto e vazios como null', () => {
    const dados = dadosParaApi({ ...valido, proprietario: { id: 3, nome: 'Dona' }, caracteristicas: [{ caracteristica_id: '5', valor: ' 4 vagas ' }, { caracteristica_id: '6', valor: '' }] }, 1);
    expect(dados).toMatchObject({ tipo_id: 1, finalidade_id: 3, valor_venda: null, valor_locacao: '2000.00', area_util: '40.00', area_total: '50.00', cep: null, complemento: null, corretor_id: 1, proprietario_id: 3, exclusividade_ate: null, chaves: null });
    expect(dados.caracteristicas).toEqual([{ caracteristica_id: 5, valor: '4 vagas' }, { caracteristica_id: 6, valor: null }]);
    expect(dadosParaApi(valido)).not.toHaveProperty('corretor_id');
  });
});

describe('classificações do formulário', () => {
  it('mantém a lista pública e inclui como inativos os valores atuais que não vieram nela', () => {
    const publica = { ...classificacoesExemplo, tipos: classificacoesExemplo.tipos.filter((item) => item.id !== 1), caracteristicas: [] };
    const resultado = comClassificacoesDaFicha(publica, imovelExemplo);
    expect(resultado.tipos).toContainEqual({ id: 1, nome: 'Salas comerciais', ativo: false });
    expect(resultado.finalidades).toBe(publica.finalidades);
    expect(resultado.caracteristicas).toEqual([{ id: 5, nome: 'Acessibilidade', ativo: false }]);
  });
});
