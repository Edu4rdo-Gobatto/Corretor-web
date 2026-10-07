import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IconeProximo } from './Icones';

export type OpcaoFiltro = { valor: string; rotulo: string; icone?: ReactNode };
type Propriedades = {
  /** Fixo (não `useId`): a árvore do SSR difere da do cliente e geraria ids diferentes na hidratação. */
  id: string; rotulo: string; resumo: string; opcoes: OpcaoFiltro[]; selecionados: string[];
  aoMudar: (valores: string[]) => void; multiplo?: boolean;
  /** Sem "Todos" (ex.: ordenação, que sempre tem um valor): não há estado neutro, então nada recebe o destaque de filtro ativo. */
  todos?: boolean;
};

/**
 * Seletor do catálogo no desktop: um botão abre a lista de opções como rádios (escolha única) ou caixas de seleção
 * (várias). "Todos" vem primeiro e limpa a escolha; marcar todas as opções equivale a "Todos". A escolha é aplicada
 * na hora. O de escolha única fecha ao clicar numa opção; pelo teclado, Enter, Esc ou Tab fecham.
 */
export default function FiltroSuspenso({ id, rotulo, resumo, opcoes, selecionados, aoMudar, multiplo = false, todos = true }: Propriedades) {
  const raiz = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const [aberto, setAberto] = useState(false);
  // Escolha única fecha ao clicar, mas não com as setas do teclado (que também trocam o rádio marcado).
  const porPonteiro = useRef(false);
  const ativo = todos && selecionados.length > 0;

  useEffect(() => {
    if (!aberto) return;
    function fora(evento: PointerEvent) { if (!raiz.current?.contains(evento.target as Node)) setAberto(false); }
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [aberto]);

  function fechar() { setAberto(false); gatilho.current?.focus(); }
  function escolher(valor: string) {
    if (!multiplo) { aoMudar(valor ? [valor] : []); if (porPonteiro.current) fechar(); return; }
    if (!valor) { aoMudar([]); return; }
    const proximos = selecionados.includes(valor) ? selecionados.filter((item) => item !== valor) : [...selecionados, valor];
    aoMudar(proximos.length === opcoes.length ? [] : proximos);
  }

  return <div ref={raiz} className="relative min-w-0"
    onKeyDown={(evento) => {
      if (!aberto || (evento.key !== 'Escape' && evento.key !== 'Enter') || evento.target === gatilho.current) return;
      evento.preventDefault();
      fechar();
    }}
    // Sem relatedTarget o foco foi para o corpo (clique no texto de uma opção): quem fecha é o clique fora.
    onBlur={(evento) => { if (aberto && evento.relatedTarget && !raiz.current?.contains(evento.relatedTarget as Node)) setAberto(false); }}>
    <span id={`${id}-rotulo`} className="mb-2 block text-sm font-semibold">{rotulo}</span>
    <button ref={gatilho} type="button" aria-expanded={aberto} aria-controls={`${id}-opcoes`} aria-labelledby={`${id}-rotulo ${id}-resumo`}
      onKeyDown={(evento) => { if (evento.key === 'Escape' && aberto) { evento.preventDefault(); setAberto(false); } }}
      onClick={() => setAberto(!aberto)}
      className={`flex min-h-12 w-full items-center gap-3 rounded-[4px] border bg-transparent px-4 text-left text-base transition-colors hover:border-navy dark:hover:border-gold ${aberto ? 'border-navy dark:border-gold' : 'border-[var(--color-control-line)]'} ${ativo ? 'font-semibold shadow-[inset_0_-2px_0_var(--color-gold)]' : ''}`}>
      <span id={`${id}-resumo`} className="min-w-0 flex-1 truncate">{resumo}</span>
      <IconeProximo size={20} aria-hidden="true" className={`shrink-0 text-muted transition-transform ${aberto ? '-rotate-90' : 'rotate-90'}`} />
    </button>
    {aberto && <fieldset id={`${id}-opcoes`} onPointerDown={() => { porPonteiro.current = true; }} onKeyDown={() => { porPonteiro.current = false; }} className="absolute left-0 top-[calc(100%+6px)] z-30 m-0 max-h-[min(60vh,380px)] w-full min-w-[240px] overflow-y-auto overscroll-contain rounded-md border border-line bg-paper p-1.5 shadow-[0_14px_32px_color-mix(in_srgb,var(--color-navy-deep)_24%,transparent)]">
      <legend className="sr-only">{rotulo}</legend>
      {(todos ? [{ valor: '', rotulo: 'Todos' }, ...opcoes] : opcoes).map((opcao) => {
        const marcado = opcao.valor ? selecionados.includes(opcao.valor) : !ativo;
        return <label key={opcao.valor || '-todos'}
          className={`flex min-h-11 cursor-pointer items-center gap-3 rounded px-3 py-2 text-base font-normal hover:bg-soft has-[:focus-visible]:bg-soft ${marcado ? 'font-semibold' : ''} ${opcao.valor ? '' : 'mb-1 border-b border-line'}`}>
          <input type={multiplo ? 'checkbox' : 'radio'} name={`${id}-opcao`} checked={marcado} onChange={() => escolher(opcao.valor)}
            className="m-0 size-[19px] min-h-0 shrink-0 p-0 accent-[var(--green)] focus-visible:outline-offset-2" />
          {opcao.icone && <span className="shrink-0 text-muted" aria-hidden="true">{opcao.icone}</span>}
          <span className="min-w-0 flex-1">{opcao.rotulo}</span>
        </label>;
      })}
    </fieldset>}
  </div>;
}
