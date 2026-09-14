import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useAdminData } from './useAdminData';
import Dialog from '../../components/Dialog';
import AsyncState from '../../components/AsyncState';
import Pagination from '../../components/Pagination';
import { errorMessage } from '../../services/format';
import type { Lead } from '../../types';
export const clientSchema=z.object({name:z.string().trim().min(2,'Informe o nome.').max(200),phone:z.string().regex(/^(?:55)?[1-9][0-9][0-9]{8,9}$/,'Informe DDD e telefone, somente números.'),email:z.union([z.literal(''),z.email()]),message:z.string().max(5000),propertyId:z.union([z.literal(''),z.uuid()]),agentId:z.union([z.literal(''),z.uuid()]),active:z.boolean()});
type Values=z.infer<typeof clientSchema>;
export default function ClientEditor({client,close,saved}:{client:Lead|null;close:()=>void;saved:()=>void}) {
 const {agent}=useAuth();const [error,setError]=useState('');const [search,setSearch]=useState('');const [page,setPage]=useState(1);const [agentPage,setAgentPage]=useState(1);
 const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<Values>({resolver:zodResolver(clientSchema),defaultValues:{name:client?.leadName??'',phone:client?.leadPhone.replace(/\D/g,'')??'',email:client?.leadEmail??'',message:client?.message??'',propertyId:client?.propertyId??'',agentId:client?.agentId??'',active:client?.active??true}});
 const properties=useAdminData(useCallback(()=>api.listProperties({page,limit:15,search},true),[page,search]));
 const agents=useAdminData(useCallback(()=>agent?.role==='ADMIN'?api.listAgents(agentPage,20):Promise.resolve({items:[],total:0,page:1,limit:20,totalPages:0}),[agent?.role,agentPage]));
 async function save(v:Values){setError('');try{await api.saveLead({...v,agentId:agent?.role==='ADMIN'?(v.agentId||agent.id):undefined},client?.id,client??undefined);saved();close();}catch(e){setError(errorMessage(e));}}
 return <Dialog title={client?'Editar cliente':'Novo cliente'} onClose={()=>{if(!isSubmitting)close();}}><form noValidate onSubmit={handleSubmit(save)} className="grid gap-4">{(['name','phone','email','message'] as const).map((key,index)=><label key={key}>{['Nome','Telefone','E-mail','Observações'][index]}<input {...register(key)}/>{errors[key]&&<span className="error">{errors[key]?.message}</span>}</label>)}<label>Buscar imóvel (opcional)<input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label><AsyncState loading={properties.loading} error={properties.error} retry={properties.refresh}/><label>Imóvel de interesse<select {...register('propertyId')}><option value="">Sem imóvel vinculado</option>{client?.propertyId&&!properties.data?.items.some(p=>p.id===client.propertyId)&&<option value={client.propertyId}>Manter imóvel vinculado</option>}{properties.data?.items.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><Pagination page={page} totalPages={properties.data?.totalPages??0} onChange={setPage}/>{agent?.role==='ADMIN'&&<><AsyncState loading={false} error={agents.error} retry={agents.refresh}/><label>Corretor responsável<select {...register('agentId')}><option value="">Minha conta</option>{client?.agentId&&!agents.data?.items.some(a=>a.id===client.agentId)&&<option value={client.agentId}>Manter responsável</option>}{agents.data?.items.filter(a=>a.active||a.id===client?.agentId).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label><Pagination page={agentPage} totalPages={agents.data?.totalPages??0} onChange={setAgentPage}/></>}{client&&<label><input type="checkbox" {...register('active')}/> Cliente ativo</label>}<p className="muted">O cadastro manual não registra consentimento do site.</p>{error&&<p role="alert" className="error">{error}</p>}<button className="button" disabled={isSubmitting}>Salvar cliente</button></form></Dialog>;
}
