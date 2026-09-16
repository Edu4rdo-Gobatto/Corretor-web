import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { definirTokenAcesso } from './http';
import { classificacoesExemplo, imovelExemplo } from '../seo/fixture';

const corretor = { id: 1, nome: 'Ana', email: 'ana@example.test', cpf: '52998224725', whatsapp: '5565999999999', creci: null, cargo: 'CORRETOR', url_foto: null, ativo: true, criado_em: '2026-09-14' };
const pagina = (itens: unknown[]) => new Response(JSON.stringify({ itens, total: itens.length, pagina: 1, limite: 100, total_paginas: 1 }));
afterEach(() => { vi.unstubAllGlobals(); definirTokenAcesso(null); });

describe('contrato HTTP em português', () => {
  it('envia senha no login e usa token_acesso sem persistência', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ token_acesso: 'token-teste', tipo_token: 'Bearer', corretor }))).mockResolvedValueOnce(new Response(JSON.stringify(corretor)));
    vi.stubGlobal('fetch', fetcher);
    const sessao = await api.entrar('ana@example.test', 'senha-de-teste');
    expect(sessao.corretor.cargo).toBe('CORRETOR');
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ email: 'ana@example.test', senha: 'senha-de-teste' });
    expect(fetcher.mock.calls[0][0]).toBe('/api/autenticacao/entrar');
    await api.eu();
    expect(fetcher.mock.calls[1][1].headers.get('Authorization')).toBe('Bearer token-teste');
  });
  it('resolve slug de tipo e finalidade em ids antes de consultar o catálogo', async () => {
    const fetcher = vi.fn(async (entrada: string) => {
      if (entrada.includes('/tipos-imovel')) return pagina(classificacoesExemplo.tipos);
      if (entrada.includes('/finalidades-imovel')) return pagina(classificacoesExemplo.finalidades);
      if (entrada.includes('/caracteristicas')) return pagina([]);
      return pagina([imovelExemplo]);
    });
    vi.stubGlobal('fetch', fetcher);
    const resultado = await api.listarImoveis({ pagina: 1, limite: 9, tipo: 'sala-comercial', finalidade: 'locacao', bairro: 'Centro', ordenar: 'valor_desc' });
    expect(resultado.itens[0].slug).toBe(imovelExemplo.slug);
    const consulta = new URL(fetcher.mock.calls.find(([caminho]) => String(caminho).startsWith('/api/imoveis'))![0], 'https://local').searchParams;
    expect(consulta.get('tipo_id')).toBe('1');
    expect(consulta.get('finalidade_id')).toBe('3');
    expect(consulta.get('bairro')).toBe('Centro');
    expect(consulta.get('ordenar')).toBe('valor_desc');
    fetcher.mockClear();
    expect(await api.listarImoveis({ pagina: 1, limite: 9, tipo: 'desconhecido' })).toMatchObject({ itens: [], total: 0 });
    expect(fetcher.mock.calls.some(([caminho]) => String(caminho).startsWith('/api/imoveis'))).toBe(false);
  });
  it('envia o contato do site sem campos internos', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{"id":7}'));
    vi.stubGlobal('fetch', fetcher);
    await api.criarContato({ imovel_id: 42, nome: 'Cliente', telefone: '66999999999', consentimento: true });
    expect(fetcher.mock.calls[0][0]).toBe('/api/pessoas');
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ imovel_id: 42, nome: 'Cliente', telefone: '66999999999', consentimento: true });
  });
  it('usa os caminhos de mídia autenticados, arquivos multipart e midias_ids numéricos', async () => {
    const fetcher = vi.fn().mockImplementation(() => Promise.resolve(new Response('[]')));
    vi.stubGlobal('fetch', fetcher);
    await api.enviarMidias(42, [new File(['imagem'], 'foto.webp', { type: 'image/webp' })]);
    expect(fetcher.mock.calls[0][0]).toBe('/api/admin/imoveis/42/midias');
    expect(fetcher.mock.calls[0][1].body.getAll('arquivos')).toHaveLength(1);
    await api.reordenarMidias(42, [9, 8]);
    expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({ midias_ids: [9, 8] });
  });
  it('omite referências inalteradas no PATCH para preservar vínculos com cadastros inativos', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(imovelExemplo)));
    vi.stubGlobal('fetch', fetcher);
    const anterior = { ...imovelExemplo, proprietario_id: 5, proprietario: { id: 5, nome: 'Dona' }, exclusividade: false, exclusividade_ate: null, data_captacao: null, chaves: null, matricula: null, inscricao_municipal: null, observacoes_internas: null, motivo_baixa: null };
    await api.salvarImovel({ titulo: 'Novo título', tipo_id: 1, finalidade_id: 3, valor_venda: null, valor_locacao: '2500.00', valor_condominio: null, valor_iptu: null, area_util: '60.00', area_total: '70.00', cep: null, logradouro: 'Rua', numero: '1', complemento: null, bairro: 'Centro', cidade: 'Cuiabá', estado: 'MT', descricao: 'Descrição', status: 'DISPONIVEL', destaque: false, corretor_id: 1, proprietario_id: 5, exclusividade: false, exclusividade_ate: null, data_captacao: null, chaves: null, matricula: null, inscricao_municipal: null, observacoes_internas: null, motivo_baixa: null, caracteristicas: [] }, 42, anterior);
    const corpo = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(fetcher.mock.calls[0][1].method).toBe('PATCH');
    expect(corpo.titulo).toBe('Novo título');
    for (const campo of ['tipo_id', 'finalidade_id', 'corretor_id', 'proprietario_id']) expect(corpo).not.toHaveProperty(campo);
  });
  it('repassa filtros de pessoas e recusa slugs malformados sem chamar a API', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{"itens":[],"total":0,"pagina":1,"limite":1,"total_paginas":0}'));
    vi.stubGlobal('fetch', fetcher);
    await api.listarPessoas({ pagina: 1, limite: 1, status_contato: 'PENDENTE', criado_desde: '2026-09-01T00:00:00Z' });
    const consulta = new URL(fetcher.mock.calls[0][0], 'https://local').searchParams;
    expect(consulta.get('criado_desde')).toBe('2026-09-01T00:00:00Z');
    expect(consulta.get('status_contato')).toBe('PENDENTE');
    fetcher.mockClear();
    await expect(api.obterImovel('lojasOR 1=1--]')).rejects.toMatchObject({ status: 404 });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
