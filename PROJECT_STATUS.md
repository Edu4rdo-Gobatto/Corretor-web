# Estado atual — corretor-web

## 2026-09-16 — Claude: contrato v2 concluído no front (ids inteiros, pessoas, ficha do imóvel, português)

Implementado e validado: typecheck, lint, 37 arquivos/177 testes, build e `seo-smoke` aprovados no front;
na API, typecheck, lint, build, 175 testes e a integração da migration em PostgreSQL 16 aprovados.
Falta conferência no navegador com a API v2 local e E2E autenticado; publicação exige corte coordenado
(front e API juntos) e migração do banco com backup. Sem commit/push.

## 2026-09-16 — Claude: contrato v2 (ids inteiros, pessoas, ficha do imóvel, front em português)

Área assumida: implementação das decisões do dono de 16/09 nos dois repositórios, conforme
`docs/specs/2026-09-16-ids-inteiros-pessoas.md`. Front: tipos e serviços em português sem tradutor,
mídia enviada na criação do imóvel, contatos em três colunas, cadastro único de pessoas, filtros e
ordenação no catálogo, componentes compartilhados do painel. Fora desta rodada: aviso de novo
contato, regras de locação/comissão (tarefas abertas). Em andamento; sem commit/push.

## 2026-09-16 — Claude: diagnóstico de produto (somente leitura)

Área assumida: varredura completa do front e da API com olhar de corretor, sem alteração de código,
dados ou banco. Resultado em `docs/plans/2026-09-16-diagnostico-produto.md`: 7 pontos críticos
(rascunho/publicação, aviso de contato, funil, pessoas em três cadastros, ficha do imóvel, busca,
textos de privacidade), melhorias por área, funcionalidades em P1/P2/P3 e dívidas de manutenção
(Prettier, dois vocabulários, duplicação no painel). Aguarda o dono escolher a ordem para virar
tarefas em `TASKS.md`. Sem commit/push.

## 2026-09-16 — Slugs públicos inválidos retornando 503

Área assumida: correção do 503 causado por URL de imóvel malformada, sem alteração de dados,
API ou banco. O SSR agora valida o slug no formato aceito pela API antes de fazer a consulta;
o cliente também rejeita slugs inválidos como 404. A URL de teste com `OR`, aspas e `released`
passa a ser 404 sem alcançar a API; slugs válidos permanecem inalterados.
Validação inicial: testes direcionados (3 arquivos/50 testes) aprovados. Ainda pendentes as
validações completas e commit/push.

## 2026-09-16 — Correção de achados do relatório de segurança web

Área assumida: hardening do front/SSR, sem alteração de dados, banco, uploads ou CORS.
Corrigidos: headers do proxy que podiam ser sobrescritos pelo upstream; respostas de erro
do proxy sem headers; rewrites externos da Vercel sem headers; e `API_ORIGIN` HTTP aceito
em produção. O token de acesso já estava somente em memória e os achados de dados públicos,
brute force, upload e R2 pertencem à API/infraestrutura, não foram alterados nesta tarefa.
Validação: typecheck, lint, 31 arquivos/150 testes, build, `git diff --check` e `node scripts/seo-smoke.mjs`
aprovados. Sem commit/push; alterações locais anteriores foram preservadas.


## 2026-09-16 — Muse Spark: chip "Todos os imóveis" + scroll dos filtros concluídos (sem commit)

Corrigidos os dois sintomas do dono, só no front (back autorizado, mas não foi preciso):
chip "Todos os imóveis" com texto invisível e filtros rolando a página ao topo.
Causa do chip: `chipBase` + `chipSelected` empilhavam `bg-transparent` vs `bg-navy` e
`text-muted` vs `text-white` no mesmo elemento — no Tailwind vence a ordem do CSS gerado,
não a do atributo, e o resultado era branco sobre branco. Causa do scroll: `ScrollToTop`
fazia `scrollTo(0,0)` em toda troca de pathname, e filtro de tipo troca o pathname.
Validação: typecheck, lint, 30 arquivos/148 testes, build e seo-smoke aprovados.
Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador.

## 2026-09-15 — Headers defensivos no SSR

Aplicados headers de segurança no SSR e no proxy `/api`: `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`. Nenhum registro,
imóvel ou dado de banco foi alterado. CORS do backend permaneceu intacto.

## 2026-09-15 — CSS inicial antes da hidratação

Corrigido o flash de HTML sem estilos no reload das páginas SSR, observado no `/devs`.
O problema era que Tailwind e `global.css` só eram carregados como imports de
`src/main.tsx`, depois que o bundle React começava a executar. Os stylesheets agora
são declarados no `<head>` do `index.html`; o build de produção continua emitindo
um CSS versionado pelo Vite.

