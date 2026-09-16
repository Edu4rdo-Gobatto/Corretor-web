import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import SeletorRegistro from './SeletorRegistro';

it('busca com atraso, escolhe uma opção e permite limpar', async () => {
  const buscar = vi.fn(async (termo: string) => (termo ? [{ id: 7, nome: 'Galpão da BR' }] : []));
  const aoEscolher = vi.fn();
  const { rerender } = render(<SeletorRegistro rotulo="Imóvel" valor={null} buscar={buscar} aoEscolher={aoEscolher} />);
  const campo = screen.getByRole('combobox', { name: 'Imóvel' });
  fireEvent.focus(campo);
  fireEvent.change(campo, { target: { value: 'Galp' } });
  await waitFor(() => expect(buscar).toHaveBeenCalledWith('Galp'));
  fireEvent.click(await screen.findByRole('option', { name: /Galpão da BR/ }));
  expect(aoEscolher).toHaveBeenCalledWith({ id: 7, nome: 'Galpão da BR' });
  rerender(<SeletorRegistro rotulo="Imóvel" valor={{ id: 7, nome: 'Galpão da BR' }} buscar={buscar} aoEscolher={aoEscolher} />);
  expect(campo).toHaveValue('Galpão da BR');
  fireEvent.click(screen.getByRole('button', { name: 'Limpar imóvel' }));
  expect(aoEscolher).toHaveBeenLastCalledWith(null);
});
it('mostra o erro da busca sem quebrar o formulário', async () => {
  render(<SeletorRegistro rotulo="Pessoa" valor={null} buscar={async () => { throw new Error('Sem acesso'); }} aoEscolher={() => undefined} erro="Selecione a pessoa." />);
  fireEvent.focus(screen.getByRole('combobox', { name: 'Pessoa' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Sem acesso');
  expect(screen.getByText('Selecione a pessoa.')).toBeInTheDocument();
});
