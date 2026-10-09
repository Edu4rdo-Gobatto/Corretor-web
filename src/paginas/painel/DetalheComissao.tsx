import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../servicos/api';
import { consultarRegistroDisponivel, idRegistro } from '../../servicos/registros';
import { dataCivil, dinheiroExato } from '../../servicos/formato';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import type { ParcelaComissao, RevisaoComissao } from '../../servicos/locacoes';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Aviso from '../../componentes/Aviso';
import AcaoIcone from '../../componentes/AcaoIcone';
import Tabela from '../../componentes/Tabela';
import { IconeArquivar, IconeDesarquivar, IconeEditar } from '../../componentes/Icones';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import Etiqueta from '../../componentes/Etiqueta';
import { estilos } from '../../componentes/estilosPainel';
import { DadosFicha, DadoFicha, GradePainel, SecaoPainel } from '../../componentes/BlocosPainel';
import { DialogoPagamento, EdicaoComissao } from './EditoresComissao';

export default function DetalheComissao() {
  const id = idRegistro(useParams().id);
  const [pagando, setPagando] = useState<ParcelaComissao>();
  const [editando, setEditando] = useState(false);
  const [alternando, setAlternando] = useState(false);
  const consulta = useDadosPainel(useCallback(() => id ? consultarRegistroDisponivel(() => api.obterComissao(id)) : Promise.resolve(null), [id]));
  const revisoes = useDadosPainel(useCallback(() => id ? consultarRegistroDisponivel(() => api.revisoesComissao(id)) : Promise.resolve(null), [id]));
  const recarregar = () => { consulta.recarregar(); revisoes.recarregar(); };
  const comissao = !consulta.carregando && !consulta.erro && consulta.dados?.id === id ? consulta.dados : null;
  const imovelId = comissao?.imovel_id;
  const pessoaId = comissao?.pessoa_id;
  const imovel = useDadosPainel(useCallback(() => imovelId ? consultarRegistroDisponivel(() => api.obterFicha(imovelId)) : Promise.resolve(null), [imovelId]));
  const pessoa = useDadosPainel(useCallback(() => pessoaId ? consultarRegistroDisponivel(() => api.obterPessoa(pessoaId)) : Promise.resolve(null), [pessoaId]));
  useAcoesPainel(useMemo(() => comissao ? [{ id: 'editar-comissao', rotulo: 'Editar comissão', executar: () => setEditando(true) }, { id: 'alternar-comissao', rotulo: comissao.ativo ? 'Arquivar comissão' : 'Reativar comissão', executar: () => setAlternando(true) }] : [], [comissao]));
  async function alternar() {
    if (!comissao) return;
    await api.atualizarComissao(comissao.id, comissao.versao_registro, { ativo: !comissao.ativo });
    setAlternando(false);
    recarregar();
  }
  const pago = comissao ? comissao.parcelas.filter((parcela) => parcela.ativo && parcela.status === 'PAGO').reduce((total, parcela) => total + BigInt(parcela.valor.replace('.', '')), 0n) : 0n;
  const decimal = (centavos: bigint) => `${centavos / 100n}.${String(centavos % 100n).padStart(2, '0')}`;
  const saldo = comissao ? comissao.parcelas.filter((parcela) => parcela.ativo && parcela.status !== 'PAGO').reduce((total, parcela) => total + BigInt(parcela.valor.replace('.', '')), 0n) : 0n;
  return <>
    <CabecalhoPagina voltar={{ to: '/admin/comissoes', rotulo: 'Voltar para comissões' }} titulo={comissao ? `Comissão #${comissao.id}` : 'Comissão'} descricao={comissao ? `${comissao.tipo_operacao === 'VENDA' ? 'Venda' : 'Locação'}, ${comissao.ativo ? 'ativa' : 'arquivada'}.` : undefined} acoes={comissao && <><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={`comissão #${comissao.id}`} aoClicar={() => setEditando(true)} /><AcaoIcone icone={comissao.ativo ? IconeArquivar : IconeDesarquivar} rotulo={comissao.ativo ? 'Arquivar' : 'Reativar'} tom={comissao.ativo ? 'perigo' : 'neutro'} contexto={`comissão #${comissao.id}`} aoClicar={() => setAlternando(true)} /></>} />
    <EstadoCarregamento carregando={consulta.carregando} erro={consulta.erro} tentarNovamente={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && !comissao && <Aviso>Comissão indisponível.</Aviso>}
    {comissao && !consulta.carregando && !consulta.erro && <>
      <section className="mb-4" aria-label="Valores da comissão"><GradePainel>
        <SecaoPainel titulo="Receita total"><strong className="block text-[28px] text-ink">{dinheiroExato(comissao.valor_total)}</strong></SecaoPainel>
        <SecaoPainel titulo="Recebido"><strong className="block text-[28px] text-ink">{dinheiroExato(comissao.valor_pago ?? decimal(pago))}</strong></SecaoPainel>
        <SecaoPainel titulo="Saldo"><strong className="block text-[28px] text-ink">{dinheiroExato(comissao.saldo_pendente ?? decimal(saldo))}</strong></SecaoPainel>
      </GradePainel>
      </section>
      <GradePainel colunas={2} classe="mb-4">
      <SecaoPainel titulo="Vínculos do negócio" ampla={!comissao.observacoes}>
        <DadosFicha colunas={2}>
          <DadoFicha rotulo="Imóvel"><Link to={`/admin/imoveis/${comissao.imovel_id}`}>{imovel.dados?.titulo ?? `Imóvel #${comissao.imovel_id}`}</Link></DadoFicha>
          <DadoFicha rotulo="Pessoa"><Link to={`/admin/pessoas/${comissao.pessoa_id}`}>{pessoa.dados?.nome ?? `Pessoa #${comissao.pessoa_id}`}</Link></DadoFicha>
          {comissao.contrato_id && <DadoFicha rotulo="Contrato"><Link to={`/admin/contratos/${comissao.contrato_id}`}>Contrato #{comissao.contrato_id}</Link></DadoFicha>}
        </DadosFicha>
        <EstadoCarregamento compacto carregando={imovel.carregando || pessoa.carregando} erro={imovel.erro || pessoa.erro} tentarNovamente={() => { imovel.recarregar(); pessoa.recarregar(); }} />
        {!imovel.carregando && !imovel.erro && !imovel.dados && <p className={estilos.dica}>A referência do imóvel está indisponível.</p>}
        {!pessoa.carregando && !pessoa.erro && !pessoa.dados && <p className={estilos.dica}>A referência da pessoa está indisponível.</p>}
      </SecaoPainel>
      {comissao.observacoes && <SecaoPainel titulo="Observações"><p className="m-0 whitespace-pre-wrap">{comissao.observacoes}</p></SecaoPainel>}
      </GradePainel>
      <SecaoPainel titulo="Parcelas">
        <Tabela<ParcelaComissao> itens={comissao.parcelas} chave={(parcela) => parcela.id} vazio="Sem parcelas." rotulo="Parcelas" colunas={[
          { titulo: 'Parcela', celula: (parcela) => parcela.numero_parcela },
          { titulo: 'Vencimento', celula: (parcela) => dataCivil(parcela.data_vencimento) },
          { titulo: 'Valor', celula: (parcela) => dinheiroExato(parcela.valor) },
          { titulo: 'Recebimento', celula: (parcela) => parcela.status === 'PAGO' ? <><strong>Pago</strong><p className={estilos.dica}>{parcela.pago_em ? new Date(parcela.pago_em).toLocaleString('pt-BR') : ''}</p><p className="whitespace-pre-wrap">{parcela.observacao_pagamento}</p></> : parcela.status === 'ATRASADO' ? 'Atrasado' : 'Pendente' },
          { titulo: 'Ações', acoes: true, celula: (parcela) => <div className={estilos.acoes}>{comissao.ativo && parcela.ativo && parcela.status !== 'PAGO' && <button className="buttonGhost" onClick={() => setPagando(parcela)}>Registrar recebimento</button>}</div> },
        ]} />
      </SecaoPainel>
      <SecaoPainel titulo="Histórico do plano" classe="mt-4">
        <EstadoCarregamento compacto carregando={revisoes.carregando} erro={revisoes.erro} tentarNovamente={revisoes.recarregar} />
        {revisoes.dados && !revisoes.carregando && !revisoes.erro && <Tabela<RevisaoComissao> itens={revisoes.dados.itens} chave={(revisao) => revisao.id} vazio="Sem revisões registradas." rotulo="Histórico do plano" colunas={[
          { titulo: 'Plano', celula: (revisao) => <>Plano {revisao.versao_plano}{revisao.versao_plano === comissao.versao_plano && <> <Etiqueta tom="neutro">Vigente</Etiqueta></>}</> },
          { titulo: 'Registro', celula: (revisao) => revisao.origem === 'MIGRACAO' ? 'Registro anterior ao histórico' : <>{new Date(revisao.criado_em).toLocaleString('pt-BR')}<small className="mt-1 block text-muted">{revisao.origem === 'CRIACAO' ? 'Criação' : 'Edição'}{revisao.autor_nome ? ` por ${revisao.autor_nome}` : ''}</small></> },
          { titulo: 'Vínculos', celula: (revisao) => <>{revisao.tipo_operacao === 'VENDA' ? 'Venda' : `Locação, contrato ${revisao.numero_contrato ?? `#${revisao.contrato_id}`}`}<small className="mt-1 block text-muted">{revisao.imovel_titulo}; {revisao.pessoa_nome}</small></> },
          { titulo: 'Receita', celula: (revisao) => <>{dinheiroExato(revisao.valor_total)}<small className="mt-1 block text-muted">{revisao.quantidade_parcelas} {revisao.quantidade_parcelas === 1 ? 'parcela' : 'parcelas'} a partir de {dataCivil(revisao.primeiro_vencimento)}</small></> },
        ]} />}
      </SecaoPainel>
      {editando && <EdicaoComissao key={`${comissao.id}-${comissao.versao_registro}`} comissao={comissao} nomes={{ imovel: imovel.dados?.titulo, pessoa: pessoa.dados?.nome, contrato: revisoes.dados?.itens.find((revisao) => revisao.versao_plano === comissao.versao_plano)?.numero_contrato ?? undefined }} aoFechar={() => setEditando(false)} aoSalvar={recarregar} />}
      {pagando && <DialogoPagamento parcela={pagando} aoFechar={() => setPagando(undefined)} aoSalvar={recarregar} />}
      {alternando && <ConfirmarAcao titulo={comissao.ativo ? 'Arquivar comissão?' : 'Reativar comissão?'} descricao={<p>{comissao.ativo
        ? 'A comissão sai da lista de ativas e novas baixas ficam bloqueadas. Recebimentos e histórico são preservados.'
        : 'A comissão volta à lista de ativas com o plano vigente. Imóvel, cliente e contrato precisam continuar ativos.'}</p>}
        confirmar={comissao.ativo ? 'Arquivar comissão' : 'Reativar comissão'} perigo={comissao.ativo} aoConfirmar={alternar} aoFechar={() => setAlternando(false)} />}
    </>}
  </>;
}
