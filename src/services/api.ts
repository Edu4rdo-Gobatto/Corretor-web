import type { Agent, AgentInput, CatalogQuery, Lead, LeadInput, Page, Property, PropertyInput, Session } from '../types';
import { buildCatalogQuery } from './catalog';
import { http, httpBlob, setAccessToken } from './http';
import type { RentalParty, RentalPartyInput, Lease, LeaseInput, RentalDocument, AcquisitionCommission } from '../pages/admin/rentalSchema';
const rentalQuery = (query: Record<string, string | number | boolean | undefined>) => new URLSearchParams(Object.entries(query).filter(([,v])=>v!==undefined&&v!=='').map(([k,v])=>[k,String(v)])).toString();

const json = (method: string, body?: unknown): RequestInit => ({ method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
const realApi = {
  listRentalParties: (query: {page?:number;limit?:number;search?:string;kind?:'OWNER'|'TENANT';active?:boolean}) => http<Page<RentalParty>>(`/admin/rental-parties?${rentalQuery(query)}`),
  getRentalParty: (id:string) => http<RentalParty>(`/admin/rental-parties/${id}`),
  saveRentalParty: (input:RentalPartyInput,id?:string) => http<RentalParty>(`/admin/rental-parties${id?`/${id}`:''}`,json(id?'PATCH':'POST',input)),
  listLeases: (query: {page?:number;limit?:number;search?:string;partyId?:string;status?:string}) => http<Page<Lease>>(`/admin/leases?${rentalQuery(query)}`),
  getLease: (id:string) => http<Lease>(`/admin/leases/${id}`),
  saveLease: (input:LeaseInput,id?:string) => http<Lease>(`/admin/leases${id?`/${id}`:''}`,json(id?'PATCH':'POST',input)),
  listRentalProperties: (page:number,search:string) => http<Page<Property>>(`/admin/properties?${rentalQuery({page,limit:15,search})}`),
  listRentalDocuments: (link: {partyId?:string;leaseId?:string}) => http<RentalDocument[]>(`/admin/rental-documents?${rentalQuery(link)}`),
  uploadRentalDocument: (file:File,link:{partyId?:string;leaseId?:string}) => {const body=new FormData();body.append('file',file);Object.entries(link).forEach(([k,v])=>{if(v)body.append(k,v);});return http<RentalDocument>('/admin/rental-documents',{method:'POST',body});},
  deleteRentalDocument: (id:string) => http<void>(`/admin/rental-documents/${id}`,json('DELETE')),
  downloadRentalDocument: (id:string) => httpBlob(`/admin/rental-documents/${id}/download`),
  getCommission: (leaseId:string) => http<AcquisitionCommission>(`/admin/finance/commissions/lease/${leaseId}`),
  createCommission: (input:{leaseId:string;installmentCount:number;firstDueDate:string;notes?:string}) => http<AcquisitionCommission>('/admin/finance/commissions',json('POST',input)),
  markCommissionPaid: (id:string,paymentNote='') => http<AcquisitionCommission>(`/admin/finance/commissions/installments/${id}/paid`,json('PATCH',{paymentNote})),
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
export const api = realApi;
