import { describe, expect, it } from 'vitest';
import { esquemaContato, formatarTelefone, telefoneWhatsapp, urlWhatsapp } from './contato';
import { documentoValido, telefoneValido } from './validacao';

const valido = { nome: 'Maria Souza', telefone: '(65) 99999-0000', email: '', mensagem: '', consentimento: true };

describe('esquemaContato', () => {
  it('aceita um contato completo com consentimento', () => {
    expect(esquemaContato.safeParse(valido).success).toBe(true);
  });

  it('exige o consentimento LGPD', () => {
    const resultado = esquemaContato.safeParse({ ...valido, consentimento: false });
    expect(resultado.success).toBe(false);
  });

  it('recusa telefone sem DDD e e-mail malformado', () => {
    expect(esquemaContato.safeParse({ ...valido, telefone: '99999-0000' }).success).toBe(false);
    expect(esquemaContato.safeParse({ ...valido, email: 'sem-arroba' }).success).toBe(false);
  });

  it('recusa o campo isca preenchido por robôs', () => {
    expect(esquemaContato.safeParse({ ...valido, website: 'http://spam.example' }).success).toBe(false);
  });
});

describe('telefone', () => {
  it('valida celular e fixo brasileiros, com ou sem +55', () => {
    expect(telefoneValido('(65) 99999-0000')).toBe(true);
    expect(telefoneValido('+55 65 3322-1100')).toBe(true);
    expect(telefoneValido('12345')).toBe(false);
    expect(telefoneValido('(65) 09999-0000')).toBe(false);
  });

  it('aplica a máscara nacional e preserva números internacionais', () => {
    expect(formatarTelefone('65999990000')).toBe('(65) 99999-0000');
    expect(formatarTelefone('+1 202 555 0100')).toBe('+1 202 555 0100');
  });

  it('monta o link do WhatsApp com DDI e o texto codificado', () => {
    expect(telefoneWhatsapp('(65) 99999-0000')).toBe('5565999990000');
    const link = urlWhatsapp({ id: 7, titulo: 'Galpão & Doca', corretor: { nome: 'Ana', whatsapp: '65999990000' } });
    expect(link.startsWith('https://wa.me/5565999990000?text=')).toBe(true);
    expect(decodeURIComponent(link.split('text=')[1])).toBe('Olá Ana, tenho interesse no imóvel Galpão & Doca (Ref. #7).');
  });
});

describe('documentoValido', () => {
  it('confere os dígitos verificadores de CPF e CNPJ', () => {
    expect(documentoValido('11144477735')).toBe(true);
    expect(documentoValido('11144477736')).toBe(false);
    expect(documentoValido('11222333000181')).toBe(true);
    expect(documentoValido('11111111111')).toBe(false);
  });
});
