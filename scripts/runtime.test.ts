// @vitest-environment node
import { createServer } from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { createHandler } from './runtime.mjs';

const securityHeaderNames = ['x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy'];
const requestThrough = async (handler: ReturnType<typeof createHandler>, path: string) => {
  const server = createServer((request, response) => handler(request, response));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('test server did not bind');
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
    await response.arrayBuffer();
    return response;
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
};

let upstream: ReturnType<typeof createServer> | undefined;
afterEach(() => upstream?.close());

describe('runtime proxy security headers', () => {
  it('keeps security headers when upstream sends conflicting values', async () => {
    upstream = createServer((_request, response) => {
      response.writeHead(200, { 'x-frame-options': 'ALLOWALL', 'referrer-policy': 'unsafe-url', 'permissions-policy': 'camera=(*)' });
      response.end('ok');
    });
    await new Promise<void>((resolve) => upstream!.listen(0, '127.0.0.1', resolve));
    const address = upstream.address();
    if (!address || typeof address === 'string') throw new Error('upstream did not bind');
    const response = await requestThrough(createHandler(() => Promise.reject(new Error('not used')), async () => '', { apiOrigin: `http://127.0.0.1:${address.port}` }), '/api/test');
    expect(response.status).toBe(200);
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('permissions-policy')).toContain('camera=()');
  });

  it('adds headers to connection errors', async () => {
    const response = await requestThrough(createHandler(() => Promise.reject(new Error('not used')), async () => '', { apiOrigin: 'http://127.0.0.1:1' }), '/api/test');
    expect(response.status).toBe(503);
    for (const name of securityHeaderNames) expect(response.headers.get(name)).toBeTruthy();
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex,nofollow');
  });
});
