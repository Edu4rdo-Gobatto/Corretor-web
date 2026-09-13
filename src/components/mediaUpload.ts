import imageCompression from 'browser-image-compression';

const MAX_CONCURRENCY = 2;

export type MediaPreparationProgress = (completed: number, total: number) => void;
export type MediaPreparationError = (file: File) => void;

async function prepareFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`Não foi possível ler "${file.name}". Use uma imagem JPG, PNG ou WebP válida.`);
  }
  let maxSize: number;
  try {
    maxSize = Math.max(bitmap.width, bitmap.height) * Math.min(1, 1920 / bitmap.width, 1080 / bitmap.height);
  } finally {
    bitmap.close();
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: maxSize,
    useWebWorker: false,
    fileType: 'image/webp',
    initialQuality: 0.85,
  });
  return new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
}

export async function prepareMediaFiles(files: File[], onProgress?: MediaPreparationProgress, onError?: MediaPreparationError): Promise<File[]> {
  const results = new Map<number, File>();
  let nextIndex = 0;
  let completed = 0;

  async function worker(): Promise<void> {
    while (nextIndex < files.length) {
      const index = nextIndex++;
      try {
        results.set(index, await prepareFile(files[index]));
      } catch {
        onError?.(files[index]);
      }
      completed += 1;
      onProgress?.(completed, files.length);
    }
  }

  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENCY, files.length) }, () => worker()));
  return [...results.entries()].sort(([a], [b]) => a - b).map(([, file]) => file);
}

