import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { sampleProperty } from '../src/seo/fixture.ts';

const properties = Array.from({ length: 11 }, (_, i) => ({ ...sampleProperty, id: `test-${i}`, slug: `${sampleProperty.slug}-${i}`, title: `${sampleProperty.title} ${i + 1}` }));
const api = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  res.setHeader('Content-Type', 'application/json');
  if (url.pathname === '/properties') {
    const page = Number(url.searchParams.get('page') || 1); const limit = Number(url.searchParams.get('limit') || 9);
    res.end(JSON.stringify({ items: properties.slice((page - 1) * limit, page * limit), total: properties.length, page, limit, totalPages: Math.ceil(properties.length / limit) }));
  } else if (url.pathname.startsWith('/properties/')) {
    const property = properties.find(item => item.slug === decodeURIComponent(url.pathname.slice(12)));
    res.writeHead(property ? 200 : 404); res.end(JSON.stringify(property || { message: 'Não encontrado' }));
  } else if (url.pathname === '/leads' && req.method === 'POST') {
    res.writeHead(201); res.end(JSON.stringify({ id: 'test-lead' }));
  } else if (url.pathname === '/proxy-check') {
    let body = ''; for await (const part of req) body += part;
    res.setHeader('Set-Cookie', ['first=test; HttpOnly; Path=/', 'second=test; Path=/']);
    res.end(JSON.stringify({ method: req.method, body, cookie: req.headers.cookie }));
  } else { res.writeHead(401); res.end(JSON.stringify({ message: 'Sessão de teste não autenticada' })); }
});
await new Promise(resolve => api.listen(4199, '127.0.0.1', resolve));
const preview = spawn(process.execPath, ['scripts/preview.mjs'], { env: { ...process.env, API_ORIGIN: 'http://127.0.0.1:4199', SITE_URL: 'https://imoveis.example', SEO_INDEXABLE: 'false', PORT: '4180' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
preview.stdout.pipe(process.stdout); preview.stderr.pipe(process.stderr);
await new Promise((resolve, reject) => { preview.stdout.once('data', resolve); preview.once('error', reject); preview.once('exit', code => reject(new Error(`Preview exited: ${code}`))); });
try {
  const catalog = await fetch('http://127.0.0.1:4180/'); const html = await catalog.text();
  assert.equal(catalog.status, 200); assert.match(html, /<h1>Imóveis comerciais/); assert.match(html, /Sala comercial no Centro 1/);
  assert.match(html, /href="\/\?page=2"/); assert.match(html, /application\/ld\+json/);
  const property = await fetch(`http://127.0.0.1:4180/imoveis/${properties[0].slug}`);
  assert.equal(property.status, 200); assert.match(await property.text(), /BreadcrumbList/);
  assert.equal((await fetch('http://127.0.0.1:4180/imoveis/missing')).status, 404);
  assert.equal((await fetch('http://127.0.0.1:4180/missing')).status, 404);
  const proxy = await fetch('http://127.0.0.1:4180/api/proxy-check', { method: 'POST', headers: { Cookie: 'test=value' }, body: 'test body' });
  assert.deepEqual(await proxy.json(), { method: 'POST', cookie: 'test=value', body: 'test body' });
  assert.equal(proxy.headers.getSetCookie().length, 2);
  for (const path of ['/robots.txt', '/llms.txt', '/sitemap.xml', '/admin/login']) assert.equal((await fetch(`http://127.0.0.1:4180${path}`)).status, 200);
  process.env.API_ORIGIN = 'http://127.0.0.1:4199';
  process.env.SITE_URL = 'https://imoveis.example';
  process.env.SEO_INDEXABLE = 'false';
  const { default: vercelHandler } = await import('../.vercel/output/functions/render.func/index.mjs');
  const generated = createServer(vercelHandler);
  await new Promise(resolve => generated.listen(0, '127.0.0.1', resolve));
  try {
    const deployed = await fetch(`http://127.0.0.1:${generated.address().port}/imoveis/${properties[0].slug}`);
    assert.equal(deployed.status, 200);
    assert.match(await deployed.text(), /<h1>Sala comercial no Centro 1<\/h1>/);
  } finally { generated.close(); }
  console.log('Production smoke passed: SSR, metadata, pagination, 404, discovery and streaming API proxy with cookies.');
  console.log('Generated Vercel function passed in standalone Node runtime.');
  if (process.argv.includes('--serve')) { console.log('Browser QA fixture: http://127.0.0.1:4180'); await new Promise(() => {}); }
} finally { preview.kill(); api.close(); }
