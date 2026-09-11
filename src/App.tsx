import { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Catalog from './pages/public/Catalog';
import AsyncState from './components/AsyncState';
import { AuthProvider } from './hooks/useAuth';
import PropertyDetail from './pages/public/PropertyDetail';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import { BootstrapContext, Seo, useInitialData } from './seo/context';
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const PropertyList = lazy(() => import('./pages/admin/PropertyList'));
const PropertyForm = lazy(() => import('./pages/admin/PropertyForm'));
const LeadsList = lazy(() => import('./pages/admin/LeadsList'));
const AgentsList = lazy(() => import('./pages/admin/AgentsList'));
function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0,0); }, [pathname]); return null; }
export default function App() {
  return <BrowserRouter><AppRoutes/></BrowserRouter>;
}
export function ErrorPage({ status = 404 }: { status?: number }) {
  return <div className="container" style={{paddingBlock:80}}><Seo status={status}/><h1>{status === 404 ? 'Página não encontrada.' : 'Serviço temporariamente indisponível.'}</h1>{status !== 404 && <p>Tente novamente em alguns instantes.</p>}<Link to="/" className="button">Voltar ao catálogo</Link>{status >= 500 && <button className="buttonSecondary" onClick={() => window.location.reload()}>Tentar novamente</button>}</div>;
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
  return <BootstrapContext.Provider value={navigated ? { ...bootstrap, url: '', data: {}, status: 200 } : bootstrap}><ScrollToTop/>{admin && <Seo/>}<Suspense fallback={<AsyncState loading/>}><Routes>
    <Route element={<PublicLayout/>}><Route index element={error ? <ErrorPage status={initial.status}/> : <Catalog key={location.pathname + location.search}/>}/><Route path="imoveis/:slug" element={error ? <ErrorPage status={initial.status}/> : <PropertyDetail key={location.pathname}/>}/><Route path="privacidade" element={error ? <ErrorPage status={initial.status}/> : <PrivacyPolicy/>}/><Route path="*" element={<ErrorPage status={error ? initial.status : 404}/>}/></Route>
    <Route path="admin" element={<AuthProvider><AdminLayout/></AuthProvider>}><Route index element={<Dashboard/>}/><Route path="imoveis" element={<PropertyList/>}/><Route path="imoveis/novo" element={<PropertyForm/>}/><Route path="imoveis/:id/editar" element={<PropertyForm/>}/><Route path="leads" element={<LeadsList/>}/><Route path="corretores" element={<AgentsList/>}/></Route>
    <Route path="admin/login" element={<AuthProvider><Login/></AuthProvider>}/>
  </Routes></Suspense></BootstrapContext.Provider>;
}
