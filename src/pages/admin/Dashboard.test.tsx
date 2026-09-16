import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { api } from '../../services/api';
import type { Commission, CommissionInstallment } from './rentalSchema';
import Dashboard from './Dashboard';

vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ agent: { name: 'Maria Silva' } }) }));
vi.mock('../../services/api', () => ({ api: { listProperties: vi.fn(), listLeads: vi.fn(), listLeases: vi.fn(), listCommissions: vi.fn() } }));
const page = { items: [], total: 123, page: 1, limit: 1, totalPages: 123 };
const rentalPage = { itens: [], total: 0, pagina: 1, limite: 100 };
const installment = (valor: string, status: CommissionInstallment['status'], ativo = true): CommissionInstallment => ({ id: `${valor}-${status}`, numero_parcela: 1, data_vencimento: '2026-09-01', valor, status, ativo, pago_em: null, observacao_pagamento: null });
const commission = (id: string, parcelas: CommissionInstallment[], ativo = true): Commission => ({ id, parcelas, ativo, tipo_operacao: 'VENDA', contrato_id: null, imovel_id: 'imovel', cliente_id: 'cliente', valor_total: '999.00', quantidade_parcelas: parcelas.length, observacoes: null });
const mount = () => render(<MemoryRouter><Dashboard /></MemoryRouter>);
const region = (name: string) => within(screen.getByRole('region', { name }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.listProperties).mockResolvedValue(page);
  vi.mocked(api.listLeads).mockResolvedValue({ ...page, total: 37 });
  vi.mocked(api.listLeases).mockResolvedValue({ ...rentalPage, total: 251 });
  vi.mocked(api.listCommissions).mockResolvedValue(rentalPage);
});
afterEach(cleanup);

describe('Dashboard', () => {
  it('uses API totals, active filters and a labeled rolling 30-day contact window', async () => {
    const before = Date.now();
    mount();
    expect(await region('Contratos ativos').findByText('251')).toBeInTheDocument();
    expect(region('Imóveis no portfólio').getByText('123')).toBeInTheDocument();
    for (const status of ['DISPONIVEL', 'RESERVADO', 'CONCLUIDO']) {
      expect(api.listProperties).toHaveBeenCalledWith({ page: 1, limit: 1, active: true, status }, true);
    }
    expect(api.listProperties).toHaveBeenCalledWith({ page: 1, limit: 1, active: true }, true);
    expect(api.listLeases).toHaveBeenCalledWith({ pagina: 1, limite: 1, status: 'ATIVO', ativo: true });
    expect(region('Contatos recebidos nos últimos 30 dias').getByText('37')).toBeInTheDocument();
    const query = vi.mocked(api.listLeads).mock.calls[0][0];
    expect(query).toMatchObject({ page: 1, limit: 5, active: true });
    expect(Date.parse(query?.createdFrom ?? '')).toBeGreaterThanOrEqual(before - 30 * 86400000);
    expect(Date.parse(query?.createdFrom ?? '')).toBeLessThanOrEqual(Date.now() - 30 * 86400000);
  });

  it('sums all commission pages in cents, excluding inactive commissions and installments', async () => {
    vi.mocked(api.listCommissions).mockImplementation(async ({ pagina } = {}) => ({
      ...rentalPage, pagina: pagina ?? 1, total: 201,
      itens: pagina === 1 ? Array.from({ length: 100 }, (_, i) => commission(String(i), [installment('0.10', 'PAGO'), installment('0.20', 'PENDENTE')]))
        : pagina === 2 ? [commission('later', [installment('0.01', 'ATRASADO'), installment('0.02', 'PAGO'), installment('900.00', 'PAGO', false)]), commission('inactive', [installment('800.00', 'PENDENTE')], false)]
          : [commission('last', [installment('0.03', 'PAGO')])],
    }));
    mount();
    expect(await screen.findByText('Valor pendente: R$ 20,01')).toBeInTheDocument();
    expect(screen.getByText('Valor recebido: R$ 10,05')).toBeInTheDocument();
    expect(api.listCommissions).toHaveBeenCalledTimes(3);
    expect(api.listCommissions).toHaveBeenLastCalledWith({ pagina: 3, limite: 100, ativo: true });
  });

  it('keeps other metrics available during loading and retries failed later pages without partial totals', async () => {
    let rejectPage!: (reason: Error) => void;
    vi.mocked(api.listCommissions)
      .mockResolvedValueOnce({ ...rentalPage, total: 101, itens: [commission('first', [installment('7.00', 'PAGO')])] })
      .mockImplementationOnce(() => new Promise((_, reject) => { rejectPage = reject; }));
    mount();
    expect(await region('Contratos ativos').findByText('251')).toBeInTheDocument();
    expect(region('Comissões').getByRole('status')).toBeInTheDocument();
    await waitFor(() => expect(api.listCommissions).toHaveBeenCalledTimes(2));
    rejectPage(new Error('Financeiro indisponível'));
    expect(await region('Comissões').findByRole('alert')).toHaveTextContent('Financeiro indisponível');
    expect(screen.queryByText(/Valor recebido:/)).not.toBeInTheDocument();
    fireEvent.click(region('Comissões').getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Valor recebido: R$ 0,00')).toBeInTheDocument();
    expect(api.listCommissions).toHaveBeenLastCalledWith({ pagina: 1, limite: 100, ativo: true });
    expect(api.listProperties).toHaveBeenCalledTimes(4);
    expect(api.listLeads).toHaveBeenCalledTimes(1);
    expect(api.listLeases).toHaveBeenCalledTimes(1);
  });

  it.each(['portfolio', 'status', 'contacts', 'leases'])('isolates and retries a failed %s metric', async failure => {
    let label = 'Imóveis no portfólio';
    if (failure === 'portfolio') vi.mocked(api.listProperties).mockRejectedValueOnce(new Error('Falha'));
    if (failure === 'status') {
      label = 'Disponíveis';
      vi.mocked(api.listProperties).mockResolvedValueOnce(page).mockRejectedValueOnce(new Error('Falha'));
    }
    if (failure === 'contacts') {
      label = 'Contatos recebidos nos últimos 30 dias';
      vi.mocked(api.listLeads).mockRejectedValueOnce(new Error('Falha'));
    }
    if (failure === 'leases') {
      label = 'Contratos ativos';
      vi.mocked(api.listLeases).mockRejectedValueOnce(new Error('Falha'));
    }
    mount();
    expect(await region(label).findByRole('alert')).toHaveTextContent('Falha');
    expect(await screen.findByText('Valor recebido: R$ 0,00')).toBeInTheDocument();
    fireEvent.click(region(label).getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(region(label).queryByRole('alert')).not.toBeInTheDocument());
    expect(await region(label).findByText(failure === 'contacts' ? '37' : failure === 'leases' ? '251' : '123')).toBeInTheDocument();
    expect(api.listCommissions).toHaveBeenCalledTimes(1);
  });
});
