# Integração do frontend ao backend em português

Pedido autorizado: “Mude o resto, o drive eu ajusto”. Preservar a identidade visual, URLs públicas e alterações existentes; trabalhar na main sem commit automático.

- [ ] Integrar sessão, corretores, clientes, imóveis e mídia ao contrato HTTP português.
- [ ] Carregar classificações dinâmicas no catálogo, SSR e formulário, com gestão no painel.
- [ ] Substituir documentos R2 e financeiro antigo por partes, contratos/Drive e comissões de locação/venda.
- [ ] Validar tipos, lint, testes, build, SSR e navegação; revisar a integração completa.
- [ ] Sincronizar documentação nos dois repositórios e registrar os requisitos reais do corte.

Divisão: Codex principal integra serviços/catálogo/SSR/cadastros; agente contratos_comissoes trabalha apenas Rentals, rentalSchema, Commissions e services/rentals. Revisão da integração é do principal. A configuração externa do Drive pertence ao usuário. Migração exige complementos reais e backup, sem dados inventados.
