import type { Property } from '../types';

export const sampleProperty: Property = {
  id: 'seo-test-1', slug: 'sala-comercial-centro-cuiaba', title: 'Sala comercial no Centro', type: 'SALA', purpose: 'LOCACAO', status: 'DISPONIVEL',
  price: 2500, condoFee: 300, iptuFee: 100, usableArea: 60, totalArea: 70,
  addressStreet: 'Rua de demonstração', addressNumber: '100', neighborhood: 'Centro', addressCity: 'Cuiabá', addressState: 'MT',
  description: 'Imóvel fictício para verificar o site. Sala comercial com iluminação natural.', features: { Acessibilidade: true },
  agentId: 'seo-test-agent', agent: { id: 'seo-test-agent', name: 'Corretor de teste', whatsappNumber: '5565999990000', creci: null, avatarUrl: null },
  media: [{ id: 'seo-photo', type: 'IMAGE', url: '/assets/commercial-space-1200.webp', isCover: true, orderIndex: 0 }],
  createdAt: '2026-09-11T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z',
};

// Fixture de transporte: somente testes, nunca fallback de rede.
export const sampleClassifications = {types:[{id:'11111111-1111-4111-8111-111111111111',nome:'Salas comerciais',slug:'sala-comercial',ativo:true},{id:'22222222-2222-4222-8222-222222222222',nome:'Galpões',slug:'galpao',ativo:true}],purposes:[{id:'33333333-3333-4333-8333-333333333333',nome:'Locação',slug:'locacao',ativo:true}],features:[]};
export const sampleWireProperty = {id:sampleProperty.id,titulo:sampleProperty.title,slug:sampleProperty.slug,tipo_id:sampleClassifications.types[0].id,finalidade_id:sampleClassifications.purposes[0].id,tipo:sampleClassifications.types[0],finalidade:sampleClassifications.purposes[0],valor:'2500.00',valor_condominio:'300.00',valor_iptu:'100.00',area_util:'60.00',area_total:'70.00',cep:null,logradouro:sampleProperty.addressStreet,numero:'100',complemento:null,bairro:'Centro',cidade:'Cuiabá',estado:'MT',descricao:sampleProperty.description,status:'DISPONIVEL' as const,ativo:true,corretor_id:sampleProperty.agentId,corretor:{id:sampleProperty.agentId,nome:sampleProperty.agent.name,whatsapp:sampleProperty.agent.whatsappNumber,creci:null,url_foto:null},midias:[{id:'seo-photo',tipo:'IMAGEM' as const,url:'/assets/commercial-space-1200.webp',capa:true,ordem:0}],caracteristicas:[],criado_em:sampleProperty.createdAt,alterado_em:sampleProperty.updatedAt};
