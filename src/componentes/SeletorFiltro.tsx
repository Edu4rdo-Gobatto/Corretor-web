import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import Campo from './Campo';
import { IconeProximo, IconeSucesso } from './Icones';

type Opcao<T extends string> = { valor: T; rotulo: string };
type Propriedades<T extends string> = {
  rotulo: string; valor: T; opcoes: readonly Opcao<T>[]; aoMudar: (valor: T) => void;
  desabilitado?: boolean; classe?: string;
};

/** Seleção simples dos filtros: mantém o foco no campo e a lista na camada superior. */
export default function SeletorFiltro<T extends string>({ rotulo, valor, opcoes, aoMudar, desabilitado, classe = '' }: Propriedades<T>) {
  const id = useId();
  const campo = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const [aberto, setAberto] = useState(false);
  const [ativa, setAtiva] = useState(0);
  const busca = useRef({ texto: '', instante: 0 });
  const selecionada = Math.max(0, opcoes.findIndex((opcao) => opcao.valor === valor));

  useLayoutEffect(() => {
    const elemento = lista.current;
    if (!aberto || desabilitado || !elemento) return;
    const usaPopover = typeof elemento.showPopover === 'function';
    if (usaPopover) { elemento.setAttribute('popover', 'manual'); elemento.showPopover(); }
    function posicionar() {
      const caixa = campo.current?.getBoundingClientRect();
      if (!caixa || !elemento) return;
      const abaixo = window.innerHeight - caixa.bottom - 12;
      const acima = caixa.top - 12;
      const subir = abaixo < 240 && acima > abaixo;
      const altura = Math.max(0, Math.min(320, subir ? acima : abaixo));
      elemento.style.width = 'max-content';
      elemento.style.maxWidth = `${document.documentElement.clientWidth - 16}px`;
      const largura = Math.min(Math.max(caixa.width, elemento.scrollWidth, 220), document.documentElement.clientWidth - 16);
      elemento.style.width = `${largura}px`;
      elemento.style.maxHeight = `${altura}px`;
      elemento.style.left = `${Math.max(8, Math.min(caixa.left, document.documentElement.clientWidth - largura - 8))}px`;
      elemento.style.top = `${subir ? Math.max(8, caixa.top - Math.min(elemento.scrollHeight, altura) - 6) : caixa.bottom + 6}px`;
    }
    function fora(evento: PointerEvent) {
      if (!elemento?.contains(evento.target as Node) && !campo.current?.contains(evento.target as Node)) setAberto(false);
    }
    posicionar();
    document.addEventListener('pointerdown', fora);
    window.addEventListener('resize', posicionar);
    window.addEventListener('scroll', posicionar, true);
    return () => {
      document.removeEventListener('pointerdown', fora);
      window.removeEventListener('resize', posicionar);
      window.removeEventListener('scroll', posicionar, true);
      if (usaPopover && elemento.matches(':popover-open')) elemento.hidePopover();
    };
  }, [aberto, desabilitado]);

  useLayoutEffect(() => {
    if (aberto) lista.current?.children[ativa]?.scrollIntoView({ block: 'nearest' });
  }, [aberto, ativa]);

  function escolher(indice: number) {
    if (!opcoes[indice]) return;
    aoMudar(opcoes[indice].valor);
    setAberto(false);
    campo.current?.focus();
  }
  function teclado(evento: KeyboardEvent<HTMLButtonElement>) {
    if (evento.key === 'Escape' && aberto) {
      evento.preventDefault(); evento.stopPropagation(); setAberto(false); return;
    }
    if (evento.key === 'Tab') { setAberto(false); return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(evento.key)) {
      evento.preventDefault();
      setAberto(true);
      setAtiva(evento.key === 'Home' ? 0 : evento.key === 'End' ? opcoes.length - 1 : aberto
        ? Math.max(0, Math.min(opcoes.length - 1, ativa + (evento.key === 'ArrowDown' ? 1 : -1))) : selecionada);
    } else if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      if (aberto) escolher(ativa);
      else { setAtiva(selecionada); setAberto(true); }
    } else if (evento.key.length === 1 && !evento.ctrlKey && !evento.metaKey && !evento.altKey) {
      evento.preventDefault();
      const agora = Date.now();
      const texto = (agora - busca.current.instante < 700 ? busca.current.texto : '') + evento.key.toLocaleLowerCase('pt-BR');
      busca.current = { texto, instante: agora };
      const indice = opcoes.findIndex((opcao) => opcao.rotulo.toLocaleLowerCase('pt-BR').startsWith(texto));
      if (indice >= 0) { setAberto(true); setAtiva(indice); }
    }
  }
  return <div className={`min-w-0 ${classe}`}>
    <Campo rotulo={rotulo}>
      <button ref={campo} type="button" role="combobox" className="seletor-filtro" disabled={desabilitado}
        aria-expanded={aberto && !desabilitado} aria-controls={`${id}-lista`} aria-haspopup="listbox"
        aria-activedescendant={aberto && !desabilitado ? `${id}-opcao-${ativa}` : undefined}
        onKeyDown={teclado} onBlur={() => setAberto(false)}
        onClick={() => { setAtiva(selecionada); setAberto(!aberto); }}>
        <span className="min-w-0 flex-1 text-left break-normal">{opcoes.find((opcao) => opcao.valor === valor)?.rotulo ?? 'Selecione'}</span>
        <IconeProximo size={20} aria-hidden="true" className={`shrink-0 ${aberto ? '-rotate-90' : 'rotate-90'}`} />
      </button>
    </Campo>
    {aberto && !desabilitado && <ul ref={lista} id={`${id}-lista`} role="listbox" aria-label={rotulo} className="lista-filtro" data-esc-camada>
      {opcoes.map((opcao, indice) => <li key={opcao.valor} id={`${id}-opcao-${indice}`} role="option" aria-selected={opcao.valor === valor}
        data-ativa={indice === ativa || undefined} onPointerDown={(evento) => evento.preventDefault()} onClick={() => escolher(indice)}>
        <span className="min-w-0 flex-1 break-normal">{opcao.rotulo}</span>
        {opcao.valor === valor && <IconeSucesso size={20} aria-hidden="true" className="shrink-0" />}
      </li>)}
    </ul>}
  </div>;
}
