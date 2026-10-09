import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSessao } from '../../hooks/useSessao';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import { urlFichaCorretor } from '../../servicos/urls';
import { idRegistro, consultarRegistroDisponivel } from '../../servicos/registros';
import Aviso from '../../componentes/Aviso';
import { api } from '../../servicos/api';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { dataCivil, dinheiroExato, mensagemErro } from '../../servicos/formato';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import { IconeArquivar, IconeEditar, IconeAbrirFora } from '../../componentes/Icones';
import AcaoIcone from '../../componentes/AcaoIcone';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import { estilos } from '../../componentes/estilosPainel';
import Comissoes from './Comissoes';
import { EditorContrato } from './Contratos';

export default function DetalheContrato() {
  const { id = '' } = useParams();
  const contratoId = idRegistro(id);
  const { corretor } = useSessao();
  const [editando, setEditando] = useState(false);
  const [arquivando, setArquivando] = useState(false);
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
  const urlDrive = dados?.url_pasta_drive && /^https:\/\/drive\.google\.com\/drive\/folders\/[\w-]+$/.test(dados.url_pasta_drive) ? dados.url_pasta_drive : null;
  return <>
    <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {!carregando && !erro && !dados && <Aviso>Contrato indisponível.</Aviso>}
    {dados && !carregando && !erro && <>
      <CabecalhoPagina voltar={{ to: '/admin/contratos', rotulo: 'Voltar para contratos' }} titulo={dados.numero_contrato} descricao={`${dados.status === 'ATIVO' ? 'Ativo' : 'Encerrado'}${dados.ativo ? '' : ', arquivado'}`}
        acoes={<><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={dados.numero_contrato} desabilitado={ocupado} aoClicar={() => setEditando(true)} />{dados.ativo && <AcaoIcone icone={IconeArquivar} rotulo="Arquivar" tom="perigo" contexto={dados.numero_contrato} desabilitado={ocupado} aoClicar={() => setArquivando(true)} />}</>} />
      <section className={estilos.painel}>
        <h2 className={estilos.tituloPainel}><Link to={`/admin/imoveis/${dados.imovel_id}`}>{dados.imovel_titulo ?? `Imóvel #${dados.imovel_id}`}</Link></h2>
        <p>Intermediador: <Link to={urlFichaCorretor(dados.corretor_id, corretor?.id)}>{dados.corretor_id === corretor?.id ? corretor.nome : `Corretor #${dados.corretor_id}`}</Link></p>
        <p>Proprietário: <Link to={`/admin/pessoas/${dados.locador_id}`}>{dados.locador_nome ?? `#${dados.locador_id}`}</Link></p>
        <p>Inquilino: <Link to={`/admin/pessoas/${dados.locatario_id}`}>{dados.locatario_nome ?? `#${dados.locatario_id}`}</Link></p>
        <p>Período: {dataCivil(dados.data_inicio)} a {dataCivil(dados.data_fim)}</p>
        <p>Aluguel: {dinheiroExato(dados.valor_aluguel)}; vencimento: dia {dados.dia_vencimento}</p>
        <p>Taxa de administração: {dados.taxa_administracao}%</p>
        <p>Garantia: {dados.garantia_locaticia}</p>
        <p>Reajuste: {dados.indice_reajuste}</p>
        <p>IPTU e condomínio: {dados.cobranca_iptu_condominio}</p>
        {dados.observacoes && <p className="whitespace-pre-wrap">{dados.observacoes}</p>}
      </section>
      <section className={estilos.painel}>
        <h2 className={estilos.tituloPainel}>Documentos do contrato</h2>
        {urlDrive && <a href={urlDrive} target="_blank" rel="noopener noreferrer" className="buttonGhost"><IconeAbrirFora size={20} aria-hidden="true" />Abrir pasta no Google Drive</a>}
        <p>{dados.status_pasta_drive === 'CRIADA' ? 'Pasta disponível para as pessoas autorizadas no Drive.' : dados.status_pasta_drive === 'FALHOU' ? 'O contrato foi salvo. A criação ou atualização da pasta não foi concluída.' : 'A pasta será preparada para este contrato quando ele estiver ativo.'}</p>
        {dados.status === 'ATIVO' && dados.ativo && dados.status_pasta_drive !== 'CRIADA' && <button className="buttonSecondary" disabled={ocupado} onClick={() => void executar('drive')}>{ocupado ? 'Preparando pasta…' : 'Tentar preparar pasta novamente'}</button>}
        {erroAcao && <Aviso tom="erro">{erroAcao}</Aviso>}
      </section>
      <Comissoes contrato={dados} />
      {editando && <EditorContrato key={dados.id} contrato={dados} aoFechar={() => setEditando(false)} aoSalvar={recarregar} />}
      {arquivando && <ConfirmarAcao titulo="Arquivar contrato?" descricao={<><p>O contrato {dados.numero_contrato} será encerrado e o histórico permanecerá disponível.</p>{erroAcao && <Aviso tom="erro">{erroAcao}</Aviso>}</>} confirmar="Arquivar contrato" ocupado={ocupado} aoFechar={() => { if (!ocupado) setArquivando(false); }} aoConfirmar={() => executar('arquivar')} />}
    </>}
  </>;
}
