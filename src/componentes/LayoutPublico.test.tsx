import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LayoutPublico from './LayoutPublico';
import { chaveTema } from '../hooks/useTema';
import { brand } from '../config/brand';

afterEach(() => { document.documentElement.classList.remove('dark'); window.localStorage.removeItem(chaveTema); });

describe('layout público', () => {
  it('mostra Alugar, Comprar e os contatos configurados no rodapé', () => {
    render(<MemoryRouter><LayoutPublico /></MemoryRouter>);
    const rodape = within(screen.getByRole('contentinfo'));
    expect(rodape.getByRole('link', { name: 'Alugar' })).toHaveAttribute('href', '/imoveis/para-alugar');
    expect(rodape.getByRole('link', { name: 'Comprar' })).toHaveAttribute('href', '/imoveis/para-comprar');
    if (brand.contact.whatsapp) expect(rodape.getByRole('link', { name: /WhatsApp:/ })).toHaveAttribute('href', expect.stringContaining('https://wa.me/55'));
  });
  it('move o foco ao abrir e devolve ao botão ao fechar com Escape', async () => {
    render(<MemoryRouter><LayoutPublico /></MemoryRouter>);
    const botao = screen.getByRole('button', { name: 'Abrir menu' });
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    const primeiro = nav.querySelector('a')!;
    expect(nav.className).toContain('max-[650px]:hidden');
    fireEvent.click(botao);
    await waitFor(() => expect(primeiro).toHaveFocus());
    expect(nav.className).toContain('max-[650px]:flex');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveFocus();
    expect(nav.className).toContain('max-[650px]:hidden');
  });
  it('alterna o modo noturno e persiste a escolha', () => {
    render(<MemoryRouter><LayoutPublico /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo escuro' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem(chaveTema)).toBe('dark');
    expect(screen.getByRole('button', { name: 'Ativar modo claro' })).toBeInTheDocument();
  });
  it('mantém o cabeçalho fixo e o logo acima do fundo do menu', () => {
    render(<MemoryRouter><LayoutPublico /></MemoryRouter>);
    expect(screen.getByRole('banner').className).toContain('sticky');
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const fundo = screen.getAllByRole('button', { name: 'Fechar menu' }).find((botao) => botao.className.includes('fixed'))!;
    expect(fundo.className).toContain('z-[4]');
    expect(screen.getByRole('link', { name: /— início$/ }).className).toContain('z-[6]');
    expect(screen.getByRole('link', { name: 'Desenvolvedores' })).toHaveAttribute('href', '/devs');
  });
});
