import type { ReactNode } from 'react';

export interface Coluna<T> { titulo: string; celula: (item: T) => ReactNode; classe?: string }

const cabecalho = 'border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3';
const celula = 'border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3';

/** Tabela do painel com rolagem horizontal no celular e estado vazio. */
export default function Tabela<T>({ colunas, itens, chave, vazio, rotulo }: { colunas: Coluna<T>[]; itens: T[]; chave: (item: T) => string | number; vazio: string; rotulo?: string }) {
  if (!itens.length) return <p className="px-5 py-10 text-center text-muted">{vazio}</p>;
  return (
    <div className="overflow-x-auto overscroll-contain">
      <table className="w-full min-w-[640px] border-collapse text-left" aria-label={rotulo}>
        <thead><tr>{colunas.map((coluna) => <th key={coluna.titulo} className={cabecalho}>{coluna.titulo}</th>)}</tr></thead>
        <tbody>
          {itens.map((item) => (
            <tr key={chave(item)}>
              {colunas.map((coluna) => <td key={coluna.titulo} className={`${celula} ${coluna.classe ?? ''}`}>{coluna.celula(item)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
