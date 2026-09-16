import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import FormularioContato from './FormularioContato';
import { api } from '../servicos/api';
import type { Imovel } from '../tipos';

vi.mock('../servicos/api', () => ({ api: { criarContato: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
});
const imovel = { id: 42, titulo: 'Sala comercial', corretor: { id: 1, nome: 'Ana', whatsapp: '5565999998888', creci: null, url_foto: null } } as Imovel;
const montar = () => render(<MemoryRouter><FormularioContato imovel={imovel} aoFechar={() => undefined} /></MemoryRouter>);

it('abre o WhatsApp imediatamente e relata falha no registro sem descartar o que foi digitado', async () => {
  vi.mocked(api.criarContato).mockRejectedValue(new Error('Falha de registro'));
  const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
  montar();
  fireEvent.change(screen.getByLabelText('Seu nome'), { target: { value: 'Visitante' } });
  fireEvent.change(screen.getByLabelText('Telefone com DDD'), { target: { value: '65999998888' } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.submit(screen.getByRole('button', { name: 'Falar com corretor' }).closest('form')!);
  await waitFor(() => expect(abrir).toHaveBeenCalled());
  expect(String(abrir.mock.calls[0][0])).toContain('Ref.%20%2342');
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('não foi registrado'));
  expect(screen.getByLabelText('Telefone com DDD')).toHaveValue('(65) 99999-8888');
  expect(api.criarContato).toHaveBeenCalledWith({ imovel_id: 42, nome: 'Visitante', telefone: '(65) 99999-8888', consentimento: true });
});
it('recusa o campo isca antes de abrir ou enviar, sem focar o campo oculto', () => {
  const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
  montar();
  fireEvent.change(screen.getByLabelText('Site'), { target: { value: 'spam' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Falar com corretor' }).closest('form')!);
  expect(abrir).not.toHaveBeenCalled();
  expect(api.criarContato).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível enviar este formulário.');
  expect(screen.getByLabelText('Site')).not.toHaveFocus();
});
it('exige consentimento antes de abrir o WhatsApp', () => {
  const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
  montar();
  fireEvent.change(screen.getByLabelText('Seu nome'), { target: { value: 'Visitante' } });
  fireEvent.change(screen.getByLabelText('Telefone com DDD'), { target: { value: '65999998888' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Falar com corretor' }).closest('form')!);
  expect(screen.getByText('Autorize o contato para continuar.')).toBeInTheDocument();
  expect(abrir).not.toHaveBeenCalled();
});
