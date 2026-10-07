import { useFiltrosAutomaticos } from '../../hooks/useFiltrosAutomaticos';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { IconeAdicionar, IconeBuscar, IconeDesarquivar, IconeEditar, IconeFechar, IconeFinalizar, IconeWhatsapp } from '../../componentes/Icones';
import { api, type FiltrosPessoas } from '../../servicos/api';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useSessao } from '../../hooks/useSessao';
import { data, mensagemErro } from '../../servicos/formato';
import { telefoneWhatsapp } from '../../servicos/contato';
import { podeAlterarStatusContato, podeEditarPessoa } from '../../servicos/pessoas';
import { baixarCsvContatos } from '../../servicos/exportacaoContatos';
import type { Pessoa, Referencia, StatusContato } from '../../tipos';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import Campo from '../../componentes/Campo';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Paginacao from '../../componentes/Paginacao';
import SeletorRegistro from '../../componentes/SeletorRegistro';
import Tabela from '../../componentes/Tabela';
import AcaoIcone from '../../componentes/AcaoIcone';
import Aviso from '../../componentes/Aviso';
import { estilos } from '../../componentes/estilosPainel';
import EditorPessoa from './EditorPessoa';
import { useAcoesPainel } from '../../hooks/useComandosPainel';

interface Filtros { busca: string; imovel: Referencia | null; desde: string; ate: string }
const filtrosIniciais: Filtros = { busca: '', imovel: null, desde: '', ate: '' };
const LIMITE = 10;
const listas: { status: StatusContato; titulo: string; descricao: string }[] = [
  { status: 'PENDENTE', titulo: 'Pendentes', descricao: 'Quem ainda aguarda seu primeiro retorno.' },
  { status: 'RESPONDIDO', titulo: 'Atendidos', descricao: 'Conversas em andamento. Finalize quando o atendimento terminar.' },
];

function paraApi(filtros: Filtros): FiltrosPessoas {
  return {
    busca: filtros.busca || undefined, imovel_id: filtros.imovel?.id, ativo: true,
    // Dia inteiro no fuso do escritório (America/Cuiaba, UTC−04:00).
    criado_desde: filtros.desde ? `${filtros.desde}T00:00:00.000-04:00` : undefined,
    criado_ate: filtros.ate ? `${filtros.ate}T23:59:59.999-04:00` : undefined,
  };
}

type PropriedadesLista = {
  status: StatusContato; titulo: string; descricao: string; filtros: Filtros; versao: number; ocupado: number; pagina: number; aoPaginar: (pagina: number) => void;
  aoMudar: (pessoa: Pessoa, destino: StatusContato) => Promise<void>;
  aoFinalizar: (pessoa: Pessoa) => void; aoEditar: (pessoa: Pessoa) => void;
};

