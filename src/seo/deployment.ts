// External rewrites keep API uploads out of the SSR function's body-size limit.
export function deploymentRoutes(apiOrigin: string): { src?: string; dest?: string; handle?: string; headers?: Record<string, string> }[] {
  const headers = {
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex,nofollow',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), geolocation=(), microphone=()'
  };
  return [
    ...(apiOrigin ? [{ src: '^/api/(.*)$', dest: `${apiOrigin}/$1`, headers }, { src: '^/api$', dest: `${apiOrigin}/`, headers }] : []),
    { handle: 'filesystem' },
    { src: '/.*', dest: '/render' },
  ];
}
