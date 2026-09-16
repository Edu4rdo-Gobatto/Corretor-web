import { describe, expect, it } from 'vitest';
import { esquemaComissao, esquemaContrato, esquemaPagamento, previaParcelas } from './esquemaLocacao';

describe('validação de locações e comissões', () => {
  it('conserva centavos nas parcelas mensais', () => {
    expect(previaParcelas('100,00', 3, '2028-01-31')).toEqual([{ valor: '33.34', data: '2028-01-31' }, { valor: '33.33', data: '2028-02-29' }, { valor: '33.33', data: '2028-03-31' }]);
    expect(previaParcelas('abc', 3, '2028-01-31')).toEqual([]);
  });
  it('impede comissão sem vínculo, parcelas de zero e vencimentos impossíveis', () => {
    const entrada = { tipo_operacao: 'VENDA', contrato_id: null, imovel_id: 4, pessoa_id: 9, valor_total: '100.00', quantidade_parcelas: 3, primeiro_vencimento: '2028-01-31', observacoes: '' };
    expect(esquemaComissao.safeParse(entrada).success).toBe(true);
    for (const alteracao of [{ tipo_operacao: 'LOCACAO' }, { contrato_id: 2 }, { valor_total: '0.01' }, { quantidade_parcelas: 601 }, { primeiro_vencimento: '2026-02-30' }, { pessoa_id: 0 }]) expect(esquemaComissao.safeParse({ ...entrada, ...alteracao }).success).toBe(false);
  });
  it('exige confirmação e referência do comprovante na baixa', () => {
    expect(esquemaPagamento.safeParse({ confirmar_pagamento: true, observacao_pagamento: 'PIX comprovante 321' }).success).toBe(true);
    expect(esquemaPagamento.safeParse({ confirmar_pagamento: false, observacao_pagamento: 'PIX comprovante 321' }).success).toBe(false);
  });
  it('recusa datas impossíveis, aluguel zerado, ids ausentes e normaliza moeda', () => {
    const base = { numero_contrato: 'LOC-001', imovel_id: 1, locador_id: 2, locatario_id: 3, corretor_id: 1, data_inicio: '2026-01-01', data_fim: '2027-01-01', valor_aluguel: '1.500,00', dia_vencimento: 31, taxa_administracao: '8', garantia_locaticia: 'Caução', indice_reajuste: 'IPCA', cobranca_iptu_condominio: 'Pagamento direto', status: 'ATIVO', ativo: true, observacoes: '' };
    const valores = esquemaContrato.parse(base);
    expect(valores.valor_aluguel).toBe('1500.00');
    expect(valores.taxa_administracao).toBe('8.00');
    for (const alteracao of [{ data_inicio: '2026-02-30' }, { data_fim: '2025-01-01' }, { valor_aluguel: '0' }, { dia_vencimento: 32 }, { imovel_id: 0 }]) expect(esquemaContrato.safeParse({ ...base, ...alteracao }).success).toBe(false);
  });
});
