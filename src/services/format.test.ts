import { describe, expect, it } from 'vitest';
import { area, featureLabel, featureValue, money } from './format';
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
  it('mantém moeda e área', () => {
    expect(money(2500)).toContain('2.500');
    expect(area(120)).toBe('120 m²');
  });
});
