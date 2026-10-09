import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../servicos/api';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { codigoImovel, data, dataCivil, dinheiroExato, mensagemErro, rotulosStatusContato, rotulosStatusImovel } from '../../servicos/formato';
import { telefoneWhatsapp } from '../../servicos/contato';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import AcaoIcone from '../../componentes/AcaoIcone';
import Aviso from '../../componentes/Aviso';
import Tabela from '../../componentes/Tabela';
import { IconeEditar, IconeArquivar, IconeDesarquivar, IconeWhatsapp } from '../../componentes/Icones';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import { idRegistro, consultarRegistroDisponivel } from '../../servicos/registros';
import { podeEditarPessoa } from '../../servicos/pessoas';
import { urlFichaCorretor } from '../../servicos/urls';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Etiqueta from '../../componentes/Etiqueta';
import { DadosFicha, DadoFicha, GradePainel, SecaoPainel } from '../../componentes/BlocosPainel';
import EditorPessoa from './EditorPessoa';
import { formatarDocumento } from './Pessoas';

/** Ficha da pessoa com seus vínculos: imóveis de que é proprietária, contratos e comissões. */
export default function FichaPessoa() {
  const pessoaId = idRegistro(useParams().id);
  const { corretor } = useSessao();
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const { dados: registro, carregando, erro, recarregar } = useDadosPainel(useCallback(() => pessoaId ? consultarRegistroDisponivel(() => api.obterPessoa(pessoaId)) : Promise.resolve(null), [pessoaId]));
  const pessoa = !carregando && !erro && registro?.id === pessoaId ? registro : null;
  const podeEditar = podeEditarPessoa(corretor, pessoa ?? { corretor_id: 0 });
  useAcoesPainel(useMemo(() => pessoa && podeEditar && !ocupado ? [{ id: 'editar-pessoa', rotulo: 'Editar pessoa', executar: () => setEditando(true) }] : [], [pessoa, podeEditar, ocupado]));
  const vinculos = useDadosPainel(useCallback(async () => {
    if (!pessoaId) return null;
    const [imoveis, contratos, comissoes] = await Promise.all([
      api.listarFichas({ proprietario_id: pessoaId, limite: 20 }),
      consultarRegistroDisponivel(() => api.listarContratos({ pessoa_id: pessoaId, limite: 20 })),
      consultarRegistroDisponivel(() => api.listarComissoes({ pessoa_id: pessoaId, limite: 20 })),
    ]);
    return { imoveis, contratos, comissoes };
  }, [pessoaId]));
  async function alternarAtivo() {
    if (!pessoa || !podeEditar || ocupado) return;
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
  return <>
      <CabecalhoPagina voltar={{ to: '/admin/pessoas', rotulo: 'Voltar para pessoas' }} titulo={pessoa?.nome ?? 'Pessoa'} descricao={pessoa ? `Pessoa #${pessoa.id} ${pessoa.origem === 'SITE' ? 'chegou pelo site' : 'cadastro manual'} em ${data(pessoa.criado_em)}` : undefined}
        acoes={pessoa && <>
          {pessoa.telefone && <AcaoIcone icone={IconeWhatsapp} rotulo="WhatsApp" contexto={pessoa.nome} href={`https://wa.me/${telefoneWhatsapp(pessoa.telefone)}`} target="_blank" />}
          {podeEditar && <><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={pessoa.nome} aoClicar={() => setEditando(true)} /><AcaoIcone icone={pessoa.ativo ? IconeArquivar : IconeDesarquivar} rotulo={pessoa.ativo ? 'Desativar' : 'Reativar'} contexto={pessoa.nome} tom={pessoa.ativo ? 'perigo' : 'neutro'} aoClicar={() => { setErroAcao(''); setConfirmando(true); }} /></>}
        </>} />
    <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {!carregando && !erro && !pessoa && <Aviso>Pessoa indisponível.</Aviso>}
    {pessoa && !erro && <>
      <GradePainel>
        <SecaoPainel titulo="Dados pessoais e contato"><DadosFicha colunas={2}>
          <DadoFicha rotulo="Telefone">{pessoa.telefone}</DadoFicha><DadoFicha rotulo="E-mail">{pessoa.email}</DadoFicha>
          <DadoFicha rotulo="Tipo">{pessoa.tipo_pessoa === 'PF' ? 'Pessoa física' : pessoa.tipo_pessoa === 'PJ' ? 'Pessoa jurídica' : null}</DadoFicha><DadoFicha rotulo="CPF / CNPJ">{formatarDocumento(pessoa.cpf_cnpj)}</DadoFicha>
          <DadoFicha rotulo="Nascimento">{pessoa.data_nascimento ? dataCivil(pessoa.data_nascimento) : null}</DadoFicha><DadoFicha rotulo="Endereço">{pessoa.endereco}</DadoFicha>
        </DadosFicha></SecaoPainel>
        <SecaoPainel titulo="Atendimento">
          <div className="mb-4 flex flex-wrap gap-2"><Etiqueta tom={pessoa.status_contato === 'PENDENTE' ? 'atencao' : 'neutro'}>Contato {rotulosStatusContato[pessoa.status_contato].toLowerCase()}</Etiqueta>{!pessoa.ativo && <Etiqueta tom="alerta">Cadastro inativo</Etiqueta>}{pessoa.consentimento && <Etiqueta>Consentimento {pessoa.versao_termos ?? ''} em {pessoa.consentimento_em ? data(pessoa.consentimento_em) : ''}</Etiqueta>}</div>
          <DadosFicha>
            <DadoFicha rotulo="Origem">{pessoa.origem === 'SITE' ? 'Site' : 'Cadastro manual'}</DadoFicha>
            <DadoFicha rotulo="Imóvel de interesse">{pessoa.imovel_id ? <Link to={`/admin/imoveis/${pessoa.imovel_id}`}>{codigoImovel(pessoa.imovel_id)}</Link> : null}</DadoFicha>
            <DadoFicha rotulo="Responsável"><Link to={urlFichaCorretor(pessoa.corretor_id, corretor?.id)}>{`Corretor #${pessoa.corretor_id}`}</Link></DadoFicha>
          </DadosFicha>
        </SecaoPainel>
        <SecaoPainel titulo="Dados bancários"><DadosFicha>
          <DadoFicha rotulo="Banco">{pessoa.banco_nome}</DadoFicha><DadoFicha rotulo="Agência / conta">{pessoa.banco_agencia || pessoa.banco_conta ? `${pessoa.banco_agencia ?? ''} / ${pessoa.banco_conta ?? ''}` : null}</DadoFicha><DadoFicha rotulo="Pix">{pessoa.chave_pix}</DadoFicha>
        </DadosFicha></SecaoPainel>
      </GradePainel>
      {(pessoa.mensagem || pessoa.observacoes) && <GradePainel colunas={2} classe="mt-4">
        {pessoa.mensagem && <SecaoPainel titulo="Mensagem do primeiro contato" ampla={!pessoa.observacoes}><p className="m-0 whitespace-pre-wrap">{pessoa.mensagem}</p></SecaoPainel>}
        {pessoa.observacoes && <SecaoPainel titulo="Observações" ampla={!pessoa.mensagem}><p className="m-0 whitespace-pre-wrap">{pessoa.observacoes}</p></SecaoPainel>}
      </GradePainel>}
      <EstadoCarregamento carregando={vinculos.carregando} erro={vinculos.erro} tentarNovamente={vinculos.recarregar} />
      {vinculos.dados && !vinculos.carregando && !vinculos.erro && <GradePainel classe="mt-4">
        <SecaoPainel titulo="Imóveis como proprietária"><Tabela itens={vinculos.dados.imoveis.itens} chave={(imovel) => imovel.id} linkLinha={(imovel) => `/admin/imoveis/${imovel.id}`} vazio="Nenhum imóvel vinculado." colunas={[{ titulo: 'Imóvel', celula: (imovel) => <><Link to={`/admin/imoveis/${imovel.id}`}>{codigoImovel(imovel.id)} {imovel.titulo}</Link><small className="block text-muted">{rotulosStatusImovel[imovel.status]}</small></> }]} /></SecaoPainel>
        <SecaoPainel titulo="Contratos">{vinculos.dados.contratos ? <Tabela itens={vinculos.dados.contratos.itens} chave={(contrato) => contrato.id} linkLinha={(contrato) => `/admin/contratos/${contrato.id}`} vazio="Nenhum contrato." colunas={[{ titulo: 'Contrato', celula: (contrato) => <><Link to={`/admin/contratos/${contrato.id}`}>{contrato.numero_contrato}</Link><small className="block text-muted">{contrato.locador_id === pessoa.id ? 'Locadora' : 'Locatária'} {contrato.status === 'ATIVO' ? 'ativo' : 'encerrado'} {dinheiroExato(contrato.valor_aluguel)}/mês</small></> }]} /> : <p className="campo-dica m-0">Sem acesso aos contratos.</p>}</SecaoPainel>
        <SecaoPainel titulo="Comissões">{vinculos.dados.comissoes ? <Tabela itens={vinculos.dados.comissoes.itens} chave={(comissao) => comissao.id} linkLinha={(comissao) => `/admin/comissoes/${comissao.id}`} vazio="Nenhuma comissão." colunas={[{ titulo: 'Comissão', celula: (comissao) => <><Link to={`/admin/comissoes/${comissao.id}`}>Comissão #{comissao.id}</Link><small className="block text-muted">{comissao.tipo_operacao === 'VENDA' ? 'Venda' : 'Locação'} {dinheiroExato(comissao.valor_total)} Saldo {dinheiroExato(comissao.saldo_pendente ?? comissao.valor_total)}</small></> }]} /> : <p className="campo-dica m-0">Sem acesso às comissões.</p>}</SecaoPainel>
      </GradePainel>}
      {editando && <EditorPessoa pessoa={pessoa} aoFechar={() => setEditando(false)} aoSalvar={recarregar} />}
      {confirmando && podeEditar && <ConfirmarAcao titulo={pessoa.ativo ? 'Desativar cadastro' : 'Reativar cadastro'} descricao={<><p>{pessoa.ativo ? `Desativar ${pessoa.nome}? O histórico será preservado. Pessoas em contratos ativos precisam permanecer ativas.` : `Reativar ${pessoa.nome}?`}</p>{erroAcao && <Aviso tom="erro">{erroAcao}</Aviso>}</>} confirmar={pessoa.ativo ? 'Desativar cadastro' : 'Reativar cadastro'} perigo={pessoa.ativo} ocupado={ocupado} aoFechar={() => setConfirmando(false)} aoConfirmar={alternarAtivo} />}
    </>}
  </>;
}
