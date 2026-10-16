import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Classificacoes, ConsultaCatalogo, ImovelResumo, Pagina } from '../tipos';
import { lerConsultaCatalogo } from './catalogo';

let servico: typeof import('./api');
let cache: typeof import('./cache');
const buscar = vi.fn<typeof fetch>();
const consulta: ConsultaCatalogo = { pagina: 1, limite: 9 };
const paginaVazia: Pagina<ImovelResumo> = { itens: [], total: 0, pagina: 1, limite: 9, total_paginas: 0 };
const referencias: Classificacoes = {
  tipos: [{ id: 3, nome: 'Loja', slug: 'loja', ativo: true }, { id: 7, nome: 'Galpão', slug: 'galpao', ativo: true }],
  finalidades: [{ id: 2, nome: 'Venda', slug: 'venda', ativo: true }],
  caracteristicas: [{ id: 8, nome: 'Elevador', slug: 'elevador', ativo: true }],
  cidades: [{ id: 12, nome: 'Juara', slug: 'juara', ativo: true }],
};
const resposta = (valor: unknown, status = 200) => new Response(JSON.stringify(valor), { status });
function pendente<T>() {
  let resolver!: (valor: T) => void;
  const promessa = new Promise<T>((resolve) => { resolver = resolve; });
  return { promessa, resolver };
}
function paginaReferencia(caminho: string) {
  const categoria = caminho.split('/').at(-1)?.split('?')[0];
  const itensPorCategoria: Record<string, Classificacoes[keyof Classificacoes]> = {
    'tipos-imovel': referencias.tipos,
    'finalidades-imovel': referencias.finalidades,
    caracteristicas: referencias.caracteristicas,
    cidades: referencias.cidades,
  };
  const itens = itensPorCategoria[categoria ?? ''];
  if (!itens) throw new Error(`Categoria não prevista no teste: ${caminho}`);
  return { itens, total: itens.length, pagina: 1, limite: 100, total_paginas: 1 };
}

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('VITE_API_URL', '/api');
  vi.stubGlobal('fetch', buscar);
  buscar.mockReset();
  vi.useFakeTimers();
  vi.setSystemTime(0);
  servico = await import('./api');
  cache = await import('./cache');
});
afterEach(() => {
  cache.limparCache();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('cache do catálogo pela API real', () => {
  it('vale por 120000 ms e renova a busca no instante de expiração', async () => {
    buscar.mockImplementation(async () => resposta(paginaVazia));
    await expect(servico.api.listarImoveis(consulta)).resolves.toEqual(paginaVazia);
    vi.setSystemTime(119999);
    await servico.api.listarImoveis(consulta);
    expect(servico.catalogoEmCache(consulta)).toEqual(paginaVazia);
    expect(buscar).toHaveBeenCalledTimes(1);
    vi.setSystemTime(120000);
    expect(servico.catalogoEmCache(consulta)).toBeUndefined();
    await servico.api.listarImoveis(consulta);
    expect(buscar).toHaveBeenCalledTimes(2);
    expect(buscar.mock.calls.map(([url]) => url)).toEqual(['/api/imoveis?pagina=1&limite=9', '/api/imoveis?pagina=1&limite=9']);
  });

  it('bootstrap semeado evita todas as chamadas e mantém validade do catálogo e classificações', async () => {
    servico.semearCatalogo(consulta, paginaVazia);
    servico.semearClassificacoes(referencias);
    await expect(servico.api.listarImoveis(consulta)).resolves.toBe(paginaVazia);
    await expect(servico.api.classificacoes()).resolves.toBe(referencias);
    expect(servico.catalogoEmCache(consulta)).toBe(paginaVazia);
    expect(servico.classificacoesEmCache()).toBe(referencias);
    expect(buscar).not.toHaveBeenCalled();
    vi.setSystemTime(120000);
    expect(servico.catalogoEmCache(consulta)).toBeUndefined();
    expect(servico.classificacoesEmCache()).toBe(referencias);
    vi.setSystemTime(600000);
    expect(servico.classificacoesEmCache()).toBeUndefined();
  });

  it('consultas equivalentes compartilham promessa e chave, com limite público fixo 9', async () => {
    servico.semearClassificacoes(referencias);
    const carga = pendente<Response>();
    buscar.mockReturnValue(carga.promessa);
    const primeiraConsulta = lerConsultaCatalogo(new URLSearchParams('tipo=loja&tipo=galpao&limite=100'));
    const segundaConsulta = lerConsultaCatalogo(new URLSearchParams('tipo=galpao,loja,loja&ordenar=recentes&pagina=1&limite=1'));
    expect(primeiraConsulta).toEqual({ pagina: 1, limite: 9, tipos: ['galpao', 'loja'] });
    expect(segundaConsulta).toEqual(primeiraConsulta);
    const primeira = servico.api.listarImoveis(primeiraConsulta);
    const segunda = servico.api.listarImoveis(segundaConsulta);
    expect(segunda).toBe(primeira);
    carga.resolver(resposta(paginaVazia));
    await Promise.all([primeira, segunda]);
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(buscar.mock.calls[0][0]).toBe('/api/imoveis?pagina=1&limite=9&tipo_id=7%2C3');
    expect(servico.catalogoEmCache(segundaConsulta)).toEqual(paginaVazia);
  });

  it('filtro, ordenação e página diferentes não compartilham resultados', async () => {
    buscar.mockImplementation(async () => resposta(paginaVazia));
    await Promise.all([
      servico.api.listarImoveis(consulta),
      servico.api.listarImoveis({ ...consulta, cidade: 'Juara' }),
      servico.api.listarImoveis({ ...consulta, pagina: 2 }),
      servico.api.listarImoveis({ ...consulta, ordenar: 'valor_asc' }),
    ]);
    expect(buscar.mock.calls.map(([url]) => url)).toEqual([
      '/api/imoveis?pagina=1&limite=9',
      '/api/imoveis?pagina=1&limite=9&cidade=Juara',
      '/api/imoveis?pagina=2&limite=9',
      '/api/imoveis?pagina=1&limite=9&ordenar=valor_asc',
    ]);
  });

  it('classificação inexistente produz catálogo vazio sem consultar imóveis', async () => {
    servico.semearClassificacoes(referencias);
    await expect(servico.api.listarImoveis({ ...consulta, tipos: ['inexistente'] })).resolves.toEqual(paginaVazia);
    expect(buscar).not.toHaveBeenCalled();
  });

  it('listarFichas busca toda vez, usa admin e preserva cache público', async () => {
    servico.semearCatalogo(consulta, paginaVazia);
    buscar.mockImplementation(async () => resposta({ ...paginaVazia, total: 99, limite: 20 }));
    const filtros = { pagina: 1, limite: 20, tipos: ['3', '7'], finalidade: '2', ativo: false };
    await expect(servico.api.listarFichas(filtros)).resolves.toMatchObject({ total: 99 });
    await servico.api.listarFichas(filtros);
    expect(buscar).toHaveBeenCalledTimes(2);
    expect(buscar.mock.calls.map(([url]) => url)).toEqual([
      '/api/admin/imoveis?pagina=1&limite=20&ativo=false&tipo_id=3%2C7&finalidade_id=2',
      '/api/admin/imoveis?pagina=1&limite=20&ativo=false&tipo_id=3%2C7&finalidade_id=2',
    ]);
    expect(servico.catalogoEmCache(consulta)).toBe(paginaVazia);
    await servico.api.listarImoveis(consulta);
    expect(buscar).toHaveBeenCalledTimes(2);
  });

  it('401 no catálogo público não renova e a falha permite tentar novamente', async () => {
    buscar.mockResolvedValueOnce(resposta({}, 401)).mockResolvedValueOnce(resposta(paginaVazia));
    await expect(servico.api.listarImoveis(consulta)).rejects.toMatchObject({ status: 401 });
    expect(buscar.mock.calls.map(([url]) => url)).toEqual(['/api/imoveis?pagina=1&limite=9']);
    expect(servico.catalogoEmCache(consulta)).toBeUndefined();
    await expect(servico.api.listarImoveis(consulta)).resolves.toEqual(paginaVazia);
    expect(buscar).toHaveBeenCalledTimes(2);
  });
});

describe('classificações públicas e gerenciadas', () => {
  it('classificações ficam em cache 600000 ms e expiram no limite exato', async () => {
    buscar.mockImplementation(async (url) => resposta(paginaReferencia(String(url))));
    await expect(servico.api.classificacoes()).resolves.toEqual(referencias);
    vi.setSystemTime(599999);
    await servico.api.classificacoes();
    expect(buscar).toHaveBeenCalledTimes(4);
    vi.setSystemTime(600000);
    expect(servico.classificacoesEmCache()).toBeUndefined();
    await servico.api.classificacoes();
    expect(buscar).toHaveBeenCalledTimes(8);
  });

  it('paginação percorre as quatro categorias e compartilha a carga pública', async () => {
    buscar.mockImplementation(async (destino) => {
      const url = new URL(String(destino), 'https://teste.local');
      const pagina = Number(url.searchParams.get('pagina'));
      const categoria = url.pathname.split('/').at(-1);
      const base = categoria === 'tipos-imovel' ? 10 : categoria === 'finalidades-imovel' ? 20 : categoria === 'caracteristicas' ? 30 : 40;
      // Sem total_paginas, o contrato também permite calcular pelo total/limite.
      return resposta({ itens: [{ id: base + pagina, nome: `${categoria} ${pagina}`, ativo: true }], total: 101, pagina, limite: 100 });
    });
    const primeira = servico.api.classificacoes();
    expect(servico.api.classificacoes()).toBe(primeira);
    await expect(primeira).resolves.toEqual({
      tipos: [{ id: 11, nome: 'tipos-imovel 1', ativo: true }, { id: 12, nome: 'tipos-imovel 2', ativo: true }],
      finalidades: [{ id: 21, nome: 'finalidades-imovel 1', ativo: true }, { id: 22, nome: 'finalidades-imovel 2', ativo: true }],
      caracteristicas: [{ id: 31, nome: 'caracteristicas 1', ativo: true }, { id: 32, nome: 'caracteristicas 2', ativo: true }],
      cidades: [{ id: 41, nome: 'cidades 1', ativo: true }, { id: 42, nome: 'cidades 2', ativo: true }],
    });
    expect(buscar.mock.calls.map(([url]) => url).sort()).toEqual([
      '/api/caracteristicas?pagina=1&limite=100', '/api/caracteristicas?pagina=2&limite=100',
      '/api/cidades?pagina=1&limite=100', '/api/cidades?pagina=2&limite=100',
      '/api/finalidades-imovel?pagina=1&limite=100', '/api/finalidades-imovel?pagina=2&limite=100',
      '/api/tipos-imovel?pagina=1&limite=100', '/api/tipos-imovel?pagina=2&limite=100',
    ]);
  });

  it.each(['tipos-imovel', 'finalidades-imovel', 'caracteristicas'])('falha em %s não guarda classificações incompletas e recarrega todas no retry', async (categoria) => {
    buscar.mockImplementation(async (url) => String(url).includes(`/${categoria}?`) ? resposta({}, 503) : resposta(paginaReferencia(String(url))));
    await expect(servico.api.classificacoes()).rejects.toMatchObject({ status: 503 });
    expect(servico.classificacoesEmCache()).toBeUndefined();
    expect(buscar).toHaveBeenCalledTimes(4);
    buscar.mockImplementation(async (url) => resposta(paginaReferencia(String(url))));
    await expect(servico.api.classificacoes()).resolves.toEqual(referencias);
    expect(buscar).toHaveBeenCalledTimes(8);
  });

  it('classificacoes(true) busca admin toda vez sem usar nem contaminar cache público', async () => {
    servico.semearClassificacoes(referencias);
    buscar.mockImplementation(async () => resposta({ itens: [{ id: 90, nome: 'Inativo', ativo: false }], total: 1, pagina: 1, limite: 100, total_paginas: 1 }));
    const gerenciadas = await servico.api.classificacoes(true);
    expect(gerenciadas.tipos).toEqual([{ id: 90, nome: 'Inativo', ativo: false }]);
    await servico.api.classificacoes(true);
    expect(buscar).toHaveBeenCalledTimes(8);
    expect(buscar.mock.calls.slice(0, 4).map(([url]) => url)).toEqual([
      '/api/admin/tipos-imovel?pagina=1&limite=100',
      '/api/admin/finalidades-imovel?pagina=1&limite=100',
      '/api/admin/caracteristicas?pagina=1&limite=100',
      '/api/admin/cidades?pagina=1&limite=100',
    ]);
    await expect(servico.api.classificacoes()).resolves.toBe(referencias);
    expect(servico.classificacoesEmCache()).toBe(referencias);
    expect(buscar).toHaveBeenCalledTimes(8);
  });

  it('classificações admin com cache frio não semeiam o cache público', async () => {
    buscar.mockImplementation(async () => resposta({ itens: [{ id: 90, nome: 'Inativo', ativo: false }], total: 1, pagina: 1, limite: 100, total_paginas: 1 }));
    await servico.api.classificacoes(true);
    expect(servico.classificacoesEmCache()).toBeUndefined();
    buscar.mockImplementation(async (url) => resposta(paginaReferencia(String(url))));
    await expect(servico.api.classificacoes()).resolves.toEqual(referencias);
    expect(buscar).toHaveBeenCalledTimes(8);
  });

  it.each([false, true])('rota de cidades ausente mantém as demais classificações (gerenciadas=%s)', async (gerenciadas) => {
    buscar.mockImplementation(async (url) => String(url).includes('/cidades?') ? resposta({}, 404) : resposta(paginaReferencia(String(url))));
    const esperado = { ...referencias, cidades: [] };
    await expect(servico.api.classificacoes(gerenciadas)).resolves.toEqual(esperado);
    expect(buscar).toHaveBeenCalledTimes(4);
    expect(buscar.mock.calls.some(([url]) => url === `/api/${gerenciadas ? 'admin/' : ''}cidades?pagina=1&limite=100`)).toBe(true);
    if (gerenciadas) {
      expect(servico.classificacoesEmCache()).toBeUndefined();
    } else {
      expect(servico.classificacoesEmCache()).toEqual(esperado);
      await expect(servico.api.classificacoes()).resolves.toEqual(esperado);
      expect(buscar).toHaveBeenCalledTimes(4);
    }
  });

  it.each(['tipos-imovel', 'finalidades-imovel', 'caracteristicas'])('401 em %s pública não aciona renovação', async (categoria) => {
    buscar.mockImplementation(async (url) => String(url).includes(`/${categoria}?`) ? resposta({}, 401) : resposta(paginaReferencia(String(url))));
    await expect(servico.api.classificacoes()).rejects.toMatchObject({ status: 401 });
    expect(buscar).toHaveBeenCalledTimes(4);
    expect(buscar.mock.calls.some(([url]) => String(url).includes('/autenticacao/'))).toBe(false);
    expect(servico.classificacoesEmCache()).toBeUndefined();
  });
});
