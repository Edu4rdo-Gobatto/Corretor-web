import { useCallback, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api } from '../../servicos/api';
import { consultarRegistroDisponivel, idRegistro } from '../../servicos/registros';
import { mensagemErro } from '../../servicos/formato';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import type { CategoriaClassificacao } from '../../tipos';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Aviso from '../../componentes/Aviso';
import AcaoIcone from '../../componentes/AcaoIcone';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import { IconeArquivar, IconeDesarquivar, IconeEditar } from '../../componentes/Icones';
import { estilos } from '../../componentes/estilosPainel';
import { CATEGORIAS, EditorClassificacao } from './EditorClassificacao';

export default function FichaClassificacao() {
  const parametros = useParams();
  const id = idRegistro(parametros.id);
  const categoria: CategoriaClassificacao | null = parametros.categoria === 'tipos-imovel' || parametros.categoria === 'finalidades-imovel' || parametros.categoria === 'caracteristicas' ? parametros.categoria : null;
  const admin = useSessao().corretor?.cargo === 'ADMIN';
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const consulta = useDadosPainel(useCallback(async () => {
    if (!admin || !id || !categoria) return null;
    const item = await consultarRegistroDisponivel(() => api.obterClassificacao(categoria, id));
    return item ? { categoria, item } : null;
  }, [admin, id, categoria]));
  const item = !consulta.carregando && !consulta.erro && consulta.dados?.categoria === categoria && consulta.dados.item.id === id ? consulta.dados.item : null;
  useAcoesPainel(useMemo(() => admin && item ? [{ id: 'editar-classificacao', rotulo: 'Editar cadastro', executar: () => setEditando(true) }] : [], [admin, item]));
  if (!admin) return <Navigate to="/admin" replace />;
  async function alternar() {
    if (!item || !categoria || ocupado) return;
    setOcupado(true); setErroAcao('');
    try { await api.salvarClassificacao(categoria, { ativo: !item.ativo }, item.id); setConfirmando(false); consulta.recarregar(); }
    catch (erro) { setErroAcao(mensagemErro(erro)); }
    finally { setOcupado(false); }
  }
  return <>
    <CabecalhoPagina voltar={<Link to="/admin/cadastros">Cadastros</Link>} titulo={item?.nome ?? 'Cadastro'} descricao={categoria ? CATEGORIAS[categoria] : undefined} acoes={item && <><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={item.nome} desabilitado={ocupado} aoClicar={() => setEditando(true)} /><AcaoIcone icone={item.ativo ? IconeArquivar : IconeDesarquivar} rotulo={item.ativo ? 'Desativar' : 'Reativar'} contexto={item.nome} tom={item.ativo ? 'perigo' : 'neutro'} desabilitado={ocupado} aoClicar={() => { setErroAcao(''); setConfirmando(true); }} /></>} />
    <EstadoCarregamento carregando={consulta.carregando} erro={consulta.erro} tentarNovamente={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && !item && <Aviso>Cadastro indisponível.</Aviso>}
    {item && !consulta.carregando && !consulta.erro && <section className={estilos.painel}><h2 className={estilos.tituloPainel}>Dados do cadastro</h2><dl className="ficha-dados">
      <div><dt>Categoria</dt><dd>{categoria && CATEGORIAS[categoria]}</dd></div><div><dt>Nome</dt><dd>{item.nome}</dd></div><div><dt>Identificador no endereço</dt><dd>{item.slug || 'Não informado'}</dd></div><div><dt>Ícone</dt><dd>{item.icone || 'Não informado'}</dd></div><div><dt>Situação</dt><dd>{item.ativo ? 'Ativo' : 'Inativo'}</dd></div>
    </dl></section>}
    {item && categoria && editando && <EditorClassificacao key={`${categoria}-${item.id}`} categoria={categoria} item={item} aoFechar={() => setEditando(false)} aoSalvar={consulta.recarregar} />}
    {item && confirmando && <ConfirmarAcao titulo={`${item.ativo ? 'Desativar' : 'Reativar'} cadastro`} descricao={<><p>{item.nome}. {item.ativo ? 'Os vínculos existentes serão preservados.' : 'O cadastro voltará a aparecer nas seleções.'}</p>{erroAcao && <Aviso tom="erro">{erroAcao}</Aviso>}</>} confirmar={item.ativo ? 'Desativar cadastro' : 'Reativar cadastro'} perigo={item.ativo} ocupado={ocupado} aoConfirmar={alternar} aoFechar={() => setConfirmando(false)} />}
  </>;
}
