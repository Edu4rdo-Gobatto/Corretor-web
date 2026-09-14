import { useState } from 'react';
import type { Property } from '../types';
import { api } from '../services/api';
import { errorMessage } from '../services/format';
import { embedUrl } from '../services/embedUrl';
import { prepareMediaFiles } from './mediaUpload';

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
    let succeeded = false;
    let skipped = '';
    await run(async () => {
      if (files.length > 20) throw new Error('Selecione no máximo 20 arquivos por envio.');
      for (const file of files) {
        if (!acceptedTypes.includes(file.type)) throw new Error('Use imagens JPG, PNG ou WebP e vídeos MP4 ou WebM.');
        if (file.size > 30 * 1024 * 1024) throw new Error(`${file.name}: o limite é 30 MB por arquivo.`);
      }
      setProgress({ completed: 0, total: files.length });
      const unreadable: string[] = [];
      const prepared = await prepareMediaFiles(
        files,
        (completed, total) => setProgress({ completed, total }),
        (file) => unreadable.push(file.name),
      );
      if (!prepared.length) {
        throw new Error(
          unreadable.length
            ? `Não foi possível ler: ${unreadable.join(', ')}. Use imagens JPG, PNG ou WebP válidas.`
            : 'Nenhum arquivo para enviar.',
        );
      }
      if(prepared.some(file=>file.type.startsWith('image/')&&file.size>10*1024*1024)) throw new Error('A imagem otimizada excedeu 10 MB. Escolha uma imagem menor.');
      if(prepared.reduce((total,file)=>total+file.size,0)>60*1024*1024) throw new Error('O envio excede 60 MB. Envie os arquivos em grupos menores.');
      await api.uploadMedia(property.id, prepared);
      succeeded = true;
      if (unreadable.length) skipped = `Arquivos adicionados. Não foi possível ler: ${unreadable.join(', ')}.`;
    }, 'Arquivos adicionados.');
    setProgress(null);
    if (succeeded && skipped) setMessage(skipped);
  }

  async function embed() {
    await run(async () => {
      if (!embedUrl(url)) throw new Error('Informe um link HTTPS válido do YouTube ou Vimeo.');
      await api.embedMedia(property.id, url);
      setUrl('');
    }, 'Vídeo adicionado.');
  }

  return (
    <section className="mt-7 border border-[#dedfd5] bg-[#fffefa] p-7 max-[500px]:p-5 dark:border-line dark:bg-soft">
      <h2 className="text-[22px] dark:text-ink">05. Fotos e vídeos</h2>
      <p className="muted">A primeira impressão começa por uma boa imagem. Escolha uma foto de capa.</p>
      <label className="mb-6 block border border-dashed border-[#899e88] bg-[#f3f5ef] p-7 dark:border-line dark:bg-soft dark:text-ink">
        Adicionar fotos ou vídeos
        <span className="text-[13px] text-[#687166] dark:text-muted"> · Até 20 arquivos por envio, 30 MB por vídeo e 60 MB no total. Imagens são otimizadas em WebP.</span>
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          disabled={busy}
          className="mt-[14px] block max-w-full"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length) void upload(files);
            event.target.value = '';
          }}
        />
      </label>
      <form className="mb-[26px] flex items-end gap-3 max-[500px]:flex-col max-[500px]:items-stretch" onSubmit={(event) => { event.preventDefault(); void embed(); }}>
        <label className="grid flex-1 gap-2">
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
      <div className="grid grid-cols-3 gap-[18px] max-[800px]:grid-cols-2 max-[500px]:grid-cols-1">
        {media.map((item, index) => {
          const safeUrl = item.type === 'VIDEO_EMBED' ? embedUrl(item.url) : null;
          return (
            <article className="border border-[#dedfd5] bg-white dark:border-line dark:bg-paper" key={item.id}>
              {item.type === 'IMAGE' ? <img className="h-[150px] w-full bg-[#e9ede5] object-cover dark:bg-soft" src={item.url} alt={`Foto ${index + 1} do imóvel`} />
                : item.type === 'VIDEO_FILE' ? <video className="h-[150px] w-full bg-[#e9ede5] object-cover dark:bg-soft" src={item.url} controls preload="metadata" aria-label={`Vídeo ${index + 1} do imóvel`} />
                  : <div className="grid h-[150px] place-items-center break-anywhere bg-[#e9ede5] p-4 dark:bg-soft dark:text-ink">{safeUrl ? <a href={safeUrl} target="_blank" rel="noopener noreferrer">Assistir ao vídeo ↗</a> : <span>Vídeo indisponível</span>}</div>}
              <div className="flex flex-wrap items-center gap-[10px] p-3 [&>button]:min-h-11 [&>button]:px-3 [&>button]:py-2 [&>button]:text-[13px]">
                {item.isCover ? <span className="bg-[#174d3b] px-2 py-[3px] text-xs text-white">Capa</span> : item.type === 'IMAGE' && <button type="button" className="buttonGhost" disabled={busy} onClick={() => void run(() => api.coverMedia(property.id, item.id), 'Capa atualizada.')}>Definir capa</button>}
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
