import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Contatos from './Contatos';
import { api } from '../../servicos/api';
import { simularSessao } from './sessaoTeste';
import type { Pessoa } from '../../tipos';

vi.mock('../../hooks/useSessao', () => ({ useSessao: vi.fn() }));
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
});
const pessoa = (id: number, nome: string, status_contato: Pessoa['status_contato']): Pessoa => ({ id, nome, telefone: '65999999999', email: null, tipo_pessoa: null, cpf_cnpj: null, data_nascimento: null, endereco: null, banco_nome: null, banco_agencia: null, banco_conta: null, chave_pix: null, observacoes: null, mensagem: 'Quero visitar', imovel_id: 42, corretor_id: 1, origem: 'SITE', status_contato, consentimento: true, consentimento_em: '2026-09-16T12:00:00Z', versao_termos: 'v1.0', ativo: true, criado_em: '2026-09-16T12:00:00Z', alterado_em: '2026-09-16T12:00:00Z' });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function montar() {
  simularSessao();
  const listar = vi.spyOn(api, 'listarPessoas').mockImplementation(async (filtros = {}) => {
    const itens = filtros.status_contato === 'PENDENTE' ? [pessoa(1, 'Maria', 'PENDENTE'), pessoa(2, 'João', 'PENDENTE')] : filtros.status_contato === 'RESPONDIDO' ? [pessoa(3, 'Carla', 'RESPONDIDO')] : [];
    return { itens, total: itens.length, pagina: 1, limite: 10, total_paginas: 1 };
  });
  vi.spyOn(api, 'listarFichas').mockResolvedValue({ itens: [], total: 0, pagina: 1, limite: 10, total_paginas: 0 });
  render(<MemoryRouter><Contatos /></MemoryRouter>);
  return listar;
}

it('mostra as três colunas com contagens e move um contato de pendente para respondido', async () => {
  const listar = montar();
  const salvar = vi.spyOn(api, 'salvarPessoa').mockResolvedValue(pessoa(1, 'Maria', 'RESPONDIDO'));
  const pendentes = within(await screen.findByRole('region', { name: 'Pendentes' }));
  expect(await pendentes.findByText('Maria')).toBeInTheDocument();
  expect(pendentes.getByText('(2)')).toBeInTheDocument();
  expect(within(screen.getByRole('region', { name: 'Respondidos' })).getByText('Carla')).toBeInTheDocument();
  expect(within(screen.getByRole('region', { name: 'Finalizados' })).getByText('Nenhum contato aqui.')).toBeInTheDocument();
  expect(listar).toHaveBeenCalledWith(expect.objectContaining({ status_contato: 'FINALIZADO', ativo: true, limite: 10 }));
  fireEvent.click(pendentes.getAllByRole('button', { name: 'Marcar como respondido' })[0]);
  await waitFor(() => expect(salvar).toHaveBeenCalledWith(expect.objectContaining({ status_contato: 'RESPONDIDO', nome: 'Maria' }), 1, expect.objectContaining({ id: 1 })));
  await waitFor(() => expect(listar.mock.calls.length).toBeGreaterThanOrEqual(6));
});
it('aplica os filtros só ao enviar, com o dia inteiro no fuso de Cuiabá, e recusa período invertido', async () => {
  const listar = montar();
  await screen.findByText('Maria');
  const chamadas = listar.mock.calls.length;
  fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'Mar' } });
  fireEvent.change(screen.getByLabelText('De', { exact: true }), { target: { value: '2026-09-16' } });
  fireEvent.change(screen.getByLabelText('Até', { exact: true }), { target: { value: '2026-09-01' } });
  expect(listar).toHaveBeenCalledTimes(chamadas);
  fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('A data final');
  fireEvent.change(screen.getByLabelText('Até', { exact: true }), { target: { value: '2026-09-20' } });
  fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }));
  await waitFor(() => expect(listar).toHaveBeenLastCalledWith(expect.objectContaining({ busca: 'Mar', criado_desde: '2026-09-16T00:00:00.000-04:00', criado_ate: '2026-09-20T23:59:59.999-04:00' })));
});
it('desabilita a exportação de coluna vazia e abre o cadastro de nova pessoa', async () => {
  montar();
  await screen.findByText('Maria');
  const finalizados = within(screen.getByRole('region', { name: 'Finalizados' }));
  expect(finalizados.getByRole('button', { name: 'Exportar CSV' })).toBeDisabled();
  expect(within(screen.getByRole('region', { name: 'Pendentes' })).getByRole('button', { name: 'Exportar CSV' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: '+ Nova pessoa' }));
  expect(await screen.findByRole('dialog')).toHaveTextContent('Nova pessoa');
});
