import { useCallback, useEffect, useRef, useState } from 'react';

export type Tema = 'light' | 'dark';
export const chaveTema = 'theme';

function resolverTema(): Tema {
  // Só chamado em efeito (cliente): nunca durante a renderização/SSR.
  try {
    const salvo = window.localStorage.getItem(chaveTema);
    if (salvo === 'light' || salvo === 'dark') return salvo;
  } catch {
    /* armazenamento indisponível: cai para a preferência do sistema */
  }
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function aplicarTema(tema: Tema) {
  document.documentElement.classList.toggle('dark', tema === 'dark');
  document.documentElement.style.colorScheme = tema;
  try {
    window.localStorage.setItem(chaveTema, tema);
  } catch {
    /* armazenamento indisponível: mantém só na sessão */
  }
}

export function useTema() {
  // 'light' é o que o SSR renderiza; o primeiro render do cliente hidrata sem divergência.
  const [tema, setTema] = useState<Tema>('light');
  const montado = useRef(false);
  const temaDoUltimoEfeito = useRef<Tema | null>(null);
  const temaResolvido = useRef<Tema>('light');
  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      const resolvido = resolverTema();
      temaResolvido.current = resolvido;
      temaDoUltimoEfeito.current = tema;
      if (resolvido !== 'light') setTema(resolvido);
      aplicarTema(resolvido);
      return;
    }
    // O StrictMode repete o efeito de montagem com o mesmo valor: preserva a preferência já resolvida.
    if (temaDoUltimoEfeito.current === tema) {
      aplicarTema(temaResolvido.current);
      return;
    }
    temaDoUltimoEfeito.current = tema;
    temaResolvido.current = tema;
    aplicarTema(tema);
  }, [tema]);
  const alternar = useCallback(() => setTema((atual) => (atual === 'dark' ? 'light' : 'dark')), []);
  return { tema, escuro: tema === 'dark', alternar };
}
