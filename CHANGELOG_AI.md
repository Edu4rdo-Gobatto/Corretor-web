# Histórico de trabalho dos agentes — corretor-web

## 2026-09-13 — opencode — Tailwind v4 migração total (público + admin, com dark)

Tarefa: adotar o Tailwind no sistema (migração total, tudo junto, com dark preparado).

Alterações em código (front apenas):

- Infra: `tailwindcss` + `@tailwindcss/vite` em devDependencies; plugin no `vite.config.ts`;
  novo `src/styles/tailwind.css` (`@theme` navy/gold/paper/ink/muted/line/soft/error, `font-display/sans`,
  radius, `animate-shimmer`, `@custom-variant dark` + `.dark`); importado em `src/main.tsx` antes do `global.css`.
- Migrados para utilities (imports de `.module.css` removidos e arquivos excluídos): `Shared` (AsyncState,
  Pagination, Dialog), `PropertyCard`, `PublicLayout`, `MediaGallery`, `LeadFormModal`, `PrivacyPolicy`,
  `MediaManager`, `Catalog`, `PropertyDetail` e o painel admin (`AdminLayout`, `Dashboard`, `PropertyList`,
  `PropertyForm`, `LeadsList`, `AgentsList`, `Login`, `Rentals` + `Admin.module.css`).
- Ajustes de teste/SRR: `src/seo/server.test.ts` e `scripts/seo-smoke.mjs` passam a casar `<h1[^>]*>`
  (o h1 agora carrega classes Tailwind); conteúdo e escaping preservados.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`); bundle CSS `index-*.css` com 47,2 KB.
- `node scripts/seo-smoke.mjs`: aprovado (SSR, metadados, paginação, 404, discovery, proxy e função Vercel).

Pendências: conferir no navegador catálogo, detalhe, `robots`/`sitemap`/rota inexistente, fluxos do admin,
modo `.dark`, mobile 320–390px sem scroll-X e toques ≥44px. Sem commit/push (aguardando confirmação do dono).

## 2026-09-13 — opencode — Hambúrguer só no mobile

Tarefa: esconder o botão hambúrguer no desktop, mantendo-o só no mobile (≤650px).

Alterações em código (front apenas):

- `src/components/PublicLayout.module.css`: `.menuToggle` → `button.menuToggle` no desktop
  e no `@media(max-width:650px)`. Motivo: `.buttonGhost` do `global.css` tem a mesma
  especificidade com `display:inline-flex` e vencia/empatava conforme a ordem do bundle,
  deixando o botão visível no desktop junto da navegação.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados (ruído `render failed` do teste de boundary
  é esperado, como nas sessões anteriores).

Pendências: conferir no navegador desktop (>650px, sem botão) e mobile (≤650px, com botão).
Sem commit/push (aguardando confirmação do dono).

## 2026-09-13 — opencode — UX-004 melhorias de front sem back

Tarefa: aplicar as fatias P0–P3 do plano de melhorias (conversão mobile, galeria, lead, cards,
skeletons, a11y, admin) sem nenhuma mudança no back: sem rota, DTO, migration ou contrato novo.

Alterações em código (front apenas):

- `src/pages/public/PropertyDetail.tsx` (+ `.module.css`): ações Compartilhar (Web Share com
  fallback clipboard, SSR-safe) e Ver no mapa (Google Maps por query); barra de CTA fixa no
  mobile com `safe-area`; breadcrumb com classe (sem `style` inline); características via
  `featureLabel`/`featureValue`; seção "Você também pode gostar" com `api.listProperties`
  existente (client-side, sem back novo).
- `src/services/format.ts` (+ `format.test.ts`): `featureLabel`/`featureValue` sem `any`
  (boolean→Sim/Não, listas/objetos sem `JSON.stringify` cru).
- `src/components/MediaGallery.tsx`: primeira mídia `eager` + `fetchpriority`, demais `lazy`;
  `decoding="async"`; contador com `aria-live`; `aria-current` nos thumbnails; lightbox só
  para imagem.
- `src/components/PropertyCard.tsx`: fallback "Foto em breve" em vez de `display:none`;
  `loading="lazy" decoding="async"`.
- `src/components/AsyncState.tsx` (+ `AsyncState.test.tsx`, `Shared.module.css`): variante
  skeleton `cards`/`detail` com shimmer (respeita `prefers-reduced-motion` global); usada no
  catálogo e no detalhe.
- `src/components/LeadFormModal.tsx` (+ CSS): `inputMode="tel"`, foco no primeiro campo com
  erro via `setFocus`, área de toque do consent com 44 px.
- `src/components/PublicLayout.tsx`: `end` no NavLink inicial (o RR já emite `aria-current`).
- `src/pages/admin/Admin.module.css`: arte do login no navy da marca; `.table` com
  `min-width` para rolagem horizontal correta.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 20 arquivos, 68 testes aprovados (ruído `render failed` do teste de boundary
  é esperado, como nas sessões anteriores).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- Bundle SSR (`dist/server/server.js`) contém as novas marcas: Compartilhar, mobileCta,
  breadcrumb, skeletons, aria-live, inputMode.

Risco/pêndencia:

- Conferência visual manual (detalhe com fotos, modal, CTA mobile, semelhantes) pendente
  com a API local no ar.
- Sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado).

## 2026-09-13 — Codex — rebrand Lucas Gobatto (UX-003, só front)

Tarefa: aplicar a marca real (azul-marinho + dourado + branco, Lucas Gobatto — CRECI 15776, Juara/MT)
sem nenhuma mudança no back.

Alterações em código (front apenas):

- `src/config/brand.ts`: nome, credential, creci, logo, tagline, closing e região `Juara, Mato Grosso` (`City`).
- `src/styles/global.css`: tokens navy/gold/branco; `--green` mantido como apelido do navy; botão, foco e eyebrow atualizados.
- `src/components/PublicLayout.tsx` + `.module.css`: marca SVG inline dourada, header branco com filete dourado, rodapé navy com CRECI.
- `Catalog.module.css` (filetes dourados, bloco de fechamento navy), `PropertyCard.module.css` (selo navy/gold),
  `PropertyDetail.module.css` (card de contato com topo dourado), `Admin.module.css` (sidebar navy).
- `public/favicon.svg`, `index.html` (`theme-color #0A2042`).
- `src/seo/metadata.ts`: JSON-LD `Organization` → `RealEstateAgent` com `identifier: CRECI 15776`.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 18 arquivos, 62 testes aprovados (mensagens de erro simuladas do teste de boundary são esperadas).
- `npm run build`: aprovado; cliente, SSR e `.vercel/output` gerados (avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado (SSR, metadados, paginação, 404, discovery e proxy com cookies).

Risco/pêndencia:

- Logo atual é SVG inline aproximado; trocar pelo PNG/SVG oficial com fundo transparente quando o dono enviar.
- Conferência visual manual (catálogo, detalhe, mobile) pendente com a API local no ar; dourado restrito a detalhes por contraste.
- Sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado).

