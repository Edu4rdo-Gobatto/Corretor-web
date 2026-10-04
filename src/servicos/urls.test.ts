import { describe, expect, it } from 'vitest';
import { lerUrlCatalogo, urlCatalogo, urlNormalizada } from './urls';

describe('URL de filtro do catálogo', () => {
  it('lê finalidade e tipo dos segmentos amigáveis', () => {
    const consulta = lerUrlCatalogo('/imoveis/para-comprar/galpoes');
    expect(consulta).toMatchObject({ finalidade: 'venda', tipo: 'galpao', pagina: 1 });
  });

  it('devolve null para caminhos fora do catálogo', () => {
    expect(lerUrlCatalogo('/imoveis/inexistente/xyz')).toBeNull();
    expect(lerUrlCatalogo('/admin')).toBeNull();
  });

  it('faz o round-trip de filtros, ordenação e página', () => {
    const url = urlCatalogo({ finalidade: 'locacao', tipo: 'loja', cidade: 'Cuiabá', valor_max: 5000, area_min: 40, ordenar: 'valor_asc', pagina: 2 });
    expect(url).toBe('/imoveis/para-alugar/lojas?cidade=Cuiab%C3%A1&preco-maximo=5000&area-minima=40&ordenar=valor_asc&pagina=2');
    expect(lerUrlCatalogo(url)).toMatchObject({ finalidade: 'locacao', tipo: 'loja', cidade: 'Cuiabá', valor_max: 5000, area_min: 40, ordenar: 'valor_asc', pagina: 2 });
  });

  it('omite valores padrão e usa a raiz sem filtros', () => {
    expect(urlCatalogo({ pagina: 1, ordenar: 'recentes' })).toBe('/');
  });

  it('usa ?tipo= para tipos sem segmento amigável', () => {
    expect(urlCatalogo({ tipo: 'sala-especial' })).toBe('/?tipo=sala-especial');
  });

  it('normaliza chaves antigas e preserva parâmetros externos', () => {
    expect(urlNormalizada('/?purpose=VENDA&type=GALPAO')).toBe('/imoveis/para-comprar/galpoes');
    expect(urlNormalizada('/?utm_source=insta')).toBe('/?utm_source=insta');
    expect(urlNormalizada('/admin/login')).toBe('/admin/entrar');
  });
});
