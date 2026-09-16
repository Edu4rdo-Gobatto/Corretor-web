import { afterEach, describe, expect, it, vi } from 'vitest';
import { csvCell, downloadLeadsCsv, leadsCsv } from './leadExport';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('lead CSV', () => {
  it.each(['=SUM(A1)', '+123', '-123', '@cmd', '  =1', '\t=1', '\n+1', '\ttext', ' \ttext', '\rtext'])('neutralizes %j', value => {
    expect(csvCell(value)).toBe(`"'${value}"`);
  });
  it('preserves unicode, commas, quotes, multiline text and blanks', () => {
    expect(csvCell('João, "Olá"\nTudo bem')).toBe('"João, ""Olá""\nTudo bem"');
    expect(csvCell('')).toBe('""');
    expect(csvCell(' normal')).toBe('" normal"');
    expect(leadsCsv([])).toBe('\uFEFF"Nome","Telefone","E-mail","Imóvel","Mensagem","Origem","Recebido em"');
  });
  it('downloads with page label and releases the URL after the click', () => {
    vi.useFakeTimers();
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('contatos-pagina-2.csv');
      expect(this.isConnected).toBe(true);
    });
    downloadLeadsCsv([], 2);
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    expect(document.querySelector('a[download]')).toBeNull();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
