import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Perfil from './Perfil';
import { api } from '../../servicos/api';
import { corretorTeste, simularSessao } from './sessaoTeste';

vi.mock('../../hooks/useSessao', () => ({ useSessao: vi.fn() }));
const pagina = (total: number) => ({ itens: [], total, pagina: 1, limite: 1, total_paginas: 1 });
function mostrar() {
  const sessao = simularSessao({ ...corretorTeste, url_foto: 'https://example.test/foto.png' });
  vi.spyOn(api, 'listarFichas').mockImplementation((filtros) => Promise.resolve(pagina(filtros.status === 'VENDIDO' ? 1 : filtros.status === 'RESERVADO' ? 2 : filtros.status === 'DISPONIVEL' ? 3 : filtros.status === 'ALUGADO' ? 0 : 6) as never));
  vi.spyOn(api, 'listarPessoas').mockImplementation((filtros = {}) => Promise.resolve(pagina(filtros.criado_desde ? 2 : filtros.status_contato ? 5 : 4) as never));
  const tela = render(<MemoryRouter><Perfil /></MemoryRouter>);
  return { ...sessao, container: tela.container };
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('página de perfil', () => {
  it('exibe foto, métricas por situação e o e-mail somente leitura', async () => {
    const { container } = mostrar();
    expect(container.querySelector('img[src="https://example.test/foto.png"]')).not.toBeNull();
    expect(await screen.findByText('3 disponíveis · 2 reservados · 1 vendidos · 0 alugados')).toBeInTheDocument();
    expect(screen.getByText('2 nos últimos 30 dias')).toBeInTheDocument();
    expect(screen.getByText('ana@example.test')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('ana@example.test')).toBeNull();
  });
  it('salva o perfil e recarrega a sessão', async () => {
    const { atualizar } = mostrar();
    const atualizarPerfil = vi.spyOn(api, 'atualizarPerfil').mockResolvedValue(corretorTeste);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana Souza' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    await waitFor(() => expect(atualizarPerfil).toHaveBeenCalledWith({ nome: 'Ana Souza', whatsapp: '5565999999999', creci: '15776', url_foto: 'https://example.test/foto.png' }));
    expect(atualizar).toHaveBeenCalled();
    expect(await screen.findByText('Perfil atualizado.')).toBeInTheDocument();
  });
  it('troca a senha com confirmação e reclama quando não confere', async () => {
    mostrar();
    const alterar = vi.spyOn(api, 'alterarSenha').mockResolvedValue(corretorTeste);
    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'antiga-segura-123' } });
    fireEvent.change(screen.getByLabelText('Nova senha', { exact: true }), { target: { value: 'nova-segura-12345' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'diferente-123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));
    expect(await screen.findByText('A confirmação não confere.')).toBeInTheDocument();
    expect(alterar).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'nova-segura-12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));
    await waitFor(() => expect(alterar).toHaveBeenCalledWith({ senha_atual: 'antiga-segura-123', nova_senha: 'nova-segura-12345' }));
    expect(await screen.findByText('Senha atualizada.')).toBeInTheDocument();
  });
});
