import { useEffect, useRef, useState } from 'react';
import { IconeCarregando, type Icone } from './Icones';
import { Link } from 'react-router-dom';

function slugificar(texto: string): string {
  const base = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return base || 'acao';
}

type Propriedades = {
  icone: Icone;
  rotulo: string;
  /** Fixo e estável entre SSR e cliente. Obrigatório em rota pública; no painel o padrão deriva de `rotulo`+`contexto`. */
  id?: string;
  to?: string;
  href?: string;
  aoClicar?: () => void;
  desabilitado?: boolean;
  ocupado?: boolean;
  tom?: 'neutro' | 'perigo';
  target?: string;
  tipo?: 'button' | 'submit';
  /** Completa o nome acessível (ex.: o nome da pessoa) sem alongar a dica visível. */
  contexto?: string;
};

/**
 * Ação só com ícone. A dica visível mostra o verbo curto ("Editar"); `contexto` entra apenas no nome acessível
 * ("Editar Fulano"), para o leitor de tela distinguir as linhas sem alongar a dica.
 *
 * O id da dica é estável entre SSR e cliente (não usa `useId`, cuja árvore difere nos dois lados):
 * usa `id` quando informado, senão `acao-<rotulo>[-<contexto>]`. Em rota pública prefira `id` explícito,
 * sobretudo quando `rotulo` muda com o estado (ex.: Pausar/Retomar).
 */
export default function AcaoIcone({ icone: Icone, rotulo, id, to, href, aoClicar, desabilitado = false, ocupado = false, tom = 'neutro', target, tipo = 'button', contexto }: Propriedades) {
  const idDica = id ?? `acao-${slugificar(rotulo)}${contexto ? `-${slugificar(contexto).slice(0, 32)}` : ''}`;
  const [dicaOculta, setDicaOculta] = useState(false);
  const [deslocamentoDica, setDeslocamentoDica] = useState(0);
  const [dicaAtiva, setDicaAtiva] = useState(false);
  const grupo = useRef<HTMLSpanElement>(null);
  const dica = useRef<HTMLSpanElement>(null);
  const bloqueado = desabilitado || ocupado;
  const classe = `acao-icone ${tom === 'perigo' ? 'acao-perigo' : ''}`;
  const conteudo = ocupado ? <IconeCarregando size={20} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Icone size={20} aria-hidden="true" />;
  const atributos = { className: classe, 'aria-label': contexto ? `${rotulo} ${contexto}` : rotulo, 'aria-describedby': contexto ? undefined : idDica, 'aria-busy': ocupado || undefined };
  useEffect(() => {
    if (!dicaAtiva || dicaOculta) return;
    const elementoDica = dica.current;
    const painel = Boolean(grupo.current?.closest('.painel-ui'));
    const usaCamada = painel && elementoDica && typeof elementoDica.showPopover === 'function';
    function posicionar() {
      const caixa = grupo.current?.getBoundingClientRect();
      if (!caixa || !elementoDica) return;
      const largura = elementoDica.getBoundingClientRect().width;
      const altura = elementoDica.getBoundingClientRect().height;
      const limiteX = Math.max(8, document.documentElement.clientWidth - largura - 8);
      const limiteY = Math.max(8, window.innerHeight - altura - 8);
      elementoDica.style.left = `${Math.max(8, Math.min(caixa.right - largura, limiteX))}px`;
      elementoDica.style.top = `${Math.max(8, Math.min(caixa.top - altura - 6 >= 8 ? caixa.top - altura - 6 : caixa.bottom + 6, limiteY))}px`;
      elementoDica.style.transform = 'none';
    }
    if (usaCamada) {
      elementoDica.setAttribute('popover', 'manual');
      elementoDica.classList.add('dica-painel');
      elementoDica.showPopover();
      posicionar();
      window.addEventListener('resize', posicionar);
      window.addEventListener('scroll', posicionar, true);
    }
    function fecharDica(evento: KeyboardEvent) {
      if (evento.key !== 'Escape') return;
      setDicaOculta(true);
      evento.preventDefault();
      evento.stopPropagation();
      if (painel) evento.stopImmediatePropagation();
    }
    document.addEventListener('keydown', fecharDica, painel);
    return () => {
      document.removeEventListener('keydown', fecharDica, painel);
      window.removeEventListener('resize', posicionar);
      window.removeEventListener('scroll', posicionar, true);
      if (usaCamada && elementoDica.isConnected && elementoDica.matches(':popover-open')) elementoDica.hidePopover();
    };
  }, [dicaAtiva, dicaOculta, ocupado]);
  function mostrarDica() {
    setDicaOculta(false);
    setDicaAtiva(true);
    if (grupo.current?.closest('.painel-ui') && typeof dica.current?.showPopover === 'function') return;
    const caixa = grupo.current?.getBoundingClientRect();
    const elementoDica = dica.current;
    if (!caixa || !elementoDica) return;
    const largura = elementoDica.getBoundingClientRect().width;
    const esquerda = caixa.right - largura;
    const limite = document.documentElement.clientWidth - largura - 8;
    setDeslocamentoDica(Math.max(8, Math.min(esquerda, limite)) - esquerda);
  }
  return <span ref={grupo} className={`grupo-acao ${dicaOculta ? 'dica-oculta' : ''}`} onFocus={mostrarDica} onMouseEnter={mostrarDica}
    onBlur={(evento) => { if (!evento.currentTarget.contains(evento.relatedTarget as Node | null) && !evento.currentTarget.matches(':hover')) setDicaAtiva(false); }}
    onMouseLeave={() => { if (!grupo.current?.contains(document.activeElement)) setDicaAtiva(false); }}>
    {to ? <Link {...atributos} to={to} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} aria-disabled={bloqueado || undefined} tabIndex={bloqueado ? -1 : undefined} onClick={(evento) => { if (bloqueado) evento.preventDefault(); else aoClicar?.(); }}>{conteudo}</Link>
      : href ? <a {...atributos} href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} aria-disabled={bloqueado || undefined} tabIndex={bloqueado ? -1 : undefined} onClick={(evento) => { if (bloqueado) evento.preventDefault(); else aoClicar?.(); }}>{conteudo}</a>
      : <button {...atributos} type={tipo} disabled={bloqueado} onClick={aoClicar}>{conteudo}</button>}
    <span ref={dica} id={idDica} role="tooltip" aria-hidden={contexto ? true : undefined} className="dica-acao" style={{ transform: `translateX(${deslocamentoDica}px)` }}>{ocupado ? 'Aguarde…' : rotulo}</span>
  </span>;
}
