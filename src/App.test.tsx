import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaginaErro, TEMPO_VOLTA_404_MS } from './App';

beforeEach(() => {
  vi.useFakeTimers();
  vi.restoreAllMocks();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
});

function Rota404({ status = 404 }: { status?: number }) {
  return (
    <MemoryRouter initialEntries={['/pagina-que-nao-existe']}>
      <Routes>
        <Route path="/pagina-que-nao-existe" element={<PaginaErro status={status} />} />
        <Route path="/" element={<div>Catálogo</div>} />
        <Route path="/imoveis/para-alugar" element={<div>Alugar</div>} />
        <Route path="/imoveis/para-comprar" element={<div>Comprar</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('página 404 com casa quebrada', () => {
  it('mostra 404, casa, countdown e atalhos', () => {
    render(<Rota404 />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página não encontrada.');
    expect(screen.getByRole('img', { name: /casa quebrada/i })).toBeInTheDocument();
    expect(screen.getByText(/voltando ao catálogo em 8s/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar agora' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Alugar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Comprar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ficar aqui' })).toBeInTheDocument();
  });

  it('volta ao catálogo após o tempo e sem recarregar a página', async () => {
    render(<Rota404 />);
    expect(screen.queryByText('Catálogo')).not.toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(TEMPO_VOLTA_404_MS);
    });
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
  });

  it('ficar aqui cancela a volta automática', async () => {
    render(<Rota404 />);
    fireEvent.click(screen.getByRole('button', { name: 'Ficar aqui' }));
    expect(screen.getByText(/ficamos por aqui/i)).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(TEMPO_VOLTA_404_MS + 2000);
    });
    expect(screen.queryByText('Catálogo')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página não encontrada.');
  });

  it('503 mantém indisponibilidade sem casa e sem volta automática', async () => {
    render(<Rota404 status={503} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Serviço temporariamente indisponível.');
    expect(screen.queryByRole('img', { name: /casa quebrada/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/voltando ao catálogo/i)).not.toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(TEMPO_VOLTA_404_MS + 2000);
    });
    expect(screen.queryByText('Catálogo')).not.toBeInTheDocument();
  });
});
