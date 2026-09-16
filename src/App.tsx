import { catalogPaths, normalizedUrl } from './services/urls';
import { lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { createBrowserRouter, RouterProvider, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Catalog from './pages/public/Catalog';
import AsyncState from './components/AsyncState';
import { AuthProvider } from './hooks/useAuth';
import PropertyDetail from './pages/public/PropertyDetail';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import Devs from './pages/public/Devs';
import { BootstrapContext, Seo, useInitialData } from './seo/context';
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const PropertyList = lazy(() => import('./pages/admin/PropertyList'));
const PropertyForm = lazy(() => import('./pages/admin/PropertyForm'));
const LeadsList = lazy(() => import('./pages/admin/LeadsList'));
const AgentsList = lazy(() => import('./pages/admin/AgentsList'));
const Classifications = lazy(() => import('./pages/admin/Classifications'));
const Commissions = lazy(() => import('./pages/admin/Commissions'));
const Profile = lazy(() => import('./pages/admin/Profile'));
const RentalGuard = lazy(() => import('./pages/admin/Rentals').then(m=>({default:m.RentalGuard})));
const Parties = lazy(() => import('./pages/admin/Rentals').then(m=>({default:m.Parties})));
const PartyDetail = lazy(() => import('./pages/admin/Rentals').then(m=>({default:m.PartyDetail})));
const LeaseList = lazy(() => import('./pages/admin/Rentals').then(m=>({default:m.LeaseList})));
const LeaseDetail = lazy(() => import('./pages/admin/Rentals').then(m=>({default:m.LeaseDetail})));
function ScrollToTop() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  useEffect(() => {
    const from = previous.current.replace(/\/+$/, '') || '/';
    const to = pathname.replace(/\/+$/, '') || '/';
    previous.current = pathname;
    if (from === to) return;
    // Troca de filtro dentro do catálogo muda o pathname (/ -> /imoveis/salas):
    // não joga ao topo, o usuário fica onde está, na seção de resultados.
    if (catalogPaths.includes(from) && catalogPaths.includes(to)) return;
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
let browserRouter: ReturnType<typeof createBrowserRouter> | undefined;
export default function App() {
  // Lazy creation keeps SSR imports safe and avoids duplicate history listeners in StrictMode.
  browserRouter ??= createBrowserRouter([{ path: '*', element: <AppRoutes/> }]);
  return <RouterProvider router={browserRouter}/>;
}
export function ErrorPage({ status = 404 }: { status?: number }) {
  return <div className="container py-20"><Seo status={status}/>
    <h1 className="mb-6">{status === 404 ? 'Página não encontrada.' : 'Serviço temporariamente indisponível.'}</h1>
    {status !== 404 && <p>Tente novamente em alguns instantes.</p>}
    <div className="flex flex-wrap gap-3">
      <Link to="/" className="button">Voltar ao catálogo</Link>
      <Link to="/imoveis/para-alugar" className="buttonSecondary">Alugar</Link>
      <Link to="/imoveis/para-comprar" className="buttonSecondary">Comprar</Link>
      {status >= 500 && <button className="buttonSecondary" onClick={() => window.location.reload()}>Tentar novamente</button>}
    </div>
  </div>;
}
export function AppRoutes() {
  const bootstrap = useContext(BootstrapContext);
  const matchingInitial = useInitialData();
  const [navigated, setNavigated] = useState(false);
  const initial = navigated ? undefined : matchingInitial;
  const location = useLocation();
  useEffect(() => { if (bootstrap.url !== location.pathname + location.search) setNavigated(true); }, [bootstrap.url, location.pathname, location.search]);
  const admin = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const error = initial && initial.status !== 200;
  const normalized = normalizedUrl(location.pathname + location.search + location.hash);
  if (normalized !== location.pathname + location.search + location.hash) return <Navigate to={normalized} state={location.state} replace/>;
  return <BootstrapContext.Provider value={navigated ? { ...bootstrap, url: '', data: {}, status: 200 } : bootstrap}><ScrollToTop/>{admin && <Seo/>}<Suspense fallback={<AsyncState loading/>}><Routes>
    <Route element={<PublicLayout/>}><Route index element={error ? <ErrorPage status={initial.status}/> : <Catalog key={location.pathname + location.search}/>}/>{catalogPaths.filter(path => path !== '/').map(path => <Route key={path} path={path} element={error ? <ErrorPage status={initial.status}/> : <Catalog key={location.pathname + location.search}/>}/>)}<Route path="imoveis/:slug" element={error ? <ErrorPage status={initial.status}/> : <PropertyDetail key={location.pathname}/>}/><Route path="privacidade" element={error ? <ErrorPage status={initial.status}/> : <PrivacyPolicy/>}/><Route path="devs" element={error ? <ErrorPage status={initial.status}/> : <Devs/>}/><Route path="*" element={<ErrorPage status={error ? initial.status : 404}/>}/></Route>
    <Route path="admin" element={<AuthProvider><AdminLayout/></AuthProvider>}><Route index element={<Dashboard/>}/><Route path="imoveis" element={<PropertyList/>}/><Route path="imoveis/novo" element={<PropertyForm/>}/><Route path="imoveis/:id/editar" element={<PropertyForm/>}/><Route path="contatos" element={<LeadsList/>}/><Route path="corretores" element={<AgentsList/>}/><Route path="cadastros" element={<Classifications/>}/><Route path="comissoes" element={<Commissions/>}/><Route path="perfil" element={<Profile/>}/><Route path="proprietarios" element={<RentalGuard><Parties key="OWNER" kind="OWNER"/></RentalGuard>}/><Route path="inquilinos" element={<RentalGuard><Parties key="TENANT" kind="TENANT"/></RentalGuard>}/><Route path="proprietarios/:id" element={<RentalGuard><PartyDetail key={location.pathname}/></RentalGuard>}/><Route path="inquilinos/:id" element={<RentalGuard><PartyDetail key={location.pathname}/></RentalGuard>}/><Route path="contratos" element={<RentalGuard><LeaseList/></RentalGuard>}/><Route path="contratos/:id" element={<RentalGuard><LeaseDetail key={location.pathname}/></RentalGuard>}/></Route>
    <Route path="admin/entrar" element={<AuthProvider><Login/></AuthProvider>}/>
  </Routes></Suspense></BootstrapContext.Provider>;
}
