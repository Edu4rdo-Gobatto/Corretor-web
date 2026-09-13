import { ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './Shared.module.css';
import { Link } from 'react-router-dom';
export default function Pagination({ page, totalPages, onChange, href }: { page: number; totalPages: number; onChange: (page: number) => void; href?: (page: number) => string }) {
  if (totalPages <= 1 && page <= 1) return null;
  if (href) return <nav className={styles.pagination} aria-label="Paginação">{page > 1 ? <Link className="buttonSecondary" to={href(page - 1)} aria-label="Página anterior"><ArrowLeft size={17}/></Link> : <span/>}<span>Página {page} de {Math.max(1, totalPages)}</span>{page < totalPages ? <Link className="buttonSecondary" to={href(page + 1)} aria-label="Próxima página"><ArrowRight size={17}/></Link> : <span/>}</nav>;
  return <nav className={styles.pagination} aria-label="Paginação"><button type="button" className="buttonSecondary" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Página anterior"><ArrowLeft size={17}/></button><span aria-live="polite">Página {page} de {Math.max(1,totalPages)}</span><button type="button" className="buttonSecondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Próxima página"><ArrowRight size={17}/></button></nav>;
}
