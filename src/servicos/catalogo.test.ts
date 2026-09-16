import { describe, expect, it } from 'vitest';
import { consultaParaApi, lerConsultaCatalogo, montarParametros } from './catalogo';
import { classificacoesExemplo } from '../seo/fixture';

describe('filtros do catálogo', () => {
  it('lê os parâmetros em português com limites', () => {
    const consulta = lerConsultaCatalogo(new URLSearchParams('tipo=sala-comercial&finalidade=locacao&cidade=Cuiab%C3%A1&bairro=Centro&preco-minimo=1000&preco-maximo=9000&area-minima=50&ordenar=area_desc&pagina=3'));
    expect(consulta).toEqual({ tipo: 'sala-comercial', finalidade: 'locacao', cidade: 'Cuiabá', bairro: 'Centro', valor_min: 1000, valor_max: 9000, area_min: 50, ordenar: 'area_desc', pagina: 3, limite: 9 });
  });
  it('ignora classificações malformadas, ordem desconhecida e páginas inválidas', () => {
    expect(lerConsultaCatalogo(new URLSearchParams('tipo=%3Cinvalid%3E&pagina=-5&preco-minimo=abc&ordenar=x'))).toEqual({ pagina: 1, limite: 9 });
  });
  it('traduz slugs para ids da API e recusa classificação desconhecida', () => {
    const codificada = consultaParaApi({ pagina: 2, limite: 9, tipo: 'sala-comercial', finalidade: 'locacao', cidade: 'Juara', ordenar: 'valor_asc' }, classificacoesExemplo)!;
    expect(new URLSearchParams(codificada).get('tipo_id')).toBe('1');
    expect(new URLSearchParams(codificada).get('finalidade_id')).toBe('3');
    expect(new URLSearchParams(codificada).get('ordenar')).toBe('valor_asc');
    expect(consultaParaApi({ pagina: 1, limite: 9, tipo: '2' }, classificacoesExemplo)).toContain('tipo_id=2');
    expect(consultaParaApi({ pagina: 1, limite: 9, tipo: 'desconhecido' }, classificacoesExemplo)).toBeNull();
  });
  it('monta parâmetros omitindo vazios', () => {
    expect(montarParametros({ pagina: 1, busca: '', ativo: false, imovel_id: undefined, status: null })).toBe('pagina=1&ativo=false');
  });
});
