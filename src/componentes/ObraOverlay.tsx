import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import {
  desligarObra,
  houveSinalDeIdaAosDevs,
  ligarObra,
  limparSinalDeIdaAosDevs,
} from '../servicos/obra';
import CenaObra from './CenaObra';

export const DURACAO_OBRA_MS = 5000;
export const SAIDA_OBRA_MS = 350;

// Intro do /devs: overlay fullscreen com glassmorphism sobre a página, que sai
// sozinho após alguns segundos (ou antes, no botão/Escape/clique fora).
// Dono único do som da obra: tenta ligar sozinho para quem veio do clique no
// rodapé (gesto que libera áudio); acesso direto por URL começa mudo, com botão
// "Ativar som". Ao sair (ou trocar de rota), o som para junto.
// SSR-safe: o primeiro render é sempre aberto e mudo, igual no servidor; áudio,
// timers, foco e teclado só em efeito/handler.
export default function ObraOverlay({ aoSair }: { aoSair: () => void }) {
  const [saindo, setSaindo] = useState(false);
  const [comSom, setComSom] = useState(false);
  const botaoPular = useRef<HTMLButtonElement>(null);
  const saindoRef = useRef(false);

  useEffect(() => {
    botaoPular.current?.focus();
    // Quem clicou no "Desenvolvedores" do rodapé já fez o gesto que o navegador
    // exige para liberar áudio: tenta ligar sozinho.
    if (houveSinalDeIdaAosDevs()) {
      void ligarObra().then((ligou) => setComSom(ligou));
      limparSinalDeIdaAosDevs();
    }
    const automatico = setTimeout(() => iniciarSaida(), DURACAO_OBRA_MS);
    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') iniciarSaida();
    };
    document.addEventListener('keydown', fecharComEscape);
    return () => {
      clearTimeout(automatico);
      document.removeEventListener('keydown', fecharComEscape);
      desligarObra();
      limparSinalDeIdaAosDevs();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function iniciarSaida() {
    if (saindoRef.current) return;
    saindoRef.current = true;
    setSaindo(true);
    setTimeout(aoSair, SAIDA_OBRA_MS);
  }

  async function alternarSom() {
    if (comSom) {
      desligarObra();
      setComSom(false);
      return;
    }
    setComSom(await ligarObra());
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Obra em andamento: levantando esta página"
      onClick={iniciarSaida}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-md transition-opacity duration-300 ${saindo ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        onClick={(evento) => evento.stopPropagation()}
        className={`w-full max-w-[560px] rounded-xl border border-gold/60 bg-paper/80 p-6 text-center shadow-2xl backdrop-blur-xl transition-all duration-300 animate-obra-chegar ${saindo ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <p className="eyebrow">Em obras</p>
        <h2 className="font-display text-2xl text-brand">Levantando esta página…</h2>
        <div className="mt-4">
          <CenaObra animada={!saindo} rotulo={comSom ? 'Casa em construção com furadeira, martelo e ambiente de canteiro' : 'Casa em construção'} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={alternarSom}
            aria-pressed={comSom}
            aria-label={comSom ? 'Desligar som da obra' : 'Ativar som da obra'}
            className="button inline-flex min-h-11 items-center gap-2"
          >
            {comSom ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
            {comSom ? 'Mudo' : 'Com som'}
          </button>
          <button
            ref={botaoPular}
            type="button"
            onClick={iniciarSaida}
            className="buttonSecondary inline-flex min-h-11 items-center gap-2"
          >
            <X size={18} aria-hidden="true" /> Pular
          </button>
        </div>
      </div>
    </div>
  );
}
