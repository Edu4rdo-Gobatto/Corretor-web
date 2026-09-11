import type { Agent, AgentInput, CatalogQuery, Lead, LeadInput, Page, Property, PropertyInput, Session } from '../types';
import { isDemo } from '../config/brand';
import { buildCatalogQuery } from './catalog';
import { http, setAccessToken } from './http';

const json = (method: string, body?: unknown): RequestInit => ({ method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
const realApi = {
  listProperties: (query: CatalogQuery, managed = false) => http<Page<Property>>(`${managed ? '/admin' : ''}/properties?${buildCatalogQuery(query)}`),
  getProperty: (slug: string) => http<Property>(`/properties/${encodeURIComponent(slug)}`),
  getManagedProperty: (id: string) => http<Property>(`/admin/properties/${id}`),
  saveProperty: (input: PropertyInput, id?: string) => http<Property>(`/properties${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST', input)),
  deleteProperty: (id: string) => http<void>(`/properties/${id}`, json('DELETE')),
  createLead: (input: LeadInput) => http<Lead>('/leads', json('POST', input)),
  listLeads: (query: { page?: number; limit?: number; search?: string; propertyId?: string } = {}) => http<Page<Lead>>(`/admin/leads?${new URLSearchParams(Object.entries(query).filter(([,value])=> value !== undefined && value !== '').map(([key,value])=>[key,String(value)]))}`),
  deleteLead: (id: string) => http<void>(`/admin/leads/${id}`, json('DELETE')),
  listAgents: (page = 1, limit = 20) => http<Page<Agent>>(`/agents?page=${page}&limit=${limit}`),
  saveAgent: (input: AgentInput, id?: string) => http<Agent>(`/agents${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST', input)),
  uploadMedia: (propertyId: string, files: File[]) => {
    const form = new FormData(); files.forEach(file => form.append('files', file));
    return http<unknown>(`/properties/${propertyId}/media`, { method: 'POST', body: form });
  },
  embedMedia: (propertyId: string, url: string) => http<unknown>(`/properties/${propertyId}/media/embed`, json('POST', { url })),
  reorderMedia: (propertyId: string, mediaIds: string[]) => http<unknown>(`/properties/${propertyId}/media/reorder`, json('PATCH', { mediaIds })),
  coverMedia: (propertyId: string, mediaId: string) => http<unknown>(`/properties/${propertyId}/media/${mediaId}/cover`, json('PATCH')),
  deleteMedia: (propertyId: string, mediaId: string) => http<void>(`/properties/${propertyId}/media/${mediaId}`, json('DELETE')),
  login: async (email: string, password: string) => {
    const session = await http<Session>('/auth/login', json('POST', { email, password }), false);
    setAccessToken(session.accessToken); return session;
  },
  refresh: async () => {
    const session = await http<Session>('/auth/refresh', json('POST'), false);
    setAccessToken(session.accessToken); return session;
  },
  logout: async () => { await http<void>('/auth/logout', json('POST'), false); setAccessToken(null); },
  me: () => http<Agent>('/auth/me'),
};
// The demo module is only loaded when explicitly enabled, never on a network error.
const demoModule = isDemo ? import('./demo') : null;
export const api: typeof realApi = isDemo ? new Proxy(realApi, {
  get(_target, key: keyof typeof realApi) {
    return async (...args: unknown[]) => {
      const { demo } = await demoModule!;
      const method = demo[key] as (...parameters: unknown[]) => Promise<unknown>;
      return method(...args);
    };
  },
}) : realApi;
