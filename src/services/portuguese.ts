import type { Agent, CatalogQuery, Lead, Page, Property, PropertyStatus } from '../types';

export interface WirePage<T> { itens: T[]; total: number; pagina: number; limite: number; total_paginas?: number }
export interface Classification { id: string; nome: string; slug?: string; icone?: string | null; ativo: boolean }
export interface Classifications { types: Classification[]; purposes: Classification[]; features: Classification[] }
export type ClassificationKind = 'tipos-imovel' | 'finalidades-imovel' | 'caracteristicas';
export interface WireAgent { id:string; nome:string; email:string; cpf:string; whatsapp:string; creci:string|null; cargo:'ADMIN'|'CORRETOR'; url_foto:string|null; ativo:boolean; criado_em:string }
export interface WireSession { token_acesso:string; tipo_token:'Bearer'; corretor:WireAgent }
export interface WireLead { id:string; nome:string; telefone:string; email:string|null; mensagem:string|null; imovel_id:string|null; corretor_id:string; consentimento:boolean; consentimento_em:string|null; consentimento_ip:string|null; versao_termos:string|null; criado_em:string; ativo:boolean; origem:'SITE'|'MANUAL' }
export interface WireProperty {
  id:string; titulo:string; slug:string; tipo_id:string; finalidade_id:string;
  tipo:Pick<Classification,'id'|'nome'|'slug'>|null; finalidade:Pick<Classification,'id'|'nome'|'slug'>|null;
  valor:string; valor_condominio:string|null; valor_iptu:string|null; area_util:string; area_total:string;
  cep:string|null; logradouro:string; numero:string; complemento:string|null; bairro:string; cidade:string; estado:string;
  descricao:string; status:PropertyStatus; ativo:boolean; corretor_id:string;
  corretor:{id:string;nome:string;whatsapp:string;creci:string|null;url_foto:string|null}|null;
  midias:{id:string;tipo:'IMAGEM'|'VIDEO_EMBED'|'VIDEO_ARQUIVO';url:string;ordem:number;capa:boolean}[];
  caracteristicas:{caracteristica_id:string;nome:string;icone:string|null;valor:string|null}[];
  criado_em:string; alterado_em:string;
}
export const pageFromWire = <T,U>(p:WirePage<T>, map:(item:T)=>U):Page<U> => ({items:p.itens.map(map),total:p.total,page:p.pagina,limit:p.limite,totalPages:p.total_paginas ?? Math.ceil(p.total/p.limite)});
export const agentFromWire = (a:WireAgent):Agent => ({id:a.id,name:a.nome,email:a.email,cpf:a.cpf,whatsappNumber:a.whatsapp,creci:a.creci,role:a.cargo==='ADMIN'?'ADMIN':'AGENT',avatarUrl:a.url_foto,active:a.ativo,createdAt:a.criado_em});
export const leadFromWire = (a:WireLead):Lead => ({id:a.id,leadName:a.nome,leadPhone:a.telefone,leadEmail:a.email,message:a.mensagem,propertyId:a.imovel_id,agentId:a.corretor_id,consentGiven:a.consentimento,consentTimestamp:a.consentimento_em??'',consentIp:a.consentimento_ip??'',termsVersion:a.versao_termos??'',createdAt:a.criado_em,active:a.ativo,origin:a.origem});
const legacySlugs:Record<string,string> = {GALPAO:'galpao',SALA:'sala-comercial',PREDIO:'predio',LOJA:'loja',TERRENO:'terreno',LOCACAO:'locacao',VENDA:'venda'};
export const classificationKey = (item:Pick<Classification,'id'|'slug'>) => Object.entries(legacySlugs).find(([,slug])=>slug===item.slug)?.[0] ?? item.slug ?? item.id;
export function propertyFromWire(p:WireProperty):Property {
  return {id:p.id,title:p.titulo,slug:p.slug,type:p.tipo?classificationKey(p.tipo):p.tipo_id,purpose:p.finalidade?classificationKey(p.finalidade):p.finalidade_id,typeId:p.tipo_id,purposeId:p.finalidade_id,typeName:p.tipo?.nome??'Imóvel',purposeName:p.finalidade?.nome??'',status:p.status,active:p.ativo,price:Number(p.valor),condoFee:p.valor_condominio===null?null:Number(p.valor_condominio),iptuFee:p.valor_iptu===null?null:Number(p.valor_iptu),usableArea:Number(p.area_util),totalArea:Number(p.area_total),postalCode:p.cep??'',addressComplement:p.complemento??'',addressStreet:p.logradouro,addressNumber:p.numero,addressCity:p.cidade,addressState:p.estado,neighborhood:p.bairro,description:p.descricao,features:Object.fromEntries(p.caracteristicas.map(c=>[c.nome,c.valor??true])),featureValues:p.caracteristicas.map(c=>({caracteristica_id:c.caracteristica_id,valor:c.valor})),agentId:p.corretor_id,agent:p.corretor?{id:p.corretor.id,name:p.corretor.nome,whatsappNumber:p.corretor.whatsapp,creci:p.corretor.creci,avatarUrl:p.corretor.url_foto}:{id:p.corretor_id,name:'Atendimento',whatsappNumber:'',creci:null,avatarUrl:null},media:p.midias.map(m=>({id:m.id,type:m.tipo==='IMAGEM'?'IMAGE':m.tipo==='VIDEO_ARQUIVO'?'VIDEO_FILE':'VIDEO_EMBED',url:m.url,orderIndex:m.ordem,isCover:m.capa})),createdAt:p.criado_em,updatedAt:p.alterado_em};
}
export function classificationId(value:string|undefined, items:Classification[]):string|undefined {
  if (!value) return undefined;
  return items.find(i=>i.id===value || classificationKey(i)===value || i.slug===value)?.id;
}
export function wireCatalogQuery(query:Partial<CatalogQuery>&{status?:PropertyStatus;search?:string;active?:boolean}, lists:Classifications):string|null {
  const type=classificationId(query.type,lists.types), purpose=classificationId(query.purpose,lists.purposes);
  if ((query.type&&!type)||(query.purpose&&!purpose)) return null;
  return wireQuery({pagina:query.page,limite:query.limit,tipo_id:type,finalidade_id:purpose,cidade:query.city,valor_min:query.minPrice,valor_max:query.maxPrice,status:query.status,busca:query.search,ativo:query.active});
}
export const wireQuery = (query:Record<string,string|number|boolean|undefined>) => new URLSearchParams(Object.entries(query).filter(([,v])=>v!==undefined&&v!=='').map(([k,v])=>[k,String(v)])).toString();
