import type { ReactNode } from 'react';

/** Cabeçalho padrão das páginas do painel: rótulo pequeno, título, descrição e ações à direita. */
export default function CabecalhoPagina({ rotulo, titulo, descricao, acoes, voltar }: { rotulo?: string; titulo: string; descricao?: string; acoes?: ReactNode; voltar?: ReactNode }) {
  return (
    <header className="mb-7 flex flex-wrap items-center justify-between gap-4 @max-[35rem]/principal:flex-col @max-[35rem]/principal:items-stretch @max-[35rem]/principal:[&_.button]:w-full">
      <div>
        {voltar}
        {rotulo && <p className="eyebrow mb-2">{rotulo}</p>}
        <h1 className="my-2 text-[clamp(26px,3vw,36px)] text-ink">{titulo}</h1>
        {descricao && <p className="mb-0 text-sm text-muted">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-3">{acoes}</div>}
    </header>
  );
}
