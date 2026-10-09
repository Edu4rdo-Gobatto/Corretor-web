# Índice da documentação — corretor-web

Todos os documentos ficam em `docs/`, numa pasta plana. Atualize este índice quando criar, apagar ou mudar o papel
de um arquivo. A API irmã tem o próprio índice em `../../Corretor-API/docs/`.

## Comece por aqui

| Arquivo | Para que serve |
|---|---|
| [README.md](README.md) | Instalação, comandos, variáveis, sessão, rotas, SEO, publicação e testes |
| [AGENTS.md](AGENTS.md) | Regras do projeto, protocolo entre agentes, comandos, mapa do código e serviços publicados |
| [CLAUDE.md](CLAUDE.md) | Instruções extras do Claude; importa o `AGENTS.md` |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Estado atual e histórico resumido, uma linha por marco |
| [TASKS.md](TASKS.md) | Tarefas abertas, backlog e concluídas |
| [DECISIONS.md](DECISIONS.md) | Decisões em vigor e decisões substituídas |
| [CHANGELOG_AI.md](CHANGELOG_AI.md) | Resumo por período e registros novos (só acréscimos) |

## Registros datados

| Arquivo | Conteúdo |
|---|---|
| [2026-10-02-auditoria-fullstack.md](2026-10-02-auditoria-fullstack.md) | Achados A01–A11 e H01 com o status atual |
| [2026-10-03-carga-catalogo.md](2026-10-03-carga-catalogo.md) | Carga de 12 imóveis ilustrativos no Neon |
| [2026-10-06-painel-especificacao-visual.md](2026-10-06-painel-especificacao-visual.md) | Tokens e regras vigentes do painel |
| [2026-10-06-ajustes-painel.md](2026-10-06-ajustes-painel.md) | Resumo dos ajustes após a revisão de Contatos |
| [2026-10-06-conclusao-area-corretor.md](2026-10-06-conclusao-area-corretor.md) | Resumo da conclusão da especificação do painel |
| [2026-10-06-refinamentos-sistema.md](2026-10-06-refinamentos-sistema.md) | Resumo de Contatos em abas, foto por upload e filtros automáticos |
| [2026-10-06-system-design.docx](2026-10-06-system-design.docx) | System Design de 06/10 (documento Word, não revisado nesta atualização) |
| [2026-10-09-padronizacao-painel.md](2026-10-09-padronizacao-painel.md) | Padronização visual do painel inteiro |
| [2026-10-09-seis-pontos.md](2026-10-09-seis-pontos.md) | CRECI, tema claro, vários tipos, `content.js` e clientes da comissão |
| [PLANO-AREA-CORRETOR.md](PLANO-AREA-CORRETOR.md) | Resumo do plano da Área do Corretor, concluído |

## Modelos de prompt

Não são carregados automaticamente desde a remoção de `.claude/` em 04/10 e dependem de specs visuais que não existem.

| Arquivo | Conteúdo |
|---|---|
| [comando-revisar-design.md](comando-revisar-design.md) | Comando `/revisar-design` |
| [comando-medir.md](comando-medir.md) | Comando `/medir` |
| [revisor-design.md](revisor-design.md) | Subagente de revisão visual |
| [auditor-desempenho.md](auditor-desempenho.md) | Subagente de medição de desempenho |
