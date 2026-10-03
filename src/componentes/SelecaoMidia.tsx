import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import AcaoIcone from './AcaoIcone';
import Aviso from './Aviso';
import Campo from './Campo';
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
    <div>
      <p className="muted">Escolha agora; tudo é enviado junto ao salvar o imóvel. A primeira foto vira a capa.</p>
      <label className="mb-6 block border border-dashed border-control-line bg-soft p-7 text-ink">
        Adicionar fotos ou vídeos
        <span className="text-[13px] font-normal text-muted"> · Até {LIMITE_ARQUIVOS} arquivos, 30 MB por vídeo e 60 MB no total. Imagens são otimizadas em WebP.</span>
        <input type="file" multiple accept={TIPOS_ACEITOS.join(',')} disabled={desabilitado} className="mt-[14px] block max-w-full"
          onChange={(evento) => { adicionarArquivos(Array.from(evento.target.files ?? [])); evento.target.value = ''; }} />
      </label>
      <div className="mb-[26px] flex items-end gap-3 @max-[28rem]:flex-col @max-[28rem]:items-stretch">
        <Campo rotulo="Link do YouTube ou Vimeo" classe="flex-1"><input type="url" value={url} onChange={(evento) => setUrl(evento.target.value)} placeholder="https://www.youtube.com/watch?v=…" disabled={desabilitado} onKeyDown={(evento) => { if (evento.key === 'Enter') { evento.preventDefault(); adicionarVideo(); } }} /></Campo>
        <button type="button" className="buttonSecondary" disabled={desabilitado || !url} onClick={adicionarVideo}>Adicionar vídeo</button>
      </div>
      {erro && <Aviso tom="erro" classe="mb-4">{erro}</Aviso>}
      {(previas.length > 0 || videos.length > 0) && (
        <ul className="grid list-none grid-cols-1 gap-[18px] p-0 @min-[28rem]:grid-cols-2 @min-[52rem]:grid-cols-3">
          {previas.map((previa, indice) => (
            <li key={`${previa.arquivo.name}-${indice}`} className="border border-line bg-paper">
              {previa.url ? <img className="h-[150px] w-full object-cover" src={previa.url} alt={`Prévia ${indice + 1}: ${previa.arquivo.name}`} /> : <div className="grid h-[150px] place-items-center bg-soft p-4 text-sm">{previa.arquivo.name}</div>}
              <div className="flex items-center justify-between gap-2 p-3 text-[13px]">
                <span className="truncate">{indice === 0 && previa.url ? 'Capa · ' : ''}{previa.arquivo.name}</span>
                <AcaoIcone icone={Trash2} rotulo={`Remover ${previa.arquivo.name}`} tom="perigo" desabilitado={desabilitado} aoClicar={() => aoAlterar(arquivos.filter((_, posicao) => posicao !== indice), videos)} />
              </div>
            </li>
          ))}
          {videos.map((video, indice) => (
            <li key={`${video}-${indice}`} className="border border-line bg-paper">
              <div className="grid h-[150px] place-items-center bg-soft p-4 text-sm wrap-anywhere">Vídeo: {video}</div>
              <div className="flex justify-end p-3"><AcaoIcone icone={Trash2} rotulo={`Remover vídeo ${indice + 1}`} tom="perigo" desabilitado={desabilitado} aoClicar={() => aoAlterar(arquivos, videos.filter((_, posicao) => posicao !== indice))} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
