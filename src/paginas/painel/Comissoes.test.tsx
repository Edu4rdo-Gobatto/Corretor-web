import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Comissoes from './Comissoes';
import { api } from '../../servicos/api';
import { simularSessao } from './sessaoTeste';
import type { Contrato } from '../../servicos/locacoes';

vi.mock('../../hooks/useSessao', () => ({ useSessao: vi.fn() }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('consulta diretamente api.obterContrato ao selecionar contrato no editor de comissão', async () => {
  simularSessao();

  vi.spyOn(api, 'listarComissoes').mockResolvedValue({
    itens: [],
    total: 0,
    pagina: 1,
    limite: 10,
    total_paginas: 0,
  });

  vi.spyOn(api, 'listarContratos').mockResolvedValue({
    itens: [
      {
        id: 99,
        numero_contrato: 'CTR-2026-99',
        tipo_locacao: 'PADRAO',
        imovel_id: 105,
        imovel_titulo: 'Galpão Alpha',
        locador_id: 1,
        locatario_id: 2,
        corretor_id: 3,
        ativo: true,
      } as unknown as Contrato,
    ],
    total: 1,
    pagina: 1,
    limite: 10,
    total_paginas: 1,
  });

  const obterContrato = vi.spyOn(api, 'obterContrato').mockResolvedValue({
    id: 99,
    numero_contrato: 'CTR-2026-99',
    imovel_id: 105,
    imovel_titulo: 'Galpão Alpha',
    locador_id: 1,
    locatario_id: 2,
    corretor_id: 3,
    ativo: true,
  } as unknown as Contrato);

  render(
    <MemoryRouter>
      <Comissoes />
    </MemoryRouter>
  );

  const botaoRegistrar = await screen.findByRole('button', { name: /Registrar comissão/i });
  fireEvent.click(botaoRegistrar);

  const modal = screen.getByRole('dialog');

  // Altera para Locação
  const selectOperacao = within(modal).getByLabelText('Operação');
  fireEvent.change(selectOperacao, { target: { value: 'LOCACAO' } });

  // Foca no seletor de contrato
  const inputContrato = within(modal).getByRole('combobox', { name: /Contrato de locação/i });
  fireEvent.focus(inputContrato);

  const opcaoContrato = await screen.findByRole('option', { name: /CTR-2026-99/i });
  fireEvent.click(opcaoContrato);

  await waitFor(() => {
    expect(obterContrato).toHaveBeenCalledWith(99);
  });

  expect(screen.getByText('Imóvel: Galpão Alpha')).toBeInTheDocument();
});