## 2026-09-13 — Claude — refinamento do catálogo e detalhe público

Tarefa: UX-002 — melhorar o front sem alterar o backend.

Alterações em andamento:

- Refinados hero, busca, estados vazios, espaçamentos e CTA final do catálogo em `Catalog.module.css`.
- Refinados hover/foco e leitura visual dos cartões em `PropertyCard.module.css`.
- Refinados hierarquia do detalhe, card de contato, fatos da área e responsividade em `PropertyDetail.module.css`.
- Galeria agora aceita navegação por setas quando focada, além de receber acabamento visual e feedback nos thumbnails.

Validação parcial:

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 18 arquivos e 62 testes aprovados; mensagens de erro simuladas pelo teste de boundary são esperadas.

Validação final:

- `npm run build`: aprovado; cliente, SSR e `.vercel/output` gerados.
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 18 arquivos e 62 testes aprovados.
- Conferência no navegador: o runtime respondeu a página de indisponibilidade, comportamento esperado sem a API local;
  não foi possível conferir dados reais, galeria populada e modal de lead nessa execução.

Risco/pêndencia:

- Repetir a conferência manual com a API local disponível antes de publicar, especialmente catálogo com resultados,
  detalhe, filtros, galeria populada e modal de contato.

## 2026-09-13 — Codex — diagnóstico de 404 no painel de locações

O deploy `corretor-web-test.vercel.app` retornava 404 em `/api/admin/rental-parties` e `/api/admin/leases`. A investigação confirmou que o proxy do SSR repassa corretamente as requisições e que o front usa os caminhos previstos. O código atual da API (`4b9377c`) possui `RentalsModule` e os controllers; o serviço alcançado pelo deploy responde `Cannot GET /admin/...` e corresponde ao backend anterior `a41f49b`, que não importava o módulo.

