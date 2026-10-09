import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CAMPO_DE_TEXTO = 'textarea, select, [contenteditable]:not([contenteditable="false"]), input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"])';

/** Esc só vale como "voltar" quando nenhuma camada (diálogo, menu, dica, campo) já o usou. */
export function escPodeVoltar(evento: KeyboardEvent, camadas = 'dialog[open], [data-esc-camada]') {
  if (evento.key !== 'Escape' || evento.defaultPrevented || evento.repeat || evento.isComposing) return false;
  if (document.querySelector(camadas)) return false;
  const alvo = evento.target instanceof Element ? evento.target : null;
  return !alvo?.closest(CAMPO_DE_TEXTO);
}

/** Telas públicas e login: Esc volta para a tela inicial (`destino`); `null` desliga (já está nela). */
export function useEscVoltar(destino: string | null) {
  const navegar = useNavigate();
  useEffect(() => {
    if (!destino) return;
    function voltar(evento: KeyboardEvent) {
      if (!escPodeVoltar(evento)) return;
      evento.preventDefault();
      navegar(destino!);
    }
    // Na fase de bubbling: menu, filtros, dicas e diálogos recebem Esc antes do retorno.
    window.addEventListener('keydown', voltar);
    return () => window.removeEventListener('keydown', voltar);
  }, [destino, navegar]);
}
