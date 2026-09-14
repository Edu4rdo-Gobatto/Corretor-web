import { describe, expect, it } from 'vitest';
import { commissionSchema, paymentSchema, partySchema, normalizeMoney, installmentPreview } from './rentalSchema';

const id = '11111111-1111-4111-8111-111111111111';
describe('validação da receita imobiliária', () => {
  it('normaliza moeda brasileira e conserva centavos nas parcelas mensais', () => {
    expect(normalizeMoney('1.234,56')).toBe('1234.56');
    expect(normalizeMoney('100,5')).toBe('100.50');
    expect(normalizeMoney('9999999999.99')).toBe('9999999999.99');
    expect(installmentPreview('100.00', 3, '2028-01-31')).toEqual([{ valor: '33.34', data: '2028-01-31' }, { valor: '33.33', data: '2028-02-29' }, { valor: '33.33', data: '2028-03-31' }]);
  });
  it('impede comissão sem vínculo, parcelas de zero e vencimentos impossíveis', () => {
    const input = { tipo_operacao: 'VENDA', contrato_id: '', imovel_id: id, cliente_id: id, valor_total: '100.00', quantidade_parcelas: 3, primeiro_vencimento: '2028-01-31', observacoes: '' };
    expect(commissionSchema.safeParse(input).success).toBe(true);
    for (const patch of [{ tipo_operacao: 'LOCACAO' }, { contrato_id: id }, { valor_total: '0.01' }, { quantidade_parcelas: 601 }, { primeiro_vencimento: '2026-02-30' }]) expect(commissionSchema.safeParse({ ...input, ...patch }).success).toBe(false);
  });
  it('exige confirmação e referência do comprovante na baixa', () => {
    expect(paymentSchema.safeParse({ confirmar_pagamento: true, observacao_pagamento: 'PIX comprovante 321' }).success).toBe(true);
    expect(paymentSchema.safeParse({ confirmar_pagamento: false, observacao_pagamento: 'PIX comprovante 321' }).success).toBe(false);
    expect(paymentSchema.safeParse({ confirmar_pagamento: true, observacao_pagamento: '     ' }).success).toBe(false);
  });
  it('valida dígitos verificadores e tipo de pessoa', () => {
    const input = { papel: 'LOCADOR', tipo_pessoa: 'PF', nome: 'Pessoa teste', cpf_cnpj: '529.982.247-25', email: '', telefone: '', endereco: '', data_nascimento: '', banco_nome: '', banco_agencia: '', banco_conta: '', chave_pix: '', observacoes: '', ativo: true };
    expect(partySchema.safeParse(input).success).toBe(true);
    expect(partySchema.safeParse({ ...input, cpf_cnpj: '11111111111' }).success).toBe(false);
    expect(partySchema.safeParse({ ...input, tipo_pessoa: 'PJ' }).success).toBe(false);
  });
});
