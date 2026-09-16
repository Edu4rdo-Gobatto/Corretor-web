import { describe, expect, it } from 'vitest';
import { caminhosCatalogo, urlCatalogo, slugImovelValido, urlNormalizada, lerUrlCatalogo, segmentosTipo, segmentosFinalidade } from './urls';

describe('URLs públicas', () => {
  for (const tipo of [undefined, ...Object.keys(segmentosTipo), 'chacara']) {
    for (const finalidade of [undefined, ...Object.keys(segmentosFinalidade)]) {
      it(`vai e volta ${tipo} / ${finalidade} com os filtros complementares`, () => {
        const consulta = { tipo, finalidade, cidade: 'Cuiabá', bairro: 'Centro', valor_min: 0, valor_max: 5000, area_min: 40, area_max: 900, ordenar: 'valor_asc' as const, pagina: 2, limite: 9 };
        expect(lerUrlCatalogo(urlCatalogo(consulta))).toEqual(consulta);
      });
    }
  }
  it('normaliza links antigos com precedência do português e preserva rastreamento', () => {
    expect(urlNormalizada('/?purpose=VENDA&type=GALPAO&city=X&cidade=Juara&page=3&pagina=2&utm_source=wa')).toBe('/imoveis/para-comprar/galpoes?cidade=Juara&pagina=2&utm_source=wa');
    expect(urlNormalizada('/imoveis/para-alugar/salas/?purpose=VENDA&type=LOJA&limit=9&pagina=1')).toBe('/imoveis/para-alugar/salas');
    expect(urlNormalizada('/?ordenar=recentes&tipo=sala-comercial')).toBe('/imoveis/salas');
  });
  it('omite filtros inválidos ou vazios e é idempotente', () => {
    expect(urlNormalizada('/?tipo=%3Cinvalid%3E&cidade=&preco-minimo=abc&pagina=-2&ordenar=aleatorio')).toBe('/');
    for (const caminho of caminhosCatalogo) expect(urlNormalizada(urlNormalizada(caminho))).toBe(caminho);
  });
  it('reconhece só caminhos de catálogo suportados e mantém slugs de imóvel', () => {
    expect(lerUrlCatalogo('/imoveis/para-alugar/casas')).toBeNull();
    expect(lerUrlCatalogo('/imoveis/sala-42')).toBeNull();
    expect(urlNormalizada('/imoveis/sala-42/')).toBe('/imoveis/sala-42');
    expect(urlNormalizada('/desconhecido/')).toBe('/desconhecido/');
  });
  it('aceita só slugs compatíveis com a API', () => {
    expect(slugImovelValido('loja-centro-123')).toBe(true);
    expect(slugImovelValido('lojasOR 1=1--]')).toBe(false);
    expect(slugImovelValido('a'.repeat(241))).toBe(false);
  });
  it('redireciona apelidos do painel e preserva ids', () => {
    expect(urlNormalizada('/admin/login/')).toBe('/admin/entrar');
    expect(urlNormalizada('/admin/leads?pagina=2')).toBe('/admin/contatos?pagina=2');
    expect(urlNormalizada('/admin/clientes')).toBe('/admin/pessoas');
    expect(urlNormalizada('/admin/proprietarios')).toBe('/admin/pessoas');
    expect(urlNormalizada('/admin/contratos/7/')).toBe('/admin/contratos/7');
    expect(urlNormalizada('/admin/pessoas/12/')).toBe('/admin/pessoas/12');
    expect(urlNormalizada('/admin/perfil/')).toBe('/admin/perfil');
    expect(urlNormalizada('/devs/')).toBe('/devs');
  });
});
