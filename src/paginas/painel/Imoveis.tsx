import { useFiltrosAutomaticos } from '../../hooks/useFiltrosAutomaticos';
import { useParametrosLista } from '../../hooks/useParametrosLista';
import { useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconeAdicionar, IconeEditar } from '../../componentes/Icones';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { api } from '../../servicos/api';
import { codigoImovel, dinheiro, rotulosStatusImovel, valorPrincipal } from '../../servicos/formato';
import type { FichaImovel, StatusImovel } from '../../tipos';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Etiqueta from '../../componentes/Etiqueta';
import Paginacao from '../../componentes/Paginacao';
import Tabela from '../../componentes/Tabela';
import Seletor from '../../componentes/Seletor';
import BarraFiltros, { CampoBusca } from '../../componentes/BarraFiltros';
import AcaoIcone from '../../componentes/AcaoIcone';
import BotaoAdicionar from '../../componentes/BotaoAdicionar';
import { estilos } from '../../componentes/estilosPainel';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import { urlFichaCorretor } from '../../servicos/urls';

type Filtros = { busca: string; status: '' | StatusImovel; ativo: 'true' | 'false' };
const filtrosIniciais: Filtros = { busca: '', status: '', ativo: 'true' };
const valoresValidos = { status: ['', ...Object.keys(rotulosStatusImovel)], ativo: ['true', 'false'] } as const;

export default function Imoveis() {
  const navegar = useNavigate();
  useAcoesPainel(useMemo(() => [{ id: 'novo-imovel', rotulo: 'Novo imóvel', executar: () => navegar('/admin/imoveis/novo') }], [navegar]));
  const { corretor } = useSessao();
  const { filtros, pagina, definirFiltros, definirPagina: setPagina } = useParametrosLista<Filtros>(filtrosIniciais, valoresValidos);
  const { rascunho, definir: setRascunho, aplicarAgora } = useFiltrosAutomaticos({
    iniciais: filtros, externos: filtros, normalizar: (valor) => ({ ...valor, busca: valor.busca.trim() }),
    aoAplicar: (valor) => definirFiltros(valor),
  });
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarFichas({ pagina, limite: 12, busca: filtros.busca || undefined, status: filtros.status || undefined, ativo: filtros.ativo === 'true' }), [pagina, filtros]));
  const itens = dados?.itens ?? [];
  const podeEditar = (imovel: FichaImovel) => corretor?.cargo === 'ADMIN' || corretor?.id === imovel.corretor_id;

  const filtrado = (Object.keys(filtrosIniciais) as (keyof Filtros)[]).some((chave) => filtros[chave] !== filtrosIniciais[chave]);

  return <>
    <CabecalhoPagina titulo="Imóveis" descricao="Espaços bem apresentados, novas possibilidades." acoes={<BotaoAdicionar rotulo="Novo imóvel" to="/admin/imoveis/novo" />} />
    <BarraFiltros aoEnviar={aplicarAgora} filtrado={filtrado} aoLimpar={() => setRascunho(filtrosIniciais, true)}>
      <CampoBusca valor={rascunho.busca} aoMudar={(busca) => setRascunho({ ...rascunho, busca })} placeholder="Título, bairro, cidade ou #código" />
      <Seletor rotulo="Situação do anúncio" valor={rascunho.status} opcoes={[{ valor: '' as const, rotulo: 'Todas' }, ...Object.entries(rotulosStatusImovel).map(([valor, rotulo]) => ({ valor: valor as Filtros['status'], rotulo }))]} aoMudar={(valor) => setRascunho({ ...rascunho, status: valor }, true)} />
      <Seletor rotulo="Cadastro" valor={rascunho.ativo} opcoes={[{ valor: 'true' as const, rotulo: 'Ativos' }, { valor: 'false' as const, rotulo: 'Inativos' }]} aoMudar={(valor) => setRascunho({ ...rascunho, ativo: valor }, true)} />
    </BarraFiltros>
    <EstadoCarregamento compacto carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && !carregando && (
      <section>
        <p role="status" className="contagem-painel">{`${dados.total} ${dados.total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`}</p>
        {!dados.itens.length && !filtros.busca && !filtros.status && filtros.ativo === 'true'
          ? <div className="estado-painel text-center text-muted"><h2 className="mb-3 text-[22px]">Seu portfólio começa aqui.</h2><p>Cadastre o primeiro imóvel para apresentá-lo no site.</p><Link to="/admin/imoveis/novo" className="button"><IconeAdicionar size={20} aria-hidden="true" />Cadastrar imóvel</Link></div>
          : <>
            <Tabela<FichaImovel> itens={itens} chave={(imovel) => imovel.id} linkLinha={(imovel) => `/admin/imoveis/${imovel.id}`} vazio="Nenhum imóvel encontrado com esses filtros." rotulo="Imóveis" colunas={[
              { titulo: 'Imóvel', celula: (imovel) => {
                const capa = imovel.midias.find((midia) => midia.capa) ?? imovel.midias.find((midia) => midia.tipo === 'IMAGEM');
                return <div className="flex items-center gap-3">
                  <span className="grid h-14 w-18 shrink-0 place-items-center overflow-hidden rounded bg-soft text-[11px] text-muted">{capa ? <img src={capa.url} alt="" className="h-full w-full object-cover" /> : 'Sem foto'}</span>
                  <span className="min-w-0"><Link to={`/admin/imoveis/${imovel.id}`}><strong>{imovel.titulo}</strong></Link><small className="mt-1 block text-muted">{codigoImovel(imovel.id)} {imovel.tipo?.nome ?? 'Imóvel'} {imovel.bairro}, {imovel.cidade}/{imovel.estado}</small>{imovel.corretor && <small className="block text-muted">Responsável: <Link to={urlFichaCorretor(imovel.corretor.id, corretor?.id)}>{imovel.corretor.nome}</Link></small>}</span>
                </div>;
              } },
              { titulo: 'Valor', celula: (imovel) => { const preco = valorPrincipal(imovel); return <>{preco ? dinheiro(preco.valor) : 'Sob consulta'}<small className="mt-1 block text-muted">{imovel.finalidade?.nome ?? ''}{preco?.tipo === 'locacao' ? ' por mês' : ''}</small></>; } },
              { titulo: 'Situação', celula: (imovel) => <div className="flex flex-wrap gap-1.5"><Etiqueta tom={imovel.status === 'DISPONIVEL' ? 'neutro' : 'atencao'}>{rotulosStatusImovel[imovel.status]}</Etiqueta>{!imovel.ativo && <Etiqueta tom="alerta">Inativo</Etiqueta>}</div> },
              { titulo: 'Ações', acoes: true, celula: (imovel) => <div className={`${estilos.acoes} max-lg:justify-end`}>
                {podeEditar(imovel) && <AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={imovel.titulo} to={`/admin/imoveis/${imovel.id}/editar`} />}
              </div> },
            ]} />
            <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
          </>}
      </section>
    )}
  </>;
}
