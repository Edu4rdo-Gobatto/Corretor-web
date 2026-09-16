import { describe, expect, it } from 'vitest';
import { area, featureLabel, featureValue, money, monthlyRentTotal, pricePerSquareMeter } from './format';
describe('featureLabel', () => {
  it('humaniza snake_case e camelCase', () => {
    expect(featureLabel('pe_direito')).toBe('Pe direito');
    expect(featureLabel('numeroVagas')).toBe('Numero Vagas');
  });
});
describe('featureValue', () => {
  it('formata booleanos, nulos e números', () => {
    expect(featureValue(true)).toBe('Sim');
    expect(featureValue(false)).toBe('Não');
    expect(featureValue(null)).toBe('—');
    expect(featureValue(1500)).toBe(new Intl.NumberFormat('pt-BR').format(1500));
  });
  it('formata listas e objetos sem JSON cru', () => {
    expect(featureValue(['a', 'b'])).toBe('a, b');
    expect(featureValue({ docas: 4, peDireito: 10 })).toBe('4, 10');
    expect(featureValue({})).toBe('—');
  });
});
describe('formatadores existentes', () => {
  it.each([0, -1, NaN, Infinity, -Infinity, Number.MIN_VALUE])('omite preço por área inválida %s', value => {
    expect(pricePerSquareMeter(120000, value)).toBeNull();
  });
  it.each([NaN, Infinity, -Infinity])('omite preço não finito %s', value => {
    expect(pricePerSquareMeter(value, 60)).toBeNull();
  });
  it('mantém moeda e área', () => {
    expect(money(2500)).toContain('2.500');
    expect(area(120)).toBe('120 m²');
  });
  it('calcula preço por área e total mensal sem valores ausentes inválidos', () => {
    expect(pricePerSquareMeter(120000, 60)).toBe(2000);
    expect(pricePerSquareMeter(120000, 0)).toBeNull();
    expect(monthlyRentTotal(2500, 300, null)).toBe(2800);
  });
});
