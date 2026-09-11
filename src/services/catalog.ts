import type { CatalogQuery, PropertyPurpose, PropertyType } from '../types';
import { propertyTypes } from './format';
export function readCatalogQuery(params: URLSearchParams): CatalogQuery {
  const requestedPage = Number(params.get('page') || 1);
  const query: CatalogQuery = { page: Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100000) : 1, limit: 9 };
  const type = params.get('type');
  const purpose = params.get('purpose');
  if (type && Object.hasOwn(propertyTypes, type)) query.type = type as PropertyType;
  if (purpose === 'VENDA' || purpose === 'LOCACAO') query.purpose = purpose as PropertyPurpose;
  if (params.get('city')?.trim()) query.city = params.get('city')!.trim().slice(0, 100);
  for (const field of ['minPrice', 'maxPrice'] as const) {
    const value = params.get(field);
    if (value && Number.isFinite(Number(value)) && Number(value) >= 0) query[field] = Math.min(Number(value), 9999999999.99);
  }
  return query;
}
export function buildCatalogQuery(query: Partial<CatalogQuery>): string {
  return new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined && value !== '').map(([key, value]) => [key, String(value)])).toString();
}
