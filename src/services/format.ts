import type { PropertyType, PropertyStatus } from '../types';
export const propertyTypes: Record<PropertyType, string> = { GALPAO: 'Galpões', SALA: 'Salas comerciais', PREDIO: 'Prédios', LOJA: 'Lojas', TERRENO: 'Terrenos' };
export const propertyType: Record<PropertyType, string> = { GALPAO: 'Galpão', SALA: 'Sala comercial', PREDIO: 'Prédio', LOJA: 'Loja', TERRENO: 'Terreno' };
export const propertyStatuses: Record<PropertyStatus, string> = { DISPONIVEL: 'Disponível', RESERVADO: 'Reservado', CONCLUIDO: 'Concluído' };
export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
export const area = (value: number) => `${new Intl.NumberFormat('pt-BR').format(value)} m²`;
export const pricePerSquareMeter = (price: number, usableArea: number) => {
  const result = price / usableArea;
  return Number.isFinite(price) && Number.isFinite(usableArea) && usableArea > 0 && Number.isFinite(result) ? result : null;
};
export const monthlyRentTotal = (price: number, condoFee: number | null, iptuFee: number | null) => price + (condoFee ?? 0) + (iptuFee ?? 0);
export const date = (value: string) => new Date(value).toLocaleDateString('pt-BR');
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.';
export function featureLabel(key: string): string {
  const spaced = key.replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
export function featureValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number') return new Intl.NumberFormat('pt-BR').format(value);
  if (typeof value === 'string') return value.trim() ? value : '—';
  if (Array.isArray(value)) {
    const parts = value.map(featureValue).filter(part => part !== '—');
    return parts.length ? parts.join(', ') : '—';
  }
  if (typeof value === 'object') {
    const parts = Object.values(value as Record<string, unknown>).map(featureValue).filter(part => part !== '—');
    return parts.length ? parts.join(', ') : '—';
  }
  return '—';
}
