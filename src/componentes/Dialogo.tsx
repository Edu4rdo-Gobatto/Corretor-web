import { useEffect, useId, useRef, type ReactNode, type SyntheticEvent } from 'react';
import { X } from 'lucide-react';

export type TamanhoDialogo = 'estreito' | 'medio' | 'largo';

const larguras: Record<TamanhoDialogo, string> = {
  estreito: 'w-[min(480px,calc(100vw-32px))]',
  medio: 'w-[min(640px,calc(100vw-32px))]',
  largo: 'w-[min(880px,calc(100vw-32px))]',
};

/**
 * Modal nativo. `m-auto` é obrigatório: o reset do Tailwind zera a margem que o navegador usa para centralizar o
 * `<dialog>`. O cabeçalho fica fixo e o corpo rola por dentro; o corpo é um container, então as grades do
 * formulário usam a largura do modal, não a da janela.
 */
export default function Dialogo({ titulo, aoFechar, children, tamanho = 'medio' }: { titulo: string; aoFechar: () => void; children: ReactNode; tamanho?: TamanhoDialogo }) {
  const referencia = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  useEffect(() => {
    const elementoAnterior = document.activeElement as HTMLElement | null;
    const dialogo = referencia.current;
    // Trava a rolagem compensando a largura da barra: a página atrás não "pula" e o fundo cobre a tela inteira
    // (reservar a faixa com scrollbar-gutter deixava uma tira clara ao lado do fundo escuro).
    const larguraUtil = document.documentElement.clientWidth;
    const larguraBarra = larguraUtil > 0 ? window.innerWidth - larguraUtil : 0;
    const { overflow, paddingRight } = document.body.style;
    dialogo?.showModal();
    document.body.style.overflow = 'hidden';
    if (larguraBarra > 0) document.body.style.paddingRight = `${larguraBarra}px`;
    return () => { dialogo?.close(); document.body.style.overflow = overflow; document.body.style.paddingRight = paddingRight; elementoAnterior?.focus(); };
  }, []);
  function cancelar(evento: SyntheticEvent<HTMLDialogElement>) {
    evento.preventDefault();
    aoFechar();
  }
  return (
    <dialog ref={referencia} className={`m-auto max-h-[min(90dvh,960px)] overflow-hidden rounded-xl border-0 bg-paper p-0 text-ink shadow-2xl ${larguras[tamanho]}`} aria-labelledby={idTitulo} onCancel={cancelar}>
      <div className="flex max-h-[min(90dvh,960px)] flex-col">
        <div className="flex shrink-0 items-start justify-between gap-4 px-8 pb-4 pt-7 max-[520px]:px-[22px] max-[520px]:pt-5">
          <h2 id={idTitulo} className="mb-0 text-[27px]">{titulo}</h2>
          <button type="button" className="buttonGhost" aria-label="Fechar" onClick={aoFechar}><X size={22} /></button>
        </div>
        <div data-rolagem className="@container min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pb-8 max-[520px]:px-[22px] max-[520px]:pb-6">
          {children}
        </div>
      </div>
    </dialog>
  );
}
