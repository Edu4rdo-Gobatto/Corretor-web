import { createServer as createHttpServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createServer, loadEnv } from 'vite';
import { createHandler } from './runtime.mjs';

const mode = process.argv.includes('--demo') ? 'demo' : 'development';
const vite = await createServer({ mode, server: { middlewareMode: true, proxy: undefined }, appType: 'custom' });
const environment = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
const { serverConfig } = await vite.ssrLoadModule('/src/seo/server.tsx');
const config = serverConfig({ ...environment, API_ORIGIN: environment.API_ORIGIN || environment.API_PROXY_TARGET || 'http://localhost:3000' });
const handler = createHandler(async (...args) => {
  const { handleRequest } = await vite.ssrLoadModule('/src/seo/server.tsx');
  return handleRequest(...args);
}, async url => vite.transformIndexHtml(url, await readFile('index.html', 'utf8')), config);
const port = Number(process.env.PORT || 5173);
createHttpServer((req, res) => vite.middlewares(req, res, () => handler(req, res))).listen(port, '127.0.0.1', () => console.log(`SSR development: http://127.0.0.1:${port}`));
