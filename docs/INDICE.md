# Índice da documentação — corretor-web

## Padronização vigente do painel (09/10/2026)

[`2026-10-09-padronizacao-painel.md`](2026-10-09-padronizacao-painel.md) registra o acabamento comum de todas as telas administrativas, incluindo a entrada, preservando a ficha de imóvel aprovada e os comportamentos de 06/10. Títulos externos, alinhamento por linha, superfícies compactas, listas/filtros/formulários/diálogos coerentes. Typecheck, lint, 23 testes, build, smoke SSR e QA efêmero aprovados. Escopo frontend/local, sem publicação ou alteração de API/banco; os marcos abaixo permanecem como histórico.

## Refinamento vigente de 06/10/2026

[Contatos, perfil com upload e filtros automáticos](2026-10-06-refinamentos-sistema.md) registra o plano,
implementação, revisão e validação. [System Design](2026-10-06-system-design.docx) descreve arquitetura,
contratos e limites. Este marco atualiza os snapshots abaixo: agora há trabalho autorizado também na API.
R2 temporário real aprovado; perfil no Neon e dispositivo físico ainda sem homologação.
Sem commit, push, deploy ou migrations.

Uma página para achar o estado real do produto sem reler ~250 KB de histórico.
Atualize este índice quando um documento mudar de papel.

## Estado vigente do painel (06/10/2026)

**Atualização mais recente:** specs completas implementadas e validadas localmente.
[`2026-10-06-conclusao-area-corretor.md`](2026-10-06-conclusao-area-corretor.md) reúne telas,
fichas próprias, CampoNumero, guarda e Ctrl/⌘+K, revisões, 320 cenários/140 capturas e limites.
Typecheck/lint/21 testes/build/smoke SSR aprovados. Homologação real pendente; sem publicação.
O parágrafo abaixo permanece como snapshot do primeiro marco, substituído por esta conclusão.

Retomada autorizada pelo dono com a especificação do parceiro `a2a9f81`.
Contatos foi implementado localmente e aguarda revisão visual antes das demais telas. O plano
`PLANO-AREA-CORRETOR.md` permanece como histórico da reversão; a direção vigente é
[`2026-10-06-painel-especificacao-visual.md`](2026-10-06-painel-especificacao-visual.md), com adendo de execução.
Detalhes/limites nas entradas de 06/10 de PROJECT_STATUS, TASKS, DECISIONS e CHANGELOG_AI.
Typecheck, lint, 21 testes, build, smoke SSR e QA simulado (24 cenários/38 capturas) aprovados;
integração real pendente. As fases posteriores do plano não estão concluídas.

## Comece por aqui

| Preciso saber… | Leia | Observação |
|---|---|---|
| Como rodar, regras e mapa do código | [`AGENTS.md`](AGENTS.md) | Fonte das regras do projeto e do protocolo entre agentes |
| O que está em andamento e quem assumiu | [`PROJECT_STATUS.md`](PROJECT_STATUS.md) | Só as 2–3 entradas do topo importam; o resto é histórico |
| O que falta fazer | [`TASKS.md`](TASKS.md) | Uma seção por tarefa, com status |
| Por que algo foi decidido (e o que não fazer) | [`DECISIONS.md`](DECISIONS.md) | Ordem cronológica inversa |
| O que mudou, arquivos e testes executados | [`CHANGELOG_AI.md`](CHANGELOG_AI.md) | Só o último registro é obrigatório no protocolo |
| Regras de produto e contrato | `corretor-spec.json` e [`PLANO-PROJETO-CORRETOR.md`](PLANO-PROJETO-CORRETOR.md) | Compartilhados com a API |
| Última auditoria | [`2026-10-02-auditoria-fullstack.md`](2026-10-02-auditoria-fullstack.md) | Achados A01–A11 |
| Carga do catálogo no Neon | [`2026-10-03-carga-catalogo.md`](2026-10-03-carga-catalogo.md) | Fontes das fotos na API irmã |
| Padrão visual e comportamentos do painel | [`2026-10-06-painel-especificacao-visual.md`](2026-10-06-painel-especificacao-visual.md) | Tokens, listagem, ícones, sidebar e o que falta aplicar |

## Estado resumido (04/10/2026)

- **Produto:** catálogo público SSR, detalhe, contato com consentimento LGPD e painel `/admin`.
- **Verificações automáticas:** `npm run typecheck`, `npm run lint`, `npm test` (suíte mínima, ver abaixo) e `node scripts/seo-smoke.mjs`.
- **Testes:** em 03/10/2026 o dono removeu as suítes antigas. Foi recriada uma suíte **mínima** em
  `src/servicos/*.test.ts` (contato/LGPD, URL de filtro, cálculos de valor e catálogo de exemplo).
  Autorização por perfil, comissão e round-trip de upload moram na API irmã e continuam sem teste.
- **Catálogo real:** 12 anúncios ilustrativos no Neon; fotos na CDN da Unsplash porque a URL pública do R2 responde 401.
  Trocar por fotos reais dos imóveis é pendência de conteúdo, não de código.
- **Dados de demonstração (SSR/visual):** `catalogoExemplo()` em `src/seo/fixture.ts`; nunca usado como fallback de rede.
- **Publicação:** nada publicado; API, Vercel e domínio ainda não existem.

## Regra para não deixar o histórico crescer sem controle

Entradas de `PROJECT_STATUS.md` com mais de duas semanas e concluídas podem ser movidas para
`docs/arquivo/` (sem apagar), mantendo aqui o ponteiro. Decisão ainda não aplicada: exige confirmação do dono.

- [Ajustes aprovados do painel em 06/10/2026](2026-10-06-ajustes-painel.md): seletores, Esc, menu mobile, cards e atendimento.
