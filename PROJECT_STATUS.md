# Estado atual — corretor-web

Atualizado em: 2026-09-13
Agente responsável: opencode (commit e push `5f916cb` em 13/09/2026, a pedido do dono)
Commit da `main`: `5f916cb` — "feat: mobile vitrine no público, menu navegável e admin afinado"
Repositório irmão: corretor-api, `main` em `a41f49b`

## Em andamento

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

## 2026-09-13 — opencode: capa no catálogo + decode no upload (commit `376219d`)
Área assumida: capa some no catálogo embora apareça no detalhe, mais o erro inglês "The source image could not be decoded." no formulário. Causa da capa na API (`PropertiesService.list()` sem `media`; corrigido no repositório irmão). Front: `prepareMediaFiles` agora pula arquivo ilegível com aviso em PT e mantém os válidos no lote; `MediaManager` exibe quais foram pulados e só envia quando há algo válido. Typecheck, lint, 21 arquivos/98 testes, build e seo-smoke aprovados. Commit `376219d` na main. Pendente conferir com a API no ar: catálogo com capa, upload misto (válido + corrompido) e redeploy da API no Render.

