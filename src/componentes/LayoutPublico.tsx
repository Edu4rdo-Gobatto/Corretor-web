import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { rotas, urlCatalogo } from '../servicos/urls';
import { brand } from '../config/brand';
import { useTema } from '../hooks/useTema';
import { telefoneWhatsapp } from '../servicos/contato';

// Uma variante do logo por tema; o CSS escolhe qual aparece (o SSR é o mesmo nos dois temas). `lazy` evita baixar a
// variante escondida. Tamanhos 1x/2x/3x da altura de 48px, gerados por scripts/gerar-logo.mjs.
const classeLogo = 'h-[48px] w-auto max-w-[230px] object-contain object-left max-[900px]:h-10 max-[900px]:max-w-[175px]';
const atributosLogo = (base: string) => ({
  src: `${base}-48.webp`,
  srcSet: `${base}-48.webp 1x, ${base}-96.webp 2x, ${base}-144.webp 3x`,
  width: Math.round(48 * brand.logo.proporcao),
  height: 48,
  alt: `${brand.logo.first} — ${brand.logo.second}`,
  loading: 'lazy' as const,
  decoding: 'async' as const,
});

export default function LayoutPublico() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { escuro, alternar } = useTema();
  const botaoMenu = useRef<HTMLButtonElement>(null);
  const primeiroLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!menuAberto) return;
    primeiroLink.current?.focus();
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') { setMenuAberto(false); botaoMenu.current?.focus(); }
    };
    document.addEventListener('keydown', fecharComEscape);
    return () => { document.removeEventListener('keydown', fecharComEscape); document.body.style.overflow = overflowAnterior; };
  }, [menuAberto]);
  function fecharMenu(devolverFoco = true) {
    setMenuAberto(false);
    if (devolverFoco) botaoMenu.current?.focus();
  }
  const rotuloTema = escuro ? 'Ativar modo claro' : 'Ativar modo escuro';
  const temContato = brand.contact.whatsapp || brand.contact.email || brand.contact.hours || brand.contact.address;
  return <>
    <a className="skipLink" href="#main">Pular para o conteúdo</a>
    <header className="sticky top-0 z-40 border-b border-line bg-paper shadow-[inset_0_-2px_0_var(--color-gold)]">
      <div className="container flex min-h-[104px] items-center justify-between gap-8 max-[900px]:gap-4 max-[800px]:relative max-[800px]:min-h-[84px]">
        <Link to={rotas.inicio} className="relative z-[6] flex min-w-0 items-center gap-3 max-[900px]:gap-2 text-brand no-underline" aria-label={`${brand.name} — início`}>
          <img {...atributosLogo(brand.logo.temaClaro)} className={`${classeLogo} dark:hidden`} />
          <img {...atributosLogo(brand.logo.temaEscuro)} className={`${classeLogo} hidden dark:block`} />
        </Link>
        {menuAberto && <button type="button" aria-label="Fechar menu" onClick={() => fecharMenu()} className="fixed inset-0 z-[4] hidden cursor-default border-0 bg-navy/60 p-0 max-[650px]:block" />}
        <div className="ml-auto flex shrink-0 items-center gap-4">
          <nav id="public-navigation" aria-label="Principal"
            className={`flex items-center gap-[30px] text-[15px] max-[900px]:gap-3 max-[900px]:text-sm max-[650px]:absolute max-[650px]:inset-x-0 max-[650px]:top-[84px] max-[650px]:z-[5] max-[650px]:flex-col max-[650px]:items-stretch max-[650px]:gap-1 max-[650px]:border-b-[3px] max-[650px]:border-b-gold max-[650px]:bg-navy max-[650px]:p-6 max-[650px]:text-white max-[650px]:shadow-[0_12px_16px_#0001] ${menuAberto ? 'max-[650px]:flex' : 'max-[650px]:hidden'} max-[650px]:[&_a]:flex max-[650px]:[&_a]:min-h-12 max-[650px]:[&_a]:items-center max-[650px]:[&_a]:font-display max-[650px]:[&_a]:text-[19px] [&_a]:no-underline [&_a:hover]:underline`}>
            <NavLink ref={primeiroLink} to={rotas.inicio} end onClick={() => fecharMenu(false)}>Encontrar um imóvel</NavLink>
            <Link to={urlCatalogo({ finalidade: 'locacao' })} onClick={() => fecharMenu(false)}>Alugar</Link>
            <Link to={urlCatalogo({ finalidade: 'venda' })} onClick={() => fecharMenu(false)}>Comprar</Link>
            <Link to={rotas.painel} onClick={() => fecharMenu(false)} className="flex items-center gap-[14px] border-l border-line py-3 pl-8 max-[900px]:pl-3 max-[650px]:min-h-12 max-[650px]:border-l-0 max-[650px]:border-t max-[650px]:border-t-[#ffffff2e] max-[650px]:pl-0 max-[650px]:font-sans max-[650px]:text-base">Área do corretor <ArrowUpRight size={16} /></Link>
            <p aria-hidden="true" className="m-0 hidden pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold max-[650px]:block">CRECI {brand.creci}</p>
          </nav>
          <div className="relative z-[6] flex items-center gap-2">
            <button type="button" onClick={alternar} aria-label={rotuloTema} aria-pressed={escuro} className="buttonGhost inline-flex min-h-11 min-w-11 items-center justify-center">{escuro ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button ref={botaoMenu} className="hidden min-h-11 min-w-11 items-center justify-center rounded border border-transparent bg-transparent p-2.5 font-semibold hover:bg-soft max-[650px]:inline-flex" aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuAberto} aria-controls="public-navigation" onClick={() => (menuAberto ? fecharMenu() : setMenuAberto(true))}>{menuAberto ? <X /> : <Menu />}</button>
          </div>
        </div>
      </div>
    </header>
    <main id="main"><Outlet /></main>
    <footer className="mt-12 border-t-2 border-gold bg-navy py-8 text-white md:mt-20">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div><p className="mb-1 font-display text-2xl text-white">{brand.name}</p><p className="mb-3 text-xs text-gold">{brand.credential}</p><p className="text-white/80">{brand.tagline}</p></div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm [&_a]:flex [&_a]:min-h-11 [&_a]:items-center [&_a]:text-white [&_a:hover]:underline">
          <Link to={rotas.inicio}>Imóveis comerciais</Link>
          <Link to={urlCatalogo({ finalidade: 'locacao' })}>Alugar</Link>
          <Link to={urlCatalogo({ finalidade: 'venda' })}>Comprar</Link>
          <Link to={rotas.privacidade}>Política de privacidade</Link>
          <Link to={rotas.devs}>Desenvolvedores</Link>
          <Link to={rotas.painel}>Área do corretor</Link>
        </div>
        {temContato && <address className="grid content-start gap-2 text-sm not-italic text-white/80">
          {brand.contact.whatsapp && <a className="min-h-11 text-white" href={`https://wa.me/${telefoneWhatsapp(brand.contact.whatsapp)}`} target="_blank" rel="noopener noreferrer">WhatsApp: {brand.contact.whatsapp}</a>}
          {brand.contact.email && <a className="min-h-11 text-white" href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>}
          {brand.contact.hours && <span>Atendimento: {brand.contact.hours}</span>}
          {brand.contact.address && <span>{brand.contact.address}</span>}
          {brand.contact.creci && <span>{brand.contact.creci}</span>}
        </address>}
      </div>
      <div className="container mt-6 flex flex-wrap justify-between gap-3 border-t border-white/20 pt-5 text-xs text-white/80"><span>© {new Date().getFullYear()} {brand.name} — CRECI {brand.creci}</span><span>{brand.closing}</span></div>
    </footer>
  </>;
}
