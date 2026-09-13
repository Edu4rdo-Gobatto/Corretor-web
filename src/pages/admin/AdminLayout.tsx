import { routes } from '../../services/urls';
import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { errorMessage } from '../../services/format';
import { NavLink, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { brand } from '../../config/brand';

const navLink =
  'inline-flex min-h-10 items-center text-[14px] text-white/85 no-underline px-2.5 py-1.5 rounded snap-start whitespace-nowrap lg:min-h-11 lg:px-3 lg:py-3 lg:text-base aria-[current]:bg-white/20 aria-[current]:text-white hover:bg-white/10';

export default function AdminLayout() {
  const { agent, loading, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useEffect(() => {
    setAvatarBroken(false);
  }, [agent?.avatarUrl]);
  useEffect(() => {
    if (!userMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setUserMenuOpen(false);
    };
    const closeOnOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutside);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutside);
    };
  }, [userMenuOpen]);
  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError('');
    try {
      await logout();
      setUserMenuOpen(false);
    } catch (e) {
      setLogoutError(errorMessage(e));
    } finally {
      setLoggingOut(false);
    }
  }
  if (loading) return <p className="container" role="status">Verificando sua sessão…</p>;
  if (!agent) return <Navigate to={routes.login} state={{ from: location.pathname }} replace />;
  const showAvatar = Boolean(agent.avatarUrl) && !avatarBroken;
  const initial = agent.name.charAt(0).toUpperCase();
  const roleLabel = agent.role === 'ADMIN' ? 'Administrador' : 'Corretor';
  const themeLabel = isDark ? 'Ativar modo claro' : 'Ativar modo escuro';
  return (
    <div className="grid min-h-screen grid-cols-1 bg-soft lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-2 border-b-2 border-gold bg-navy px-4 py-2.5 text-white lg:gap-8 lg:border-b-0 lg:border-r-2 lg:px-6 lg:py-9">
        <div className="flex items-center justify-between gap-2 lg:block">
          <Link to={routes.home} className="font-display text-[16px] leading-tight text-inherit no-underline lg:text-[21px] lg:leading-[1.5]">
            {brand.name}
            <br />
            <small style={{ fontFamily: 'Source Sans 3', fontSize: 11, letterSpacing: 3 }}>ÁREA DO CORRETOR</small>
          </Link>
          <div ref={menuRef} className="relative flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={toggle}
              aria-label={themeLabel}
              aria-pressed={isDark}
              className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded border border-white/40 bg-transparent text-white"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={() => setUserMenuOpen((open) => !open)}
              aria-label={`Abrir menu de ${agent.name}`}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded text-white"
            >
              <span aria-hidden="true" className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-white/40 bg-white/10 text-sm font-semibold">
                {showAvatar ? (
                  <img src={agent.avatarUrl ?? ''} alt="" onError={() => setAvatarBroken(true)} className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </span>
            </button>
            {userMenuOpen && (
              <div role="menu" aria-label="Conta" className="absolute right-0 top-[calc(100%+8px)] z-10 w-60 rounded border border-white/15 bg-navy-deep p-2 shadow-xl">
                <p className="m-0 px-2 pb-1 pt-2 leading-tight">
                  <strong className="block">{agent.name}</strong>
                  <small className="text-white/70">{roleLabel}</small>
                </p>
                {logoutError && <span role="alert" className="block px-2 py-1 text-[13px]">{logoutError}</span>}
                <Link
                  to={routes.profile}
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="mt-1 inline-flex min-h-11 w-full items-center justify-center rounded bg-white/10 px-3 py-1.5 text-[13px] text-white no-underline"
                >
                  Meu perfil
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="mt-1 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded border border-white/40 bg-transparent px-3 py-1.5 text-[13px] text-white disabled:opacity-60"
                >
                  {loggingOut ? 'Saindo…' : 'Sair da conta'}
                </button>
              </div>
            )}
          </div>
        </div>
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
        <div className="mt-auto hidden gap-2.5 lg:grid">
          <div className="flex items-center gap-3">
            <Link to={routes.profile} aria-label={`Ver perfil de ${agent.name}`} className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-base font-semibold text-white no-underline">
              {showAvatar ? (
                <img src={agent.avatarUrl ?? ''} alt="" onError={() => setAvatarBroken(true)} className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </Link>
            <span className="leading-tight">
              <strong className="block">{agent.name}</strong>
              <small className="text-white/70">{roleLabel}</small>
            </span>
          </div>
          {logoutError && <span role="alert">{logoutError}</span>}
          <div className="flex items-center gap-2">
            <button
              disabled={loggingOut}
              onClick={handleLogout}
              className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded border border-white/40 bg-transparent p-2.5 text-white disabled:opacity-60"
            >
              {loggingOut ? 'Saindo…' : 'Sair da conta'}
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={themeLabel}
              aria-pressed={isDark}
              className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded border border-white/40 bg-transparent text-white"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </aside>
      <main className="w-full min-w-0 max-w-[1500px] px-[18px] py-7 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
}
