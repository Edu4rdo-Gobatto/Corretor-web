import { render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import LimiteErro from './LimiteErro';

function Quebrado(): never { throw new Error('render failed'); }
afterEach(() => vi.restoreAllMocks());
it('exibe recuperação acessível quando um componente falha ao renderizar', () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  render(<LimiteErro><Quebrado /></LimiteErro>);
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar esta página.');
  expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
});
