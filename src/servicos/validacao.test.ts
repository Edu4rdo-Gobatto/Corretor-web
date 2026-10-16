import { describe, expect, it } from 'vitest';
import { documentoValido, somenteDigitos, telefoneValido } from './validacao';

describe('normalização e verificadores de documentos', () => {
  it.each([
    ['529.982.247-25', '52998224725'],
    ['04.252.011/0001-10', '04252011000110'],
  ])('normaliza e valida %s preservando zeros iniciais', (pontuado, digitos) => {
    expect(somenteDigitos(pontuado)).toBe(digitos);
    expect(documentoValido(somenteDigitos(pontuado))).toBe(true);
    expect(documentoValido(pontuado)).toBe(false);
  });

  it.each(['52998224715', '52998224724', '04252011000120', '04252011000111'])(
    'recusa alteração em qualquer dígito verificador: %s', (documento) => {
      expect(documentoValido(documento)).toBe(false);
    },
  );

  it.each(Array.from({ length: 10 }, (_, digito) => String(digito)))('recusa sequências repetidas de %s', (digito) => {
    expect(documentoValido(digito.repeat(11))).toBe(false);
    expect(documentoValido(digito.repeat(14))).toBe(false);
  });

  it.each(['', '5299822472', '529982247250', '0425201100011', '042520110001100', '5299822472a', ' 52998224725'])(
    'recusa vazio, comprimento incorreto ou conteúdo não numérico: %j', (documento) => {
      expect(documentoValido(documento)).toBe(false);
    },
  );

  it('remove caracteres não numéricos sem converter a string para número', () => {
    expect(somenteDigitos(' texto +00 (42).52/01-10 ')).toBe('0042520110');
    expect(somenteDigitos('sem números')).toBe('');
  });
});

describe('formatos de telefone aceitos pelo contrato atual', () => {
  it.each(['1132345678', '(11) 2345-6789', '11 5345.6789', '11987654321', '+55 (11) 98765-4321', '551132345678'])(
    'aceita fixo ou celular com DDD e DDI brasileiro opcional: %s', (telefone) => {
      expect(telefoneValido(telefone)).toBe(true);
    },
  );

  it.each(['', '98765-4321', '(01) 98765-4321', '1162345678', '11887654321', '+1 (202) 555-0100', '119876543210', '11 ramal 23456789', '11/3234-5678'])(
    'recusa formato ou quantidade de dígitos inválidos: %j', (telefone) => {
      expect(telefoneValido(telefone)).toBe(false);
    },
  );
});
