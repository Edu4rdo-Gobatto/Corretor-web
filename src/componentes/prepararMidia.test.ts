import { describe, expect, it, vi } from 'vitest';
import { prepararEnvio, prepararMidias, validarSelecaoMidia } from './prepararMidia';
import imageCompression from 'browser-image-compression';

vi.mock('browser-image-compression', () => ({ default: vi.fn() }));

describe('preparação de mídias', () => {
  it('limita compressões simultâneas a duas, desativa worker e reporta progresso', async () => {
    let ativas = 0;
    let maximo = 0;
    vi.mocked(imageCompression).mockImplementation(async (arquivo) => {
      ativas += 1; maximo = Math.max(maximo, ativas);
      await new Promise((resolver) => setTimeout(resolver, 0));
      ativas -= 1;
      return new File([arquivo], arquivo.name, { type: arquivo.type });
    });
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 2400, height: 1600, close: vi.fn() })));
    const progresso: number[] = [];
    const arquivos = [1, 2, 3, 4].map((indice) => new File([`imagem-${indice}`], `imagem-${indice}.jpg`, { type: 'image/jpeg' }));
    const prontos = await prepararMidias(arquivos, (concluidos) => progresso.push(concluidos));
    expect(maximo).toBe(2);
    expect(vi.mocked(imageCompression).mock.calls.every(([, opcoes]) => opcoes?.useWebWorker === false)).toBe(true);
    expect(prontos.map((arquivo) => arquivo.name)).toEqual(['imagem-1.webp', 'imagem-2.webp', 'imagem-3.webp', 'imagem-4.webp']);
    expect(progresso).toEqual([1, 2, 3, 4]);
  });
  it('pula a imagem ilegível, mantém a ordem e devolve os nomes pulados no envio', async () => {
    vi.mocked(imageCompression).mockImplementation(async (arquivo) => new File([arquivo], arquivo.name, { type: arquivo.type }));
    vi.stubGlobal('createImageBitmap', vi.fn(async (arquivo: File) => { if (arquivo.name === 'quebrada.jpg') throw new DOMException('não decodificada'); return { width: 100, height: 100, close: vi.fn() }; }));
    const arquivos = ['boa-1.jpg', 'quebrada.jpg', 'boa-2.jpg'].map((nome) => new File(['bytes'], nome, { type: 'image/jpeg' }));
    const { prontos, ilegiveis } = await prepararEnvio(arquivos);
    expect(prontos.map((arquivo) => arquivo.name)).toEqual(['boa-1.webp', 'boa-2.webp']);
    expect(ilegiveis).toEqual(['quebrada.jpg']);
    await expect(prepararEnvio([arquivos[1]])).rejects.toThrow('Não foi possível ler: quebrada.jpg');
  });
  it('valida tipo, tamanho e quantidade antes de qualquer envio', () => {
    expect(validarSelecaoMidia([new File(['x'], 'a.pdf', { type: 'application/pdf' })])).toContain('JPG, PNG ou WebP');
    expect(validarSelecaoMidia(Array.from({ length: 21 }, (_, i) => new File(['x'], `${i}.jpg`, { type: 'image/jpeg' })))).toContain('no máximo 20');
    expect(validarSelecaoMidia([new File(['x'], 'a.jpg', { type: 'image/jpeg' })], 20)).toContain('no máximo 20');
    expect(validarSelecaoMidia([new File(['x'], 'a.jpg', { type: 'image/jpeg' })])).toBeNull();
  });
});
