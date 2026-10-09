import { useCallback, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
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
import { mensagemErro } from '../../servicos/formato';
import type { CategoriaCadastro } from '../../tipos';

import { cadastrosApi, EditorCadastro, type ItemCadastro } from './EditorCadastro';
import { GRUPOS_CADASTRO, ROTULOS_CADASTRO, categoriaCadastro, ehCategoriaContrato, grupoDaCategoria, periodicidade } from './categoriasCadastro';

/** Linha auxiliar da tabela: slug, periodicidade ou descrição, conforme a categoria. */
function detalheItem(item: ItemCadastro) {
  if (item.periodicidade_meses) return periodicidade(item.periodicidade_meses);
  return item.slug ?? item.descricao ?? null;
}

export default function Cadastros() {
  // A categoria fica na rota: voltar da ficha, Esc e o botão do navegador mantêm a escolha.
  const categoria = categoriaCadastro(useParams().categoria);
  const navegar = useNavigate();
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<ItemCadastro | null | undefined>();
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [confirmando, setConfirmando] = useState<ItemCadastro>();
  // As rotas /admin/tipos-imovel etc. são exclusivas do ADMIN: sem o cargo, nem busca (evita o 403) e sai da página.
  const admin = useSessao().corretor?.cargo === 'ADMIN';
  const { dados, carregando, erro: erroCarga, recarregar } = useDadosPainel(useCallback(() => admin && categoria ? cadastrosApi.listar(categoria, pagina) : Promise.resolve(null), [admin, categoria, pagina]));
  useAcoesPainel(useMemo(() => admin && categoria ? [{ id: 'novo-cadastro', rotulo: 'Novo cadastro', executar: () => setEditando(null), palavrasChave: ROTULOS_CADASTRO[categoria] }] : [], [admin, categoria]));
  async function alternar(item: ItemCadastro) {
    if (!categoria) return;
    setOcupado(true);
    setErro('');
    try { await cadastrosApi.ativar(categoria, item.id, !item.ativo); setConfirmando(undefined); recarregar(); }
    catch (causa) { setErro(mensagemErro(causa)); }
    finally { setOcupado(false); }
  }
  if (!admin) return <Navigate to="/admin" replace />;
  if (!categoria) return <Navigate to="/admin/cadastros/tipos-imovel" replace />;
  const grupo = grupoDaCategoria(categoria);
  const trocar = (destino: CategoriaCadastro) => { setPagina(1); setErro(''); navegar(`/admin/cadastros/${destino}`); };
  return <>
    <CabecalhoPagina titulo="Cadastros" descricao={grupo.descricao} acoes={<AcaoIcone icone={IconeAdicionar} rotulo="Novo" contexto={ROTULOS_CADASTRO[categoria]} aoClicar={() => setEditando(null)} />} />
    <div className={estilos.barraFiltros}>
      <SeletorFiltro rotulo="Grupo" valor={grupo.id} opcoes={GRUPOS_CADASTRO.map((item) => ({ valor: item.id, rotulo: item.rotulo }))} aoMudar={(valor) => trocar(GRUPOS_CADASTRO.find((item) => item.id === valor)!.categorias[0])} />
      <SeletorFiltro<CategoriaCadastro> rotulo="Categoria" valor={categoria} opcoes={grupo.categorias.map((valor) => ({ valor, rotulo: ROTULOS_CADASTRO[valor] }))} aoMudar={trocar} />
    </div>
    <EstadoCarregamento compacto carregando={carregando} erro={erroCarga} tentarNovamente={recarregar} />
    {erro && !confirmando && <Aviso tom="erro">{erro}</Aviso>}
    {dados && !erroCarga && !carregando && (
      <section>
        {ehCategoriaContrato(categoria) && dados.total === 0 && <Aviso classe="mb-4">Nenhum cadastro ainda. Novos contratos exigem ao menos um tipo de contrato e um índice de reajuste ativos.</Aviso>}
        <Tabela itens={dados.itens} chave={(item) => item.id} linkLinha={(item) => `/admin/cadastros/${categoria}/${item.id}`} rotulo={ROTULOS_CADASTRO[categoria]} vazio="Nenhum cadastro encontrado." colunas={[
          { titulo: 'Cadastro', celula: (item) => <><Link to={`/admin/cadastros/${categoria}/${item.id}`}><strong>{item.nome}</strong></Link>{detalheItem(item) && <small className="mt-1 block text-muted">{detalheItem(item)}</small>}</> },
          { titulo: 'Situação', celula: (item) => <Etiqueta tom={item.ativo ? 'neutro' : 'alerta'}>{item.ativo ? 'Ativo' : 'Inativo'}</Etiqueta> },
          { titulo: 'Ações', acoes: true, celula: (item) => <div className={estilos.acoes}><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={item.nome} desabilitado={ocupado} aoClicar={() => setEditando(item)} /><AcaoIcone icone={item.ativo ? IconeArquivar : IconeDesarquivar} rotulo={item.ativo ? 'Desativar' : 'Reativar'} contexto={item.nome} tom={item.ativo ? 'perigo' : 'neutro'} desabilitado={ocupado} ocupado={ocupado && confirmando?.id === item.id} aoClicar={() => { setErro(''); setConfirmando(item); }} /></div> },
        ]} />
        <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
      </section>
    )}
    {editando !== undefined && <EditorCadastro key={categoria} categoria={categoria} item={editando} aoFechar={() => setEditando(undefined)} aoSalvar={recarregar} />}
    {confirmando && <ConfirmarAcao titulo={`${confirmando.ativo ? 'Desativar' : 'Reativar'} cadastro`} descricao={<><p>{confirmando.nome}. {confirmando.ativo ? 'O cadastro deixará de ser oferecido para novas seleções. Os vínculos existentes serão preservados.' : 'O cadastro voltará a aparecer nas seleções.'}</p>{erro && <Aviso tom="erro">{erro}</Aviso>}</>} confirmar={confirmando.ativo ? 'Desativar cadastro' : 'Reativar cadastro'} perigo={confirmando.ativo} ocupado={ocupado} aoConfirmar={() => alternar(confirmando)} aoFechar={() => { if (!ocupado) setConfirmando(undefined); }} />}
  </>;
}
