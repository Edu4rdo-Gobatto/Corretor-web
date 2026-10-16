import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const argumentos = process.argv.slice(2);
const semBuild = argumentos.includes('--sem-build');
const somenteBuild = argumentos.includes('--so-build');
const atualizar = argumentos.includes('--atualizar');
if (semBuild && somenteBuild) throw new Error('--sem-build e --so-build são incompatíveis.');
if (atualizar && process.env.CI) throw new Error('Referências só podem ser atualizadas explicitamente fora do CI.');
if (argumentos.some((argumento) => argumento.startsWith('--update-snapshots') || /^-u/.test(argumento))) {
  throw new Error('Para revisar e atualizar referências, use npm run visual:atualizar.');
}
const parametros = argumentos.filter((argumento) => !['--sem-build', '--so-build', '--atualizar'].includes(argumento));
const ambiente = {
  ...process.env,
  VITE_API_URL: '/api',
  API_ORIGIN: 'http://127.0.0.1:4199',
  API_PROXY_TARGET: 'http://127.0.0.1:4199',
  SITE_URL: 'https://imoveis.example',
  SEO_INDEXABLE: 'false',
  NODE_ENV: 'production',
  VERCEL_ENV: 'preview',
};
const marca = 'dist/visual-build.json';
const configuracao = { api: ambiente.API_ORIGIN, cliente: ambiente.VITE_API_URL, indexavel: false };
async function identificarBuild() {
  const arquivos = ['dist/client/index.html', 'dist/server/server.js'];
  const hashes = await Promise.all(arquivos.map(async (arquivo) => createHash('sha256').update(await readFile(arquivo)).digest('hex')));
  return { ...configuracao, hashes };
}

async function executar(arquivo, opcoes = []) {
  const filho = spawn(process.execPath, [arquivo, ...opcoes], {
    env: ambiente, stdio: 'inherit', windowsHide: true,
  });
  const parar = () => filho.kill();
  process.once('SIGINT', parar);
  process.once('SIGTERM', parar);
  try {
    await new Promise((resolve, reject) => {
      filho.once('error', reject);
      filho.once('exit', (codigo, sinal) => codigo === 0 ? resolve() : reject(new Error(`Processo terminou com ${codigo ?? sinal}: ${path.basename(arquivo)}`)));
    });
  } finally {
    process.removeListener('SIGINT', parar);
    process.removeListener('SIGTERM', parar);
  }
}

if (!semBuild) {
  console.log('Build visual isolado: /api → 127.0.0.1:4199, indexação desativada.');
  await executar(require.resolve('typescript/bin/tsc'), ['-b']);
  await executar('scripts/build.mjs');
  await writeFile(marca, JSON.stringify(await identificarBuild()));
} else {
  await access('dist/client/index.html');
  await access('dist/server/server.js');
  const anterior = JSON.parse(await readFile(marca, 'utf8').catch(() => {
    throw new Error('Build visual não identificado. Execute npm run visual:build antes de visual:sem-build.');
  }));
  if (JSON.stringify(anterior) !== JSON.stringify(await identificarBuild())) throw new Error('Build visual incompatível ou substituído. Execute npm run visual:build novamente.');
}
if (!somenteBuild) {
  const cli = path.join(path.dirname(require.resolve('@playwright/test/package.json')), 'cli.js');
  await executar(cli, ['test', '-c', 'playwright.visual.config.ts', ...(atualizar ? ['--update-snapshots=all'] : []), ...parametros]);
}
