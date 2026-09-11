import type { PropertyValues } from './propertySchema';
import { MAX_FEATURES_TEXT_LENGTH } from './propertySchema';

const strings = ['title','type','purpose','status','addressStreet','addressNumber','addressCity','addressState','neighborhood','description','featuresText','agentId'] as const;
const numbers = ['price','condoFee','iptuFee','usableArea','totalArea'] as const;
type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type DraftWriteResult = 'saved' | 'too_large' | 'quota' | 'unavailable';

export function propertyDraftKey(agentId:string,propertyId?:string){return `corretor:property-draft:v1:${agentId}:${propertyId??'new'}`;}
export function readPropertyDraft(storage:DraftStorage,key:string):Partial<PropertyValues>|null {
  try {
    const raw:unknown=JSON.parse(storage.getItem(key)??'null');
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
    const source=raw as Record<string,unknown>;
    const draft:Record<string,unknown>={};
    for(const field of strings)if(typeof source[field]==='string')draft[field]=source[field];
    for(const field of numbers)if(typeof source[field]==='number'||source[field]===null)draft[field]=source[field];
    return Object.keys(draft).length?draft as Partial<PropertyValues>:null;
  }catch{return null;}
}
export function writePropertyDraft(storage:DraftStorage,key:string,values:Partial<PropertyValues>):DraftWriteResult{
  if(typeof values.featuresText==='string'&&values.featuresText.length>MAX_FEATURES_TEXT_LENGTH)return 'too_large';
  try {
    const draft:Record<string,unknown>={};
    for(const field of [...strings,...numbers])if(values[field]!==undefined)draft[field]=values[field];
    storage.setItem(key,JSON.stringify(draft));
    return 'saved';
  }catch(error){
    if(error&&typeof error==='object'&&'name' in error&&((error as {name?:unknown}).name==='QuotaExceededError'||(error as {name?:unknown}).name==='NS_ERROR_DOM_QUOTA_REACHED'))return 'quota';
    return 'unavailable';
  }
}
export function clearPropertyDraft(storage:DraftStorage,key:string){try{storage.removeItem(key);}catch{/* Saving remains successful when session storage is blocked. */}}
