# Histórico de trabalho dos agentes — corretor-web

Registro objetivo, do mais recente para o mais antigo. Cada entrada traz tarefa, alterações,
testes com resultado real e pendências.

## 2026-09-12 — Claude (ambiente de desenvolvimento e limpeza de dados fixos)

Tarefa: subir o ambiente de desenvolvimento e remover dados fixos do código, a pedido do dono do projeto.

Alterações em código:

- **Modo demonstração removido por inteiro.** Apagados `src/services/demo.ts` (11 imóveis, 2 corretores e 4 leads
  fictícios, com fotos do Unsplash), `src/services/demo.test.ts` e `.env.demo`. Retirados: a variável
  `VITE_DEMO_MODE` (do `.env`, do `.env.example` e do `scripts/seo-smoke.mjs`), os scripts `dev:demo`, `build:demo`
  e `preview:demo` do `package.json`, o argumento `--demo` dos três scripts de runtime, o campo `demo` de `SeoConfig`
  e do bootstrap do SSR, o `isDemo` de `brand.ts`, o Proxy de `api.ts` (virou `export const api = realApi`), os botões
  de entrada fictícia em `Login.tsx`, a faixa de aviso em `PublicLayout.tsx`, o sufixo "Demonstração" em
  `AdminLayout.tsx`, os três ramos condicionais de `LeadFormModal.tsx` e as classes CSS `.demo` e `.demoNote`.
- **Identidade centralizada em `src/config/brand.ts`**, agora com `name`, `logo`, `tagline`, `closing`, `region` e
  `privacy`. Os 13 pontos que repetiam "Corretor Comercial" e "Mato Grosso" passaram a ler dali: títulos e descrições
  de `metadata.ts`, `og:site_name`, JSON-LD `Organization` e `WebSite`, o `llms.txt` de `server.tsx`, o logotipo do
  cabeçalho e o hero do catálogo.

Testes executados:

- `npm run typecheck`: sem erro.
- `npm run lint`: sem erro.
- `npm test`: 16 arquivos, 57 testes aprovados. Antes eram 17 arquivos e 64 testes; a diferença é o `demo.test.ts`
  removido (7 testes que só exercitavam o módulo de demonstração).
- `npm run build`: sem erro; gerou `dist/client`, `dist/server` e `.vercel/output`.
- `node scripts/seo-smoke.mjs`: aprovado (SSR, metadados, paginação, 404, discovery e proxy de API com cookies,
  mais a função da Vercel em runtime Node isolado).
- Conferência manual com a API real no ar: `/` 200 com título, `og:site_name` e `<h1>` idênticos aos de antes do
  refactor; `/admin/login` 200; `/privacidade` 200; `/api/properties` 200 pelo proxy; `/llms.txt` com o nome do
  `brand`; rota inexistente 404; faixa de demonstração ausente do HTML.

Achados:

- `src/seo/fixture.ts` mantém dados de exemplo ("Rua de demonstração", Cuiabá/MT). Foi mantido de propósito: é
  fixture de teste, usada por `server.test.ts` e `navigation.test.tsx`, e não entra no bundle do produto.
- `brand.privacy` continua com `controller`, `contactEmail` e `address` vazios. A página `/privacidade` mostra o
  aviso de conteúdo preparatório enquanto for assim — é o comportamento correto, mas bloqueia a publicação.

Pendências:

- Preencher `brand.privacy` e decidir o nome real do negócio (hoje "Corretor Comercial", um rótulo de andaime).
- DEPLOY-002 e SEO-001 seguem bloqueadas pela publicação da API.

## 2026-09-11 — Claude (sincronização e homologação)

Tarefa: SYNC-001 — sincronizar a entrega de SEO/SSR, validar localmente e homologar contra a API real.

Alterações em código: nenhuma. Alterações em arquivos versionados: criação da camada de contexto
(`AGENTS.md`, `CLAUDE.md`, `PROJECT_STATUS.md`, `DECISIONS.md`, `TASKS.md`, `CHANGELOG_AI.md`, `docs/handoffs/`).

Ações:

- `git pull --ff-only` de `78200ff` para `d4f6b2f` (entrega de SEO e SSR).
- `.env` local criado a partir do `.env.example` e, depois, `SITE_URL=http://127.0.0.1:5173` definida.

Testes executados:

- `npm ci`: ok, 0 vulnerabilidades.
- `npm test`: 17 arquivos, 64 testes aprovados.
- `npm run lint`, `npm run typecheck`, `npm run build`: sem erro. O build gerou `dist/client`, `dist/server` e
  `.vercel/output` com a função `render`.
- Smoke do SSR em modo demo (`npm run dev:demo`): catálogo, detalhe de imóvel, `robots.txt`, `sitemap.xml`,
  `llms.txt`, privacidade e login com 200; rotas inexistentes com 404; `noindex` e sitemap vazio, como esperado
  com a indexação desligada.
- Homologação com a API, o Neon e o R2 reais (`npm run dev`): login pelo proxy `/api` com cookie de refresh;
  página SSR do imóvel com título, JSON-LD `RealEstateListing` e `BreadcrumbList`, canonical e `og:image`
  apontando para imagem real no R2; lead registrado com consentimento.

Achados:

- Sem `SITE_URL`, o SSR não gera canonical nem JSON-LD. Não há erro visível: a página simplesmente sai sem os dados
  estruturados. Foi o que motivou a decisão de manter `SITE_URL` preenchida também em desenvolvimento.
- O runtime de proxy copia o header `Origin` do navegador, então a API precisa ter a origem do front em
  `ALLOWED_ORIGINS`, senão login, refresh e logout respondem 403.
- Com a API fora do ar, `/api/*` responde 503 e as páginas públicas caem para o estado de indisponibilidade.

Pendências:

- DEPLOY-002 e SEO-001 dependem da publicação da API.
- UX-001: decidir o que fazer com o cold start diante do timeout de 10 s do SSR.
- DOC-002: README desatualizado.

## Registros anteriores

O trabalho anterior a 11/09/2026 está nos commits do Git, no `PLANO-PROJETO-CORRETOR.md` e no `AUDITORIA-FRONTEND.md`.
Não havia registro por agente antes desta data.