Correções finais da revisão: o tema foi protegido contra o replay de efeitos do
React StrictMode e a rejeição de origem não dispara mais `session-expired`.
Validação completa aprovada; publicação Git autorizada pelo dono.

> Backend integral de 14/09/2026: ver registro ao final e `docs/handoffs/2026-09-14-backend-portugues.md`. A UI atual ainda depende do contrato anterior; não publicar a API nova isoladamente.

Atualizado em: 2026-09-13
Agente responsável: opencode (commit e push `5f916cb` em 13/09/2026, a pedido do dono)
Commit da `main`: `5f916cb` — "feat: mobile vitrine no público, menu navegável e admin afinado"
Repositório irmão: corretor-api, `main` em `a41f49b`

## Em andamento

- Estratégia E2E endurecida em 14/09/2026: navegação mobile usa Tab real, persistência do tema verifica a classe `dark` após reload e escritas Playwright bloqueiam destinos externos sem `E2E_ALLOW_EXTERNAL=true`. A execução autenticada ainda exige credenciais e backend de homologação.

- Tailwind v4 migração total concluída no código (13/09/2026, opencode): `tailwindcss` + `@tailwindcss/vite`,
  `src/styles/tailwind.css` com `@theme` navy/gold + `.dark`, zero `.module.css` restantes (público + admin);
   typecheck, lint, 21 arquivos/98 testes, build e seo-smoke aprovados. Commit `4e928e4` na main.
   Pendente conferir no navegador: catálogo, detalhe, admin, dark e mobile 320–390px.
- UX-003 rebrand concluído e commitado em `71d809b` (13/09/2026, Codex): marca Lucas Gobatto CRECI 15776, Juara/MT,
   navy/gold/branco só no front; typecheck, lint, 18 arquivos/62 testes, build e seo-smoke aprovados.
   SVG/PNG oficial do logo pendente.
- Correção do 404 do painel de locações concluída: o serviço Render `Corretor-API` foi atualizado para `4b9377c`; API direta e proxy Vercel agora respondem `401 Unauthorized` nas rotas protegidas, confirmando que as rotas estão publicadas. A migration de locações já estava aplicada no banco de teste.

- Ambiente de desenvolvimento no ar: front SSR em `http://127.0.0.1:5173` e API em `http://localhost:3000`.
- Pesquisa de deploy (Render e Vercel) iniciada pelo Claude; resultado ainda não incorporado às tarefas.

## Concluído recentemente

- **UX-004 melhorias de front sem back (13/09/2026, opencode).** Conversão mobile (CTA fixo, share,
  mapa), galeria (eager/lazy, `aria-live`), LeadFormModal (`inputMode`, foco no erro), cards com
  fallback, skeletons, breadcrumb com classe, características legíveis, semelhantes, `end` no NavLink
   inicial e retoques do admin. Typecheck, lint, 20 arquivos/68 testes, build e seo-smoke aprovados.
   Commit `71d809b` na main.

- **Catálogo e detalhe público refinados (13/09/2026).** Melhorados hero, busca, estados vazios, cartões, card de
  contato, fatos da área, galeria com navegação por teclado e responsividade, sem alterar a API ou o fluxo de leads.
  Typecheck, lint, testes e build aprovados. A conferência manual do SSR exibiu a indisponibilidade esperada porque
  a API local não estava respondendo.

- **Modo demonstração removido por inteiro (12/09/2026).** Saíram `src/services/demo.ts`, `src/services/demo.test.ts`,
  `.env.demo`, a variável `VITE_DEMO_MODE`, os scripts `dev:demo`/`build:demo`/`preview:demo`, o campo `demo` de
  `SeoConfig`, o Proxy de `api.ts` e todos os ramos de interface (botões de login fictício, faixa de aviso no site,
  sufixo no painel, textos alternativos do formulário de contato). Decisão registrada em `DECISIONS.md`.
- **Identidade centralizada em `src/config/brand.ts` (12/09/2026).** Os 13 pontos que repetiam "Corretor Comercial"
  e "Mato Grosso" passaram a ler do `brand`, incluindo logotipo do cabeçalho, `og:site_name`, JSON-LD e `llms.txt`.
  A renderização final não mudou: foi conferida antes e depois.
- **Verificação após as duas mudanças:** 16 arquivos de teste e 57 testes aprovados (eram 17 e 64 — a diferença é o
  `demo.test.ts` removido); lint, typecheck e build sem erro; `scripts/seo-smoke.mjs` aprovado.

- **Sincronização:** a cópia local estava em `78200ff` e foi atualizada para `d4f6b2f`, que trouxe SSR das páginas
  públicas, metadados com Open Graph e Twitter Cards, JSON-LD, `robots.txt`, `sitemap.xml` e `llms.txt` dinâmicos,
  `vercel.json` com Build Output API v3 e as variáveis `API_ORIGIN`, `SITE_URL` e `SEO_INDEXABLE`.
