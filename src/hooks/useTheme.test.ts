import { createElement, StrictMode } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { themeStorageKey, useTheme } from './useTheme';

afterEach(() => {
  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = '';
  window.localStorage.removeItem(themeStorageKey);
});

describe('useTheme', () => {
  it('começa claro e alterna para escuro persistindo a escolha', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    act(() => result.current.toggle());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem(themeStorageKey)).toBe('dark');
    act(() => result.current.toggle());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('respeita o tema já salvo', () => {
    window.localStorage.setItem(themeStorageKey, 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('primeiro render é claro como no SSR, mesmo com tema salvo (hidratação)', async () => {
    window.localStorage.setItem(themeStorageKey, 'dark');
    const seen: string[] = [];
    function Probe() {
      const { theme } = useTheme();
      seen.push(theme);
      return null;
    }
    render(createElement(StrictMode, null, createElement(Probe)));
    // O servidor sempre renderiza 'light'; o cliente precisa pintar o mesmo
    // no primeiro render, senão o React descarta o HTML do SSR
    // ("Expected server HTML to contain a matching <circle> in <svg>").
    expect(seen[0]).toBe('light');
    await waitFor(() => expect(seen.at(-1)).toBe('dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
