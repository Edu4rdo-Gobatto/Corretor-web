import { useState } from 'react';
import { ImageOff, Play, Expand } from 'lucide-react';
import type { PropertyMedia } from '../types';
import Dialog from './Dialog';
import styles from './MediaGallery.module.css';
export function embedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    if (['youtube.com','www.youtube.com','youtu.be'].includes(parsed.hostname)) {
      const id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v') || parsed.pathname.split('/').pop();
      return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(parsed.hostname)) {
      const id = parsed.pathname.split('/').pop();
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch { /* Invalid remote media must never become iframe content. */ }
  return null;
}
function MediaView({ media, title }: { media: PropertyMedia; title: string }) {
  if (media.type === 'IMAGE') return <img src={media.url} alt={title}/>;
  if (media.type === 'VIDEO_FILE') return <video src={media.url} controls preload="metadata" aria-label={`Vídeo: ${title}`}/>;
  const source = embedUrl(media.url);
  return source ? <iframe src={source} title={`Vídeo: ${title}`} allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/> : <p>Este vídeo não está disponível.</p>;
}
export default function MediaGallery({ media, title }: { media: PropertyMedia[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const ordered = [...media].sort((first, second) => Number(second.isCover) - Number(first.isCover) || first.orderIndex - second.orderIndex);
  const current = ordered[Math.min(index, ordered.length - 1)];
  if (!current) return <div className={styles.placeholder}><ImageOff/><p>Fotos deste imóvel serão adicionadas em breve.</p></div>;
  return <div className={styles.gallery}><div className={styles.main}><MediaView media={current} title={title}/>{current.type === 'IMAGE' && <button className={styles.expand} onClick={() => setExpanded(true)}><Expand size={16}/> Ampliar foto</button>}<span className={styles.counter}>{index + 1} / {ordered.length}</span></div>{ordered.length > 1 && <div className={styles.thumbnails}>{ordered.map((item, position) => <button key={item.id} className={index === position ? styles.active : ''} onClick={() => setIndex(position)} aria-label={`Ver ${item.type === 'IMAGE' ? 'foto' : 'vídeo'} ${position + 1}`} aria-pressed={index === position}>{item.type === 'IMAGE' ? <img src={item.url} alt="" loading="lazy"/> : <Play size={24}/>}</button>)}</div>}{expanded && <Dialog title={title} onClose={() => setExpanded(false)}><img className={styles.full} src={current.url} alt={title}/></Dialog>}</div>;
}
