import { createElement, StrictMode } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { chaveTema, useTema } from './useTema';

afterEach(() => { document.documentElement.classList.remove('dark'); document.documentElement.style.colorScheme = ''; window.localStorage.removeItem(chaveTema); });

describe('useTema', () => {
  it('começa claro e alterna para escuro persistindo a escolha', () => {
    const { result } = renderHook(() => useTema());
    expect(result.current.tema).toBe('light');
    act(() => result.current.alternar());
    expect(result.current.tema).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem(chaveTema)).toBe('dark');
  });
  it('primeiro render é claro como no SSR, mesmo com tema salvo', async () => {
    window.localStorage.setItem(chaveTema, 'dark');
    const vistos: string[] = [];
    function Sonda() { vistos.push(useTema().tema); return null; }
    render(createElement(StrictMode, null, createElement(Sonda)));
    expect(vistos[0]).toBe('light');
    await waitFor(() => expect(vistos.at(-1)).toBe('dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
