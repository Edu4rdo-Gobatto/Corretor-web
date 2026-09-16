import type { ReactNode } from 'react';

/** Cabeçalho padrão das páginas do painel: rótulo pequeno, título, descrição e ações à direita. */
export default function CabecalhoPagina({ rotulo, titulo, descricao, acoes, voltar }: { rotulo?: string; titulo: string; descricao?: string; acoes?: ReactNode; voltar?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-5 max-[560px]:flex-col max-[560px]:items-stretch max-[560px]:[&_.button]:w-full">
      <div>
        {voltar}
        {rotulo && <p className="eyebrow">{rotulo}</p>}
        <h1 className="my-2 text-[clamp(26px,3vw,38px)] text-ink">{titulo}</h1>
        {descricao && <p className="muted">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-3">{acoes}</div>}
    </header>
  );
}
