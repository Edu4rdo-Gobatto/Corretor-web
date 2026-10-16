import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../servicos/api';
import { consultarRegistroDisponivel, idRegistro } from '../../servicos/registros';
import { urlImovel } from '../../servicos/urls';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useSessao } from '../../hooks/useSessao';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import { IconeEditar, IconeAbrirFora } from '../../componentes/Icones';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import AcaoIcone from '../../componentes/AcaoIcone';
import Aviso from '../../componentes/Aviso';
import FichaImovel from './FichaImovel';

export default function DetalheImovel() {
  const id = idRegistro(useParams().id);
  const navegar = useNavigate();
  const { corretor } = useSessao();
  const consulta = useDadosPainel(useCallback(() => id ? consultarRegistroDisponivel(() => api.obterFicha(id)) : Promise.resolve(null), [id]));
  const imovel = !consulta.carregando && !consulta.erro && consulta.dados?.id === id ? consulta.dados : null;
  const podeEditar = Boolean(imovel && corretor && (corretor.cargo === 'ADMIN' || corretor.id === imovel.corretor_id));
  useAcoesPainel(useMemo(() => imovel && podeEditar ? [{ id: 'editar-imovel', rotulo: 'Editar imóvel', executar: () => navegar(`/admin/imoveis/${imovel.id}/editar`) }] : [], [imovel, podeEditar, navegar]));
  return <>
    <CabecalhoPagina titulo={imovel?.titulo ?? 'Ficha do imóvel'} voltar={{ to: '/admin/imoveis', rotulo: 'Voltar para imóveis' }} descricao={imovel ? `Imóvel #${imovel.id}` : undefined} acoes={imovel && <>
      <a className="buttonSecondary" href={urlImovel(imovel.slug)} target="_blank" rel="noopener noreferrer">Ver anúncio <IconeAbrirFora aria-hidden="true" /></a>
      {podeEditar && <AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={imovel.titulo} to={`/admin/imoveis/${imovel.id}/editar`} />}
    </>} />
    <EstadoCarregamento carregando={consulta.carregando} erro={consulta.erro} tentarNovamente={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && !imovel && <Aviso>Imóvel indisponível.</Aviso>}
    {imovel && !consulta.carregando && !consulta.erro && <FichaImovel imovel={imovel} />}
  </>;
}
