import { useFiltrosAutomaticos } from '../../hooks/useFiltrosAutomaticos';
import { useParametrosLista } from '../../hooks/useParametrosLista';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconeEditar } from '../../componentes/Icones';
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
import Seletor from '../../componentes/Seletor';
import BarraFiltros, { CampoBusca, type FiltroAplicado } from '../../componentes/BarraFiltros';
import AcaoIcone from '../../componentes/AcaoIcone';
import BotaoAdicionar from '../../componentes/BotaoAdicionar';
import EditorPessoa from './EditorPessoa';
import { useAcoesPainel } from '../../hooks/useComandosPainel';

type Filtros = { busca: string; status: '' | StatusContato; ativo: 'true' | 'false' };
const filtrosIniciais: Filtros = { busca: '', status: '', ativo: 'true' };
const valoresValidos = { status: ['', ...Object.keys(rotulosStatusContato)], ativo: ['true', 'false'] } as const;

export const formatarDocumento = (valor: string | null) => {
  if (!valor) return '';
  if (valor.length === 11) return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (valor.length === 14) return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return valor;
};

export default function Pessoas() {
  const { corretor } = useSessao();
  const { filtros, pagina, definirFiltros, definirPagina: setPagina } = useParametrosLista<Filtros>(filtrosIniciais, valoresValidos);
  const { rascunho, definir: setRascunho, aplicarAgora } = useFiltrosAutomaticos({
    iniciais: filtros, externos: filtros, normalizar: (valor) => ({ ...valor, busca: valor.busca.trim() }),
    aoAplicar: (valor) => definirFiltros(valor),
  });
  const [editando, setEditando] = useState<Pessoa | null | undefined>();
  useAcoesPainel(useMemo(() => [{ id: 'nova-pessoa', rotulo: 'Nova pessoa', executar: () => setEditando(null) }], []));
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarPessoas({ pagina, limite: 15, busca: filtros.busca || undefined, status_contato: filtros.status || undefined, ativo: filtros.ativo === 'true' }), [pagina, filtros]));
  function removerFiltro(campo: keyof Filtros) {
    setRascunho({ ...rascunho, [campo]: filtrosIniciais[campo] }, true);
  }
  const resumo: FiltroAplicado<keyof Filtros>[] = [
    ...(filtros.busca ? [{ campo: 'busca' as const, rotulo: `Busca: ${filtros.busca}` }] : []),
    ...(filtros.status ? [{ campo: 'status' as const, rotulo: rotulosStatusContato[filtros.status] }] : []),
    ...(filtros.ativo === 'false' ? [{ campo: 'ativo' as const, rotulo: 'Inativos' }] : []),
  ];
  return <>
    <CabecalhoPagina titulo="Pessoas" descricao="Clientes, proprietários e inquilinos: uma pessoa, um cadastro." acoes={<BotaoAdicionar rotulo="Nova pessoa" aoClicar={() => setEditando(null)} />} />
    <BarraFiltros aoEnviar={aplicarAgora} aplicados={resumo} aoRemover={removerFiltro} aoLimpar={() => setRascunho(filtrosIniciais, true)}>
      <CampoBusca valor={rascunho.busca} aoMudar={(busca) => setRascunho({ ...rascunho, busca })} placeholder="Nome, telefone, e-mail ou CPF/CNPJ" />
      <Seletor rotulo="Situação do contato" valor={rascunho.status} opcoes={[{ valor: '' as const, rotulo: 'Todas' }, ...Object.entries(rotulosStatusContato).map(([valor, rotulo]) => ({ valor: valor as Filtros['status'], rotulo }))]} aoMudar={(valor) => setRascunho({ ...rascunho, status: valor }, true)} />
      <Seletor rotulo="Cadastro" valor={rascunho.ativo} opcoes={[{ valor: 'true' as const, rotulo: 'Ativos' }, { valor: 'false' as const, rotulo: 'Inativos' }]} aoMudar={(valor) => setRascunho({ ...rascunho, ativo: valor }, true)} />
    </BarraFiltros>
    <EstadoCarregamento compacto carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && !carregando && (
      <section aria-label="Lista de pessoas">
        <p role="status" className="contagem-painel">{dados.total} {dados.total === 1 ? 'pessoa encontrada' : 'pessoas encontradas'}</p>
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
