// Orçamento de requisições `/api` feitas pelo navegador em cada tela, com a API simulada da suíte.
// Valores iniciais = linha de base medida em 18/09/2026 (antes da Fase 1). Cada fase do plano de desempenho
// reduz o número da tela que otimizou; subir um limite exige justificativa no CHANGELOG_AI.md.
export const orcamento: Record<string, number> = {
  // Painel: carga direta da URL (inclui a restauração da sessão).
  'painel/visao-geral': 11,
  'painel/imoveis': 2,
  'painel/imovel-novo': 5,
  'painel/imovel-editar': 6,
  'painel/contatos': 4,
  'painel/pessoas': 2,
  'painel/ficha-pessoa': 5,
  'painel/corretores': 2,
  'painel/cadastros': 2,
  'painel/contratos': 2,
  'painel/detalhe-contrato': 3,
  'painel/comissoes': 2,
  'painel/perfil': 9,
  // Público: chamadas do navegador depois do HTML do SSR (a busca do servidor não entra aqui).
  'publico/catalogo': 0,
  'publico/detalhe': 4,
  'publico/navegar-filtro': 7,
};
