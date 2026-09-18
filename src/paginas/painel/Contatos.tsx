import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, type FiltrosPessoas } from '../../servicos/api';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { data, mensagemErro } from '../../servicos/formato';
import { telefoneWhatsapp } from '../../servicos/contato';
import { baixarCsvContatos } from '../../servicos/exportacaoContatos';
import type { Pessoa, Referencia, StatusContato } from '../../tipos';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Etiqueta from '../../componentes/Etiqueta';
import Paginacao from '../../componentes/Paginacao';
import SeletorRegistro from '../../componentes/SeletorRegistro';
import { estilos } from '../../componentes/estilosPainel';
import EditorPessoa from './EditorPessoa';

const COLUNAS: { status: StatusContato; titulo: string; descricao: string }[] = [
  { status: 'PENDENTE', titulo: 'Pendentes', descricao: 'Chegaram e ainda não foram respondidos.' },
  { status: 'RESPONDIDO', titulo: 'Respondidos', descricao: 'Em atendimento.' },
  { status: 'FINALIZADO', titulo: 'Finalizados', descricao: 'Atendimento concluído.' },
];
const PROXIMOS: Record<StatusContato, { status: StatusContato; rotulo: string }[]> = {
  PENDENTE: [{ status: 'RESPONDIDO', rotulo: 'Marcar como respondido' }],
  RESPONDIDO: [{ status: 'FINALIZADO', rotulo: 'Finalizar' }, { status: 'PENDENTE', rotulo: 'Voltar a pendente' }],
  FINALIZADO: [{ status: 'RESPONDIDO', rotulo: 'Reabrir' }],
};
interface Filtros { busca: string; imovel: Referencia | null; desde: string; ate: string }
const filtrosIniciais: Filtros = { busca: '', imovel: null, desde: '', ate: '' };
const LIMITE = 10;

function paraApi(filtros: Filtros): FiltrosPessoas {
  return {
    busca: filtros.busca || undefined, imovel_id: filtros.imovel?.id, ativo: true,
    // Dia inteiro no fuso do escritório (America/Cuiaba, UTC−04:00).
    criado_desde: filtros.desde ? `${filtros.desde}T00:00:00.000-04:00` : undefined,
    criado_ate: filtros.ate ? `${filtros.ate}T23:59:59.999-04:00` : undefined,
  };
}

