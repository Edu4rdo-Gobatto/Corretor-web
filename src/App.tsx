import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Catalog from './pages/public/Catalog';
import AsyncState from './components/AsyncState';
import { AuthProvider } from './hooks/useAuth';
const PropertyDetail = lazy(() => import('./pages/public/PropertyDetail'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const PropertyList = lazy(() => import('./pages/admin/PropertyList'));
const PropertyForm = lazy(() => import('./pages/admin/PropertyForm'));
const LeadsList = lazy(() => import('./pages/admin/LeadsList'));
const AgentsList = lazy(() => import('./pages/admin/AgentsList'));
function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0,0); }, [pathname]); return null; }
export default function App() {
  return <BrowserRouter><ScrollToTop/><Suspense fallback={<AsyncState loading/>}><Routes>
    <Route element={<PublicLayout/>}><Route index element={<Catalog/>}/><Route path="imoveis/:slug" element={<PropertyDetail/>}/><Route path="privacidade" element={<PrivacyPolicy/>}/><Route path="*" element={<div className="container" style={{paddingBlock:80}}><h1>Página não encontrada.</h1><Link to="/" className="button">Voltar ao catálogo</Link></div>}/></Route>
    <Route path="admin" element={<AuthProvider><AdminLayout/></AuthProvider>}><Route index element={<Dashboard/>}/><Route path="imoveis" element={<PropertyList/>}/><Route path="imoveis/novo" element={<PropertyForm/>}/><Route path="imoveis/:id/editar" element={<PropertyForm/>}/><Route path="leads" element={<LeadsList/>}/><Route path="corretores" element={<AgentsList/>}/></Route>
    <Route path="admin/login" element={<AuthProvider><Login/></AuthProvider>}/>
  </Routes></Suspense></BrowserRouter>;
}
