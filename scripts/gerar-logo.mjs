// Gera as variantes do logo a partir de public/assets/brand-logo.png (arte oficial: texto branco e contorno dourado
// sobre fundo transparente, feita para fundo escuro). Usa o Chrome do sistema pelo Playwright já instalado no projeto:
// nenhuma dependência nova. Rode `node scripts/gerar-logo.mjs` quando a arte oficial mudar.
//
// Saída em public/assets/:
//   logo-tema-escuro-{48,96,144}.webp  cores originais, para o tema escuro
//   logo-tema-claro-{48,96,144}.webp   texto em navy e dourado preservado, para o tema claro
// A margem transparente é recortada; o número é a altura em pixels (1x, 2x e 3x da altura exibida de 48px).
/* global Image, OffscreenCanvas -- usados só dentro de page.evaluate, que roda no navegador */
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const origem = 'public/assets/brand-logo.png';
const alturas = [48, 96, 144];
const navy = [10, 32, 66];

const png = await readFile(origem);
const navegador = await chromium.launch({ channel: process.env.VISUAL_CANAL ?? 'chrome' });
try {
  const page = await navegador.newPage();
  const resultado = await page.evaluate(async ({ dados, alturas, navy }) => {
    const imagem = new Image();
    imagem.src = dados;
    await imagem.decode();
    const base = new OffscreenCanvas(imagem.width, imagem.height);
    const contexto = base.getContext('2d');
    contexto.drawImage(imagem, 0, 0);
    const pixels = contexto.getImageData(0, 0, imagem.width, imagem.height);

    // Recorte da margem transparente (alfa baixo), com 2px de folga.
    let [x0, y0, x1, y1] = [imagem.width, imagem.height, 0, 0];
    for (let y = 0; y < imagem.height; y++) for (let x = 0; x < imagem.width; x++) {
      if (pixels.data[(y * imagem.width + x) * 4 + 3] > 24) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    }
    x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(imagem.width - 1, x1 + 2); y1 = Math.min(imagem.height - 1, y1 + 2);
    const largura = x1 - x0 + 1;
    const altura = y1 - y0 + 1;

    function variante(recolorir) {
      const tela = new OffscreenCanvas(largura, altura);
      const ctx = tela.getContext('2d');
      const recorte = contexto.getImageData(x0, y0, largura, altura);
      if (recolorir) {
        // Pixels neutros (branco e o brilho cinza do texto) viram navy; o dourado, saturado, fica como está.
        for (let i = 0; i < recorte.data.length; i += 4) {
          const [r, g, b] = [recorte.data[i], recorte.data[i + 1], recorte.data[i + 2]];
          if (Math.max(r, g, b) - Math.min(r, g, b) < 60) [recorte.data[i], recorte.data[i + 1], recorte.data[i + 2]] = navy;
        }
      }
      ctx.putImageData(recorte, 0, 0);
      return tela;
    }

    // Redução em etapas de metade: melhor nitidez que um único redimensionamento grande.
    async function reduzir(tela, alvoAltura) {
      let atual = tela;
      while (atual.height / 2 >= alvoAltura) {
        const menor = new OffscreenCanvas(Math.round(atual.width / 2), Math.round(atual.height / 2));
        const ctx = menor.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(atual, 0, 0, menor.width, menor.height);
        atual = menor;
      }
      const final = new OffscreenCanvas(Math.round((largura * alvoAltura) / altura), alvoAltura);
      const ctx = final.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(atual, 0, 0, final.width, final.height);
      const blob = await final.convertToBlob({ type: 'image/webp', quality: 0.9 });
      return { largura: final.width, bytes: Array.from(new Uint8Array(await blob.arrayBuffer())) };
    }

    const saida = {};
    for (const [nome, recolorir] of [['escuro', false], ['claro', true]]) {
      const tela = variante(recolorir);
      for (const alvo of alturas) saida[`logo-tema-${nome}-${alvo}.webp`] = await reduzir(tela, alvo);
    }
    return { proporcao: largura / altura, saida };
  }, { dados: `data:image/png;base64,${png.toString('base64')}`, alturas, navy });

  for (const [arquivo, { largura, bytes }] of Object.entries(resultado.saida)) {
    await writeFile(`public/assets/${arquivo}`, Buffer.from(bytes));
    console.log(`${arquivo}: ${largura}px de largura, ${bytes.length} bytes`);
  }
  console.log(`proporção (largura/altura): ${resultado.proporcao.toFixed(4)}`);
} finally {
  await navegador.close();
}