function ListaContatos({ status, titulo, descricao, filtros, versao, ocupado, pagina, aoPaginar, aoMudar, aoFinalizar, aoEditar }: PropriedadesLista) {
  const { corretor } = useSessao();
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarPessoas({ ...paraApi(filtros), status_contato: status, pagina, limite: LIMITE }), [filtros, status, pagina]), versao);
  useEffect(() => {
    if (dados && !carregando && !erro && pagina > Math.max(1, dados.total_paginas)) aoPaginar(Math.max(1, dados.total_paginas));
  }, [dados, carregando, erro, pagina, aoPaginar]);
  return <section id="contatos-lista" role="tabpanel" aria-labelledby={`aba-${status}`} className="min-w-0">
    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
      <h2 className="m-0 text-[22px] text-ink">{titulo}{dados && !carregando && !erro && <span className="ml-2 text-base font-normal text-muted">({dados.total})</span>}</h2>
      <button type="button" className="buttonGhost" aria-label={`Exportar a página ${pagina} de ${titulo.toLowerCase()} em CSV`} disabled={!dados?.itens.length || carregando || Boolean(erro)} onClick={() => dados && !erro && !carregando && baixarCsvContatos(dados.itens, `${status.toLowerCase()}-pagina-${pagina}`)}>CSV desta página</button>
    </div>
    <p className="mb-4 mt-0 text-base text-muted">{descricao}</p>
    <EstadoCarregamento compacto carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && !carregando && <>
      <Tabela<Pessoa> itens={dados.itens} chave={(pessoa) => pessoa.id} vazio={`Nenhum contato ${status === 'PENDENTE' ? 'pendente' : status === 'RESPONDIDO' ? 'em atendimento' : 'finalizado'} encontrado. Ajuste os filtros para continuar.`} rotulo={titulo} linkLinha={(pessoa) => `/admin/pessoas/${pessoa.id}`} colunas={[
        { titulo: 'Contato', celula: (pessoa) => <>
          <Link to={`/admin/pessoas/${pessoa.id}`} className="font-semibold no-underline hover:underline">{pessoa.nome}</Link>
          <small className="mt-1 block wrap-anywhere text-base text-muted">{pessoa.telefone || 'Telefone não informado'}</small>
          {pessoa.email && <small className="mt-1 block wrap-anywhere text-base text-muted">{pessoa.email}</small>}
          {pessoa.mensagem && <details data-nao-abrir-linha className="mt-2 text-base"><summary className="cursor-pointer">Ver mensagem</summary><p className="mb-0 mt-2 whitespace-pre-wrap wrap-anywhere">{pessoa.mensagem}</p></details>}
        </> },
        { titulo: 'Recebido em', celula: (pessoa) => <>
          <span>{data(pessoa.criado_em)}</span>
          <small className="mt-1 flex flex-wrap items-center gap-2 text-base text-muted">{pessoa.imovel_id ? <Link to={`/admin/imoveis/${pessoa.imovel_id}/editar`}>Imóvel #{pessoa.imovel_id}</Link> : <span>Sem imóvel vinculado</span>}</small>
        </> },
        { titulo: 'Ações', acoes: true, classe: '@min-[58rem]/tabela:min-w-[28rem]', celula: (pessoa) => <>
          {pessoa.telefone && <a className="buttonSecondary shrink-0 whitespace-nowrap" href={`https://wa.me/${telefoneWhatsapp(pessoa.telefone)}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp de ${pessoa.nome}`}><IconeWhatsapp size={22} aria-hidden="true" />WhatsApp</a>}
          {podeEditarPessoa(corretor, pessoa) && <AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={pessoa.nome} aoClicar={() => aoEditar(pessoa)} desabilitado={Boolean(ocupado)} />}
          {status === 'RESPONDIDO' && podeEditarPessoa(corretor, pessoa) && <AcaoIcone icone={IconeFinalizar} rotulo="Finalizar" contexto={pessoa.nome} aoClicar={() => aoFinalizar(pessoa)} desabilitado={Boolean(ocupado)} />}
          {status === 'FINALIZADO' ? corretor?.cargo === 'ADMIN' && <AcaoIcone icone={IconeDesarquivar} rotulo="Reabrir" contexto={pessoa.nome} aoClicar={() => void aoMudar(pessoa, 'RESPONDIDO')} desabilitado={Boolean(ocupado)} ocupado={ocupado === pessoa.id} />
            : <label className="controle-atendido">
              <input type="checkbox" className="w-auto!" checked={status === 'RESPONDIDO'} aria-label={`Marcar ${pessoa.nome} como ${status === 'RESPONDIDO' ? 'pendente' : 'atendida'}`} disabled={Boolean(ocupado) || !podeEditarPessoa(corretor, pessoa)} aria-busy={ocupado === pessoa.id || undefined} onChange={() => void aoMudar(pessoa, status === 'RESPONDIDO' ? 'PENDENTE' : 'RESPONDIDO')} />
              <span>{ocupado === pessoa.id ? 'Salvando…' : 'Atendido'}</span>
            </label>}
        </> },
      ]} />
      <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={aoPaginar} />
    </>}
  </section>;
}

