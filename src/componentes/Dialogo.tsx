import { useEffect, useId, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';
import { IconeFechar } from './Icones';
import Aviso from './Aviso';

export type TamanhoDialogo = 'estreito' | 'medio' | 'largo';

const larguras: Record<TamanhoDialogo, string> = {
  estreito: 'w-[min(480px,calc(100vw-32px))]',
  medio: 'w-[min(640px,calc(100vw-32px))]',
  largo: 'w-[min(880px,calc(100vw-32px))]',
};

const pilhaDialogos: HTMLDialogElement[] = [];
let estiloCorpo: { overflow: string; paddingRight: string } | null = null;
const estaNoTopo = (dialogo: HTMLDialogElement | null) => dialogo !== null && pilhaDialogos.filter((item) => item.isConnected && item.open).at(-1) === dialogo;

/**
 * Modal nativo. `m-auto` é obrigatório: o reset do Tailwind zera a margem que o navegador usa para centralizar o
 * `<dialog>`. O cabeçalho fica fixo e o corpo rola por dentro; o corpo é um container, então as grades do
 * formulário usam a largura do modal, não a da janela.
 */
export default function Dialogo({ titulo, aoFechar, children, tamanho = 'medio', fecharAoClicarFora = false, telaInteira = false, classe = '', alterado = false, ocupado = false }: { titulo: string; aoFechar: () => void; children: ReactNode; tamanho?: TamanhoDialogo; fecharAoClicarFora?: boolean; telaInteira?: boolean; classe?: string; alterado?: boolean; ocupado?: boolean }) {
  const referencia = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const armado = useRef(false);
  const [aviso, setAviso] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  function desarmar() { armado.current = false; setAviso(false); }
  function solicitarFechamento() {
    if (ocupado || !estaNoTopo(referencia.current)) return;
    desarmar();
    if (alterado) setConfirmando(true);
    else aoFechar();
  }
  function escapar() {
    if (ocupado || !estaNoTopo(referencia.current)) return;
    if (!alterado || armado.current) { desarmar(); aoFechar(); }
    else { armado.current = true; setAviso(true); }
  }
  useEffect(() => { if (!alterado) { armado.current = false; setAviso(false); } }, [alterado]);
  useEffect(() => {
    const elementoAnterior = document.activeElement as HTMLElement | null;
    const dialogo = referencia.current;
    // Trava a rolagem compensando a largura da barra: a página atrás não "pula" e o fundo cobre a tela inteira
    // (reservar a faixa com scrollbar-gutter deixava uma tira clara ao lado do fundo escuro).
    const larguraUtil = document.documentElement.clientWidth;
    const larguraBarra = larguraUtil > 0 ? window.innerWidth - larguraUtil : 0;
    const primeiro = pilhaDialogos.length === 0;
    if (primeiro) estiloCorpo = { overflow: document.body.style.overflow, paddingRight: document.body.style.paddingRight };
    dialogo?.showModal();
    if (dialogo) pilhaDialogos.push(dialogo);
    dialogo?.querySelector<HTMLElement>('[data-foco-inicial]')?.focus();
    if (primeiro) {
      document.body.style.overflow = 'hidden';
      if (larguraBarra > 0) document.body.style.paddingRight = `${larguraBarra}px`;
    }
    return () => {
      if (dialogo) {
        const indice = pilhaDialogos.indexOf(dialogo);
        if (indice >= 0) pilhaDialogos.splice(indice, 1);
        dialogo.close();
      }
      if (pilhaDialogos.length === 0 && estiloCorpo) {
        document.body.style.overflow = estiloCorpo.overflow;
        document.body.style.paddingRight = estiloCorpo.paddingRight;
        estiloCorpo = null;
      }
      if (elementoAnterior?.isConnected) elementoAnterior.focus();
    };
  }, []);
  function cancelar(evento: SyntheticEvent<HTMLDialogElement>) {
    evento.preventDefault();
    escapar();
  }
  return (
    <dialog ref={referencia} className={`overflow-hidden border-0 bg-paper p-0 text-ink shadow-2xl ${telaInteira ? 'dialogo-tela-inteira' : `m-auto max-h-[min(90dvh,960px)] rounded-xl ${larguras[tamanho]}`} ${classe}`} aria-labelledby={idTitulo} aria-modal="true" aria-busy={ocupado || undefined} onCancel={cancelar}
      onKeyDownCapture={(evento) => {
        // Filhos podem consumir teclas (p.ex. letra inválida ou seta de combobox), mas toda outra tecla desarma.
        if (estaNoTopo(referencia.current) && evento.key !== 'Escape' && evento.key !== 'Enter') desarmar();
      }}
      onKeyDown={(evento) => {
        if (evento.defaultPrevented || !estaNoTopo(referencia.current) || evento.nativeEvent.isComposing) return;
        if (evento.key === 'Escape') {
          evento.preventDefault();
          evento.stopPropagation();
          if (!evento.repeat) escapar();
        } else if (evento.key === 'Enter' && armado.current) {
          evento.preventDefault();
          evento.stopPropagation();
          if (!evento.repeat && !ocupado) { desarmar(); aoFechar(); }
        } else desarmar();
      }}
      onInputCapture={desarmar}
      onClickCapture={(evento) => {
        if (!estaNoTopo(referencia.current)) return;
        desarmar();
        if (evento.target instanceof Element && evento.target.closest('[data-fechar-dialogo]')) {
          evento.preventDefault(); evento.stopPropagation(); solicitarFechamento();
        }
      }}
      onClick={(evento) => {
        if (!fecharAoClicarFora || evento.target !== evento.currentTarget) return;
        const area = evento.currentTarget.getBoundingClientRect();
        if (evento.clientX < area.left || evento.clientX > area.right || evento.clientY < area.top || evento.clientY > area.bottom) solicitarFechamento();
      }}>
      <div className={`flex flex-col ${telaInteira ? 'h-full' : 'max-h-[min(90dvh,960px)]'}`}>
        <div className="flex shrink-0 items-start justify-between gap-4 px-8 pb-4 pt-7 max-[520px]:[.painel-ui_&]:px-[22px] max-[520px]:[.painel-ui_&]:pt-5">
          <h2 id={idTitulo} className="dialogo-titulo">{titulo}</h2>
          <button type="button" className="buttonGhost dialogo-fechar" aria-label="Fechar" disabled={ocupado} onClick={solicitarFechamento}><IconeFechar size={22} /></button>
        </div>
        <div data-rolagem className="@container min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pb-8 max-[520px]:px-[22px] max-[520px]:pb-6">
          {aviso && <Aviso tom="atencao" classe="mb-4">Há alterações não salvas. Pressione Esc ou Enter para descartar e sair.</Aviso>}
          {children}
        </div>
      </div>
      {confirmando && <Dialogo titulo="Descartar alterações?" tamanho="estreito" ocupado={ocupado} aoFechar={() => setConfirmando(false)}>
        <p>As alterações não salvas serão descartadas.</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" className="buttonSecondary" data-foco-inicial disabled={ocupado} onClick={() => setConfirmando(false)}>Continuar editando</button>
          <button type="button" className="button buttonPerigo" disabled={ocupado} onClick={() => { setConfirmando(false); aoFechar(); }}>Descartar e sair</button>
        </div>
      </Dialogo>}
    </dialog>
  );
}
