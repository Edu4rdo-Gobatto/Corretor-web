import type { PropertyType, PropertyStatus } from '../types';
export const propertyTypes: Record<PropertyType, string> = { GALPAO: 'Galpões', SALA: 'Salas comerciais', PREDIO: 'Prédios', LOJA: 'Lojas', TERRENO: 'Terrenos' };
export const propertyType: Record<PropertyType, string> = { GALPAO: 'Galpão', SALA: 'Sala comercial', PREDIO: 'Prédio', LOJA: 'Loja', TERRENO: 'Terreno' };
export const propertyStatuses: Record<PropertyStatus, string> = { DISPONIVEL: 'Disponível', RESERVADO: 'Reservado', CONCLUIDO: 'Concluído' };
export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
export const area = (value: number) => `${new Intl.NumberFormat('pt-BR').format(value)} m²`;
export const date = (value: string) => new Date(value).toLocaleDateString('pt-BR');
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.';
