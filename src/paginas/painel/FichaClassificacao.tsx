import { useCallback, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
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
import { DadosFicha, DadoFicha, SecaoPainel } from '../../componentes/BlocosPainel';
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
    <CabecalhoPagina voltar={{ to: '/admin/cadastros', rotulo: 'Voltar para cadastros' }} titulo={item?.nome ?? 'Cadastro'} descricao={categoria ? CATEGORIAS[categoria] : undefined} acoes={item && <><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={item.nome} desabilitado={ocupado} aoClicar={() => setEditando(true)} /><AcaoIcone icone={item.ativo ? IconeArquivar : IconeDesarquivar} rotulo={item.ativo ? 'Desativar' : 'Reativar'} contexto={item.nome} tom={item.ativo ? 'perigo' : 'neutro'} desabilitado={ocupado} aoClicar={() => { setErroAcao(''); setConfirmando(true); }} /></>} />
    <EstadoCarregamento carregando={consulta.carregando} erro={consulta.erro} tentarNovamente={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && !item && <Aviso>Cadastro indisponível.</Aviso>}
    {item && !consulta.carregando && !consulta.erro && <SecaoPainel titulo="Dados do cadastro"><DadosFicha colunas={2}>
      <DadoFicha rotulo="Categoria">{categoria && CATEGORIAS[categoria]}</DadoFicha><DadoFicha rotulo="Nome">{item.nome}</DadoFicha><DadoFicha rotulo="Identificador no endereço">{item.slug}</DadoFicha><DadoFicha rotulo="Ícone">{item.icone}</DadoFicha><DadoFicha rotulo="Situação">{item.ativo ? 'Ativo' : 'Inativo'}</DadoFicha>
    </DadosFicha></SecaoPainel>}
    {item && categoria && editando && <EditorClassificacao key={`${categoria}-${item.id}`} categoria={categoria} item={item} aoFechar={() => setEditando(false)} aoSalvar={consulta.recarregar} />}
    {item && confirmando && <ConfirmarAcao titulo={`${item.ativo ? 'Desativar' : 'Reativar'} cadastro`} descricao={<><p>{item.nome}. {item.ativo ? 'Os vínculos existentes serão preservados.' : 'O cadastro voltará a aparecer nas seleções.'}</p>{erroAcao && <Aviso tom="erro">{erroAcao}</Aviso>}</>} confirmar={item.ativo ? 'Desativar cadastro' : 'Reativar cadastro'} perigo={item.ativo} ocupado={ocupado} aoConfirmar={alternar} aoFechar={() => setConfirmando(false)} />}
  </>;
}