Conclusão: não há correção de código no front. Publicar o `corretor-api` em `4b9377c` ou posterior, aplicar a migration de locações no banco de teste e confirmar `API_ORIGIN` no projeto Vercel. Nenhuma alteração externa ou segredo foi realizado nesta sessão.

Correção: deploy do serviço Render `Corretor-API` disparado no commit `4b9377c` e concluído com status `live`. Verificação direta no Render e pelo proxy da Vercel retornou `401 Unauthorized` para as rotas protegidas, confirmando que o 404 foi eliminado. A migration já aplicada no banco de teste não precisou ser executada novamente.

## 2026-09-13 — Codex — comissão de captação parcelada

Adicionada à ficha do contrato a comissão de captação equivalente a um aluguel, com quantidade de parcelas, primeiro vencimento, total, saldo e confirmação manual ADMIN. A interface chama as rotas financeiras protegidas e mantém SI9/Imonov fora do fluxo.

Verificação: typecheck e suíte completa do front (18 arquivos, 62 testes) aprovados antes/apos a inclusão da área; a API passou typecheck, lint, build e 18 suítes/190 testes. A migration financeira ainda aguarda aplicação no Neon.

## 2026-09-12 — Codex — primeira entrega de administração de locações

Tarefa: RENTAL-001. Implementadas no painel ADMIN as páginas e formulários de proprietários, inquilinos e contratos, com busca/paginação, vínculos a imóveis de locação, dados bancários do proprietário, fichas detalhadas, contratos vinculados e anexos privados. O cliente HTTP ganhou chamadas tipadas e download binário com o mesmo refresh de sessão compartilhado.

Arquivos principais: `src/pages/admin/Rentals.tsx`, `src/pages/admin/rentalSchema.ts`, `src/services/api.ts`, `src/services/http.ts`, `src/App.tsx`, `src/pages/admin/AdminLayout.tsx` e testes de autorização/contratos.

Verificação real: `npm run typecheck`, `npm run lint`, `npm test` (18 arquivos, 62 testes) e `npm run build` passaram. O build produziu cliente, SSR e `.vercel/output`; os avisos emitidos vieram de comentários de pureza em dependências do Zod durante o Rollup. Smoke SSR ainda depende de executar `node scripts/seo-smoke.mjs` com ambiente de preview e será repetido na validação final.

Pendências: aplicar a migration da API após backup do Neon, configurar `R2_DOCUMENTS_BUCKET` privado e homologar o fluxo real. Comissão, cobrança, repasse, SI9/Imonov e importação de planilhas permanecem fora do escopo.

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

## 2026-09-13 — Ambiente de teste
- Provisionamento Cloudflare R2 registrado; bucket privado \corretor-documentos-test\ criado para documentos administrativos.
- Vercel/Neon aguardam autenticação válida da sessão local.

## 2026-09-13 — Ambientes conectados
- Vercel: projeto \corretor-web-test\ publicado em https://corretor-web-test.vercel.app.
- Neon: projeto \
oyal-haze-18985318\ criado e oito migrations aplicadas com sucesso.

## 2026-09-13 — Codex: revisão e deploy UX-003/UX-004 concluídos

Pedido do dono: revisar, opinar e publicar as alterações locais do front. Main sincronizada com origin/main em 433392d após git fetch (0/0). Revisão do diff sem bloqueador para atualizar o ambiente de teste; código preexistente preservado, sem commit/push.

Publicação: https://corretor-web-test.vercel.app — deployment dpl_8ZTk6bsKwV8xnqye5nUDo6EdcRV4, READY, target production do projeto de teste existente. Build remoto a partir dos arquivos locais via Vercel CLI, mantendo as variáveis configuradas no projeto.

Validação: typecheck e lint aprovados; 20 arquivos/68 testes aprovados; build local e remoto aprovados; scripts/seo-smoke.mjs aprovado, incluindo função Vercel independente, SSR, metadados, paginação, 404 e proxy com cookies. Avisos de anotação do Zod no Rollup não impediram o build. Conferência no navegador em viewport estreita: catálogo, detalhe com fixture local, CTA mobile, modal e foco no primeiro erro aprovados. Catálogo publicado confirmado com a nova marca.

