# Tarefas — corretor-web

Status possíveis: `aberta`, `em andamento`, `em revisão`, `bloqueada`, `concluída`.
Quem assume uma tarefa escreve o próprio nome em Responsável e reflete isso no `PROJECT_STATUS.md`.
Tarefas da API ficam em `../Corretor-API/TASKS.md`.

---

## DEPLOY-002 — Publicar o front

Status: bloqueada
Responsável: —
Revisor: —

Objetivo:

Publicar o front com SSR, apontando para a API em produção.

Bloqueios atuais:

- A API ainda não está publicada (DEPLOY-001 no repositório irmão).
- O plano Hobby da Vercel restringe uso comercial, e o produto será vendido a corretores.
- O build atual é específico da Vercel: `scripts/build.mjs` gera `.vercel/output` no formato Build Output API v3,
  com função `render` declarada como `nodejs24.x`. Mudar de plataforma exige adaptar build e runtime.

Critérios de conclusão:

- Plataforma definida e registrada em `DECISIONS.md`.
- Variáveis de produção configuradas: `VITE_API_URL=/api`, `API_ORIGIN` com o domínio HTTPS da API,
  `SITE_URL` com o domínio público do site e `SEO_INDEXABLE` conforme a decisão.
- `ALLOWED_ORIGINS` da API atualizado com o domínio do front, senão login, refresh e logout respondem 403.
- Conferir em produção: catálogo, detalhe de imóvel, login no painel com cookie de refresh, upload de mídia,
  envio de lead, `robots.txt`, `sitemap.xml` e uma rota inexistente.

---

## SEO-001 — Ligar a indexação

Status: bloqueada por DEPLOY-002
Responsável: —

Objetivo:

Sair de `noindex` e permitir a indexação das páginas públicas.

Critérios de conclusão:

- `SITE_URL` e `API_ORIGIN` em HTTPS, `NODE_ENV=production` e `SEO_INDEXABLE=true`.
- `robots.txt` publicando o `Sitemap:` e liberando as páginas públicas.
- `sitemap.xml` listando os imóveis reais.
- Páginas de catálogo e de imóvel com `index,follow`; painel, preview, 404 e filtros seguem sem indexação.
- Conferir o preview de link no WhatsApp e no LinkedIn.

---

## UX-001 — Cold start visível para o visitante

Status: adiada pelo proprietário
Responsável: —

Objetivo:

O SSR busca dados da API com timeout de 10 s. Se a API estiver hospedada em plano que suspende por inatividade,
a primeira visita cai na página de indisponibilidade.

Critérios de conclusão:

- Decidir entre manter a API acordada, aumentar o timeout, servir um estado de carregamento no lugar do erro,
  ou aceitar o comportamento atual.
- Registrar a decisão em `DECISIONS.md` e, se houver mudança de código, cobrir com teste.

## UX-002 — Refinar catálogo e detalhe público

Status: concluída
Responsável: Claude — concluída em 13/09/2026

Objetivo:

Melhorar a hierarquia visual, responsividade e interações do catálogo público e do detalhe de imóvel sem alterar a
API, os contratos de dados, as URLs ou o fluxo de captação de lead.

Critérios de conclusão:

- Catálogo com busca, filtros, cartões e estados vazio/erro confortáveis em desktop, teclado e mobile.
- Detalhe com galeria, preço, informações, CTA e características visualmente mais claros.
- Testes, typecheck, lint e build aprovados; conferência manual limitada pela API local indisponível.

---

## UX-003 — Rebrand Lucas Gobatto (Juara/MT)

Status: concluída
Responsável: Codex — concluída em 13/09/2026

Objetivo:

Aplicar a identidade real (azul-marinho + dourado + branco, Lucas Gobatto — CRECI 15776, Juara/MT)
só no front, sem nenhuma mudança no back (sem migration, rota, DTO ou integração Si9/Imonov).

Critérios de conclusão:

- `brand.ts` com nome, CRECI, tagline e região de Juara; cabeçalho/rodapé, favicon e `theme-color` na nova marca.
- Tokens navy/gold aplicados via `global.css`; JSON-LD `RealEstateAgent` com CRECI e `areaServed` Juara.
- Typecheck, lint, testes, build e `seo-smoke` aprovados.
- PNG provisório do logo pendente: marca atual em SVG inline até o dono enviar o vetorial com fundo transparente.

---

## DOC-002 — Atualizar o README do front

Status: concluída
Responsável: Codex — concluída em 15/09/2026

Objetivo:

O `README.md` está desatualizado: pede Node 20+ (o `package.json` exige `>=24 <25`), usa `Copy-Item` do PowerShell,
diz que a aplicação sobe em `localhost:5173` (o servidor escuta em `127.0.0.1`), descreve o proxy do Vite, que não
existe mais, e não lista os scripts `test` e `typecheck`, nem as variáveis `API_ORIGIN`, `SITE_URL` e `SEO_INDEXABLE`.
Desde 12/09 também não existem mais os scripts de demonstração nem a variável de modo fictício.

Critérios de conclusão:

- README refletindo os scripts, as variáveis e o fluxo de SSR atuais.

---

## Concluídas

### SYNC-001 — Sincronizar e validar a entrega de SEO/SSR — concluída em 11/09/2026 (Claude)

Cópia local atualizada de `78200ff` para `d4f6b2f`; 64 testes aprovados; lint, typecheck e build sem erro;
smoke do SSR em modo demo aprovado; homologação com API, Neon e R2 reais, com JSON-LD e `og:image` verificados.
Detalhes em `docs/handoffs/2026-09-11-infra-neon-r2.md`.

## RENTAL-001 — Cadastros, contratos e documentos privados — em revisão

