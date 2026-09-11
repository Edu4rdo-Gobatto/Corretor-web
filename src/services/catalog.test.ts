import { describe, expect, it } from 'vitest';
import { readCatalogQuery, buildCatalogQuery } from './catalog';

describe('catalog filters', () => {
  it('round trips filters and pagination through the URL', () => {
    const query = readCatalogQuery(new URLSearchParams('type=SALA&purpose=LOCACAO&city=Cuiab%C3%A1&minPrice=1000&maxPrice=9000&page=3'));
    expect(query).toEqual({ type: 'SALA', purpose: 'LOCACAO', city: 'Cuiabá', minPrice: 1000, maxPrice: 9000, page: 3, limit: 9 });
    expect(new URLSearchParams(buildCatalogQuery(query)).get('city')).toBe('Cuiabá');
  });
  it('ignores unknown enum values and invalid page numbers', () => {
    expect(readCatalogQuery(new URLSearchParams('type=OTHER&page=-5&minPrice=abc'))).toEqual({ page: 1, limit: 9 });
  });
});
