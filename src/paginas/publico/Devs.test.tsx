import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Devs from './Devs';
import { ContextoBootstrap } from '../../seo/context';

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('página de desenvolvedores', () => {
  it('exibe nomes, papéis e links do Instagram e GitHub em nova aba', () => {
    render(<ContextoBootstrap.Provider value={{ url: '/devs', config: { siteUrl: '', indexable: false }, data: {}, status: 200 }}><MemoryRouter initialEntries={['/devs']}><Devs /></MemoryRouter></ContextoBootstrap.Provider>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Desenvolvedores');
    expect(screen.getByRole('heading', { name: 'Eduardo Gobatto' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fernando Riad' })).toBeInTheDocument();
    const edu = screen.getByRole('link', { name: 'Instagram de Eduardo Gobatto' });
    expect(edu).toHaveAttribute('href', 'https://www.instagram.com/e.gobatto/');
    expect(edu).toHaveAttribute('target', '_blank');
    expect(edu.getAttribute('rel')).toContain('noopener');
    expect(screen.getByRole('link', { name: 'GitHub de Fernando Riad' })).toHaveAttribute('href', 'https://github.com/SHURIKA6');
    expect(screen.getByAltText('Foto de Eduardo Gobatto')).toHaveAttribute('src', '/assets/dev-eduardo.jpg');
  });
  it('abre a intro em overlay com som e a dispensa sozinha anunciando a página', async () => {
    vi.useFakeTimers();
    render(<ContextoBootstrap.Provider value={{ url: '/devs', config: { siteUrl: '', indexable: false }, data: {}, status: 200 }}><MemoryRouter initialEntries={['/devs']}><Devs /></MemoryRouter></ContextoBootstrap.Provider>);
    expect(screen.getByRole('dialog', { name: /levantando esta página/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ativar som da obra' })).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.queryByRole('dialog', { name: /levantando esta página/i })).not.toBeInTheDocument();
    expect(screen.getByText('Página pronta.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
  });
});
