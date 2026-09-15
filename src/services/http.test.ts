import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, httpBlob, setAccessToken } from './http';
describe('HTTP session', () => {
  beforeEach(() => setAccessToken(null));
  it('shares one renewal between a document download and JSON request', async () => {
    const fetcher=vi.fn(async (path:string,options:RequestInit)=>{
      if(path.endsWith('/autenticacao/renovar')) return new Response(JSON.stringify({token_acesso:'fresh'}));
      if(new Headers(options.headers).get('Authorization')!=='Bearer fresh')return new Response('{}',{status:401});
      return path.endsWith('/download')?new Response('private document'):new Response('{"ok":true}');
    });
    vi.stubGlobal('fetch',fetcher);
    const [blob,result]=await Promise.all([httpBlob('/admin/rental-documents/id/download'),http('/admin/contratos')]);
    expect(blob.size).toBe(16);
    expect(result).toEqual({ok:true});
    expect(fetcher.mock.calls.filter(([path])=>path.endsWith('/autenticacao/renovar'))).toHaveLength(1);
    expect(fetcher.mock.calls[0][1].cache).toBe('no-store');
  });
  it('refreshes an expired access token once and retries using the new token', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('{}', { status: 401 })).mockResolvedValueOnce(new Response(JSON.stringify({ token_acesso: 'fresh' }), { status: 200 })).mockResolvedValueOnce(new Response(JSON.stringify({ name: 'Ana' }), { status: 200 }));
    vi.stubGlobal('fetch', fetcher);
    await expect(http('/autenticacao/eu')).resolves.toEqual({ name: 'Ana' });
    expect(fetcher.mock.calls[2][1].headers.get('Authorization')).toBe('Bearer fresh');
    expect(fetcher.mock.calls[1][0]).toBe('/api/autenticacao/renovar');
  });
  it('never substitutes demo data on a failed request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));
    await expect(http('/imoveis')).rejects.toThrow('conectar');
  });
  it('clears a previously set token and notifies expiry when renewal is rejected', async () => {
    setAccessToken('stale-token');
    const expired = vi.fn();
    window.addEventListener('session-expired', expired);
    try {
      const fetcher = vi.fn()
        .mockResolvedValueOnce(new Response('{}', { status: 401 }))
        .mockResolvedValueOnce(new Response('{}', { status: 401 }));
      vi.stubGlobal('fetch', fetcher);
      expect(fetcher.mock.calls).toHaveLength(0);
      await expect(http('/autenticacao/eu')).rejects.toThrow('sessão expirou');
      expect(expired).toHaveBeenCalledTimes(1);
      // A aplicação apagou o token sozinha: a próxima chamada autenticada
      // não envia Authorization (sem limpeza manual no teste).
      const probe = vi.fn().mockResolvedValue(new Response('{"ok":true}'));
      vi.stubGlobal('fetch', probe);
      await http('/admin/imoveis', {}, false);
      expect(probe.mock.calls[0][1].headers.get('Authorization')).toBeNull();
    } finally {
      window.removeEventListener('session-expired', expired);
    }
  });
  it('reports origin rejection truthfully instead of expired session', async () => {
    setAccessToken('stale-token');
    const expired = vi.fn();
    window.addEventListener('session-expired', expired);
    try {
      const fetcher = vi.fn()
        .mockResolvedValueOnce(new Response('{}', { status: 401 }))
        .mockResolvedValueOnce(new Response('{"message":"Origem não autorizada."}', { status: 403 }));
      vi.stubGlobal('fetch', fetcher);
      await expect(http('/autenticacao/eu')).rejects.toThrow('origem não é autorizada');
      expect(expired).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('session-expired', expired);
    }
  });
  it('maps API errors to Portuguese fallbacks by status', async () => {
    const cases: Array<[number, RegExp]> = [
      [403, /permissão/],
      [404, /não encontrado/],
      [429, /tentativas/],
      [500, /indisponível/],
    ];
    for (const [status, message] of cases) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })));
      await expect(http('/admin/imoveis', {}, false)).rejects.toThrow(message);
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"message":"Regra de negócio."}', { status: 422 })));
    await expect(http('/admin/imoveis', {}, false)).rejects.toThrow('Regra de negócio.');
  });
});
