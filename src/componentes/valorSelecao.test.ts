import { describe, expect, it } from 'vitest';
import { valorDoCampo, valorParaCampo } from './valorSelecao';

describe('valor do seletor nos formulários', () => {
  it('texto vai e volta sem mudança, e vazio é vazio', () => {
    expect(valorDoCampo('12')).toBe('12');
    expect(valorDoCampo('')).toBe('');
    expect(valorDoCampo(undefined)).toBe('');
    expect(valorParaCampo('MT')).toBe('MT');
  });

  it('número usa 0 como "nenhum" (Contratos)', () => {
    expect(valorDoCampo(7, true)).toBe('7');
    expect(valorDoCampo(0, true)).toBe('');
    expect(valorDoCampo(Number.NaN, true)).toBe('');
    expect(valorParaCampo('7', true)).toBe(7);
    expect(valorParaCampo('', true)).toBe(0);
  });
});
