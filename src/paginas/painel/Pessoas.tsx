import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { IconeEditar, IconeAdicionar, IconeBuscar, IconeFechar } from '../../componentes/Icones';
import { api } from '../../servicos/api';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useSessao } from '../../hooks/useSessao';
import { podeEditarPessoa } from '../../servicos/pessoas';
import { data, rotulosStatusContato } from '../../servicos/formato';
import type { Pessoa, StatusContato } from '../../tipos';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Etiqueta from '../../componentes/Etiqueta';
import Paginacao from '../../componentes/Paginacao';
import Tabela from '../../componentes/Tabela';
import SeletorFiltro from '../../componentes/SeletorFiltro';
import AcaoIcone from '../../componentes/AcaoIcone';
import { estilos } from '../../componentes/estilosPainel';
import EditorPessoa from './EditorPessoa';
import { useAcoesPainel } from '../../hooks/useComandosPainel';

interface Filtros { busca: string; status: '' | StatusContato; ativo: 'true' | 'false' }
const filtrosIniciais: Filtros = { busca: '', status: '', ativo: 'true' };

export const formatarDocumento = (valor: string | null) => {
  if (!valor) return '';
  if (valor.length === 11) return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (valor.length === 14) return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return valor;
};

export default function Pessoas() {
  const { corretor } = useSessao();
  const [pagina, setPagina] = useState(1);
  const [rascunho, setRascunho] = useState(filtrosIniciais);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [editando, setEditando] = useState<Pessoa | null | undefined>();
  useAcoesPainel(useMemo(() => [{ id: 'nova-pessoa', rotulo: 'Nova pessoa', executar: () => setEditando(null) }], []));
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarPessoas({ pagina, limite: 15, busca: filtros.busca || undefined, status_contato: filtros.status || undefined, ativo: filtros.ativo === 'true' }), [pagina, filtros]));
  function aplicar(evento: FormEvent) {
    evento.preventDefault();
    setPagina(1);
    setFiltros({ ...rascunho, busca: rascunho.busca.trim() });
  }
  function removerFiltro(campo: keyof Filtros) {
    setFiltros((atual) => ({ ...atual, [campo]: filtrosIniciais[campo] }));
    setRascunho((atual) => ({ ...atual, [campo]: filtrosIniciais[campo] }));
    setPagina(1);
  }
  const resumo: { campo: keyof Filtros; rotulo: string }[] = [
    ...(filtros.busca ? [{ campo: 'busca' as const, rotulo: `Busca: ${filtros.busca}` }] : []),
    ...(filtros.status ? [{ campo: 'status' as const, rotulo: rotulosStatusContato[filtros.status] }] : []),
    ...(filtros.ativo === 'false' ? [{ campo: 'ativo' as const, rotulo: 'Inativos' }] : []),
  ];
  const filtrando = resumo.length > 0 || rascunho.busca || rascunho.status || rascunho.ativo === 'false';
  return <>
    <CabecalhoPagina titulo="Pessoas" descricao="Clientes, proprietários e inquilinos: uma pessoa, um cadastro." acoes={<AcaoIcone icone={IconeAdicionar} rotulo="Nova pessoa" aoClicar={() => setEditando(null)} />} />
    <form className={estilos.barraFiltros} onSubmit={aplicar}>
      <label className="min-w-[min(100%,22rem)] flex-1">Buscar<input type="search" value={rascunho.busca} onChange={(evento) => setRascunho({ ...rascunho, busca: evento.target.value })} placeholder="Nome, telefone, e-mail ou CPF/CNPJ" /></label>
      <SeletorFiltro rotulo="Situação do contato" valor={rascunho.status} opcoes={[{ valor: '' as const, rotulo: 'Todas' }, ...Object.entries(rotulosStatusContato).map(([valor, rotulo]) => ({ valor: valor as Filtros['status'], rotulo }))]} aoMudar={(valor) => setRascunho({ ...rascunho, status: valor })} />
      <SeletorFiltro rotulo="Cadastro" valor={rascunho.ativo} opcoes={[{ valor: 'true' as const, rotulo: 'Ativos' }, { valor: 'false' as const, rotulo: 'Inativos' }]} aoMudar={(valor) => setRascunho({ ...rascunho, ativo: valor })} />
      <div className={estilos.acoesFiltros}>
        <AcaoIcone icone={IconeBuscar} rotulo="Buscar" tipo="submit" />
        {filtrando && <button type="button" className="buttonGhost" onClick={() => { setRascunho(filtrosIniciais); setFiltros(filtrosIniciais); setPagina(1); }}>Limpar</button>}
      </div>
    </form>
    {resumo.length > 0 && <div aria-label="Filtros aplicados" className="mb-4 flex flex-wrap gap-2">{resumo.map(({ campo, rotulo }) => <button key={campo} type="button" className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border border-line bg-paper px-3 text-base text-ink" aria-label={`Remover filtro: ${rotulo}`} onClick={() => removerFiltro(campo)}><span className="break-words">{rotulo}</span><IconeFechar size={16} className="shrink-0" aria-hidden="true" /></button>)}</div>}
    <EstadoCarregamento compacto carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && !carregando && (
      <section aria-label="Lista de pessoas">
        <p role="status" className="mb-3 mt-0 text-base text-muted">{dados.total} {dados.total === 1 ? 'pessoa encontrada' : 'pessoas encontradas'}</p>
        <Tabela<Pessoa> itens={dados.itens} chave={(pessoa) => pessoa.id} vazio="Nenhuma pessoa encontrada. Ajuste a busca ou cadastre uma nova pessoa." rotulo="Pessoas" linkLinha={(pessoa) => `/admin/pessoas/${pessoa.id}`} colunas={[
          { titulo: 'Pessoa', celula: (pessoa) => <><Link to={`/admin/pessoas/${pessoa.id}`} className="font-semibold no-underline hover:underline">{pessoa.nome}</Link><small className="mt-1 flex flex-wrap gap-x-3 text-base text-muted"><span>#{pessoa.id}</span>{pessoa.tipo_pessoa && <span>{pessoa.tipo_pessoa}</span>}{pessoa.cpf_cnpj && <span>{formatarDocumento(pessoa.cpf_cnpj)}</span>}</small></> },
          { titulo: 'Contato', celula: (pessoa) => <>{pessoa.telefone || '—'}{pessoa.email && <small className="mt-1 block wrap-anywhere text-base text-muted">{pessoa.email}</small>}</> },
          { titulo: 'Situação', celula: (pessoa) => <div className="flex flex-wrap gap-1.5"><Etiqueta tom={pessoa.status_contato === 'PENDENTE' ? 'atencao' : 'neutro'}>{rotulosStatusContato[pessoa.status_contato]}</Etiqueta>{!pessoa.ativo && <Etiqueta tom="alerta">Inativa</Etiqueta>}</div> },
          { titulo: 'Cadastro', celula: (pessoa) => <>{data(pessoa.criado_em)}</> },
          { titulo: 'Ações', acoes: true, celula: (pessoa) => podeEditarPessoa(corretor, pessoa) ? <AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={pessoa.nome} aoClicar={() => setEditando(pessoa)} /> : null },
        ]} />
        <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
      </section>
    )}
    {editando !== undefined && <EditorPessoa pessoa={editando} aoFechar={() => setEditando(undefined)} aoSalvar={recarregar} />}
  </>;
}
