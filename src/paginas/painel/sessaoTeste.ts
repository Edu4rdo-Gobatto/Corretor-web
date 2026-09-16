import { vi } from 'vitest';
import type { Corretor } from '../../tipos';
import { useSessao } from '../../hooks/useSessao';

/** Sessão simulada para os testes do painel; use com vi.mock('../../hooks/useSessao', () => ({ useSessao: vi.fn() })). */
export const corretorTeste: Corretor = { id: 1, nome: 'Ana Silva', email: 'ana@example.test', cpf: '52998224725', whatsapp: '5565999999999', creci: '15776', cargo: 'ADMIN', url_foto: null, ativo: true, criado_em: '2026-09-11T10:00:00Z' };

export function simularSessao(corretor: Corretor | null = corretorTeste) {
  const sessao = { corretor, carregando: false, entrar: vi.fn(), sair: vi.fn(), atualizar: vi.fn().mockResolvedValue(undefined) };
  vi.mocked(useSessao).mockReturnValue(sessao);
  return sessao;
}
