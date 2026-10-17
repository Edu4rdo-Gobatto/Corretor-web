import { useFiltrosAutomaticos } from '../../hooks/useFiltrosAutomaticos';
import { useParametrosLista } from '../../hooks/useParametrosLista';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconeDesarquivar, IconeEditar, IconeFinalizar, IconeSucesso, IconeWhatsapp } from '../../componentes/Icones';
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
import BarraFiltros, { CampoBusca } from '../../componentes/BarraFiltros';
import BotaoAdicionar from '../../componentes/BotaoAdicionar';
import Aviso from '../../componentes/Aviso';
import EditorPessoa from './EditorPessoa';
import { useAcoesPainel } from '../../hooks/useComandosPainel';

interface Filtros { busca: string; imovel: Referencia | null; desde: string; ate: string }
const filtrosIniciais: Filtros = { busca: '', imovel: null, desde: '', ate: '' };
type ParametrosUrl = { busca: string; desde: string; ate: string; aba: StatusContato };
const parametrosIniciais: ParametrosUrl = { busca: '', desde: '', ate: '', aba: 'PENDENTE' };
const abasValidas = { aba: ['PENDENTE', 'RESPONDIDO', 'FINALIZADO'] } as const;
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
      <h2 className="m-0 text-[22px] text-ink">{titulo}{dados && !carregando && !erro && <span className="contagem-painel ml-2 font-normal">({dados.total})</span>}</h2>
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
        { titulo: 'Ações', acoes: true, celula: (pessoa) => <>
          {pessoa.telefone && <AcaoIcone icone={IconeWhatsapp} rotulo="WhatsApp" contexto={pessoa.nome} href={`https://wa.me/${telefoneWhatsapp(pessoa.telefone)}`} target="_blank" />}
          {podeEditarPessoa(corretor, pessoa) && <AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={pessoa.nome} aoClicar={() => aoEditar(pessoa)} desabilitado={Boolean(ocupado)} />}
          {status === 'RESPONDIDO' && podeEditarPessoa(corretor, pessoa) && <AcaoIcone icone={IconeFinalizar} rotulo="Finalizar" contexto={pessoa.nome} aoClicar={() => aoFinalizar(pessoa)} desabilitado={Boolean(ocupado)} />}
          {status === 'FINALIZADO' ? corretor?.cargo === 'ADMIN' && <AcaoIcone icone={IconeDesarquivar} rotulo="Reabrir" contexto={pessoa.nome} aoClicar={() => void aoMudar(pessoa, 'RESPONDIDO')} desabilitado={Boolean(ocupado)} ocupado={ocupado === pessoa.id} />
            : podeEditarPessoa(corretor, pessoa) && (status === 'RESPONDIDO'
              ? <AcaoIcone icone={IconeDesarquivar} rotulo="Voltar para pendente" contexto={pessoa.nome} aoClicar={() => void aoMudar(pessoa, 'PENDENTE')} desabilitado={Boolean(ocupado)} ocupado={ocupado === pessoa.id} />
              : <AcaoIcone icone={IconeSucesso} rotulo="Marcar como atendido" contexto={pessoa.nome} aoClicar={() => void aoMudar(pessoa, 'RESPONDIDO')} desabilitado={Boolean(ocupado)} ocupado={ocupado === pessoa.id} />)}
        </> },
      ]} />
      <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={aoPaginar} />
    </>}
  </section>;
}

/** Abas de atendimento com filtros comuns e paginação independente. */
export default function Contatos() {
  const { corretor } = useSessao();
  const { filtros: parametros, definirFiltros } = useParametrosLista<ParametrosUrl>(parametrosIniciais, abasValidas);
  const [imovel, setImovel] = useState<Referencia | null>(null);
  const aba = parametros.aba;
  const filtros = useMemo<Filtros>(() => ({ busca: parametros.busca, imovel, desde: parametros.desde, ate: parametros.ate }), [parametros, imovel]);
  const setAba = (destino: StatusContato) => definirFiltros({ aba: destino });
  const [paginas, setPaginas] = useState<Record<StatusContato, number>>({ PENDENTE: 1, RESPONDIDO: 1, FINALIZADO: 1 });
  const { rascunho, definir: setRascunho, aplicarAgora, erro: erroFiltro } = useFiltrosAutomaticos({
    iniciais: filtros, externos: filtros, normalizar: (valor) => ({ ...valor, busca: valor.busca.trim() }),
    validar: (valor) => valor.desde && valor.ate && valor.desde > valor.ate ? 'A data final deve ser igual ou posterior à inicial.' : '',
    aoAplicar: (valor) => { setImovel(valor.imovel); definirFiltros({ busca: valor.busca, desde: valor.desde, ate: valor.ate }); setPaginas({ PENDENTE: 1, RESPONDIDO: 1, FINALIZADO: 1 }); },
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
  function limpar() { setRascunho(filtrosIniciais, true); }
  const filtrado = (Object.keys(filtrosIniciais) as (keyof Filtros)[]).some((chave) => filtros[chave] !== filtrosIniciais[chave]);
  const abas = [...listas, { status: 'FINALIZADO' as const, titulo: 'Finalizados', descricao: 'Histórico dos atendimentos concluídos. Somente administradores podem reabri-los.' }];
  const paginar = useCallback((pagina: number) => setPaginas((atual) => ({ ...atual, [aba]: pagina })), [aba]);
  const listaAtual = abas.find((lista) => lista.status === aba)!;
  return <>
    <CabecalhoPagina titulo="Contatos" descricao="Organize seus retornos e acompanhe cada atendimento." acoes={<BotaoAdicionar rotulo="Nova pessoa" aoClicar={() => setEditando(null)} desabilitado={Boolean(ocupado)} />} />
    <BarraFiltros aoEnviar={aplicarAgora} filtrado={filtrado} aoLimpar={limpar}>
      <CampoBusca valor={rascunho.busca} aoMudar={(busca) => setRascunho({ ...rascunho, busca })} placeholder="Nome, telefone, e-mail ou documento" />
      <div className="w-full min-w-0 @min-[38rem]/principal:w-65"><SeletorRegistro rotulo="Imóvel" valor={rascunho.imovel} buscar={buscarImoveis} aoEscolher={(valor) => setRascunho({ ...rascunho, imovel: valor }, true)} /></div>
      <Campo rotulo="De"><input type="date" value={rascunho.desde} onChange={(evento) => setRascunho({ ...rascunho, desde: evento.target.value }, true)} /></Campo>
      <Campo rotulo="Até" erro={erroFiltro || undefined}><input type="date" value={rascunho.ate} onChange={(evento) => setRascunho({ ...rascunho, ate: evento.target.value }, true)} /></Campo>
    </BarraFiltros>
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
