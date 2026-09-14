import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RentalGuard, Parties } from './Rentals';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function auth(role: 'ADMIN' | 'AGENT') {
  vi.mocked(useAuth).mockReturnValue({ agent: { id: 'a', name: 'Pessoa teste', role, email: 'a@example.test', active: true, avatarUrl: null, creci: null, whatsappNumber: '5565999999999', createdAt: '' }, loading: false, login: vi.fn(), logout: vi.fn(), refresh: vi.fn() });
}
describe('acesso aos cadastros de locação', () => {
  it('permite corretor consultar partes vinculadas, mantendo criação exclusiva do ADMIN', async () => {
    auth('AGENT');
    const list = vi.spyOn(api, 'listRentalParties').mockResolvedValue({ itens: [], total: 0, pagina: 1, limite: 15 });
    render(<MemoryRouter><RentalGuard><Parties kind="OWNER" /></RentalGuard></MemoryRouter>);
    expect(await screen.findByText('Nenhum cadastro encontrado.')).toBeInTheDocument();
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ papel: 'LOCADOR', ativo: true, pagina: 1 }));
    expect(screen.queryByRole('button', { name: /Novo cadastro/ })).not.toBeInTheDocument();
  });
  it('disponibiliza cadastro ao ADMIN', async () => {
    auth('ADMIN'); vi.spyOn(api, 'listRentalParties').mockResolvedValue({ itens: [], total: 0, pagina: 1, limite: 15 });
    render(<MemoryRouter><Parties kind="TENANT" /></MemoryRouter>);
    expect(await screen.findByRole('button', { name: /Novo cadastro/ })).toBeInTheDocument();
  });
  it('não monta dados privados sem sessão', async () => {
    vi.mocked(useAuth).mockReturnValue({ agent: null, loading: false, login: vi.fn(), logout: vi.fn(), refresh: vi.fn() });
    const list = vi.spyOn(api, 'listRentalParties');
    render(<MemoryRouter initialEntries={['/admin/proprietarios']}><Routes><Route path="/admin/entrar" element={<p>Entrar</p>} /><Route path="/admin/proprietarios" element={<RentalGuard><Parties kind="OWNER" /></RentalGuard>} /></Routes></MemoryRouter>);
    expect(await screen.findByText('Entrar')).toBeInTheDocument(); expect(list).not.toHaveBeenCalled();
  });
});
