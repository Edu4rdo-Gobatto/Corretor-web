import { useEffect, useRef, useState } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { NavLink, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { rotas } from '../../servicos/urls';
import { mensagemErro } from '../../servicos/formato';
import { useSessao } from '../../hooks/useSessao';
import { useTema } from '../../hooks/useTema';
import { brand } from '../../config/brand';
import Dialogo from '../../componentes/Dialogo';
import Aviso from '../../componentes/Aviso';

const linkNavegacao = 'inline-flex min-h-11 items-center rounded px-3 py-2.5 text-base text-white/85 no-underline aria-[current]:bg-white/20 aria-[current]:text-white hover:bg-white/10';
const destinos = [
  { to: rotas.painel, nome: 'Visão geral', end: true },
  { to: rotas.imoveis, nome: 'Imóveis' },
  { to: rotas.contatos, nome: 'Contatos' },
  { to: rotas.pessoas, nome: 'Pessoas' },
  { to: '/admin/contratos', nome: 'Contratos' },
  { to: '/admin/comissoes', nome: 'Comissões' },
  { to: '/admin/cadastros', nome: 'Cadastros', admin: true },
  { to: '/admin/corretores', nome: 'Corretores', admin: true },
];

function tituloPagina(caminho: string) {
  if (caminho === rotas.perfil) return 'Meu perfil';
  if (caminho === '/admin/imoveis/novo') return 'Novo imóvel';
  if (/^\/admin\/imoveis\/\d+\/editar/.test(caminho)) return 'Ficha do imóvel';
  if (/^\/admin\/pessoas\/\d+/.test(caminho)) return 'Ficha da pessoa';
  if (/^\/admin\/contratos\/\d+/.test(caminho)) return 'Detalhe do contrato';
  return destinos.find((destino) => destino.to === caminho)?.nome ?? 'Painel';
}

export default function LayoutPainel() {
  const { corretor, carregando, sair } = useSessao();
  const { escuro, alternar } = useTema();
  const [erroSaida, setErroSaida] = useState('');
  const [saindo, setSaindo] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const [fotoQuebrada, setFotoQuebrada] = useState(false);
  const principal = useRef<HTMLElement>(null);
  const location = useLocation();
  const caminhoAnterior = useRef(location.pathname);
  const paginaAtual = tituloPagina(location.pathname);

  useEffect(() => { setFotoQuebrada(false); }, [corretor?.url_foto]);
  useEffect(() => {
    document.title = `${paginaAtual} · ${brand.name}`;
    if (caminhoAnterior.current === location.pathname) return;
    caminhoAnterior.current = location.pathname;
    setMenuAberto(false);
    setContaAberta(false);
    const quadro = requestAnimationFrame(() => principal.current?.focus());
    return () => cancelAnimationFrame(quadro);
  }, [location.pathname, paginaAtual]);

  async function encerrar() {
    setSaindo(true);
    setErroSaida('');
    try { await sair(); setContaAberta(false); } catch (erro) { setErroSaida(mensagemErro(erro)); } finally { setSaindo(false); }
  }
  if (carregando) return <p className="container" role="status">Verificando sua sessão…</p>;
  if (!corretor) return <Navigate to={rotas.entrar} state={{ de: location.pathname }} replace />;
  const mostrarFoto = Boolean(corretor.url_foto) && !fotoQuebrada;
  const inicial = corretor.nome.charAt(0).toUpperCase();
  const cargo = corretor.cargo === 'ADMIN' ? 'Administrador' : 'Corretor';
  const rotuloTema = escuro ? 'Ativar modo claro' : 'Ativar modo escuro';
  const foto = (classe: string) => mostrarFoto ? <img src={corretor.url_foto ?? ''} alt="" onError={() => setFotoQuebrada(true)} className={classe} /> : inicial;
  const navegacao = (mobile = false) => <nav aria-label="Administração" className="grid gap-1">
    {destinos.filter((destino) => !destino.admin || corretor.cargo === 'ADMIN').map((destino) => <NavLink key={destino.to} to={destino.to} end={destino.end} className={mobile ? 'inline-flex min-h-11 items-center rounded px-3 py-2.5 text-ink no-underline aria-[current]:bg-soft aria-[current]:font-semibold hover:bg-soft' : linkNavegacao} onClick={() => setMenuAberto(false)}>{destino.nome}</NavLink>)}
    {mobile && <NavLink to={rotas.perfil} className="inline-flex min-h-11 items-center rounded px-3 py-2.5 text-ink no-underline aria-[current]:bg-soft aria-[current]:font-semibold hover:bg-soft" onClick={() => setMenuAberto(false)}>Meu perfil</NavLink>}
    <Link to={rotas.inicio} className={mobile ? 'inline-flex min-h-11 items-center rounded px-3 py-2.5 no-underline' : linkNavegacao} onClick={() => setMenuAberto(false)}>Ver site ↗</Link>
  </nav>;
  return (
    <div className="grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr] bg-background lg:grid-cols-[240px_minmax(0,1fr)] lg:grid-rows-1">
      <a href="#conteudo-painel" onClick={(evento) => { evento.preventDefault(); principal.current?.focus(); }} className="sr-only z-50 rounded bg-paper px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Pular para o conteúdo</a>
      <aside className="flex flex-col gap-3 border-b-2 border-gold bg-navy px-4 py-3 text-white lg:sticky lg:top-0 lg:h-dvh lg:gap-8 lg:overflow-y-auto lg:border-b-0 lg:border-r-2 lg:px-6 lg:py-9">
        <div className="flex items-center justify-between gap-3 lg:block">
          <Link to={rotas.inicio} className="min-w-0 font-display text-[16px] leading-tight text-inherit no-underline lg:text-[21px] lg:leading-[1.5]">{brand.name}<br /><small className="font-sans text-[11px] tracking-[0.2em]">ÁREA DO CORRETOR</small></Link>
          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            <button type="button" onClick={alternar} aria-label={rotuloTema} aria-pressed={escuro} className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded border border-white/40 bg-transparent text-white">{escuro ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button type="button" onClick={() => setContaAberta(true)} aria-label={`Abrir conta de ${corretor.nome}`} aria-haspopup="dialog" className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded text-white">
              <span aria-hidden="true" className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-white/40 bg-white/10 text-sm font-semibold">{foto('h-full w-full object-cover')}</span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 lg:hidden"><span className="min-w-0 truncate text-sm font-semibold">{paginaAtual}</span><button type="button" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded border border-white/40 bg-transparent px-3 text-white" aria-haspopup="dialog" onClick={() => setMenuAberto(true)}><Menu size={19} aria-hidden="true" />Menu</button></div>
        <div className="hidden lg:block">{navegacao()}</div>
        <div className="mt-auto hidden gap-2.5 lg:grid">
          <div className="flex items-center gap-3">
            <Link to={rotas.perfil} aria-label={`Ver perfil de ${corretor.nome}`} className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-base font-semibold text-white no-underline">{foto('h-full w-full object-cover')}</Link>
            <span className="min-w-0 leading-tight"><strong className="block break-words">{corretor.nome}</strong><small className="text-white/70">{cargo}</small></span>
          </div>
          {erroSaida && <Aviso tom="erro">{erroSaida}</Aviso>}
          <div className="flex items-center gap-2">
            <button disabled={saindo} onClick={encerrar} className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded border border-white/40 bg-transparent p-2.5 text-white disabled:opacity-60">{saindo ? 'Saindo…' : 'Sair da conta'}</button>
            <button type="button" onClick={alternar} aria-label={rotuloTema} aria-pressed={escuro} className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded border border-white/40 bg-transparent text-white">{escuro ? <Sun size={18} /> : <Moon size={18} />}</button>
          </div>
        </div>
      </aside>
      <main ref={principal} id="conteudo-painel" tabIndex={-1} aria-label={paginaAtual} className="@container/principal mx-auto w-full min-w-0 max-w-[1500px] px-[18px] py-7 lg:p-12"><Outlet /></main>
      {menuAberto && <Dialogo titulo="Navegação do painel" tamanho="estreito" aoFechar={() => setMenuAberto(false)}>{navegacao(true)}</Dialogo>}
      {contaAberta && <Dialogo titulo="Minha conta" tamanho="estreito" aoFechar={() => { if (!saindo) setContaAberta(false); }}><p><strong className="block">{corretor.nome}</strong><span className="text-muted">{cargo}</span></p>{erroSaida && <Aviso tom="erro">{erroSaida}</Aviso>}<div className="grid gap-3"><Link to={rotas.perfil} onClick={() => setContaAberta(false)} className="buttonSecondary">Meu perfil</Link><button type="button" disabled={saindo} onClick={encerrar} className="buttonGhost">{saindo ? 'Saindo…' : 'Sair da conta'}</button></div></Dialogo>}
    </div>
  );
}
