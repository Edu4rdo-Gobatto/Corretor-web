import { useEffect, useId, useRef, type ReactNode, type SyntheticEvent } from 'react';
import { X } from 'lucide-react';
export default function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const reference = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const focusedElement = document.activeElement as HTMLElement | null;
    const dialog = reference.current;
    dialog?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = overflow; focusedElement?.focus(); };
  }, []);
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onClose();
  }
  return <dialog ref={reference} className="max-h-[90dvh] w-[min(580px,calc(100vw-32px))] rounded-xl border-0 bg-paper p-8 text-ink backdrop:bg-[rgb(14_31_24/0.62)] max-[520px]:p-[22px]" aria-labelledby={titleId} onCancel={handleCancel}><div className="mb-5 flex items-start justify-between gap-4"><h2 id={titleId} className="mb-0 text-[27px]">{title}</h2><button className="buttonGhost" aria-label="Fechar" onClick={onClose}><X size={22}/></button></div>{children}</dialog>;
}
