import { describe, expect, it, vi } from 'vitest';
import { prepareMediaFiles } from './mediaUpload';
import imageCompression from 'browser-image-compression';

vi.mock('browser-image-compression', () => ({ default: vi.fn() }));

describe('preparação de mídias', () => {
  it('limita compressões simultâneas a duas, desativa worker remoto e reporta progresso', async () => {
    let active = 0;
    let maximumActive = 0;
    vi.mocked(imageCompression).mockImplementation(async (file) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolve) => setTimeout(resolve, 0));
      active -= 1;
      return new File([file], file.name, { type: file.type });
    });
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 2400, height: 1600, close: vi.fn() })));
    const progress: number[] = [];
    const files = [1, 2, 3, 4].map((index) => new File([`image-${index}`], `image-${index}.jpg`, { type: 'image/jpeg' }));

    const prepared = await prepareMediaFiles(files, (completed) => progress.push(completed));

    expect(maximumActive).toBe(2);
    expect(vi.mocked(imageCompression).mock.calls.every(([, options]) => options?.useWebWorker === false)).toBe(true);
    expect(prepared.map((file) => file.name)).toEqual(['image-1.webp', 'image-2.webp', 'image-3.webp', 'image-4.webp']);
    expect(progress).toEqual([1, 2, 3, 4]);
  });

  it('pula a imagem ilegível com erro em português, mantém as válidas em ordem e conta o progresso', async () => {
    vi.mocked(imageCompression).mockImplementation(async (file) => new File([file], file.name, { type: file.type }));
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async (file: File) => {
        if (file.name === 'quebrada.jpg') throw new DOMException('The source image could not be decoded.');
        return { width: 2400, height: 1600, close: vi.fn() };
      }),
    );
    const unreadable: string[] = [];
    const progress: number[] = [];
    const files = ['boa-1.jpg', 'quebrada.jpg', 'boa-2.jpg'].map((name) => new File(['bytes'], name, { type: 'image/jpeg' }));

    const prepared = await prepareMediaFiles(files, (completed) => progress.push(completed), (file) => unreadable.push(file.name));

    expect(prepared.map((file) => file.name)).toEqual(['boa-1.webp', 'boa-2.webp']);
    expect(unreadable).toEqual(['quebrada.jpg']);
    expect(progress).toEqual([1, 2, 3]);
  });

  it('retorna lista vazia quando nenhuma imagem pode ser lida', async () => {
    vi.mocked(imageCompression).mockImplementation(async (file) => new File([file], file.name, { type: file.type }));
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => {
        throw new DOMException('The source image could not be decoded.');
      }),
    );
    const unreadable: string[] = [];
    const files = [new File(['bytes'], 'quebrada.jpg', { type: 'image/jpeg' })];

    const prepared = await prepareMediaFiles(files, undefined, (file) => unreadable.push(file.name));

    expect(prepared).toEqual([]);
    expect(unreadable).toEqual(['quebrada.jpg']);
  });
});

