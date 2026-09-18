import { beforeEach, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { Corretor, Sessao } from '../tipos';

vi.mock('../servicos/api', () => ({ api: { renovar: vi.fn(), entrar: vi.fn(), sair: vi.fn(), eu: vi.fn() } }));

const corretor: Corretor = { id: 1, nome: 'Ana Silva', email: 'ana@example.test', whatsapp: '5566999990000', creci: null, cargo: 'ADMIN', url_foto: null, ativo: true, criado_em: '2026-09-11T10:00:00Z' };
const sessao: Sessao = { token_acesso: 'token', tipo_token: 'Bearer', corretor };

// A restauração vive em estado de módulo: cada teste carrega módulos novos.
let modulo: typeof import('./useSessao');
let api: typeof import('../servicos/api').api;
beforeEach(async () => {
  vi.resetModules();
  modulo = await import('./useSessao');
  api = (await import('../servicos/api')).api;
});

function Estado() {
  const { corretor: atual, carregando, entrar } = modulo.useSessao();
  return <><p>{carregando ? 'carregando' : atual ? `logado ${atual.nome}` : 'anônimo'}</p><button onClick={() => void entrar('ana@example.test', 'senha')}>entrar</button></>;
}
const montar = () => render(<modulo.ProvedorSessao><Estado /></modulo.ProvedorSessao>);

it('não reaproveita uma restauração que falhou depois de entrar e remontar o painel', async () => {
  vi.mocked(api.renovar).mockRejectedValueOnce(new Error('sem sessão'));
  vi.mocked(api.entrar).mockResolvedValueOnce(sessao);
  const primeira = montar();
  await screen.findByText('anônimo');
  fireEvent.click(screen.getByRole('button', { name: 'entrar' }));
  await screen.findByText('logado Ana Silva');
  primeira.unmount();
  // Voltar do site ao painel monta um provedor novo: a sessão válida continua, sem nova renovação.
  montar();
  expect(await screen.findByText('logado Ana Silva')).toBeInTheDocument();
  expect(api.renovar).toHaveBeenCalledTimes(1);
});

it('tenta restaurar de novo depois que a sessão expira', async () => {
  vi.mocked(api.renovar).mockResolvedValueOnce(sessao).mockResolvedValueOnce(sessao);
  const primeira = montar();
  await screen.findByText('logado Ana Silva');
  act(() => { window.dispatchEvent(new Event('session-expired')); });
  expect(screen.getByText('anônimo')).toBeInTheDocument();
  primeira.unmount();
  montar();
  await screen.findByText('logado Ana Silva');
  expect(api.renovar).toHaveBeenCalledTimes(2);
});
