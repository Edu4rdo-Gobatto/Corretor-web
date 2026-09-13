import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import type { Agent, Lead } from '../../types';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

const agent: Agent = { id: 'agent-1', name: 'Ana Silva', email: 'ana@example.test', whatsappNumber: '5565999999999', creci: '15776', role: 'ADMIN', avatarUrl: 'https://example.test/foto.png', active: true, createdAt: '2026-09-11T10:00:00Z' };
const lead: Lead = { id: 'lead-1', propertyId: null, agentId: 'agent-1', leadName: 'Interessado', leadPhone: '5565988888888', leadEmail: null, message: null, consentGiven: true, consentTimestamp: '2026-09-12T10:00:00Z', consentIp: '127.0.0.1', termsVersion: 'v1.0', createdAt: '2026-09-12T10:00:00Z' };

function show() {
  const refresh = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useAuth).mockReturnValue({ agent, loading: false, login: vi.fn(), logout: vi.fn(), refresh });
  vi.spyOn(api, 'listProperties').mockImplementation((query = { page: 1, limit: 1 }) => Promise.resolve({
    items: [], total: query.status === 'CONCLUIDO' ? 1 : query.status === 'RESERVADO' ? 2 : query.status === 'DISPONIVEL' ? 3 : 6,
    page: 1, limit: 1, totalPages: 1,
  }));
  vi.spyOn(api, 'listLeads').mockImplementation((query = {}) => Promise.resolve(
    query.limit === 5
      ? { items: [lead], total: 4, page: 1, limit: 5, totalPages: 1 }
      : { items: [], total: query.createdFrom ? 2 : 4, page: 1, limit: 1, totalPages: 1 },
  ));
  const view = render(<MemoryRouter><Profile /></MemoryRouter>);
  return { refresh, container: view.container };
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('página de perfil', () => {
  it('exibe a foto, as métricas por status e o e-mail somente leitura', async () => {
    const { container } = show();
    expect(container.querySelector('img[src="https://example.test/foto.png"]')).not.toBeNull();
    expect(await screen.findByText('3 disponíveis · 2 reservados · 1 concluídos')).toBeInTheDocument();
    expect(screen.getByText('2 nos últimos 30 dias')).toBeInTheDocument();
    expect(screen.getByText('ana@example.test')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('ana@example.test')).toBeNull();
  });

  it('salva o perfil e recarrega a sessão', async () => {
    const { refresh } = show();
    const update = vi.spyOn(api, 'updateProfile').mockResolvedValue(agent);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana Souza' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    await waitFor(() => expect(update).toHaveBeenCalledWith({ name: 'Ana Souza', whatsappNumber: '5565999999999', creci: '15776', avatarUrl: 'https://example.test/foto.png' }));
    expect(refresh).toHaveBeenCalled();
    expect(await screen.findByText('Perfil atualizado.')).toBeInTheDocument();
  });

  it('troca a senha com confirmação e reclama quando não confere', async () => {
    show();
    const change = vi.spyOn(api, 'changePassword').mockResolvedValue(agent);
    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'antiga-segura-123' } });
    fireEvent.change(screen.getByLabelText('Nova senha', { exact: true }), { target: { value: 'nova-segura-12345' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'diferente-123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));
    expect(await screen.findByText('A confirmação não confere.')).toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'nova-segura-12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));
    await waitFor(() => expect(change).toHaveBeenCalledWith({ currentPassword: 'antiga-segura-123', newPassword: 'nova-segura-12345' }));
    expect(await screen.findByText('Senha atualizada.')).toBeInTheDocument();
  });
});
