import { useState, type KeyboardEvent } from 'react';
import { ImageOff, Play, Expand, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Midia } from '../tipos';
import Dialogo from './Dialogo';
import { urlEmbed } from '../servicos/videoEmbed';

function Imagem({ url, titulo, prioritaria = false }: { url: string; titulo: string; prioritaria?: boolean }) {
  const [falhou, setFalhou] = useState(false);
  if (falhou) return <div className="flex h-full min-h-16 flex-col items-center justify-center gap-2 p-4 text-center text-muted"><ImageOff aria-hidden="true" /><span className="text-sm">Foto indisponível</span></div>;
  return <img src={url} alt={titulo} decoding="async" onError={() => setFalhou(true)} {...(prioritaria ? { fetchpriority: 'high' } : { loading: 'lazy' as const })} />;
}

function Visualizacao({ midia, titulo, prioritaria }: { midia: Midia; titulo: string; prioritaria: boolean }) {
  if (midia.tipo === 'IMAGEM') return <Imagem key={midia.url} url={midia.url} titulo={titulo} prioritaria={prioritaria} />;
  if (midia.tipo === 'VIDEO_ARQUIVO') return <video src={midia.url} controls preload="metadata" aria-label={`Vídeo: ${titulo}`} />;
  const origem = urlEmbed(midia.url);
  return origem ? <iframe src={origem} title={`Vídeo: ${titulo}`} loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <p>Este vídeo não está disponível.</p>;
}

const classeSeta = 'absolute top-1/2 z-[1] grid min-h-11 min-w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper text-ink shadow-sm hover:bg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

export default function GaleriaMidia({ midias, titulo }: { midias: Midia[]; titulo: string }) {
  const [indice, setIndice] = useState(0);
  const [indiceFoto, setIndiceFoto] = useState<number | null>(null);
  const ordenadas = [...midias].sort((a, b) => Number(b.capa) - Number(a.capa) || a.ordem - b.ordem);
  const fotos = ordenadas.filter((item) => item.tipo === 'IMAGEM');
  const indiceAtual = Math.min(indice, ordenadas.length - 1);
  const atual = ordenadas[indiceAtual];
  const fotoAmpliada = indiceFoto === null ? undefined : fotos[indiceFoto];
  if (!atual) return <div className="flex min-h-[320px] flex-col items-center justify-center gap-[15px] bg-soft p-[30px] text-center text-muted"><ImageOff /><p>Fotos deste imóvel serão adicionadas em breve.</p></div>;

  function mover(direcao: number) { setIndice((valor) => (valor + direcao + ordenadas.length) % ordenadas.length); }
  function moverFoto(direcao: number) { setIndiceFoto((valor) => ((valor ?? 0) + direcao + fotos.length) % fotos.length); }
  function navegar(evento: KeyboardEvent<HTMLDivElement>, ampliada = false) {
    if (evento.target instanceof HTMLVideoElement || evento.target instanceof HTMLIFrameElement) return;
    const quantidade = ampliada ? fotos.length : ordenadas.length;
    if (quantidade < 2 || !['ArrowRight', 'ArrowLeft'].includes(evento.key)) return;
    evento.preventDefault();
    const direcao = evento.key === 'ArrowRight' ? 1 : -1;
    if (ampliada) moverFoto(direcao); else mover(direcao);
  }

  return <div>
    <div className="relative h-[475px] overflow-hidden rounded-lg border-b-[3px] border-b-gold bg-soft shadow-sm max-[700px]:h-[clamp(220px,62vw,320px)] [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
      role="region" tabIndex={ordenadas.length > 1 ? 0 : undefined} aria-label="Galeria do imóvel. Use as setas para navegar." onKeyDown={(evento) => navegar(evento)}>
      <Visualizacao key={atual.id} midia={atual} titulo={`${titulo} — ${indiceAtual + 1}`} prioritaria={indiceAtual === 0} />
      {ordenadas.length > 1 && <>
        <button type="button" className={`${classeSeta} left-3`} aria-label="Mídia anterior" onClick={() => mover(-1)}><ChevronLeft size={22} /></button>
        <button type="button" className={`${classeSeta} right-3`} aria-label="Próxima mídia" onClick={() => mover(1)}><ChevronRight size={22} /></button>
      </>}
      {atual.tipo === 'IMAGEM' && <button type="button" className="absolute bottom-[18px] left-[18px] flex min-h-11 items-center gap-2 rounded border-0 bg-paper px-[14px] py-[10px] text-[13px]" onClick={() => setIndiceFoto(fotos.findIndex((foto) => foto.id === atual.id))}><Expand size={16} /> Ampliar foto</button>}
      <span className="absolute bottom-[23px] right-[18px] rounded-full bg-navy/80 px-3 py-1 text-[13px] text-white" aria-live="polite" aria-atomic="true">{indiceAtual + 1} / {ordenadas.length}</span>
    </div>
    {ordenadas.length > 1 && <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-contain px-[3px] py-3">
      {ordenadas.map((item, posicao) => <button type="button" key={item.id} onClick={() => setIndice(posicao)} aria-label={`Ver ${item.tipo === 'IMAGEM' ? 'foto' : 'vídeo'} ${posicao + 1}`} aria-pressed={indiceAtual === posicao}
        className={`grid h-[72px] w-[100px] shrink-0 snap-start place-items-center overflow-hidden rounded border-2 bg-soft p-0 max-[700px]:w-[88px] ${indiceAtual === posicao ? 'border-brand outline-2 outline-paper outline-offset-[-4px]' : 'border-transparent'} [&_img]:h-full [&_img]:w-full [&_img]:object-cover`}>
        {item.tipo === 'IMAGEM' ? <Imagem key={item.url} url={item.url} titulo="" /> : <Play size={24} />}
      </button>)}
    </div>}
    {fotoAmpliada && <div onKeyDown={(evento) => navegar(evento, true)}><Dialogo titulo={titulo} tamanho="largo" aoFechar={() => setIndiceFoto(null)}>
      <div className="relative grid min-h-[220px] place-items-center bg-soft [&_img]:max-h-[65dvh] [&_img]:w-full [&_img]:object-contain" role="region" aria-label="Fotos ampliadas. Use as setas para navegar." tabIndex={0}>
        <Imagem key={fotoAmpliada.url} url={fotoAmpliada.url} titulo={`${titulo} — foto ${(indiceFoto ?? 0) + 1}`} />
        {fotos.length > 1 && <>
          <button type="button" className={`${classeSeta} left-2`} aria-label="Foto anterior" onClick={() => moverFoto(-1)}><ChevronLeft size={22} /></button>
          <button type="button" className={`${classeSeta} right-2`} aria-label="Próxima foto" onClick={() => moverFoto(1)}><ChevronRight size={22} /></button>
        </>}
      </div>
      <p className="mb-0 mt-3 text-center text-sm text-muted" aria-live="polite" aria-atomic="true">Foto {(indiceFoto ?? 0) + 1} de {fotos.length}</p>
    </Dialogo></div>}
  </div>;
}
