import type { FormEvent, ReactNode } from 'react';
import Campo from './Campo';
import { IconeFechar } from './Icones';

type Propriedades = {
  children: ReactNode;
  /** Enter aplica na hora, sem esperar a espera da digitação. Sem ele, a barra é só o contêiner dos seletores. */
  aoEnviar?: () => void;
  /** Há filtro aplicado: o X no canto do card aparece e `aoLimpar` desfaz todos de uma vez. */
  filtrado?: boolean;
  aoLimpar?: () => void;
};

/**
 * Card de filtros das listas do painel. Os filtros se aplicam sozinhos, então não há botão Buscar; com filtro aplicado,
 * um X no canto superior direito limpa todos (ele só aparece depois, então a linha de campos não muda de tamanho).
 */
export default function BarraFiltros({ children, aoEnviar, filtrado = false, aoLimpar }: Propriedades) {
  const classe = 'barra-filtros flex flex-wrap items-end gap-4 @max-[35rem]/principal:grid @max-[35rem]/principal:grid-cols-1 [&_label]:grid [&_label]:gap-1.5';
  function enviar(evento: FormEvent) { evento.preventDefault(); aoEnviar?.(); }
  return <div className="superficie-painel relative mb-4">
    {aoEnviar ? <form noValidate role="search" className={classe} onSubmit={enviar}>{children}</form> : <div className={classe}>{children}</div>}
    {filtrado && aoLimpar && <button type="button" className="limpar-filtros-painel" aria-label="Limpar filtros" title="Limpar filtros" onClick={aoLimpar}><IconeFechar size={20} aria-hidden="true" /></button>}
  </div>;
}

type PropriedadesBusca = { valor: string; aoMudar: (valor: string) => void; placeholder: string };

/** Campo de busca padrão das listas: ocupa o espaço livre da linha. */
export function CampoBusca({ valor, aoMudar, placeholder }: PropriedadesBusca) {
  return <Campo rotulo="Buscar" classe="busca-painel"><input type="search" value={valor} onChange={(evento) => aoMudar(evento.target.value)} placeholder={placeholder} /></Campo>;
}
