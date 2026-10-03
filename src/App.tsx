import { lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { createBrowserRouter, RouterProvider, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { caminhosCatalogo, urlNormalizada } from './servicos/urls';
import LayoutPublico from './componentes/LayoutPublico';
import CasaQuebrada from './componentes/CasaQuebrada';
import EstadoCarregamento from './componentes/EstadoCarregamento';
import Catalogo from './paginas/publico/Catalogo';
import DetalheImovel from './paginas/publico/DetalheImovel';
import Privacidade from './paginas/publico/Privacidade';
import Devs from './paginas/publico/Devs';
import { ProvedorSessao } from './hooks/useSessao';
import { ContextoBootstrap, Seo, useDadosIniciais } from './seo/context';

const LayoutPainel = lazy(() => import('./paginas/painel/LayoutPainel'));
const Entrar = lazy(() => import('./paginas/painel/Entrar'));
const VisaoGeral = lazy(() => import('./paginas/painel/VisaoGeral'));
const Imoveis = lazy(() => import('./paginas/painel/Imoveis'));
const FormularioImovel = lazy(() => import('./paginas/painel/FormularioImovel'));
const Contatos = lazy(() => import('./paginas/painel/Contatos'));
const Pessoas = lazy(() => import('./paginas/painel/Pessoas'));
const FichaPessoa = lazy(() => import('./paginas/painel/FichaPessoa'));
const Corretores = lazy(() => import('./paginas/painel/Corretores'));
const Cadastros = lazy(() => import('./paginas/painel/Cadastros'));
const Comissoes = lazy(() => import('./paginas/painel/Comissoes'));
const Contratos = lazy(() => import('./paginas/painel/Contratos'));
const DetalheContrato = lazy(() => import('./paginas/painel/DetalheContrato'));
const Perfil = lazy(() => import('./paginas/painel/Perfil'));

function RolarAoTopo() {
  const { pathname } = useLocation();
  const anterior = useRef(pathname);
  useEffect(() => {
    const de = anterior.current.replace(/\/+$/, '') || '/';
    const para = pathname.replace(/\/+$/, '') || '/';
    anterior.current = pathname;
    if (de === para) return;
    // Troca de filtro dentro do catálogo muda o pathname; o visitante fica onde está.
    if (caminhosCatalogo.includes(de) && caminhosCatalogo.includes(para)) return;
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

let roteador: ReturnType<typeof createBrowserRouter> | undefined;
export default function App() {
  // Criado uma única vez: o SSR não importa isto e o StrictMode não duplica ouvintes do histórico.
  roteador ??= createBrowserRouter([{ path: '*', element: <AppRoutes /> }]);
  return <RouterProvider router={roteador} />;
}

export const TEMPO_VOLTA_404_MS = 8000;

export function PaginaErro({ status = 404 }: { status?: number }) {
  const eh404 = status === 404;
  // Volta automática só no cliente: inicial igual no SSR e no primeiro render
  // (sem divergência de hidratação); timers e navegação só em efeito.
  const [voltar, setVoltar] = useState(false);
  const [ficar, setFicar] = useState(false);
  const [restam, setRestam] = useState(Math.ceil(TEMPO_VOLTA_404_MS / 1000));
  useEffect(() => {
    if (!eh404 || ficar) return;
    const relogio = window.setInterval(() => setRestam((atual) => Math.max(0, atual - 1)), 1000);
    const volta = window.setTimeout(() => setVoltar(true), TEMPO_VOLTA_404_MS);
    return () => {
      window.clearInterval(relogio);
      window.clearTimeout(volta);
    };
  }, [eh404, ficar]);
  if (voltar && eh404 && !ficar) return <Navigate to="/" replace />;
  if (!eh404) {
    return (
      <div className="container py-20">
        <Seo status={status} />
        <h1 className="mb-6">Serviço temporariamente indisponível.</h1>
        <p>Tente novamente em alguns instantes.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="button">Voltar ao catálogo</Link>
          <Link to="/imoveis/para-alugar" className="buttonSecondary">Alugar</Link>
          <Link to="/imoveis/para-comprar" className="buttonSecondary">Comprar</Link>
          {status >= 500 && <button className="buttonSecondary" onClick={() => window.location.reload()}>Tentar novamente</button>}
        </div>
      </div>
    );
  }
  return (
    <div className="container py-10 md:py-16">
      <Seo status={status} />
      <div className="grid items-center gap-5 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0">
          <p className="eyebrow">Endereço não encontrado · 404</p>
          <h1 className="mb-4 text-[clamp(30px,5vw,48px)]">Página não encontrada.</h1>
          <p className="mb-2 text-xl text-brand">Este endereço virou terreno baldio.</p>
          <p className="muted mb-5">Mas ainda temos outros imóveis esperando por você.</p>
          {ficar ? (
            <p className="mt-6">Combinado, ficamos por aqui.</p>
          ) : (
            <p aria-live="polite" className="muted mt-6">Voltando ao catálogo em {restam}s…</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/" className="button">Voltar agora</Link>
            <Link to="/imoveis/para-alugar" className="buttonSecondary">Alugar</Link>
            <Link to="/imoveis/para-comprar" className="buttonSecondary">Comprar</Link>
            {!ficar && (
              <button type="button" className="buttonSecondary" onClick={() => setFicar(true)}>
                Ficar aqui
              </button>
            )}
          </div>
        </div>
        <div className="min-w-0">
          <CasaQuebrada animada rotulo="Casa quebrada com bola de feno passando" />
        </div>
      </div>
    </div>
  );
}

export function AppRoutes() {
  const bootstrap = useContext(ContextoBootstrap);
  const iniciaisDaUrl = useDadosIniciais();
  const [navegou, setNavegou] = useState(false);
  const iniciais = navegou ? undefined : iniciaisDaUrl;
  const location = useLocation();
  useEffect(() => { if (bootstrap.url !== location.pathname + location.search) setNavegou(true); }, [bootstrap.url, location.pathname, location.search]);
  const painel = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const erro = iniciais && iniciais.status !== 200;
  const atual = location.pathname + location.search + location.hash;
  const normalizada = urlNormalizada(atual);
  if (normalizada !== atual) return <Navigate to={normalizada} state={location.state} replace />;
  const publica = (pagina: JSX.Element) => (erro ? <PaginaErro status={iniciais.status} /> : pagina);
  return (
    <ContextoBootstrap.Provider value={navegou ? { ...bootstrap, url: '', data: {}, status: 200 } : bootstrap}>
      <RolarAoTopo />
      {painel && <Seo />}
      <Suspense fallback={<EstadoCarregamento carregando />}>
        <Routes>
          <Route element={<LayoutPublico />}>
            <Route index element={publica(<Catalogo key={location.pathname + location.search} />)} />
            {caminhosCatalogo.filter((caminho) => caminho !== '/').map((caminho) => <Route key={caminho} path={caminho} element={publica(<Catalogo key={location.pathname + location.search} />)} />)}
            <Route path="imoveis/:slug" element={publica(<DetalheImovel key={location.pathname} />)} />
            <Route path="privacidade" element={publica(<Privacidade />)} />
            <Route path="devs" element={publica(<Devs />)} />
            <Route path="*" element={<PaginaErro status={erro ? iniciais.status : 404} />} />
          </Route>
          <Route path="admin" element={<ProvedorSessao><LayoutPainel /></ProvedorSessao>}>
            <Route index element={<VisaoGeral />} />
            <Route path="imoveis" element={<Imoveis />} />
            <Route path="imoveis/novo" element={<FormularioImovel />} />
            <Route path="imoveis/:id/editar" element={<FormularioImovel />} />
            <Route path="contatos" element={<Contatos />} />
            <Route path="pessoas" element={<Pessoas />} />
            <Route path="pessoas/:id" element={<FichaPessoa key={location.pathname} />} />
            <Route path="corretores" element={<Corretores />} />
            <Route path="cadastros" element={<Cadastros />} />
            <Route path="comissoes" element={<Comissoes />} />
            <Route path="contratos" element={<Contratos />} />
            <Route path="contratos/:id" element={<DetalheContrato key={location.pathname} />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
          <Route path="admin/entrar" element={<ProvedorSessao><Entrar /></ProvedorSessao>} />
        </Routes>
      </Suspense>
    </ContextoBootstrap.Provider>
  );
}
