import { urlFotoCorretor } from '../../servicos/fotos';
import { useEffect, useRef, useState } from 'react';
import { IconeComissoes, IconeCorretores, IconeEdificio, IconeAbrirFora, IconeContrato, IconeVisaoGeral, IconeCadastros, IconeMenu, IconeContatos, IconeModoEscuro, IconeModoClaro, IconePessoa, IconePessoas, IconeProximo, type Icone } from '../../componentes/Icones';
import { NavLink, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { rotas } from '../../servicos/urls';
import { mensagemErro } from '../../servicos/formato';
import { useSessao } from '../../hooks/useSessao';
import { useTema } from '../../hooks/useTema';
import { brand } from '../../config/brand';
import Dialogo from '../../componentes/Dialogo';
import Aviso from '../../componentes/Aviso';
import { useVoltarPainel } from '../../hooks/useVoltarPainel';
import { IconeBuscar } from '../../componentes/Icones';
import PaletaPainel from '../../componentes/PaletaPainel';
import { ProvedorComandosPainel } from '../../hooks/useComandosPainel';

// O ícone só ganha a base dourada no destino ativo; os demais ficam neutros ao lado do nome. O nome segue o estilo
// dos cabeçalhos do site (.linha-nav): negrito e linha dourada no hover/foco, fixa no destino atual. No desktop os itens
// dividem a altura livre entre 40px e 64px: espaçados em telas altas e sem rolagem até ~620px de altura.
const linkNavegacao = 'group flex max-h-16 min-h-10 flex-[1_1_52px] items-center gap-3 rounded-[10px] px-1.5 text-[18px] font-semibold text-white/85 no-underline hover:text-white aria-[current]:text-white [--linha-y:-4px]';
const linkNavegacaoMobile = 'group flex min-h-12 items-center gap-3 rounded-xl px-2 py-1.5 text-[18px] font-semibold text-ink no-underline [--linha-y:-4px]';
// Botões do topo da sidebar: sem borda, no mesmo estilo dos links (linha dourada sob o ícone ou o texto).
const botaoIcone = 'linha-nav grid cursor-pointer place-items-center rounded-[10px] border-0 bg-transparent text-white [--linha-x:10px] [--linha-y:4px]';
const botaoTexto = 'inline-flex cursor-pointer items-center rounded-[10px] border-0 bg-transparent font-semibold text-white [--linha-y:-4px]';
const baseIcone = 'grid h-9 w-9 shrink-0 place-items-center rounded-lg group-aria-[current]:bg-acao-painel group-aria-[current]:text-sobre-acao';
// A sidebar é sempre navy: usa a variante do logo com as cores originais (texto claro).
const logo = (altura: number, classe: string) => <img src={`${brand.logo.temaEscuro}-48.webp`} srcSet={`${brand.logo.temaEscuro}-48.webp 1x, ${brand.logo.temaEscuro}-96.webp 2x, ${brand.logo.temaEscuro}-144.webp 3x`}
  width={Math.round(altura * brand.logo.proporcao)} height={altura} alt={`${brand.logo.first} — ${brand.logo.second}`} decoding="async" className={`w-auto max-w-full object-contain object-left ${classe}`} />;
const destinos: { to: string; nome: string; icone: Icone; end?: boolean; admin?: boolean }[] = [
  { to: rotas.painel, nome: 'Visão geral', icone: IconeVisaoGeral, end: true },
  { to: rotas.imoveis, nome: 'Imóveis', icone: IconeEdificio },
  { to: rotas.contatos, nome: 'Contatos', icone: IconeContatos },
  { to: rotas.pessoas, nome: 'Pessoas', icone: IconePessoas },
  { to: '/admin/contratos', nome: 'Contratos', icone: IconeContrato },
  { to: '/admin/comissoes', nome: 'Comissões', icone: IconeComissoes },
  { to: '/admin/cadastros', nome: 'Cadastros', icone: IconeCadastros, admin: true },
  { to: '/admin/corretores', nome: 'Corretores', icone: IconeCorretores, admin: true },
];

function tituloPagina(caminho: string) {
  if (caminho === rotas.perfil) return 'Meu perfil';
  if (caminho === '/admin/imoveis/novo') return 'Novo imóvel';
  if (/^\/admin\/imoveis\/\d+\/editar/.test(caminho)) return 'Editar imóvel';
  if (/^\/admin\/imoveis\/\d+/.test(caminho)) return 'Ficha do imóvel';
  if (/^\/admin\/pessoas\/\d+/.test(caminho)) return 'Ficha da pessoa';
  if (/^\/admin\/contratos\/\d+/.test(caminho)) return 'Detalhe do contrato';
  if (/^\/admin\/comissoes\/\d+/.test(caminho)) return 'Detalhe da comissão';
  if (/^\/admin\/cadastros\//.test(caminho)) return 'Ficha do cadastro';
  if (/^\/admin\/corretores\/\d+/.test(caminho)) return 'Perfil do corretor';
  return destinos.find((destino) => destino.to === caminho)?.nome ?? 'Painel';
}

export default function LayoutPainel() {
  return <ProvedorComandosPainel><EstruturaPainel /></ProvedorComandosPainel>;
}

function EstruturaPainel() {
  const { corretor, carregando, sair } = useSessao();
  const { escuro, alternar } = useTema();
  const [erroSaida, setErroSaida] = useState('');
  const [saindo, setSaindo] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const [fotoQuebrada, setFotoQuebrada] = useState(false);
  const [paletaAberta, setPaletaAberta] = useState(false);
  const principal = useRef<HTMLElement>(null);
  const location = useLocation();
  const caminhoAnterior = useRef(location.pathname);
  const paginaAtual = tituloPagina(location.pathname);
  useVoltarPainel();

  useEffect(() => {
    function comando(evento: KeyboardEvent) {
      if (!(evento.ctrlKey || evento.metaKey) || evento.altKey || evento.key.toLowerCase() !== 'k' || evento.defaultPrevented || evento.isComposing || evento.repeat) return;
      evento.preventDefault();
      if (!document.querySelector('.painel-ui dialog[open]')) setPaletaAberta(true);
    }
    document.addEventListener('keydown', comando);
    return () => document.removeEventListener('keydown', comando);
  }, []);

  useEffect(() => { setFotoQuebrada(false); }, [corretor?.url_foto]);
  useEffect(() => {
    document.title = `${paginaAtual} · ${brand.name}`;
    if (caminhoAnterior.current === location.pathname) return;
    caminhoAnterior.current = location.pathname;
    setMenuAberto(false);
    setContaAberta(false);
    setPaletaAberta(false);
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
  const foto = (classe: string) => mostrarFoto ? <img src={urlFotoCorretor(corretor)} alt="" onError={() => setFotoQuebrada(true)} className={classe} /> : inicial;
  const visiveis = destinos.filter((destino) => !destino.admin || corretor.cargo === 'ADMIN');
  const itensMenu = visiveis.length + 1; // + "Ver site"
  const navegacao = (mobile = false) => {
    const classe = mobile ? linkNavegacaoMobile : linkNavegacao;
    const item = (Icone: Icone, nome: string) => <><span aria-hidden="true" className={baseIcone}><Icone size={22} /></span><span className="linha-nav min-w-0">{nome}</span></>;
    return <nav aria-label="Administração" className={mobile ? 'grid gap-0.5' : 'flex min-h-0 flex-1 flex-col gap-1'}>
      {visiveis.map((destino) => <NavLink key={destino.to} to={destino.to} end={destino.end} className={classe} onClick={() => setMenuAberto(false)}>{item(destino.icone, destino.nome)}</NavLink>)}
      {mobile && <NavLink to={rotas.perfil} className={classe} onClick={() => setMenuAberto(false)}>{item(IconePessoa, 'Meu perfil')}</NavLink>}
      <Link to={rotas.inicio} className={classe} onClick={() => setMenuAberto(false)}>{item(IconeAbrirFora, 'Ver site')}</Link>
    </nav>;
  };
  return (
    <div className="painel-ui grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr] bg-background lg:grid-cols-[260px_minmax(0,1fr)] lg:grid-rows-1">
      <a href="#conteudo-painel" onClick={(evento) => { evento.preventDefault(); principal.current?.focus(); }} className="sr-only z-50 rounded bg-paper px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Pular para o conteúdo</a>
      <aside className="flex flex-col gap-3 border-b-2 border-gold bg-navy px-4 py-3 text-white lg:sticky lg:top-0 lg:h-dvh lg:gap-4 lg:overflow-y-auto lg:border-b-0 lg:border-r-2 lg:px-4 lg:py-5">
        <div className="flex items-center justify-between gap-3 lg:block">
          <Link to={rotas.inicio} className="block min-w-0 text-inherit no-underline lg:px-1.5">{logo(48, 'h-9 lg:h-12')}<span className="mt-1 hidden text-sm text-white/70 lg:block">Área do corretor</span></Link>
          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            <button type="button" onClick={alternar} aria-label={rotuloTema} aria-pressed={escuro} className={`${botaoIcone} min-h-11 min-w-11`}>{escuro ? <IconeModoClaro size={18} /> : <IconeModoEscuro size={18} />}</button>
            <button type="button" onClick={() => setContaAberta(true)} aria-label={`Abrir conta de ${corretor.nome}`} aria-haspopup="dialog" className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded text-white">
              <span aria-hidden="true" className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-white/40 bg-white/10 text-sm font-semibold">{foto('h-full w-full object-cover')}</span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 lg:hidden"><span className="min-w-0 flex-1 truncate text-sm font-semibold">{paginaAtual}</span><button type="button" aria-label="Buscar no painel" aria-haspopup="dialog" className={`${botaoIcone} min-h-11 min-w-11 shrink-0`} onClick={() => setPaletaAberta(true)}><IconeBuscar size={22} /></button><button type="button" className={`${botaoTexto} min-h-11 shrink-0 gap-2 px-3`} aria-haspopup="dialog" onClick={() => setMenuAberto(true)}><IconeMenu size={19} aria-hidden="true" /><span className="linha-nav">Menu</span></button></div>
        {/* Altura mínima = itens a 40px: abaixo disso a sidebar rola em vez de sobrepor o cartão do perfil. */}
        <div className="hidden min-h-0 flex-1 flex-col lg:flex" style={{ minHeight: `${itensMenu * 44 - 4}px` }}>{navegacao()}</div>
        <div className="hidden shrink-0 gap-2 lg:grid">
          {/* O cartão inteiro leva ao próprio perfil; fica marcado quando o perfil está aberto. */}
          <NavLink to={rotas.perfil} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/6 p-2 text-white no-underline hover:bg-white/10 aria-[current]:border-acao-painel">
            <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-base font-semibold">{foto('h-full w-full object-cover')}</span>
            <span className="min-w-0 flex-1 leading-tight"><strong className="block wrap-break-word">{corretor.nome}</strong><small className="text-sm text-white/70">{cargo}</small></span>
            <IconeProximo size={22} className="shrink-0 text-white/60" />
          </NavLink>
          {erroSaida && <Aviso tom="erro">{erroSaida}</Aviso>}
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Buscar no painel (Ctrl ou Command K)" aria-haspopup="dialog" onClick={() => setPaletaAberta(true)} className={`${botaoIcone} min-h-10 min-w-10`}><IconeBuscar size={20} /></button>
            <button disabled={saindo} onClick={encerrar} className={`${botaoTexto} min-h-10 flex-1 justify-center px-2.5 py-1.5 text-base disabled:opacity-60`}><span className="linha-nav">{saindo ? 'Saindo…' : 'Sair da conta'}</span></button>
            <button type="button" onClick={alternar} aria-label={rotuloTema} aria-pressed={escuro} className={`${botaoIcone} min-h-10 min-w-10`}>{escuro ? <IconeModoClaro size={20} /> : <IconeModoEscuro size={20} />}</button>
          </div>
        </div>
      </aside>
      <main ref={principal} id="conteudo-painel" tabIndex={-1} aria-label={paginaAtual} className="@container/principal mx-auto w-full min-w-0 max-w-[1500px] px-[18px] py-7 lg:p-12"><Outlet /></main>
      {menuAberto && <Dialogo titulo="Navegação do painel" tamanho="estreito" telaInteira aoFechar={() => setMenuAberto(false)}>{navegacao(true)}</Dialogo>}
      {paletaAberta && <PaletaPainel destinos={[...visiveis, { to: rotas.perfil, nome: 'Meu perfil' }, { to: rotas.inicio, nome: 'Ver site' }]} aoFechar={() => setPaletaAberta(false)} />}
      {contaAberta && <Dialogo titulo="Minha conta" tamanho="estreito" aoFechar={() => { if (!saindo) setContaAberta(false); }}><p><strong className="block">{corretor.nome}</strong><span className="text-muted">{cargo}</span></p>{erroSaida && <Aviso tom="erro">{erroSaida}</Aviso>}<div className="grid gap-3"><Link to={rotas.perfil} onClick={() => setContaAberta(false)} className="buttonSecondary">Meu perfil</Link><button type="button" disabled={saindo} onClick={encerrar} className="buttonGhost">{saindo ? 'Saindo…' : 'Sair da conta'}</button></div></Dialogo>}
    </div>
  );
}
