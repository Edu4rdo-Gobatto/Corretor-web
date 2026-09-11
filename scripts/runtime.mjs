import http from 'node:http';
import https from 'node:https';

export function createHandler(render, template, config) {
  return async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('X-Robots-Tag', 'noindex,nofollow');
      if (!config.apiOrigin) { response.writeHead(503); response.end('API não configurada.'); return; }
      const target = new URL(config.apiOrigin);
      const headers = { ...request.headers, host: target.host };
      delete headers.connection;
      const upstream = (target.protocol === 'https:' ? https : http).request({ hostname: target.hostname, port: target.port, protocol: target.protocol, method: request.method, path: url.pathname.slice(4) + url.search || '/', headers }, result => {
        response.writeHead(result.statusCode || 502, { ...result.headers, 'cache-control': 'no-store', 'x-robots-tag': 'noindex,nofollow' });
        result.pipe(response);
      });
      upstream.setTimeout(65000, () => upstream.destroy(new Error('API timeout')));
      upstream.on('error', () => { if (!response.headersSent) response.writeHead(503); response.end('Serviço indisponível.'); });
      request.on('aborted', () => upstream.destroy());
      request.pipe(upstream);
      return;
    }
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' }); response.end(); return; }
    try {
      const result = await render(url.pathname + url.search, config, fetch, await template(url.pathname + url.search));
      response.writeHead(result.status, result.headers);
      response.end(request.method === 'HEAD' ? undefined : result.body);
    } catch (error) {
      console.error('Public rendering failed:', error.message);
      response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex,nofollow' });
      response.end('Serviço temporariamente indisponível.');
    }
  };
}
