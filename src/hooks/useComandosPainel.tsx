import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, type ReactNode } from 'react';

export type AcaoPainel = { id: string; rotulo: string; executar: () => void; palavrasChave?: string };
type Registro = { acoes: AcaoPainel[]; registrar: (chave: string, acoes: AcaoPainel[]) => () => void };
const ContextoComandos = createContext<Registro | null>(null);

export function ProvedorComandosPainel({ children }: { children: ReactNode }) {
  const [registros, setRegistros] = useState<Record<string, AcaoPainel[]>>({});
  const registrar = useCallback((chave: string, acoes: AcaoPainel[]) => {
    setRegistros((atuais) => ({ ...atuais, [chave]: acoes }));
    return () => setRegistros((atuais) => {
      const proximos = { ...atuais };
      delete proximos[chave];
      return proximos;
    });
  }, []);
  const valor = useMemo(() => ({ acoes: Object.values(registros).flat(), registrar }), [registros, registrar]);
  return <ContextoComandos.Provider value={valor}>{children}</ContextoComandos.Provider>;
}

/** As telas registram somente ações autorizadas; callbacks abrem formulários, sem persistência automática. */
export function useAcoesPainel(acoes: AcaoPainel[]) {
  const contexto = useContext(ContextoComandos);
  const registrar = contexto?.registrar;
  const chave = useId();
  useEffect(() => registrar?.(chave, acoes), [registrar, chave, acoes]);
}

export function useComandosPainel() { return useContext(ContextoComandos)?.acoes ?? []; }
