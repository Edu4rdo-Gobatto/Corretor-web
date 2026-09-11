import { ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './Shared.module.css';
export default function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1 && page <= 1) return null;
  return <nav className={styles.pagination} aria-label="Paginação"><button className="buttonSecondary" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Página anterior"><ArrowLeft size={17}/></button><span aria-live="polite">Página {page} de {Math.max(1,totalPages)}</span><button className="buttonSecondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Próxima página"><ArrowRight size={17}/></button></nav>;
}
