import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Corretor } from '../tipos';
import { api } from '../servicos/api';

interface ValorSessao {
  corretor: Corretor | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  atualizar: () => Promise<void>;
}
const ContextoSessao = createContext<ValorSessao | null>(null);
// Uma única renovação por carregamento da página, compartilhada entre montagens.
let restauracao: ReturnType<typeof api.renovar> | null = null;

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const [corretor, setCorretor] = useState<Corretor | null>(null);
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    let ativo = true;
    restauracao ??= api.renovar();
    restauracao
      .then((sessao) => { if (ativo) setCorretor(sessao.corretor); })
      .catch(() => { if (ativo) setCorretor(null); })
      .finally(() => { if (ativo) setCarregando(false); });
    const expirar = () => setCorretor(null);
    window.addEventListener('session-expired', expirar);
    return () => { ativo = false; window.removeEventListener('session-expired', expirar); };
  }, []);
  async function entrar(email: string, senha: string) {
    const sessao = await api.entrar(email, senha);
    setCorretor(sessao.corretor);
  }
  async function sair() {
    await api.sair();
    setCorretor(null);
    restauracao = null;
  }
  async function atualizar() { setCorretor(await api.eu()); }
  return <ContextoSessao.Provider value={{ corretor, carregando, entrar, sair, atualizar }}>{children}</ContextoSessao.Provider>;
}

export function useSessao() {
  const contexto = useContext(ContextoSessao);
  if (!contexto) throw new Error('ProvedorSessao ausente.');
  return contexto;
}
