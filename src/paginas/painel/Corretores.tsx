import { useCallback, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AcaoIcone from '../../componentes/AcaoIcone';
import Aviso from '../../componentes/Aviso';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import { estilos } from '../../componentes/estilosPainel';
import Etiqueta from '../../componentes/Etiqueta';
import { IconeAdicionar, IconeArquivar, IconeChave, IconeDesarquivar, IconeEditar } from '../../componentes/Icones';
import Paginacao from '../../componentes/Paginacao';
import Tabela from '../../componentes/Tabela';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useSessao } from '../../hooks/useSessao';
import { api } from '../../servicos/api';
import { mensagemErro } from '../../servicos/formato';
import { urlFichaCorretor } from '../../servicos/urls';
import type { Corretor } from '../../tipos';

import { DialogoSenha, EditorCorretor, dadosBase } from './EditorCorretor';

export default function Corretores() {
  const { corretor: sessao } = useSessao();
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<Corretor | null | undefined>();
  const [redefinindo, setRedefinindo] = useState<Corretor>();
  const [erroMutacao, setErroMutacao] = useState('');
  const [ocupado, setOcupado] = useState(0);
  const [confirmando, setConfirmando] = useState<Corretor>();
  const admin = sessao?.cargo === 'ADMIN';
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => admin ? api.listarCorretores(pagina, 15) : Promise.resolve({ itens: [], total: 0, pagina: 1, limite: 15, total_paginas: 0 }), [pagina, admin]));
  useAcoesPainel(useMemo(() => admin ? [{ id: 'novo-corretor', rotulo: 'Novo corretor', executar: () => setEditando(null), palavrasChave: 'equipe conta' }] : [], [admin]));
  if (!admin) return <Navigate to="/admin" replace />;
  async function alternar(corretor: Corretor) {
    setOcupado(corretor.id);
    setErroMutacao('');
    try { await api.salvarCorretor({ ...dadosBase(corretor), ativo: !corretor.ativo }, corretor.id); setConfirmando(undefined); recarregar(); }
    catch (causa) { setErroMutacao(mensagemErro(causa)); }
    finally { setOcupado(0); }
  }
  return <>
    <CabecalhoPagina titulo="Corretores" descricao="Pessoas que conectam espaços e negócios." acoes={<AcaoIcone icone={IconeAdicionar} rotulo="Novo" contexto="corretor" aoClicar={() => setEditando(null)} />} />
    {erroMutacao && !confirmando && <Aviso tom="erro">{erroMutacao}</Aviso>}
    <EstadoCarregamento compacto carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && !carregando && (
      <section>
        <Tabela<Corretor> itens={dados.itens} chave={(corretor) => corretor.id} vazio="Nenhum corretor cadastrado." rotulo="Corretores" linkLinha={(corretor) => urlFichaCorretor(corretor.id, sessao?.id)} colunas={[
          { titulo: 'Corretor', celula: (corretor) => <><Link to={urlFichaCorretor(corretor.id, sessao?.id)}><strong>{corretor.nome}</strong></Link><small className="mt-1 block wrap-anywhere text-muted">{corretor.email}</small><small className="mt-1 block text-muted">{corretor.creci ? `CRECI ${corretor.creci}` : corretor.whatsapp}</small></> },
          { titulo: 'Permissão', celula: (corretor) => corretor.cargo === 'ADMIN' ? 'Administrador' : 'Corretor' },
          { titulo: 'Situação', celula: (corretor) => <Etiqueta tom={corretor.ativo ? 'neutro' : 'alerta'}>{corretor.ativo ? 'Ativo' : 'Inativo'}</Etiqueta> },
          { titulo: 'Ações', acoes: true, celula: (corretor) => <div className={estilos.acoes}><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={corretor.nome} desabilitado={!!ocupado} aoClicar={() => setEditando(corretor)} /><AcaoIcone icone={IconeChave} rotulo="Redefinir senha" contexto={corretor.nome} desabilitado={!!ocupado} aoClicar={() => setRedefinindo(corretor)} /><AcaoIcone icone={corretor.ativo ? IconeArquivar : IconeDesarquivar} rotulo={corretor.ativo ? 'Desativar' : 'Reativar'} contexto={corretor.nome} tom={corretor.ativo ? 'perigo' : 'neutro'} desabilitado={!!ocupado} ocupado={ocupado === corretor.id} aoClicar={() => { setErroMutacao(''); setConfirmando(corretor); }} /></div> },
        ]} />
        <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
      </section>
    )}
    {editando !== undefined && <EditorCorretor corretor={editando} aoFechar={() => setEditando(undefined)} aoSalvar={recarregar} />}
    {redefinindo && <DialogoSenha corretor={redefinindo} aoFechar={() => setRedefinindo(undefined)} aoSalvar={recarregar} />}
    {confirmando && <ConfirmarAcao titulo={`${confirmando.ativo ? 'Desativar' : 'Reativar'} conta`} descricao={<><p>{confirmando.nome}. {confirmando.ativo ? 'Os vínculos com imóveis e contatos serão preservados.' : 'A conta voltará a ficar ativa.'}</p>{erroMutacao && <Aviso tom="erro">{erroMutacao}</Aviso>}</>} confirmar={confirmando.ativo ? 'Desativar conta' : 'Reativar conta'} perigo={confirmando.ativo} ocupado={!!ocupado} aoConfirmar={() => alternar(confirmando)} aoFechar={() => { if (!ocupado) setConfirmando(undefined); }} />}
  </>;
}
