import { describe, expect, it, vi, afterEach } from 'vitest';
import { leaseSchema, partySchema } from '../pages/admin/rentalSchema';
import { api } from './api';

afterEach(() => vi.unstubAllGlobals());
describe('rental contracts', () => {
  it('rejects impossible dates and invalid payment terms', () => {
    expect(leaseSchema.safeParse({ reference:'A', propertyId:'x', ownerId:'x', tenantId:'x', startDate:'2026-02-30', endDate:'2026-01-01', rentAmount:'0', dueDay:32,status:'ACTIVE',notes:'' }).success).toBe(false);
  });
  it('rejects a tax identifier incompatible with person type', () => {
    expect(partySchema.safeParse({ kind:'OWNER', personType:'PF', name:'Maria',taxId:'123',email:'',phone:'',address:'',birthDate:'',notes:'',bankName:'',bankAgency:'',bankAccount:'',pixKey:'',active:true }).success).toBe(false);
  });
  it('preserves party filter and pagination', async () => {
    const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify({items:[],total:0,totalPages:0,page:2,limit:15})));
    vi.stubGlobal('fetch',fetcher);
    await api.listLeases({page:2,limit:15,partyId:'person'});
    expect(fetcher.mock.calls[0][0]).toContain('partyId=person');
    expect(fetcher.mock.calls[0][0]).toContain('page=2');
  });
});
