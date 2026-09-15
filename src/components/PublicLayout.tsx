import { routes, catalogUrl } from '../services/urls';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { brand } from '../config/brand';
import { useTheme } from '../hooks/useTheme';
export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    firstLinkRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);
  function closeMenu(returnFocus = true) {
    setMenuOpen(false);
    if (returnFocus) menuButtonRef.current?.focus();
  }
  const themeLabel = isDark ? 'Ativar modo claro' : 'Ativar modo escuro';
  return <>
    <a className="skipLink" href="#main">Pular para o conteúdo</a>
    <header className="sticky top-0 z-40 border-b border-line bg-paper shadow-[inset_0_-2px_0_var(--color-gold)]"><div className="container flex min-h-[104px] items-center justify-between gap-8 max-[900px]:gap-4 max-[800px]:relative max-[800px]:min-h-[84px]">
      <Link to={routes.home} className="flex min-w-0 items-center gap-3 max-[900px]:gap-2 text-brand no-underline" aria-label={`${brand.name} — início`}><svg className="h-[34px] w-[52px] shrink-0 max-[900px]:w-10 text-gold" viewBox="0 0 64 40" aria-hidden="true" focusable="false"><path d="M4 36V16L22 4l18 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 36V16l14-9 14 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 36h56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg><span className="text-[19px] max-[900px]:text-[15px] font-bold leading-[1.05] tracking-[0.08em]">{brand.logo.first}<span className="mt-[6px] block text-[10px] max-[900px]:text-[8px] font-semibold tracking-[0.18em] text-brand">{brand.logo.second}</span></span></Link>
      {menuOpen && <button type="button" aria-label="Fechar menu" onClick={() => closeMenu()} className="fixed inset-0 z-[4] hidden cursor-default border-0 bg-navy/60 p-0 max-[650px]:block" />}
      <div className="ml-auto flex shrink-0 items-center gap-4">
      <nav id="public-navigation" className={`flex items-center gap-[30px] text-[15px] max-[900px]:gap-3 max-[900px]:text-sm max-[650px]:absolute max-[650px]:inset-x-0 max-[650px]:top-[84px] max-[650px]:z-[5] max-[650px]:flex-col max-[650px]:items-stretch max-[650px]:gap-1 max-[650px]:border-b-[3px] max-[650px]:border-b-gold max-[650px]:bg-navy max-[650px]:p-6 max-[650px]:text-white max-[650px]:shadow-[0_12px_16px_#0001] ${menuOpen ? 'max-[650px]:flex' : 'max-[650px]:hidden'} max-[650px]:[&_a]:flex max-[650px]:[&_a]:min-h-12 max-[650px]:[&_a]:items-center max-[650px]:[&_a]:font-display max-[650px]:[&_a]:text-[19px] [&_a]:no-underline [&_a:hover]:underline`} aria-label="Principal"><NavLink ref={firstLinkRef} to={routes.home} end onClick={() => closeMenu(false)}>Encontrar um imóvel</NavLink><Link to={catalogUrl({purpose:'LOCACAO'})} onClick={() => closeMenu(false)}>Alugar</Link><Link to={catalogUrl({purpose:'VENDA'})} onClick={() => closeMenu(false)}>Comprar</Link><Link to={routes.admin} onClick={() => closeMenu(false)} className="flex items-center gap-[14px] border-l border-line py-3 pl-8 max-[900px]:pl-3 max-[650px]:min-h-12 max-[650px]:border-l-0 max-[650px]:border-t max-[650px]:border-t-[#ffffff2e] max-[650px]:pl-0 max-[650px]:font-sans max-[650px]:text-base">Área do corretor <ArrowUpRight size={16}/></Link><p aria-hidden="true" className="m-0 hidden pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold max-[650px]:block">CRECI {brand.creci}</p></nav>
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggle} aria-label={themeLabel} aria-pressed={isDark} className="buttonGhost inline-flex min-h-11 min-w-11 items-center justify-center">{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
        <button ref={menuButtonRef} className="hidden min-h-11 min-w-11 items-center justify-center rounded border border-transparent bg-transparent p-2.5 font-semibold hover:bg-soft max-[650px]:inline-flex" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}>{menuOpen ? <X/> : <Menu/>}</button>
      </div>
      </div>
    </div></header>
    <main id="main"><Outlet/></main>
    <footer className="mb-0 mt-[80px] border-t-2 border-gold bg-navy pb-[18px] pt-[42px] text-white max-[650px]:mt-12 max-[650px]:pb-[calc(14px+env(safe-area-inset-bottom))] max-[650px]:pt-8"><div className="container flex justify-between gap-8 max-[650px]:flex-col max-[650px]:gap-6"><div><p className="mb-1 font-display text-2xl text-white">{brand.name}</p><p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{brand.credential}</p><p className="m-0 text-[#C6CEDD]">{brand.tagline}</p></div><div className="flex items-start gap-7 text-sm max-[800px]:flex-col max-[800px]:gap-2.5 max-[650px]:gap-1 max-[650px]:[&_a]:flex max-[650px]:[&_a]:min-h-11 max-[650px]:[&_a]:items-center [&_a]:text-white [&_a]:no-underline [&_a:hover]:text-gold"><Link to={routes.home}>Imóveis comerciais</Link><Link to={routes.privacy}>Política de privacidade</Link><Link to={routes.devs}>Desenvolvedores</Link><Link to={routes.admin}>Área do corretor</Link></div></div><div className="container mt-6 flex justify-between gap-8 border-t border-[#ffffff2e] pt-[18px] text-xs text-[#C6CEDD] max-[650px]:flex-col max-[650px]:gap-2"><span>© {new Date().getFullYear()} {brand.name} — CRECI {brand.creci}</span><span>{brand.closing}</span></div></footer>
  </>;
}
