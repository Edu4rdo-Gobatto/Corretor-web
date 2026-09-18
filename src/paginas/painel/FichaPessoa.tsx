import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../servicos/api';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { codigoImovel, data, dataCivil, dinheiroExato, mensagemErro, rotulosStatusContato, rotulosStatusImovel } from '../../servicos/formato';
import { telefoneWhatsapp } from '../../servicos/contato';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import Dialogo from '../../componentes/Dialogo';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Etiqueta from '../../componentes/Etiqueta';
import { estilos } from '../../componentes/estilosPainel';
import EditorPessoa from './EditorPessoa';
import { formatarDocumento } from './Pessoas';

/** Ficha da pessoa com seus vínculos: imóveis de que é proprietária, contratos e comissões. */
export default function FichaPessoa() {
  const { id = '' } = useParams();
  const pessoaId = Number(id);
  const { corretor } = useSessao();
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const { dados: pessoa, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.obterPessoa(pessoaId), [pessoaId]));
  const vinculos = useDadosPainel(useCallback(async () => {
    const [imoveis, contratos, comissoes] = await Promise.all([
      api.listarFichas({ proprietario_id: pessoaId, limite: 20 }),
      api.listarContratos({ pessoa_id: pessoaId, limite: 20 }).catch(() => null),
      api.listarComissoes({ pessoa_id: pessoaId, limite: 20 }).catch(() => null),
    ]);
    return { imoveis, contratos, comissoes };
  }, [pessoaId]));
  async function alternarAtivo() {
    if (!pessoa) return;
    setOcupado(true);
    setErroAcao('');
    try {
      if (pessoa.ativo) await api.desativarPessoa(pessoa.id);
      else await api.salvarPessoa({ nome: pessoa.nome, telefone: pessoa.telefone ?? '', ativo: true }, pessoa.id, pessoa);
      setConfirmando(false);
      recarregar();
    } catch (causa) { setErroAcao(mensagemErro(causa)); }
    finally { setOcupado(false); }
  }
  const linha = (rotulo: string, valor: string | null | undefined) => <div><dt>{rotulo}</dt><dd>{valor || 'Não informado'}</dd></div>;
  return <>
    <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {pessoa && !erro && <>
      <CabecalhoPagina voltar={<Link to="/admin/pessoas">← Pessoas</Link>} titulo={pessoa.nome} descricao={`Pessoa #${pessoa.id} · ${pessoa.origem === 'SITE' ? 'chegou pelo site' : 'cadastro manual'} em ${data(pessoa.criado_em)}`}
        acoes={<>
          {pessoa.telefone && <a className="buttonSecondary" href={`https://wa.me/${telefoneWhatsapp(pessoa.telefone)}`} target="_blank" rel="noreferrer">WhatsApp ↗</a>}
          {(corretor?.cargo === 'ADMIN' || corretor?.id === pessoa.corretor_id) && <><button className="button" onClick={() => setEditando(true)}>Editar</button><button className="buttonGhost" onClick={() => setConfirmando(true)}>{pessoa.ativo ? 'Desativar' : 'Reativar'}</button></>}
        </>} />
      <section className={estilos.painel}>
        <div className="mb-4 flex flex-wrap gap-2"><Etiqueta tom={pessoa.status_contato === 'PENDENTE' ? 'atencao' : 'neutro'}>Contato {rotulosStatusContato[pessoa.status_contato].toLowerCase()}</Etiqueta>{!pessoa.ativo && <Etiqueta tom="alerta">Cadastro inativo</Etiqueta>}{pessoa.consentimento && <Etiqueta>Consentimento {pessoa.versao_termos ?? ''} em {pessoa.consentimento_em ? data(pessoa.consentimento_em) : ''}</Etiqueta>}</div>
        <dl className="m-0 grid gap-3.5 @min-[38rem]:grid-cols-2 [&_dd]:m-0 [&_dd]:[overflow-wrap:anywhere] [&_dt]:text-[13px] [&_dt]:uppercase [&_dt]:tracking-[0.08em] [&_dt]:text-muted">
          {linha('Telefone', pessoa.telefone)}{linha('E-mail', pessoa.email)}{linha('Tipo', pessoa.tipo_pessoa === 'PF' ? 'Pessoa física' : pessoa.tipo_pessoa === 'PJ' ? 'Pessoa jurídica' : null)}{linha('CPF / CNPJ', formatarDocumento(pessoa.cpf_cnpj))}
          {linha('Nascimento', pessoa.data_nascimento ? dataCivil(pessoa.data_nascimento) : null)}{linha('Endereço', pessoa.endereco)}{linha('Imóvel de interesse', pessoa.imovel_id ? `#${pessoa.imovel_id}` : null)}
          {linha('Banco', pessoa.banco_nome)}{linha('Agência / conta', pessoa.banco_agencia || pessoa.banco_conta ? `${pessoa.banco_agencia ?? ''} / ${pessoa.banco_conta ?? ''}` : null)}{linha('Pix', pessoa.chave_pix)}
        </dl>
        {pessoa.mensagem && <><h3 className="mt-6 text-base">Mensagem do primeiro contato</h3><p className="whitespace-pre-wrap">{pessoa.mensagem}</p></>}
        {pessoa.observacoes && <><h3 className="mt-6 text-base">Observações</h3><p className="whitespace-pre-wrap">{pessoa.observacoes}</p></>}
      </section>
      <EstadoCarregamento carregando={vinculos.carregando} erro={vinculos.erro} tentarNovamente={vinculos.recarregar} />
      {vinculos.dados && <div className="grid items-start gap-6 @2xl/principal:grid-cols-2 @5xl/principal:grid-cols-3">
        <section className={estilos.painel}><h2 className={estilos.tituloPainel}>Imóveis como proprietária</h2>{vinculos.dados.imoveis.itens.length ? <ul className="m-0 list-none p-0">{vinculos.dados.imoveis.itens.map((imovel) => <li key={imovel.id} className="border-b border-line py-2"><Link to={`/admin/imoveis/${imovel.id}/editar`}>{codigoImovel(imovel.id)} {imovel.titulo}</Link><small className="block text-muted">{rotulosStatusImovel[imovel.status]}</small></li>)}</ul> : <p className="muted">Nenhum imóvel vinculado.</p>}</section>
        <section className={estilos.painel}><h2 className={estilos.tituloPainel}>Contratos</h2>{vinculos.dados.contratos?.itens.length ? <ul className="m-0 list-none p-0">{vinculos.dados.contratos.itens.map((contrato) => <li key={contrato.id} className="border-b border-line py-2"><Link to={`/admin/contratos/${contrato.id}`}>{contrato.numero_contrato}</Link><small className="block text-muted">{contrato.locador_id === pessoa.id ? 'Locadora' : 'Locatária'} · {contrato.status === 'ATIVO' ? 'ativo' : 'encerrado'} · {dinheiroExato(contrato.valor_aluguel)}/mês</small></li>)}</ul> : <p className="muted">{vinculos.dados.contratos ? 'Nenhum contrato.' : 'Sem acesso aos contratos.'}</p>}</section>
        <section className={estilos.painel}><h2 className={estilos.tituloPainel}>Comissões</h2>{vinculos.dados.comissoes?.itens.length ? <ul className="m-0 list-none p-0">{vinculos.dados.comissoes.itens.map((comissao) => <li key={comissao.id} className="border-b border-line py-2"><Link to="/admin/comissoes">{comissao.tipo_operacao === 'VENDA' ? 'Venda' : 'Locação'} · {dinheiroExato(comissao.valor_total)}</Link><small className="block text-muted">saldo {dinheiroExato(comissao.saldo_pendente ?? comissao.valor_total)}</small></li>)}</ul> : <p className="muted">{vinculos.dados.comissoes ? 'Nenhuma comissão.' : 'Sem acesso às comissões.'}</p>}</section>
      </div>}
      {editando && <EditorPessoa pessoa={pessoa} aoFechar={() => setEditando(false)} aoSalvar={recarregar} />}
      {confirmando && <Dialogo titulo={pessoa.ativo ? 'Desativar cadastro' : 'Reativar cadastro'} tamanho="estreito" aoFechar={() => { if (!ocupado) setConfirmando(false); }}>
        <p>{pessoa.ativo ? `Desativar ${pessoa.nome}? O histórico será preservado. Pessoas em contratos ativos precisam permanecer ativas.` : `Reativar ${pessoa.nome}?`}</p>
        {erroAcao && <p role="alert" className="error">{erroAcao}</p>}
        <button className="button" disabled={ocupado} onClick={() => void alternarAtivo()}>{ocupado ? 'Salvando…' : pessoa.ativo ? 'Desativar' : 'Reativar'}</button>
      </Dialogo>}
    </>}
  </>;
}
