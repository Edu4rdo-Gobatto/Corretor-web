import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
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
import { estilos } from '../../componentes/estilosPainel';

interface Filtros { busca: string; status: '' | StatusImovel; ativo: 'true' | 'false'; semFoto: boolean }
const filtrosIniciais: Filtros = { busca: '', status: '', ativo: 'true', semFoto: false };

export default function Imoveis() {
  const { corretor } = useSessao();
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [rascunho, setRascunho] = useState(filtrosIniciais);
  const [erroMutacao, setErroMutacao] = useState('');
  const [ocupado, setOcupado] = useState(0);
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarFichas({ pagina, limite: 12, busca: filtros.busca || undefined, status: filtros.status || undefined, ativo: filtros.ativo === 'true' }), [pagina, filtros]));
  const itens = (dados?.itens ?? []).filter((imovel) => !filtros.semFoto || !imovel.midias.some((midia) => midia.tipo === 'IMAGEM'));
  const podeEditar = (imovel: FichaImovel) => corretor?.cargo === 'ADMIN' || corretor?.id === imovel.corretor_id;

  function aplicar(evento: FormEvent) {
    evento.preventDefault();
    setPagina(1);
    setFiltros({ ...rascunho, busca: rascunho.busca.trim() });
  }
  async function alternarAtivo(imovel: FichaImovel) {
    const ativar = !imovel.ativo;
    if (!confirm(ativar ? 'Reativar este imóvel?' : 'Desativar este imóvel? Seu histórico e suas mídias serão preservados.')) return;
    setOcupado(imovel.id);
    setErroMutacao('');
    try {
      await api.ativarImovel(imovel.id, ativar);
      if (dados?.itens.length === 1 && pagina > 1) setPagina(pagina - 1); else recarregar();
    } catch (causa) {
      setErroMutacao(mensagemErro(causa));
    } finally {
      setOcupado(0);
    }
  }

  return <>
    <CabecalhoPagina rotulo="SEU PORTFÓLIO" titulo="Imóveis" descricao="Espaços bem apresentados, novas possibilidades." acoes={<Link className="button" to="/admin/imoveis/novo">+ Novo imóvel</Link>} />
    <form className={estilos.barraFiltros} onSubmit={aplicar}>
      <label>Buscar<input value={rascunho.busca} onChange={(evento) => setRascunho({ ...rascunho, busca: evento.target.value })} placeholder="Título, bairro, cidade ou #código" /></label>
      <label>Situação do anúncio<select value={rascunho.status} onChange={(evento) => setRascunho({ ...rascunho, status: evento.target.value as Filtros['status'] })}><option value="">Todas</option>{Object.entries(rotulosStatusImovel).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}</select></label>
      <label>Cadastro<select value={rascunho.ativo} onChange={(evento) => setRascunho({ ...rascunho, ativo: evento.target.value as Filtros['ativo'] })}><option value="true">Ativos</option><option value="false">Inativos</option></select></label>
      <label className="flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" checked={rascunho.semFoto} onChange={(evento) => setRascunho({ ...rascunho, semFoto: evento.target.checked })} />Só sem foto (nesta página)</label>
      <button className="buttonSecondary" type="submit">Filtrar</button>
      {(filtros.busca || filtros.status || filtros.semFoto || filtros.ativo === 'false') && <button type="button" className="buttonGhost" onClick={() => { setRascunho(filtrosIniciais); setFiltros(filtrosIniciais); setPagina(1); }}>Limpar</button>}
    </form>
    {erroMutacao && <p className="error" role="alert">{erroMutacao}</p>}
    <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && (
      <section className={estilos.painel}>
        {!dados.itens.length && !filtros.busca && !filtros.status && filtros.ativo === 'true'
          ? <div className="px-5 py-10 text-center text-muted"><h2>Seu portfólio começa aqui.</h2><p>Cadastre o primeiro imóvel para apresentá-lo no site.</p><Link to="/admin/imoveis/novo" className="button">Cadastrar imóvel</Link></div>
          : <>
            <Tabela<FichaImovel> itens={itens} chave={(imovel) => imovel.id} vazio="Nenhum imóvel encontrado com esses filtros." rotulo="Imóveis" colunas={[
              { titulo: 'Imóvel', celula: (imovel) => {
                const capa = imovel.midias.find((midia) => midia.capa) ?? imovel.midias.find((midia) => midia.tipo === 'IMAGEM');
                return <div className="flex items-center gap-3">
                  <span className="grid h-14 w-[72px] shrink-0 place-items-center overflow-hidden rounded bg-soft text-[11px] text-muted">{capa ? <img src={capa.url} alt="" className="h-full w-full object-cover" /> : 'Sem foto'}</span>
                  <span><strong>{imovel.titulo}</strong><small className="mt-1 block text-muted">{codigoImovel(imovel.id)} · {imovel.tipo?.nome ?? 'Imóvel'} · {imovel.bairro}, {imovel.cidade}/{imovel.estado}</small>{imovel.corretor && corretor?.cargo === 'ADMIN' && <small className="block text-muted">Responsável: {imovel.corretor.nome}</small>}</span>
                </div>;
              } },
              { titulo: 'Valor', celula: (imovel) => { const preco = valorPrincipal(imovel); return <>{preco ? dinheiro(preco.valor) : 'Sob consulta'}<small className="mt-1 block text-muted">{imovel.finalidade?.nome ?? ''}{preco?.tipo === 'locacao' ? ' · por mês' : ''}</small></>; } },
              { titulo: 'Situação', celula: (imovel) => <div className="flex flex-wrap gap-1.5"><Etiqueta tom={imovel.status === 'DISPONIVEL' ? 'neutro' : 'atencao'}>{rotulosStatusImovel[imovel.status]}</Etiqueta>{imovel.destaque && <Etiqueta tom="atencao">Destaque</Etiqueta>}{!imovel.ativo && <Etiqueta tom="alerta">Inativo</Etiqueta>}</div> },
              { titulo: 'Ações', celula: (imovel) => <div className={`${estilos.acoes} max-lg:justify-end`}>
                <Link to={`/admin/imoveis/${imovel.id}/editar`}>{podeEditar(imovel) ? 'Editar' : 'Ver ficha'}</Link>
                {podeEditar(imovel) && <button className="buttonGhost text-error!" disabled={!!ocupado} onClick={() => void alternarAtivo(imovel)}>{ocupado === imovel.id ? 'Salvando…' : imovel.ativo ? 'Desativar' : 'Reativar'}</button>}
              </div> },
            ]} />
            <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
          </>}
      </section>
    )}
  </>;
}
