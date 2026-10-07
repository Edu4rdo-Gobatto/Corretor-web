import { urlFotoCorretor } from '../../servicos/fotos';
import { useCallback, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api } from '../../servicos/api';
import { consultarRegistroDisponivel, idRegistro } from '../../servicos/registros';
import { mensagemErro } from '../../servicos/formato';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import type { Corretor, CorretorPublico } from '../../tipos';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Aviso from '../../componentes/Aviso';
import AcaoIcone from '../../componentes/AcaoIcone';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import { IconeArquivar, IconeDesarquivar, IconeEditar, IconeChave } from '../../componentes/Icones';
import { estilos } from '../../componentes/estilosPainel';
import { EditorCorretor, DialogoSenha, dadosBase } from './EditorCorretor';

type RegistroCorretor = { publico: CorretorPublico; completo?: Corretor };
export default function FichaCorretor() {
  const id = idRegistro(useParams().id);
  const sessao = useSessao().corretor;
  const admin = sessao?.cargo === 'ADMIN';
  const proprio = id === sessao?.id;
  const [editando, setEditando] = useState(false);
  const [senha, setSenha] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const [fotoQuebrada, setFotoQuebrada] = useState<string>();
  const consulta = useDadosPainel(useCallback(async (): Promise<RegistroCorretor | null> => {
    if (!id || proprio || !sessao) return null;
    if (admin) {
      const completo = await consultarRegistroDisponivel(() => api.obterCorretor(id));
      return completo ? { publico: completo, completo } : null;
    }
    for (const ativo of [true, false]) {
      const fichas = await consultarRegistroDisponivel(() => api.listarFichas({ corretor_id: id, ativo, limite: 1 }));
      const vinculo = fichas?.itens.find((ficha) => ficha.corretor?.id === id)?.corretor;
      if (vinculo) {
        const { nome, whatsapp, creci, url_foto } = vinculo;
        return { publico: { id: vinculo.id, nome, whatsapp, creci, url_foto } };
      }
    }
    return null;
  }, [id, proprio, sessao, admin]));
  const registro = !consulta.carregando && !consulta.erro && consulta.dados?.publico.id === id ? consulta.dados : null;
  const item = registro?.publico;
  const completo = admin ? registro?.completo : undefined;
  useAcoesPainel(useMemo(() => admin && completo ? [{ id: 'editar-corretor', rotulo: 'Editar corretor', executar: () => setEditando(true) }, { id: 'senha-corretor', rotulo: 'Redefinir senha', executar: () => setSenha(true) }] : [], [admin, completo]));
  if (proprio) return <Navigate to="/admin/perfil" replace />;
  async function alternar() {
    if (!admin || !completo || ocupado) return;
    setOcupado(true); setErroAcao('');
    try { await api.salvarCorretor({ ...dadosBase(completo), ativo: !completo.ativo }, completo.id); setConfirmando(false); consulta.recarregar(); }
    catch (erro) { setErroAcao(mensagemErro(erro)); }
    finally { setOcupado(false); }
  }
  return <>
    <CabecalhoPagina voltar={<Link to={admin ? '/admin/corretores' : '/admin/imoveis'}>{admin ? 'Corretores' : 'Imóveis'}</Link>} titulo={item?.nome ?? 'Corretor'} acoes={admin && completo && <><AcaoIcone icone={IconeEditar} rotulo="Editar" contexto={completo.nome} desabilitado={ocupado} aoClicar={() => setEditando(true)} /><AcaoIcone icone={IconeChave} rotulo="Redefinir senha" contexto={completo.nome} desabilitado={ocupado} aoClicar={() => setSenha(true)} /><AcaoIcone icone={completo.ativo ? IconeArquivar : IconeDesarquivar} rotulo={completo.ativo ? 'Desativar' : 'Reativar'} contexto={completo.nome} tom={completo.ativo ? 'perigo' : 'neutro'} desabilitado={ocupado} aoClicar={() => { setErroAcao(''); setConfirmando(true); }} /></>} />
    <EstadoCarregamento carregando={consulta.carregando} erro={consulta.erro} tentarNovamente={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && !item && <Aviso>Corretor indisponível.</Aviso>}
    {item && !consulta.carregando && !consulta.erro && <section className={estilos.painel}>
      <h2 className={estilos.tituloPainel}>Dados do corretor</h2>
      {item.url_foto && item.url_foto !== fotoQuebrada && <img src={urlFotoCorretor(item)} alt={`Foto de ${item.nome}`} className="mb-5 h-24 w-24 rounded-full object-cover" onError={() => setFotoQuebrada(item.url_foto ?? undefined)} />}
      <dl className="ficha-dados"><div><dt>Nome</dt><dd>{item.nome}</dd></div><div><dt>WhatsApp</dt><dd>{item.whatsapp}</dd></div><div><dt>CRECI</dt><dd>{item.creci || 'Não informado'}</dd></div>
        {completo && <><div><dt>E-mail</dt><dd>{completo.email}</dd></div><div><dt>CPF</dt><dd>{completo.cpf || 'Não informado'}</dd></div><div><dt>Permissão</dt><dd>{completo.cargo === 'ADMIN' ? 'Administrador' : 'Corretor'}</dd></div><div><dt>Situação</dt><dd>{completo.ativo ? 'Ativo' : 'Inativo'}</dd></div></>}
      </dl>
      {/^[1-9]\d{9,14}$/.test(item.whatsapp) && <div className="ficha-acoes"><a className="button" href={`https://wa.me/${item.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></div>}
    </section>}
    {admin && completo && editando && <EditorCorretor key={completo.id} corretor={completo} aoFechar={() => setEditando(false)} aoSalvar={consulta.recarregar} />}
    {admin && completo && senha && <DialogoSenha key={completo.id} corretor={completo} aoFechar={() => setSenha(false)} aoSalvar={consulta.recarregar} />}
    {admin && completo && confirmando && <ConfirmarAcao titulo={`${completo.ativo ? 'Desativar' : 'Reativar'} conta`} descricao={<><p>{completo.nome}. Os vínculos com imóveis e contatos serão preservados.</p>{erroAcao && <Aviso tom="erro">{erroAcao}</Aviso>}</>} confirmar={completo.ativo ? 'Desativar conta' : 'Reativar conta'} perigo={completo.ativo} ocupado={ocupado} aoConfirmar={alternar} aoFechar={() => setConfirmando(false)} />}
  </>;
}
