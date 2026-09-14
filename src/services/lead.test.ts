import { describe, expect, it } from 'vitest';
import { leadSchema, whatsappUrl, whatsappPhone } from './lead';
describe('lead contact', () => {
  it('requires explicit consent and a valid phone', () => {
    expect(leadSchema.safeParse({ leadName: 'Ana', leadPhone: 'abc', consentGiven: false }).success).toBe(false);
    expect(leadSchema.safeParse({ leadName: 'Ana', leadPhone: '65999998888', consentGiven: true, leadEmail: '', message: '' }).success).toBe(true);
  });
  it('normaliza DDD brasileiro sem duplicar DDI',()=>{expect(whatsappPhone('66 99999-9999')).toBe('5566999999999');expect(whatsappPhone('+55 (66) 99999-9999')).toBe('5566999999999');expect(whatsappPhone('55 99999-9999')).toBe('5555999999999');});
  it('encodes the property reference and uses the responsible agent phone', () => {
    const url = whatsappUrl({ title: 'Sala & loja', id: '123', agent: { name: 'Ana', whatsappNumber: '5565999998888' } });
    expect(url).toContain('https://wa.me/5565999998888?text=');
    expect(decodeURIComponent(url)).toContain('Sala & loja (Ref: 123)');
  });
});
