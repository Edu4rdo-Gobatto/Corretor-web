import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Aviso from '../../componentes/Aviso';
import Campo from '../../componentes/Campo';
import { IconeSalvar } from '../../componentes/Icones';
import Dialogo from '../../componentes/Dialogo';
import { estilos } from '../../componentes/estilosPainel';
import { api } from '../../servicos/api';
import { mensagemErro } from '../../servicos/formato';
import type { CategoriaClassificacao, Classificacao } from '../../tipos';

const esquema = z.object({
  nome: z.string().trim().min(2, 'Use ao menos dois caracteres.').max(100),
  slug: z.string().max(120).regex(/^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/, 'Use letras minúsculas, números e hífens.'),
  icone: z.string().max(100),
});
type Valores = z.infer<typeof esquema>;
export const CATEGORIAS: Record<CategoriaClassificacao, string> = { 'tipos-imovel': 'Tipos de imóvel', 'finalidades-imovel': 'Finalidades', caracteristicas: 'Características' };

export function EditorClassificacao({ categoria, item, aoFechar, aoSalvar }: { categoria: CategoriaClassificacao; item: Classificacao | null; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<Valores>({ resolver: zodResolver(esquema), defaultValues: { nome: item?.nome ?? '', slug: item?.slug ?? '', icone: item?.icone ?? '' } });
  async function salvar(valores: Valores) {
    setErro('');
    try {
      await api.salvarClassificacao(categoria, { nome: valores.nome, ...(categoria === 'caracteristicas' ? { icone: valores.icone || null } : valores.slug ? { slug: valores.slug } : {}) }, item?.id);
      aoSalvar();
      aoFechar();
    } catch (causa) { setErro(mensagemErro(causa)); }
  }
  return (
    <Dialogo titulo={item ? 'Editar cadastro' : 'Novo cadastro'} tamanho="estreito" alterado={isDirty} ocupado={isSubmitting} aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form onSubmit={handleSubmit(salvar)} noValidate data-atalho-salvar className={`${estilos.formulario} grid gap-4`}>
        <fieldset disabled={isSubmitting} className="m-0 grid min-w-0 gap-4 border-0 p-0"><Campo rotulo="Nome" obrigatorio erro={errors.nome?.message}><input {...register('nome')} /></Campo>
        {categoria === 'caracteristicas' ? <Campo rotulo="Ícone (opcional)" erro={errors.icone?.message}><input {...register('icone')} /></Campo> : <Campo rotulo="Identificador no endereço (opcional)" erro={errors.slug?.message} dica="Letras minúsculas, números e hífens."><input {...register('slug')} /></Campo>}
        </fieldset>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}><IconeSalvar size={20} aria-hidden="true" />{isSubmitting ? 'Salvando…' : 'Salvar'}</button><button type="button" className="buttonGhost" disabled={isSubmitting} data-fechar-dialogo>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