- **Verificação local:** 17 arquivos de teste com 64 testes aprovados; lint, typecheck e build sem erro.
  O build gera `dist/client`, `dist/server` e `.vercel/output` com a função `render`.
- **Smoke do SSR em modo demo:** catálogo, detalhe de imóvel, `robots.txt`, `sitemap.xml`, `llms.txt`, política de
  privacidade e login responderam 200; rotas inexistentes responderam 404; com a indexação desligada, as páginas
  saem com `noindex` e o sitemap vem vazio, como esperado.
- **Homologação com a API, o Neon e o R2 reais:** login pelo proxy `/api` com cookie de refresh, página SSR de um
  imóvel renderizada com JSON-LD `RealEstateListing`, `BreadcrumbList`, canonical e `og:image` apontando para uma
  imagem real no R2, e lead registrado com consentimento.

## Bloqueios

- A API ainda não está publicada, então o front não tem para onde apontar em produção.
- Plano Hobby da Vercel restringe uso comercial; isso precisa ser resolvido antes de publicar um produto vendido a corretores.
- O SSR busca dados públicos da API com timeout de 10 s por requisição. Se a API ficar em um plano gratuito que
  suspende por inatividade, a primeira visita depois de um tempo parado tende a estourar esse limite e a página
  cai para o estado de indisponibilidade.

## Próximo passo

Concluir a pesquisa de publicação e decidir onde o front será hospedado, considerando a restrição comercial do
plano Hobby e o formato de build atual, que é específico da Vercel (Build Output API v3 com função `nodejs24.x`).

## Arquivos modificados recentemente

Removidos: `src/services/demo.ts`, `src/services/demo.test.ts`, `.env.demo`.
Alterados: `src/config/brand.ts` (reescrito), `src/services/api.ts`, `src/seo/server.tsx`, `src/seo/metadata.ts`,
`src/seo/server.test.ts`, `src/seo/navigation.test.tsx`, `src/pages/admin/Login.tsx`, `src/pages/admin/AdminLayout.tsx`,
`src/pages/admin/Admin.module.css`, `src/pages/public/Catalog.tsx`, `src/pages/public/PrivacyPolicy.tsx`,
`src/components/PublicLayout.tsx`, `src/components/PublicLayout.module.css`, `src/components/LeadFormModal.tsx`,
`src/components/LeadFormModal.module.css`, `scripts/dev.mjs`, `scripts/build.mjs`, `scripts/preview.mjs`,
`scripts/seo-smoke.mjs`, `package.json`, `.env.example`, `DECISIONS.md`, `TASKS.md`, `PROJECT_STATUS.md`, `CHANGELOG_AI.md`.

## Ambiente local

`.env` (não versionado) com `VITE_API_URL=/api`, `API_ORIGIN=http://localhost:3000`,
`SITE_URL=http://127.0.0.1:5173` e `SEO_INDEXABLE=false`. A linha `VITE_DEMO_MODE` foi retirada em 12/09. A `SITE_URL` local foi definida nesta sessão porque
sem ela o SSR não gera canonical nem JSON-LD.

## 2026-09-12 — Codex: administração de locações em implementação

Área assumida: cadastros, contratos e documentos privados (ADMIN). Escopo aprovado em docs/plans/2026-09-12-rental-administration.md. Comissão e financeiro aguardam etapa própria. Alterações preexistentes preservadas; sem commit/push e sem mudança automática do banco real.

Implementação local concluída e pronta para revisão. Front: rotas de proprietários, inquilinos e contratos, fichas, busca/paginação, seletores de imóvel/partes, anexos privados e download autenticado. API: módulo `rentals`, migration aditiva, criptografia de dados privados, validação de arquivos e regras de vínculo. Comissão de captação iniciada: valor equivalente a um aluguel, parcelas configuráveis e confirmação manual ADMIN. Migration do Neon e bucket R2 privado ainda não foram aplicados/configurados. SI9/Imonov permanece fora do escopo.

### Ambiente de teste (2026-09-13)
- Bucket privado R2 criado: \corretor-documentos-test\.
- Deploy Vercel e branch Neon pendentes de reconexão das sessões locais (CLI sem autenticação válida).

- Vercel conectado e primeiro deploy publicado: https://corretor-web-test.vercel.app
- Neon conectado; projeto de teste \
oyal-haze-18985318\ (corretor-db-test), migrations aplicadas.

## 2026-09-13 — Codex: revisão e deploy do front
Área assumida: revisão de UX-003/UX-004, validação e atualização do projeto Vercel corretor-web-test, conforme pedido do dono. Em andamento; alterações preexistentes preservadas.


