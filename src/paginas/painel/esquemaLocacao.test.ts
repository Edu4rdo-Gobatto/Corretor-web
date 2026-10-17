import { describe, expect, it } from 'vitest';
import { periodoPadraoContrato } from './esquemaLocacao';

describe('período padrão do contrato novo', () => {
  it('começa hoje e termina na mesma data um ano depois', () => {
    expect(periodoPadraoContrato(new Date(2026, 9, 17))).toEqual({ data_inicio: '2026-10-17', data_fim: '2027-10-17' });
    expect(periodoPadraoContrato(new Date(2026, 11, 31))).toEqual({ data_inicio: '2026-12-31', data_fim: '2027-12-31' });
  });

  it('29 de fevereiro termina em 28 de fevereiro do ano seguinte', () => {
    expect(periodoPadraoContrato(new Date(2028, 1, 29))).toEqual({ data_inicio: '2028-02-29', data_fim: '2029-02-28' });
  });

  it('usa a data local, sem virar o dia por causa do fuso', () => {
    expect(periodoPadraoContrato(new Date(2026, 9, 17, 23, 30)).data_inicio).toBe('2026-10-17');
  });
});
