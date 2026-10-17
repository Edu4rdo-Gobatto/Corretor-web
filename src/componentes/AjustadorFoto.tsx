import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import Dialogo from './Dialogo';
import { estilos } from './estilosPainel';
import { IconeAdicionar, IconeSalvar } from './Icones';
import { ZOOM_MAXIMO, arrastar, desenharEnquadramento, enquadramentoInicial, mudarZoom, recortarParaArquivo, type Enquadramento } from '../servicos/recorteFoto';
import { mensagemErro } from '../servicos/formato';

type Propriedades = { arquivo: File; aoConfirmar: (recorte: File) => void; aoCancelar: () => void; aoFalhar: (mensagem: string) => void };

const LADO_PALCO = 288;
const TAMANHOS_PREVIA = [{ lado: 80, rotulo: 'Perfil' }, { lado: 40, rotulo: 'Menu' }, { lado: 32, rotulo: 'Topo' }] as const;
const PASSO_TECLADO = 12;
const botaoZoom = 'inline-grid size-11 shrink-0 place-items-center rounded-full border border-control-line bg-transparent text-ink hover:bg-soft disabled:opacity-50';

/**
 * Enquadramento da foto de perfil. O palco mostra o quadrado que será enviado; o círculo mostra o que aparece no avatar.
 * Arrastar (mouse ou toque), o controle de zoom e as setas do teclado movem a foto; as prévias têm os tamanhos de uso real.
 */
