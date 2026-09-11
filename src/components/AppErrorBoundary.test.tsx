import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppErrorBoundary from './AppErrorBoundary';

function BrokenComponent(): never {
  throw new Error('render failed');
}

describe('boundary global da aplicação', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exibe recuperação acessível quando um componente falha ao renderizar', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<AppErrorBoundary><BrokenComponent /></AppErrorBoundary>);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar esta página.');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });
});

