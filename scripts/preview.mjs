import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { loadEnv } from 'vite';
import { handleRequest, serverConfig } from '../dist/server/server.js';
import { createHandler } from './runtime.mjs';
import { assertSafeLocalApiOrigin } from './safe-origin.mjs';
import { cacheDeAsset } from '../src/seo/deployment.ts';

const mode = 'production';
const config = serverConfig({ ...loadEnv(mode, process.cwd(), ''), ...process.env, NODE_ENV: 'production' });
assertSafeLocalApiOrigin({ mode, apiOrigin: config.apiOrigin });
const template = await readFile('dist/client/index.html', 'utf8');
const handler = createHandler(handleRequest, async () => template, config);
const root = path.resolve('dist/client');
const mime = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.png': 'image/png', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon', '.json': 'application/json', '.txt': 'text/plain', '.avif': 'image/avif' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${pathname}`);
    if (file.startsWith(root + path.sep) && file !== path.join(root, 'index.html') && (await stat(file).catch(() => null))?.isFile()) {
      const cache = cacheDeAsset(pathname);
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', ...(cache ? { 'Cache-Control': cache } : {}) });
      res.end(req.method === 'HEAD' ? undefined : await readFile(file)); return;
    }
    await handler(req, res);
  } catch { res.writeHead(400); res.end(); }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`SSR preview: http://127.0.0.1:${process.env.PORT || 4173}`));