### Revisão/deploy finalizados — 13/09/2026
Codex concluiu UX-003/UX-004 no ambiente https://corretor-web-test.vercel.app (dpl_8ZTk6bsKwV8xnqye5nUDo6EdcRV4, READY). Typecheck, lint, 68 testes, builds local/remoto e SEO smoke aprovados. Catálogo vazio na API remota; detalhe/modal/CTA conferidos com fixture local. Sem commit/push. Logo oficial, dados de privacidade, homologação autenticada e lançamento comercial continuam pendentes. Este registro substitui o estado em andamento desta revisão e corrige os bloqueios históricos de infraestrutura para o ambiente de teste.


## 2026-09-13 — Codex: URLs em português
Área assumida: rotas do front, compatibilidade e SEO; implementação do plano aprovado em andamento. API sem mudanças de contrato.


## 2026-09-13 — Codex: URLs em português concluídas
Rotas públicas: /imoveis/{tipo}, /imoveis/para-alugar, /imoveis/para-comprar e combinações; query cidade/preco-minimo/preco-maximo/pagina. Painel: /admin/entrar e /admin/contatos. URLs antigas redirecionam 301; navegador usa replace; slugs e APIs preservados.
Publicação Vercel dpl_Bbf5617bGJdqKv79WJbuDDFJaP1M READY, alias https://corretor-web-test.vercel.app. SITE_URL e SEO_INDEXABLE configuradas em Production conforme autorização. Robots, llms e sitemap respondem 200; raiz index,follow; filtros noindex,follow; painel noindex,nofollow. Sitemap contém início e privacidade (catálogo público sem imóveis no momento).
Validação: typecheck, lint, build, suíte de 93 testes e teste adicional de navegação aprovado (94 no total coberto); smoke SSR/proxy/discovery aprovado. Navegador: redirecionamento, paginação e detalhe com fixture local; catálogo filtrado publicado confirmado. Login autenticado/logout e fichas reais não exercitados no navegador nesta sessão; permissões existentes cobertas pela suíte. Sem commit/push.


## 2026-09-13 — Preparação de commit e push autorizada
Codex: revisão do diff concluída; typecheck, lint, 21 arquivos/94 testes, build e smoke de SEO aprovados novamente. Front: código e documentação das URLs; API: somente documentação correspondente. Alterações anteriores da API em .env.example e .gitignore excluídas do commit.


## 2026-09-13 — Codex: investigação de upload de mídia
Logs do Render para o POST de mídia registram `write EPROTO ... SSL alert handshake failure` no processo da API. O proxy SSR repassa o multipart corretamente (`request.pipe(upstream)`), e o erro ocorre no salto API → R2 antes de salvar metadados. Hipótese confirmada como configuração/endpoint TLS do R2 no ambiente Render; não há evidência de bug no formulário ou no proxy. Pendente corrigir `R2_ENDPOINT` no serviço Render para o endpoint S3 HTTPS da conta Cloudflare (sem bucket no caminho), então repetir upload.
Área assumida: erro HTTP 500 ao enviar mídia no ambiente corretor-web-test; rastrear proxy, API e R2. Em andamento (opencode, 13/09/2026, 15h42: token corrigido — saiu `AccessDenied`, agora `NoSuchBucket` no `PutObject` do bucket hardcoded `corretor-midia` em `media.service.ts:48`; falta criar o bucket de mídia na conta de teste).


## 2026-09-13 — opencode: hambúrguer só no mobile (commit `2d0d8ac`)
Área assumida: botão hambúrguer aparecendo no desktop junto da navegação. Causa no `PublicLayout.module.css`: `.menuToggle{display:none}` empatava com `.buttonGhost{display:inline-flex}` do global. Fix com `button.menuToggle` (maior especificidade) no desktop e no `@media(max-width:650px)`. Typecheck, lint e 21 arquivos/98 testes aprovados. Commit `2d0d8ac` na main. Pendente conferir no navegador: desktop >650px sem botão, mobile ≤650px com botão.

## 2026-09-13 — opencode: mobile público com direção vitrine (plano commitado em `5f916cb`)

Área assumida: `docs/plans/2026-09-13-mobile-public.md` — tese ponto comercial Juara/MT, tokens navy/gold existentes, assinatura soleira dourada + placa de rua, wireframes 360px, P0/P1 com visual + P2 microcopy, validação 320–390px sem scroll-X e toques ≥44px. Plano e implementação commitados em `5f916cb`.

## 2026-09-13 — opencode: menu mobile não abria (corrigido, commit `5f916cb`)
Causa: `max-[650px]:hidden` + `max-[650px]:flex` aplicados juntos no `<nav>` — no CSS gerado o `hidden` vence o `flex`, então o menu nunca aparecia. Fix: classes mutuamente exclusivas + teste de regressão das classes. Conferido em 390px com dados reais: sheet navy abre com as 4 opções + CRECI. Typecheck, lint e testes do menu/navegação aprovados. Commit `5f916cb` na main.

