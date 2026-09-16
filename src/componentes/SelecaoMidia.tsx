import { useEffect, useMemo, useState } from 'react';
import { urlEmbed } from '../servicos/videoEmbed';
import { LIMITE_ARQUIVOS, TIPOS_ACEITOS, validarSelecaoMidia } from './prepararMidia';

interface Propriedades {
  arquivos: File[];
  videos: string[];
  aoAlterar: (arquivos: File[], videos: string[]) => void;
  desabilitado?: boolean;
}

/** Fotos e vídeos escolhidos antes de o imóvel existir; o envio acontece logo depois de salvar. */
export default function SelecaoMidia({ arquivos, videos, aoAlterar, desabilitado }: Propriedades) {
  const [erro, setErro] = useState('');
  const [url, setUrl] = useState('');
  const previas = useMemo(() => arquivos.map((arquivo) => ({ arquivo, url: arquivo.type.startsWith('image/') ? URL.createObjectURL(arquivo) : null })), [arquivos]);
  useEffect(() => () => previas.forEach((previa) => { if (previa.url) URL.revokeObjectURL(previa.url); }), [previas]);

  function adicionarArquivos(novos: File[]) {
    const problema = validarSelecaoMidia(novos, arquivos.length);
    setErro(problema ?? '');
    if (!problema) aoAlterar([...arquivos, ...novos], videos);
  }
  function adicionarVideo() {
    if (!urlEmbed(url)) { setErro('Informe um link HTTPS válido do YouTube ou Vimeo.'); return; }
    setErro('');
    aoAlterar(arquivos, [...videos, url]);
    setUrl('');
  }

  return (
    <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
      <h2 className="mb-2 mt-0 text-[22px] text-ink">05. Fotos e vídeos</h2>
      <p className="muted">Escolha agora; tudo é enviado junto ao salvar o imóvel. A primeira foto vira a capa.</p>
      <label className="mb-6 block border border-dashed border-[#899e88] bg-[#f3f5ef] p-7 dark:border-line dark:bg-soft dark:text-ink">
        Adicionar fotos ou vídeos
        <span className="text-[13px] text-[#687166] dark:text-muted"> · Até {LIMITE_ARQUIVOS} arquivos, 30 MB por vídeo e 60 MB no total. Imagens são otimizadas em WebP.</span>
        <input type="file" multiple accept={TIPOS_ACEITOS.join(',')} disabled={desabilitado} className="mt-[14px] block max-w-full"
          onChange={(evento) => { adicionarArquivos(Array.from(evento.target.files ?? [])); evento.target.value = ''; }} />
      </label>
      <div className="mb-[26px] flex items-end gap-3 max-[500px]:flex-col max-[500px]:items-stretch">
        <label className="grid flex-1 gap-2">Link do YouTube ou Vimeo<input type="url" value={url} onChange={(evento) => setUrl(evento.target.value)} placeholder="https://www.youtube.com/watch?v=…" disabled={desabilitado} /></label>
        <button type="button" className="buttonSecondary" disabled={desabilitado || !url} onClick={adicionarVideo}>Adicionar vídeo</button>
      </div>
      {erro && <p role="alert" className="error">{erro}</p>}
      {(previas.length > 0 || videos.length > 0) && (
        <ul className="grid list-none grid-cols-3 gap-[18px] p-0 max-[800px]:grid-cols-2 max-[500px]:grid-cols-1">
          {previas.map((previa, indice) => (
            <li key={`${previa.arquivo.name}-${indice}`} className="border border-line bg-white dark:bg-paper">
              {previa.url ? <img className="h-[150px] w-full object-cover" src={previa.url} alt={`Prévia ${indice + 1}: ${previa.arquivo.name}`} /> : <div className="grid h-[150px] place-items-center bg-soft p-4 text-sm">{previa.arquivo.name}</div>}
              <div className="flex items-center justify-between gap-2 p-3 text-[13px]">
                <span className="truncate">{indice === 0 && previa.url ? 'Capa · ' : ''}{previa.arquivo.name}</span>
                <button type="button" className="buttonGhost min-h-11" disabled={desabilitado} onClick={() => aoAlterar(arquivos.filter((_, posicao) => posicao !== indice), videos)}>Remover</button>
              </div>
            </li>
          ))}
          {videos.map((video, indice) => (
            <li key={`${video}-${indice}`} className="border border-line bg-white dark:bg-paper">
              <div className="grid h-[150px] place-items-center bg-soft p-4 text-sm break-anywhere">Vídeo: {video}</div>
              <div className="flex justify-end p-3"><button type="button" className="buttonGhost min-h-11" disabled={desabilitado} onClick={() => aoAlterar(arquivos, videos.filter((_, posicao) => posicao !== indice))}>Remover</button></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
