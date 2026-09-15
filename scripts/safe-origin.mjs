const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

export function assertSafeLocalApiOrigin({ mode, apiOrigin, allowRemote = false }) {
  if (allowRemote || !apiOrigin) return;
  const parsed = new URL(apiOrigin);
  if (LOCAL_HOSTS.has(parsed.hostname)) return;
  throw new Error(`API_ORIGIN local deve apontar para localhost ou 127.0.0.1 durante ${mode}; configure uma API de teste local antes de iniciar.`);
}
