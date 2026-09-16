import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Corretores from './Corretores';
import { api } from '../../servicos/api';
import { corretorTeste, simularSessao } from './sessaoTeste';
import type { Corretor } from '../../tipos';

vi.mock('../../hooks/useSessao', () => ({ useSessao: vi.fn() }));
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
});
const outro: Corretor = { ...corretorTeste, id: 2, nome: 'Beto', email: 'beto@example.test', whatsapp: '5565988888888', creci: '123', cargo: 'CORRETOR' };
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('define a nova senha escolhida na hora para a conta selecionada', async () => {
  simularSessao();
  vi.spyOn(api, 'listarCorretores').mockResolvedValue({ itens: [outro], total: 1, pagina: 1, limite: 15, total_paginas: 1 });
  const salvar = vi.spyOn(api, 'salvarCorretor').mockResolvedValue(outro);
  render(<MemoryRouter><Corretores /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: 'Redefinir senha' }));
  fireEvent.change(screen.getByLabelText('Nova senha', { exact: true }), { target: { value: 'nova-senha-12345' } });
  fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'outra-senha-12345' } });
  fireEvent.click(screen.getByRole('button', { name: 'Definir nova senha' }));
  expect(await screen.findByText('A confirmação não confere.')).toBeInTheDocument();
  expect(salvar).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'nova-senha-12345' } });
  fireEvent.click(screen.getByRole('button', { name: 'Definir nova senha' }));
  await waitFor(() => expect(salvar).toHaveBeenCalledWith({ nome: 'Beto', cpf: '52998224725', email: 'beto@example.test', whatsapp: '5565988888888', cargo: 'CORRETOR', creci: '123', url_foto: null, senha: 'nova-senha-12345' }, 2));
});
it('não expõe a página a quem não é ADMIN', () => {
  simularSessao({ ...corretorTeste, cargo: 'CORRETOR' });
  const listar = vi.spyOn(api, 'listarCorretores');
  render(<MemoryRouter initialEntries={['/admin/corretores']}><Corretores /></MemoryRouter>);
  expect(listar).not.toHaveBeenCalled();
});
