import { useContext, useEffect, useRef } from 'react';
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom';

type GuardProps = { dirty: boolean; allowed: React.MutableRefObject<boolean> };

function NavigationGuard({ dirty, allowed }: GuardProps) {
  const blocker = useBlocker(() => dirty && !allowed.current);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Há alterações não salvas. Deseja sair desta edição?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  return null;
}

export function UnsavedFormGuard(props: GuardProps) {
  const router = useContext(UNSAFE_DataRouterContext);
  return router ? <NavigationGuard {...props}/> : null;
}

export function useUnsavedFormGuard(dirty: boolean) {
  const allowed = useRef(false);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty || allowed.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  return allowed;
}
