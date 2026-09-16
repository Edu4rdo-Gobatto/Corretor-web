import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../servicos/api';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { dataCivil, dinheiroExato, mensagemErro } from '../../servicos/formato';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import Dialogo from '../../componentes/Dialogo';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import { estilos } from '../../componentes/estilosPainel';
import Comissoes from './Comissoes';
import { EditorContrato } from './Contratos';

export default function DetalheContrato() {
  const { id = '' } = useParams();
  const contratoId = Number(id);
  const [editando, setEditando] = useState(false);
  const [arquivando, setArquivando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.obterContrato(contratoId), [contratoId]));
  async function executar(acao: 'drive' | 'arquivar') {
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
    {dados && !erro && <>
      <CabecalhoPagina voltar={<Link to="/admin/contratos">← Contratos</Link>} titulo={dados.numero_contrato} descricao={`${dados.status === 'ATIVO' ? 'Ativo' : 'Encerrado'}${dados.ativo ? '' : ' · Arquivado'}`}
        acoes={<><button className="button" onClick={() => setEditando(true)}>Editar contrato</button>{dados.ativo && <button className="buttonGhost" onClick={() => setArquivando(true)}>Arquivar</button>}</>} />
      <section className={estilos.painel}>
        <h2 className={estilos.tituloPainel}>{dados.imovel_titulo ?? `Imóvel #${dados.imovel_id}`}</h2>
        <p>Proprietário: <Link to={`/admin/pessoas/${dados.locador_id}`}>{dados.locador_nome ?? `#${dados.locador_id}`}</Link></p>
        <p>Inquilino: <Link to={`/admin/pessoas/${dados.locatario_id}`}>{dados.locatario_nome ?? `#${dados.locatario_id}`}</Link></p>
        <p>Período: {dataCivil(dados.data_inicio)} a {dataCivil(dados.data_fim)}</p>
        <p>Aluguel: {dinheiroExato(dados.valor_aluguel)} · Vencimento: dia {dados.dia_vencimento}</p>
        <p>Taxa de administração: {dados.taxa_administracao}%</p>
        <p>Garantia: {dados.garantia_locaticia}</p>
        <p>Reajuste: {dados.indice_reajuste}</p>
        <p>IPTU e condomínio: {dados.cobranca_iptu_condominio}</p>
        {dados.observacoes && <p className="whitespace-pre-wrap">{dados.observacoes}</p>}
      </section>
      <section className={estilos.painel}>
        <h2 className={estilos.tituloPainel}>Documentos do contrato</h2>
        {urlDrive && <a href={urlDrive} target="_blank" rel="noopener noreferrer" className="buttonGhost">Abrir pasta no Google Drive</a>}
        <p>{dados.status_pasta_drive === 'CRIADA' ? 'Pasta disponível para as pessoas autorizadas no Drive.' : dados.status_pasta_drive === 'FALHOU' ? 'O contrato foi salvo. A criação ou atualização da pasta não foi concluída.' : 'A pasta será preparada para este contrato quando ele estiver ativo.'}</p>
        {dados.status === 'ATIVO' && dados.ativo && dados.status_pasta_drive !== 'CRIADA' && <button className="buttonSecondary" disabled={ocupado} onClick={() => void executar('drive')}>{ocupado ? 'Preparando pasta…' : 'Tentar preparar pasta novamente'}</button>}
        {erroAcao && <p className="error" role="alert">{erroAcao}</p>}
      </section>
      <Comissoes contrato={dados} />
      {editando && <EditorContrato contrato={dados} aoFechar={() => setEditando(false)} aoSalvar={recarregar} />}
      {arquivando && <Dialogo titulo="Arquivar contrato" aoFechar={() => { if (!ocupado) setArquivando(false); }}>
        <p>Arquivar {dados.numero_contrato}? O contrato será encerrado e o histórico permanecerá disponível.</p>
        <button className="button" disabled={ocupado} onClick={() => void executar('arquivar')}>{ocupado ? 'Arquivando…' : 'Arquivar contrato'}</button>
        {erroAcao && <p role="alert" className="error">{erroAcao}</p>}
      </Dialogo>}
    </>}
  </>;
}
