import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';

function destinoInicial(caminho: string) {
  const secao = caminho.match(/^\/admin\/(pessoas|imoveis|contratos|corretores|cadastros|comissoes)\/.+/)?.[1];
  return secao ? `/admin/${secao}` : '/admin';
}

/** Histórico desta permanência no painel; nunca usa Esc para sair para uma página externa. */
export function useVoltarPainel() {
  const local = useLocation();
  const tipo = useNavigationType();
  const navegar = useNavigate();
  const historico = useRef({ chaves: [local.key], indice: 0, atual: local.key });
  useEffect(() => {
    const estado = historico.current;
    if (estado.atual === local.key) return;
    if (tipo === 'PUSH') {
      estado.chaves = [...estado.chaves.slice(0, estado.indice + 1), local.key];
      estado.indice++;
    } else if (tipo === 'REPLACE') estado.chaves[estado.indice] = local.key;
    else {
      const indice = estado.chaves.indexOf(local.key);
      if (indice >= 0) estado.indice = indice;
      else { estado.chaves = [local.key]; estado.indice = 0; }
    }
    estado.atual = local.key;
  }, [local.key, tipo]);

  useEffect(() => {
    function voltar(evento: KeyboardEvent) {
      if (evento.key !== 'Escape' || evento.defaultPrevented || evento.repeat || evento.isComposing) return;
      if (document.querySelector('.painel-ui dialog[open], .painel-ui [data-esc-camada]')) return;
      const alvo = evento.target instanceof Element ? evento.target : null;
      if (alvo?.closest('textarea, select, [contenteditable]:not([contenteditable="false"]), input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"])')) return;
      const destino = destinoInicial(local.pathname);
      if (historico.current.indice === 0 && destino === local.pathname) return;
      evento.preventDefault();
      if (historico.current.indice > 0) navegar(-1);
      else navegar(destino, { replace: true });
    }
    // Na fase de bubbling: tooltip, combobox e dialog recebem Esc antes do retorno.
    window.addEventListener('keydown', voltar);
    return () => window.removeEventListener('keydown', voltar);
  }, [local.pathname, navegar]);
}
