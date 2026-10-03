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
  const idCampo = `${idLista}-campo`;
  const [termo, setTermo] = useState('');
  const [opcoes, setOpcoes] = useState<Referencia[]>([]);
  const [aberto, setAberto] = useState(false);
  const [ativa, setAtiva] = useState(-1);
  const [carregando, setCarregando] = useState(false);
  const [erroBusca, setErroBusca] = useState('');
  const [paraCima, setParaCima] = useState(false);
  const [alturaMaxima, setAlturaMaxima] = useState(256);
  const raiz = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);

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
    setOpcoes([]);
    setAtiva(-1);
    const temporizador = window.setTimeout(() => {
      buscar(termo.trim())
        .then((resultado) => { if (atual) { setOpcoes(resultado); setAtiva(-1); } })
        .catch((motivo) => { if (atual) setErroBusca(mensagemErro(motivo)); })
        .finally(() => { if (atual) setCarregando(false); });
    }, 250);
    return () => { atual = false; window.clearTimeout(temporizador); };
  }, [aberto, termo, buscar]);

  function escolher(opcao: Referencia) {
    if (carregando || erroBusca) return;
    aoEscolher(opcao);
    setTermo('');
    setAberto(false);
  }
  function limpar() {
    aoEscolher(null);
    setTermo('');
    if (!aberto || termo) {
      setOpcoes([]);
      setAtiva(-1);
      setCarregando(true);
    }
    setAberto(true);
    entrada.current?.focus();
  }
  function teclado(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'ArrowDown') { evento.preventDefault(); setAberto(true); if (!carregando && !erroBusca) setAtiva((indice) => Math.min(indice + 1, opcoes.length - 1)); }
    if (evento.key === 'ArrowUp') { evento.preventDefault(); if (!carregando && !erroBusca) setAtiva((indice) => Math.max(indice - 1, 0)); }
    if (evento.key === 'Enter' && aberto) { evento.preventDefault(); if (!carregando && !erroBusca && ativa >= 0 && opcoes[ativa]) escolher(opcoes[ativa]); }
    if (evento.key === 'Escape') setAberto(false);
  }

  return (
    <div ref={raiz} className="relative grid gap-[7px]" onBlur={(evento) => { if (!raiz.current?.contains(evento.relatedTarget as Node | null)) setAberto(false); }}>
      <label htmlFor={idCampo} className="font-semibold">{rotulo}</label>
        <div className="relative">
          <input
            ref={entrada}
            id={idCampo} role="combobox" aria-expanded={aberto} aria-controls={idLista} aria-autocomplete="list" aria-invalid={!!erro}
            aria-describedby={erro || dica ? `${idLista}-descricao` : undefined} aria-activedescendant={aberto && !carregando && !erroBusca && ativa >= 0 && opcoes[ativa] ? `${idLista}-opcao-${opcoes[ativa].id}` : undefined}
            value={valor && !aberto ? valor.nome : termo} disabled={desabilitado} placeholder="Digite para buscar"
            onChange={(evento) => { setTermo(evento.target.value); setOpcoes([]); setAtiva(-1); setCarregando(true); setErroBusca(''); setAberto(true); }}
            onFocus={() => { if (!aberto) { setOpcoes([]); setAtiva(-1); setCarregando(true); setAberto(true); } }} onKeyDown={teclado}
          />
          {valor && !desabilitado && (
            <button type="button" aria-label={`Limpar ${rotulo.toLowerCase()}`} onClick={limpar} className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded border-0 bg-transparent text-muted hover:text-ink">
              <X size={16} />
            </button>
          )}
        </div>
      {aberto && (
        <ul id={idLista} role="listbox" data-direcao={paraCima ? 'acima' : 'abaixo'} style={{ maxHeight: alturaMaxima }} className={`absolute z-20 m-0 w-full list-none overflow-auto rounded border border-line bg-paper p-1 shadow-lg ${paraCima ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {carregando && <li className="px-3 py-2 text-sm text-muted">Buscando…</li>}
          {erroBusca && <li className="px-3 py-2 text-sm text-error" role="alert">{erroBusca}</li>}
          {!carregando && !erroBusca && !opcoes.length && <li className="px-3 py-2 text-sm text-muted">Nenhum registro encontrado.</li>}
          {!carregando && !erroBusca && opcoes.map((opcao, indice) => (
            <li key={opcao.id}>
              <button id={`${idLista}-opcao-${opcao.id}`} type="button" role="option" aria-selected={valor?.id === opcao.id} onMouseDown={(evento) => evento.preventDefault()} onClick={() => escolher(opcao)} className={`block min-h-11 w-full rounded border-0 px-3 py-2 text-left text-sm ${indice === ativa ? 'bg-soft' : 'bg-transparent'} hover:bg-soft`}>
                {opcao.nome} <span className="text-muted">#{opcao.id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {erro ? <span id={`${idLista}-descricao`} className="m-0 text-[13px] text-error">{erro}</span> : dica ? <span id={`${idLista}-descricao`} className="text-[13px] font-normal text-muted">{dica}</span> : null}
    </div>
  );
}
