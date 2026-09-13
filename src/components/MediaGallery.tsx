import { useState } from 'react';
import { ImageOff, Play, Expand } from 'lucide-react';
import type { PropertyMedia } from '../types';
import Dialog from './Dialog';
export { embedUrl } from '../services/embedUrl';
import { embedUrl } from '../services/embedUrl';
function MediaView({ media, title, eager }: { media: PropertyMedia; title: string; eager: boolean }) {
  if (media.type === 'IMAGE') {
    if (eager) return <img src={media.url} alt={title} decoding="async" {...{ fetchpriority: 'high' }}/>;
    return <img src={media.url} alt={title} loading="lazy" decoding="async"/>;
  }
  if (media.type === 'VIDEO_FILE') return <video src={media.url} controls preload="metadata" aria-label={`Vídeo: ${title}`}/>;
  const source = embedUrl(media.url);
  return source ? <iframe src={source} title={`Vídeo: ${title}`} loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/> : <p>Este vídeo não está disponível.</p>;
}
export default function MediaGallery({ media, title }: { media: PropertyMedia[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const ordered = [...media].sort((first, second) => Number(second.isCover) - Number(first.isCover) || first.orderIndex - second.orderIndex);
  const current = ordered[Math.min(index, ordered.length - 1)];
  if (!current) return <div className="flex min-h-[320px] flex-col items-center justify-center gap-[15px] bg-soft p-[30px] text-center text-muted"><ImageOff/><p>Fotos deste imóvel serão adicionadas em breve.</p></div>;
  return <div><div className="relative h-[475px] overflow-hidden rounded-lg border-b-[3px] border-b-gold bg-soft shadow-[0_16px_34px_rgb(36_40_36/0.08)] max-[700px]:h-[clamp(220px,62vw,320px)] [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_video]:h-full [&_video]:w-full [&_video]:object-cover" tabIndex={ordered.length > 1 ? 0 : undefined} aria-label={ordered.length > 1 ? 'Galeria de imagens. Use as setas para navegar.' : undefined} onKeyDown={event => { if (ordered.length < 2) return; if (event.key === 'ArrowRight') setIndex(value => (value + 1) % ordered.length); if (event.key === 'ArrowLeft') setIndex(value => (value - 1 + ordered.length) % ordered.length); }}><MediaView media={current} title={title} eager={index === 0}/>{current.type === 'IMAGE' && <button className="absolute bottom-[18px] left-[18px] flex min-h-11 items-center gap-2 rounded border-0 bg-paper px-[14px] py-[10px] text-[13px]" onClick={() => setExpanded(true)}><Expand size={16}/> Ampliar foto</button>}<span className="absolute bottom-[23px] right-[18px] rounded-full bg-[#0A2042CC] px-3 py-1 text-[13px] uppercase tracking-[0.14em] text-white" aria-live="polite">{index + 1} / {ordered.length}</span></div>{ordered.length > 1 && <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-contain px-[3px] py-3">{ordered.map((item, position) => <button key={item.id} className={`grid h-[72px] w-[100px] shrink-0 snap-start place-items-center overflow-hidden rounded border-2 bg-soft p-0 transition hover:-translate-y-0.5 max-[700px]:h-[72px] max-[700px]:basis-[88px] ${index === position ? 'border-brand outline-2 outline-paper outline-offset-[-4px]' : 'border-transparent'} [&_img]:h-full [&_img]:w-full [&_img]:object-cover`} onClick={() => setIndex(position)} aria-label={`Ver ${item.type === 'IMAGE' ? 'foto' : 'vídeo'} ${position + 1}`} aria-pressed={index === position} aria-current={index === position}>{item.type === 'IMAGE' ? <img src={item.url} alt="" loading="lazy" decoding="async"/> : <Play size={24}/>}</button>)}</div>}{expanded && current.type === 'IMAGE' && <Dialog title={title} onClose={() => setExpanded(false)}><img className="w-full" src={current.url} alt={title}/></Dialog>}</div>;
}
