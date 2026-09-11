import { useState } from 'react';
import type { Property } from '../types';
import { api } from '../services/api';
import { errorMessage } from '../services/format';
import { embedUrl } from '../services/embedUrl';
import { prepareMediaFiles } from './mediaUpload';
import styles from './MediaManager.module.css';

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

export default function MediaManager({ property, onChange }: { property: Property; onChange: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const media = [...property.media].sort((a, b) => a.orderIndex - b.orderIndex);

  async function run(work: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await work();
      await onChange();
      setMessage(success);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function upload(files: File[]) {
    await run(async () => {
      if (files.length > 20) throw new Error('Selecione no máximo 20 arquivos por envio.');
      for (const file of files) {
        if (!acceptedTypes.includes(file.type)) throw new Error('Use imagens JPG, PNG ou WebP e vídeos MP4 ou WebM.');
        if (file.size > 30 * 1024 * 1024) throw new Error(`${file.name}: o limite é 30 MB por arquivo.`);
      }
      setProgress({ completed: 0, total: files.length });
      const prepared = await prepareMediaFiles(files, (completed, total) => setProgress({ completed, total }));
      await api.uploadMedia(property.id, prepared);
    }, 'Arquivos adicionados.');
    setProgress(null);
  }

  async function embed() {
    await run(async () => {
      if (!embedUrl(url)) throw new Error('Informe um link HTTPS válido do YouTube ou Vimeo.');
      await api.embedMedia(property.id, url);
      setUrl('');
    }, 'Vídeo adicionado.');
  }

  return (
    <section className={styles.panel}>
      <h2>05. Fotos e vídeos</h2>
      <p className="muted">A primeira impressão começa por uma boa imagem. Escolha uma foto de capa.</p>
      <label className={styles.upload}>
        Adicionar fotos ou vídeos
        <span className={styles.message}> · Até 20 arquivos por envio, 30 MB por arquivo. Imagens são otimizadas em WebP.</span>
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          disabled={busy}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length) void upload(files);
            event.target.value = '';
          }}
        />
      </label>
      <form className={styles.embed} onSubmit={(event) => { event.preventDefault(); void embed(); }}>
        <label>
          Link do YouTube ou Vimeo
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            required
            disabled={busy}
          />
        </label>
        <button className="buttonSecondary" disabled={busy}>Adicionar vídeo</button>
      </form>
      {error && <p role="alert" className="error">{error}</p>}
      {progress && <p role="status">Processando {progress.completed} de {progress.total}…</p>}
      {message && <p role="status">{message}</p>}
      <div className={styles.grid}>
        {media.map((item, index) => {
          const safeUrl = item.type === 'VIDEO_EMBED' ? embedUrl(item.url) : null;
          return (
            <article className={styles.item} key={item.id}>
              {item.type === 'IMAGE' ? <img className={styles.preview} src={item.url} alt={`Foto ${index + 1} do imóvel`} />
                : item.type === 'VIDEO_FILE' ? <video className={styles.preview} src={item.url} controls preload="metadata" aria-label={`Vídeo ${index + 1} do imóvel`} />
                  : <div className={styles.placeholder}>{safeUrl ? <a href={safeUrl} target="_blank" rel="noopener noreferrer">Assistir ao vídeo ↗</a> : <span>Vídeo indisponível</span>}</div>}
              <div className={styles.controls}>
                {item.isCover ? <span className={styles.cover}>Capa</span> : item.type === 'IMAGE' && <button type="button" className="buttonGhost" disabled={busy} onClick={() => void run(() => api.coverMedia(property.id, item.id), 'Capa atualizada.')}>Definir capa</button>}
                <button type="button" className="buttonGhost" aria-label={`Mover mídia ${index + 1} para cima`} disabled={busy || index === 0} onClick={() => void run(() => { const ids = media.map((mediaItem) => mediaItem.id); [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]; return api.reorderMedia(property.id, ids); }, 'Ordem atualizada.')}>↑</button>
                <button type="button" className="buttonGhost" aria-label={`Mover mídia ${index + 1} para baixo`} disabled={busy || index === media.length - 1} onClick={() => void run(() => { const ids = media.map((mediaItem) => mediaItem.id); [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]; return api.reorderMedia(property.id, ids); }, 'Ordem atualizada.')}>↓</button>
                <button type="button" className="buttonGhost" disabled={busy} onClick={() => { if (confirm('Excluir esta mídia permanentemente?')) void run(() => api.deleteMedia(property.id, item.id), 'Mídia excluída.'); }}>Excluir</button>
              </div>
            </article>
          );
        })}
      </div>
      {!media.length && <p className="muted">Nenhuma mídia adicionada.</p>}
    </section>
  );
}
