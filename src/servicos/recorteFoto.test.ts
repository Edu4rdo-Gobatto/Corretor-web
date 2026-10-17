import { describe, expect, it } from 'vitest';
import { ZOOM_MAXIMO, arrastar, enquadramentoInicial, ladoDaJanela, limitarEnquadramento, mudarZoom, retanguloDeOrigem } from './recorteFoto';

const retrato = { largura: 600, altura: 1000 };
const paisagem = { largura: 1000, altura: 600 };

describe('recorteFoto', () => {
  it('começa com o maior quadrado centralizado', () => {
    expect(retanguloDeOrigem(retrato, enquadramentoInicial(retrato))).toEqual({ x: 0, y: 200, lado: 600 });
    expect(retanguloDeOrigem(paisagem, enquadramentoInicial(paisagem))).toEqual({ x: 200, y: 0, lado: 600 });
  });

  it('o zoom reduz a janela e fica entre 1 e o máximo', () => {
    expect(ladoDaJanela(retrato, 2)).toBe(300);
    expect(mudarZoom(retrato, enquadramentoInicial(retrato), 0.2).zoom).toBe(1);
    expect(mudarZoom(retrato, enquadramentoInicial(retrato), 99).zoom).toBe(ZOOM_MAXIMO);
    expect(limitarEnquadramento(retrato, { zoom: Number.NaN, x: 0, y: 0 }).zoom).toBe(1);
  });

  it('arrastar para baixo mostra o topo da foto e para na borda', () => {
    const inicial = enquadramentoInicial(retrato);
    // Palco de 300 px com janela de 600 px da origem: 1 px de tela = 2 px da origem.
    expect(arrastar(retrato, inicial, 0, 50, 300).y).toBe(500 - 100);
    const noTopo = arrastar(retrato, inicial, 0, 10_000, 300);
    expect(retanguloDeOrigem(retrato, noTopo)).toEqual({ x: 0, y: 0, lado: 600 });
    const noFim = arrastar(retrato, inicial, 0, -10_000, 300);
    expect(retanguloDeOrigem(retrato, noFim)).toEqual({ x: 0, y: 400, lado: 600 });
  });

  it('com a foto cobrindo toda a largura o arraste horizontal não move nada', () => {
    const inicial = enquadramentoInicial(retrato);
    expect(arrastar(retrato, inicial, 80, 0, 300).x).toBe(inicial.x);
  });

  it('o zoom mantém o centro e a janela sempre dentro da imagem', () => {
    const noCanto = limitarEnquadramento(paisagem, { zoom: 3, x: 0, y: 0 });
    expect(retanguloDeOrigem(paisagem, noCanto)).toEqual({ x: 0, y: 0, lado: 200 });
    const afastado = mudarZoom(paisagem, noCanto, 1);
    expect(retanguloDeOrigem(paisagem, afastado)).toEqual({ x: 0, y: 0, lado: 600 });
  });

  it('uma imagem quadrada só se move com zoom', () => {
    const quadrada = { largura: 800, altura: 800 };
    expect(arrastar(quadrada, enquadramentoInicial(quadrada), 40, 40, 300)).toEqual(enquadramentoInicial(quadrada));
    const ampliada = arrastar(quadrada, mudarZoom(quadrada, enquadramentoInicial(quadrada), 2), 10_000, 0, 300);
    expect(retanguloDeOrigem(quadrada, ampliada)).toEqual({ x: 0, y: 200, lado: 400 });
  });
});
