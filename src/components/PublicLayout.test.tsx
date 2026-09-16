import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PublicLayout from './PublicLayout';
import { themeStorageKey } from '../hooks/useTheme';
import { brand } from '../config/brand';

afterEach(() => {
  document.documentElement.classList.remove('dark');
  window.localStorage.removeItem(themeStorageKey);
});

describe('menu móvel público', () => {
  it('mostra links de compra e locação e os contatos configurados no rodapé', () => {
    render(<MemoryRouter><PublicLayout/></MemoryRouter>);
    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getByRole('link', {name:'Alugar'})).toHaveAttribute('href','/imoveis/para-alugar');
    expect(footer.getByRole('link', {name:'Comprar'})).toHaveAttribute('href','/imoveis/para-comprar');
    expect(footer.getByRole('link', {name:/WhatsApp:/})).toHaveAttribute('href','https://wa.me/5566984346427');
    expect(footer.getByRole('link', {name:'Lucas.gobatto@outlook.com'})).toHaveAttribute('href','mailto:Lucas.gobatto@outlook.com');
  });
  it('renderiza atendimento quando os dados comerciais estão configurados', () => {
    const previous = {...brand.contact};
    try {
      Object.assign(brand.contact, {whatsapp:'(65) 99999-0000',email:'contato@example.test',hours:'Segunda a sexta, 9h–18h',address:'Endereço de teste'});
      render(<MemoryRouter><PublicLayout/></MemoryRouter>);
      const footer = within(screen.getByRole('contentinfo'));
      expect(footer.getByRole('link', {name:/WhatsApp:/})).toHaveAttribute('href','https://wa.me/5565999990000');
      expect(footer.getByRole('link', {name:'contato@example.test'})).toHaveAttribute('href','mailto:contato@example.test');
      expect(footer.getByText(/Segunda a sexta/)).toBeInTheDocument();
    } finally { Object.assign(brand.contact, previous); }
  });
  it('move foco ao abrir e retorna ao botão ao fechar com Escape', async () => {
    render(<MemoryRouter><PublicLayout /></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });
    const firstLink = screen.getByRole('navigation').querySelector('a')!;

    const nav = screen.getByRole('navigation');
    expect(toggle.className).toContain('hidden');
    expect(toggle.className).toContain('max-[650px]:inline-flex');
    expect(toggle.className).not.toContain('buttonGhost');
    expect(nav.className).toContain('max-[650px]:hidden');

    fireEvent.click(toggle);
    await waitFor(() => expect(firstLink).toHaveFocus());
    expect(nav.className).toContain('max-[650px]:flex');
    expect(nav.className).not.toContain('max-[650px]:hidden');
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveFocus();
    expect(nav.className).toContain('max-[650px]:hidden');
  });

  it('alterna o modo noturno e persiste a escolha', () => {
    render(<MemoryRouter><PublicLayout /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo escuro' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem(themeStorageKey)).toBe('dark');
    expect(screen.getByRole('button', { name: 'Ativar modo claro' })).toBeInTheDocument();
  });

  it('mantém o header fixo no topo e o link de desenvolvedores no rodapé', () => {
    render(<MemoryRouter><PublicLayout /></MemoryRouter>);
    const header = screen.getByRole('banner');
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('top-0');
    const devs = screen.getByRole('link', { name: 'Desenvolvedores' });
    expect(devs).toHaveAttribute('href', '/devs');
  });

  it('mantém logo e controles acima do backdrop do menu mobile', () => {
    render(<MemoryRouter><PublicLayout /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const backdrop = screen.getAllByRole('button', { name: 'Fechar menu' }).find((b) => b.className.includes('fixed'))!;
    expect(backdrop.className).toContain('z-[4]');
    const logo = screen.getByRole('link', { name: /— início$/ });
    expect(logo.className).toContain('z-[6]');
    const themeToggle = screen.getByRole('button', { name: 'Ativar modo escuro' });
    expect(themeToggle.parentElement!.className).toContain('z-[6]');
  });
});
