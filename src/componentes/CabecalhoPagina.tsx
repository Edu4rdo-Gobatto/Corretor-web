import type { ReactNode } from 'react';

/** Cabeçalho padrão das páginas do painel: título à esquerda, ações na borda direita e descrição abaixo. */
export default function CabecalhoPagina({ rotulo, titulo, descricao, acoes, voltar }: { rotulo?: string; titulo: string; descricao?: string; acoes?: ReactNode; voltar?: ReactNode }) {
  return (
    <header className="mb-7 grid gap-2">
      {voltar}
      {rotulo && <p className="eyebrow mb-0">{rotulo}</p>}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        <h1 className="m-0 text-[28px] leading-tight text-ink">{titulo}</h1>
        {acoes && <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2">{acoes}</div>}
      </div>
      {descricao && <p className="mb-0 text-base text-muted">{descricao}</p>}
    </header>
  );
}
