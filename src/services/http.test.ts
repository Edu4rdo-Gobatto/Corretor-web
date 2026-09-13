import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, httpBlob, setAccessToken } from './http';
describe('HTTP session', () => {
  beforeEach(() => setAccessToken(null));
  it('shares one renewal between a document download and JSON request', async () => {
    const fetcher=vi.fn(async (path:string,options:RequestInit)=>{
      if(path.endsWith('/auth/refresh')) return new Response(JSON.stringify({accessToken:'fresh'}));
      if(new Headers(options.headers).get('Authorization')!=='Bearer fresh')return new Response('{}',{status:401});
      return path.endsWith('/download')?new Response('private document'):new Response('{"ok":true}');
    });
    vi.stubGlobal('fetch',fetcher);
    const [blob,result]=await Promise.all([httpBlob('/admin/rental-documents/id/download'),http('/admin/leases')]);
    expect(blob.size).toBe(16);
    expect(result).toEqual({ok:true});
    expect(fetcher.mock.calls.filter(([path])=>path.endsWith('/auth/refresh'))).toHaveLength(1);
    expect(fetcher.mock.calls[0][1].cache).toBe('no-store');
  });
  it('refreshes an expired access token once and retries using the new token', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('{}', { status: 401 })).mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: 'fresh' }), { status: 200 })).mockResolvedValueOnce(new Response(JSON.stringify({ name: 'Ana' }), { status: 200 }));
    vi.stubGlobal('fetch', fetcher);
    await expect(http('/auth/me')).resolves.toEqual({ name: 'Ana' });
    expect(fetcher.mock.calls[2][1].headers.get('Authorization')).toBe('Bearer fresh');
    expect(fetcher.mock.calls[1][0]).toBe('/api/auth/refresh');
  });
  it('never substitutes demo data on a failed request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));
    await expect(http('/properties')).rejects.toThrow('conectar');
  });
});
