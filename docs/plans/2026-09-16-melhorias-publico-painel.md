# Melhorias do catálogo, atendimento e painel — 16/09/2026

Responsável: Codex. Execução autorizada pelo proprietário, direto na main; commit/push/deploy dependem de autorização separada.

## Implementação

- [x] Catálogo com datalist das cidades da página, sem endpoint adicional; filtros e paginação mantidos.
- [x] Cards distinguem reservado/concluído, sem mudar a regra pública de listar somente disponíveis.
- [x] Preço/m² usa área útil válida; locação mostra soma dos valores informados, parcial quando houver encargos ausentes. O contrato não informa periodicidade do IPTU: a interface pede confirmação e não promete total mensal fechado.
- [x] Relacionados priorizam finalidade+cidade, completam por tipo, excluem o imóvel atual e duplicatas, máximo três.
- [x] Mapa lazy após clique explícito, com endereço suficiente e alternativa externa.
- [x] Telefone brasileiro formatado, internacionais preservados, honeypot bloqueia antes do popup/POST; consentimento e API mantidos.
- [x] Rodapé com Alugar/Comprar, CRECI e campos comerciais opcionais em brand.contact. Campos vazios ficam ocultos.
- [x] Dashboard com métricas independentes, contagem por status, contatos ativos 30d, contratos ativos e valores de parcelas ativas de todas as páginas de comissões acessíveis. Soma em centavos com BigInt.
- [x] Contatos: seletor pesquisável de imóvel, datas inclusivas no fuso Cuiabá, situação, busca e paginação; mensagem expansível.
- [x] CSV da página atual com BOM UTF-8, escaping, proteção contra fórmulas e bloqueio durante carga/erro/dados antigos.
- [x] Origem exibida como informação. ConsultaClientesDto não aceita origem; filtro global por origem adiado, sem filtrar somente a página nem alterar backend.
- [x] Duplicação por dono/admin usando POST existente, classificações ativas, título de cópia, novo slug na API, sem mídia/IDs/auditoria originais. Confirma antes de sobrescrever rascunho.
- [x] Preview em nova aba; guarda de navegação interna/histórico e beforeunload; rascunho restaurado exige confirmação de saída.
- [x] RouterProvider/data router criado uma vez no navegador para useBlocker. SSR continua com StaticRouter/AppRoutes.
- [x] 404 com atalhos, 503 preserva retry; OG alt e dimensões somente do asset conhecido 1200×900. Políticas de indexação preservadas.

## Dependências externas e limites

- [ ] Receber logo oficial e dados reais de privacidade/contato/horário/endereço do proprietário. Manter conteúdo preparatório até então.
- [ ] Login e operações com backend/banco real de teste exigem E2E_STACK=teste e credenciais sintéticas; não usar produção.
- Ordenação, /stats, migrations, CSP, CORS, analytics/PWA e publicação fora deste corte.
- O honeypot do navegador é uma barreira complementar; não substitui rate limit/validação da API.

## Verificação

Resultados finais em CHANGELOG_AI.md: typecheck, lint, Vitest, build, smoke SSR/proxy/Vercel,
Playwright com quantidade explícita de testes não executados e conferência visual com fixture local.
