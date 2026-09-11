import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowUpRight, Building2, Menu, X } from 'lucide-react';
import { brand, isDemo } from '../config/brand';
import styles from './PublicLayout.module.css';
export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    firstLinkRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);
  function closeMenu() {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }
  return <>
    <a className="skipLink" href="#main">Pular para o conteúdo</a>
    {isDemo && <div className={styles.demo} role="region" aria-label="Aviso de demonstração">Ambiente demonstrativo · Imóveis e contatos fictícios. Alterações duram até recarregar.</div>}
    <header className={styles.header}><div className={`container ${styles.headerInner}`}>
      <Link to="/" className={styles.brand} aria-label={`${brand.name} — início`}><Building2 strokeWidth={1.3} size={34}/><span>CORRETOR<span>COMERCIAL</span></span></Link>
      <button ref={menuButtonRef} className={`buttonGhost ${styles.menuToggle}`} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}>{menuOpen ? <X/> : <Menu/>}</button>
      <nav id="public-navigation" className={`${styles.navigation} ${menuOpen ? styles.open : ''}`} aria-label="Principal" onClick={closeMenu}><NavLink ref={firstLinkRef} to="/">Encontrar um imóvel</NavLink><Link to="/?purpose=LOCACAO">Alugar</Link><Link to="/?purpose=VENDA">Comprar</Link><Link to="/admin" className={styles.adminLink}>Área do corretor <ArrowUpRight size={16}/></Link></nav>
    </div></header>
    <main id="main"><Outlet/></main>
    <footer className={styles.footer}><div className={`container ${styles.footerInner}`}><div><p className={styles.footerBrand}>{brand.name}</p><p className="muted">{brand.tagline}</p></div><div><Link to="/">Imóveis comerciais</Link><Link to="/privacidade">Política de privacidade</Link><Link to="/admin">Área do corretor</Link></div></div><div className={`container ${styles.bottom}`}><span>© {new Date().getFullYear()} {brand.name}</span><span>Um novo espaço. Novas possibilidades.</span></div></footer>
  </>;
}
