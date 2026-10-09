import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import { estilos } from '../../componentes/estilosPainel';
import Paginacao from '../../componentes/Paginacao';
import SeletorFiltro from '../../componentes/SeletorFiltro';
import Tabela from '../../componentes/Tabela';
import { IconeAdicionar } from '../../componentes/Icones';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { api } from '../../servicos/api';
import { dinheiroExato, plural } from '../../servicos/formato';
import type { Comissao, Contrato, TipoOperacao } from '../../servicos/locacoes';

import { EditorComissao } from './EditoresComissao';

export default function Comissoes({ contrato }: { contrato?: Contrato }) {
  const [pagina, setPagina] = useState(1);
  const [ativas, setAtivas] = useState(true);
  const [operacao, setOperacao] = useState<'' | TipoOperacao>('');
  const [criando, setCriando] = useState(false);
  const contratoId = contrato?.id;
  useAcoesPainel(useMemo(() => !contrato || contrato.ativo ? [{ id: 'nova-comissao', rotulo: 'Registrar comissão', executar: () => setCriando(true), palavrasChave: 'receita intermediação' }] : [], [contrato]));
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarComissoes({ pagina, limite: 15, ativo: ativas, tipo_operacao: operacao || undefined, contrato_id: contratoId }), [pagina, ativas, operacao, contratoId]));
  return <>
    {contrato
      ? <div className="bloco-painel-cabecalho mb-4"><div className="min-w-0"><h2 className="m-0 text-[22px]">Comissões deste contrato</h2><p className="mb-0 mt-1 text-base text-muted">Receita de intermediação da imobiliária.</p></div>{contrato.ativo && <button className="button ml-auto" onClick={() => setCriando(true)}><IconeAdicionar size={20} aria-hidden="true" />Registrar comissão</button>}</div>
      : <CabecalhoPagina titulo="Comissões" descricao="Receita de intermediação da imobiliária." acoes={<button className="button" onClick={() => setCriando(true)}><IconeAdicionar size={20} aria-hidden="true" />Registrar comissão</button>} />}
    <div className={estilos.barraFiltros}>
      {!contrato && <SeletorFiltro rotulo="Operação" valor={operacao} opcoes={[{ valor: '' as const, rotulo: 'Todas' }, { valor: 'LOCACAO' as const, rotulo: 'Locação' }, { valor: 'VENDA' as const, rotulo: 'Venda' }]} aoMudar={(valor) => { setOperacao(valor); setPagina(1); }} />}
      <SeletorFiltro rotulo="Situação" valor={ativas ? 'true' : 'false'} opcoes={[{ valor: 'true' as const, rotulo: 'Ativas' }, { valor: 'false' as const, rotulo: 'Arquivadas' }]} aoMudar={(valor) => { setAtivas(valor === 'true'); setPagina(1); }} />
    </div>
    <EstadoCarregamento compacto carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !carregando && !erro && (
      <section>
        <Tabela<Comissao> itens={dados.itens} chave={(comissao) => comissao.id} vazio="Nenhuma comissão registrada." rotulo="Comissões" linkLinha={(comissao) => `/admin/comissoes/${comissao.id}`} colunas={[
          { titulo: 'Operação', celula: (comissao) => <><Link to={`/admin/comissoes/${comissao.id}`}><strong>{comissao.tipo_operacao === 'VENDA' ? 'Venda' : 'Locação'} #{comissao.id}</strong></Link>{comissao.observacoes && <small className="mt-1 block max-w-[200px] truncate text-muted">{comissao.observacoes}</small>}</> },
          { titulo: 'Receita total', celula: (comissao) => dinheiroExato(comissao.valor_total) },
          { titulo: 'Recebido', celula: (comissao) => dinheiroExato(comissao.valor_pago ?? '0.00') },
          { titulo: 'Saldo', celula: (comissao) => dinheiroExato(comissao.saldo_pendente ?? comissao.valor_total) },
          { titulo: 'Parcelas', celula: (comissao) => plural(comissao.quantidade_parcelas, 'parcela', 'parcelas') },
        ]} />
        <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={(valor) => { setPagina(valor); }} />
      </section>
    )}

    {criando && <EditorComissao contrato={contrato} aoFechar={() => setCriando(false)} aoSalvar={recarregar} />}
  </>;
}
