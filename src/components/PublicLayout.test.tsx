import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PublicLayout from './PublicLayout';

describe('menu móvel público', () => {
  it('move foco ao abrir e retorna ao botão ao fechar com Escape', async () => {
    render(<MemoryRouter><PublicLayout /></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });
    const firstLink = screen.getByRole('navigation').querySelector('a')!;

    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('max-[650px]:hidden');

    fireEvent.click(toggle);
    await waitFor(() => expect(firstLink).toHaveFocus());
    expect(nav.className).toContain('max-[650px]:flex');
    expect(nav.className).not.toContain('max-[650px]:hidden');
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveFocus();
    expect(nav.className).toContain('max-[650px]:hidden');
  });
});