HTTP publicado: /, /admin/login, /robots.txt e /sitemap.xml = 200; rota e imóvel inexistentes = 404; /api/properties = 200 com zero imóveis; /api/admin/leases = 401 sem autenticação. Robots mantém Disallow: / e sitemap vazio no ambiente de teste.

Opinião: navy/gold e tipografia deixam a identidade mais consistente; ações de mapa/compartilhar, CTA mobile e foco de formulário melhoram a navegação. Próximo refinamento: nomes de características com acentuação e preservação dos rótulos de objetos (featureValue hoje reduz objetos aos valores).

Limites: catálogo remoto vazio impede homologar detalhe real; detalhe conferido apenas com fixture local. Não foram executados login autenticado, upload, criação real de lead, compartilhamento nativo ou navegação da galeria com múltiplas fotos. Logo oficial e dados de brand.privacy continuam pendentes para lançamento comercial. Os registros antigos de API/Vercel não publicados estão superados para o ambiente de teste; lançamento comercial e indexação continuam pendentes.

Arquivos alterados nesta revisão: PROJECT_STATUS.md, TASKS.md, DECISIONS.md e CHANGELOG_AI.md (registros aditivos). Nenhuma dependência ou mudança no backend.


## 2026-09-13 — Codex: URLs em português concluídas
Rotas públicas: /imoveis/{tipo}, /imoveis/para-alugar, /imoveis/para-comprar e combinações; query cidade/preco-minimo/preco-maximo/pagina. Painel: /admin/entrar e /admin/contatos. URLs antigas redirecionam 301; navegador usa replace; slugs e APIs preservados.
Publicação Vercel dpl_Bbf5617bGJdqKv79WJbuDDFJaP1M READY, alias https://corretor-web-test.vercel.app. SITE_URL e SEO_INDEXABLE configuradas em Production conforme autorização. Robots, llms e sitemap respondem 200; raiz index,follow; filtros noindex,follow; painel noindex,nofollow. Sitemap contém início e privacidade (catálogo público sem imóveis no momento).
Validação: typecheck, lint, build, suíte de 93 testes e teste adicional de navegação aprovado (94 no total coberto); smoke SSR/proxy/discovery aprovado. Navegador: redirecionamento, paginação e detalhe com fixture local; catálogo filtrado publicado confirmado. Login autenticado/logout e fichas reais não exercitados no navegador nesta sessão; permissões existentes cobertas pela suíte. Sem commit/push.
Arquivos do front: services/urls.ts e testes, App.tsx, Catalog, PublicLayout, PropertyCard, PropertyDetail, AdminLayout, Dashboard, Login, PropertyForm, SEO server/metadata e testes, scripts/seo-smoke.mjs. API: apenas documentação; alterações preexistentes em .env.example e .gitignore preservadas. Nenhuma dependência, migration ou alteração de dados.


## 2026-09-13 — Preparação de commit e push autorizada
Codex: revisão do diff concluída; typecheck, lint, 21 arquivos/94 testes, build e smoke de SEO aprovados novamente. Front: código e documentação das URLs; API: somente documentação correspondente. Alterações anteriores da API em .env.example e .gitignore excluídas do commit.

## 2026-09-13 — opencode: capa no catálogo + decode no upload

Tarefa: capa definida no painel não aparecia no catálogo ("Foto em breve"), só no detalhe; formulário exibia "The source image could not be decoded." em inglês.

Causa da capa (API, repositório irmão): `PropertiesService.list()` carregava só `agent`, então `toPropertyResponse` devolvia `media: []` na listagem. Corrigido com segunda query por imóvel, paginação preservada; teste novo de capa ordenada.

Alterações em código (front apenas):

- `src/components/mediaUpload.ts`: `createImageBitmap` com erro PT por arquivo; `prepareMediaFiles` pula ilegíveis via `onError`, mantém ordem e progresso.
- `src/components/MediaManager.tsx`: envia os válidos, avisa os pulados, bloqueia só quando nada é legível.
- `src/components/mediaUpload.test.ts` (+2 testes) e `src/components/MediaManager.test.tsx` (+2 testes).

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- API: `npm run typecheck`, `npm run lint` e `npm test` aprovados (18 suítes, 191 testes).

Risco/pendência:

- Conferência manual com a API no ar (catálogo com capa, upload misto, `robots.txt`, `sitemap.xml`, 404) e redeploy da API no Render pendentes.
- Sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado).
