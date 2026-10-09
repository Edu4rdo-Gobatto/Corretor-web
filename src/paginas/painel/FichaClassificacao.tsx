import { useCallback, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { consultarRegistroDisponivel, idRegistro } from '../../servicos/registros';
import { mensagemErro } from '../../servicos/formato';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Aviso from '../../componentes/Aviso';
import AcaoIcone from '../../componentes/AcaoIcone';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import { IconeArquivar, IconeDesarquivar, IconeEditar } from '../../componentes/Icones';
import { DadosFicha, DadoFicha, SecaoPainel } from '../../componentes/BlocosPainel';
import { cadastrosApi, EditorCadastro } from './EditorCadastro';
import { ROTULOS_CADASTRO, categoriaCadastro, ehCategoriaContrato, periodicidade } from './categoriasCadastro';

export default function FichaClassificacao() {
  const parametros = useParams();
  const id = idRegistro(parametros.id);
  const categoria = categoriaCadastro(parametros.categoria);
  const admin = useSessao().corretor?.cargo === 'ADMIN';
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const consulta = useDadosPainel(useCallback(async () => {
    if (!admin || !id || !categoria) return null;
    const item = await consultarRegistroDisponivel(() => cadastrosApi.obter(categoria, id));
    return item ? { categoria, item } : null;
  }, [admin, id, categoria]));
  const item = !consulta.carregando && !consulta.erro && consulta.dados?.categoria === categoria && consulta.dados.item.id === id ? consulta.dados.item : null;
  useAcoesPainel(useMemo(() => admin && item ? [{ id: 'editar-classificacao', rotulo: 'Editar cadastro', executar: () => setEditando(true) }] : [], [admin, item]));
  if (!admin) return <Navigate to="/admin" replace />;
  async function alternar() {
    if (!item || !categoria || ocupado) return;
    setOcupado(true); setErroAcao('');
    try { await cadastrosApi.ativar(categoria, item.id, !item.ativo); setConfirmando(false); consulta.recarregar(); }
    catch (erro) { setErroAcao(mensagemErro(erro)); }
    finally { setOcupado(false); }
  }
  return <>
    <CabecalhoPagina voltar={{ to: `/admin/cadastros/${categoria ?? 'tipos-imovel'}`, rotulo: `Voltar para ${categoria ? ROTULOS_CADASTRO[categoria].toLocaleLowerCase('pt-BR') : 'cadastros'}` }} titulo={item?.nome ?? 'Cadastro'} descricao={categoria ? ROTULOS_CADASTRO[categoria] : undefined} acoes={item && <><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={item.nome} desabilitado={ocupado} aoClicar={() => setEditando(true)} /><AcaoIcone icone={item.ativo ? IconeArquivar : IconeDesarquivar} rotulo={item.ativo ? 'Desativar' : 'Reativar'} contexto={item.nome} tom={item.ativo ? 'perigo' : 'neutro'} desabilitado={ocupado} aoClicar={() => { setErroAcao(''); setConfirmando(true); }} /></>} />
    <EstadoCarregamento carregando={consulta.carregando} erro={consulta.erro} tentarNovamente={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && !item && <Aviso>Cadastro indisponível.</Aviso>}
    {item && !consulta.carregando && !consulta.erro && <SecaoPainel titulo="Dados do cadastro"><DadosFicha colunas={2}>
      <DadoFicha rotulo="Categoria">{categoria && ROTULOS_CADASTRO[categoria]}</DadoFicha><DadoFicha rotulo="Nome">{item.nome}</DadoFicha>
      {categoria && ehCategoriaContrato(categoria)
        ? <>{item.periodicidade_meses && <DadoFicha rotulo="Periodicidade">{periodicidade(item.periodicidade_meses)}</DadoFicha>}{categoria === 'indices-reajuste' ? <DadoFicha rotulo="Regra">{item.regra && <span className="whitespace-pre-wrap">{item.regra}</span>}</DadoFicha> : <DadoFicha rotulo="Descrição">{item.descricao && <span className="whitespace-pre-wrap">{item.descricao}</span>}</DadoFicha>}</>
        : <><DadoFicha rotulo="Identificador no endereço">{item.slug}</DadoFicha><DadoFicha rotulo="Ícone">{item.icone}</DadoFicha></>}
      <DadoFicha rotulo="Situação">{item.ativo ? 'Ativo' : 'Inativo'}</DadoFicha>
    </DadosFicha></SecaoPainel>}
    {item && categoria && editando && <EditorCadastro key={`${categoria}-${item.id}`} categoria={categoria} item={item} aoFechar={() => setEditando(false)} aoSalvar={consulta.recarregar} />}
    {item && confirmando && <ConfirmarAcao titulo={`${item.ativo ? 'Desativar' : 'Reativar'} cadastro`} descricao={<><p>{item.nome}. {item.ativo ? 'Os vínculos existentes serão preservados.' : 'O cadastro voltará a aparecer nas seleções.'}</p>{erroAcao && <Aviso tom="erro">{erroAcao}</Aviso>}</>} confirmar={item.ativo ? 'Desativar cadastro' : 'Reativar cadastro'} perigo={item.ativo} ocupado={ocupado} aoConfirmar={alternar} aoFechar={() => setConfirmando(false)} />}
  </>;
}
