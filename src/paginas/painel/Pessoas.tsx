import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../servicos/api';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { data, rotulosStatusContato } from '../../servicos/formato';
import type { Pessoa, StatusContato } from '../../tipos';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Etiqueta from '../../componentes/Etiqueta';
import Paginacao from '../../componentes/Paginacao';
import Tabela from '../../componentes/Tabela';
import { estilos } from '../../componentes/estilosPainel';
import EditorPessoa from './EditorPessoa';

interface Filtros { busca: string; status: '' | StatusContato; ativo: 'true' | 'false' }
const filtrosIniciais: Filtros = { busca: '', status: '', ativo: 'true' };

export const formatarDocumento = (valor: string | null) => {
  if (!valor) return '';
  if (valor.length === 11) return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (valor.length === 14) return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return valor;
};

export default function Pessoas() {
  const [pagina, setPagina] = useState(1);
  const [rascunho, setRascunho] = useState(filtrosIniciais);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [editando, setEditando] = useState<Pessoa | null | undefined>();
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarPessoas({ pagina, limite: 15, busca: filtros.busca || undefined, status_contato: filtros.status || undefined, ativo: filtros.ativo === 'true' }), [pagina, filtros]));
  function aplicar(evento: FormEvent) {
    evento.preventDefault();
    setPagina(1);
    setFiltros({ ...rascunho, busca: rascunho.busca.trim() });
  }
  return <>
    <CabecalhoPagina rotulo="CADASTRO ÚNICO" titulo="Pessoas" descricao="Clientes, proprietários e inquilinos: uma pessoa, um cadastro." acoes={<button className="button" onClick={() => setEditando(null)}>+ Nova pessoa</button>} />
    <form className={estilos.barraFiltros} onSubmit={aplicar}>
      <label>Buscar<input value={rascunho.busca} onChange={(evento) => setRascunho({ ...rascunho, busca: evento.target.value })} placeholder="Nome, telefone, e-mail ou CPF/CNPJ" /></label>
      <label>Situação do contato<select value={rascunho.status} onChange={(evento) => setRascunho({ ...rascunho, status: evento.target.value as Filtros['status'] })}><option value="">Todas</option>{Object.entries(rotulosStatusContato).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}</select></label>
      <label>Cadastro<select value={rascunho.ativo} onChange={(evento) => setRascunho({ ...rascunho, ativo: evento.target.value as Filtros['ativo'] })}><option value="true">Ativos</option><option value="false">Inativos</option></select></label>
      <button className="buttonSecondary" type="submit">Filtrar</button>
      {(filtros.busca || filtros.status || filtros.ativo === 'false') && <button type="button" className="buttonGhost" onClick={() => { setRascunho(filtrosIniciais); setFiltros(filtrosIniciais); setPagina(1); }}>Limpar</button>}
    </form>
    <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && (
      <section className={estilos.painel}>
        <Tabela<Pessoa> itens={dados.itens} chave={(pessoa) => pessoa.id} vazio="Nenhuma pessoa encontrada." rotulo="Pessoas" colunas={[
          { titulo: 'Pessoa', celula: (pessoa) => <><Link to={`/admin/pessoas/${pessoa.id}`}><strong>{pessoa.nome}</strong></Link><small className="mt-1 block text-muted">#{pessoa.id}{pessoa.tipo_pessoa ? ` · ${pessoa.tipo_pessoa}` : ''}{pessoa.cpf_cnpj ? ` · ${formatarDocumento(pessoa.cpf_cnpj)}` : ''}</small></> },
          { titulo: 'Contato', celula: (pessoa) => <>{pessoa.telefone || '—'}{pessoa.email && <small className="mt-1 block wrap-anywhere text-muted">{pessoa.email}</small>}</> },
          { titulo: 'Situação', celula: (pessoa) => <div className="flex flex-wrap gap-1.5"><Etiqueta tom={pessoa.status_contato === 'PENDENTE' ? 'atencao' : 'neutro'}>{rotulosStatusContato[pessoa.status_contato]}</Etiqueta>{!pessoa.ativo && <Etiqueta tom="alerta">Inativa</Etiqueta>}</div> },
          { titulo: 'Cadastro', celula: (pessoa) => <>{data(pessoa.criado_em)}<small className="mt-1 block text-muted">{pessoa.origem === 'SITE' ? 'Pelo site' : 'Manual'}{pessoa.consentimento ? ' · consentimento registrado' : ''}</small></> },
          { titulo: 'Ações', celula: (pessoa) => <div className={`${estilos.acoes} max-lg:justify-end`}><Link to={`/admin/pessoas/${pessoa.id}`}>Ficha</Link><button className="buttonGhost" onClick={() => setEditando(pessoa)}>Editar</button></div> },
        ]} />
        <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
      </section>
    )}
    {editando !== undefined && <EditorPessoa pessoa={editando} aoFechar={() => setEditando(undefined)} aoSalvar={recarregar} />}
  </>;
}
