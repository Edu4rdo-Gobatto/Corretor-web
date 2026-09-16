import { useState } from 'react';
import type { FichaImovel } from '../tipos';
import { api } from '../servicos/api';
import { mensagemErro } from '../servicos/formato';
import { urlEmbed } from '../servicos/videoEmbed';
import { LIMITE_ARQUIVOS, TIPOS_ACEITOS, prepararEnvio, validarSelecaoMidia } from './prepararMidia';

/** Fotos e vídeos de um imóvel já salvo: envio, vídeo externo, capa, ordem e exclusão. */
export default function GerenciadorMidia({ imovel, aoAlterar }: { imovel: Pick<FichaImovel, 'id' | 'midias'>; aoAlterar: () => Promise<void> }) {
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [url, setUrl] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [progresso, setProgresso] = useState<{ concluidos: number; total: number } | null>(null);
  const midias = [...imovel.midias].sort((a, b) => a.ordem - b.ordem);

  async function executar(trabalho: () => Promise<unknown>, sucesso: string) {
    setOcupado(true);
    setErro('');
    setMensagem('');
    try {
      await trabalho();
      await aoAlterar();
      setMensagem(sucesso);
    } catch (causa) {
      setErro(mensagemErro(causa));
    } finally {
      setOcupado(false);
    }
  }

  async function enviar(arquivos: File[]) {
    let pulados = '';
    await executar(async () => {
      const problema = validarSelecaoMidia(arquivos);
      if (problema) throw new Error(problema);
      setProgresso({ concluidos: 0, total: arquivos.length });
      const { prontos, ilegiveis } = await prepararEnvio(arquivos, (concluidos, total) => setProgresso({ concluidos, total }));
      await api.enviarMidias(imovel.id, prontos);
      if (ilegiveis.length) pulados = `Arquivos adicionados. Não foi possível ler: ${ilegiveis.join(', ')}.`;
    }, 'Arquivos adicionados.');
    setProgresso(null);
    if (pulados) setMensagem(pulados);
  }

  function reordenar(indice: number, destino: number) {
    const ids = midias.map((item) => item.id);
    [ids[indice], ids[destino]] = [ids[destino], ids[indice]];
    return api.reordenarMidias(imovel.id, ids);
  }

  return (
    <section className="mt-7 border border-[#dedfd5] bg-[#fffefa] p-7 max-[500px]:p-5 dark:border-line dark:bg-soft">
      <h2 className="text-[22px] dark:text-ink">05. Fotos e vídeos</h2>
      <p className="muted">A primeira impressão começa por uma boa imagem. Escolha uma foto de capa.</p>
      <label className="mb-6 block border border-dashed border-[#899e88] bg-[#f3f5ef] p-7 dark:border-line dark:bg-soft dark:text-ink">
        Adicionar fotos ou vídeos
        <span className="text-[13px] text-[#687166] dark:text-muted"> · Até {LIMITE_ARQUIVOS} arquivos por envio, 30 MB por vídeo e 60 MB no total. Imagens são otimizadas em WebP.</span>
        <input type="file" multiple accept={TIPOS_ACEITOS.join(',')} disabled={ocupado} className="mt-[14px] block max-w-full"
          onChange={(evento) => { const arquivos = Array.from(evento.target.files ?? []); if (arquivos.length) void enviar(arquivos); evento.target.value = ''; }} />
      </label>
      <form className="mb-[26px] flex items-end gap-3 max-[500px]:flex-col max-[500px]:items-stretch" onSubmit={(evento) => { evento.preventDefault(); void executar(async () => { if (!urlEmbed(url)) throw new Error('Informe um link HTTPS válido do YouTube ou Vimeo.'); await api.adicionarVideo(imovel.id, url); setUrl(''); }, 'Vídeo adicionado.'); }}>
        <label className="grid flex-1 gap-2">Link do YouTube ou Vimeo<input type="url" value={url} onChange={(evento) => setUrl(evento.target.value)} placeholder="https://www.youtube.com/watch?v=…" required disabled={ocupado} /></label>
        <button className="buttonSecondary" disabled={ocupado}>Adicionar vídeo</button>
      </form>
      {erro && <p role="alert" className="error">{erro}</p>}
      {progresso && <p role="status">Processando {progresso.concluidos} de {progresso.total}…</p>}
      {mensagem && <p role="status">{mensagem}</p>}
      <div className="grid grid-cols-3 gap-[18px] max-[800px]:grid-cols-2 max-[500px]:grid-cols-1">
        {midias.map((item, indice) => {
          const urlSegura = item.tipo === 'VIDEO_EMBED' ? urlEmbed(item.url) : null;
          return (
            <article className="border border-[#dedfd5] bg-white dark:border-line dark:bg-paper" key={item.id}>
              {item.tipo === 'IMAGEM' ? <img className="h-[150px] w-full bg-[#e9ede5] object-cover dark:bg-soft" src={item.url} alt={`Foto ${indice + 1} do imóvel`} />
                : item.tipo === 'VIDEO_ARQUIVO' ? <video className="h-[150px] w-full bg-[#e9ede5] object-cover dark:bg-soft" src={item.url} controls preload="metadata" aria-label={`Vídeo ${indice + 1} do imóvel`} />
                  : <div className="grid h-[150px] place-items-center break-anywhere bg-[#e9ede5] p-4 dark:bg-soft dark:text-ink">{urlSegura ? <a href={urlSegura} target="_blank" rel="noopener noreferrer">Assistir ao vídeo ↗</a> : <span>Vídeo indisponível</span>}</div>}
              <div className="flex flex-wrap items-center gap-[10px] p-3 [&>button]:min-h-11 [&>button]:px-3 [&>button]:py-2 [&>button]:text-[13px]">
                {item.capa ? <span className="bg-[#174d3b] px-2 py-[3px] text-xs text-white">Capa</span> : item.tipo === 'IMAGEM' && <button type="button" className="buttonGhost" disabled={ocupado} onClick={() => void executar(() => api.definirCapa(imovel.id, item.id), 'Capa atualizada.')}>Definir capa</button>}
                <button type="button" className="buttonGhost" aria-label={`Mover mídia ${indice + 1} para cima`} disabled={ocupado || indice === 0} onClick={() => void executar(() => reordenar(indice, indice - 1), 'Ordem atualizada.')}>↑</button>
                <button type="button" className="buttonGhost" aria-label={`Mover mídia ${indice + 1} para baixo`} disabled={ocupado || indice === midias.length - 1} onClick={() => void executar(() => reordenar(indice, indice + 1), 'Ordem atualizada.')}>↓</button>
                <button type="button" className="buttonGhost" disabled={ocupado} onClick={() => { if (confirm('Excluir esta mídia permanentemente?')) void executar(() => api.excluirMidia(imovel.id, item.id), 'Mídia excluída.'); }}>Excluir</button>
              </div>
            </article>
          );
        })}
      </div>
      {!midias.length && <p className="muted">Nenhuma mídia adicionada.</p>}
    </section>
  );
}
