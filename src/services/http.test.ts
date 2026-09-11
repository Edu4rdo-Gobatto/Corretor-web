import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, setAccessToken } from './http';
describe('HTTP session', () => {
  beforeEach(() => setAccessToken(null));
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
