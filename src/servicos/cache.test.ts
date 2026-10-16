import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emCache, guardarCache, lerCache, limparCache } from './cache';

function pendente<T>() {
  let resolver!: (valor: T) => void;
  let rejeitar!: (erro: Error) => void;
  const promessa = new Promise<T>((resolve, reject) => { resolver = resolve; rejeitar = reject; });
  return { promessa, resolver, rejeitar };
}

beforeEach(() => { limparCache(); vi.useFakeTimers(); vi.setSystemTime(0); });
afterEach(() => { limparCache(); vi.useRealTimers(); });

describe('cache público em memória', () => {
  it('lê o valor até o instante exato de expiração e então carrega novamente', async () => {
    guardarCache('catalogo', { total: 9 }, 100);
    const carregar = vi.fn().mockResolvedValue({ total: 12 });
    vi.setSystemTime(99);
    expect(lerCache('catalogo')).toEqual({ total: 9 });
    await expect(emCache('catalogo', 100, carregar)).resolves.toEqual({ total: 9 });
    expect(carregar).not.toHaveBeenCalled();
    vi.setSystemTime(100);
    expect(lerCache('catalogo')).toBeUndefined();
    await expect(emCache('catalogo', 100, carregar)).resolves.toEqual({ total: 12 });
    expect(carregar).toHaveBeenCalledTimes(1);
  });

  it('compartilha a promessa da mesma chave e mantém chaves independentes', async () => {
    const carga = pendente<string>();
    const carregar = vi.fn(() => carga.promessa);
    const primeira = emCache('a', 100, carregar);
    expect(emCache('a', 100, carregar)).toBe(primeira);
    expect(lerCache('a')).toBeUndefined();
    await expect(emCache('b', 100, async () => 'B')).resolves.toBe('B');
    carga.resolver('A');
    await expect(primeira).resolves.toBe('A');
    expect(carregar).toHaveBeenCalledTimes(1);
    expect(lerCache('b')).toBe('B');
  });

  it('remove a falha para permitir uma nova tentativa', async () => {
    const falha = new Error('temporário');
    const carregar = vi.fn().mockRejectedValueOnce(falha).mockResolvedValueOnce('recuperado');
    await expect(emCache('a', 100, carregar)).rejects.toBe(falha);
    expect(lerCache('a')).toBeUndefined();
    await expect(emCache('a', 100, carregar)).resolves.toBe('recuperado');
    expect(carregar).toHaveBeenCalledTimes(2);
  });

  it('começa o TTL na resolução, mantendo deduplicação enquanto a carga demora', async () => {
    const carga = pendente<string>();
    const carregar = vi.fn(() => carga.promessa);
    const primeira = emCache('a', 100, carregar);
    vi.setSystemTime(150);
    expect(emCache('a', 100, carregar)).toBe(primeira);
    carga.resolver('resultado');
    await primeira;
    expect(carregar).toHaveBeenCalledTimes(1);
    vi.setSystemTime(249);
    expect(lerCache('a')).toBe('resultado');
    vi.setSystemTime(250);
    expect(lerCache('a')).toBeUndefined();
  });

  it.each(['limpar', 'semear'] as const)('não restaura resultado antigo após %s durante a carga', async (acao) => {
    const carga = pendente<string>();
    const antiga = emCache('a', 100, () => carga.promessa);
    if (acao === 'limpar') limparCache();
    guardarCache('a', 'novo', 100);
    carga.resolver('antigo');
    await expect(antiga).resolves.toBe('antigo');
    expect(lerCache('a')).toBe('novo');
  });

  it.each(['limpar', 'semear'] as const)('rejeição antiga não remove a entrada nova após %s', async (acao) => {
    const carga = pendente<string>();
    const antiga = emCache('a', 100, () => carga.promessa);
    const rejeicao = expect(antiga).rejects.toThrow('antigo');
    if (acao === 'limpar') limparCache();
    guardarCache('a', 'novo', 100);
    carga.rejeitar(new Error('antigo'));
    await rejeicao;
    expect(lerCache('a')).toBe('novo');
  });

  it('limpeza permite uma nova promessa que não é substituída pela antiga', async () => {
    const antiga = pendente<string>();
    const nova = pendente<string>();
    const primeira = emCache('a', 100, () => antiga.promessa);
    limparCache();
    const segunda = emCache('a', 100, () => nova.promessa);
    antiga.resolver('antigo');
    await primeira;
    expect(emCache('a', 100, async () => 'inesperado')).toBe(segunda);
    nova.resolver('novo');
    await segunda;
    expect(lerCache('a')).toBe('novo');
  });

  it('limpar sem substituição impede uma carga antiga de repovoar o cache', async () => {
    const carga = pendente<string>();
    const primeira = emCache('a', 100, () => carga.promessa);
    limparCache();
    carga.resolver('antigo');
    await expect(primeira).resolves.toBe('antigo');
    expect(lerCache('a')).toBeUndefined();
    const carregar = vi.fn().mockResolvedValue('novo');
    await expect(emCache('a', 100, carregar)).resolves.toBe('novo');
    expect(carregar).toHaveBeenCalledTimes(1);
  });

  it('evita entradas acima de 40 por FIFO; leitura não promove a chave', () => {
    for (let indice = 0; indice < 40; indice++) guardarCache(`c${indice}`, indice, 100);
    expect(lerCache('c0')).toBe(0);
    guardarCache('c40', 40, 100);
    expect(lerCache('c0')).toBeUndefined();
    expect(lerCache('c1')).toBe(1);
    expect(lerCache('c40')).toBe(40);
  });

  it('atualizar uma chave renova a posição de inserção', () => {
    for (let indice = 0; indice < 40; indice++) guardarCache(`c${indice}`, indice, 100);
    guardarCache('c0', 'atualizado', 100);
    guardarCache('c40', 40, 100);
    expect(lerCache('c0')).toBe('atualizado');
    expect(lerCache('c1')).toBeUndefined();
    expect(lerCache('c2')).toBe(2);
  });
});
