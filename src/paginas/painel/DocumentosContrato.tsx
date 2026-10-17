import { useCallback, useRef, useState } from 'react';
import { api } from '../../servicos/api';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { dataCivil, mensagemErro } from '../../servicos/formato';
import { IconeAbrirFora, IconeAdicionar } from '../../componentes/Icones';
import Aviso from '../../componentes/Aviso';

const LIMITE_ARQUIVO = 30 * 1024 * 1024;
const tamanhoLegivel = (bytes: number | null) => bytes === null ? '' : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;

/** Anexa documentos ao contrato; o servidor os grava na pasta privada do Drive. Qualquer tipo que o Drive aceite. */
export default function DocumentosContrato({ contratoId }: { contratoId: number }) {
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarDocumentosContrato(contratoId), [contratoId]));
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [falha, setFalha] = useState('');
  const campo = useRef<HTMLInputElement>(null);

  async function enviar(lista: FileList | File[]) {
    const arquivos = Array.from(lista);
    if (!arquivos.length || enviando) return;
    if (arquivos.length > 10) { setFalha('Envie no máximo 10 arquivos por vez.'); return; }
    const grande = arquivos.find((arquivo) => arquivo.size > LIMITE_ARQUIVO);
    if (grande) { setFalha(`"${grande.name}" ultrapassa o limite de 30 MB.`); return; }
    if (arquivos.reduce((total, arquivo) => total + arquivo.size, 0) > LIMITE_ARQUIVO) { setFalha('O envio deve ter no máximo 30 MB no total.'); return; }
    setEnviando(true); setFalha('');
    try { await api.enviarDocumentosContrato(contratoId, arquivos); recarregar(); }
    catch (e) { setFalha(mensagemErro(e)); }
    finally { setEnviando(false); if (campo.current) campo.current.value = ''; }
  }

  return <div className="flex flex-col gap-4">
    <div
      onDragOver={(evento) => { evento.preventDefault(); setArrastando(true); }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(evento) => { evento.preventDefault(); setArrastando(false); void enviar(evento.dataTransfer.files); }}
      className={`flex flex-col items-center gap-3 rounded-md border border-dashed px-4 py-6 text-center ${arrastando ? 'border-gold bg-soft' : 'border-line'}`}>
      <p className="m-0">{enviando ? 'Enviando documentos…' : 'Arraste os documentos aqui ou selecione do computador.'}</p>
      <input ref={campo} type="file" multiple hidden onChange={(evento) => { if (evento.target.files) void enviar(evento.target.files); }} />
      <button type="button" className="buttonSecondary" disabled={enviando} onClick={() => campo.current?.click()}><IconeAdicionar size={20} aria-hidden="true" />Selecionar arquivos</button>
    </div>
    {falha && <Aviso tom="erro" classe="my-0">{falha}</Aviso>}
    {erro && <Aviso tom="erro" classe="my-0">{erro}</Aviso>}
    {carregando && !dados && <p className="m-0 text-muted">Carregando documentos…</p>}
    {dados && (dados.itens.length === 0
      ? <p className="m-0 text-muted">Nenhum documento anexado ainda.</p>
      : <ul className="m-0 flex list-none flex-col gap-2 p-0">{dados.itens.map((item) => <li key={item.id} className="flex items-center justify-between gap-3">
        <span className="min-w-0 wrap-anywhere">{item.nome}<small className="block text-muted">{[tamanhoLegivel(item.tamanho), dataCivil(item.criado_em.slice(0, 10))].filter(Boolean).join(' · ')}</small></span>
        {item.url && /^https:\/\/(drive|docs)\.google\.com\//.test(item.url) && <a href={item.url} target="_blank" rel="noopener noreferrer" className="buttonGhost shrink-0"><IconeAbrirFora size={18} aria-hidden="true" />Abrir<span className="sr-only"> {item.nome}</span></a>}
      </li>)}</ul>)}
  </div>;
}
