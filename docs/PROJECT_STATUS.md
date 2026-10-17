# Estado atual — corretor-web

## 17/10/2026 — Otimizações de desempenho e SEO, enviadas e com CI verde (Claude)

Plano `PLANO_OTIMIZACOES.md` executado na `main`. Com autorização do dono, os commits `4b97026` (código) e `8c9e1d1` (docs)
foram enviados à `origin/main` e o workflow ficou **verde** (run 38998680075). Sem deploy. Cache imutável
só de assets com hash, HTML com `stale-while-revalidate`, `Disallow: /admin`, `ImgOtimizada` em todos os `<img>`,
`og:image:alt`, `manualChunks` restaurado, `FormularioContato` lazy, import dinâmico do `browser-image-compression`, preload
de 4 fontes e recarga única em chunk órfão. JS inicial: 167,5 → 125,2 kB gzip. Verificado: typecheck, lint, 220 testes,
build, smoke do SSR e Playwright **191/191** sem atualizar referências. Detalhes em `DECISIONS.md` e `CHANGELOG_AI.md` de
17/10. Falta: conferir os cabeçalhos na Vercel depois de publicar (o deploy de teste é `noindex`) e medir LCP/CLS/INP reais.

## 16/10/2026 — CI verde e commits enviados (Codex)

O dono autorizou commit e push do frontend, seguidos do acompanhamento do GitHub Actions. Main sincronizada
com `origin/main` (commit `f4cb446`), CI **verde** (run 38981025796), 185/185 testes passaram. API também comitada
e enviada (`564b765` na API: README atualizado com estado 16/10, migrations aplicadas, deploy aguarda autorização).
Sem deploy manual, migration ou alteração de dados reais nesta etapa.

## Atualização vigente — 16/10/2026 (Codex)

Restauração autorizada de testes concluída localmente sobre `0513cc9`, preservando seletor único, cidades e
publicação/SEO recebidos do parceiro. Commits enviados e CI verificado. Os registros datados abaixo
permanecem como histórico do estado de cada entrega.

**Verificação executada:** 214 unitários em 13 arquivos; typecheck, lint, build visual isolado e smoke SSR
aprovados. Playwright: **185/185 em duas execuções completas consecutivas**, sete projetos, sem atualizar as
32 referências de oito telas em claro/escuro e desktop/mobile. Imagens inspecionadas; SHA-256 preservados.
Controles negativos CSS e SSR reprovaram como esperado. Revisão independente sem bloqueantes abertos.

Foram corrigidos quatro defeitos reproduzidos: deduplicação de cache durante carga lenta, exposição de mensagem
interna em 5xx da renovação, disputa no redirecionamento de login e borda de foco dos botões Mais filtros.
Specs, referências e workflow estão prontos para versionamento. API e banco reais não foram usados. O dono deve
conectar Render, verificar `/api/v1/saude` e configurar `ALLOWED_ORIGINS` antes do deploy do front.

## Estado atual (09/10/2026)

## Estado atual (09/10/2026)

**Git:** `main` sincronizada com `origin/main` em `aa4de75`. API irmã em `6b987a5`.

**Serviços (último registro datado):**
- Front: Vercel de teste, `corretor-web-test.vercel.app`, desde 13/09. O commit implantado hoje não está registrado.
- API: Render de teste (`srv-daj21e15efls73fab4gg`), deploy de `86ecf29` em 08/10. Esse commit já inclui a sessão
  de 4h. O pacote de 09/10 (`6b987a5` e `aa4de75`) ainda não tem deploy registrado.
- Neon e R2 ativos. A URL pública do R2 respondeu 401 em 03/10; as fotos do catálogo vêm da Unsplash.
- Domínio comercial: não existe.

**Pronto no código:**
- Catálogo público com SSR, filtros por URL (inclusive vários tipos), detalhe, contato com consentimento, `/privacidade`,
  `/devs`, 404 com volta automática e 503 com recuperação automática.
- Painel com Visão geral, Imóveis, Contatos (abas), Pessoas, Corretores, Cadastros, Contratos, Comissões e Perfil
  (foto por upload). Fichas em telas próprias, `CampoNumero`, `CampoCreci`, guarda de modal, Esc, Ctrl/⌘+K e
  acabamento comum (`BlocosPainel`).
- Sessão: a API expira após 4h sem uso (JWT de 15 min, cookie de sessão do navegador, sem rotação). O front guarda o
  token só em memória e faz uma renovação compartilhada por vez. Pronta e validada em 06/10.
- Tema claro azul-acinzentado e tema escuro, só por tokens de `tailwind.css`.
- 09/10 (código no `40f635b`, enviado à `origin/main` pelo dono; sem deploy registrado): edição completa de comissão com versão, arquivar/reativar e histórico do plano;
  Cadastros em `/admin/cadastros/:categoria` com índices de reajuste e tipos de contrato; contrato com tipo e índice;
  slogan padrão no h1, rodapé e título. Depende da API com a migration de 09/10 (DEPLOY-20261009).

