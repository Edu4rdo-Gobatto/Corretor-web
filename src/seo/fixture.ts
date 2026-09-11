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
