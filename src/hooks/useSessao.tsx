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
// Uma única renovação por carregamento da página, compartilhada entre montagens. Guarda o estado atual da sessão:
// entrar/atualizar gravam o corretor válido e falha/expiração/saída zeram, para que voltar do site ao painel
// (nova montagem do provedor) não reaproveite uma restauração antiga que falhou.
let restauracao: Promise<Corretor> | null = null;

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const [corretor, setCorretor] = useState<Corretor | null>(null);
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    let ativo = true;
    const promessa = restauracao ??= api.renovar().then((sessao) => sessao.corretor);
    promessa
      .then((atual) => { if (ativo) setCorretor(atual); })
      .catch(() => { if (restauracao === promessa) restauracao = null; if (ativo) setCorretor(null); })
      .finally(() => { if (ativo) setCarregando(false); });
    const expirar = () => { restauracao = null; setCorretor(null); };
    window.addEventListener('session-expired', expirar);
    return () => { ativo = false; window.removeEventListener('session-expired', expirar); };
  }, []);
  async function entrar(email: string, senha: string) {
    const sessao = await api.entrar(email, senha);
    restauracao = Promise.resolve(sessao.corretor);
    setCorretor(sessao.corretor);
  }
  async function sair() {
    await api.sair();
    setCorretor(null);
    restauracao = null;
  }
  async function atualizar() {
    const atual = await api.eu();
    restauracao = Promise.resolve(atual);
    setCorretor(atual);
  }
  return <ContextoSessao.Provider value={{ corretor, carregando, entrar, sair, atualizar }}>{children}</ContextoSessao.Provider>;
}

export function useSessao() {
  const contexto = useContext(ContextoSessao);
  if (!contexto) throw new Error('ProvedorSessao ausente.');
  return contexto;
}
