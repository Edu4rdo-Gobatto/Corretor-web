import { useId, type ReactNode } from 'react';

/** Seção do painel: o título fica acima da superfície e participa do alinhamento da grade. */
export function SecaoPainel({ titulo, children, descricao, acoes, classe = '', classeConteudo = '', ampla = false, id }: {
  titulo: ReactNode;
  children: ReactNode;
  descricao?: string;
  acoes?: ReactNode;
  classe?: string;
  classeConteudo?: string;
  ampla?: boolean;
  id?: string;
}) {
  const tituloId = useId();
  return <section id={id} className={`bloco-painel ${ampla ? 'bloco-painel-amplo' : ''} ${classe}`} aria-labelledby={tituloId}>
    <div className="bloco-painel-cabecalho">
      <div className="min-w-0"><h2 id={tituloId}>{titulo}</h2>{descricao && <p className="mb-0 mt-1 text-base text-muted">{descricao}</p>}</div>
      {acoes && <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2">{acoes}</div>}
    </div>
    <div className={`superficie-painel ${classeConteudo}`}>{children}</div>
  </section>;
}

/** Grades de seções usam a largura disponível, com alturas uniformes somente por linha. */
export function GradePainel({ children, classe = '', colunas = 3 }: { children: ReactNode; classe?: string; colunas?: 2 | 3 }) {
  return <div className="grade-painel-container"><div className={`grade-painel ${colunas === 2 ? 'grade-painel-dupla' : ''} ${classe}`}>{children}</div></div>;
}

/** Leitura rótulo/valor reutilizável, mantendo o conteúdo como ReactNode para links e etiquetas. */
export function DadosFicha({ children, classe = '', colunas = 1 }: { children: ReactNode; classe?: string; colunas?: 1 | 2 }) {
  return <dl className={`dados-ficha-painel ${colunas === 2 ? 'dados-ficha-painel-dupla' : ''} ${classe}`}>{children}</dl>;
}

export function DadoFicha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return <div><dt>{rotulo}</dt><dd>{children === null || children === undefined || children === '' ? 'Não informado' : children}</dd></div>;
}