## 2026-09-13 — opencode: mobile do admin (implementado, commit `5f916cb`)
Área assumida: mesmo padrão do público, agora no painel (`AdminLayout`, login, dashboard, listas, formulário, mídias, locações); sem `any`/dependência nova. Typecheck, lint, 21 arquivos/98 testes e build aprovados. Commit `5f916cb` na main. Pendente conferir no navegador 320–390px com login: navegação lateral, cabeçalhos, tabelas, filtros, formulário, mídias e fichas de locação.

## 2026-09-13 — opencode: mobile público vitrine (implementado, commit `5f916cb`)
Área assumida: `docs/plans/2026-09-13-mobile-public.md` — só público (header, catálogo, detalhe, galeria, busca, modal lead); admin fora. Base atual usa Tailwind (sem `.module.css`), então o plano foi aplicado como utilities, sem `any`/`fetch` direto/dependência nova. Typecheck, lint, 21 arquivos/98 testes, build e seo-smoke aprovados. Commit `5f916cb` na main. Pendente conferir no navegador 320–390px: menu, hero sem scroll-X, busca 1 coluna, CTA sticky navy único, galeria com snap, modal lead e toques ≥44px.

## 2026-09-13 — opencode: header do admin afinado no mobile (commit `5f916cb`)
Área assumida: `AdminLayout` — topo navy ocupava altura demais no mobile (print do dono).
Fix só com utilities: `aside` com `py-2.5/gap-2`, marca `16px/leading-tight`, nav sem `pb`
e links `min-h-10/text-14`, linha do usuário sem `mt-auto` no mobile e botão sair `min-h-9`.
Desktop (`lg:`) preservado. Typecheck, lint e teste do AdminLayout aprovados.
Commit `5f916cb` na main. Pendente conferir no navegador 320–390px.

## 2026-09-13 — opencode: avatar do usuário + modo noturno visível (implementado, sem commit)

Área assumida: a pedido do dono — avatar não aparecia e o modo noturno não tinha onde ser ligado.
`AdminLayout` exibe `avatarUrl` (fallback inicial); desktop mantém o bloco no rodapé do `aside`,
mobile mostra a foto no topo com dropdown (nome, papel, "Sair da conta", fecha em Escape/clique
fora). `useTheme` novo persiste `localStorage "theme"`, respeita `prefers-color-scheme` e aplica
`.dark`; alternador no header público e no painel + script anti-flash no `index.html`.
Typecheck, lint, 22 arquivos/104 testes e build aprovados. Sem commit/push (aguardando confirmação
do dono). Pendente conferir no navegador: dropdown 320–390px com login, dark no público e no admin.

## 2026-09-13 — opencode: perfil do admin + senha (implementado, sem commit)

Área assumida e concluída: `/admin/perfil` (foto grande, dados, métricas por status, edição própria),
troca da própria senha, reset de senha pelo ADMIN e filtro `status` no gerenciado da API.
Escopo autorizado pelo dono em 13/09/2026, incluindo back (repositório irmão).
E-mail só via Corretores/ADMIN, nunca no perfil.
Typecheck, lint, 24 arquivos/109 testes, build e seo-smoke aprovados.
Commit `31ee9bc` na main (inclui o trabalho pendente de avatar + modo noturno, `useTheme` e ajustes do
`PublicLayout`/`AdminLayout`, que estavam sem commit). Push `3f9f53f..31ee9bc main -> main`.
Pendente conferir no navegador com login: perfil 320–390px e desktop, avatar quebrado, edição,
troca de senha invalidando a antiga e reset pelo ADMIN.

## 2026-09-13 — opencode: capa no catálogo + decode no upload (commit `376219d`)
Área assumida: capa some no catálogo embora apareça no detalhe, mais o erro inglês "The source image could not be decoded." no formulário. Causa da capa na API (`PropertiesService.list()` sem `media`; corrigido no repositório irmão). Front: `prepareMediaFiles` agora pula arquivo ilegível com aviso em PT e mantém os válidos no lote; `MediaManager` exibe quais foram pulados e só envia quando há algo válido. Typecheck, lint, 21 arquivos/98 testes, build e seo-smoke aprovados. Commit `376219d` na main. Pendente conferir com a API no ar: catálogo com capa, upload misto (válido + corrompido) e redeploy da API no Render.


## 2026-09-13 — Codex: contrato da nova API em acompanhamento
Refatoração integral autorizada no repositório irmão; documentação compartilhada sob responsabilidade do Codex principal. Novo contrato português exige adaptação futura do front antes da publicação conjunta; esta tarefa implementa backend. Alteração preexistente .vscode/ preservada.

