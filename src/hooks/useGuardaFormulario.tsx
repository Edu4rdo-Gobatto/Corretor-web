import { useContext, useEffect, useRef } from 'react';
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom';

type Propriedades = { alterado: boolean; liberado: React.MutableRefObject<boolean> };

function GuardaNavegacao({ alterado, liberado }: Propriedades) {
  const bloqueio = useBlocker(() => alterado && !liberado.current);
  useEffect(() => {
    if (bloqueio.state !== 'blocked') return;
    if (window.confirm('Há alterações não salvas. Deseja sair desta edição?')) bloqueio.proceed();
    else bloqueio.reset();
  }, [bloqueio]);
  return null;
}

/** Só funciona dentro de um data router; fora dele (SSR, testes com MemoryRouter) não faz nada. */
export function GuardaFormulario(propriedades: Propriedades) {
  const roteador = useContext(UNSAFE_DataRouterContext);
  return roteador ? <GuardaNavegacao {...propriedades} /> : null;
}

export function useGuardaFormulario(alterado: boolean) {
  const liberado = useRef(false);
  useEffect(() => {
    const avisar = (evento: BeforeUnloadEvent) => {
      if (!alterado || liberado.current) return;
      evento.preventDefault();
      evento.returnValue = '';
    };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [alterado]);
  return liberado;
}
