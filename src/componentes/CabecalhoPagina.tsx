import type { ReactNode } from 'react';
import BotaoVoltar from './BotaoVoltar';

/** Cabeçalho padrão das páginas do painel: voltar e título na mesma linha, ações na borda direita e descrição abaixo, alinhada ao título. */
export default function CabecalhoPagina({ rotulo, titulo, descricao, acoes, voltar }: { rotulo?: string; titulo: string; descricao?: string; acoes?: ReactNode; voltar?: { to: string; rotulo: string } }) {
  // Recuo do texto abaixo do título = largura do botão (44px) + espaço (16px).
  const recuo = voltar ? 'pl-15' : '';
  return (
    <header className="mb-7 grid gap-2">
      {rotulo && <p className={`eyebrow mb-0 ${recuo}`}>{rotulo}</p>}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        <div className="flex min-w-0 items-center gap-4">
          {voltar && <BotaoVoltar {...voltar} />}
          <h1 className="m-0 text-[28px] leading-tight text-ink">{titulo}</h1>
        </div>
        {acoes && <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2">{acoes}</div>}
      </div>
      {descricao && <p className={`mb-0 text-base text-muted ${recuo}`}>{descricao}</p>}
    </header>
  );
}