## 2026-09-14 — opencode: hamburger fora do desktop (commit `6c99b3c`)
Área assumida: a pedido do dono — botão hamburger aparecia no desktop. Causa: `buttonGhost` do `global.css` empatava com o `hidden` do Tailwind. Fix: botão só com utilities (`hidden` + `max-[650px]:inline-flex`). Typecheck, lint, 24 arquivos/109 testes aprovados. Commit `6c99b3c` na main. Pendente conferir no navegador >650px e ≤650px.

## 2026-09-14 — Codex: documentação do backend integral concluída

Sincronizados corretor-spec.json (histórico preservado), plano de projeto, AGENTS, decisões, tarefas e handoff docs/handoffs/2026-09-14-backend-portugues.md. API nova validada: typecheck/lint/build, 169 testes locais e 4 PostgreSQL/HTTP reais aprovados. Nenhum código frontend alterado, nenhum deploy/commit/push; pasta .vscode/ preexistente preservada.

A aplicação atual continua usando o contrato antigo. Próximo passo é API-PT-002: adaptar serviços, autenticação, classificações, clientes, contratos/Drive e financeiro/SSR antes da publicação conjunta. Homologação real de Drive/R2 e corte do banco ainda pendentes. Nenhum teste de UI executado por esta entrega documental.

## 14/09/2026 — frontend do modelo português em execução
Codex concluiu API-PT-002: painel, serviços, SSR, classificações dinâmicas, mídia, clientes, contratos e comissões integrados ao contrato português. Drive externo será configurado pelo dono. Plano: docs/plans/2026-09-14-frontend-portugues.md. Typecheck, lint, build e smoke SSR passaram; suíte completa teve 120 testes passando e dois erros transitórios de worker/jsdom no Windows na última execução.


## 2026-09-14 — Codex: contraste em execução
Área assumida: estilos compartilhados, textos e botões nos temas claro/escuro. Sem alteração de contrato ou publicação.


## 2026-09-14 — Codex: contraste concluído
Corrigida a cascata entre estilos globais e Tailwind, com tokens de ação para botões, textos adaptáveis ao tema e contraste em superfícies navy e cartões sem foto. Margens do container preservadas. Typecheck, lint, 125 testes, build e smoke SSR/Vercel aprovados. Catálogo/login/detalhe conferidos nos dois temas; mobile 390px sem overflow. Painel autenticado pendente de conferência visual; estilos compartilhados aplicados. Sem commit/deploy.

## 2026-09-14 — Codex: posição do alternador em execução
Cabeçalho público: agrupar navegação e tema à direita, preservando menu mobile e correções de contraste.


## 2026-09-14 — Codex: alternador público reposicionado
Concluído: navegação e tema agrupados à direita; 16px após Área do corretor no desktop, 8px entre tema/menu mobile. Cabeçalho compacto em telas intermediárias. Typecheck, lint e 125 testes aprovados. Navegador: 390/768/1280px nos dois temas, sem overflow; botão 44x44, menu/Escape e alternância por teclado confirmados. Sem commit/deploy.


## 2026-09-14 — Codex: publicação Git autorizada
Dono solicitou commit e push das correções de contraste e cabeçalho na main. Revisão preserva texto navy no CTA dourado do detalhe (PropertyDetail sem diff final) e corrige formatação histórica em DECISIONS. .vscode fora do commit. Validação final aprovada: typecheck, lint, 27 arquivos/125 testes e build; diff --check limpo. Commit/push autorizados na main; sem deploy manual.

## 2026-09-14 — Codex: estratégia de testes E2E em execução
Área assumida: Playwright Test no front + lacunas Vitest (contrato PT, sessão, comissões). Base: 27 arquivos/125 testes Vitest; API 26 suítes/169 + 4 integração homologacao_pt. Decisões do dono: HTTPS local autoassinado (cookie Secure), banco homologacao_pt existente, Playwright só em corretor-web. Sem commit/push/deploy sem autorização; .vscode/ preservada; sem dados reais.

## 2026-09-14 — Codex: estratégia de testes E2E concluída (sem commit)
Infra (`playwright.config.ts`, `tests/e2e/` com 11 specs, README, scripts `test:e2e*`) + Vitest (28 arquivos/136 testes). Validação: typecheck, lint, build, seo-smoke (portas alternativas) e Playwright 2x — 19 aprovados, 17 não executados (sem E2E_ADMIN_*/E2E_CORRETOR_*), 0 falhas. Servidores da sessão parados; estado de chegada restaurado. Bloqueio exato: credenciais de teste + confirmação do banco da API para os fluxos autenticados; HTTPS local para sessão pós-reload; homologação real do Drive. Detalhes em CHANGELOG_AI.md e DECISIONS.md. Sem commit/push/deploy.