**13/10 (Claude, sem commit):** filtros do painel na URL (UX-007) e barra de filtros única `BarraFiltros` (UX-008),
sem botão Buscar e com Limpar na faixa de chips. Typecheck, lint e build passam; sem QA de navegador.

**16/10 (Claude):** "Exibir no site" só por `ativo` (API alterada: vendidos e alugados aparecem e aceitam
contato), controle só na edição do imóvel, destaque removido, foco só por cor de borda, erro de campo com ícone.
Falta conferência visual no painel real (VISUAL-20261016) e publicar API e web (PUBLICAR-20261016).

**16/10 (Claude), seletor e cidades:** todos os selects viraram o `Seletor` com check; cadastro de Cidades
(Estado → Cidade no imóvel e filtro do catálogo). Depende da API com a migration `1789862400000` (PUBLICAR-CIDADES-20261016).

**Verificações:** `typecheck`, `lint`, `build` e `npm test` (6 arquivos, 30 testes) passam.
`node scripts/seo-smoke.mjs` passa desde a correção local de 09/10 (SMOKE-001); antes falhava desde 06/10.
A suíte visual foi removida em 14/10 (não tinha specs). QA de navegador de 09/10: 37/37 com a API completa em PostgreSQL descartável.

**Falta homologar:** perfil real (login + R2 + Neon), Safari/iOS e celular físico, cold start publicado (A11),
ACLs do Drive (H01), A09 e A10 com dados reais.

**Bloqueios reais:** nenhum técnico. Publicar o pacote de 09/10 e escolher domínio e plano comercial dependem do dono.

**Em andamento:** nenhuma tarefa de código assumida. Documentação reescrita para o estado atual em 09/10 (Claude).

## Histórico resumido

| Data | Marco |
|---|---|
| 11/09 | Sincronização com o SSR próprio (`d4f6b2f`) e homologação com API, Neon e R2 reais |
| 12/09 | Modo demonstração removido; marca centralizada em `brand.ts`; primeira entrega de locações (depois substituída) |
| 13/09 | Marca Lucas Gobatto, Tailwind 4, mobile, tema escuro, perfil, URLs em português; projeto Vercel de teste publicado |
| 14/09 | Front integrado ao modelo em português da API; contraste dos temas; E2E com Playwright (removido em 03/10) |
| 15/09 | `/devs`, header fixo, hidratação do tema, CSS no HTML, headers de segurança, trava de `API_ORIGIN` local |
| 16/09 | Contrato v2: ids inteiros, cadastro único de pessoas, ficha do imóvel; pacote de melhorias público e painel |
| 17/09 | Escape contextual no JSON-LD |
| 18/09 | Build sempre em produção, `Dialogo` centralizado, grades por container, paleta mais confortável, logo por tema |
| 02/10 | Auditoria full stack A01–A11; easter eggs do `/devs` e 404 |
| 03/10 | Correções da auditoria; suítes de teste removidas; 503 com cena e recuperação; carga de 12 imóveis no Neon |
| 04/10 | Suíte mínima recriada (3 arquivos); documentação reunida em `docs/`, plana; `.claude/` removida |
| 05/10 | Refatoração da Área do Corretor (revertida pelo dono em 06/10) |
| 06/10 | Especificação do painel concluída a partir de `a2a9f81`; Contatos em abas, foto por upload, filtros automáticos; sessão de 4h na API (`46f2235`) |
| 08/10 | 404 da foto resolvido com o deploy de `86ecf29` no Render |
| 09/10 | Ficha do imóvel em notas, padronização do painel, ações só com ícone, `BotaoVoltar`, seis pontos (`aa4de75`); documentação atualizada |


## 15/10/2026 — Restauração de testes em andamento (Codex)

Plano aprovado pelo dono: testes permanentes, referências visuais e GitHub Actions. Main sincronizada em `0dedf02`; relatório original preservado. Histórico integral anterior em `2026-10-15-historico-preservado-36e73b1.md`; documento removido pelo remoto restaurado como histórico. Frentes: HTTP/cache/API; validação/embeds/SEO/hook; Playwright/mocks; coordenação, scripts, CI e documentação. Trabalho local sem commit/push/deploy nem acesso a API/banco reais.

## 16/10/2026 — Continuação da restauração

Base recebida do parceiro: `0513cc9`, preservando seletor unificado, cidades e regras de publicação/SEO por situação.
Cobertura SEO restaurada em arquivo separado, mantendo os testes novos do parceiro. Unitários: **214/214 em 13
arquivos**; tipos, lint, build isolado e smoke aprovados. Correção de foco em Mais filtros reproduzida pelo
Playwright antes do ajuste. Referências e matriz visual completa ainda em validação; CI remoto não executado.
