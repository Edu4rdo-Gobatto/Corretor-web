import type { AgentInput, CatalogQuery, Lead, LeadInput, Property, PropertyInput, PropertyStatus, Session } from '../types';
import { http, setAccessToken } from './http';
import { agentFromWire, classificationId, leadFromWire, pageFromWire, propertyFromWire, wireCatalogQuery, wireQuery, type Classification, type ClassificationKind, type Classifications, type WireAgent, type WireLead, type WirePage, type WireProperty, type WireSession } from './portuguese';
import { rentalApi } from './rentals';
const json = (method:string,body?:unknown):RequestInit => ({method,...(body===undefined?{}:{body:JSON.stringify(body)})});
async function classifications(managed=false):Promise<Classifications> {
  const load=async(kind:ClassificationKind)=>{const items:Classification[]=[];let pagina=1;let total=1;do{const result=await http<WirePage<Classification>>(`${managed?'/admin':''}/${kind}?pagina=${pagina}&limite=100`,{},managed);items.push(...result.itens);total=result.total_paginas??Math.ceil(result.total/result.limite);pagina++;}while(pagina<=total);return items;};
  const [types,purposes,features]=await Promise.all([load('tipos-imovel'),load('finalidades-imovel'),load('caracteristicas')]);return {types,purposes,features};
}
const sessionFromWire=(s:WireSession):Session=>({accessToken:s.token_acesso,tokenType:s.tipo_token,agent:agentFromWire(s.corretor)});
export const api = {
  ...rentalApi,
  classifications,
  listClassifications: async(kind:ClassificationKind,page=1)=>pageFromWire(await http<WirePage<Classification>>(`/admin/${kind}?pagina=${page}&limite=20`),v=>v),
  saveClassification:(kind:ClassificationKind,input:{nome?:string;slug?:string;icone?:string|null;ativo?:boolean},id?:string)=>http<Classification>(`/admin/${kind}${id?`/${id}`:''}`,json(id?'PATCH':'POST',input)),
  listProperties: async(query:CatalogQuery&{status?:PropertyStatus;search?:string;active?:boolean},managed=false)=>{
    const encoded=wireCatalogQuery(query,query.type||query.purpose?await classifications(managed):{types:[],purposes:[],features:[]});
    if(encoded===null)return {items:[],total:0,page:query.page,limit:query.limit,totalPages:0};
    return pageFromWire(await http<WirePage<WireProperty>>(`${managed?'/admin':''}/imoveis?${encoded}`,{},managed),propertyFromWire);
  },
  getProperty:async(slug:string)=>propertyFromWire(await http<WireProperty>(`/imoveis/${encodeURIComponent(slug)}`,{},false)),
  getManagedProperty:async(id:string)=>propertyFromWire(await http<WireProperty>(`/admin/imoveis/${id}`)),
  saveProperty:async(input:PropertyInput,id?:string,previous?:Property)=>{
    const lists=await classifications(true);
    const tipo_id=classificationId(input.type,lists.types),finalidade_id=classificationId(input.purpose,lists.purposes);
    if(!tipo_id||!finalidade_id)throw new Error('Selecione um tipo e uma finalidade cadastrados.');
    return propertyFromWire(await http<WireProperty>(`/admin/imoveis${id?`/${id}`:''}`,json(id?'PATCH':'POST',{titulo:input.title,tipo_id:previous?.typeId===tipo_id?undefined:tipo_id,finalidade_id:previous?.purposeId===finalidade_id?undefined:finalidade_id,valor:String(input.price),valor_condominio:input.condoFee===null?null:String(input.condoFee),valor_iptu:input.iptuFee===null?null:String(input.iptuFee),area_util:String(input.usableArea),area_total:String(input.totalArea),cep:input.postalCode||null,complemento:input.addressComplement||null,logradouro:input.addressStreet,numero:input.addressNumber,cidade:input.addressCity,estado:input.addressState,bairro:input.neighborhood,descricao:input.description,status:input.status,corretor_id:previous?.agentId===input.agentId?undefined:input.agentId,ativo:input.active,caracteristicas:input.featureValues??[]})));
  },
  deleteProperty:(id:string)=>http<void>(`/admin/imoveis/${id}`,json('DELETE')),
  setPropertyActive:async(id:string,ativo:boolean)=>propertyFromWire(await http<WireProperty>(`/admin/imoveis/${id}`,json('PATCH',{ativo}))),
  createLead:(input:LeadInput)=>http<{id:string}>('/clientes',json('POST',{imovel_id:input.propertyId,nome:input.leadName,telefone:input.leadPhone,email:input.leadEmail||undefined,mensagem:input.message||undefined,consentimento:input.consentGiven}),false),
  listLeads:async(query:{page?:number;limit?:number;search?:string;propertyId?:string;createdFrom?:string;createdTo?:string;active?:boolean}={})=>pageFromWire(await http<WirePage<WireLead>>(`/admin/clientes?${wireQuery({pagina:query.page,limite:query.limit,busca:query.search,imovel_id:query.propertyId,ativo:query.active,criado_desde:query.createdFrom,criado_ate:query.createdTo})}`),leadFromWire),
  saveLead:async(input:{name:string;phone:string;email?:string;message?:string;propertyId?:string|null;agentId?:string;active?:boolean},id?:string,previous?:Lead)=>leadFromWire(await http<WireLead>(`/admin/clientes${id?`/${id}`:''}`,json(id?'PATCH':'POST',{nome:input.name,telefone:input.phone,email:input.email||null,mensagem:input.message||null,imovel_id:previous&&previous.propertyId===(input.propertyId||null)?undefined:input.propertyId||null,corretor_id:previous?.agentId===input.agentId?undefined:input.agentId||undefined,...(id?{ativo:input.active}:{})}))),
  deleteLead:(id:string)=>http<void>(`/admin/clientes/${id}`,json('DELETE')),
  listAgents:async(page=1,limit=20)=>pageFromWire(await http<WirePage<WireAgent>>(`/admin/corretores?pagina=${page}&limite=${limit}`),agentFromWire),
  saveAgent:async(input:AgentInput,id?:string)=>agentFromWire(await http<WireAgent>(`/admin/corretores${id?`/${id}`:''}`,json(id?'PATCH':'POST',{nome:input.name,email:input.email,cpf:input.cpf,whatsapp:input.whatsappNumber,creci:input.creci,cargo:input.role==='ADMIN'?'ADMIN':'CORRETOR',url_foto:input.avatarUrl,senha:input.password,ativo:input.active}))),
  uploadMedia:(id:string,files:File[])=>{const body=new FormData();files.forEach(f=>body.append('arquivos',f));return http<unknown>(`/admin/imoveis/${id}/midias`,{method:'POST',body});},
  embedMedia:(id:string,url:string)=>http<unknown>(`/admin/imoveis/${id}/midias/video-embed`,json('POST',{url})),
  reorderMedia:(id:string,midias_ids:string[])=>http<unknown>(`/admin/imoveis/${id}/midias/ordem`,json('PATCH',{midias_ids})),
  coverMedia:(id:string,mediaId:string)=>http<unknown>(`/admin/imoveis/${id}/midias/${mediaId}/capa`,json('PATCH')),
  deleteMedia:(id:string,mediaId:string)=>http<void>(`/admin/imoveis/${id}/midias/${mediaId}`,json('DELETE')),
  login:async(email:string,password:string)=>{const session=sessionFromWire(await http<WireSession>('/autenticacao/entrar',json('POST',{email,senha:password}),false));setAccessToken(session.accessToken);return session;},
  refresh:async()=>{const session=sessionFromWire(await http<WireSession>('/autenticacao/renovar',json('POST'),false));setAccessToken(session.accessToken);return session;},
  logout:async()=>{await http<void>('/autenticacao/sair',json('POST'),false);setAccessToken(null);},
  me:async()=>agentFromWire(await http<WireAgent>('/autenticacao/eu')),
  updateProfile:async(input:{name:string;whatsappNumber:string;creci:string|null;avatarUrl:string|null})=>agentFromWire(await http<WireAgent>('/autenticacao/eu',json('PATCH',{nome:input.name,whatsapp:input.whatsappNumber,creci:input.creci,url_foto:input.avatarUrl}))),
  changePassword:async(input:{currentPassword:string;newPassword:string})=>agentFromWire(await http<WireAgent>('/autenticacao/eu/senha',json('PATCH',{senha_atual:input.currentPassword,nova_senha:input.newPassword}))),
};
