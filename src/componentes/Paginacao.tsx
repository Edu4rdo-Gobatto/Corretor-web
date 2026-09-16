import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function rolarAoCatalogo() {
  const alvo = document.getElementById('catalogo');
  if (!alvo) return;
  const reduzir = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  alvo.scrollIntoView(reduzir ? undefined : { behavior: 'smooth' });
}

/** Com `href` vira links (catálogo público, rastreável); sem ele, botões (painel). */
export default function Paginacao({ pagina, totalPaginas, aoMudar, href }: { pagina: number; totalPaginas: number; aoMudar: (pagina: number) => void; href?: (pagina: number) => string }) {
  if (totalPaginas <= 1 && pagina <= 1) return null;
  const classe = 'mt-[38px] flex items-center justify-center gap-6';
  if (href) {
    return (
      <nav className={classe} aria-label="Paginação">
        {pagina > 1 ? <Link className="buttonSecondary" to={href(pagina - 1)} aria-label="Página anterior" onClick={rolarAoCatalogo}><ArrowLeft size={17} /></Link> : <span />}
        <span>Página {pagina} de {Math.max(1, totalPaginas)}</span>
        {pagina < totalPaginas ? <Link className="buttonSecondary" to={href(pagina + 1)} aria-label="Próxima página" onClick={rolarAoCatalogo}><ArrowRight size={17} /></Link> : <span />}
      </nav>
    );
  }
  return (
    <nav className={classe} aria-label="Paginação">
      <button type="button" className="buttonSecondary" disabled={pagina <= 1} onClick={() => aoMudar(pagina - 1)} aria-label="Página anterior"><ArrowLeft size={17} /></button>
      <span aria-live="polite">Página {pagina} de {Math.max(1, totalPaginas)}</span>
      <button type="button" className="buttonSecondary" disabled={pagina >= totalPaginas} onClick={() => aoMudar(pagina + 1)} aria-label="Próxima página"><ArrowRight size={17} /></button>
    </nav>
  );
}
