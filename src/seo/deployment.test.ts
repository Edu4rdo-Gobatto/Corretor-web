import { expect, it } from 'vitest';
import { deploymentRoutes } from './deployment';

it('routes API uploads directly to the backend ahead of assets and SSR', () => {
  const routes = deploymentRoutes('https://api.example');
  const first = routes[0];
  expect(first).toMatchObject({ src: '^/api/(.*)$', dest: 'https://api.example/$1' });
  expect('/api/properties/id/media'.replace(new RegExp(first.src!), first.dest!)).toBe('https://api.example/properties/id/media');
  expect(routes.at(-1)).toEqual({ src: '/.*', dest: '/render' });
});
