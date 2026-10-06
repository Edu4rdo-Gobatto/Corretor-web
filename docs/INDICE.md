# Índice da documentação — corretor-web

Uma página para achar o estado real do produto sem reler ~250 KB de histórico.
Atualize este índice quando um documento mudar de papel.

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
