import { useEffect, useRef, useState } from 'react';
import { IconeSetaExterna, IconeMenu, IconeModoEscuro, IconeModoClaro, IconeFechar } from './Icones';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { lerUrlCatalogo, rotas, urlCatalogo } from '../servicos/urls';
import { sinalizarIdaAosDevs } from '../servicos/obra';
import { brand } from '../config/brand';
import { useTema } from '../hooks/useTema';
import { useEscVoltar } from '../hooks/useEscVoltar';
import { telefoneWhatsapp } from '../servicos/contato';

// Uma variante do logo por tema; o CSS escolhe qual aparece (o SSR é o mesmo nos dois temas). `lazy` evita baixar a
// variante escondida. Tamanhos 1x/2x/3x da altura de 48px, gerados por scripts/gerar-logo.mjs.
// Mesma linha dourada dos links do cabeçalho; vai no texto porque o link do rodapé ocupa a altura toda do alvo de toque.
const linhaRodape = 'linha-nav [--linha-y:-4px]';
const itemRodape = 'flex min-h-11 w-fit items-center text-white';
const textoRodape = 'flex min-h-8 items-center text-white/80';
const classeLogo = 'h-12 w-auto max-w-57.5 object-contain object-left max-[900px]:h-10 max-[900px]:max-w-43.75';
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
  const location = useLocation();
  const consulta = lerUrlCatalogo(location.pathname + location.search);
  const detalheImovel = consulta === null && /^\/imoveis\/[^/]+\/?$/.test(location.pathname);
  const alugarAtivo = consulta?.finalidade === 'locacao';
  const comprarAtivo = consulta?.finalidade === 'venda';
  // Fora do catálogo, Esc volta para a tela inicial.
  useEscVoltar(consulta ? null : rotas.inicio);
  const classeAtiva = 'text-brand max-[650px]:text-gold';
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
      if (evento.key === 'Escape') { evento.preventDefault(); setMenuAberto(false); botaoMenu.current?.focus(); }
    };
    document.addEventListener('keydown', fecharComEscape);
    return () => { document.removeEventListener('keydown', fecharComEscape); document.body.style.overflow = overflowAnterior; };
  }, [menuAberto]);
  function fecharMenu(devolverFoco = true) {
    setMenuAberto(false);
    if (devolverFoco) botaoMenu.current?.focus();
  }
  const rotuloTema = escuro ? 'Ativar modo claro' : 'Ativar modo escuro';
  return <>
    <a className="skipLink" href="#main">Pular para o conteúdo</a>
    <header className="sticky top-0 z-40 border-b border-line bg-paper shadow-[inset_0_-2px_0_var(--color-gold)]">
      <div className="container flex min-h-26 items-center justify-between gap-8 max-[900px]:gap-4 max-[800px]:relative max-[800px]:min-h-21">
        <Link to={rotas.inicio} className="relative z-6 flex min-w-0 items-center gap-3 max-[900px]:gap-2 text-brand no-underline" aria-label={`${brand.name} — início`}>
          <img {...atributosLogo(brand.logo.temaClaro)} className={`${classeLogo} dark:hidden`} />
          <img {...atributosLogo(brand.logo.temaEscuro)} className={`${classeLogo} hidden dark:block`} />
        </Link>
        {menuAberto && <button type="button" aria-label="Fechar menu" onClick={() => fecharMenu()} className="fixed inset-0 z-4 hidden cursor-default border-0 bg-navy/60 p-0 max-[650px]:block" />}
        <div className="ml-auto flex shrink-0 items-center gap-4">
          <nav id="public-navigation" aria-label="Principal"
            className={`flex items-center gap-7.5 text-[15px] max-[900px]:gap-3 max-[900px]:text-sm max-[650px]:absolute max-[650px]:inset-x-0 max-[650px]:top-21 max-[650px]:z-5 max-[650px]:flex-col max-[650px]:items-stretch max-[650px]:gap-1 max-[650px]:border-b-[3px] max-[650px]:border-b-gold max-[650px]:bg-navy max-[650px]:p-6 max-[650px]:text-white max-[650px]:shadow-[0_12px_16px_#0001] ${menuAberto ? 'max-[650px]:flex' : 'max-[650px]:hidden'} max-[650px]:[&_a]:flex max-[650px]:[&_a]:min-h-12 max-[650px]:[&_a]:w-fit max-[650px]:[&_a]:items-center max-[650px]:[&_a]:text-[19px] [&_a]:[--linha-y:-6px] max-[650px]:[&_a]:[--linha-y:4px]`}>
            <Link ref={primeiroLink} to={urlCatalogo({ finalidade: 'locacao' })} state={{ rolarCatalogo: true }} className={`linha-nav ${alugarAtivo ? classeAtiva : ''}`} aria-current={alugarAtivo ? 'page' : undefined} onClick={() => fecharMenu(false)}>Alugar</Link>
            <Link to={urlCatalogo({ finalidade: 'venda' })} state={{ rolarCatalogo: true }} className={`linha-nav ${comprarAtivo ? classeAtiva : ''}`} aria-current={comprarAtivo ? 'page' : undefined} onClick={() => fecharMenu(false)}>Comprar</Link>
            <span className="flex items-center border-l border-line py-3 pl-8 max-[900px]:pl-3 max-[650px]:border-l-0 max-[650px]:border-t max-[650px]:border-t-white/20 max-[650px]:py-0 max-[650px]:pl-0"><Link to={rotas.painel} onClick={() => fecharMenu(false)} className="linha-nav inline-flex items-center gap-3.5">Área do corretor <IconeSetaExterna size={16} /></Link></span>
            <p aria-hidden="true" className="m-0 hidden pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold max-[650px]:block">CRECI {brand.creci}</p>
          </nav>
          <div className="relative z-6 flex items-center gap-2">
            <button type="button" onClick={alternar} aria-label={rotuloTema} aria-pressed={escuro} className="linha-nav inline-flex min-h-11 min-w-11 items-center justify-center rounded border-0 bg-transparent p-2.5 [--linha-x:12px] [--linha-y:6px]">{escuro ? <IconeModoClaro size={18} /> : <IconeModoEscuro size={18} />}</button>
            <button ref={botaoMenu} className="linha-nav hidden min-h-11 min-w-11 items-center justify-center rounded border-0 bg-transparent p-2.5 [--linha-x:12px] [--linha-y:6px] max-[650px]:inline-flex" aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuAberto} aria-controls="public-navigation" onClick={() => (menuAberto ? fecharMenu() : setMenuAberto(true))}>{menuAberto ? <IconeFechar /> : <IconeMenu />}</button>
          </div>
        </div>
      </div>
    </header>
    <main id="main"><Outlet /></main>
    <footer className="mt-12 border-t-2 border-gold bg-navy py-8 text-white md:mt-20">
      {/* Três linhas no desktop: a marca ocupa as duas primeiras da coluna 1 e a 3ª linha corre por baixo dela, de ponta a ponta.
          No celular `order` agrupa links, contato e dados. */}
      <div className="container grid gap-x-6 gap-y-1 text-sm md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[minmax(2.75rem,auto)_minmax(2.75rem,auto)_auto]">
        <div className="mb-6 md:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mb-0 lg:grid lg:grid-rows-subgrid"><p className="mb-1 font-display text-2xl text-white lg:mb-0 lg:self-center">{brand.name}</p><p className="mb-0 text-base text-white/80 lg:self-center">{brand.tagline}</p></div>
        <Link className={`${itemRodape} order-1 lg:order-0`} to={rotas.inicio}><span className={linhaRodape}>Imóveis comerciais</span></Link>
        {brand.contact.whatsapp && <a className={`${itemRodape} order-3 lg:order-0`} href={`https://wa.me/${telefoneWhatsapp(brand.contact.whatsapp)}`} target="_blank" rel="noopener noreferrer">WhatsApp: {brand.contact.whatsapp}</a>}
        <Link className={`${itemRodape} order-2 lg:order-0`} to={rotas.privacidade}><span className={linhaRodape}>Política de privacidade</span></Link>
        {brand.contact.email && <a className={`${itemRodape} order-4 lg:order-0`} href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>}
        {brand.contact.hours && <span className={`${textoRodape} order-5 lg:order-0 lg:mt-4`}>Atendimento: {brand.contact.hours}</span>}
        {brand.contact.address && <span className={`${textoRodape} order-6 lg:order-0 lg:mt-4`}>{brand.contact.address}</span>}
        <div className="order-7 flex min-h-8 items-center justify-between gap-4 md:col-span-2 lg:order-0 lg:col-span-1 lg:mt-4">
          <Link className="flex w-fit items-center text-white" to={rotas.devs} onClick={sinalizarIdaAosDevs}><span className={linhaRodape}>Desenvolvedores</span></Link>
        </div>
      </div>
      <div className="container mt-6 flex flex-wrap justify-between gap-3 border-t border-white/20 pt-5 text-xs text-white/80"><span>© {new Date().getFullYear()} {brand.name} — CRECI {brand.creci}</span><span>{brand.closing}</span></div>
    </footer>
    {detalheImovel && <div aria-hidden="true" className="hidden max-[760px]:block max-[760px]:h-[calc(130px+env(safe-area-inset-bottom))]" />}
  </>;
}