/** Abas de atendimento com filtros comuns e paginação independente. */
export default function Contatos() {
  const { corretor } = useSessao();
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [aba, setAba] = useState<StatusContato>('PENDENTE');
  const [paginas, setPaginas] = useState<Record<StatusContato, number>>({ PENDENTE: 1, RESPONDIDO: 1, FINALIZADO: 1 });
  const { rascunho, definir: setRascunho, aplicarAgora, erro: erroFiltro } = useFiltrosAutomaticos({
    iniciais: filtrosIniciais, normalizar: (valor) => ({ ...valor, busca: valor.busca.trim() }),
    validar: (valor) => valor.desde && valor.ate && valor.desde > valor.ate ? 'A data final deve ser igual ou posterior à inicial.' : '',
    aoAplicar: (valor) => { setFiltros(valor); setPaginas({ PENDENTE: 1, RESPONDIDO: 1, FINALIZADO: 1 }); },
  });
  const [erroMutacao, setErroMutacao] = useState('');
  const [versao, setVersao] = useState(0);
  const [ocupado, setOcupado] = useState(0);
  const mutacaoAtiva = useRef(false);
  const [confirmando, setConfirmando] = useState<Pessoa>();
  const [editando, setEditando] = useState<Pessoa | null | undefined>();
  useAcoesPainel(useMemo(() => !ocupado ? [{ id: 'nova-pessoa', rotulo: 'Nova pessoa', executar: () => setEditando(null) }] : [], [ocupado]));
  const buscarImoveis = useCallback(async (termo: string): Promise<Referencia[]> => (await api.listarFichas({ busca: termo || undefined, limite: 10, ativo: true })).itens.map((item) => ({ id: item.id, nome: item.titulo })), []);
  const recarregarTudo = () => setVersao((atual) => atual + 1);
  async function mover(pessoa: Pessoa, destino: StatusContato) {
    if (mutacaoAtiva.current || !podeAlterarStatusContato(corretor, pessoa, destino)) return;
    mutacaoAtiva.current = true;
    setOcupado(pessoa.id);
    setErroMutacao('');
    try {
      await api.salvarPessoa({ nome: pessoa.nome, telefone: pessoa.telefone ?? '', status_contato: destino }, pessoa.id, pessoa);
      setConfirmando(undefined);
      recarregarTudo();
    } catch (causa) { setErroMutacao(mensagemErro(causa)); }
    finally { mutacaoAtiva.current = false; setOcupado(0); }
  }
  function aplicar(evento: FormEvent) { evento.preventDefault(); aplicarAgora(); }
  function limpar() { setRascunho(filtrosIniciais, true); }
  function removerFiltro(campo: keyof Filtros) { setRascunho({ ...filtros, [campo]: filtrosIniciais[campo] }, true); }
  const resumo: { campo: keyof Filtros; rotulo: string }[] = [
    ...(filtros.busca ? [{ campo: 'busca' as const, rotulo: `Busca: ${filtros.busca}` }] : []),
    ...(filtros.imovel ? [{ campo: 'imovel' as const, rotulo: `Imóvel: ${filtros.imovel.nome}` }] : []),
    ...(filtros.desde ? [{ campo: 'desde' as const, rotulo: `Desde: ${filtros.desde.split('-').reverse().join('/')}` }] : []),
    ...(filtros.ate ? [{ campo: 'ate' as const, rotulo: `Até: ${filtros.ate.split('-').reverse().join('/')}` }] : []),
  ];
  const filtrando = resumo.length > 0 || rascunho.busca || rascunho.imovel || rascunho.desde || rascunho.ate;
  const abas = [...listas, { status: 'FINALIZADO' as const, titulo: 'Finalizados', descricao: 'Histórico dos atendimentos concluídos. Somente administradores podem reabri-los.' }];
  const paginar = useCallback((pagina: number) => setPaginas((atual) => ({ ...atual, [aba]: pagina })), [aba]);
  const listaAtual = abas.find((lista) => lista.status === aba)!;
  return <>
    <CabecalhoPagina titulo="Contatos" descricao="Organize seus retornos e acompanhe cada atendimento." acoes={<AcaoIcone icone={IconeAdicionar} rotulo="Nova pessoa" aoClicar={() => setEditando(null)} desabilitado={Boolean(ocupado)} />} />
    <form noValidate className={estilos.barraFiltros} onSubmit={aplicar}>
      <Campo rotulo="Buscar" classe="min-w-[min(100%,20rem)] flex-1"><input type="search" value={rascunho.busca} onChange={(evento) => setRascunho({ ...rascunho, busca: evento.target.value })} placeholder="Nome, telefone, e-mail ou documento" /></Campo>
      <div className="w-full min-w-0 @min-[38rem]/principal:w-[260px]"><SeletorRegistro rotulo="Imóvel" valor={rascunho.imovel} buscar={buscarImoveis} aoEscolher={(valor) => setRascunho({ ...rascunho, imovel: valor }, true)} /></div>
      <Campo rotulo="De"><input type="date" value={rascunho.desde} onChange={(evento) => setRascunho({ ...rascunho, desde: evento.target.value }, true)} /></Campo>
      <Campo rotulo="Até" erro={erroFiltro || undefined}><input type="date" value={rascunho.ate} onChange={(evento) => setRascunho({ ...rascunho, ate: evento.target.value }, true)} /></Campo>
      <div className={estilos.acoesFiltros}><AcaoIcone icone={IconeBuscar} rotulo="Buscar" tipo="submit" />{filtrando && <button type="button" className="buttonGhost" onClick={limpar}>Limpar</button>}</div>
    </form>
    {resumo.length > 0 && <div aria-label="Filtros aplicados" className="mb-4 flex flex-wrap gap-2">{resumo.map(({ campo, rotulo }) => <button key={campo} type="button" className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border border-line bg-paper px-3 text-base text-ink" aria-label={`Remover filtro: ${rotulo}`} onClick={() => removerFiltro(campo)}><span className="break-words">{rotulo}</span><IconeFechar size={16} className="shrink-0" aria-hidden="true" /></button>)}</div>}
    {erroMutacao && !confirmando && <Aviso tom="erro">{erroMutacao}</Aviso>}
    <div role="tablist" aria-label="Situação dos contatos" className="mb-5 flex flex-wrap gap-2 border-b border-line pb-3">
      {abas.map((lista, indice) => <button key={lista.status} id={`aba-${lista.status}`} role="tab" type="button" aria-selected={aba === lista.status} aria-controls="contatos-lista" tabIndex={aba === lista.status ? 0 : -1} className={`min-h-12 rounded-xl border px-4 py-2 font-semibold ${aba === lista.status ? 'border-gold bg-soft text-ink' : 'border-transparent bg-transparent text-muted'}`} onClick={() => { aplicarAgora(); setAba(lista.status); }} onKeyDown={(evento) => {
        const deslocamento = evento.key === 'ArrowRight' ? 1 : evento.key === 'ArrowLeft' ? -1 : 0;
        if (deslocamento || evento.key === 'Home' || evento.key === 'End') {
          evento.preventDefault(); const proxima = evento.key === 'Home' ? 0 : evento.key === 'End' ? abas.length - 1 : (indice + deslocamento + abas.length) % abas.length;
          aplicarAgora(); setAba(abas[proxima].status); document.getElementById(`aba-${abas[proxima].status}`)?.focus();
        }
      }}>{lista.titulo}</button>)}
    </div>
    <ListaContatos {...listaAtual} filtros={filtros} versao={versao} ocupado={ocupado} pagina={paginas[aba]} aoPaginar={paginar} aoMudar={mover} aoFinalizar={(pessoa) => { setErroMutacao(''); setConfirmando(pessoa); }} aoEditar={setEditando} />
    {confirmando && <ConfirmarAcao titulo="Finalizar atendimento?" descricao={<><p>O atendimento de {confirmando.nome} sairá das filas Pendentes e Atendidos. Você poderá consultá-lo em Finalizados.</p>{erroMutacao && <Aviso tom="erro">{erroMutacao}</Aviso>}</>} confirmar="Finalizar atendimento" ocupado={Boolean(ocupado)} aoConfirmar={() => mover(confirmando, 'FINALIZADO')} aoFechar={() => { if (!mutacaoAtiva.current) { setConfirmando(undefined); setErroMutacao(''); } }} />}
    {editando !== undefined && <EditorPessoa pessoa={editando} aoFechar={() => setEditando(undefined)} aoSalvar={recarregarTudo} />}
  </>;
}
