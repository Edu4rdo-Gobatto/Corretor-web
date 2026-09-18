import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Referencia } from '../tipos';
import { mensagemErro } from '../servicos/formato';

interface Propriedades {
  rotulo: string;
  valor: Referencia | null;
  buscar: (termo: string) => Promise<Referencia[]>;
  aoEscolher: (valor: Referencia | null) => void;
  erro?: string;
  dica?: string;
  desabilitado?: boolean;
}

/** Campo de busca com sugestões: substitui os seletores paginados de imóvel, pessoa, contrato e corretor. */
export default function SeletorRegistro({ rotulo, valor, buscar, aoEscolher, erro, dica, desabilitado }: Propriedades) {
  const idLista = useId();
  const [termo, setTermo] = useState('');
  const [opcoes, setOpcoes] = useState<Referencia[]>([]);
  const [aberto, setAberto] = useState(false);
  const [ativa, setAtiva] = useState(-1);
  const [carregando, setCarregando] = useState(false);
  const [erroBusca, setErroBusca] = useState('');
  const [paraCima, setParaCima] = useState(false);
  const [alturaMaxima, setAlturaMaxima] = useState(256);
  const raiz = useRef<HTMLDivElement>(null);

  // Dentro de um Dialogo a lista não pode ser cortada pela área rolável: sem espaço abaixo, abre para cima.
  useLayoutEffect(() => {
    if (!aberto || !raiz.current) return;
    const caixa = raiz.current.getBoundingClientRect();
    const limites = raiz.current.closest('[data-rolagem]')?.getBoundingClientRect() ?? { top: 0, bottom: window.innerHeight };
    const abaixo = limites.bottom - caixa.bottom;
    const acima = caixa.top - limites.top;
    const subir = abaixo < 280 && acima > abaixo;
    setParaCima(subir);
    setAlturaMaxima(Math.max(120, Math.min(256, (subir ? acima : abaixo) - 12)));
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    let atual = true;
    setCarregando(true);
    setErroBusca('');
    const temporizador = window.setTimeout(() => {
      buscar(termo.trim())
        .then((resultado) => { if (atual) { setOpcoes(resultado); setAtiva(-1); } })
        .catch((motivo) => { if (atual) setErroBusca(mensagemErro(motivo)); })
        .finally(() => { if (atual) setCarregando(false); });
    }, 250);
    return () => { atual = false; window.clearTimeout(temporizador); };
  }, [aberto, termo, buscar]);

  function escolher(opcao: Referencia) {
    aoEscolher(opcao);
    setTermo('');
    setAberto(false);
  }
  function limpar() {
    aoEscolher(null);
    setTermo('');
    setAberto(true);
  }
  function teclado(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'ArrowDown') { evento.preventDefault(); setAberto(true); setAtiva((indice) => Math.min(indice + 1, opcoes.length - 1)); }
    if (evento.key === 'ArrowUp') { evento.preventDefault(); setAtiva((indice) => Math.max(indice - 1, 0)); }
    if (evento.key === 'Enter' && aberto && ativa >= 0 && opcoes[ativa]) { evento.preventDefault(); escolher(opcoes[ativa]); }
    if (evento.key === 'Escape') setAberto(false);
  }

  return (
    <div ref={raiz} className="relative grid gap-[7px]" onBlur={(evento) => { if (!raiz.current?.contains(evento.relatedTarget as Node | null)) setAberto(false); }}>
      <label className="font-semibold">{rotulo}
        <div className="relative mt-[6px]">
          <input
            role="combobox" aria-expanded={aberto} aria-controls={idLista} aria-autocomplete="list" aria-invalid={!!erro}
            value={valor && !aberto ? valor.nome : termo} disabled={desabilitado} placeholder="Digite para buscar"
            onChange={(evento) => { setTermo(evento.target.value); setAberto(true); }}
            onFocus={() => setAberto(true)} onKeyDown={teclado}
          />
          {valor && !desabilitado && (
            <button type="button" aria-label={`Limpar ${rotulo.toLowerCase()}`} onClick={limpar} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded border-0 bg-transparent text-muted hover:text-ink">
              <X size={16} />
            </button>
          )}
        </div>
      </label>
      {aberto && (
        <ul id={idLista} role="listbox" data-direcao={paraCima ? 'acima' : 'abaixo'} style={{ maxHeight: alturaMaxima }} className={`absolute z-20 m-0 w-full list-none overflow-auto rounded border border-line bg-paper p-1 shadow-lg ${paraCima ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {carregando && <li className="px-3 py-2 text-sm text-muted">Buscando…</li>}
          {erroBusca && <li className="px-3 py-2 text-sm text-error" role="alert">{erroBusca}</li>}
          {!carregando && !erroBusca && !opcoes.length && <li className="px-3 py-2 text-sm text-muted">Nenhum registro encontrado.</li>}
          {opcoes.map((opcao, indice) => (
            <li key={opcao.id}>
              <button type="button" role="option" aria-selected={valor?.id === opcao.id} onMouseDown={(evento) => evento.preventDefault()} onClick={() => escolher(opcao)} className={`block w-full rounded border-0 px-3 py-2 text-left text-sm ${indice === ativa ? 'bg-soft' : 'bg-transparent'} hover:bg-soft`}>
                {opcao.nome} <span className="text-muted">#{opcao.id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {erro ? <span className="m-0 text-[13px] text-error">{erro}</span> : dica ? <span className="text-[13px] font-normal text-muted">{dica}</span> : null}
    </div>
  );
}