## 2026-09-15 — Codex: rigor do E2E após revisão do dono (sem commit)
Corrigidos os 6 pontos: falso positivo do `http.test.ts`, SSR comprovado no HTML bruto + sem JS, imagem com carga real + persistência via API, tema comparado após reload + teclado só Tab/Enter, TLS autoassinado no fetch Node, trava anti-produção + `E2E_STACK=teste` + limpeza completa com status. Achado: `.env` local aponta à API de produção (só leituras atingiram produção; nenhuma escrita). Suíte: 37 testes/11 arquivos — 15 aprovados, 22 não executados (stack de teste + credenciais pendentes), 0 falhas. Servidores parados. Sem commit/push/deploy.

## 2026-09-15 — Codex: limpeza parcial + allowlist (sem commit)
Seed movido para dentro do `try` com IDs opcionais (comissão, contrato, lead, mídia, CRUD, catálogo): falha no meio do seed limpa o parcial, sem dado abandonado. Bypass `E2E_ALLOW_REMOTE`/`E2E_ALLOW_EXTERNAL` removido e unificado em `E2E_DOMINIOS_PERMITIDOS` (config importa a trava de `helpers/env`): remoto não listado aborta no carregamento (comprovado), domínio listado carrega. Validação: typecheck, lint, Vitest 136, Playwright 15/22/0. Preview parado. Sem commit.

## 2026-09-15 — Muse Spark: página /devs em execução
Área assumida: rota pública `/devs` com Eduardo Gobatto (@e.gobatto) e Fernando Riad (@_riad777), fotos dos avatares GitHub, links Instagram em nova aba, papel "Front-end e back-end" para os dois. Escopo: `src/config/devs.ts` + `src/pages/public/Devs.tsx`, rota cliente + SSR + metadados + sitemap + `llms.txt`, link só no rodapé, indexável. Sem commit/push sem confirmação do dono.

## 2026-09-15 — Muse Spark: página /devs concluída (sem commit)
Implementado e validado: typecheck, lint, 29 arquivos/139 testes, build e seo-smoke aprovados. Bundle SSR contém `/devs` (rota, título, sitemap, llms). Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador: `/devs` mobile/desktop nos dois temas + cliques nos Instagrams.

## 2026-09-15 — Muse Spark: header público fixo concluído (sem commit)
Link "Desenvolvedores" já existia no rodapé (confirmado no HTML servido); adicionada cobertura de teste para ele. Header do site público agora `sticky top-0 z-40`, sempre visível, só CSS, sem JS; painel admin inalterado. Validado: typecheck, lint, 29 arquivos/140 testes, build; preview em `127.0.0.1:4173` servindo o HTML com o header fixo. Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador com rolagem: menu mobile, CTA do detalhe e ambos os temas.

## 2026-09-15 — Muse Spark: commit e push `14aa53a` (página /devs + header fixo)
Commit e push direto na `main` a pedido do dono: 15 arquivos (`/devs` completa + header sticky + cobertura + `seo-smoke` + contexto). Push `15b6071..14aa53a main -> main`, `.vscode/` fora do commit. Pendente conferir no navegador com rolagem: `/devs`, menu mobile, CTA do detalhe, ambos os temas.

## 2026-09-15 — Muse Spark: refinamentos do /devs + header concluídos (sem commit)
Pacote 1–5 aplicado e validado: avatares locais em `public/assets`, links GitHub nos cards, `h1` com `clamp(32px,8vw,44px)`, logo/controles com `z-[6]` acima do backdrop e `container` + `div` interno `max-w-[800px]`. Typecheck, lint, 29 arquivos/141 testes, build e seo-smoke aprovados; `/devs` 200 conferido no HTML servido (avatares locais, GitHub, sem hotlink, sticky, clamp, imagem 200). Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador `/devs` 320–390px e desktop nos dois temas.

## 2026-09-15 — Muse Spark: privacidade + 403 do renovar concluídos (sem commit)
`/privacidade` com `container` + `div` interno `max-w-[800px]` e `h1` com clamp (mesmo padrão do `/devs`, pendência anterior eliminada). 403 do renovar diagnosticado: preview contra a API de produção + origem fora do `ALLOWED_ORIGINS` (`OrigemGuard`, comprovado via proxy); front agora relata a causa com verdade em vez de "sessão expirou" (limpeza mantida). Typecheck, lint, 29 arquivos/142 testes, build e seo-smoke aprovados; `/privacidade` 200 conferido no HTML servido. Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador `/privacidade` 320–390px e desktop nos dois temas; sessão no preview contra produção segue 403 por desenho.

## 2026-09-15 — Muse Spark: 404 de assets no preview diagnosticado e resolvido
Sintoma do dono: `GET /assets/index-DI-c97Mf.js 404` (+ css) na porta 4173, "dev não acha nada". Causa: preview antigo órfão (PID 85268, de sessão anterior de agente) servindo `index.html` antigo da memória com hashes de build anterior; cada `npm run build` apaga os hashes antigos do `dist`, daí o 404. O `dev` escuta na 5173 — aba presa na 4173 nunca veria o dev. Correção: processo antigo morto; preview novo na 4173 (`/` 200, js/css atuais 200) e `dev` na 5173 (`/` 200 com `<h1>`) conferidos e parados. Ação do dono: hard refresh (Ctrl+Shift+R) na aba da 4173 e usar a porta certa (dev 5173, preview 4173).

