import { useState } from 'react';
import { ImageOff, Play, Expand } from 'lucide-react';
import type { Midia } from '../tipos';
import Dialogo from './Dialogo';
import { urlEmbed } from '../servicos/videoEmbed';

function Visualizacao({ midia, titulo, prioritaria }: { midia: Midia; titulo: string; prioritaria: boolean }) {
  if (midia.tipo === 'IMAGEM') {
    if (prioritaria) return <img src={midia.url} alt={titulo} decoding="async" {...{ fetchpriority: 'high' }} />;
    return <img src={midia.url} alt={titulo} loading="lazy" decoding="async" />;
  }
  if (midia.tipo === 'VIDEO_ARQUIVO') return <video src={midia.url} controls preload="metadata" aria-label={`Vídeo: ${titulo}`} />;
  const origem = urlEmbed(midia.url);
  return origem ? <iframe src={origem} title={`Vídeo: ${titulo}`} loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <p>Este vídeo não está disponível.</p>;
}

export default function GaleriaMidia({ midias, titulo }: { midias: Midia[]; titulo: string }) {
  const [indice, setIndice] = useState(0);
  const [ampliada, setAmpliada] = useState(false);
  const ordenadas = [...midias].sort((a, b) => Number(b.capa) - Number(a.capa) || a.ordem - b.ordem);
  const atual = ordenadas[Math.min(indice, ordenadas.length - 1)];
  if (!atual) return <div className="flex min-h-[320px] flex-col items-center justify-center gap-[15px] bg-soft p-[30px] text-center text-muted"><ImageOff /><p>Fotos deste imóvel serão adicionadas em breve.</p></div>;
  const navegar = (evento: React.KeyboardEvent) => {
    if (ordenadas.length < 2) return;
    if (evento.key === 'ArrowRight') setIndice((valor) => (valor + 1) % ordenadas.length);
    if (evento.key === 'ArrowLeft') setIndice((valor) => (valor - 1 + ordenadas.length) % ordenadas.length);
  };
  return (
    <div>
      <div className="relative h-[475px] overflow-hidden rounded-lg border-b-[3px] border-b-gold bg-soft shadow-[0_16px_34px_rgb(36_40_36/0.08)] max-[700px]:h-[clamp(220px,62vw,320px)] [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
        tabIndex={ordenadas.length > 1 ? 0 : undefined} aria-label={ordenadas.length > 1 ? 'Galeria de imagens. Use as setas para navegar.' : undefined} onKeyDown={navegar}>
        <Visualizacao midia={atual} titulo={titulo} prioritaria={indice === 0} />
        {atual.tipo === 'IMAGEM' && <button className="absolute bottom-[18px] left-[18px] flex min-h-11 items-center gap-2 rounded border-0 bg-paper px-[14px] py-[10px] text-[13px]" onClick={() => setAmpliada(true)}><Expand size={16} /> Ampliar foto</button>}
        <span className="absolute bottom-[23px] right-[18px] rounded-full bg-[#0A2042CC] px-3 py-1 text-[13px] uppercase tracking-[0.14em] text-white" aria-live="polite">{indice + 1} / {ordenadas.length}</span>
      </div>
      {ordenadas.length > 1 && (
        <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-contain px-[3px] py-3">
          {ordenadas.map((item, posicao) => (
            <button key={item.id} onClick={() => setIndice(posicao)} aria-label={`Ver ${item.tipo === 'IMAGEM' ? 'foto' : 'vídeo'} ${posicao + 1}`} aria-pressed={indice === posicao} aria-current={indice === posicao}
              className={`grid h-[72px] w-[100px] shrink-0 snap-start place-items-center overflow-hidden rounded border-2 bg-soft p-0 transition hover:-translate-y-0.5 max-[700px]:basis-[88px] ${indice === posicao ? 'border-brand outline-2 outline-paper outline-offset-[-4px]' : 'border-transparent'} [&_img]:h-full [&_img]:w-full [&_img]:object-cover`}>
              {item.tipo === 'IMAGEM' ? <img src={item.url} alt="" loading="lazy" decoding="async" /> : <Play size={24} />}
            </button>
          ))}
        </div>
      )}
      {ampliada && atual.tipo === 'IMAGEM' && <Dialogo titulo={titulo} tamanho="largo" aoFechar={() => setAmpliada(false)}><img className="w-full" src={atual.url} alt={titulo} /></Dialogo>}
    </div>
  );
}
