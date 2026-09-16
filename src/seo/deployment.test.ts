import { expect, it } from 'vitest';
import { deploymentRoutes } from './deployment';

it('roteia uploads da API direto ao backend antes dos assets e do SSR', () => {
  const rotas = deploymentRoutes('https://api.example');
  const primeira = rotas[0];
  expect(primeira).toMatchObject({ src: '^/api/(.*)$', dest: 'https://api.example/$1' });
  expect('/api/admin/imoveis/1/midias'.replace(new RegExp(primeira.src!), primeira.dest!)).toBe('https://api.example/admin/imoveis/1/midias');
  expect(primeira.headers).toMatchObject({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Permissions-Policy': 'camera=(), geolocation=(), microphone=()' });
  expect(rotas.at(-1)).toEqual({ src: '/.*', dest: '/render' });
});
