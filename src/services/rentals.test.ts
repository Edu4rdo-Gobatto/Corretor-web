import { describe, expect, it, vi, afterEach } from 'vitest';
import { leaseSchema } from '../pages/admin/rentalSchema';
import { rentalApi } from './rentals';

afterEach(() => vi.unstubAllGlobals());
describe('contrato HTTP de locações', () => {
  it('recusa datas impossíveis, aluguel zerado e parcelas fora do mês', () => {
    expect(leaseSchema.safeParse({ numero_contrato: 'LOC-001', imovel_id: 'x', locador_id: 'x', locatario_id: 'x', corretor_id: 'x', data_inicio: '2026-02-30', data_fim: '2026-01-01', valor_aluguel: '0', dia_vencimento: 32, status: 'ATIVO', ativo: true, observacoes: '' }).success).toBe(false);
  });
  it('envia filtros paginados e baixa no contrato português', async () => {
    const calls: { path: string; options?: RequestInit }[] = [];
    vi.stubGlobal('fetch', vi.fn((path: string, options?: RequestInit) => { calls.push({ path, options }); return Promise.resolve(new Response(JSON.stringify({ itens: [], total: 0, pagina: 2, limite: 15 }))); }));
    await rentalApi.listLeases({ pagina: 2, limite: 15, status: 'ATIVO' });
    expect(calls[0].path).toContain('/admin/contratos?pagina=2&limite=15&status=ATIVO');
    await rentalApi.payCommissionInstallment('parcela', { confirmar_pagamento: true, observacao_pagamento: 'Comprovante 321' });
    expect(calls[1].path).toContain('/admin/comissoes/parcelas/parcela/pagamento');
    expect(calls[1].options?.method).toBe('PATCH');
    expect(JSON.parse(String(calls[1].options?.body))).toEqual({ confirmar_pagamento: true, observacao_pagamento: 'Comprovante 321' });
  });
  it('envia somente campos permitidos ao criar e não expõe controle do Drive no formulário', async () => {
    const calls: RequestInit[] = [];
    vi.stubGlobal('fetch', vi.fn((_path: string, options: RequestInit) => { calls.push(options); return Promise.resolve(new Response(JSON.stringify({ id: 'contrato', observacoes: null }))); }));
    const id = '11111111-1111-4111-8111-111111111111';
    const form = leaseSchema.parse({ numero_contrato: 'LOC-001', imovel_id: id, locador_id: id, locatario_id: id, corretor_id: id, data_inicio: '2026-01-01', data_fim: '2027-01-01', valor_aluguel: '1.500,00', dia_vencimento: 31, taxa_administracao: '8', garantia_locaticia: 'Caução', indice_reajuste: 'IPCA', cobranca_iptu_condominio: 'Pagamento direto', status: 'ATIVO', ativo: true, observacoes: '' });
    await rentalApi.saveLease(form);
    const body = JSON.parse(String(calls[0].body)) as Record<string, unknown>;
    expect(body.valor_aluguel).toBe('1500.00'); expect(body.taxa_administracao).toBe('8.00');
    expect(body).not.toHaveProperty('ativo'); expect(body).not.toHaveProperty('url_pasta_drive'); expect(body).not.toHaveProperty('status_pasta_drive');
  });
});
