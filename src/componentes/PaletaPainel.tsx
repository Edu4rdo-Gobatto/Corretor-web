import { useEffect, useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComandosPainel, type AcaoPainel } from '../hooks/useComandosPainel';
import Campo from './Campo';
import Dialogo from './Dialogo';

export type DestinoPainel = { to: string; nome: string };
const comparar = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');

export default function PaletaPainel({ destinos, aoFechar }: { destinos: DestinoPainel[]; aoFechar: () => void }) {
  const navegar = useNavigate();
  const acoes = useComandosPainel();
  const [busca, setBusca] = useState('');
  const [indice, setIndice] = useState(0);
  const id = useId();
  const opcoes = useMemo(() => {
    const itens: AcaoPainel[] = [
      ...destinos.map((destino) => ({ id: destino.to, rotulo: destino.nome, executar: () => navegar(destino.to) })),
      ...acoes,
    ];
    const termo = comparar(busca.trim());
    return itens.filter((item, posicao) => itens.findIndex((outro) => outro.id === item.id) === posicao && comparar(`${item.rotulo} ${item.palavrasChave ?? ''}`).includes(termo));
  }, [destinos, acoes, navegar, busca]);
  const atual = Math.min(indice, Math.max(0, opcoes.length - 1));
  const idAtivo = opcoes.length ? `${id}-opcao-${atual}` : undefined;
  useEffect(() => { if (idAtivo) document.getElementById(idAtivo)?.scrollIntoView({ block: 'nearest' }); }, [idAtivo]);
  function executar(opcao: AcaoPainel) {
    aoFechar();
    // O dialog precisa desmontar e restaurar o foco antes de executar ações que focam a página.
    requestAnimationFrame(() => opcao.executar());
  }
  return <Dialogo titulo="Comandos do painel" aoFechar={aoFechar} fecharAoClicarFora>
    <Campo rotulo="Buscar destino ou ação" dica="Use as setas para escolher e Enter para abrir.">
      <input data-foco-inicial autoComplete="off" value={busca} role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls={`${id}-lista`} aria-activedescendant={idAtivo}
        onChange={(evento) => { setBusca(evento.target.value); setIndice(0); }}
        onKeyDown={(evento) => {
          if (evento.nativeEvent.isComposing || evento.repeat) return;
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(evento.key)) {
            evento.preventDefault();
            if (!opcoes.length) return;
            setIndice(evento.key === 'Home' ? 0 : evento.key === 'End' ? opcoes.length - 1 : (atual + (evento.key === 'ArrowDown' ? 1 : -1) + opcoes.length) % opcoes.length);
          } else if (evento.key === 'Enter') {
            evento.preventDefault();
            if (opcoes[atual]) executar(opcoes[atual]);
          }
        }} />
    </Campo>
    <div id={`${id}-lista`} role="listbox" aria-label="Destinos e ações" className="paleta-opcoes">
      {opcoes.map((opcao, posicao) => <button key={opcao.id} id={`${id}-opcao-${posicao}`} type="button" role="option" aria-selected={posicao === atual} tabIndex={-1}
        onMouseDown={(evento) => evento.preventDefault()} onMouseMove={() => setIndice(posicao)} onClick={() => executar(opcao)}>{opcao.rotulo}</button>)}
    </div>
    {!opcoes.length && <p className="campo-dica" role="status">Nenhum comando encontrado. Tente outra busca.</p>}
  </Dialogo>;
}