## 2026-09-15 — Muse Spark: hidratação do tema corrigida (sem commit)
Área assumida: `Hydration failed` + `Expected server HTML to contain a matching <circle> in <svg>` no `dev` (porta 5173). Causa no `useTheme`: o SSR sempre renderiza `light` (sem `window`), mas o primeiro render do cliente lia `localStorage`/`prefers-color-scheme` no `useState` e pintava `Sun` (com `<circle>`) contra a `Moon` do servidor — mesma divergência no `aria-label`. O React descartava o HTML do SSR e caía para renderização só no cliente. Fix: estado inicial sempre `light` (igual ao servidor), preferência salva aplicada em efeito único que não remove a classe `.dark` do script anti-flash no primeiro mount; persistência e `localStorage "theme"` + `.dark` inalterados. Teste de regressão em `useTheme.test.ts` (primeiro render `light` com `dark` salvo). Validado: typecheck, lint, 29 arquivos/143 testes, build e seo-smoke aprovados. Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador com `theme=dark` salvo: sem erro de hidratação no console, ícone Sol após carregar, alternância e persistência nos dois temas.
## 2026-09-15 — Documentação, SEO comercial e guarda de ambiente

Implementada a correção documental do README/AGENTS: scripts e variáveis refletem o runtime atual, com endereços
127.0.0.1 e sem modo demonstração. `/devs` permanece acessível, mas sempre usa `noindex,follow` e foi removido de
`sitemap.xml` e `llms.txt`. `dev` e `preview` agora recusam `API_ORIGIN` remoto por padrão por meio de
`scripts/safe-origin.mjs`, sem imprimir credenciais. UX-001 cold start foi marcada como adiada pelo proprietário.

Pendente nesta entrega: a remoção completa de `.buttonGhost` não foi feita porque ainda existem consumidores no
painel administrativo; a migração deve ser uma tarefa visual isolada para evitar regressões.
## 2026-09-16 — Codex: retomada do pacote completo

Área assumida nesta retomada: Codex integra catálogo/rodapé/SEO e documentação; agentes independentes
atuam em Dashboard, contatos/CSV, detalhe/lead e duplicação/guarda de navegação. Estado inicial: alterações
parciais da execução anterior preservadas; main. Sem escrita em banco nem publicação. Validação final em andamento.

## 2026-09-16 — Codex: pacote de melhorias públicas e painel em execução

Implementadas melhorias de formatação de preço, total mensal de locação, preço/m², selos de status,
relacionados por finalidade/cidade com fallback, mapa embed lazy, máscara/honeypot de leads, OG dimensions,
filtros de período/ imóvel e CSV de contatos, KPIs administrativos baseados nos endpoints existentes e
dirty guard do formulário de imóvel. Ordenação de catálogo, logo oficial, dados reais de privacidade, datalist
e duplicação completa ainda dependem de ajustes/insumos pendentes.

Validação desta etapa: typecheck aprovado; lint aprovado após correção; Vitest 31 arquivos/155 testes aprovado;
build aprovado; seo-smoke aprovado. Ainda pendente conferência manual e validação E2E autenticada com stack/credenciais.


## 2026-09-16 — Codex: pacote público/painel concluído em código

Concluídos os pendentes da execução anterior: datalist, rodapé configurável, duplicação/preview, guarda SPA/histórico,
mensagem expansível e 404. Corrigidos KPIs paginados, CSV seguro, datas inclusivas, dimensões OG de imagens desconhecidas,
telefone internacional e detalhes visuais nos dois temas. Plano/checklist: docs/plans/2026-09-16-melhorias-publico-painel.md.
Dados reais de marca/privacidade e contato recebidos do proprietário e registrados em `src/config/brand.ts`; logo oficial copiado para `public/assets/brand-logo.jpg`.
Homologação autenticada real aguarda stack/credenciais de teste. Nenhuma alteração de backend ou de dados reais.
## 2026-09-17 — Regressão de XSS no JSON-LD coberta

Confirmada a proteção existente em `src/seo/metadata.ts`: `serialize()` escapa caracteres de controle do contexto HTML antes de renderizar o JSON-LD. Adicionado teste com `<svg/onload>`, `<script>` e `</script><script>` verificando parse válido, preservação do texto e impossibilidade de fechar a tag SSR. Meta tags continuam cobertas por `escapeHtml()`.

Validação desta tarefa: teste direcionado aprovado; validação completa registrada no `CHANGELOG_AI.md`. Sem alteração de dados, API, banco, migrations, uploads ou rate limiting.
