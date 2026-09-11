import type { PropertyValues } from './propertySchema';

const strings = ['title','type','purpose','status','addressStreet','addressNumber','addressCity','addressState','neighborhood','description','featuresText','agentId'] as const;
const numbers = ['price','condoFee','iptuFee','usableArea','totalArea'] as const;
type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
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
export function writePropertyDraft(storage:DraftStorage,key:string,values:Partial<PropertyValues>){
  try {
    const draft:Record<string,unknown>={};
    for(const field of [...strings,...numbers])if(values[field]!==undefined)draft[field]=values[field];
    storage.setItem(key,JSON.stringify(draft));
  }catch{/* A blocked or full session store must not interrupt form editing. */}
}
export function clearPropertyDraft(storage:DraftStorage,key:string){try{storage.removeItem(key);}catch{/* Saving remains successful when session storage is blocked. */}}
