import type { Classificacoes, Imovel } from '../tipos';

// Dados de teste para SSR, smoke e componentes; nunca usados como fallback de rede.
export const classificacoesExemplo: Classificacoes = {
  tipos: [
    { id: 1, nome: 'Salas comerciais', slug: 'sala-comercial', ativo: true }, { id: 2, nome: 'Galpões', slug: 'galpao', ativo: true },
    { id: 6, nome: 'Lojas', slug: 'loja', ativo: true }, { id: 7, nome: 'Terrenos', slug: 'terreno', ativo: true }, { id: 8, nome: 'Prédios', slug: 'predio', ativo: true },
  ],
  finalidades: [{ id: 3, nome: 'Locação', slug: 'locacao', ativo: true }, { id: 4, nome: 'Venda', slug: 'venda', ativo: true }],
  caracteristicas: [{ id: 5, nome: 'Acessibilidade', icone: null, ativo: true }],
};

export const imovelExemplo: Imovel = {
  id: 42, titulo: 'Sala comercial no Centro', slug: 'sala-comercial-no-centro-42', tipo_id: 1, finalidade_id: 3,
  tipo: classificacoesExemplo.tipos[0], finalidade: classificacoesExemplo.finalidades[0],
  valor_venda: null, valor_locacao: '2500.00', valor_condominio: '300.00', valor_iptu: '100.00', area_util: '60.00', area_total: '70.00',
  cep: null, logradouro: 'Rua de demonstração', numero: '100', complemento: null, bairro: 'Centro', cidade: 'Juara', estado: 'MT',
  descricao: 'Imóvel fictício para verificar o site. Sala comercial com iluminação natural.', status: 'DISPONIVEL', destaque: false, ativo: true,
  corretor_id: 1, corretor: { id: 1, nome: 'Corretor de teste', whatsapp: '5565999990000', creci: null, url_foto: null },
  midias: [{ id: 7, tipo: 'IMAGEM', url: '/assets/commercial-space-1200.webp', capa: true, ordem: 0 }],
  caracteristicas: [{ caracteristica_id: 5, nome: 'Acessibilidade', icone: null, valor: null }],
  criado_em: '2026-09-11T00:00:00Z', alterado_em: '2026-09-11T00:00:00Z',
};

interface ModeloCatalogo {
  titulo: string; tipo: number; finalidade: 'locacao' | 'venda'; valor: string; area_util: string; area_total: string;
  condominio: string | null; iptu: string | null; bairro: string; cidade: string; logradouro: string; corretor: number; destaque?: boolean;
}

const corretoresExemplo = [
  { id: 1, nome: 'Corretor de teste', whatsapp: '5565999990000', creci: null, url_foto: null },
  { id: 2, nome: 'Marina Prado', whatsapp: '5565999990001', creci: null, url_foto: null },
];

