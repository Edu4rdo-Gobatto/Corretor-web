import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { NavLink, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { rotas } from '../../servicos/urls';
import { mensagemErro } from '../../servicos/formato';
import { useSessao } from '../../hooks/useSessao';
import { useTema } from '../../hooks/useTema';
import { brand } from '../../config/brand';

const linkNavegacao = 'inline-flex min-h-10 items-center text-[14px] text-white/85 no-underline px-2.5 py-1.5 rounded snap-start whitespace-nowrap lg:min-h-11 lg:px-3 lg:py-3 lg:text-base aria-[current]:bg-white/20 aria-[current]:text-white hover:bg-white/10';

export default function LayoutPainel() {
  const { corretor, carregando, sair } = useSessao();
  const { escuro, alternar } = useTema();
  const [erroSaida, setErroSaida] = useState('');
  const [saindo, setSaindo] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [fotoQuebrada, setFotoQuebrada] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useEffect(() => { setFotoQuebrada(false); }, [corretor?.url_foto]);
  useEffect(() => {
    if (!menuAberto) return;
    const fecharComEscape = (evento: KeyboardEvent) => { if (evento.key === 'Escape') setMenuAberto(false); };
    const fecharFora = (evento: PointerEvent) => { if (menu.current && !menu.current.contains(evento.target as Node)) setMenuAberto(false); };
    document.addEventListener('keydown', fecharComEscape);
    document.addEventListener('pointerdown', fecharFora);
    return () => { document.removeEventListener('keydown', fecharComEscape); document.removeEventListener('pointerdown', fecharFora); };
  }, [menuAberto]);
  async function encerrar() {
    setSaindo(true);
    setErroSaida('');
    try { await sair(); setMenuAberto(false); } catch (erro) { setErroSaida(mensagemErro(erro)); } finally { setSaindo(false); }
  }
  if (carregando) return <p className="container" role="status">Verificando sua sessão…</p>;
  if (!corretor) return <Navigate to={rotas.entrar} state={{ de: location.pathname }} replace />;
  const mostrarFoto = Boolean(corretor.url_foto) && !fotoQuebrada;
  const inicial = corretor.nome.charAt(0).toUpperCase();
  const cargo = corretor.cargo === 'ADMIN' ? 'Administrador' : 'Corretor';
  const rotuloTema = escuro ? 'Ativar modo claro' : 'Ativar modo escuro';
  const foto = (classe: string) => mostrarFoto ? <img src={corretor.url_foto ?? ''} alt="" onError={() => setFotoQuebrada(true)} className={classe} /> : inicial;
  return (
    <div className="grid min-h-screen grid-cols-1 bg-soft lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-2 border-b-2 border-gold bg-navy px-4 py-2.5 text-white lg:gap-8 lg:border-b-0 lg:border-r-2 lg:px-6 lg:py-9">
        <div className="flex items-center justify-between gap-2 lg:block">
          <Link to={rotas.inicio} className="font-display text-[16px] leading-tight text-inherit no-underline lg:text-[21px] lg:leading-[1.5]">{brand.name}<br /><small style={{ fontFamily: 'Source Sans 3', fontSize: 11, letterSpacing: 3 }}>ÁREA DO CORRETOR</small></Link>
          <div ref={menu} className="relative flex items-center gap-1 lg:hidden">
            <button type="button" onClick={alternar} aria-label={rotuloTema} aria-pressed={escuro} className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded border border-white/40 bg-transparent text-white">{escuro ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button type="button" onClick={() => setMenuAberto((aberto) => !aberto)} aria-label={`Abrir menu de ${corretor.nome}`} aria-expanded={menuAberto} aria-haspopup="menu" className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded text-white">
              <span aria-hidden="true" className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-white/40 bg-white/10 text-sm font-semibold">{foto('h-full w-full object-cover')}</span>
            </button>
            {menuAberto && (
              <div role="menu" aria-label="Conta" className="absolute right-0 top-[calc(100%+8px)] z-10 w-60 rounded border border-white/15 bg-navy-deep p-2 shadow-xl">
                <p className="m-0 px-2 pb-1 pt-2 leading-tight"><strong className="block">{corretor.nome}</strong><small className="text-white/70">{cargo}</small></p>
                {erroSaida && <span role="alert" className="block px-2 py-1 text-[13px]">{erroSaida}</span>}
                <Link to={rotas.perfil} role="menuitem" onClick={() => setMenuAberto(false)} className="mt-1 inline-flex min-h-11 w-full items-center justify-center rounded bg-white/10 px-3 py-1.5 text-[13px] text-white no-underline">Meu perfil</Link>
                <button type="button" role="menuitem" disabled={saindo} onClick={encerrar} className="mt-1 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded border border-white/40 bg-transparent px-3 py-1.5 text-[13px] text-white disabled:opacity-60">{saindo ? 'Saindo…' : 'Sair da conta'}</button>
              </div>
            )}
          </div>
        </div>
        <nav aria-label="Administração" className="grid gap-2 max-lg:-mx-4 max-lg:flex max-lg:snap-x max-lg:gap-1 max-lg:overflow-x-auto max-lg:overscroll-contain max-lg:px-4 max-lg:pb-0">
          <NavLink to={rotas.painel} end className={linkNavegacao}>Visão geral</NavLink>
          <NavLink to={rotas.imoveis} className={linkNavegacao}>Imóveis</NavLink>
          <NavLink to={rotas.contatos} className={linkNavegacao}>Contatos</NavLink>
          <NavLink to={rotas.pessoas} className={linkNavegacao}>Pessoas</NavLink>
          <NavLink to="/admin/contratos" className={linkNavegacao}>Contratos</NavLink>
          <NavLink to="/admin/comissoes" className={linkNavegacao}>Comissões</NavLink>
          <NavLink to="/admin/cadastros" className={linkNavegacao}>Cadastros</NavLink>
          {corretor.cargo === 'ADMIN' && <NavLink to="/admin/corretores" className={linkNavegacao}>Corretores</NavLink>}
          <Link to={rotas.inicio} className={linkNavegacao}>Ver site ↗</Link>
        </nav>
        <div className="mt-auto hidden gap-2.5 lg:grid">
          <div className="flex items-center gap-3">
            <Link to={rotas.perfil} aria-label={`Ver perfil de ${corretor.nome}`} className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-base font-semibold text-white no-underline">{foto('h-full w-full object-cover')}</Link>
            <span className="leading-tight"><strong className="block">{corretor.nome}</strong><small className="text-white/70">{cargo}</small></span>
          </div>
          {erroSaida && <span role="alert">{erroSaida}</span>}
          <div className="flex items-center gap-2">
            <button disabled={saindo} onClick={encerrar} className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded border border-white/40 bg-transparent p-2.5 text-white disabled:opacity-60">{saindo ? 'Saindo…' : 'Sair da conta'}</button>
            <button type="button" onClick={alternar} aria-label={rotuloTema} aria-pressed={escuro} className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded border border-white/40 bg-transparent text-white">{escuro ? <Sun size={18} /> : <Moon size={18} />}</button>
          </div>
        </div>
      </aside>
      <main className="w-full min-w-0 max-w-[1500px] px-[18px] py-7 lg:p-12"><Outlet /></main>
    </div>
  );
}
