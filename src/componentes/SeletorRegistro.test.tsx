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
it('abre a lista para cima quando falta espaço abaixo dentro do modal', async () => {
  const caixa = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 600, width: 600, height: bottom - top, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
  render(<div data-rolagem><SeletorRegistro rotulo="Imóvel" valor={null} buscar={async () => [{ id: 1, nome: 'Sala 1' }]} aoEscolher={() => undefined} /></div>);
  const campo = screen.getByRole('combobox', { name: 'Imóvel' });
  // Área rolável de 500px com o campo no fim: 20px abaixo e 420px acima.
  vi.spyOn(document.querySelector('[data-rolagem]') as HTMLElement, 'getBoundingClientRect').mockReturnValue(caixa(0, 500));
  vi.spyOn(campo.closest('div.grid') as HTMLElement, 'getBoundingClientRect').mockReturnValue(caixa(420, 480));
  fireEvent.focus(campo);
  const lista = await screen.findByRole('listbox');
  expect(lista).toHaveAttribute('data-direcao', 'acima');
  expect(lista).toHaveClass('bottom-full');
});
