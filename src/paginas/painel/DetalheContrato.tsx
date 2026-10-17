import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSessao } from '../../hooks/useSessao';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import { urlFichaCorretor } from '../../servicos/urls';
import { idRegistro, consultarRegistroDisponivel } from '../../servicos/registros';
import Aviso from '../../componentes/Aviso';
import { api } from '../../servicos/api';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { dataCivil, dinheiroExato, mensagemErro } from '../../servicos/formato';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import { IconeArquivar, IconeEditar, IconeFinalizar, IconeContrato } from '../../componentes/Icones';
import AcaoIcone from '../../componentes/AcaoIcone';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import { DadosFicha, DadoFicha, GradePainel, SecaoPainel } from '../../componentes/BlocosPainel';
import Comissoes from './Comissoes';
import DocumentosContrato from './DocumentosContrato';
import { EditorContrato } from './Contratos';
import { EncerrarContrato, RenovarContrato } from './AcoesContrato';

export default function DetalheContrato() {
  const { id = '' } = useParams();
  const contratoId = idRegistro(id);
  const { corretor } = useSessao();
  const [editando, setEditando] = useState(false);
  const [arquivando, setArquivando] = useState(false);
  const [dialogo, setDialogo] = useState<'encerrar' | 'renovar' | null>(null);
  const navigate = useNavigate();
  const [ocupado, setOcupado] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const { dados: registro, carregando, erro, recarregar } = useDadosPainel(useCallback(() => contratoId ? consultarRegistroDisponivel(() => api.obterContrato(contratoId)) : Promise.resolve(null), [contratoId]));
  const dados = !carregando && !erro && registro?.id === contratoId ? registro : null;
  useAcoesPainel(useMemo(() => dados ? [{ id: 'editar-contrato', rotulo: 'Editar contrato', executar: () => setEditando(true) }] : [], [dados]));
  async function executar(acao: 'drive' | 'arquivar') {
    if (!contratoId || ocupado) return;
    setOcupado(true);
    setErroAcao('');
    try {
      if (acao === 'drive') {
        const resultado = await api.prepararPastaDrive(contratoId);
        if (resultado.status_pasta_drive !== 'CRIADA') setErroAcao('O contrato está salvo, mas a pasta ainda não está disponível. Tente novamente após ajustar a integração.');
      } else {
        await api.arquivarContrato(contratoId);
      }
      setArquivando(false);
      recarregar();
    } catch (falha) { setErroAcao(mensagemErro(falha)); }
    finally { setOcupado(false); }
  }
  const podeEncerrar = Boolean(dados?.ativo && dados.status === 'ATIVO' && !dados.motivo_encerramento);
  const podeRenovar = Boolean(dados?.ativo && !dados.motivo_encerramento && !dados.renovacao_id);
  return <>
    <CabecalhoPagina voltar={{ to: '/admin/contratos', rotulo: 'Voltar para contratos' }} titulo={dados?.numero_contrato ?? 'Contrato'} descricao={dados ? `${dados.status === 'ATIVO' ? 'Ativo' : 'Encerrado'}${dados.ativo ? '' : ', arquivado'}` : undefined}
      acoes={dados && <><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={dados.numero_contrato} desabilitado={ocupado} aoClicar={() => setEditando(true)} />{podeEncerrar && <AcaoIcone icone={IconeFinalizar} rotulo="Encerrar antes do fim" contexto={dados.numero_contrato} desabilitado={ocupado} aoClicar={() => setDialogo('encerrar')} />}{podeRenovar && <AcaoIcone icone={IconeContrato} rotulo="Renovar" contexto={dados.numero_contrato} desabilitado={ocupado} aoClicar={() => setDialogo('renovar')} />}{dados.ativo && <AcaoIcone icone={IconeArquivar} rotulo="Arquivar" tom="perigo" contexto={dados.numero_contrato} desabilitado={ocupado} aoClicar={() => setArquivando(true)} />}</>} />
    <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {!carregando && !erro && !dados && <Aviso>Contrato indisponível.</Aviso>}
    {dados && !carregando && !erro && <>
      {(dados.motivo_encerramento || dados.contrato_anterior_id || dados.renovacao_id) && <Aviso classe="mb-6">
        {dados.motivo_encerramento && <p className="m-0">Encerrado antes do fim contratado ({dataCivil(dados.data_fim_contratada)}); último dia de vigência {dataCivil(dados.data_fim)}. Motivo: {dados.motivo_encerramento}</p>}
        {dados.contrato_anterior_id && <p className="m-0">Renovação de <Link to={`/admin/contratos/${dados.contrato_anterior_id}`}>contrato anterior</Link>.</p>}
        {dados.renovacao_id && <p className="m-0">Renovado: <Link to={`/admin/contratos/${dados.renovacao_id}`}>ver o contrato novo</Link>.</p>}
      </Aviso>}
      <GradePainel colunas={2} classe="mb-8">
      <SecaoPainel titulo="Partes e imóvel"><DadosFicha>
        <DadoFicha rotulo="Imóvel"><Link to={`/admin/imoveis/${dados.imovel_id}`}>{dados.imovel_titulo ?? `Imóvel #${dados.imovel_id}`}</Link></DadoFicha>
        <DadoFicha rotulo="Intermediador"><Link to={urlFichaCorretor(dados.corretor_id, corretor?.id)}>{dados.corretor_id === corretor?.id ? corretor.nome : `Corretor #${dados.corretor_id}`}</Link></DadoFicha>
        <DadoFicha rotulo="Proprietário"><Link to={`/admin/pessoas/${dados.locador_id}`}>{dados.locador_nome ?? `#${dados.locador_id}`}</Link></DadoFicha>
        <DadoFicha rotulo="Inquilino"><Link to={`/admin/pessoas/${dados.locatario_id}`}>{dados.locatario_nome ?? `#${dados.locatario_id}`}</Link></DadoFicha>
      </DadosFicha></SecaoPainel>
      <SecaoPainel titulo="Condições da locação"><DadosFicha colunas={2}>
        <DadoFicha rotulo="Período">{dataCivil(dados.data_inicio)} a {dataCivil(dados.data_fim)}</DadoFicha>
        <DadoFicha rotulo="Aluguel">{dinheiroExato(dados.valor_aluguel)}</DadoFicha><DadoFicha rotulo="Vencimento">Dia {dados.dia_vencimento}</DadoFicha>
        <DadoFicha rotulo="Taxa de administração">{dados.taxa_administracao}%</DadoFicha><DadoFicha rotulo="Garantia">{dados.garantia_locaticia}</DadoFicha>
        <DadoFicha rotulo="Tipo de contrato">{dados.tipo_contrato_nome ?? 'Não classificado'}</DadoFicha>
        <DadoFicha rotulo="Reajuste">{dados.indice_reajuste_nome
          ? <>{dados.indice_reajuste_nome}{dados.indice_reajuste_periodicidade_meses && <small className="mt-1 block text-muted">A cada {dados.indice_reajuste_periodicidade_meses} {dados.indice_reajuste_periodicidade_meses === 1 ? 'mês' : 'meses'}</small>}{dados.indice_reajuste_regra && <small className="mt-1 block whitespace-pre-wrap text-muted">{dados.indice_reajuste_regra}</small>}</>
          : <>{dados.indice_reajuste}<small className="mt-1 block text-muted">Registro anterior aos cadastros de índice.</small></>}</DadoFicha>
        <DadoFicha rotulo="IPTU e condomínio">{dados.cobranca_iptu_condominio}</DadoFicha>
      </DadosFicha></SecaoPainel>
      <SecaoPainel titulo="Documentos do contrato" ampla={!dados.observacoes}>
        {dados.status_pasta_drive === 'CRIADA'
          ? <DocumentosContrato contratoId={dados.id} />
          : <div className="flex flex-col items-start gap-4">
            <p className="m-0">{dados.status_pasta_drive === 'FALHOU' ? 'O contrato foi salvo. A criação ou atualização da pasta não foi concluída.' : 'A pasta será preparada para este contrato quando ele estiver ativo.'}</p>
            {dados.status === 'ATIVO' && dados.ativo && <button className="buttonSecondary" disabled={ocupado} onClick={() => void executar('drive')}>{ocupado ? 'Preparando pasta…' : 'Tentar preparar pasta novamente'}</button>}
          </div>}
        {erroAcao && <Aviso tom="erro" classe="mt-4">{erroAcao}</Aviso>}
      </SecaoPainel>
      {dados.observacoes && <SecaoPainel titulo="Observações"><p className="m-0 whitespace-pre-wrap">{dados.observacoes}</p></SecaoPainel>}
      </GradePainel>
      <Comissoes contrato={dados} />
      {dialogo === 'encerrar' && <EncerrarContrato contrato={dados} aoFechar={() => setDialogo(null)} aoConcluir={() => { setDialogo(null); recarregar(); }} />}
      {dialogo === 'renovar' && <RenovarContrato contrato={dados} aoFechar={() => setDialogo(null)} aoConcluir={(novo) => { setDialogo(null); navigate(`/admin/contratos/${novo.id}`); }} />}
      {editando && <EditorContrato key={dados.id} contrato={dados} aoFechar={() => setEditando(false)} aoSalvar={recarregar} />}
      {arquivando && <ConfirmarAcao titulo="Arquivar contrato?" descricao={<><p>O contrato {dados.numero_contrato} será encerrado e o histórico permanecerá disponível.</p>{erroAcao && <Aviso tom="erro">{erroAcao}</Aviso>}</>} confirmar="Arquivar contrato" ocupado={ocupado} aoFechar={() => { if (!ocupado) setArquivando(false); }} aoConfirmar={() => executar('arquivar')} />}
    </>}
  </>;
}
