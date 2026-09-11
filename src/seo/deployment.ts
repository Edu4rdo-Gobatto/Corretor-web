// External rewrites keep API uploads out of the SSR function's body-size limit.
export function deploymentRoutes(apiOrigin: string): { src?: string; dest?: string; handle?: string; headers?: Record<string, string> }[] {
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex,nofollow' };
  return [
    ...(apiOrigin ? [{ src: '^/api/(.*)$', dest: `${apiOrigin}/$1`, headers }, { src: '^/api$', dest: `${apiOrigin}/`, headers }] : []),
    { handle: 'filesystem' },
    { src: '/.*', dest: '/render' },
  ];
}
