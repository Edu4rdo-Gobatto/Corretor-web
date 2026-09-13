import { afterEach,describe,expect,it,vi } from 'vitest';
import { cleanup,render,screen } from '@testing-library/react';
import { MemoryRouter,Route,Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import type { Agent } from '../../types';

vi.mock('../../hooks/useAuth',()=>({useAuth:vi.fn()}));
const agent:Agent={id:'agent-1',name:'Ana Silva',email:'ana@example.test',whatsappNumber:'5565999999999',creci:null,role:'AGENT',avatarUrl:null,active:true,createdAt:'2026-09-11T10:00:00Z'};
function show(currentAgent:Agent|null){vi.mocked(useAuth).mockReturnValue({agent:currentAgent,loading:false,login:vi.fn(),logout:vi.fn()});render(<MemoryRouter initialEntries={['/admin']}><Routes><Route path="/admin" element={<AdminLayout/>}><Route index element={<p>Conteúdo protegido</p>}/></Route><Route path="/admin/entrar" element={<p>Acesso à conta</p>}/></Routes></MemoryRouter>);}
afterEach(cleanup);
describe('Permissões de navegação administrativa',()=>{it('direciona usuários sem sessão para login',()=>{show(null);expect(screen.getByText('Acesso à conta')).toBeInTheDocument();expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();});it('oculta a gestão de corretores para AGENT',()=>{show(agent);expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();expect(screen.queryByRole('link',{name:'Corretores'})).not.toBeInTheDocument();});it('exibe a gestão de corretores para ADMIN',()=>{show({...agent,role:'ADMIN'});expect(screen.getByRole('link',{name:'Corretores'})).toBeInTheDocument();});});
