import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../services/api';
import type { Classification, ClassificationKind } from '../../services/portuguese';
import { useAdminData } from './useAdminData';
import AsyncState from '../../components/AsyncState';
import Pagination from '../../components/Pagination';
import Dialog from '../../components/Dialog';
import { errorMessage } from '../../services/format';
const schema=z.object({nome:z.string().trim().min(2,'Use ao menos dois caracteres.').max(100),slug:z.string().max(120).regex(/^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/,'Use letras minúsculas, números e hífens.'),icone:z.string().max(100)});
type Values=z.infer<typeof schema>;
function Editor({kind,item,close,saved}:{kind:ClassificationKind;item:Classification|null;close:()=>void;saved:()=>void}) {
  const [error,setError]=useState('');
  const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<Values>({resolver:zodResolver(schema),defaultValues:{nome:item?.nome??'',slug:item?.slug??'',icone:item?.icone??''}});
  async function save(v:Values){try{setError('');await api.saveClassification(kind,{nome:v.nome,...(kind==='caracteristicas'?{icone:v.icone||null}:{...(v.slug?{slug:v.slug}:{})})},item?.id);saved();close();}catch(e){setError(errorMessage(e));}}
  return <Dialog title={item?'Editar cadastro':'Novo cadastro'} onClose={()=>{if(!isSubmitting)close();}}><form onSubmit={handleSubmit(save)} noValidate className="grid gap-4"><label>Nome<input {...register('nome')}/>{errors.nome&&<span className="error">{errors.nome.message}</span>}</label>{kind==='caracteristicas'?<label>Ícone (opcional)<input {...register('icone')}/></label>:<label>Identificador no endereço (opcional)<input {...register('slug')}/>{errors.slug&&<span className="error">{errors.slug.message}</span>}</label>}{error&&<p role="alert" className="error">{error}</p>}<button className="button" disabled={isSubmitting}>Salvar</button></form></Dialog>;
}
export default function Classifications(){
  const [kind,setKind]=useState<ClassificationKind>('tipos-imovel');const [page,setPage]=useState(1);const [editing,setEditing]=useState<Classification|null|undefined>();const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const data=useAdminData(useCallback(()=>api.listClassifications(kind,page),[kind,page]));
  async function toggle(item:Classification){setBusy(true);setError('');try{await api.saveClassification(kind,{ativo:!item.ativo},item.id);data.refresh();}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
  return <><header className="mb-8 flex flex-wrap justify-between gap-4"><div><h1>Cadastros de imóveis</h1><p className="muted">Tipos, finalidades e características usados nos anúncios.</p></div><button className="button" onClick={()=>setEditing(null)}>Novo cadastro</button></header><label>Categoria<select value={kind} onChange={e=>{setKind(e.target.value as ClassificationKind);setPage(1);}}><option value="tipos-imovel">Tipos de imóvel</option><option value="finalidades-imovel">Finalidades</option><option value="caracteristicas">Características</option></select></label><AsyncState loading={data.loading} error={data.error} retry={data.refresh}/>{error&&<p role="alert" className="error">{error}</p>}<section className="my-6 rounded border border-line bg-paper p-5">{data.data?.items.map(item=><div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-4"><div><strong>{item.nome}</strong><p className="muted">{item.ativo?'Ativo':'Inativo'}{item.slug?` · ${item.slug}`:''}</p></div><div className="flex gap-3"><button className="buttonGhost" onClick={()=>setEditing(item)}>Editar</button><button className="buttonSecondary" disabled={busy} onClick={()=>void toggle(item)}>{item.ativo?'Desativar':'Reativar'}</button></div></div>)}{data.data?.total===0&&<p>Nenhum cadastro encontrado.</p>}<Pagination page={page} totalPages={data.data?.totalPages??0} onChange={setPage}/></section>{editing!==undefined&&<Editor kind={kind} item={editing} close={()=>setEditing(undefined)} saved={data.refresh}/>}</>;
}
