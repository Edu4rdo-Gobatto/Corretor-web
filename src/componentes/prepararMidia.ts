import imageCompression from 'browser-image-compression';

const CONCORRENCIA_MAXIMA = 2;
export const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
export const LIMITE_ARQUIVOS = 20;
const LIMITE_POR_ARQUIVO = 30 * 1024 * 1024;

export type ProgressoPreparacao = (concluidos: number, total: number) => void;
export type ErroPreparacao = (arquivo: File) => void;

/** Regras iguais às da API, aplicadas antes de qualquer envio. Devolve a mensagem do problema ou null. */
export function validarSelecaoMidia(arquivos: File[], jaSelecionados = 0): string | null {
  if (arquivos.length + jaSelecionados > LIMITE_ARQUIVOS) return `Selecione no máximo ${LIMITE_ARQUIVOS} arquivos por envio.`;
  for (const arquivo of arquivos) {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) return 'Use imagens JPG, PNG ou WebP e vídeos MP4 ou WebM.';
    if (arquivo.size > LIMITE_POR_ARQUIVO) return `${arquivo.name}: o limite é 30 MB por arquivo.`;
  }
  return null;
}

async function prepararArquivo(arquivo: File): Promise<File> {
  if (!arquivo.type.startsWith('image/')) return arquivo;
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(arquivo);
  } catch {
    throw new Error(`Não foi possível ler "${arquivo.name}". Use uma imagem JPG, PNG ou WebP válida.`);
  }
  let tamanhoMaximo: number;
  try {
    tamanhoMaximo = Math.max(bitmap.width, bitmap.height) * Math.min(1, 1920 / bitmap.width, 1080 / bitmap.height);
  } finally {
    bitmap.close();
  }
  const comprimido = await imageCompression(arquivo, { maxSizeMB: 2, maxWidthOrHeight: tamanhoMaximo, useWebWorker: false, fileType: 'image/webp', initialQuality: 0.85 });
  return new File([comprimido], arquivo.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
}

/** Comprime imagens em WebP (duas por vez) e mantém a ordem; arquivos ilegíveis são reportados e pulados. */
export async function prepararMidias(arquivos: File[], aoProgredir?: ProgressoPreparacao, aoFalhar?: ErroPreparacao): Promise<File[]> {
  const resultados = new Map<number, File>();
  let proximo = 0;
  let concluidos = 0;
  async function trabalhador(): Promise<void> {
    while (proximo < arquivos.length) {
      const indice = proximo++;
      try {
        resultados.set(indice, await prepararArquivo(arquivos[indice]));
      } catch {
        aoFalhar?.(arquivos[indice]);
      }
      concluidos += 1;
      aoProgredir?.(concluidos, arquivos.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCORRENCIA_MAXIMA, arquivos.length) }, () => trabalhador()));
  return [...resultados.entries()].sort(([a], [b]) => a - b).map(([, arquivo]) => arquivo);
}

/** Prepara arquivos já validados, confere os limites da API e devolve os que foram pulados. */
export async function prepararEnvio(arquivos: File[], aoProgredir?: ProgressoPreparacao): Promise<{ prontos: File[]; ilegiveis: string[] }> {
  const ilegiveis: string[] = [];
  const prontos = await prepararMidias(arquivos, aoProgredir, (arquivo) => ilegiveis.push(arquivo.name));
  if (!prontos.length) throw new Error(ilegiveis.length ? `Não foi possível ler: ${ilegiveis.join(', ')}. Use imagens JPG, PNG ou WebP válidas.` : 'Nenhum arquivo para enviar.');
  if (prontos.some((arquivo) => arquivo.type.startsWith('image/') && arquivo.size > 10 * 1024 * 1024)) throw new Error('A imagem otimizada excedeu 10 MB. Escolha uma imagem menor.');
  if (prontos.reduce((total, arquivo) => total + arquivo.size, 0) > 60 * 1024 * 1024) throw new Error('O envio excede 60 MB. Envie os arquivos em grupos menores.');
  return { prontos, ilegiveis };
}
