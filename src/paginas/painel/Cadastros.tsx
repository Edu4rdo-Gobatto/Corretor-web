import { useCallback, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Archive, ArchiveRestore, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../servicos/api';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { useSessao } from '../../hooks/useSessao';
import type { CategoriaClassificacao, Classificacao } from '../../tipos';
import { mensagemErro } from '../../servicos/formato';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import Dialogo from '../../componentes/Dialogo';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Etiqueta from '../../componentes/Etiqueta';
import Paginacao from '../../componentes/Paginacao';
import Tabela from '../../componentes/Tabela';
import AcaoIcone from '../../componentes/AcaoIcone';
import Aviso from '../../componentes/Aviso';
import Campo from '../../componentes/Campo';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import { estilos } from '../../componentes/estilosPainel';

const esquema = z.object({
  nome: z.string().trim().min(2, 'Use ao menos dois caracteres.').max(100),
  slug: z.string().max(120).regex(/^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/, 'Use letras minúsculas, números e hífens.'),
  icone: z.string().max(100),
});
type Valores = z.infer<typeof esquema>;
const CATEGORIAS: Record<CategoriaClassificacao, string> = { 'tipos-imovel': 'Tipos de imóvel', 'finalidades-imovel': 'Finalidades', caracteristicas: 'Características' };

function Editor({ categoria, item, aoFechar, aoSalvar }: { categoria: CategoriaClassificacao; item: Classificacao | null; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Valores>({ resolver: zodResolver(esquema), defaultValues: { nome: item?.nome ?? '', slug: item?.slug ?? '', icone: item?.icone ?? '' } });
  async function salvar(valores: Valores) {
    setErro('');
    try {
      await api.salvarClassificacao(categoria, { nome: valores.nome, ...(categoria === 'caracteristicas' ? { icone: valores.icone || null } : valores.slug ? { slug: valores.slug } : {}) }, item?.id);
      aoSalvar();
      aoFechar();
    } catch (causa) { setErro(mensagemErro(causa)); }
  }
  return (
    <Dialogo titulo={item ? 'Editar cadastro' : 'Novo cadastro'} tamanho="estreito" aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form onSubmit={handleSubmit(salvar)} noValidate className={`${estilos.formulario} grid gap-4`}>
        <Campo rotulo="Nome" obrigatorio erro={errors.nome?.message}><input {...register('nome')} /></Campo>
        {categoria === 'caracteristicas' ? <Campo rotulo="Ícone (opcional)" erro={errors.icone?.message}><input {...register('icone')} /></Campo> : <Campo rotulo="Identificador no endereço (opcional)" erro={errors.slug?.message} dica="Letras minúsculas, números e hífens."><input {...register('slug')} /></Campo>}
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Salvar'}</button><button type="button" className="buttonGhost" disabled={isSubmitting} onClick={aoFechar}>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

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
  async function alternar(item: Classificacao) {
    setOcupado(true);
    setErro('');
    try { await api.salvarClassificacao(categoria, { ativo: !item.ativo }, item.id); setConfirmando(undefined); recarregar(); }
    catch (causa) { setErro(mensagemErro(causa)); }
    finally { setOcupado(false); }
  }
  if (!admin) return <Navigate to="/admin" replace />;
  return <>
    <CabecalhoPagina titulo="Cadastros de imóveis" descricao="Tipos, finalidades e características usados nos anúncios." acoes={<button className="button" onClick={() => setEditando(null)}>Novo cadastro</button>} />
    <label className="mb-6 grid max-w-xs gap-1.5">Categoria<select value={categoria} onChange={(evento) => { setCategoria(evento.target.value as CategoriaClassificacao); setPagina(1); }}>{Object.entries(CATEGORIAS).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}</select></label>
    <EstadoCarregamento compacto carregando={carregando} erro={erroCarga} tentarNovamente={recarregar} />
    {erro && !confirmando && <Aviso tom="erro">{erro}</Aviso>}
    {dados && !erroCarga && !carregando && (
      <section className={estilos.painel}>
        <Tabela itens={dados.itens} chave={(item) => item.id} rotulo={CATEGORIAS[categoria]} vazio="Nenhum cadastro encontrado." colunas={[
          { titulo: 'Cadastro', celula: (item) => <><strong>{item.nome}</strong>{item.slug && <small className="mt-1 block text-muted">{item.slug}</small>}</> },
          { titulo: 'Situação', celula: (item) => <Etiqueta tom={item.ativo ? 'neutro' : 'alerta'}>{item.ativo ? 'Ativo' : 'Inativo'}</Etiqueta> },
          { titulo: 'Ações', celula: (item) => <div className={estilos.acoes}><AcaoIcone icone={Pencil} rotulo={`Editar ${item.nome}`} desabilitado={ocupado} aoClicar={() => setEditando(item)} /><AcaoIcone icone={item.ativo ? Archive : ArchiveRestore} rotulo={`${item.ativo ? 'Desativar' : 'Reativar'} ${item.nome}`} tom={item.ativo ? 'perigo' : 'neutro'} desabilitado={ocupado} ocupado={ocupado && confirmando?.id === item.id} aoClicar={() => { setErro(''); setConfirmando(item); }} /></div> },
        ]} />
        <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
      </section>
    )}
    {editando !== undefined && <Editor categoria={categoria} item={editando} aoFechar={() => setEditando(undefined)} aoSalvar={recarregar} />}
    {confirmando && <ConfirmarAcao titulo={`${confirmando.ativo ? 'Desativar' : 'Reativar'} cadastro`} descricao={<><p>{confirmando.nome}. {confirmando.ativo ? 'O cadastro deixará de ser oferecido para novas seleções. Os vínculos existentes serão preservados.' : 'O cadastro voltará a aparecer nas seleções.'}</p>{erro && <Aviso tom="erro">{erro}</Aviso>}</>} confirmar={confirmando.ativo ? 'Desativar cadastro' : 'Reativar cadastro'} perigo={confirmando.ativo} ocupado={ocupado} aoConfirmar={() => alternar(confirmando)} aoFechar={() => { if (!ocupado) setConfirmando(undefined); }} />}
  </>;
}
