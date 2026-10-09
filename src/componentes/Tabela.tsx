import type { MouseEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Coluna<T> { titulo: string; celula: (item: T) => ReactNode; classe?: string; acoes?: boolean }

const cabecalho = 'border-b border-line bg-cabecalho-tabela px-4 py-3 text-left text-base font-semibold text-texto-cabecalho-tabela first:pl-5 last:pr-5';
const celula = 'px-4 py-3.5 align-middle wrap-anywhere first:pl-5 last:pr-5';
// Linhas alternadas em todas as listagens do painel; o hover passa por cima da cor da linha.
const linha = 'odd:bg-linha-a even:bg-linha-b hover:bg-linha-foco';
// Cliques nestes elementos executam só a própria ação, nunca a abertura da linha.
const interativos = 'a, button, input, select, textarea, label, summary, [role="button"], [role="tooltip"], [role="checkbox"], [data-nao-abrir-linha]';

/**
 * Mesmos dados em tabela ampla e blocos quando o próprio container é estreito. Com `linkLinha`, a linha inteira
 * abre o destino: clique comum na mesma guia, Ctrl/⌘/Shift ou botão do meio em nova guia. O teclado usa o link
 * real que a primeira coluna deve conter. Colunas com `acoes` ficam sempre à direita.
 */
export default function Tabela<T>({ colunas, itens, chave, vazio, rotulo, linkLinha }: { colunas: Coluna<T>[]; itens: T[]; chave: (item: T) => string | number; vazio: string; rotulo?: string; linkLinha?: (item: T) => string }) {
  const navegar = useNavigate();
  if (!itens.length) return <p className="rounded-[5px] border border-line bg-paper px-5 py-8 text-center text-base text-muted">{vazio}</p>;
  function abrir(evento: MouseEvent<HTMLElement>, destino: string) {
    if ((evento.target as Element).closest(interativos)) return;
    if (window.getSelection()?.toString()) return;
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.button === 1) window.open(destino, '_blank', 'noopener');
    else navegar(destino);
  }
  const clicavel = (item: T) => {
    if (!linkLinha) return {};
    const destino = linkLinha(item);
    return {
      onClick: (evento: MouseEvent<HTMLElement>) => abrir(evento, destino),
      onAuxClick: (evento: MouseEvent<HTMLElement>) => { if (evento.button === 1) abrir(evento, destino); },
      // Evita a rolagem automática do botão do meio sobre a linha.
      onMouseDown: (evento: MouseEvent<HTMLElement>) => { if (evento.button === 1 && !(evento.target as Element).closest(interativos)) evento.preventDefault(); },
    };
  };
  return (
    <div className="tabela-painel @container/tabela">
      <div className="superficie-tabela-painel hidden overflow-hidden rounded-[5px] border border-line border-t-[3px] border-t-gold shadow-sm @min-[40rem]/tabela:block">
        <table className="w-full border-collapse text-left" aria-label={rotulo}>
          <thead><tr>{colunas.map((coluna) => <th key={coluna.titulo} className={`${cabecalho} ${coluna.acoes ? 'text-right whitespace-nowrap' : ''}`}>{coluna.acoes ? <span className="sr-only">{coluna.titulo}</span> : coluna.titulo}</th>)}</tr></thead>
          <tbody>
            {itens.map((item) => (
              <tr key={chave(item)} className={`${linha} ${linkLinha ? 'cursor-pointer' : ''}`} {...clicavel(item)}>
                {colunas.map((coluna) => <td key={coluna.titulo} className={`${celula} ${coluna.acoes ? 'whitespace-nowrap' : ''} ${coluna.classe ?? ''}`}>{coluna.acoes ? <div className="acoes-linha flex flex-wrap items-center justify-end gap-2 @min-[40rem]/tabela:flex-nowrap @min-[40rem]/tabela:min-w-max">{coluna.celula(item)}</div> : coluna.celula(item)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul aria-label={rotulo} className="m-0 grid list-none gap-4 p-0 @min-[40rem]/tabela:hidden">
        {itens.map((item) => <li key={chave(item)} className={`cartao-tabela min-w-0 rounded-[5px] border border-line border-t-[3px] border-t-gold px-4 py-4 shadow-sm ${linha} ${linkLinha ? 'cursor-pointer' : ''}`} {...clicavel(item)}>
          <dl className="m-0 grid gap-3">
            {colunas.map((coluna, indice) => coluna.acoes
              ? <div key={`${coluna.titulo}-${indice}`} className="acoes-linha col-span-full mt-1 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-3">{coluna.celula(item)}</div>
              : <div key={`${coluna.titulo}-${indice}`} className={`min-w-0 ${indice === 0 ? '' : 'grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-x-3 gap-y-1'}`}>
                <dt className={indice === 0 ? 'sr-only' : 'text-base font-semibold text-muted'}>{coluna.titulo}</dt>
                <dd className={`m-0 min-w-0 max-w-full wrap-anywhere [&_small]:wrap-anywhere ${indice === 0 ? '' : 'text-right [&_div]:justify-end [&_small.flex]:justify-end'}`}>{coluna.celula(item)}</dd>
              </div>)}
          </dl>
        </li>)}
      </ul>
    </div>
  );
}
