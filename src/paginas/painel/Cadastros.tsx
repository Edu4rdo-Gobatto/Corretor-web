import { useCallback, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AcaoIcone from '../../componentes/AcaoIcone';
import Aviso from '../../componentes/Aviso';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import { estilos } from '../../componentes/estilosPainel';
import Etiqueta from '../../componentes/Etiqueta';
import { IconeAdicionar, IconeArquivar, IconeDesarquivar, IconeEditar } from '../../componentes/Icones';
import Paginacao from '../../componentes/Paginacao';
import SeletorFiltro from '../../componentes/SeletorFiltro';
import Tabela from '../../componentes/Tabela';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useSessao } from '../../hooks/useSessao';
import { api } from '../../servicos/api';
import { mensagemErro } from '../../servicos/formato';
import type { CategoriaClassificacao, Classificacao } from '../../tipos';

import { CATEGORIAS, EditorClassificacao } from './EditorClassificacao';

export default function Cadastros() {
  const [categoria, setCategoria] = useState<CategoriaClassificacao>('tipos-imovel');
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<Classificacao | null | undefined>();
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [confirmando, setConfirmando] = useState<Classificacao>();
  // As rotas /admin/tipos-imovel etc. são exclusivas do ADMIN: sem o cargo, nem busca (evita o 403) e sai da página.
  const admin = useSessao().corretor?.cargo === 'ADMIN';
  const { dados, carregando, erro: erroCarga, recarregar } = useDadosPainel(useCallback(() => admin ? api.listarClassificacoes(categoria, pagina) : Promise.resolve(null), [admin, categoria, pagina]));
  useAcoesPainel(useMemo(() => admin ? [{ id: 'novo-cadastro', rotulo: 'Novo cadastro', executar: () => setEditando(null), palavrasChave: CATEGORIAS[categoria] }] : [], [admin, categoria]));
  async function alternar(item: Classificacao) {
    setOcupado(true);
    setErro('');
    try { await api.salvarClassificacao(categoria, { ativo: !item.ativo }, item.id); setConfirmando(undefined); recarregar(); }
    catch (causa) { setErro(mensagemErro(causa)); }
    finally { setOcupado(false); }
  }
  if (!admin) return <Navigate to="/admin" replace />;
  return <>
    <CabecalhoPagina titulo="Cadastros de imóveis" descricao="Tipos, finalidades e características usados nos anúncios." acoes={<AcaoIcone icone={IconeAdicionar} rotulo="Novo" contexto="cadastro" aoClicar={() => setEditando(null)} />} />
    <SeletorFiltro classe="mb-6 max-w-xs" rotulo="Categoria" valor={categoria} opcoes={Object.entries(CATEGORIAS).map(([valor, rotulo]) => ({ valor: valor as CategoriaClassificacao, rotulo }))} aoMudar={(valor) => { setCategoria(valor); setPagina(1); }} />
    <EstadoCarregamento compacto carregando={carregando} erro={erroCarga} tentarNovamente={recarregar} />
    {erro && !confirmando && <Aviso tom="erro">{erro}</Aviso>}
    {dados && !erroCarga && !carregando && (
      <section>
        <Tabela itens={dados.itens} chave={(item) => item.id} linkLinha={(item) => `/admin/cadastros/${categoria}/${item.id}`} rotulo={CATEGORIAS[categoria]} vazio="Nenhum cadastro encontrado." colunas={[
          { titulo: 'Cadastro', celula: (item) => <><Link to={`/admin/cadastros/${categoria}/${item.id}`}><strong>{item.nome}</strong></Link>{item.slug && <small className="mt-1 block text-muted">{item.slug}</small>}</> },
          { titulo: 'Situação', celula: (item) => <Etiqueta tom={item.ativo ? 'neutro' : 'alerta'}>{item.ativo ? 'Ativo' : 'Inativo'}</Etiqueta> },
          { titulo: 'Ações', acoes: true, celula: (item) => <div className={estilos.acoes}><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={item.nome} desabilitado={ocupado} aoClicar={() => setEditando(item)} /><AcaoIcone icone={item.ativo ? IconeArquivar : IconeDesarquivar} rotulo={item.ativo ? 'Desativar' : 'Reativar'} contexto={item.nome} tom={item.ativo ? 'perigo' : 'neutro'} desabilitado={ocupado} ocupado={ocupado && confirmando?.id === item.id} aoClicar={() => { setErro(''); setConfirmando(item); }} /></div> },
        ]} />
        <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
      </section>
    )}
    {editando !== undefined && <EditorClassificacao categoria={categoria} item={editando} aoFechar={() => setEditando(undefined)} aoSalvar={recarregar} />}
    {confirmando && <ConfirmarAcao titulo={`${confirmando.ativo ? 'Desativar' : 'Reativar'} cadastro`} descricao={<><p>{confirmando.nome}. {confirmando.ativo ? 'O cadastro deixará de ser oferecido para novas seleções. Os vínculos existentes serão preservados.' : 'O cadastro voltará a aparecer nas seleções.'}</p>{erro && <Aviso tom="erro">{erro}</Aviso>}</>} confirmar={confirmando.ativo ? 'Desativar cadastro' : 'Reativar cadastro'} perigo={confirmando.ativo} ocupado={ocupado} aoConfirmar={() => alternar(confirmando)} aoFechar={() => { if (!ocupado) setConfirmando(undefined); }} />}
  </>;
}
