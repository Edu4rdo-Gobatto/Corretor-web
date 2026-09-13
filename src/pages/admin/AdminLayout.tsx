import { routes } from '../../services/urls';
import { useState } from 'react';
import { errorMessage } from '../../services/format';
import { NavLink, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { brand } from '../../config/brand';

const navLink =
  'text-white/85 no-underline p-3 rounded max-lg:whitespace-nowrap max-lg:px-2.5 max-lg:py-2 aria-[current]:bg-white/20 aria-[current]:text-white hover:bg-white/10';

export default function AdminLayout() {
  const { agent, loading, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  if (loading) return <p className="container" role="status">Verificando sua sessão…</p>;
  if (!agent) return <Navigate to={routes.login} state={{ from: location.pathname }} replace />;
  return (
    <div className="grid min-h-screen grid-cols-1 bg-soft lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-8 border-b-2 border-gold bg-navy px-[18px] py-[18px] text-white max-lg:gap-3.5 lg:border-b-0 lg:border-r-2 lg:px-6 lg:py-9">
        <Link to={routes.home} className="font-display text-[21px] leading-[1.5] text-inherit no-underline max-lg:text-[18px]">
          {brand.name}
          <br />
          <small style={{ fontFamily: 'Source Sans 3', fontSize: 11, letterSpacing: 3 }}>ÁREA DO CORRETOR</small>
        </Link>
        <nav aria-label="Administração" className="grid gap-2 max-lg:flex max-lg:gap-0.5 max-lg:overflow-x-auto">
          <NavLink to={routes.admin} end className={navLink}>Visão geral</NavLink>
          <NavLink to="/admin/imoveis" className={navLink}>Imóveis</NavLink>
          <NavLink to={routes.contacts} className={navLink}>Contatos</NavLink>
          {agent.role === 'ADMIN' && (
            <>
              <NavLink to="/admin/corretores" className={navLink}>Corretores</NavLink>
              <NavLink to="/admin/proprietarios" className={navLink}>Proprietários</NavLink>
              <NavLink to="/admin/inquilinos" className={navLink}>Inquilinos</NavLink>
              <NavLink to="/admin/contratos" className={navLink}>Contratos</NavLink>
            </>
          )}
          <Link to={routes.home} className={navLink}>Ver site ↗</Link>
        </nav>
        <div className="mt-auto grid gap-2.5 max-lg:flex max-lg:flex-wrap max-lg:items-center max-lg:text-[13px]">
          <strong>{agent.name}</strong>
          <small className="text-white/70 max-lg:mr-auto">{agent.role === 'ADMIN' ? 'Administrador' : 'Corretor'}</small>
          {logoutError && <span role="alert">{logoutError}</span>}
          <button
            disabled={loggingOut}
            onClick={async () => {
              setLoggingOut(true);
              setLogoutError('');
              try {
                await logout();
              } catch (e) {
                setLogoutError(errorMessage(e));
              } finally {
                setLoggingOut(false);
              }
            }}
            className="cursor-pointer rounded border border-white/40 bg-transparent p-2.5 text-white max-lg:px-3 max-lg:py-[5px] disabled:opacity-60"
          >
            {loggingOut ? 'Saindo…' : 'Sair da conta'}
          </button>
        </div>
      </aside>
      <main className="w-full min-w-0 max-w-[1500px] px-[18px] py-7 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
}
