import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ObraOverlay, { DURACAO_OBRA_MS, SAIDA_OBRA_MS } from './ObraOverlay';
import * as obra from '../servicos/obra';

beforeEach(() => {
  vi.useFakeTimers();
  vi.restoreAllMocks();
  // jsdom não implementa play/pause/load de mídia (só faz barulho no stderr):
  // mock silencioso para os caminhos que usam o Audio real.
  vi.stubGlobal(
    'Audio',
    vi.fn(function (this: unknown, src?: string) {
      return {
        src: src ?? '',
        loop: false,
        volume: 1,
        preload: '',
        currentTime: 0,
        paused: true,
        load: vi.fn(),
        play: vi.fn(() => Promise.resolve()),
        pause: vi.fn(),
      };
    }),
  );
  obra.desligarObra();
  obra.limparSinalDeIdaAosDevs();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('overlay de abertura da obra', () => {
  it('abre em fullscreen com vidro fosco, cena animada e botão pular', () => {
    render(<ObraOverlay aoSair={() => {}} />);
    const dialogo = screen.getByRole('dialog', { name: /levantando esta página/i });
    expect(dialogo.className).toContain('fixed');
    expect(dialogo.className).toContain('inset-0');
    expect(dialogo.className).toContain('backdrop-blur-md');
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('img', { name: /casa em construção/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pular' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ativar som da obra' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('começa mudo no acesso direto e liga/desliga o som no botão', async () => {
    const ligar = vi.spyOn(obra, 'ligarObra').mockResolvedValue(true);
    const desligar = vi.spyOn(obra, 'desligarObra');
    render(<ObraOverlay aoSair={() => {}} />);
    expect(ligar).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Ativar som da obra' }));
    });
    expect(ligar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Desligar som da obra' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Desligar som da obra' }));
    expect(desligar).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Ativar som da obra' })).toBeInTheDocument();
  });

  it('tenta ligar sozinha quando o visitante veio do clique no rodapé', async () => {
    const ligar = vi.spyOn(obra, 'ligarObra').mockResolvedValue(true);
    obra.sinalizarIdaAosDevs();
    render(<ObraOverlay aoSair={() => {}} />);
    await act(async () => {});
    expect(ligar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Desligar som da obra' })).toBeInTheDocument();
  });

  it('para o som ao sair do overlay', async () => {
    vi.spyOn(obra, 'ligarObra').mockResolvedValue(true);
    const desligar = vi.spyOn(obra, 'desligarObra');
    const tela = render(<ObraOverlay aoSair={() => {}} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Ativar som da obra' }));
    });
    tela.unmount();
    expect(desligar).toHaveBeenCalled();
  });

  it('sai sozinho após a duração e avisa o pai ao terminar a transição', async () => {
    const aoSair = vi.fn();
    render(<ObraOverlay aoSair={aoSair} />);
    await act(async () => {
      vi.advanceTimersByTime(DURACAO_OBRA_MS);
    });
    expect(aoSair).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: /levantando esta página/i }).className).toContain('opacity-0');
    await act(async () => {
      vi.advanceTimersByTime(SAIDA_OBRA_MS);
    });
    expect(aoSair).toHaveBeenCalledTimes(1);
  });

  it('fecha no botão pular, no Escape e no clique fora', async () => {
    const aoSair = vi.fn();
    const tela = render(<ObraOverlay aoSair={aoSair} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
    await act(async () => {
      vi.advanceTimersByTime(SAIDA_OBRA_MS);
    });
    expect(aoSair).toHaveBeenCalledTimes(1);
    tela.unmount();

    const aoSair2 = vi.fn();
    const tela2 = render(<ObraOverlay aoSair={aoSair2} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    await act(async () => {
      vi.advanceTimersByTime(SAIDA_OBRA_MS);
    });
    expect(aoSair2).toHaveBeenCalledTimes(1);
    tela2.unmount();

    const aoSair3 = vi.fn();
    render(<ObraOverlay aoSair={aoSair3} />);
    fireEvent.click(screen.getByRole('dialog', { name: /levantando esta página/i }));
    await act(async () => {
      vi.advanceTimersByTime(SAIDA_OBRA_MS);
    });
    expect(aoSair3).toHaveBeenCalledTimes(1);
  });

  it('clique dentro da casa não fecha', async () => {
    const aoSair = vi.fn();
    render(<ObraOverlay aoSair={aoSair} />);
    fireEvent.click(screen.getByRole('img', { name: /casa em construção/i }));
    await act(async () => {
      vi.advanceTimersByTime(DURACAO_OBRA_MS + SAIDA_OBRA_MS);
    });
    // Só o timer automático disparou a saída, uma única vez.
    expect(aoSair).toHaveBeenCalledTimes(1);
  });
});