const modelosCatalogo: ModeloCatalogo[] = [
  { titulo: 'Sala comercial no Centro', tipo: 0, finalidade: 'locacao', valor: '2500.00', area_util: '60.00', area_total: '70.00', condominio: '300.00', iptu: '100.00', bairro: 'Centro', cidade: 'Juara', logradouro: 'Rua de demonstração', corretor: 0 },
  { titulo: 'Galpão logístico com doca', tipo: 1, finalidade: 'locacao', valor: '18500.00', area_util: '820.00', area_total: '1200.00', condominio: null, iptu: '640.00', bairro: 'Distrito Industrial', cidade: 'Juara', logradouro: 'Avenida das Indústrias', corretor: 1, destaque: true },
  { titulo: 'Loja de rua com vitrine', tipo: 2, finalidade: 'locacao', valor: '7200.00', area_util: '110.00', area_total: '130.00', condominio: null, iptu: '210.00', bairro: 'Goiabeiras', cidade: 'Juara', logradouro: 'Avenida Miguel Sutil', corretor: 0 },
  { titulo: 'Terreno comercial de esquina', tipo: 3, finalidade: 'venda', valor: '1450000.00', area_util: '600.00', area_total: '600.00', condominio: null, iptu: '380.00', bairro: 'Jardim Itália', cidade: 'Juara', logradouro: 'Rua das Palmeiras', corretor: 1 },
  { titulo: 'Prédio comercial com três pavimentos', tipo: 4, finalidade: 'venda', valor: '4200000.00', area_util: '980.00', area_total: '1100.00', condominio: null, iptu: '1850.00', bairro: 'Centro Sul', cidade: 'Porto dos Gaúchos', logradouro: 'Avenida Governador Júlio Campos', corretor: 0, destaque: true },
  { titulo: 'Sala comercial em torre empresarial', tipo: 0, finalidade: 'venda', valor: '520000.00', area_util: '42.00', area_total: '55.00', condominio: '480.00', iptu: '90.00', bairro: 'Bosque da Saúde', cidade: 'Juara', logradouro: 'Rua Barão de Melgaço', corretor: 1 },
  { titulo: 'Galpão com escritório e pátio', tipo: 1, finalidade: 'venda', valor: '2900000.00', area_util: '1400.00', area_total: '2500.00', condominio: null, iptu: '1200.00', bairro: 'Parque Industrial', cidade: 'Juara', logradouro: 'Rodovia dos Imigrantes', corretor: 0 },
  { titulo: 'Loja em galeria no Shopping Popular', tipo: 2, finalidade: 'locacao', valor: '3400.00', area_util: '38.00', area_total: '45.00', condominio: '420.00', iptu: '60.00', bairro: 'Centro Norte', cidade: 'Juara', logradouro: 'Avenida Isaac Póvoas', corretor: 1 },
  { titulo: 'Terreno para galpão na rodovia', tipo: 3, finalidade: 'locacao', valor: '9800.00', area_util: '3000.00', area_total: '3000.00', condominio: null, iptu: '520.00', bairro: 'Industrial', cidade: 'Porto dos Gaúchos', logradouro: 'Rodovia Mario Andreazza', corretor: 0 },
  { titulo: 'Sala comercial com recepção e copa', tipo: 0, finalidade: 'locacao', valor: '1900.00', area_util: '35.00', area_total: '40.00', condominio: '250.00', iptu: '70.00', bairro: 'Santa Rosa', cidade: 'Juara', logradouro: 'Avenida Getúlio Vargas', corretor: 1 },
  { titulo: 'Prédio inteiro para clínica ou escritório', tipo: 4, finalidade: 'locacao', valor: '26000.00', area_util: '640.00', area_total: '720.00', condominio: null, iptu: '980.00', bairro: 'Quilombo', cidade: 'Juara', logradouro: 'Rua Cândido Mariano', corretor: 0 },
];

function slugDe(titulo: string): string {
  return titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Catálogo de teste variado (tipos, finalidades, valores, bairros e cidades) para o SSR e a suíte visual; o primeiro item é `imovelExemplo` com id 100. */
export function catalogoExemplo(): Imovel[] {
  return modelosCatalogo.map((modelo, indice) => {
    const id = 100 + indice;
    const tipo = classificacoesExemplo.tipos[modelo.tipo];
    const finalidade = classificacoesExemplo.finalidades[modelo.finalidade === 'locacao' ? 0 : 1];
    return {
      ...imovelExemplo, id, slug: `${slugDe(modelo.titulo)}-${id}`, titulo: modelo.titulo,
      tipo_id: tipo.id, tipo, finalidade_id: finalidade.id, finalidade,
      valor_venda: modelo.finalidade === 'venda' ? modelo.valor : null, valor_locacao: modelo.finalidade === 'locacao' ? modelo.valor : null,
      valor_condominio: modelo.condominio, valor_iptu: modelo.iptu, area_util: modelo.area_util, area_total: modelo.area_total,
      logradouro: modelo.logradouro, bairro: modelo.bairro, cidade: modelo.cidade,
      descricao: `Imóvel fictício para verificar o site. ${modelo.titulo} em ${modelo.bairro}, ${modelo.cidade}.`,
      destaque: Boolean(modelo.destaque), corretor_id: corretoresExemplo[modelo.corretor].id, corretor: corretoresExemplo[modelo.corretor],
    };
  });
}
