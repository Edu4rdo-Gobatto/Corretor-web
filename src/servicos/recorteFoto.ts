/** Lado, em pixels, da foto de perfil enviada: o quadrado recortado serve a todos os tamanhos de exibição. */
export const LADO_FOTO_PERFIL = 512;
export const ZOOM_MAXIMO = 4;

/** Dimensões da imagem de origem. */
export type Dimensoes = { largura: number; altura: number };
/** Enquadramento: `zoom` 1 mostra o maior quadrado possível; `x` e `y` são o centro da janela em pixels da origem. */
export type Enquadramento = { zoom: number; x: number; y: number };
export type Retangulo = { x: number; y: number; lado: number };

/** Lado, em pixels da origem, do quadrado que aparece no enquadramento. */
export const ladoDaJanela = ({ largura, altura }: Dimensoes, zoom: number) => Math.min(largura, altura) / zoom;

/** Mantém o zoom no intervalo permitido e a janela inteira dentro da imagem, para o círculo nunca ficar vazio. */
export function limitarEnquadramento(imagem: Dimensoes, { zoom, x, y }: Enquadramento): Enquadramento {
  const zoomLimitado = Math.min(ZOOM_MAXIMO, Math.max(1, Number.isFinite(zoom) ? zoom : 1));
  const meio = ladoDaJanela(imagem, zoomLimitado) / 2;
  const entre = (valor: number, total: number) => Math.min(total - meio, Math.max(meio, valor));
  return { zoom: zoomLimitado, x: entre(x, imagem.largura), y: entre(y, imagem.altura) };
}

/** Enquadramento inicial: maior quadrado, centralizado. */
export const enquadramentoInicial = (imagem: Dimensoes): Enquadramento => ({ zoom: 1, x: imagem.largura / 2, y: imagem.altura / 2 });

/** Arrastar o palco (`ladoTela` px) por `dx`,`dy` px move a foto no mesmo sentido, ou seja, a janela vai no sentido oposto. */
export function arrastar(imagem: Dimensoes, atual: Enquadramento, dx: number, dy: number, ladoTela: number): Enquadramento {
  const porPixel = ladoDaJanela(imagem, atual.zoom) / ladoTela;
  return limitarEnquadramento(imagem, { ...atual, x: atual.x - dx * porPixel, y: atual.y - dy * porPixel });
}

/** Troca o zoom mantendo o centro da janela. */
export const mudarZoom = (imagem: Dimensoes, atual: Enquadramento, zoom: number) => limitarEnquadramento(imagem, { ...atual, zoom });

/** Quadrado da origem que o enquadramento recorta. */
export function retanguloDeOrigem(imagem: Dimensoes, enquadramento: Enquadramento): Retangulo {
  const { zoom, x, y } = limitarEnquadramento(imagem, enquadramento);
  const lado = ladoDaJanela(imagem, zoom);
  return { x: x - lado / 2, y: y - lado / 2, lado };
}

/** Desenha o enquadramento no canvas, que fica quadrado e com o lado dado. */
export function desenharEnquadramento(canvas: HTMLCanvasElement, imagem: ImageBitmap, enquadramento: Enquadramento, lado: number) {
  const contexto = canvas.getContext('2d');
  if (!contexto) return;
  if (canvas.width !== lado) { canvas.width = lado; canvas.height = lado; }
  const origem = retanguloDeOrigem({ largura: imagem.width, altura: imagem.height }, enquadramento);
  contexto.imageSmoothingQuality = 'high';
  contexto.clearRect(0, 0, lado, lado);
  contexto.drawImage(imagem, origem.x, origem.y, origem.lado, origem.lado, 0, 0, lado, lado);
}

const paraBlob = (canvas: HTMLCanvasElement, tipo: string, qualidade: number) => new Promise<Blob | null>((resolver) => canvas.toBlob(resolver, tipo, qualidade));

/** Recorta o enquadramento em um quadrado de `LADO_FOTO_PERFIL`, pronto para o envio: WebP, ou JPEG onde o navegador (Safari) não gera WebP. */
export async function recortarParaArquivo(imagem: ImageBitmap, enquadramento: Enquadramento, nomeOriginal: string): Promise<File> {
  const canvas = document.createElement('canvas');
  desenharEnquadramento(canvas, imagem, enquadramento, LADO_FOTO_PERFIL);
  let blob = await paraBlob(canvas, 'image/webp', 0.9);
  if (blob?.type !== 'image/webp') blob = await paraBlob(canvas, 'image/jpeg', 0.9);
  if (!blob) throw new Error('Não foi possível recortar a foto. Tente outra imagem.');
  const extensao = blob.type === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], `${nomeOriginal.replace(/\.[^.]+$/, '') || 'foto'}.${extensao}`, { type: blob.type });
}
