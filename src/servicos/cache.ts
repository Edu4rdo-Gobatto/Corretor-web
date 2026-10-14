/**
 * Cache em memória do navegador para leituras públicas (catálogo e classificações).
 * Promessas em andamento são compartilhadas; uma falha sai do cache. Qualquer escrita na API limpa tudo (http.ts).
 */
type Entrada = { valor?: unknown; promessa?: Promise<unknown>; expira: number };

const MAXIMO_ENTRADAS = 40;
const entradas = new Map<string, Entrada>();

function viva(chave: string): Entrada | undefined {
  const entrada = entradas.get(chave);
  if (entrada && entrada.expira <= Date.now()) { entradas.delete(chave); return undefined; }
  return entrada;
}

function registrar(chave: string, entrada: Entrada) {
  entradas.delete(chave);
  entradas.set(chave, entrada);
  // Map preserva a ordem de inserção: a primeira chave é a mais antiga.
  if (entradas.size > MAXIMO_ENTRADAS) entradas.delete(entradas.keys().next().value!);
}

/** Valor já resolvido e dentro da validade; não dispara busca. */
export function lerCache<T>(chave: string): T | undefined {
  return viva(chave)?.valor as T | undefined;
}

export function guardarCache<T>(chave: string, valor: T, validadeMs: number) {
  registrar(chave, { valor, expira: Date.now() + validadeMs });
}

export function emCache<T>(chave: string, validadeMs: number, carregar: () => Promise<T>): Promise<T> {
  const entrada = viva(chave);
  if (entrada?.valor !== undefined) return Promise.resolve(entrada.valor as T);
  if (entrada?.promessa) return entrada.promessa as Promise<T>;
  const promessa = carregar().then(
    (valor) => { if (entradas.get(chave)?.promessa === promessa) guardarCache(chave, valor, validadeMs); return valor; },
    (motivo: unknown) => { if (entradas.get(chave)?.promessa === promessa) entradas.delete(chave); throw motivo; },
  );
  registrar(chave, { promessa, expira: Date.now() + validadeMs });
  return promessa;
}

export function limparCache() {
  entradas.clear();
}