function ColunaContatos({ status, titulo, descricao, filtros, versao, aoMudar, aoEditar }: { status: StatusContato; titulo: string; descricao: string; filtros: Filtros; versao: number; aoMudar: () => void; aoEditar: (pessoa: Pessoa) => void }) {
  const [pagina, setPagina] = useState(1);
  const [ocupado, setOcupado] = useState(0);
  const [erroAcao, setErroAcao] = useState('');
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarPessoas({ ...paraApi(filtros), status_contato: status, pagina, limite: LIMITE }), [filtros, status, pagina, versao])); // eslint-disable-line react-hooks/exhaustive-deps
  async function mover(pessoa: Pessoa, destino: StatusContato) {
    setOcupado(pessoa.id);
    setErroAcao('');
    try { await api.salvarPessoa({ nome: pessoa.nome, telefone: pessoa.telefone ?? '', status_contato: destino }, pessoa.id, pessoa); aoMudar(); }
    catch (causa) { setErroAcao(mensagemErro(causa)); }
    finally { setOcupado(0); }
  }
  return (
    <section aria-label={titulo} className="flex min-w-0 flex-col rounded border border-line bg-soft p-3">
      <div className="mb-3 flex items-baseline justify-between gap-2 px-1"><h2 className="m-0 text-[20px] text-ink">{titulo} <span className="text-base font-normal text-muted">{dados ? `(${dados.total})` : ''}</span></h2>
        <button type="button" className="buttonGhost min-h-9 px-2 text-[12px]" disabled={!dados?.itens.length || carregando} onClick={() => dados && baixarCsvContatos(dados.itens, `${status.toLowerCase()}-pagina-${pagina}`)}>Exportar CSV</button></div>
      <p className="mb-3 px-1 text-[13px] text-muted">{descricao}</p>
      {erroAcao && <p className="error" role="alert">{erroAcao}</p>}
      <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
      {dados && !erro && !carregando && (dados.itens.length ? (
        <ul className="m-0 grid list-none gap-3 p-0">
          {dados.itens.map((pessoa) => (
            <li key={pessoa.id} className="rounded border border-line bg-paper p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0"><strong className="block">{pessoa.nome}</strong><small className="block wrap-anywhere text-muted">{pessoa.telefone}{pessoa.email ? ` · ${pessoa.email}` : ''}</small></div>
                <Etiqueta tom={pessoa.origem === 'SITE' ? 'atencao' : 'neutro'}>{pessoa.origem === 'SITE' ? 'Site' : 'Manual'}</Etiqueta>
              </div>
              <small className="mt-2 block text-muted">{data(pessoa.criado_em)}{pessoa.imovel_id ? <> · <Link to={`/admin/imoveis/${pessoa.imovel_id}/editar`}>imóvel #{pessoa.imovel_id}</Link></> : ' · sem imóvel vinculado'}</small>
              {pessoa.mensagem && <details className="mt-2 text-sm"><summary className="cursor-pointer">Ver mensagem</summary><p className="mt-1 whitespace-pre-wrap break-words">{pessoa.mensagem}</p></details>}
              <div className="mt-3 flex flex-wrap gap-2 text-[13px] [&_a]:inline-flex [&_a]:min-h-10 [&_a]:items-center [&_button]:min-h-10 [&_button]:px-2.5">
                {pessoa.telefone && <a href={`https://wa.me/${telefoneWhatsapp(pessoa.telefone)}`} target="_blank" rel="noreferrer">WhatsApp ↗</a>}
                <Link to={`/admin/pessoas/${pessoa.id}`}>Ficha</Link>
                <button type="button" className="buttonGhost" onClick={() => aoEditar(pessoa)}>Editar</button>
                {PROXIMOS[status].map((proximo) => <button key={proximo.status} type="button" className="buttonSecondary" disabled={!!ocupado} onClick={() => void mover(pessoa, proximo.status)}>{ocupado === pessoa.id ? 'Salvando…' : proximo.rotulo}</button>)}
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="px-1 py-6 text-center text-sm text-muted">Nenhum contato aqui.</p>)}
      {dados && <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />}
    </section>
  );
}

/** Contatos em três colunas: pendentes, respondidos e finalizados. */
export default function Contatos() {
  const [rascunho, setRascunho] = useState(filtrosIniciais);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [erroFiltro, setErroFiltro] = useState('');
  const [versao, setVersao] = useState(0);
  const [editando, setEditando] = useState<Pessoa | null | undefined>();
  const buscarImoveis = useCallback(async (termo: string): Promise<Referencia[]> => (await api.listarFichas({ busca: termo || undefined, limite: 10, ativo: true })).itens.map((item) => ({ id: item.id, nome: item.titulo })), []);
  const recarregarTudo = () => setVersao((atual) => atual + 1);
  function aplicar(evento: FormEvent) {
    evento.preventDefault();
    if (rascunho.desde && rascunho.ate && rascunho.desde > rascunho.ate) { setErroFiltro('A data final deve ser igual ou posterior à inicial.'); return; }
    setErroFiltro('');
    setFiltros({ ...rascunho, busca: rascunho.busca.trim() });
  }
  return <>
    <CabecalhoPagina rotulo="NOVAS CONEXÕES" titulo="Contatos" descricao="Quem chegou pelo site ou pelo balcão, do primeiro contato ao fechamento." acoes={<button className="button" onClick={() => setEditando(null)}>+ Nova pessoa</button>} />
    <form noValidate className={estilos.barraFiltros} onSubmit={aplicar}>
      <label>Buscar<input value={rascunho.busca} onChange={(evento) => setRascunho({ ...rascunho, busca: evento.target.value })} placeholder="Nome, telefone, e-mail ou documento" /></label>
      <div className="min-w-[260px]"><SeletorRegistro rotulo="Imóvel" valor={rascunho.imovel} buscar={buscarImoveis} aoEscolher={(valor) => setRascunho({ ...rascunho, imovel: valor })} /></div>
      <label>De<input type="date" value={rascunho.desde} onChange={(evento) => setRascunho({ ...rascunho, desde: evento.target.value })} /></label>
      <label>Até<input type="date" value={rascunho.ate} onChange={(evento) => setRascunho({ ...rascunho, ate: evento.target.value })} /></label>
      <button type="submit" className="buttonSecondary">Filtrar</button>
      <button type="button" className="buttonGhost" onClick={() => { setRascunho(filtrosIniciais); setFiltros(filtrosIniciais); setErroFiltro(''); }}>Limpar</button>
    </form>
    {erroFiltro && <p className="error" role="alert">{erroFiltro}</p>}
    <div className="grid items-start gap-4 @4xl/principal:grid-cols-3">
      {COLUNAS.map((coluna) => <ColunaContatos key={coluna.status} {...coluna} filtros={filtros} versao={versao} aoMudar={recarregarTudo} aoEditar={setEditando} />)}
    </div>
    {editando !== undefined && <EditorPessoa pessoa={editando} aoFechar={() => setEditando(undefined)} aoSalvar={recarregarTudo} />}
  </>;
}
