import type { Agent, AgentInput, CatalogQuery, Lead, LeadInput, Page, Property, PropertyInput, PropertyMedia, PropertyType, Session } from '../types';

// Deliberately ephemeral: demo contacts, edits and authentication never leave this page.
const now = () => new Date().toISOString();
const clone = <T>(value: T): T => structuredClone(value);
const agents: Agent[] = [
  {id:'demo-admin', name:'Marina Albuquerque', email:'admin@demo.local', whatsappNumber:'5565999990000', creci:'00000-MT (demonstrativo)', role:'ADMIN', avatarUrl:null, active:true, createdAt:now()},
  {id:'demo-agent', name:'Rafael Campos', email:'agent@demo.local', whatsappNumber:'5565999990001', creci:'00001-MT (demonstrativo)', role:'AGENT', avatarUrl:null, active:true, createdAt:now()},
];
const passwords = new Map(agents.map(a => [a.id, 'demo']));
const photos = ['photo-1497366754035-f200968a6e72', 'photo-1497366811353-6870744d04b2', 'photo-1486406146926-c627a92ad1ab', 'photo-1487958449943-2429e8be8625'];
const seeds: [string, PropertyType, number, number, string, string][] = [
  ['Um novo endereço para grandes ideias', 'SALA', 4800, 96, 'Cuiabá', 'Goiabeiras'],
  ['Amplitude para o próximo passo', 'GALPAO', 18500, 1200, 'Várzea Grande', 'Distrito Industrial'],
  ['Sua marca no centro de tudo', 'LOJA', 7900, 180, 'Cuiabá', 'Jardim das Américas'],
  ['Espaço para construir o futuro', 'TERRENO', 1250000, 1500, 'Cuiabá', 'Jardim Itália'],
  ['Uma presença à altura do seu negócio', 'PREDIO', 4200000, 980, 'Cuiabá', 'Centro Norte'],
  ['Luz natural, novas possibilidades', 'SALA', 3200, 64, 'Cuiabá', 'Alvorada'],
  ['Logística com espaço para crescer', 'GALPAO', 12000, 850, 'Várzea Grande', 'Cristo Rei'],
  ['Visibilidade em cada detalhe', 'LOJA', 6500, 140, 'Várzea Grande', 'Centro Sul'],
  ['O lugar das suas próximas conquistas', 'SALA', 680000, 110, 'Cuiabá', 'Duque de Caxias'],
  ['Um ponto de encontro para negócios', 'LOJA', 5400, 120, 'Cuiabá', 'Santa Rosa'],
  ['Seu empreendimento começa aqui', 'TERRENO', 980000, 1800, 'Várzea Grande', 'Ponte Nova'],
];
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const properties: Property[] = seeds.map(([title,type,price,area,city,neighborhood], i) => {
  const agent = agents[i % 2];
  return {id:`demo-property-${i+1}`,title,slug:slugify(title),type,purpose:price > 100000 ? 'VENDA' : 'LOCACAO', status:i === 9 ? 'RESERVADO' : 'DISPONIVEL',price,condoFee:type === 'SALA' ? 650 : null,iptuFee:220,usableArea:area,totalArea:area*1.1,addressStreet:['Avenida Miguel Sutil','Avenida da FEB','Avenida Historiador Rubens de Mendonça'][i%3],addressNumber:String(120+i*137),addressCity:city,addressState:'MT',neighborhood,description:`Um espaço versátil em ${neighborhood}, pensado para acompanhar o crescimento do seu negócio. Ambientes amplos, excelente iluminação e acesso fácil às principais vias da região.\n\nAgende uma visita para conhecer as possibilidades deste endereço. Imóvel fictício, apresentado exclusivamente para demonstração.`,features:{parkingSpaces: type === 'GALPAO' ? 12 : 2,bathrooms:2,airConditioning:type === 'SALA',accessibility:true},agentId:agent.id,agent,media:[0,1,2].map((offset) => ({id:`demo-media-${i}-${offset}`,type:'IMAGE',url:`https://images.unsplash.com/${photos[(i+offset)%photos.length]}?auto=format&fit=crop&w=1600&q=85`,orderIndex:offset,isCover:offset===0})),createdAt:now(),updatedAt:now()};
});
const leads: Lead[] = ['Ana Oliveira','Carlos Mendes','Luciana Costa','Pedro Santos'].map((name,i) => ({id:`demo-lead-${i}`,propertyId:properties[i].id,agentId:properties[i].agentId,leadName:name,leadPhone:'65999990000',leadEmail:`contato${i+1}@example.com`,message:'Gostaria de agendar uma visita e conhecer as condições.',consentGiven:true,consentTimestamp:now(),consentIp:'demo',termsVersion:'1.0',createdAt:now()}));
let sessionAgentId: string | null = null;
function current() { const agent=agents.find(a => a.id===sessionAgentId && a.active); if (!agent) throw new Error('Sessão expirada. Entre novamente.'); return agent; }
function admin() { const a=current(); if(a.role!=='ADMIN') throw new Error('Acesso permitido apenas a administradores.'); return a; }
function managed(id:string) { const a=current(); const p=properties.find(p => p.id===id); if(!p || (a.role!=='ADMIN' && p.agentId!==a.id)) throw new Error('Imóvel não encontrado ou acesso negado.'); return p; }
function publicProperty(p:Property) { return p.status==='DISPONIVEL' && agents.some(a => a.id===p.agentId && a.active); }
function hydrate(p:Property): Property { const a=agents.find(a => a.id===p.agentId)!; return clone({...p,agent:{id:a.id,name:a.name,whatsappNumber:a.whatsappNumber,creci:a.creci,avatarUrl:a.avatarUrl}}); }
function page<T>(items:T[], requestedPage=1,requestedLimit=20): Page<T> { const limit=Math.max(1,requestedLimit); const page=Math.max(1,requestedPage); return clone({items:items.slice((page-1)*limit,page*limit),total:items.length,page,limit,totalPages:Math.ceil(items.length/limit)}); }
function session():Session { return {accessToken:`demo-${crypto.randomUUID()}`,tokenType:'Bearer',agent:clone(current())}; }
function mediaFor(propertyId:string,mediaId:string) { const p=managed(propertyId); const m=p.media.find(m => m.id===mediaId); if(!m) throw new Error('Mídia não encontrada.'); return {p,m}; }

