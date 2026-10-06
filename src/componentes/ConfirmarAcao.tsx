import { useState, type ReactNode } from 'react';
import Dialogo from './Dialogo';
import Aviso from './Aviso';
import { mensagemErro } from '../servicos/formato';

/** O consumidor fecha ou avança a confirmação depois do sucesso; erros mantêm o diálogo aberto. */
export default function ConfirmarAcao({ titulo, descricao, confirmar, aoConfirmar, aoFechar, ocupado = false, perigo = false }: { titulo: string; descricao: ReactNode; confirmar: string; aoConfirmar: () => void | Promise<void>; aoFechar: () => void; ocupado?: boolean; perigo?: boolean }) {
  const [executando, setExecutando] = useState(false);
  const [erro, setErro] = useState('');
  const bloqueado = ocupado || executando;
  async function executar() {
    if (bloqueado) return;
    setExecutando(true);
    setErro('');
    try { await aoConfirmar(); }
    catch (causa) { setErro(mensagemErro(causa)); }
    finally { setExecutando(false); }
  }
  return <Dialogo titulo={titulo} tamanho="estreito" ocupado={bloqueado} aoFechar={() => { if (!bloqueado) aoFechar(); }}>
    <div className="text-muted">{descricao}</div>
    {erro && <Aviso tom="erro">{erro}</Aviso>}
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button type="button" className="buttonGhost" data-foco-inicial disabled={bloqueado} onClick={aoFechar}>Cancelar</button>
      <button type="button" className={`button ${perigo ? 'buttonPerigo' : ''}`} disabled={bloqueado} aria-busy={bloqueado} onClick={() => void executar()}>{bloqueado ? 'Confirmando…' : confirmar}</button>
    </div>
  </Dialogo>;
}