export default function AjustadorFoto({ arquivo, aoConfirmar, aoCancelar, aoFalhar }: Propriedades) {
  const [imagem, setImagem] = useState<ImageBitmap | null>(null);
  const [enquadramento, setEnquadramento] = useState<Enquadramento>({ zoom: 1, x: 0, y: 0 });
  const [salvando, setSalvando] = useState(false);
  const palco = useRef<HTMLCanvasElement>(null);
  const previas = useRef<(HTMLCanvasElement | null)[]>([]);
  // Dedos (ou o mouse) apoiados no palco: um arrasta, dois fazem pinça.
  const ponteiros = useRef(new Map<number, { x: number; y: number }>());

  useEffect(() => {
    let atual = true;
    let aberta: ImageBitmap | undefined;
    // `from-image` respeita a rotação gravada pelo celular (EXIF); navegadores que não aceitam a opção já fazem isso por padrão.
    createImageBitmap(arquivo, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(arquivo)).then((bitmap) => {
      if (!atual) { bitmap.close(); return; }
      aberta = bitmap;
      setImagem(bitmap);
      setEnquadramento(enquadramentoInicial({ largura: bitmap.width, altura: bitmap.height }));
    }, () => { if (atual) aoFalhar(`Não foi possível ler "${arquivo.name}". Use uma imagem JPG, PNG ou WebP válida.`); });
    return () => { atual = false; aberta?.close(); };
  // `aoFalhar` só é chamado no erro de leitura; refazer a leitura por uma função nova a cada render seria um erro.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arquivo]);

  useEffect(() => {
    if (!imagem) return;
    const escala = Math.min(2, window.devicePixelRatio || 1);
    if (palco.current) desenharEnquadramento(palco.current, imagem, enquadramento, Math.round(LADO_PALCO * escala));
    // As prévias copiam o palco já reduzido: no celular, redesenhar a foto grande quatro vezes por quadro pesaria no arraste.
    TAMANHOS_PREVIA.forEach(({ lado }, indice) => {
      const tela = previas.current[indice];
      const pequeno = Math.round(lado * escala);
      if (!tela || !palco.current) return;
      if (tela.width !== pequeno) { tela.width = pequeno; tela.height = pequeno; }
      const contexto = tela.getContext('2d');
      contexto?.clearRect(0, 0, pequeno, pequeno);
      contexto?.drawImage(palco.current, 0, 0, pequeno, pequeno);
    });
  }, [imagem, enquadramento]);

  const dimensoes = imagem ? { largura: imagem.width, altura: imagem.height } : null;
  const mover = (dx: number, dy: number) => dimensoes && setEnquadramento((atual) => arrastar(dimensoes, atual, dx, dy, LADO_PALCO));
  const zoom = (valor: number) => dimensoes && setEnquadramento((atual) => mudarZoom(dimensoes, atual, valor));

  function iniciarArraste(evento: PointerEvent<HTMLDivElement>) {
    if (!dimensoes || salvando) return;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    ponteiros.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
  }
  function continuarArraste(evento: PointerEvent<HTMLDivElement>) {
    const anterior = ponteiros.current.get(evento.pointerId);
    if (!anterior || !dimensoes) return;
    // O palco encolhe em telas estreitas; os deslocamentos voltam para o lado de referência.
    const escala = LADO_PALCO / evento.currentTarget.getBoundingClientRect().width;
    const outro = [...ponteiros.current].find(([id]) => id !== evento.pointerId)?.[1];
    if (outro) {
      // Pinça: a distância entre os dedos muda o zoom e o ponto médio, que anda metade do dedo que se moveu, arrasta.
      const antes = Math.hypot(anterior.x - outro.x, anterior.y - outro.y);
      const depois = Math.hypot(evento.clientX - outro.x, evento.clientY - outro.y);
      if (antes > 0 && depois > 0) setEnquadramento((atual) => mudarZoom(dimensoes, atual, atual.zoom * (depois / antes)));
      mover(((evento.clientX - anterior.x) / 2) * escala, ((evento.clientY - anterior.y) / 2) * escala);
    } else mover((evento.clientX - anterior.x) * escala, (evento.clientY - anterior.y) * escala);
    ponteiros.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
  }
  function encerrarArraste(evento: PointerEvent<HTMLDivElement>) {
    ponteiros.current.delete(evento.pointerId);
  }
  function teclado(evento: KeyboardEvent<HTMLDivElement>) {
    const passo = evento.shiftKey ? PASSO_TECLADO * 4 : PASSO_TECLADO;
    // A foto acompanha a tecla: seta para a esquerda leva a foto para a esquerda.
    const deslocamento: Record<string, [number, number]> = { ArrowLeft: [-passo, 0], ArrowRight: [passo, 0], ArrowUp: [0, -passo], ArrowDown: [0, passo] };
    if (deslocamento[evento.key]) { evento.preventDefault(); mover(...deslocamento[evento.key]); }
    else if (evento.key === '+' || evento.key === '=') { evento.preventDefault(); zoom(enquadramento.zoom + 0.25); }
    else if (evento.key === '-') { evento.preventDefault(); zoom(enquadramento.zoom - 0.25); }
  }

  async function confirmar() {
    if (!imagem || salvando) return;
    setSalvando(true);
    try { aoConfirmar(await recortarParaArquivo(imagem, enquadramento, arquivo.name)); }
    catch (causa) { setSalvando(false); aoFalhar(mensagemErro(causa)); }
  }

  return <Dialogo titulo="Ajustar foto" tamanho="estreito" ocupado={salvando} aoFechar={aoCancelar}>
    <div className="grid gap-5">
      <div className="grid justify-items-center gap-3">
        <div role="application" tabIndex={0} aria-label="Enquadramento da foto. Arraste ou use as setas para mover; use + e - para o zoom."
          className="relative aspect-square w-[min(100%,18rem,40dvh)] touch-none select-none overflow-hidden rounded-md bg-soft outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--color-acao-painel-hover) [cursor:grab] active:[cursor:grabbing]"
          onPointerDown={iniciarArraste} onPointerMove={continuarArraste} onPointerUp={encerrarArraste} onPointerCancel={encerrarArraste} onKeyDown={teclado}>
          <canvas ref={palco} aria-hidden="true" className="absolute inset-0 size-full" />
          {/* O sombreado é a sombra gigante do círculo: tudo fora dele escurece e o anel dourado marca o recorte. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full border-2 border-gold shadow-[0_0_0_999px_rgb(0_0_0/0.55)]" />
          {!imagem && <p className="absolute inset-0 m-0 grid place-items-center text-base text-muted">Carregando…</p>}
        </div>
        <p className="m-0 text-center text-base text-muted">Arraste para enquadrar. Pince para ampliar.</p>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className={botaoZoom} aria-label="Diminuir zoom" disabled={!imagem || salvando || enquadramento.zoom <= 1} onClick={() => zoom(enquadramento.zoom - 0.25)}><span aria-hidden="true" className="h-0.5 w-4 bg-current" /></button>
        <input type="range" aria-label="Zoom" className="h-11 min-w-0 flex-1 accent-(--color-acao-painel)" min={1} max={ZOOM_MAXIMO} step={0.05} value={enquadramento.zoom} disabled={!imagem || salvando} onChange={(evento) => zoom(Number(evento.target.value))} />
        <button type="button" className={botaoZoom} aria-label="Aumentar zoom" disabled={!imagem || salvando || enquadramento.zoom >= ZOOM_MAXIMO} onClick={() => zoom(enquadramento.zoom + 0.25)}><IconeAdicionar size={20} aria-hidden="true" /></button>
      </div>

      {/* Em celular baixo as prévias saem: o palco e o zoom ficam à vista sem rolar. */}
      <ul aria-label="Prévias" className="m-0 flex list-none items-end justify-center gap-6 p-0 [@media(max-height:720px)]:hidden">
        {TAMANHOS_PREVIA.map(({ lado, rotulo }, indice) => <li key={rotulo} className="grid justify-items-center gap-1.5 text-sm text-muted">
          <canvas ref={(elemento) => { previas.current[indice] = elemento; }} aria-hidden="true" style={{ width: lado, height: lado }} className="rounded-full bg-soft" />
          {rotulo}
        </li>)}
      </ul>

      {/* Rodapé fixo no fim da área rolável: no celular, com o teclado de zoom e as prévias, os botões não somem. */}
      <div className={`${estilos.rodapeDialogo} !mt-0 max-[520px]:[&>button]:flex-1 [&>button]:whitespace-nowrap`}>
        <button type="button" className="buttonGhost" disabled={salvando} onClick={aoCancelar}>Cancelar</button>
        <button type="button" className="button" disabled={!imagem || salvando} onClick={() => void confirmar()}><IconeSalvar size={20} aria-hidden="true" />Usar foto</button>
      </div>
    </div>
  </Dialogo>;
}
