import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import EstadoCarregamento from './EstadoCarregamento';

it('exibe esqueleto de cartões e de detalhe, e mantém o erro com nova tentativa', () => {
  const { rerender } = render(<EstadoCarregamento carregando esqueleto="cartoes" />);
  expect(screen.getByRole('status', { name: 'Carregando imóveis' })).toBeInTheDocument();
  rerender(<EstadoCarregamento carregando esqueleto="detalhe" />);
  expect(screen.getByRole('status', { name: 'Carregando imóvel' })).toBeInTheDocument();
  const tentar = vi.fn();
  rerender(<EstadoCarregamento carregando={false} erro="Falhou" tentarNovamente={tentar} />);
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(tentar).toHaveBeenCalled();
});
