import { describe, expect, it } from 'vitest';
import { catalogPaths, catalogUrl, isValidPropertySlug, normalizedUrl, readCatalogUrl, typeSegments, purposeSegments } from './urls';
import type { PropertyType, PropertyPurpose } from '../types';

describe('public URLs', () => {
  for (const type of [undefined, ...Object.keys(typeSegments)] as (PropertyType | undefined)[]) {
    for (const purpose of [undefined, ...Object.keys(purposeSegments)] as (PropertyPurpose | undefined)[]) {
      it(`round trips ${type} / ${purpose} and complementary filters`, () => {
        const query = { type, purpose, city: 'Cuiabá', minPrice: 0, maxPrice: 5000, page: 2, limit: 9 };
        expect(readCatalogUrl(catalogUrl(query))).toEqual(query);
      });
    }
  }
  it('normalizes legacy links with Portuguese precedence and tracking', () => {
    expect(normalizedUrl('/?purpose=VENDA&type=GALPAO&city=X&cidade=Juara&page=3&pagina=2&utm_source=wa')).toBe('/imoveis/para-comprar/galpoes?cidade=Juara&pagina=2&utm_source=wa');
    expect(normalizedUrl('/imoveis/para-alugar/salas/?purpose=VENDA&type=LOJA&limit=9&pagina=1')).toBe('/imoveis/para-alugar/salas');
  });
  it('omits invalid and empty filters and stays idempotent', () => {
    expect(normalizedUrl('/?type=%3Cinvalid%3E&city=&minPrice=abc&page=-2')).toBe('/');
    for (const path of catalogPaths) expect(normalizedUrl(normalizedUrl(path))).toBe(path);
  });
  it('recognizes only supported catalog paths and keeps property slugs', () => {
    expect(readCatalogUrl('/imoveis/para-alugar/casas')).toBeNull();
    expect(readCatalogUrl('/imoveis/sala-uuid')).toBeNull();
    expect(normalizedUrl('/imoveis/sala-uuid/')).toBe('/imoveis/sala-uuid');
    expect(normalizedUrl('/unknown/')).toBe('/unknown/');
  });
  it('accepts only API-compatible property slugs', () => {
    expect(isValidPropertySlug('loja-centro-123')).toBe(true);
    expect(isValidPropertySlug('lojasOR 1=1--]')).toBe(false);
    expect(isValidPropertySlug('a'.repeat(241))).toBe(false);
  });
  it('redirects admin aliases and preserves record identifiers', () => {
    expect(normalizedUrl('/admin/login/')).toBe('/admin/entrar');
    expect(normalizedUrl('/admin/leads?pagina=2')).toBe('/admin/contatos?pagina=2');
    expect(normalizedUrl('/admin/contratos/id/')).toBe('/admin/contratos/id');
    expect(normalizedUrl('/admin/perfil/')).toBe('/admin/perfil');
  });
  it('keeps the developers page as a known static route', () => {
    expect(normalizedUrl('/devs')).toBe('/devs');
    expect(normalizedUrl('/devs/')).toBe('/devs');
  });
});
