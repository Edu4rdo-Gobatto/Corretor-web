import { useCallback, useEffect, useRef, useState } from 'react';
import { verificarPaginaPublica } from '../servicos/api';

export const INTERVALO_RECUPERACAO_MS = 30000;
export const LIMITE_VERIFICACAO_MS = 50000;
type EstadoRecuperacao = 'inicial' | 'aguardando' | 'verificando' | 'pausado' | 'recuperado';

/** Cada montagem/URL possui seus próprios timers e invalida as respostas anteriores. */
export function useRecuperacaoPagina(url: string) {
  const [estado, setEstado] = useState<EstadoRecuperacao>('inicial');
  const cancelarAtual = useRef<(() => void) | undefined>();
  const tentarNovamente = useCallback(() => {
    cancelarAtual.current?.();
    window.location.reload();
  }, []);

  useEffect(() => {
    let encerrado = false;
    let geracao = 0;
    let espera: number | undefined;
    let limite: number | undefined;
    let controlador: AbortController | undefined;
    const podeVerificar = () => document.visibilityState === 'visible' && navigator.onLine;
    const cancelar = () => {
      geracao++;
      window.clearTimeout(espera);
      window.clearTimeout(limite);
      controlador?.abort();
      controlador = undefined;
    };
    const encerrar = () => { encerrado = true; cancelar(); };
    cancelarAtual.current = encerrar;

    function agendar() {
      if (encerrado) return;
      if (!podeVerificar()) { setEstado('pausado'); return; }
      setEstado('aguardando');
      espera = window.setTimeout(() => { void verificar(); }, INTERVALO_RECUPERACAO_MS);
    }

    async function verificar() {
      if (encerrado) return;
      if (!podeVerificar()) { setEstado('pausado'); return; }
      const atual = ++geracao;
      const requisicao = new AbortController();
      controlador = requisicao;
      limite = window.setTimeout(() => requisicao.abort(), LIMITE_VERIFICACAO_MS);
      setEstado('verificando');
      try {
        const disponivel = await verificarPaginaPublica(url, requisicao.signal);
        if (encerrado || atual !== geracao || requisicao.signal.aborted || !podeVerificar()) return;
        if (window.location.pathname + window.location.search + window.location.hash !== url) { encerrar(); return; }
        if (disponivel) {
          setEstado('recuperado');
          encerrar();
          window.location.reload();
        }
      } catch {
        // Falha/timeout conserva a página de espera; a próxima tentativa respeita o intervalo.
      } finally {
        if (!encerrado && atual === geracao) {
          window.clearTimeout(limite);
          controlador = undefined;
          agendar();
        }
      }
    }

    function reavaliar() { cancelar(); agendar(); }
    document.addEventListener('visibilitychange', reavaliar);
    window.addEventListener('online', reavaliar);
    window.addEventListener('offline', reavaliar);
    agendar();
    return () => {
      encerrar();
      document.removeEventListener('visibilitychange', reavaliar);
      window.removeEventListener('online', reavaliar);
      window.removeEventListener('offline', reavaliar);
      if (cancelarAtual.current === encerrar) cancelarAtual.current = undefined;
    };
  }, [url]);

  return { estado, tentarNovamente };
}
