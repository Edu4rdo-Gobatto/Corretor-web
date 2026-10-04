import { describe, expect, it } from 'vitest';
import { normalizarDecimal, precoPorMetro, somaMensal, valorPrincipal } from './formato';
import { catalogoExemplo } from '../seo/fixture';
import { slugImovelValido } from './urls';

describe('valores do imóvel', () => {
  it('soma aluguel, condomínio e IPTU tratando ausentes como zero', () => {
    expect(somaMensal(2500, 300, 100)).toBe(2900);
    expect(somaMensal(2500, null, null)).toBe(2500);
  });

  it('calcula o preço por metro e recusa área inválida', () => {
    expect(precoPorMetro(2500, 50)).toBe(50);
    expect(precoPorMetro(2500, 0)).toBeNull();
    expect(precoPorMetro(Number.NaN, 10)).toBeNull();
  });

  it('prioriza venda sobre locação e devolve null sem valor', () => {
    expect(valorPrincipal({ valor_venda: '900000.00', valor_locacao: '5000.00' })).toEqual({ valor: 900000, tipo: 'venda' });
    expect(valorPrincipal({ valor_venda: null, valor_locacao: '5000.00' })).toEqual({ valor: 5000, tipo: 'locacao' });
    expect(valorPrincipal({ valor_venda: null, valor_locacao: null })).toBeNull();
  });

  it('normaliza decimais digitados no formato brasileiro', () => {
    expect(normalizarDecimal('1.234,56')).toBe('1234.56');
    expect(normalizarDecimal('texto')).toBe('texto');
  });
});

describe('catálogo de exemplo', () => {
  const itens = catalogoExemplo();

  it('mantém o primeiro item compatível com o smoke do SSR', () => {
    expect(itens[0]).toMatchObject({ id: 100, titulo: 'Sala comercial no Centro', slug: 'sala-comercial-no-centro-100' });
  });

  it('tem ids e slugs únicos e válidos, terminando no id', () => {
    expect(new Set(itens.map((item) => item.id)).size).toBe(itens.length);
    expect(new Set(itens.map((item) => item.slug)).size).toBe(itens.length);
    for (const item of itens) {
      expect(slugImovelValido(item.slug)).toBe(true);
      expect(item.slug.endsWith(`-${item.id}`)).toBe(true);
    }
  });

  it('varia tipo, finalidade, cidade e valor, com um único valor principal por imóvel', () => {
    expect(new Set(itens.map((item) => item.tipo?.slug)).size).toBeGreaterThanOrEqual(5);
    expect(new Set(itens.map((item) => item.finalidade?.slug))).toEqual(new Set(['locacao', 'venda']));
    expect(new Set(itens.map((item) => item.cidade)).size).toBeGreaterThan(1);
    expect(new Set(itens.map((item) => item.valor_locacao ?? item.valor_venda)).size).toBe(itens.length);
    for (const item of itens) expect((item.valor_venda === null) !== (item.valor_locacao === null)).toBe(true);
  });
});
