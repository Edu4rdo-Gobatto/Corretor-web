import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PropertyInput } from '../types';

let demo: typeof import('./demo')['demo'];
beforeEach(async () => { vi.resetModules(); demo = (await import('./demo')).demo; });

describe('explicit demonstration service', () => {
  it('filters and paginates only publicly available properties', async () => {
    const result = await demo.listProperties({page: 1, limit: 2, purpose: 'LOCACAO', city: 'Cuiabá', maxPrice: 10000});
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.length).toBeLessThanOrEqual(2);
    expect(result.items.every(p => p.status === 'DISPONIVEL' && p.price <= 10000 && p.addressCity === 'Cuiabá' && p.purpose === 'LOCACAO')).toBe(true);
    await demo.login('admin@demo.local', 'demo');
    const managed = await demo.listProperties({page: 1, limit: 100}, true);
    expect(managed.items.some(p => p.status !== 'DISPONIVEL')).toBe(true);
    const activeAgent = (await demo.listAgents()).items.find(a => a.role === 'AGENT')!;
    await demo.saveAgent({...activeAgent, active: false}, activeAgent.id);
    expect((await demo.listProperties({page: 1, limit: 100})).items.every(p => p.agentId !== activeAgent.id)).toBe(true);
  });
  it('creates property, receives consented contact, and lists the lead', async () => {
    await demo.login('admin@demo.local', 'demo');
    const template = (await demo.listProperties({page: 1, limit: 1})).items[0];
    const input: PropertyInput = {...template, title: 'Nova sala de teste'};
    const created = await demo.saveProperty(input);
    expect((await demo.getProperty(created.slug)).title).toBe(input.title);
    await expect(demo.createLead({propertyId: created.id, leadName: 'Ana', leadPhone: '65999999999', consentGiven: false})).rejects.toThrow();
    const lead = await demo.createLead({propertyId: created.id, leadName: 'Ana', leadPhone: '65999999999', consentGiven: true});
    expect((await demo.listLeads({propertyId: created.id})).items[0].id).toBe(lead.id);
    await demo.deleteProperty(created.id);
    expect((await demo.listLeads()).items.find(l => l.id === lead.id)?.propertyId).toBeNull();
  });
  it('enforces ownership and admin privileges, and revokes logout session', async () => {
    const admin = await demo.login('admin@demo.local', 'demo');
    const adminProperty = (await demo.listProperties({page: 1, limit: 100}, true)).items.find(p => p.agentId === admin.agent.id)!;
    await demo.login('agent@demo.local', 'demo');
    await expect(demo.deleteProperty(adminProperty.id)).rejects.toThrow();
    await expect(demo.getManagedProperty(adminProperty.id)).rejects.toThrow();
    await expect(demo.listAgents()).rejects.toThrow();
    await demo.logout();
    await expect(demo.refresh()).rejects.toThrow();
  });
  it('prevents disabling or demoting last active admin', async () => {
    const {agent} = await demo.login('admin@demo.local', 'demo');
    await expect(demo.saveAgent({...agent, active: false}, agent.id)).rejects.toThrow(/administrador/i);
    await expect(demo.saveAgent({...agent, role: 'AGENT'}, agent.id)).rejects.toThrow(/administrador/i);
  });
  it('supports media cover, order, removal and immutable reads', async () => {
    await demo.login('admin@demo.local', 'demo');
    const property = (await demo.listProperties({page: 1, limit: 1}, true)).items[0];
    await demo.embedMedia(property.id, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    let updated = await demo.getManagedProperty(property.id);
    const ids = updated.media.map(m => m.id).reverse();
    await demo.reorderMedia(property.id, ids);
    await demo.coverMedia(property.id, property.media[1].id);
    updated = await demo.getManagedProperty(property.id);
    expect(updated.media.map(m => m.id)).toEqual(ids);
    expect(updated.media.find(m => m.isCover)?.id).toBe(property.media[1].id);
    updated.title = 'mutated';
    expect((await demo.getManagedProperty(property.id)).title).toBe(property.title);
    await demo.deleteMedia(property.id, ids[0]);
    expect((await demo.getManagedProperty(property.id)).media).toHaveLength(ids.length - 1);
  });
  it('validates uploads and replaces a deleted cover with another image', async () => {
    await demo.login('admin@demo.local', 'demo');
    const property = (await demo.listProperties({page: 1, limit: 1}, true)).items[0];
    await expect(demo.uploadMedia(property.id, [new File(['bad'], 'bad.html', {type:'text/html'})])).rejects.toThrow();
    await expect(demo.embedMedia(property.id, 'https://malicious.example/video')).rejects.toThrow();
    await expect(demo.reorderMedia(property.id, [property.media[0].id])).rejects.toThrow();
    await demo.deleteMedia(property.id, property.media[0].id);
    const updated = await demo.getManagedProperty(property.id);
    expect(updated.media.filter(m => m.isCover)).toHaveLength(1);
    expect(updated.media.map(m => m.orderIndex)).toEqual([0,1]);
  });
  it('creates agents with private passwords and blocks deactivated authentication', async () => {
    await demo.login('admin@demo.local', 'demo');
    const created = await demo.saveAgent({name:'New Agent',email:'new@demo.local',password:'temporary',whatsappNumber:'5565999999999',creci:null,avatarUrl:null,role:'AGENT'});
    expect(created).not.toHaveProperty('password');
    await expect(demo.login(created.email, 'wrong')).rejects.toThrow();
    expect((await demo.login(created.email,'temporary')).agent.id).toBe(created.id);
    expect((await demo.refresh()).agent.id).toBe(created.id);
    await demo.login('admin@demo.local', 'demo');
    await demo.saveAgent({...created,active:false},created.id);
    await expect(demo.login(created.email,'temporary')).rejects.toThrow();
  });
});
