import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LayoutPainel from './LayoutPainel';
import { chaveTema } from '../../hooks/useTema';
import { corretorTeste, simularSessao } from './sessaoTeste';
import type { Corretor } from '../../tipos';

vi.mock('../../hooks/useSessao', () => ({ useSessao: vi.fn() }));
function mostrar(corretor: Corretor | null) {
  const sessao = simularSessao(corretor);
  render(<MemoryRouter initialEntries={['/admin']}><Routes><Route path="/admin" element={<LayoutPainel />}><Route index element={<p>Conteúdo protegido</p>} /></Route><Route path="/admin/entrar" element={<p>Acesso à conta</p>} /></Routes></MemoryRouter>);
  return sessao;
}
afterEach(() => { cleanup(); document.documentElement.classList.remove('dark'); window.localStorage.removeItem(chaveTema); });

describe('permissões de navegação do painel', () => {
  it('direciona usuários sem sessão para o login', () => { mostrar(null); expect(screen.getByText('Acesso à conta')).toBeInTheDocument(); expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument(); });
  it('oculta a gestão de corretores para CORRETOR e mostra Pessoas e Contatos', () => {
    mostrar({ ...corretorTeste, cargo: 'CORRETOR' });
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Corretores' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pessoas' })).toHaveAttribute('href', '/admin/pessoas');
    expect(screen.getByRole('link', { name: 'Contatos' })).toHaveAttribute('href', '/admin/contatos');
  });
  it('exibe a gestão de corretores para ADMIN', () => { mostrar(corretorTeste); expect(screen.getByRole('link', { name: 'Corretores' })).toBeInTheDocument(); });
  it('mostra Cadastros só para ADMIN, porque as rotas de cadastro são exclusivas dele', () => {
    mostrar({ ...corretorTeste, cargo: 'CORRETOR' });
    expect(screen.queryByRole('link', { name: 'Cadastros' })).not.toBeInTheDocument();
    cleanup();
    mostrar(corretorTeste);
    expect(screen.getByRole('link', { name: 'Cadastros' })).toHaveAttribute('href', '/admin/cadastros');
  });
});
describe('conta do usuário', () => {
  it('abre o menu da foto com Sair da conta e encerra a sessão', async () => {
    const { sair } = mostrar(corretorTeste);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de Ana Silva' }));
    const menu = screen.getByRole('menu', { name: 'Conta' });
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Sair da conta' }));
    await screen.findByText('Conteúdo protegido');
    expect(sair).toHaveBeenCalled();
  });
  it('liga a foto ao perfil e alterna o tema', () => {
    mostrar({ ...corretorTeste, url_foto: 'https://example.test/foto.png' });
    expect(screen.getByRole('link', { name: 'Ver perfil de Ana Silva' })).toHaveAttribute('href', '/admin/perfil');
    expect(document.querySelector('img[src="https://example.test/foto.png"]')).not.toBeNull();
    fireEvent.click(screen.getAllByRole('button', { name: 'Ativar modo escuro' })[0]);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
