import { useEffect, useId, useRef, type ReactNode, type SyntheticEvent } from 'react';
import { X } from 'lucide-react';

export default function Dialogo({ titulo, aoFechar, children }: { titulo: string; aoFechar: () => void; children: ReactNode }) {
  const referencia = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  useEffect(() => {
    const elementoAnterior = document.activeElement as HTMLElement | null;
    const dialogo = referencia.current;
    dialogo?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialogo?.close(); document.body.style.overflow = overflow; elementoAnterior?.focus(); };
  }, []);
  function cancelar(evento: SyntheticEvent<HTMLDialogElement>) {
    evento.preventDefault();
    aoFechar();
  }
  return (
    <dialog ref={referencia} className="max-h-[90dvh] w-[min(640px,calc(100vw-32px))] rounded-xl border-0 bg-paper p-8 text-ink backdrop:bg-[rgb(14_31_24/0.62)] max-[520px]:p-[22px]" aria-labelledby={idTitulo} onCancel={cancelar}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 id={idTitulo} className="mb-0 text-[27px]">{titulo}</h2>
        <button className="buttonGhost" aria-label="Fechar" onClick={aoFechar}><X size={22} /></button>
      </div>
      {children}
    </dialog>
  );
}
