import { describe, expect, it } from 'vitest';
import { area, dinheiro, normalizarDecimal, precoPorMetro, rotuloCaracteristica, somaMensal, valorCaracteristica, valorPrincipal } from './formato';

describe('formatadores', () => {
  it('escolhe venda antes de locação e reconhece sob consulta', () => {
    expect(valorPrincipal({ valor_venda: '150000.00', valor_locacao: '2500.00' })).toEqual({ valor: 150000, tipo: 'venda' });
    expect(valorPrincipal({ valor_venda: null, valor_locacao: '2500.00' })).toEqual({ valor: 2500, tipo: 'locacao' });
    expect(valorPrincipal({ valor_venda: null, valor_locacao: null })).toBeNull();
  });
  it.each([0, -1, NaN, Infinity])('omite preço por área inválida %s', (valor) => { expect(precoPorMetro(120000, valor)).toBeNull(); });
  it('calcula preço por área e soma mensal', () => {
    expect(precoPorMetro(120000, 60)).toBe(2000);
    expect(somaMensal(2500, 300, null)).toBe(2800);
    expect(dinheiro('2500.00')).toContain('2.500');
    expect(area('120.00')).toBe('120 m²');
  });
  it('normaliza moeda brasileira para o decimal da API', () => {
    expect(normalizarDecimal('1.234,56')).toBe('1234.56');
    expect(normalizarDecimal('100,5')).toBe('100.50');
    expect(normalizarDecimal('abc')).toBe('abc');
  });
  it('humaniza características', () => {
    expect(rotuloCaracteristica('pe_direito')).toBe('Pe direito');
    expect(valorCaracteristica(null)).toBe('Sim');
    expect(valorCaracteristica('4 vagas')).toBe('4 vagas');
  });
});
