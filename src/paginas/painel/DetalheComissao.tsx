import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../servicos/api';
import { consultarRegistroDisponivel, idRegistro } from '../../servicos/registros';
import { dataCivil, dinheiroExato } from '../../servicos/formato';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import type { ParcelaComissao } from '../../servicos/locacoes';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Aviso from '../../componentes/Aviso';
import AcaoIcone from '../../componentes/AcaoIcone';
import Tabela from '../../componentes/Tabela';
import { IconeEditar } from '../../componentes/Icones';
import { estilos } from '../../componentes/estilosPainel';
import { DialogoPagamento, EdicaoComissao } from './EditoresComissao';

export default function DetalheComissao() {
  const id = idRegistro(useParams().id);
  const [pagando, setPagando] = useState<ParcelaComissao>();
  const [editando, setEditando] = useState(false);
  const consulta = useDadosPainel(useCallback(() => id ? consultarRegistroDisponivel(() => api.obterComissao(id)) : Promise.resolve(null), [id]));
  const comissao = !consulta.carregando && !consulta.erro && consulta.dados?.id === id ? consulta.dados : null;
  const imovelId = comissao?.imovel_id;
  const pessoaId = comissao?.pessoa_id;
  const imovel = useDadosPainel(useCallback(() => imovelId ? consultarRegistroDisponivel(() => api.obterFicha(imovelId)) : Promise.resolve(null), [imovelId]));
  const pessoa = useDadosPainel(useCallback(() => pessoaId ? consultarRegistroDisponivel(() => api.obterPessoa(pessoaId)) : Promise.resolve(null), [pessoaId]));
  useAcoesPainel(useMemo(() => comissao ? [{ id: 'editar-comissao', rotulo: 'Editar comissão', executar: () => setEditando(true) }] : [], [comissao]));
  const pago = comissao ? comissao.parcelas.filter((parcela) => parcela.ativo && parcela.status === 'PAGO').reduce((total, parcela) => total + BigInt(parcela.valor.replace('.', '')), 0n) : 0n;
  const decimal = (centavos: bigint) => `${centavos / 100n}.${String(centavos % 100n).padStart(2, '0')}`;
  const saldo = comissao ? comissao.parcelas.filter((parcela) => parcela.ativo && parcela.status !== 'PAGO').reduce((total, parcela) => total + BigInt(parcela.valor.replace('.', '')), 0n) : 0n;
  return <>
    <CabecalhoPagina voltar={{ to: '/admin/comissoes', rotulo: 'Voltar para comissões' }} titulo={comissao ? `Comissão #${comissao.id}` : 'Comissão'} descricao={comissao ? `${comissao.tipo_operacao === 'VENDA' ? 'Venda' : 'Locação'}, ${comissao.ativo ? 'ativa' : 'arquivada'}.` : undefined} acoes={comissao && <AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={`comissão #${comissao.id}`} aoClicar={() => setEditando(true)} />} />
    <EstadoCarregamento carregando={consulta.carregando} erro={consulta.erro} tentarNovamente={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && !comissao && <Aviso>Comissão indisponível.</Aviso>}
    {comissao && !consulta.carregando && !consulta.erro && <>
      <section className="indicadores-painel mb-6" aria-label="Valores da comissão">
        <div className="rounded border border-line bg-paper p-5"><span className="text-[16px] text-muted">Receita total</span><strong className="my-3 block text-[28px] text-ink">{dinheiroExato(comissao.valor_total)}</strong></div>
        <div className="rounded border border-line bg-paper p-5"><span className="text-[16px] text-muted">Recebido</span><strong className="my-3 block text-[28px] text-ink">{dinheiroExato(comissao.valor_pago ?? decimal(pago))}</strong></div>
        <div className="rounded border border-line bg-paper p-5"><span className="text-[16px] text-muted">Saldo</span><strong className="my-3 block text-[28px] text-ink">{dinheiroExato(comissao.saldo_pendente ?? decimal(saldo))}</strong></div>
      </section>
      <section className={estilos.painel}>
        <h2 className={estilos.tituloPainel}>Vínculos do negócio</h2>
        <dl className="ficha-dados">
          <div><dt>Imóvel</dt><dd><Link to={`/admin/imoveis/${comissao.imovel_id}`}>{imovel.dados?.titulo ?? `Imóvel #${comissao.imovel_id}`}</Link></dd></div>
          <div><dt>Pessoa</dt><dd><Link to={`/admin/pessoas/${comissao.pessoa_id}`}>{pessoa.dados?.nome ?? `Pessoa #${comissao.pessoa_id}`}</Link></dd></div>
          {comissao.contrato_id && <div><dt>Contrato</dt><dd><Link to={`/admin/contratos/${comissao.contrato_id}`}>Contrato #{comissao.contrato_id}</Link></dd></div>}
        </dl>
        <EstadoCarregamento compacto carregando={imovel.carregando || pessoa.carregando} erro={imovel.erro || pessoa.erro} tentarNovamente={() => { imovel.recarregar(); pessoa.recarregar(); }} />
        {!imovel.carregando && !imovel.erro && !imovel.dados && <p className={estilos.dica}>A referência do imóvel está indisponível.</p>}
        {!pessoa.carregando && !pessoa.erro && !pessoa.dados && <p className={estilos.dica}>A referência da pessoa está indisponível.</p>}
        {comissao.observacoes && <p className="whitespace-pre-wrap">{comissao.observacoes}</p>}
      </section>
      <section><h2 className={estilos.tituloPainel}>Parcelas</h2>
        <Tabela<ParcelaComissao> itens={comissao.parcelas} chave={(parcela) => parcela.id} vazio="Sem parcelas." rotulo="Parcelas" colunas={[
          { titulo: 'Parcela', celula: (parcela) => parcela.numero_parcela },
          { titulo: 'Vencimento', celula: (parcela) => dataCivil(parcela.data_vencimento) },
          { titulo: 'Valor', celula: (parcela) => dinheiroExato(parcela.valor) },
          { titulo: 'Recebimento', celula: (parcela) => parcela.status === 'PAGO' ? <><strong>Pago</strong><p className={estilos.dica}>{parcela.pago_em ? new Date(parcela.pago_em).toLocaleString('pt-BR') : ''}</p><p className="whitespace-pre-wrap">{parcela.observacao_pagamento}</p></> : parcela.status === 'ATRASADO' ? 'Atrasado' : 'Pendente' },
          { titulo: 'Ações', acoes: true, celula: (parcela) => <div className={estilos.acoes}>{comissao.ativo && parcela.ativo && parcela.status !== 'PAGO' && <button className="buttonGhost" onClick={() => setPagando(parcela)}>Registrar recebimento</button>}</div> },
        ]} />
      </section>
      {editando && <EdicaoComissao key={comissao.id} comissao={comissao} aoFechar={() => setEditando(false)} aoSalvar={consulta.recarregar} />}
      {pagando && <DialogoPagamento parcela={pagando} aoFechar={() => setPagando(undefined)} aoSalvar={consulta.recarregar} />}
    </>}
  </>;
}
