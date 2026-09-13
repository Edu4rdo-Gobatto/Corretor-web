import { routes, catalogUrl } from '../services/urls';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { brand } from '../config/brand';
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
    <header className="border-b border-line bg-paper shadow-[inset_0_-2px_0_var(--color-gold)]"><div className="container flex min-h-[104px] items-center justify-between gap-8 max-[800px]:relative max-[800px]:min-h-[84px]">
      <Link to={routes.home} className="flex items-center gap-3 text-navy no-underline" aria-label={`${brand.name} — início`}><svg className="h-[34px] w-[52px] shrink-0 text-gold" viewBox="0 0 64 40" aria-hidden="true" focusable="false"><path d="M4 36V16L22 4l18 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 36V16l14-9 14 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 36h56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg><span className="text-[19px] font-bold leading-[1.05] tracking-[0.08em]">{brand.logo.first}<span className="mt-[6px] block text-[10px] font-semibold tracking-[0.18em] text-navy">{brand.logo.second}</span></span></Link>
      <button ref={menuButtonRef} className="buttonGhost hidden max-[650px]:inline-flex" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}>{menuOpen ? <X/> : <Menu/>}</button>
      <nav id="public-navigation" className={`flex items-center gap-[30px] text-[15px] max-[800px]:gap-[18px] max-[800px]:text-sm max-[650px]:absolute max-[650px]:inset-x-[-18px] max-[650px]:top-[84px] max-[650px]:z-[5] max-[650px]:hidden max-[650px]:bg-paper max-[650px]:p-6 max-[650px]:shadow-[0_12px_16px_#0001] ${menuOpen ? 'max-[650px]:flex max-[650px]:flex-col max-[650px]:items-stretch' : ''} [&_a]:no-underline [&_a:hover]:underline`} aria-label="Principal" onClick={closeMenu}><NavLink ref={firstLinkRef} to={routes.home} end>Encontrar um imóvel</NavLink><Link to={catalogUrl({purpose:'LOCACAO'})}>Alugar</Link><Link to={catalogUrl({purpose:'VENDA'})}>Comprar</Link><Link to={routes.admin} className="flex items-center gap-[14px] border-l border-line py-3 pl-8 max-[800px]:pl-[18px] max-[650px]:border-l-0 max-[650px]:pl-0">Área do corretor <ArrowUpRight size={16}/></Link></nav>
    </div></header>
    <main id="main"><Outlet/></main>
    <footer className="mb-0 mt-[80px] border-t-2 border-gold bg-navy pb-[18px] pt-[42px] text-white"><div className="container flex justify-between gap-8 max-[650px]:flex-col"><div><p className="mb-1 font-display text-2xl text-white">{brand.name}</p><p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{brand.credential}</p><p className="m-0 text-[#C6CEDD]">{brand.tagline}</p></div><div className="flex items-start gap-7 text-sm max-[800px]:flex-col max-[800px]:gap-2.5 [&_a]:text-white [&_a]:no-underline [&_a:hover]:text-gold"><Link to={routes.home}>Imóveis comerciais</Link><Link to={routes.privacy}>Política de privacidade</Link><Link to={routes.admin}>Área do corretor</Link></div></div><div className="container mt-6 flex justify-between gap-8 border-t border-[#ffffff2e] pt-[18px] text-xs text-[#C6CEDD] max-[650px]:flex-col max-[650px]:gap-2"><span>© {new Date().getFullYear()} {brand.name} — CRECI {brand.creci}</span><span>{brand.closing}</span></div></footer>
  </>;
}
