import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

/** Respostas inesperadas do mock SSR também falham quando o cliente ignora o status. */
export default async function finalizar(): Promise<void> {
  const inesperadas: unknown = JSON.parse(await readFile('test-results/visual/ssr-inesperadas.json', 'utf8'));
  assert.deepEqual(inesperadas, [], `A API visual do SSR recebeu requisições inesperadas: ${JSON.stringify(inesperadas)}`);
}
