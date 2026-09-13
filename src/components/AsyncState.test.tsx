import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import AsyncState from './AsyncState';
it('exibe skeleton de cartões durante o carregamento do catálogo', () => {
  render(<AsyncState loading skeleton="cards"/>);
  expect(screen.getByRole('status', { name: 'Carregando imóveis' })).toBeInTheDocument();
});
it('exibe skeleton do detalhe e mantém o erro com nova tentativa', () => {
  const { rerender } = render(<AsyncState loading skeleton="detail"/>);
  expect(screen.getByRole('status', { name: 'Carregando imóvel' })).toBeInTheDocument();
  const retry = vi.fn();
  rerender(<AsyncState loading={false} error="Falhou" retry={retry}/>);
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(retry).toHaveBeenCalled();
});
