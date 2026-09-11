import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PublicLayout from './PublicLayout';

describe('menu móvel público', () => {
  it('move foco ao abrir e retorna ao botão ao fechar com Escape', async () => {
    render(<MemoryRouter><PublicLayout /></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });
    const firstLink = screen.getByRole('navigation').querySelector('a')!;

    fireEvent.click(toggle);
    await waitFor(() => expect(firstLink).toHaveFocus());
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveFocus();
  });
});

