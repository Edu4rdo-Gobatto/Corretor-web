import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../servicos/api';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import type { CategoriaClassificacao, Classificacao } from '../../tipos';
import { mensagemErro } from '../../servicos/formato';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import Dialogo from '../../componentes/Dialogo';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Etiqueta from '../../componentes/Etiqueta';
import Paginacao from '../../componentes/Paginacao';
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
    <Dialogo titulo={item ? 'Editar cadastro' : 'Novo cadastro'} aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form onSubmit={handleSubmit(salvar)} noValidate className={`${estilos.formulario} grid gap-4`}>
        <label>Nome<input {...register('nome')} />{errors.nome && <span className={estilos.erro}>{errors.nome.message}</span>}</label>
        {categoria === 'caracteristicas' ? <label>Ícone (opcional)<input {...register('icone')} /></label> : <label>Identificador no endereço (opcional)<input {...register('slug')} />{errors.slug && <span className={estilos.erro}>{errors.slug.message}</span>}</label>}
        {erro && <p role="alert" className="error">{erro}</p>}
        <button className="button" disabled={isSubmitting}>Salvar</button>
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
  const { dados, carregando, erro: erroCarga, recarregar } = useDadosPainel(useCallback(() => api.listarClassificacoes(categoria, pagina), [categoria, pagina]));
  async function alternar(item: Classificacao) {
    setOcupado(true);
    setErro('');
    try { await api.salvarClassificacao(categoria, { ativo: !item.ativo }, item.id); recarregar(); }
    catch (causa) { setErro(mensagemErro(causa)); }
    finally { setOcupado(false); }
  }
  return <>
    <CabecalhoPagina titulo="Cadastros de imóveis" descricao="Tipos, finalidades e características usados nos anúncios." acoes={<button className="button" onClick={() => setEditando(null)}>Novo cadastro</button>} />
    <label className="mb-6 grid max-w-xs gap-1.5">Categoria<select value={categoria} onChange={(evento) => { setCategoria(evento.target.value as CategoriaClassificacao); setPagina(1); }}>{Object.entries(CATEGORIAS).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}</select></label>
    <EstadoCarregamento carregando={carregando} erro={erroCarga} tentarNovamente={recarregar} />
    {erro && <p role="alert" className="error">{erro}</p>}
    {dados && !erroCarga && (
      <section className={estilos.painel}>
        {dados.itens.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-4">
            <div><strong>{item.nome}</strong><p className="m-0 text-sm text-muted"><Etiqueta tom={item.ativo ? 'neutro' : 'alerta'}>{item.ativo ? 'Ativo' : 'Inativo'}</Etiqueta>{item.slug ? ` · ${item.slug}` : ''}</p></div>
            <div className="flex gap-3"><button className="buttonGhost" onClick={() => setEditando(item)}>Editar</button><button className="buttonSecondary" disabled={ocupado} onClick={() => void alternar(item)}>{item.ativo ? 'Desativar' : 'Reativar'}</button></div>
          </div>
        ))}
        {dados.total === 0 && <p>Nenhum cadastro encontrado.</p>}
        <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
      </section>
    )}
    {editando !== undefined && <Editor categoria={categoria} item={editando} aoFechar={() => setEditando(undefined)} aoSalvar={recarregar} />}
  </>;
}
