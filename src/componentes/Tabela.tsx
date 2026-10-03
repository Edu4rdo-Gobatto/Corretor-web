import type { ReactNode } from 'react';

export interface Coluna<T> { titulo: string; celula: (item: T) => ReactNode; classe?: string }

const cabecalho = 'border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3';
const celula = 'border-b border-line px-3 py-[18px] align-middle wrap-anywhere max-lg:px-2 max-lg:py-3';

/** Mesmos dados em tabela ampla e cartões quando o próprio container é estreito. */
export default function Tabela<T>({ colunas, itens, chave, vazio, rotulo }: { colunas: Coluna<T>[]; itens: T[]; chave: (item: T) => string | number; vazio: string; rotulo?: string }) {
  if (!itens.length) return <p className="px-5 py-10 text-center text-muted">{vazio}</p>;
  return (
    <div className="@container/tabela">
      <div className="hidden @min-[40rem]/tabela:block">
      <table className="w-full border-collapse text-left" aria-label={rotulo}>
        <thead><tr>{colunas.map((coluna) => <th key={coluna.titulo} className={cabecalho}>{coluna.titulo}</th>)}</tr></thead>
        <tbody>
          {itens.map((item) => (
            <tr key={chave(item)} className="transition-colors hover:bg-soft/40">
              {colunas.map((coluna) => <td key={coluna.titulo} className={`${celula} ${coluna.classe ?? ''}`}>{coluna.celula(item)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <ul aria-label={rotulo} className="m-0 grid list-none gap-0 p-0 @min-[40rem]/tabela:hidden">
        {itens.map((item) => <li key={chave(item)} className="min-w-0 border-b border-line py-5 first:pt-1 last:border-b-0">
          <dl className="m-0 grid gap-3">
            {colunas.map((coluna, indice) => <div key={`${coluna.titulo}-${indice}`} className={`min-w-0 ${indice === 0 ? '' : 'flex flex-wrap items-center justify-between gap-x-4 gap-y-1'}`}>
              <dt className="mb-1 text-xs font-semibold text-muted">{coluna.titulo || 'Ações'}</dt>
              <dd className="m-0 min-w-0 max-w-full wrap-anywhere text-sm [&_small]:wrap-anywhere">{coluna.celula(item)}</dd>
            </div>)}
          </dl>
        </li>)}
      </ul>
    </div>
  );
}
