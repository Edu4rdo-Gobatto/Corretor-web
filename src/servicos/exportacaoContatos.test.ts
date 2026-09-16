import { afterEach, describe, expect, it, vi } from 'vitest';
import { baixarCsvContatos, celulaCsv, csvContatos } from './exportacaoContatos';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('CSV de contatos', () => {
  it.each(['=SUM(A1)', '+123', '-123', '@cmd', '  =1', '\t=1', '\n+1', '\ttext'])('neutraliza %j', (valor) => { expect(celulaCsv(valor)).toBe(`"'${valor}"`); });
  it('preserva unicode, vírgulas, aspas, quebras e vazios', () => {
    expect(celulaCsv('João, "Olá"\nTudo bem')).toBe('"João, ""Olá""\nTudo bem"');
    expect(celulaCsv('')).toBe('""');
    expect(csvContatos([])).toBe('﻿"Nome","Telefone","E-mail","Imóvel","Mensagem","Origem","Situação","Recebido em"');
  });
  it('baixa com o nome informado e libera a URL depois do clique', () => {
    vi.useFakeTimers();
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:teste'), revokeObjectURL });
    const clique = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('contatos-pendente-pagina-2.csv');
      expect(this.isConnected).toBe(true);
    });
    baixarCsvContatos([], 'pendente-pagina-2');
    expect(clique).toHaveBeenCalledOnce();
    expect(document.querySelector('a[download]')).toBeNull();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:teste');
  });
});
