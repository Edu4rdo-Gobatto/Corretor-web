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
});