Responsável: Codex. Escopo e interfaces: docs/plans/2026-09-12-rental-administration.md.

Critérios: ADMIN em todas as rotas; fichas PF/PJ e dados bancários; contrato com vínculos válidos; documentos privados com tamanho/assinatura validados; busca/paginação; nenhuma comissão presumida. Validação local e revisão em andamento, resultados finais no CHANGELOG_AI.md.

## RENTAL-002 — Homologar banco e documentos privados — bloqueada por ambiente

Disponibilizar o .env local pelo fluxo habitual do dono, sem enviá-lo ao chat. Verificar acesso ADMIN, fazer backup do Neon, conferir migrations já aplicadas e executar a nova migration explicitamente. Provisionar bucket privado R2 e acesso do token; configurar R2_DOCUMENTS_BUCKET. Verificar cadastro/edição de pessoa, criação/encerramento de contrato, upload/download/exclusão reais e recusa de download anônimo. Confirmar no painel R2 ausência de acesso público. Nenhum dado real foi alterado nesta sessão.

## RENTAL-003 — Comissão de captação parcelada — em implementação

Regra provisória informada pelo dono em 12/09/2026: a comissão de captação equivale a um aluguel do contrato. O proprietário pode pagar esse valor parcelado; a quantidade de parcelas e vencimentos devem ficar registrados, e cada parcela será confirmada manualmente. A implementação deve mostrar total da comissão, parcelas, recebido e saldo. Essa é uma regra operacional a validar com o responsável contábil, não uma presunção jurídica.

Próxima entrega: entidades de comissão/parcela, pagamentos de aluguel e repasse mensal, com acesso ADMIN, histórico, filtros e relatórios. Não misturar comissão de captação com o cálculo do repasse mensal do proprietário. SI9/Imonov, importação e alertas seguem fora do escopo.

## DEPLOY-003 — Revisar e publicar UX-003/UX-004 no ambiente existente
Status: concluída em 13/09/2026
Responsável: Codex
Deploy READY em https://corretor-web-test.vercel.app. Typecheck, lint, 68 testes, builds e SEO smoke aprovados. QA mobile e formulário com fixture local. Catálogo remoto vazio; homologação de detalhe real e fluxos autenticados permanece pendente. Sem commit/push. DEPLOY-002 continua referente ao lançamento comercial, distinto desta atualização do projeto de teste.


## MOBILE-001 — Mobile no painel admin — concluída
Responsável: opencode — concluída em 13/09/2026 (sem commit)

Objetivo:

Estender o padrão mobile do plano `docs/plans/2026-09-13-mobile-public.md` (toques ≥44px, sem scroll-X, sem espremer) ao painel: navegação, cabeçalhos, tabelas, filtros, formulários, mídias e locações.

Critérios de conclusão:

- Links de navegação e de ação do admin com 44px; botões de mídia sem padding de 5px.
- Cabeçalhos empilham em ≤560px com CTA full-width; tabelas com `overscroll-contain`; filtros em 1 coluna.
- Typecheck, lint, testes, build aprovados; conferência manual 320–390px com login pendente.

## URL-001 — Padronizar URLs — concluída
Responsável: Codex. Implementação e publicação no front, contratos da API preservados. Validação e limites registrados em PROJECT_STATUS.md e CHANGELOG_AI.md.

## PROFILE-001 — Perfil do admin, senha e métricas — concluída
Responsável: opencode — concluída em 13/09/2026 (sem commit)
Objetivo: /admin/perfil via avatar (foto grande, dados, métricas por status, edição própria), troca da própria senha no perfil, reset pelo ADMIN com senha escolhida na hora, e-mail só via Corretores.
Critérios: rota + normalizedUrl, avatar-link com dropdown preservado, métricas sem endpoint novo, whitelist no PATCH /auth/me, verificação da senha atual, reset reuse PATCH /agents/:id. Typecheck, lint, 24 arquivos/109 testes, build e seo-smoke aprovados. Conferência no navegador com login pendente.

## API-PT-001 — Documentação do backend integral — concluída em 14/09/2026

Responsável: Codex. Especificação, plano/contexto e handoff sincronizados com Corretor-API. Backend validado com 169 testes locais + 4 integrados em Neon/PostgreSQL 16.15; typecheck/lint/build aprovados. O frontend não recebeu mudanças de código nesta tarefa e suas verificações de UI não foram repetidas por serem alterações documentais.

## API-PT-002 — Adaptar frontend antes da publicação conjunta — concluída (14/09/2026)

Serviços, SSR, catálogo, cadastros, clientes, mídia, contratos, Drive e comissões integrados. Restam somente configuração do Drive, complementos/backup da migração real e publicação coordenada.

Substituir endpoints/payloads em inglês; login token_acesso/cookie corretor_renovacao; seletores dinâmicos de tipos/finalidades/características; clientes manuais; contratos/partes com permissões atualizadas; pastas Drive e estados/retentativa; financeiro exclusivo de comissões, removendo UI antiga de documentos/repasse de aluguel. Manter RHF/zod, cliente API central e SSR. Validar catálogo/detalhe/SEO/login e todo o painel com a API nova antes de publicar. Health da API passa a /api/v1/saude. Referência: docs/handoffs/2026-09-14-backend-portugues.md.


## UI-CONTRASTE-001 — Concluída em 14/09/2026 (Codex)
Corrigir textos invisíveis e botões sem destaque: cascata CSS, tokens claro/escuro, cabeçalho, hero, CTA, login e fallback de fotos. Validações e limites em CHANGELOG_AI.md.


## UI-TEMA-002 — Concluída (14/09/2026, Codex)
Reposicionar alternador após navegação no desktop e junto ao menu mobile; plano aprovado implementado e validado em três larguras e ambos os temas.
