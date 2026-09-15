import { useCallback, useEffect, useRef, useState } from 'react';

export type Theme = 'light' | 'dark';
export const themeStorageKey = 'theme';

function resolveTheme(): Theme {
  // Só chamado em efeito (cliente): nunca durante a renderização/SSR.
  try {
    const stored = window.localStorage.getItem(themeStorageKey);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* armazenamento indisponível: cai para a preferência do SO */
  }
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    /* armazenamento indisponível: mantém só na sessão */
  }
}

export function useTheme() {
  // 'light' é o mesmo valor que o SSR renderiza, então o primeiro render do
  // cliente hidrata sem divergência. A preferência salva é aplicada em efeito.
  const [theme, setTheme] = useState<Theme>('light');
  const mounted = useRef(false);
  const lastEffectTheme = useRef<Theme | null>(null);
  const resolvedTheme = useRef<Theme>('light');
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const resolved = resolveTheme();
      resolvedTheme.current = resolved;
      lastEffectTheme.current = theme;
      if (resolved !== 'light') setTheme(resolved);
      applyTheme(resolved);
      return;
    }
    // React StrictMode replays mount effects with the same render value. Keep
    // the already-resolved preference instead of briefly reverting to light.
    if (lastEffectTheme.current === theme) {
      applyTheme(resolvedTheme.current);
      return;
    }
    lastEffectTheme.current = theme;
    resolvedTheme.current = theme;
    applyTheme(theme);
  }, [theme]);
  const toggle = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);
  return { theme, isDark: theme === 'dark', toggle };
}