export const demo = {
  async login(email:string,password:string):Promise<Session> { const a=agents.find(a => a.email.toLowerCase()===email.trim().toLowerCase() && a.active && passwords.get(a.id)===password); if(!a) throw new Error('E-mail ou senha inválidos.'); sessionAgentId=a.id; return session(); },
  async refresh() { return session(); },
  async logout() { sessionAgentId=null; },
  async me() { return clone(current()); },
  async listProperties(query:CatalogQuery,isManaged=false) { const a=isManaged ? current() : null; const filtered=properties.filter(p => isManaged ? a?.role==='ADMIN'||p.agentId===a?.id : publicProperty(p)).filter(p => (!query.type||p.type===query.type)&&(!query.purpose||p.purpose===query.purpose)&&(!query.city||p.addressCity===query.city)&&(query.minPrice===undefined||p.price>=query.minPrice)&&(query.maxPrice===undefined||p.price<=query.maxPrice)); return page(filtered.map(hydrate),query.page,query.limit); },
  async getProperty(slug:string) { const p=properties.find(p => p.slug===slug && publicProperty(p)); if(!p) throw new Error('Imóvel não encontrado.'); return hydrate(p); },
  async getManagedProperty(id:string) { return hydrate(managed(id)); },
  async saveProperty(input:PropertyInput,id?:string) { const a=current(); const existing=id ? managed(id) : null; const agentId=a.role==='ADMIN' ? input.agentId || existing?.agentId || a.id : a.id; const owner=agents.find(a => a.id===agentId && a.active); if(!owner) throw new Error('Selecione um corretor ativo.'); const propertyId=id||crypto.randomUUID(); const p:Property={...clone(input),id:propertyId,agentId,agent:owner,slug:existing?.slug||`${slugify(input.title)}-${propertyId.slice(0,8)}`,media:existing?.media||[],createdAt:existing?.createdAt||now(),updatedAt:now()}; if(existing) properties.splice(properties.indexOf(existing),1,p); else properties.unshift(p); return hydrate(p); },
  async deleteProperty(id:string) { const p=managed(id); p.media.filter(m => m.url.startsWith('blob:')).forEach(m => URL.revokeObjectURL(m.url)); properties.splice(properties.indexOf(p),1); leads.filter(l => l.propertyId===id).forEach(l => {l.propertyId=null;}); },
  async createLead(input:LeadInput) { if(!input.consentGiven) throw new Error('O consentimento é obrigatório.'); if(!input.leadName.trim() || !input.leadPhone.trim()) throw new Error('Informe nome e telefone.'); const p=properties.find(p => p.id===input.propertyId && publicProperty(p)); if(!p) throw new Error('Imóvel indisponível.'); const lead:Lead={...clone(input),id:crypto.randomUUID(),agentId:p.agentId,leadEmail:input.leadEmail||null,message:input.message||null,consentTimestamp:now(),consentIp:'demo',termsVersion:'1.0',createdAt:now()}; leads.unshift(lead); return clone(lead); },
  async listLeads(query:{page?:number;limit?:number;search?:string;propertyId?:string}={}) { const a=current(); return page(leads.filter(l => (a.role==='ADMIN'||l.agentId===a.id)&&(!query.propertyId||l.propertyId===query.propertyId)&&(!query.search||`${l.leadName} ${l.leadPhone} ${l.leadEmail||''}`.toLowerCase().includes(query.search.toLowerCase()))),query.page,query.limit); },
  async deleteLead(id:string) { const a=current(); const index=leads.findIndex(l => l.id===id && (a.role==='ADMIN'||l.agentId===a.id)); if(index<0) throw new Error('Contato não encontrado.'); leads.splice(index,1); },
  async listAgents(requestedPage=1,limit=20) { admin(); return page(agents,requestedPage,limit); },
  async saveAgent(input:AgentInput,id?:string) { admin(); const existing=id ? agents.find(a => a.id===id) : undefined; if(id&&!existing) throw new Error('Corretor não encontrado.'); if(existing?.role==='ADMIN' && existing.active && (input.role!=='ADMIN'||input.active===false) && agents.filter(a => a.role==='ADMIN'&&a.active).length===1) throw new Error('Mantenha pelo menos um administrador ativo.'); if(agents.some(a => a.id!==id && a.email.toLowerCase()===input.email.toLowerCase())) throw new Error('E-mail já cadastrado.'); if(!existing&&!input.password) throw new Error('Informe uma senha.'); const {password,...safeInput}=input; const a:Agent={...safeInput,id:id||crypto.randomUUID(),active:input.active??existing?.active??true,createdAt:existing?.createdAt||now()}; if(existing) agents.splice(agents.indexOf(existing),1,a); else agents.push(a); if(password) passwords.set(a.id,password); return clone(a); },
  async uploadMedia(propertyId:string,files:File[]) { const p=managed(propertyId); if(files.some(f => !['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm'].includes(f.type)||f.size>100*1024*1024)) throw new Error('Arquivo inválido. Use imagens ou vídeos com até 100 MB.'); const added:PropertyMedia[]=files.map((f,i) => ({id:crypto.randomUUID(),type:f.type.startsWith('image/')?'IMAGE':'VIDEO_FILE',url:URL.createObjectURL(f),orderIndex:p.media.length+i,isCover:false})); p.media.push(...added); if(!p.media.some(m => m.isCover)) {const first=p.media.find(m => m.type==='IMAGE'); if(first) first.isCover=true;} return clone(added); },
  async embedMedia(propertyId:string,url:string) { const p=managed(propertyId); const parsed=new URL(url); if(parsed.protocol!=='https:'||!['www.youtube.com','youtube.com','youtu.be','vimeo.com','www.vimeo.com','player.vimeo.com'].includes(parsed.hostname)) throw new Error('Use um link HTTPS do YouTube ou Vimeo.'); const media:PropertyMedia={id:crypto.randomUUID(),type:'VIDEO_EMBED',url,orderIndex:p.media.length,isCover:false}; p.media.push(media); return clone(media); },
  async reorderMedia(propertyId:string,mediaIds:string[]) { const p=managed(propertyId); if(mediaIds.length!==p.media.length||new Set(mediaIds).size!==mediaIds.length||mediaIds.some(id => !p.media.some(m => m.id===id))) throw new Error('Ordem de mídias inválida.'); p.media=mediaIds.map((id,i) => ({...p.media.find(m => m.id===id)!,orderIndex:i})); },
  async coverMedia(propertyId:string,mediaId:string) { const {p,m}=mediaFor(propertyId,mediaId); if(m.type!=='IMAGE') throw new Error('A capa precisa ser uma imagem.'); p.media.forEach(item => {item.isCover=item.id===mediaId;}); },
  async deleteMedia(propertyId:string,mediaId:string) { const {p,m}=mediaFor(propertyId,mediaId); if(m.url.startsWith('blob:')) URL.revokeObjectURL(m.url); p.media=p.media.filter(item => item.id!==mediaId); p.media.forEach((item,i) => {item.orderIndex=i;}); if(m.isCover) {const first=p.media.find(item => item.type==='IMAGE'); if(first) first.isCover=true;} },
};
