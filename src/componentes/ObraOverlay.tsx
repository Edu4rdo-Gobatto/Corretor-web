import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { desligarObra, ligarObra, limparSinalDeIdaAosDevs } from '../servicos/obra';
import CenaObra from './CenaObra';
import Dialogo from './Dialogo';

export const DURACAO_OBRA_MS = 5000;
export const SAIDA_OBRA_MS = 350;

export default function ObraOverlay({ aoSair }: { aoSair: () => void }) {
  const [saindo, setSaindo] = useState(false);
  const [comSom, setComSom] = useState(false);
  const [ligando, setLigando] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const ativo = useRef(false);
  const montagem = useRef(0);
  const saindoRef = useRef(false);
  const saida = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const finalizar = useRef(aoSair);
  finalizar.current = aoSair;

  const iniciarSaida = useCallback(() => {
    if (!ativo.current || saindoRef.current) return;
    saindoRef.current = true;
    desligarObra();
    setComSom(false);
    setSaindo(true);
    saida.current = setTimeout(() => finalizar.current(), SAIDA_OBRA_MS);
  }, []);

  const ativarSom = useCallback(async () => {
    const inicio = montagem.current;
    setLigando(true);
    const ligou = await ligarObra();
    if (!ativo.current || saindoRef.current || inicio !== montagem.current) return;
    setComSom(ligou);
    setBloqueado(!ligou);
    setLigando(false);
  }, []);

  useEffect(() => {
    ativo.current = true;
    montagem.current += 1;
    saindoRef.current = false;
    // Tenta em toda entrada. O navegador decide se permite autoplay com som;
    // se recusar, o mesmo botão permite repetir dentro de um gesto explícito.
    void ativarSom();
    limparSinalDeIdaAosDevs();
    const etapas = [setTimeout(() => setEtapa(1), 1000), setTimeout(() => setEtapa(2), 3500)];
    const automatico = setTimeout(iniciarSaida, DURACAO_OBRA_MS);
    return () => {
      ativo.current = false;
      etapas.forEach(clearTimeout);
      clearTimeout(automatico);
      clearTimeout(saida.current);
      desligarObra();
      limparSinalDeIdaAosDevs();
    };
  }, [ativarSom, iniciarSaida]);

  return (
    <Dialogo titulo="Levantando esta página…" aoFechar={iniciarSaida} fecharAoClicarFora
      classe={`dialogo-obra transition-opacity duration-300 ${saindo ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        <p className="mb-1 text-sm text-muted">Uma pequena obra antes de conhecer quem fez.</p>
        <CenaObra animada={!saindo} rotulo="Casa em construção com um operário de capacete" />
        <div className="obra-etapas mb-5 flex items-center justify-center gap-2 text-sm text-brand" aria-hidden="true">
          <span className={etapa === 0 ? 'font-semibold' : 'text-muted'}>Alicerce</span><span>·</span>
          <span className={etapa === 1 ? 'font-semibold' : 'text-muted'}>Tijolo por tijolo</span><span>·</span>
          <span className={etapa === 2 ? 'font-semibold' : 'text-muted'}>Pronto!</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" disabled={saindo || ligando} aria-pressed={comSom}
            aria-label={comSom ? 'Desligar som da obra' : 'Ativar som da obra'}
            onClick={() => { if (comSom) { desligarObra(); setComSom(false); } else { void ativarSom(); } }}
            className="buttonSecondary inline-flex min-h-11 items-center gap-2">
            {comSom ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
            {comSom ? 'Mudo' : 'Com som'}
          </button>
          <button type="button" onClick={iniciarSaida} className="button inline-flex min-h-11 items-center gap-2">
            Pular <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        {bloqueado && <p role="status" className="mt-3 text-sm text-muted">O som não pôde tocar. Você pode tentar novamente.</p>}
      </div>
    </Dialogo>
  );
}
