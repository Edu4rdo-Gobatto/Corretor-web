import { afterEach,describe,expect,it,vi } from 'vitest';
import { cleanup,fireEvent,render,screen,within } from '@testing-library/react';
import { MemoryRouter,Route,Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { themeStorageKey } from '../../hooks/useTheme';
import type { Agent } from '../../types';

vi.mock('../../hooks/useAuth',()=>({useAuth:vi.fn()}));
const agent:Agent={id:'agent-1',name:'Ana Silva',email:'ana@example.test',whatsappNumber:'5565999999999',creci:null,role:'AGENT',avatarUrl:null,active:true,createdAt:'2026-09-11T10:00:00Z'};
function show(currentAgent:Agent|null){
  const logout=vi.fn();
  vi.mocked(useAuth).mockReturnValue({agent:currentAgent,loading:false,login:vi.fn(),logout,refresh:vi.fn()});
  const view=render(<MemoryRouter initialEntries={['/admin']}><Routes><Route path="/admin" element={<AdminLayout/>}><Route index element={<p>Conteúdo protegido</p>}/></Route><Route path="/admin/entrar" element={<p>Acesso à conta</p>}/></Routes></MemoryRouter>);
  return {...view,logout};
}
afterEach(()=>{cleanup();document.documentElement.classList.remove('dark');window.localStorage.removeItem(themeStorageKey);});
describe('Permissões de navegação administrativa',()=>{it('direciona usuários sem sessão para login',()=>{show(null);expect(screen.getByText('Acesso à conta')).toBeInTheDocument();expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();});it('oculta a gestão de corretores para AGENT',()=>{show(agent);expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();expect(screen.queryByRole('link',{name:'Corretores'})).not.toBeInTheDocument();});it('exibe a gestão de corretores para ADMIN',()=>{show({...agent,role:'ADMIN'});expect(screen.getByRole('link',{name:'Corretores'})).toBeInTheDocument();});});
describe('Conta do usuário',()=>{
  it('exibe o avatar quando há avatarUrl',()=>{
    const {container}=show({...agent,avatarUrl:'https://example.test/avatar.png'});
    const photo=container.querySelector('img[src="https://example.test/avatar.png"]');
    expect(photo).not.toBeNull();
  });
  it('abre o dropdown da foto com Sair da conta e faz logout',async()=>{
    const {logout}=show(agent);
    fireEvent.click(screen.getByRole('button',{name:'Abrir menu de Ana Silva'}));
    const menu=screen.getByRole('menu',{name:'Conta'});
    expect(menu).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole('menuitem',{name:'Sair da conta'}));
    await screen.findByText('Conteúdo protegido');
    expect(logout).toHaveBeenCalled();
  });
  it('liga a foto ao perfil no desktop e no dropdown',()=>{
    show({...agent,avatarUrl:'https://example.test/avatar.png'});
    const desktop = screen.getByRole('link',{name:'Ver perfil de Ana Silva'});
    expect(desktop.getAttribute('href')).toBe('/admin/perfil');
    fireEvent.click(screen.getByRole('button',{name:'Abrir menu de Ana Silva'}));
    const item = screen.getByRole('menuitem',{name:'Meu perfil'});
    expect(item.getAttribute('href')).toBe('/admin/perfil');
  });
  it('alterna o modo noturno e persiste a escolha',()=>{
    show(agent);
    fireEvent.click(screen.getAllByRole('button',{name:'Ativar modo escuro'})[0]);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem(themeStorageKey)).toBe('dark');
  });
});
