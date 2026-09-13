import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AgentsList from './AgentsList';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import type { Agent } from '../../types';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
});

const admin: Agent = { id: 'admin-1', name: 'Admin', email: 'admin@example.test', whatsappNumber: '5565999999999', creci: null, role: 'ADMIN', avatarUrl: null, active: true, createdAt: '2026-09-11T10:00:00Z' };
const other: Agent = { id: 'agent-2', name: 'Beto', email: 'beto@example.test', whatsappNumber: '5565988888888', creci: '123', role: 'AGENT', avatarUrl: null, active: true, createdAt: '2026-09-11T10:00:00Z' };

function show() {
  vi.mocked(useAuth).mockReturnValue({ agent: admin, loading: false, login: vi.fn(), logout: vi.fn(), refresh: vi.fn() });
  vi.spyOn(api, 'listAgents').mockResolvedValue({ items: [other], total: 1, page: 1, limit: 15, totalPages: 1 });
  render(<MemoryRouter><AgentsList /></MemoryRouter>);
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('redefinição de senha', () => {
  it('define a nova senha escolhida na hora para a conta selecionada', async () => {
    show();
    const save = vi.spyOn(api, 'saveAgent').mockResolvedValue(other);
    fireEvent.click(await screen.findByRole('button', { name: 'Redefinir senha' }));
    fireEvent.change(screen.getByLabelText('Nova senha', { exact: true }), { target: { value: 'nova-senha-12345' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'outra-senha-12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Definir nova senha' }));
    expect(await screen.findByText('A confirmação não confere.')).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'nova-senha-12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Definir nova senha' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith(
      { name: 'Beto', email: 'beto@example.test', whatsappNumber: '5565988888888', role: 'AGENT', creci: '123', avatarUrl: null, password: 'nova-senha-12345' },
      'agent-2',
    ));
  });
});
