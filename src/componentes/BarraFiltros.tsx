import type { FormEvent, ReactNode } from 'react';
import Campo from './Campo';
import { IconeFechar } from './Icones';

export type FiltroAplicado<C extends string = string> = { campo: C; rotulo: string };

type Propriedades<C extends string> = {
  children: ReactNode;
  /** Enter aplica na hora, sem esperar a espera da digitação. Sem ele, a barra é só o contêiner dos seletores. */
  aoEnviar?: () => void;
  aplicados?: readonly FiltroAplicado<C>[];
  aoRemover?: (campo: C) => void;
  aoLimpar?: () => void;
};

/**
 * Barra comum das listas do painel. Os filtros se aplicam sozinhos, então não há botão Buscar; Limpar fica na faixa
 * de filtros aplicados para a linha de campos não mudar de tamanho ao filtrar.
 */
export default function BarraFiltros<C extends string>({ children, aoEnviar, aplicados = [], aoRemover, aoLimpar }: Propriedades<C>) {
  const classe = 'barra-filtros mb-4 flex flex-wrap items-end gap-4 @max-[35rem]/principal:grid @max-[35rem]/principal:grid-cols-1 [&_label]:grid [&_label]:gap-1.5';
  function enviar(evento: FormEvent) { evento.preventDefault(); aoEnviar?.(); }
  return <>
    {aoEnviar ? <form noValidate role="search" className={classe} onSubmit={enviar}>{children}</form> : <div className={classe}>{children}</div>}
    {aplicados.length > 0 && <div aria-label="Filtros aplicados" className="mb-4 flex flex-wrap items-center gap-2">
      {aplicados.map(({ campo, rotulo }) => <button key={campo} type="button" className="chip-filtro-painel" aria-label={`Remover filtro: ${rotulo}`} onClick={() => aoRemover?.(campo)}><span className="break-words">{rotulo}</span><IconeFechar size={16} className="shrink-0" aria-hidden="true" /></button>)}
      {aoLimpar && <button type="button" className="buttonGhost" onClick={aoLimpar}>Limpar filtros</button>}
    </div>}
  </>;
}

type PropriedadesBusca = { valor: string; aoMudar: (valor: string) => void; placeholder: string };

/** Campo de busca padrão das listas: ocupa o espaço livre da linha. */
export function CampoBusca({ valor, aoMudar, placeholder }: PropriedadesBusca) {
  return <Campo rotulo="Buscar" classe="busca-painel"><input type="search" value={valor} onChange={(evento) => aoMudar(evento.target.value)} placeholder={placeholder} /></Campo>;
}
