import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, httpBlob, definirTokenAcesso } from './http';

describe('sessão HTTP', () => {
  beforeEach(() => definirTokenAcesso(null));
  it('compartilha uma única renovação entre um download e uma chamada JSON', async () => {
    const fetcher = vi.fn(async (caminho: string, opcoes: RequestInit) => {
      if (caminho.endsWith('/autenticacao/renovar')) return new Response(JSON.stringify({ token_acesso: 'novo' }));
      if (new Headers(opcoes.headers).get('Authorization') !== 'Bearer novo') return new Response('{}', { status: 401 });
      return caminho.endsWith('/download') ? new Response('documento privado') : new Response('{"ok":true}');
    });
    vi.stubGlobal('fetch', fetcher);
    const [blob, resultado] = await Promise.all([httpBlob('/admin/documentos/1/download'), http('/admin/contratos')]);
    expect(blob.size).toBe(17);
    expect(resultado).toEqual({ ok: true });
    expect(fetcher.mock.calls.filter(([caminho]) => caminho.endsWith('/autenticacao/renovar'))).toHaveLength(1);
    expect(fetcher.mock.calls[0][1].cache).toBe('no-store');
  });
  it('renova o token expirado uma vez e repete com o token novo', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('{}', { status: 401 })).mockResolvedValueOnce(new Response(JSON.stringify({ token_acesso: 'novo' }))).mockResolvedValueOnce(new Response(JSON.stringify({ nome: 'Ana' })));
    vi.stubGlobal('fetch', fetcher);
    await expect(http('/autenticacao/eu')).resolves.toEqual({ nome: 'Ana' });
    expect(fetcher.mock.calls[2][1].headers.get('Authorization')).toBe('Bearer novo');
    expect(fetcher.mock.calls[1][0]).toBe('/api/autenticacao/renovar');
  });
  it('nunca substitui dados fictícios em falha de rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('rede')));
    await expect(http('/imoveis')).rejects.toThrow('conectar');
  });
  it('apaga o token e avisa a expiração quando a renovação é recusada', async () => {
    definirTokenAcesso('antigo');
    const expirou = vi.fn();
    window.addEventListener('session-expired', expirou);
    try {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{}', { status: 401 })).mockResolvedValueOnce(new Response('{}', { status: 401 })));
      await expect(http('/autenticacao/eu')).rejects.toThrow('sessão expirou');
      expect(expirou).toHaveBeenCalledTimes(1);
      const sonda = vi.fn().mockResolvedValue(new Response('{"ok":true}'));
      vi.stubGlobal('fetch', sonda);
      await http('/admin/imoveis', {}, false);
      expect(sonda.mock.calls[0][1].headers.get('Authorization')).toBeNull();
    } finally {
      window.removeEventListener('session-expired', expirou);
    }
  });
  it('relata origem recusada sem fingir sessão expirada', async () => {
    definirTokenAcesso('antigo');
    const expirou = vi.fn();
    window.addEventListener('session-expired', expirou);
    try {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{}', { status: 401 })).mockResolvedValueOnce(new Response('{"message":"Origem não autorizada."}', { status: 403 })));
      await expect(http('/autenticacao/eu')).rejects.toThrow('origem não é autorizada');
      expect(expirou).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('session-expired', expirou);
    }
  });
  it('traduz erros da API por status', async () => {
    for (const [status, mensagem] of [[403, /permissão/], [404, /não encontrado/], [429, /tentativas/], [500, /indisponível/]] as [number, RegExp][]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })));
      await expect(http('/admin/imoveis', {}, false)).rejects.toThrow(mensagem);
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"message":"Regra de negócio."}', { status: 422 })));
    await expect(http('/admin/imoveis', {}, false)).rejects.toThrow('Regra de negócio.');
  });
});
