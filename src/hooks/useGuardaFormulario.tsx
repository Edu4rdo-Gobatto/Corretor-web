import { useContext, useEffect, useRef } from 'react';
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom';
import ConfirmarAcao from '../componentes/ConfirmarAcao';

type Propriedades = { alterado: boolean; liberado: React.MutableRefObject<boolean> };

function GuardaNavegacao({ alterado, liberado }: Propriedades) {
  const bloqueio = useBlocker(({ currentLocation, nextLocation }) => alterado && !liberado.current && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search));
  if (bloqueio.state !== 'blocked') return null;
  return <ConfirmarAcao titulo="Sair sem salvar?" descricao="Há alterações não salvas nesta edição. Sair não salva o imóvel; fotos e vídeos ainda não enviados precisarão ser selecionados novamente." confirmar="Sair desta edição" aoConfirmar={() => bloqueio.proceed()} aoFechar={() => bloqueio.reset()} />;
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
