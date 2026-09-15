import type { CatalogQuery, PropertyType, PropertyPurpose } from '../types';
import { readCatalogQuery } from './catalog';

export const typeSegments: Record<PropertyType, string> = { SALA: 'salas', LOJA: 'lojas', GALPAO: 'galpoes', PREDIO: 'predios', TERRENO: 'terrenos' };
export const purposeSegments: Record<PropertyPurpose, string> = { LOCACAO: 'para-alugar', VENDA: 'para-comprar' };
export const routes = { home: '/', privacy: '/privacidade', devs: '/devs', admin: '/admin', login: '/admin/entrar', contacts: '/admin/contatos', profile: '/admin/perfil' };
export const propertyUrl = (slug: string) => `/imoveis/${encodeURIComponent(slug)}`;
export const catalogPaths = [ '/', ...Object.values(typeSegments).map(t => `/imoveis/${t}`), ...Object.values(purposeSegments).flatMap(p => [`/imoveis/${p}`, ...Object.values(typeSegments).map(t => `/imoveis/${p}/${t}`)]) ];
const fields = { type: 'tipo', purpose: 'finalidade', city: 'cidade', minPrice: 'preco-minimo', maxPrice: 'preco-maximo', page: 'pagina' } as const;
const internalKeys = new Set(['type', 'purpose', 'limit', ...Object.keys(fields), ...Object.values(fields)]);
export function readCatalogUrl(path: string): CatalogQuery | null {
  const url = new URL(path, 'https://local');
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  if (!catalogPaths.includes(pathname)) return null;
  const params = new URLSearchParams(url.search);
  for (const [key, translated] of Object.entries(fields)) if (params.has(translated)) params.set(key, params.get(translated)!);
  const segments = pathname.split('/');
  for (const [key, segment] of Object.entries(typeSegments)) if (segments.includes(segment)) params.set('type', key);
  for (const [key, segment] of Object.entries(purposeSegments)) if (segments.includes(segment)) params.set('purpose', key);
  return readCatalogQuery(params);
}
export function catalogUrl(query: Partial<CatalogQuery> = {}, extras = new URLSearchParams()): string {
  const segments = [query.purpose && Object.hasOwn(purposeSegments,query.purpose) && purposeSegments[query.purpose], query.type && Object.hasOwn(typeSegments,query.type) && typeSegments[query.type]].filter(Boolean);
  const path = segments.length ? `/imoveis/${segments.join('/')}` : '/';
  const params = new URLSearchParams();
  for (const [key, translated] of Object.entries(fields)) {
    if (key === 'type' && query.type && typeSegments[query.type]) continue;
    if (key === 'purpose' && query.purpose && purposeSegments[query.purpose]) continue;
    const value = query[key as keyof typeof fields];
    if (value !== undefined && value !== '' && !(key === 'page' && value === 1)) params.set(translated, String(value));
  }
  for (const [key, value] of extras) if (!internalKeys.has(key)) params.append(key, value);
  return path + (params.size ? `?${params}` : '');
}
export function normalizedUrl(path: string): string {
  const url = new URL(path, 'https://local');
  const catalog = readCatalogUrl(path);
  if (catalog) return catalogUrl(catalog, url.searchParams) + url.hash;
  let pathname = url.pathname.replace(/\/+$/, '') || '/';
  if (pathname === '/admin/login') pathname = routes.login;
  if (pathname === '/admin/leads') pathname = routes.contacts;
  const known = pathname === routes.privacy || pathname === routes.devs || /^\/imoveis\/[^/]+$/.test(pathname) || /^\/admin(?:\/(?:entrar|contatos|corretores|perfil|cadastros|comissoes|imoveis(?:\/(?:novo|[^/]+\/editar))?|(?:proprietarios|inquilinos|contratos)(?:\/[^/]+)?))?$/.test(pathname);
  return (known ? pathname : url.pathname) + url.search + url.hash;
}
