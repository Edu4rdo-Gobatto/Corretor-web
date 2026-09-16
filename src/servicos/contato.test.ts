import { describe, expect, it } from 'vitest';
import { esquemaContato, formatarTelefone, telefoneWhatsapp, urlWhatsapp } from './contato';

describe('contato do site', () => {
  it.each(['+1 202-555-0123', '+55 (65) 99999-8888', '5565999998888'])('preserva telefone internacional %s', (valor) => {
    expect(formatarTelefone(valor)).toBe(valor);
    expect(esquemaContato.safeParse({ nome: 'Ana', telefone: formatarTelefone(valor), consentimento: true }).success).toBe(true);
  });
  it('não transforma letras ou excesso de dígitos em telefone válido', () => {
    for (const valor of ['abc65999998888', '123456789012345678901']) expect(esquemaContato.safeParse({ nome: 'Ana', telefone: formatarTelefone(valor), consentimento: true }).success).toBe(false);
    expect(telefoneWhatsapp('+1 202-555-0123')).toBe('12025550123');
  });
  it('exige consentimento explícito e telefone válido', () => {
    expect(esquemaContato.safeParse({ nome: 'Ana', telefone: 'abc', consentimento: false }).success).toBe(false);
    expect(esquemaContato.safeParse({ nome: 'Ana', telefone: '65999998888', consentimento: true, email: '', mensagem: '' }).success).toBe(true);
  });
  it('normaliza DDD brasileiro sem duplicar DDI', () => {
    expect(telefoneWhatsapp('66 99999-9999')).toBe('5566999999999');
    expect(telefoneWhatsapp('+55 (66) 99999-9999')).toBe('5566999999999');
  });
  it('usa o código curto do imóvel e o telefone do corretor responsável', () => {
    const url = urlWhatsapp({ id: 42, titulo: 'Sala & loja', corretor: { nome: 'Ana', whatsapp: '5565999998888' } });
    expect(url).toContain('https://wa.me/5565999998888?text=');
    expect(decodeURIComponent(url)).toContain('Sala & loja (Ref. #42)');
  });
  it('formata telefone nacional e bloqueia o campo isca', () => {
    expect(formatarTelefone('65999998888')).toBe('(65) 99999-8888');
    expect(esquemaContato.safeParse({ nome: 'Ana', telefone: '(65) 99999-8888', consentimento: true, website: '' }).success).toBe(true);
    expect(esquemaContato.safeParse({ nome: 'Ana', telefone: '(65) 99999-8888', consentimento: true, website: 'spam' }).success).toBe(false);
  });
});
