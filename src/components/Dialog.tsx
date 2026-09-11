import { useEffect, useId, useRef, type ReactNode, type SyntheticEvent } from 'react';
import { X } from 'lucide-react';
import styles from './Shared.module.css';
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
  return <dialog ref={reference} className={styles.dialog} aria-labelledby={titleId} onCancel={handleCancel}><div className={styles.dialogHeader}><h2 id={titleId}>{title}</h2><button className="buttonGhost" aria-label="Fechar" onClick={onClose}><X size={22}/></button></div>{children}</dialog>;
}
