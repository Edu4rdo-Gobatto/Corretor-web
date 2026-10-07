import { useFiltrosAutomaticos } from '../../hooks/useFiltrosAutomaticos';
import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconeArquivar, IconeDesarquivar, IconeAdicionar, IconeBuscar, IconeEditar, IconeFechar } from '../../componentes/Icones';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { api } from '../../servicos/api';
import { codigoImovel, dinheiro, mensagemErro, rotulosStatusImovel, valorPrincipal } from '../../servicos/formato';
import type { FichaImovel, StatusImovel } from '../../tipos';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Etiqueta from '../../componentes/Etiqueta';
import Paginacao from '../../componentes/Paginacao';
import Tabela from '../../componentes/Tabela';
import SeletorFiltro from '../../componentes/SeletorFiltro';
import AcaoIcone from '../../componentes/AcaoIcone';
import Aviso from '../../componentes/Aviso';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import { estilos } from '../../componentes/estilosPainel';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import { urlFichaCorretor } from '../../servicos/urls';

interface Filtros { busca: string; status: '' | StatusImovel; ativo: 'true' | 'false' }
const filtrosIniciais: Filtros = { busca: '', status: '', ativo: 'true' };

export default function Imoveis() {
  const navegar = useNavigate();
  useAcoesPainel(useMemo(() => [{ id: 'novo-imovel', rotulo: 'Novo imóvel', executar: () => navegar('/admin/imoveis/novo') }], [navegar]));
  const { corretor } = useSessao();
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const { rascunho, definir: setRascunho, aplicarAgora } = useFiltrosAutomaticos({
    iniciais: filtrosIniciais, normalizar: (valor) => ({ ...valor, busca: valor.busca.trim() }),
    aoAplicar: (valor) => { setPagina(1); setFiltros(valor); },
  });
  const [erroMutacao, setErroMutacao] = useState('');
  const [ocupado, setOcupado] = useState(0);
  const [confirmando, setConfirmando] = useState<FichaImovel>();
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarFichas({ pagina, limite: 12, busca: filtros.busca || undefined, status: filtros.status || undefined, ativo: filtros.ativo === 'true' }), [pagina, filtros]));
  const itens = dados?.itens ?? [];
  const podeEditar = (imovel: FichaImovel) => corretor?.cargo === 'ADMIN' || corretor?.id === imovel.corretor_id;

  function aplicar(evento: FormEvent) { evento.preventDefault(); aplicarAgora(); }
  function removerFiltro(campo: keyof Filtros) {
    setRascunho({ ...rascunho, [campo]: filtrosIniciais[campo] }, true);
  }
  const resumo: { campo: keyof Filtros; rotulo: string }[] = [
    ...(filtros.busca ? [{ campo: 'busca' as const, rotulo: `Busca: ${filtros.busca}` }] : []),
    ...(filtros.status ? [{ campo: 'status' as const, rotulo: rotulosStatusImovel[filtros.status] }] : []),
    ...(filtros.ativo === 'false' ? [{ campo: 'ativo' as const, rotulo: 'Inativos' }] : []),
  ];
  async function alternarAtivo(imovel: FichaImovel) {
    const ativar = !imovel.ativo;
    setOcupado(imovel.id);
    setErroMutacao('');
    try {
      await api.ativarImovel(imovel.id, ativar);
      setConfirmando(undefined);
      if (dados?.itens.length === 1 && pagina > 1) setPagina(pagina - 1); else recarregar();
    } catch (causa) {
      setErroMutacao(mensagemErro(causa));
    } finally {
      setOcupado(0);
    }
  }

  return <>
    <CabecalhoPagina titulo="Imóveis" descricao="Espaços bem apresentados, novas possibilidades." acoes={<AcaoIcone icone={IconeAdicionar} rotulo="Novo imóvel" to="/admin/imoveis/novo" />} />
    <form className={estilos.barraFiltros} onSubmit={aplicar}>
      <label>Buscar<input value={rascunho.busca} onChange={(evento) => setRascunho({ ...rascunho, busca: evento.target.value })} placeholder="Título, bairro, cidade ou #código" /></label>
      <SeletorFiltro rotulo="Situação do anúncio" valor={rascunho.status} opcoes={[{ valor: '' as const, rotulo: 'Todas' }, ...Object.entries(rotulosStatusImovel).map(([valor, rotulo]) => ({ valor: valor as Filtros['status'], rotulo }))]} aoMudar={(valor) => setRascunho({ ...rascunho, status: valor }, true)} />
      <SeletorFiltro rotulo="Cadastro" valor={rascunho.ativo} opcoes={[{ valor: 'true' as const, rotulo: 'Ativos' }, { valor: 'false' as const, rotulo: 'Inativos' }]} aoMudar={(valor) => setRascunho({ ...rascunho, ativo: valor }, true)} />
      <div className={estilos.acoesFiltros}><AcaoIcone icone={IconeBuscar} rotulo="Buscar" tipo="submit" />
      {(resumo.length > 0 || rascunho.busca || rascunho.status || rascunho.ativo === 'false') && <button type="button" className="buttonGhost" onClick={() => { setRascunho(filtrosIniciais, true); }}>Limpar</button>}</div>
    </form>
    {resumo.length > 0 && <div aria-label="Filtros aplicados" className="mb-4 flex flex-wrap gap-2">{resumo.map(({ campo, rotulo }) => <button key={campo} type="button" className="inline-flex min-h-11 max-w-full items-center gap-2 rounded border border-line bg-paper px-3 text-sm text-ink" aria-label={`Remover filtro: ${rotulo}`} onClick={() => removerFiltro(campo)}><span className="break-words">{rotulo}</span><IconeFechar size={14} className="shrink-0" aria-hidden="true" /></button>)}</div>}
    {erroMutacao && !confirmando && <Aviso tom="erro">{erroMutacao}</Aviso>}
    <EstadoCarregamento compacto carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && !carregando && (
      <section>
        <p role="status" className="mb-4 mt-0 text-sm text-muted">{`${dados.total} ${dados.total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`}</p>
        {!dados.itens.length && !filtros.busca && !filtros.status && filtros.ativo === 'true'
          ? <div className="px-5 py-10 text-center text-muted"><h2>Seu portfólio começa aqui.</h2><p>Cadastre o primeiro imóvel para apresentá-lo no site.</p><Link to="/admin/imoveis/novo" className="button">Cadastrar imóvel</Link></div>
          : <>
            <Tabela<FichaImovel> itens={itens} chave={(imovel) => imovel.id} linkLinha={(imovel) => `/admin/imoveis/${imovel.id}`} vazio="Nenhum imóvel encontrado com esses filtros." rotulo="Imóveis" colunas={[
              { titulo: 'Imóvel', celula: (imovel) => {
                const capa = imovel.midias.find((midia) => midia.capa) ?? imovel.midias.find((midia) => midia.tipo === 'IMAGEM');
                return <div className="flex items-center gap-3">
                  <span className="grid h-14 w-[72px] shrink-0 place-items-center overflow-hidden rounded bg-soft text-[11px] text-muted">{capa ? <img src={capa.url} alt="" className="h-full w-full object-cover" /> : 'Sem foto'}</span>
                  <span className="min-w-0"><Link to={`/admin/imoveis/${imovel.id}`}><strong>{imovel.titulo}</strong></Link><small className="mt-1 block text-muted">{codigoImovel(imovel.id)} {imovel.tipo?.nome ?? 'Imóvel'} {imovel.bairro}, {imovel.cidade}/{imovel.estado}</small>{imovel.corretor && <small className="block text-muted">Responsável: <Link to={urlFichaCorretor(imovel.corretor.id, corretor?.id)}>{imovel.corretor.nome}</Link></small>}</span>
                </div>;
              } },
              { titulo: 'Valor', celula: (imovel) => { const preco = valorPrincipal(imovel); return <>{preco ? dinheiro(preco.valor) : 'Sob consulta'}<small className="mt-1 block text-muted">{imovel.finalidade?.nome ?? ''}{preco?.tipo === 'locacao' ? ' por mês' : ''}</small></>; } },
              { titulo: 'Situação', celula: (imovel) => <div className="flex flex-wrap gap-1.5"><Etiqueta tom={imovel.status === 'DISPONIVEL' ? 'neutro' : 'atencao'}>{rotulosStatusImovel[imovel.status]}</Etiqueta>{imovel.destaque && <Etiqueta tom="atencao">Destaque</Etiqueta>}{!imovel.ativo && <Etiqueta tom="alerta">Inativo</Etiqueta>}</div> },
              { titulo: 'Ações', acoes: true, celula: (imovel) => <div className={`${estilos.acoes} max-lg:justify-end`}>
                {podeEditar(imovel) && <AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={imovel.titulo} to={`/admin/imoveis/${imovel.id}/editar`} desabilitado={!!ocupado} />}
                {podeEditar(imovel) && <AcaoIcone icone={imovel.ativo ? IconeArquivar : IconeDesarquivar} rotulo={imovel.ativo ? 'Desativar' : 'Reativar'} contexto={imovel.titulo} tom={imovel.ativo ? 'perigo' : 'neutro'} desabilitado={!!ocupado} ocupado={ocupado === imovel.id} aoClicar={() => { setErroMutacao(''); setConfirmando(imovel); }} />}
              </div> },
            ]} />
            <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
          </>}
      </section>
    )}
    {confirmando && <ConfirmarAcao titulo={`${confirmando.ativo ? 'Desativar' : 'Reativar'} imóvel`} descricao={<><p>{confirmando.titulo}. {confirmando.ativo ? 'Seu histórico e suas mídias serão preservados.' : 'O cadastro voltará a ficar ativo.'}</p>{erroMutacao && <Aviso tom="erro">{erroMutacao}</Aviso>}</>} confirmar={confirmando.ativo ? 'Desativar imóvel' : 'Reativar imóvel'} perigo={confirmando.ativo} ocupado={!!ocupado} aoConfirmar={() => alternarAtivo(confirmando)} aoFechar={() => { if (!ocupado) setConfirmando(undefined); }} />}
  </>;
}
