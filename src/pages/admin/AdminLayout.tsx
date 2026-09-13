import { routes } from '../../services/urls';
import { useState } from 'react';
import { errorMessage } from '../../services/format';
import { NavLink, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { brand } from '../../config/brand';

const navLink =
  'inline-flex min-h-10 items-center text-[14px] text-white/85 no-underline px-2.5 py-1.5 rounded snap-start whitespace-nowrap lg:min-h-11 lg:px-3 lg:py-3 lg:text-base aria-[current]:bg-white/20 aria-[current]:text-white hover:bg-white/10';

export default function AdminLayout() {
  const { agent, loading, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  if (loading) return <p className="container" role="status">Verificando sua sessão…</p>;
  if (!agent) return <Navigate to={routes.login} state={{ from: location.pathname }} replace />;
  return (
    <div className="grid min-h-screen grid-cols-1 bg-soft lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-2 border-b-2 border-gold bg-navy px-4 py-2.5 text-white lg:gap-8 lg:border-b-0 lg:border-r-2 lg:px-6 lg:py-9">
        <Link to={routes.home} className="font-display text-[16px] leading-tight text-inherit no-underline lg:text-[21px] lg:leading-[1.5]">
          {brand.name}
          <br />
          <small style={{ fontFamily: 'Source Sans 3', fontSize: 11, letterSpacing: 3 }}>ÁREA DO CORRETOR</small>
        </Link>
        <nav aria-label="Administração" className="grid gap-2 max-lg:-mx-4 max-lg:flex max-lg:snap-x max-lg:gap-1 max-lg:overflow-x-auto max-lg:overscroll-contain max-lg:px-4 max-lg:pb-0">
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
        <div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 text-[13px] lg:mt-auto lg:grid lg:gap-2.5 lg:text-base">
          <strong className="leading-tight">{agent.name}</strong>
          <small className="mr-auto text-white/70 leading-tight lg:mr-0">{agent.role === 'ADMIN' ? 'Administrador' : 'Corretor'}</small>
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
            className="inline-flex min-h-9 cursor-pointer items-center rounded border border-white/40 bg-transparent px-3 py-1.5 text-[13px] text-white lg:min-h-11 lg:p-2.5 lg:text-base disabled:opacity-60"
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
