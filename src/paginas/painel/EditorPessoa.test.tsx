import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditorPessoa, { dadosPessoaParaApi, esquemaPessoa } from './EditorPessoa';
import { api } from '../../servicos/api';
import { simularSessao } from './sessaoTeste';

vi.mock('../../hooks/useSessao', () => ({ useSessao: vi.fn() }));
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('valida documento e tipo, e converte vazios em null para a API', () => {
  const base = { nome: 'Empresa', telefone: '(66) 99999-9999', email: '', tipo_pessoa: '' as const, cpf_cnpj: '11.222.333/0001-81', data_nascimento: '', endereco: '', banco_nome: '', banco_agencia: '', banco_conta: '', chave_pix: '', observacoes: '', mensagem: '', imovel: null, corretor_id: '', status_contato: 'RESPONDIDO' as const, ativo: true };
  const valores = esquemaPessoa.parse(base);
  expect(valores.cpf_cnpj).toBe('11222333000181');
  expect(dadosPessoaParaApi(valores)).toMatchObject({ cpf_cnpj: '11222333000181', tipo_pessoa: null, email: null, imovel_id: null, status_contato: 'RESPONDIDO' });
  expect(esquemaPessoa.safeParse({ ...base, tipo_pessoa: 'PF' }).success).toBe(false);
  expect(esquemaPessoa.safeParse({ ...base, cpf_cnpj: '11111111111' }).success).toBe(false);
  expect(esquemaPessoa.safeParse({ ...base, telefone: '123' }).success).toBe(false);
});
it('salva a pessoa com a situação escolhida e atribui Minha conta ao ADMIN', async () => {
  simularSessao();
  vi.spyOn(api, 'listarCorretores').mockResolvedValue({ itens: [], total: 0, pagina: 1, limite: 100, total_paginas: 0 });
  const salvar = vi.spyOn(api, 'salvarPessoa').mockResolvedValue({ id: 5 } as never);
  const aoSalvar = vi.fn();
  render(<MemoryRouter><EditorPessoa pessoa={null} aoFechar={() => undefined} aoSalvar={aoSalvar} /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Nome / razão social *'), { target: { value: 'Cliente' } });
  fireEvent.change(screen.getByLabelText('Telefone com DDD *'), { target: { value: '65999999999' } });
  fireEvent.change(screen.getByLabelText('Situação do contato'), { target: { value: 'PENDENTE' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar pessoa' }));
  await waitFor(() => expect(salvar).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Cliente', telefone: '65999999999', status_contato: 'PENDENTE', corretor_id: 1 }), undefined, undefined));
  expect(aoSalvar).toHaveBeenCalled();
});
