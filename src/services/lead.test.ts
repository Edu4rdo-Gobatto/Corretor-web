import { describe, expect, it } from 'vitest';
import { formatPhone, leadSchema, whatsappUrl, whatsappPhone } from './lead';
describe('lead contact', () => {
  it.each(['+1 202-555-0123', '+55 (65) 99999-8888', '5565999998888'])('preserva telefone internacional %s', value => {
    expect(formatPhone(value)).toBe(value);
    expect(leadSchema.safeParse({ leadName: 'Ana', leadPhone: formatPhone(value), consentGiven: true }).success).toBe(true);
  });
  it('não transforma letras ou excesso de dígitos em telefone válido', () => {
    for (const value of ['abc65999998888', '123456789012345678901']) {
      expect(leadSchema.safeParse({ leadName: 'Ana', leadPhone: formatPhone(value), consentGiven: true }).success).toBe(false);
    }
    expect(whatsappPhone('+1 202-555-0123')).toBe('12025550123');
  });
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
  it('formats Brazilian phone input without changing validation semantics', () => {
    expect(formatPhone('65999998888')).toBe('(65) 99999-8888');
    expect(leadSchema.safeParse({ leadName: 'Ana', leadPhone: formatPhone('65999998888'), consentGiven: true, website: '' }).success).toBe(true);
    expect(leadSchema.safeParse({ leadName: 'Ana', leadPhone: '(65) 99999-8888', consentGiven: true, website: 'spam' }).success).toBe(false);
  });
});
