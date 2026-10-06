import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../servicos/api';
import { consultarRegistroDisponivel, idRegistro } from '../../servicos/registros';
import { urlImovel } from '../../servicos/urls';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useSessao } from '../../hooks/useSessao';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import { IconeArquivar, IconeDesarquivar, IconeEditar, IconeAbrirFora } from '../../componentes/Icones';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import AcaoIcone from '../../componentes/AcaoIcone';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import Aviso from '../../componentes/Aviso';
import FichaImovel from './FichaImovel';

export default function DetalheImovel() {
  const id = idRegistro(useParams().id);
  const navegar = useNavigate();
  const { corretor } = useSessao();
  const [confirmando, setConfirmando] = useState(false);
  const consulta = useDadosPainel(useCallback(() => id ? consultarRegistroDisponivel(() => api.obterFicha(id)) : Promise.resolve(null), [id]));
  const imovel = !consulta.carregando && !consulta.erro && consulta.dados?.id === id ? consulta.dados : null;
  const podeEditar = Boolean(imovel && corretor && (corretor.cargo === 'ADMIN' || corretor.id === imovel.corretor_id));
  useAcoesPainel(useMemo(() => imovel && podeEditar ? [{ id: 'editar-imovel', rotulo: 'Editar imóvel', executar: () => navegar(`/admin/imoveis/${imovel.id}/editar`) }] : [], [imovel, podeEditar, navegar]));
  return <>
    <CabecalhoPagina titulo={imovel?.titulo ?? 'Ficha do imóvel'} voltar={<Link to="/admin/imoveis">Imóveis</Link>} descricao={imovel ? `Imóvel #${imovel.id}` : undefined} acoes={imovel && <>
      <a className="buttonSecondary" href={urlImovel(imovel.slug)} target="_blank" rel="noopener noreferrer">Ver anúncio <IconeAbrirFora aria-hidden="true" /></a>
      {podeEditar && <><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={imovel.titulo} to={`/admin/imoveis/${imovel.id}/editar`} /><AcaoIcone icone={imovel.ativo ? IconeArquivar : IconeDesarquivar} rotulo={imovel.ativo ? 'Arquivar' : 'Reativar'} contexto={imovel.titulo} tom={imovel.ativo ? 'perigo' : 'neutro'} aoClicar={() => setConfirmando(true)} /></>}
    </>} />
    <EstadoCarregamento carregando={consulta.carregando} erro={consulta.erro} tentarNovamente={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && !imovel && <Aviso>Imóvel indisponível.</Aviso>}
    {imovel && !consulta.carregando && !consulta.erro && <FichaImovel imovel={imovel} />}
    {imovel && podeEditar && confirmando && <ConfirmarAcao titulo={imovel.ativo ? 'Arquivar imóvel?' : 'Reativar imóvel?'} descricao={imovel.ativo ? `Arquivar ${imovel.titulo}? O anúncio sairá do site e seu histórico será preservado.` : `Reativar ${imovel.titulo}?`} confirmar={imovel.ativo ? 'Arquivar imóvel' : 'Reativar imóvel'} perigo={imovel.ativo} aoFechar={() => setConfirmando(false)} aoConfirmar={async () => { await api.ativarImovel(imovel.id, !imovel.ativo); setConfirmando(false); consulta.recarregar(); }} />}
  </>;
}
