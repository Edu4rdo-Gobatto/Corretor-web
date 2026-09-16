import type { Classificacoes, Imovel } from '../tipos';

// Dados de teste para SSR, smoke e componentes; nunca usados como fallback de rede.
export const classificacoesExemplo: Classificacoes = {
  tipos: [{ id: 1, nome: 'Salas comerciais', slug: 'sala-comercial', ativo: true }, { id: 2, nome: 'Galpões', slug: 'galpao', ativo: true }],
  finalidades: [{ id: 3, nome: 'Locação', slug: 'locacao', ativo: true }, { id: 4, nome: 'Venda', slug: 'venda', ativo: true }],
  caracteristicas: [{ id: 5, nome: 'Acessibilidade', icone: null, ativo: true }],
};

export const imovelExemplo: Imovel = {
  id: 42, titulo: 'Sala comercial no Centro', slug: 'sala-comercial-no-centro-42', tipo_id: 1, finalidade_id: 3,
  tipo: classificacoesExemplo.tipos[0], finalidade: classificacoesExemplo.finalidades[0],
  valor_venda: null, valor_locacao: '2500.00', valor_condominio: '300.00', valor_iptu: '100.00', area_util: '60.00', area_total: '70.00',
  cep: null, logradouro: 'Rua de demonstração', numero: '100', complemento: null, bairro: 'Centro', cidade: 'Cuiabá', estado: 'MT',
  descricao: 'Imóvel fictício para verificar o site. Sala comercial com iluminação natural.', status: 'DISPONIVEL', destaque: false, ativo: true,
  corretor_id: 1, corretor: { id: 1, nome: 'Corretor de teste', whatsapp: '5565999990000', creci: null, url_foto: null },
  midias: [{ id: 7, tipo: 'IMAGEM', url: '/assets/commercial-space-1200.webp', capa: true, ordem: 0 }],
  caracteristicas: [{ caracteristica_id: 5, nome: 'Acessibilidade', icone: null, valor: null }],
  criado_em: '2026-09-11T00:00:00Z', alterado_em: '2026-09-11T00:00:00Z',
};
