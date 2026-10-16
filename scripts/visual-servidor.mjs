import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { catalogoExemplo, classificacoesExemplo } from '../src/seo/fixture.ts';

// Só dados sintéticos. Os cenários de SSR são selecionados pela própria consulta,
// portanto um worker não modifica o cenário de outro.
const imoveis = catalogoExemplo();
const inesperadas = [];
const registroInesperadas = 'test-results/visual/ssr-inesperadas.json';
const api = createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:4199');
  const responder = (status, corpo) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(corpo)); };
  const inesperada = status => {
    const descricao = `${req.method} ${url.pathname}${url.search}`;
    inesperadas.push(descricao);
    writeFileSync(registroInesperadas, JSON.stringify(inesperadas));
    console.error(`API visual: rota inesperada ${descricao}`);
    responder(status, { message: 'Rota ou método inesperado na API visual.' });
  };
  if (req.method !== 'GET') return inesperada(405);
  const categorias = { '/tipos-imovel': classificacoesExemplo.tipos, '/finalidades-imovel': classificacoesExemplo.finalidades, '/caracteristicas': classificacoesExemplo.caracteristicas, '/cidades': classificacoesExemplo.cidades };
  if (categorias[url.pathname]) {
    const itens = categorias[url.pathname];
    return responder(200, { itens, total: itens.length, pagina: 1, limite: 100, total_paginas: 1 });
  }
  if (url.pathname === '/imoveis') {
    if (url.searchParams.get('bairro') === 'Cenario503') return responder(503, { message: 'Indisponibilidade simulada.' });
    const p = url.searchParams;
    const tipos = (p.get('tipo_id') ?? '').split(',').filter(Boolean).map(Number);
    let itens = imoveis.filter(i => (!tipos.length || tipos.includes(i.tipo_id)) && (!p.has('finalidade_id') || i.finalidade_id === Number(p.get('finalidade_id'))) && ['cidade', 'bairro'].every(c => !p.has(c) || i[c].toLowerCase().includes(p.get(c).toLowerCase())));
    itens = itens.filter(i => {
      const valor = Number(i.valor_locacao ?? i.valor_venda), area = Number(i.area_util);
      return (!p.has('valor_min') || valor >= Number(p.get('valor_min'))) && (!p.has('valor_max') || valor <= Number(p.get('valor_max'))) && (!p.has('area_min') || area >= Number(p.get('area_min'))) && (!p.has('area_max') || area <= Number(p.get('area_max')));
    });
    const ordem = p.get('ordenar');
    if (ordem?.startsWith('valor')) itens.sort((a,b) => (Number(a.valor_locacao ?? a.valor_venda) - Number(b.valor_locacao ?? b.valor_venda)) * (ordem.endsWith('desc') ? -1 : 1));
    if (ordem?.startsWith('area')) itens.sort((a,b) => (Number(a.area_util) - Number(b.area_util)) * (ordem.endsWith('desc') ? -1 : 1));
    const pagina = Number(p.get('pagina') || 1), limite = Number(p.get('limite') || 9);
    return responder(200, { itens: itens.slice((pagina - 1) * limite, pagina * limite), total: itens.length, pagina, limite, total_paginas: Math.ceil(itens.length / limite) });
  }
  if (/^\/imoveis\/[^/]+$/.test(url.pathname)) {
    const id = Number(url.pathname.match(/(?:-|\/)(\d+)$/)?.[1]);
    const item = imoveis.find(i => i.id === id);
    return responder(item ? 200 : 404, item ?? { message: 'Registro não encontrado.' });
  }
  inesperada(500);
});
let preview;
let encerrando = false;
function encerrar(codigo = 0) {
  if (encerrando) return;
  encerrando = true;
  preview?.kill('SIGTERM');
  api.close(() => process.exit(codigo));
  api.closeAllConnections();
}
process.on('SIGTERM', () => encerrar());
process.on('SIGINT', () => encerrar());
api.on('error', erro => { console.error(erro); encerrar(1); });
await new Promise((resolve, reject) => { api.once('error', reject); api.listen(4199, '127.0.0.1', resolve); });
// Só uma instância que conseguiu reservar a porta pode iniciar um registro novo.
mkdirSync('test-results/visual', { recursive: true });
writeFileSync(registroInesperadas, '[]');
preview = spawn(process.execPath, ['scripts/preview.mjs'], { windowsHide: true, stdio: 'inherit', env: { ...process.env, HOST: '127.0.0.1', PORT: '4180', API_ORIGIN: 'http://127.0.0.1:4199', SITE_URL: 'https://imoveis.example', SEO_INDEXABLE: 'false' } });
preview.on('error', erro => { console.error(erro); encerrar(1); });
preview.on('exit', codigo => { if (!encerrando) encerrar(codigo ?? 1); });
