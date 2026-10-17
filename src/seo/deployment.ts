// Arquivos que o Vite gera com hash de conteúdo (nome-HASH8.ext): nunca mudam sob o mesmo nome.
const COM_HASH = '.+-[A-Za-z0-9_-]{8}\\.(?:js|css|woff2?)$';
const ASSET_COM_HASH = `^/assets/${COM_HASH}`;
// Complemento exato do anterior: as duas rotas `continue` não podem se sobrepor, senão a última sobrescreve o imutável.
const ASSET_SEM_HASH = `^/assets/(?!${COM_HASH}).+$`;
const CACHE_ASSET_COM_HASH = 'public, max-age=31536000, immutable';
// public/assets/* é copiado sem hash (hero, logos, mp3): cache moderado, nunca imutável.
const CACHE_ASSET_SEM_HASH = 'public, max-age=86400, stale-while-revalidate=604800';

// Mesma política da Vercel para o `preview`, que serve os arquivos sem a plataforma.
export function cacheDeAsset(pathname: string): string | null {
  if (new RegExp(ASSET_COM_HASH).test(pathname)) return CACHE_ASSET_COM_HASH;
  return new RegExp(ASSET_SEM_HASH).test(pathname) ? CACHE_ASSET_SEM_HASH : null;
}

// External rewrites keep API uploads out of the SSR function's body-size limit.
export function deploymentRoutes(apiOrigin: string): { src?: string; dest?: string; handle?: string; headers?: Record<string, string>; continue?: boolean }[] {
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
    // Rotas com `continue` só acrescentam o cabeçalho; a resposta vem do sistema de arquivos logo abaixo.
    { src: ASSET_COM_HASH, headers: { 'Cache-Control': CACHE_ASSET_COM_HASH }, continue: true },
    { src: ASSET_SEM_HASH, headers: { 'Cache-Control': CACHE_ASSET_SEM_HASH }, continue: true },
    { handle: 'filesystem' },
    { src: '/.*', dest: '/render' },
  ];
}
