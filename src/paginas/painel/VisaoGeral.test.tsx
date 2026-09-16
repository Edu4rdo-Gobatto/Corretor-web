import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { api } from '../../servicos/api';
import type { Comissao, ParcelaComissao } from '../../servicos/locacoes';
import VisaoGeral from './VisaoGeral';

vi.mock('../../hooks/useSessao', () => ({ useSessao: () => ({ corretor: { nome: 'Maria Silva' } }) }));
vi.mock('../../servicos/api', () => ({ api: { listarFichas: vi.fn(), listarPessoas: vi.fn(), listarContratos: vi.fn(), listarComissoes: vi.fn() } }));
const pagina = { itens: [], total: 123, pagina: 1, limite: 1, total_paginas: 123 };
const paginaVazia = { itens: [], total: 0, pagina: 1, limite: 100, total_paginas: 0 };
const parcela = (valor: string, status: ParcelaComissao['status'], ativo = true): ParcelaComissao => ({ id: Number(valor.replace('.', '')) + (status === 'PAGO' ? 1000 : 0), numero_parcela: 1, data_vencimento: '2026-09-01', valor, status, ativo, pago_em: null, observacao_pagamento: null });
const comissao = (id: number, parcelas: ParcelaComissao[], ativo = true): Comissao => ({ id, parcelas, ativo, tipo_operacao: 'VENDA', contrato_id: null, imovel_id: 1, pessoa_id: 1, valor_total: '999.00', quantidade_parcelas: parcelas.length, observacoes: null });
const montar = () => render(<MemoryRouter><VisaoGeral /></MemoryRouter>);
const regiao = (nome: string) => within(screen.getByRole('region', { name: nome }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.listarFichas).mockResolvedValue(pagina as never);
  vi.mocked(api.listarPessoas).mockImplementation(async (filtros = {}) => ({ ...pagina, total: filtros.status_contato ? 9 : 37 }) as never);
  vi.mocked(api.listarContratos).mockResolvedValue({ ...paginaVazia, total: 251 } as never);
  vi.mocked(api.listarComissoes).mockResolvedValue(paginaVazia as never);
});
afterEach(cleanup);

describe('visão geral', () => {
  it('usa os totais da API com filtros ativos e a janela de 30 dias', async () => {
    const antes = Date.now();
    montar();
    expect(await regiao('Contratos ativos').findByText('251')).toBeInTheDocument();
    expect(regiao('Imóveis no portfólio').getByText('123')).toBeInTheDocument();
    expect(regiao('Contatos pendentes').getByText('9')).toBeInTheDocument();
    expect(regiao('Contatos recebidos nos últimos 30 dias').getByText('37')).toBeInTheDocument();
    for (const status of ['DISPONIVEL', 'RESERVADO', 'VENDIDO', 'ALUGADO']) expect(api.listarFichas).toHaveBeenCalledWith({ pagina: 1, limite: 1, ativo: true, status });
    expect(api.listarContratos).toHaveBeenCalledWith({ pagina: 1, limite: 1, status: 'ATIVO', ativo: true });
    const consulta = vi.mocked(api.listarPessoas).mock.calls.find(([filtros]) => filtros?.criado_desde)![0]!;
    expect(Date.parse(consulta.criado_desde!)).toBeGreaterThanOrEqual(antes - 30 * 86400000);
  });
  it('soma todas as páginas de comissões em centavos, ignorando inativas', async () => {
    vi.mocked(api.listarComissoes).mockImplementation(async ({ pagina: numero } = {}) => ({
      ...paginaVazia, pagina: numero ?? 1, total: 201, total_paginas: 3,
      itens: numero === 1 ? Array.from({ length: 100 }, (_, i) => comissao(i + 1, [parcela('0.10', 'PAGO'), parcela('0.20', 'PENDENTE')]))
        : numero === 2 ? [comissao(500, [parcela('0.01', 'ATRASADO'), parcela('0.02', 'PAGO'), parcela('900.00', 'PAGO', false)]), comissao(501, [parcela('800.00', 'PENDENTE')], false)]
          : [comissao(600, [parcela('0.03', 'PAGO')])],
    }) as never);
    montar();
    expect(await screen.findByText('Valor pendente: R$ 20,01')).toBeInTheDocument();
    expect(screen.getByText('Valor recebido: R$ 10,05')).toBeInTheDocument();
    expect(api.listarComissoes).toHaveBeenCalledTimes(3);
  });
  it('isola e repete uma métrica que falhou', async () => {
    vi.mocked(api.listarContratos).mockRejectedValueOnce(new Error('Falha'));
    montar();
    expect(await regiao('Contratos ativos').findByRole('alert')).toHaveTextContent('Falha');
    expect(await screen.findByText('Valor recebido: R$ 0,00')).toBeInTheDocument();
    fireEvent.click(regiao('Contratos ativos').getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(regiao('Contratos ativos').queryByRole('alert')).not.toBeInTheDocument());
    expect(await regiao('Contratos ativos').findByText('251')).toBeInTheDocument();
  });
});
