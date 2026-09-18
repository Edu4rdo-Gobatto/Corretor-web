# Histórico de trabalho dos agentes — corretor-web

## 2026-09-18 — Etapa 0 e Fase 1 do plano de UI/velocidade + paleta pedida pelo dono (Claude)

Pedido do dono (17/09): melhorar UI/UX, menos requisições e menor tempo de resposta, corrigir telas "divididas" (ex.: novo
corretor) e indicar agentes para usar com o Claude. Plano aprovado; escopo só front. Em 18/09 o dono pediu fundo
azul-claro no tema claro e um escuro mais leve.

**Diagnóstico confirmado no navegador (linha de base, antes das mudanças):** 143 testes visuais, 97 aprovados e 46 falhas:
todo modal descentralizado em todas as larguras (esquerda 0px, direita até 800px) — a "tela dividida"; barra do painel
com 289–347px em 768px e 171–174px em 390px; rolagem horizontal de 100px em Contatos a 1024px; CORRETOR com 403 no
formulário de imóvel. Requisições `/api` do navegador: visão geral 11, perfil 9, formulário de edição 6, filtro do
catálogo 7, detalhe 4. Bundle: 447,9 kB / 145 kB gzip (o primeiro build local deu 700 kB por causa do
`NODE_ENV=development` do `.env`).

**Alterações:**
- Build: `scripts/build.mjs` fixa `NODE_ENV=production`.
- Modais: `Dialogo` com `m-auto`, `tamanho`, corpo rolável `@container`, fundo navy e trava de rolagem com compensação
  da barra; todos os modais com tamanho e `estilos.rodapeDialogo`; campos reordenados sem célula vazia (Corretores,
  EditorPessoa, Contratos, Comissões, Perfil); Cadastros ganhou "Cancelar" e "Salvando…".
- Painel: `estilosPainel` com container query; `LayoutPainel` com `grid-rows-[auto_1fr]`, lateral fixa no desktop,
  `@container/principal` e "Cadastros" só para ADMIN; `Entrar` sem esticar; grades de 3 colunas por container;
  `Paginacao` com quebra de linha; e-mails longos quebram; `SeletorRegistro` abre para cima quando falta espaço.
- Imóvel: lookups públicos em paralelo com a ficha (`comClassificacoesDaFicha`), seção 05 (mídias) antes da 06 dentro do
  formulário, `GerenciadorMidia` sem `<form>` aninhado e sem cores antigas; `SelecaoMidia` com tokens.
- Sessão: `useSessao` guarda `Promise<Corretor>`, zera em falha/expiração/saída; `Cadastros` com guarda de ADMIN.
- Textos: "Disponíveis" (`rotulosStatusImovelPlural`), `plural()` em "imóvel encontrado" e "parcela(s)"; ícone de
  carregamento gira; brilho do esqueleto por token.
- Tema: tokens novos no `@theme`/`.dark`, variáveis legadas alinhadas, borda de campo por `--color-control-line`, skip
  link legível no escuro. Logo: `scripts/gerar-logo.mjs` gera variantes WebP (7–35 KB) por tema; o cabeçalho troca por CSS.
- Ferramentas: `tests/visual/` (api-simulada, ajudantes, orçamento, specs), `playwright.visual.config.ts`, scripts
  `visual`/`visual:sem-build`, `.claude/agents/revisor-design.md`, `.claude/agents/auditor-desempenho.md`,
  `.claude/commands/revisar-design.md`, `.claude/commands/medir.md`; `AGENTS.md` (Tailwind, não CSS Modules), `tsconfig`,
  `vite.config` (exclui `tests/visual`), `.gitignore` (`.claude/settings.local.json`).
- Testes novos/ajustados: `Dialogo` (centralização, tamanho, trava de rolagem), `SeletorRegistro` (abre para cima),
  `LayoutPainel` (Cadastros só ADMIN), `FormularioImovel` (lookups públicos para CORRETOR, "(inativo)", ordem 05→06),
  `useSessao.test` (novo), `VisaoGeral` (plurais), `esquemaImovel` (`comClassificacoesDaFicha`), `formato` (`plural`),
  `LayoutPublico` (logo por tema, sem o PNG original).

**Testes executados (resultado real, estado final):** `npm run typecheck` aprovado; `npm run lint` aprovado (falhou uma
vez por globais de navegador em `gerar-logo.mjs`, corrigido com `/* global */`); `npx vitest run` 38 arquivos/190 testes
aprovados (as mensagens "render failed" são do teste proposital do `LimiteErro`); `npm run build` aprovado (`index` 448,1 kB /
145,4 kB gzip; CSS 60,1 kB / 12,3 kB); `node scripts/seo-smoke.mjs` aprovado — a falha registrada em 17/09 não se reproduziu
com o build de produção; suíte visual 143/143 aprovada em 7 projetos (claro 1440/1024/768/390/320, escuro 1440/390).
Durante a rodada a suíte acusou e levou a corrigir: diferença de 15px na centralização causada por `scrollbar-gutter`
(trocado por compensação de `padding-right`), rodapé do modal 32px acima da borda (sticky respeita o padding) e o logo
invisível no tema claro (texto branco da arte oficial).

**Não executado / pendências:** conferência com a API real e login de verdade (sem `E2E_STACK=teste`); E2E autenticado
continua pendente. Os navegadores do Playwright não estão instalados nesta máquina: a suíte visual usa o Chrome do
sistema; a suíte `tests/e2e` com a config antiga também precisaria de `channel: 'chrome'` para rodar aqui (não alterada).
Requisições ficaram iguais à linha de base (redução é das Fases 2–4). A 404 curta deixa o rodapé no meio da tela
(anterior a esta rodada). Sem commit/push/deploy: o dono fará o commit. Artefatos da suíte (`test-results/`, 73 MB) apagados a pedido do dono; o código dos testes foi mantido.

## 2026-09-16 — Contrato v2 no front: ids inteiros, pessoas, ficha do imóvel e português (Claude)

Pedido do dono em 16/09: upload de imagens junto com a criação do imóvel; contatos em três listas
(pendentes, respondidos, finalizados); cadastro único de pessoas (o lead é só o primeiro contato);
campos novos no imóvel e no catálogo; tudo em português; componentes compartilhados no painel; e
ids inteiros com autoincremento no lugar de UUID. Contrato: `docs/specs/2026-09-16-ids-inteiros-pessoas.md`.

Alterações no front (renomeações com `git mv`, histórico preservado):

- `src/tipos/index.ts` reescrito com o domínio em português igual ao contrato HTTP; `src/services/portuguese.ts`
  (tradutor) e os tipos ingleses removidos. Pastas `src/servicos`, `src/componentes`, `src/paginas/{publico,painel}`.
- `src/servicos/`: `http.ts` (renovação única), `api.ts` (catálogo, fichas, pessoas, mídia, sessão),
  `locacoes.ts` (contratos e comissões), `catalogo.ts`, `urls.ts`, `contato.ts`, `formato.ts`, `validacao.ts`,
  `exportacaoContatos.ts`, `videoEmbed.ts`.
- Imóvel novo: `SelecaoMidia` guarda fotos e vídeos antes de salvar; o formulário faz POST e envia as mídias em
  seguida, avisando na edição se alguma falhar. Ficha interna com proprietário (busca), exclusividade, captação,
  chaves, matrícula, inscrição, observações internas e motivo da baixa; dois valores (venda e locação).
- Contatos (`/admin/contatos`) em três colunas por `status_contato`, cada uma com paginação, CSV e ações de avanço.
  Pessoas (`/admin/pessoas`) com lista, editor único e ficha com imóveis, contratos e comissões.
- Catálogo público: filtros de bairro e área, ordenação, datalist de cidades; slug termina no id e o SSR responde
  301 quando o título mudou (na SPA, `Navigate`). Cartão mostra "Sob consulta" sem valores e etiqueta de destaque.
- Componentes compartilhados: `CabecalhoPagina`, `Tabela`, `Etiqueta`, `estilosPainel`, `SeletorRegistro`
  (combobox com busca, no lugar dos seletores paginados), `EstadoCarregamento`, `Dialogo`, `Paginacao`, `LimiteErro`.
- Hooks: `useSessao`, `useRecurso`, `useDadosPainel`, `useTema`, `useGuardaFormulario`.
- `scripts/seo-smoke.mjs` e `tests/e2e/**` adaptados ao contrato v2 (ids inteiros, `/pessoas`, dois valores).

Testes executados (resultado real):

- Front: `npx tsc --noEmit` sem erros; `npm run lint` sem erros; `npx vitest run` com 37 arquivos e 177 testes
  aprovados; `npm run build` (cliente, SSR e `.vercel/output`) aprovado; `node scripts/seo-smoke.mjs` aprovado,
  incluindo o 301 do slug renomeado.
- API (repositório irmão): typecheck, lint, build e 26 suítes/175 testes aprovados; integração da migration em
  PostgreSQL 16 (Docker) com 4 testes aprovados.
- Não executado: E2E autenticado (exige stack de teste com a API v2 publicada, credenciais e `E2E_STACK=teste`) e
  conferência no navegador com dados reais.

Pendências e riscos: publicar front e API juntos (o contrato antigo deixa de funcionar); migração do banco só com
backup e corte coordenado; aviso de novo contato (NOTIFY-001), regras de locação (RENTAL-004), rascunho de anúncio
(RASCUNHO-001) e Prettier (FORMATO-001) ficaram para conversa com o dono. Sem commit/push.

## 2026-09-16 — Diagnóstico de produto com olhar de corretor (Claude)

Pedido: analisar o sistema como sênior e como corretor, apontar pontos críticos, melhorias e novas
funcionalidades, mantendo o produto simples e o código limpo.

Alterações: apenas `docs/plans/2026-09-16-diagnostico-produto.md` (novo), este registro e
`PROJECT_STATUS.md`. Nenhum código, dado ou banco alterado. API lida por agente de mapeamento
(somente leitura em `../Corretor-API/src`).

Testes executados para conhecer o estado da base: `npm run typecheck` sem erro; `npm run lint` sem
erro; `npm test` com 31 arquivos e 153 testes aprovados. Não foram executados build, seo-smoke nem
E2E (não houve mudança de código).

Pendências: dono decidir a ordem dos blocos P1/P2/P3 e a unificação do cadastro de pessoas
(muda a especificação de 13/09); cada item escolhido vira tarefa em `TASKS.md`.

## 2026-09-16 — URL de imóvel malformada não deve virar 503

Pedido: investigar o `503` ao abrir `/imoveis/lojasOR%201=1--]'AND%20released=1` no preview.
Diagnóstico confirmado no preview: o caminho era interpretado como detalhe de imóvel, a API
respondia erro de validação para o slug e o SSR mascarava qualquer resposta não-404 como 503.

Alterações: `src/services/urls.ts` ganhou `isValidPropertySlug`; `src/seo/server.tsx` retorna
404 antes da API para slug inválido; `src/services/api.ts` aplica a mesma proteção no SPA.
Foram adicionadas regressões em `src/seo/server.test.ts`, `src/services/api.test.ts` e
`src/services/urls.test.ts`. Testes direcionados: 3 arquivos, 50 testes aprovados.

Pendente: executar validação completa e aguardar autorização explícita para commit/push.

## 2026-09-16 — Muse Spark: chip "Todos os imóveis" legível + filtros sem scroll ao topo

Pedidos do dono (com prints): botão "Todos os imóveis" com texto invisível e qualquer filtro
rolando a página totalmente para cima. Back autorizado se preciso; não foi preciso (tipos
carregam normalmente, só front).

Causas raiz (comprovadas no código):
- Chip: `chipBase` trazia `border-line bg-transparent text-muted` e o `chipSelected`
  adicionava `border-navy bg-navy text-white` no mesmo elemento. No Tailwind vence a ordem
  do CSS gerado, não a do atributo — resultado branco sobre branco, com o filete dourado
  visível (o `shadow` não tinha conflito). Mesmo padrão dos bugs do menu/hambúrguer.
- Scroll: `ScrollToTop` (`App.tsx`) fazia `window.scrollTo(0,0)` em toda troca de `pathname`,
  e filtro de tipo/finalidade troca o pathname (`/` → `/imoveis/salas`) via `catalogUrl()`.

Alterações em código (front apenas, sem commit/push):
- `src/pages/public/Catalog.tsx`: `chipBase` só com layout; novo `chipIdle`
  (`border-line bg-transparent text-muted hover:border-navy dark:hover:border-gold`);
  uso `${chipBase} ${selected ? chipSelected : chipIdle}` nos dois botões.
- `src/App.tsx`: `ScrollToTop` guarda o pathname anterior e pula o reset quando origem e
  destino são ambos `catalogPaths`; saídas do catálogo mantêm o scroll ao topo.
- `src/components/Pagination.tsx`: links de página (só usados no catálogo) ganham `onClick`
  rolando até `#catalogo`, respeitando `prefers-reduced-motion`. Admin inalterado.
- `src/seo/navigation.test.tsx`: regressão — selecionado tem `bg-navy`/`text-white` sem
  `bg-transparent`/`text-muted`/`border-line`; clique no chip não chama `scrollTo`;
  paginação chama `scrollIntoView` sem `scrollTo`; ir a `/privacidade` chama `scrollTo(0,0)`.

Testes executados (resultado real):
- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 30 arquivos, 148 testes aprovados (inclui a regressão nova).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`).
- `node scripts/seo-smoke.mjs`: aprovado (SSR, metadados, paginação, 404, discovery, proxy).

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando
liberado); conferir no navegador claro/escuro + mobile: chip legível nos dois estados,
chips sem mover a página, Buscar levando aos resultados, paginação no `#catalogo`.
Modificações locais preexistentes (`scripts/runtime.mjs`, `src/seo/server.*`, docs) não
foram tocadas por esta entrega e seguem fora do escopo do commit.

## 2026-09-15 — Muse Spark: 404 de assets no preview (diagnóstico)

Sintoma do dono: `GET /assets/index-DI-c97Mf.js` e `.css` 404 na porta 4173 com `npm run dev` "não achando nada".

Causa raiz: preview antigo órfão (PID 85268, de sessão anterior de agente) servindo da memória um `index.html` com hashes de build anterior; cada `npm run build` apaga os hashes antigos do `dist`, daí o 404. O `dev` escuta na 5173 — a aba presa na 4173 nunca veria o dev. Nenhum bug de código; nenhuma alteração em fonte.

Ações: processo antigo morto; preview novo na 4173 conferido (`/` 200, js/css atuais 200) e `dev` na 5173 conferido (`/` 200 com `<h1>`); ambos parados, estado de chegada restaurado. Sem commit (só docs). Para o dono: hard refresh (Ctrl+Shift+R) na aba da 4173; dev = 5173, preview = 4173.

## 2026-09-15 — Muse Spark: privacidade + 403 do renovar

Pedidos do dono: arrumar o `/privacidade` (mesmo padrão morto do `/devs`) e o `POST /api/autenticacao/renovar 403` no preview.

Diagnóstico do 403 (causa raiz, comprovada): o `.env` local aponta `API_ORIGIN` à API de produção; o preview em `127.0.0.1` envia `Origin` ao proxy, que repassa intacto, e o `OrigemGuard` da API responde `{"statusCode":403,"message":"Origem não autorizada."}` antes da lógica de sessão (reproduzido via proxy com `curl`, sem escrita — o guard rejeita antes do serviço). O front mapeava tudo para "sessão expirou" e emitia `session-expired`. Não é bug de código do front nem do proxy; remover o `Origin` no repasse contornaria a proteção do guard.

Alterações em código (front apenas, sem commit/push):

- `src/services/http.ts`: `refreshAccess` mantém a limpeza (token + `session-expired`), mas com corpo `Origem não autorizada.` a mensagem passa a ser "Esta origem não é autorizada pelo serviço. Confira o endereço da API e entre novamente."
- `src/services/http.test.ts`: novo teste — rejeição de origem relata a causa com verdade e mantém o aviso de expiração (6 testes no arquivo).
- `src/pages/public/PrivacyPolicy.tsx`: `container` no `article` + `div` interno `mx-auto max-w-[800px]` e `h1` com `clamp(32px,8vw,44px)`, mesmo padrão do `/devs`.

Testes executados (resultado real):

- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 29 arquivos, 142 testes aprovados (era 29/141; ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- Preview em `127.0.0.1:4423` com o novo build: `/privacidade` 200 com `div` interno, `h1` com clamp e `article` sem `max-w` morto.

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado); fluxos de sessão no preview contra a API de produção continuam 403 por desenho (usar a API local para login/refresh); conferir `/privacidade` no navegador 320–390px e desktop nos dois temas.

## 2026-09-15 — Muse Spark: refinamentos do /devs + header (pacote 1–5)

Pedido do dono ("go") sobre a revisão do `/devs` + header fixo.

Alterações em código (front apenas, sem commit/push):

- `public/assets/dev-eduardo.jpg` + `dev-fernando.jpg` (novos, cópias dos avatares GitHub, JPEG válido conferido por magic bytes); `src/config/devs.ts` com `avatarUrl` local e novo `githubUrl` (logins conferidos na API do GitHub).
- `src/pages/public/Devs.tsx`: links GitHub ao lado do Instagram (ícone `Github` do lucide, `rel="me noopener noreferrer"`, `target=_blank`, `min-h-11`); `h1` com `text-[clamp(32px,8vw,44px)]`; `referrerPolicy` removido (só fazia sentido no hotlink); `container` no `article` + `div` interno `mx-auto max-w-[800px]` (o `max-w` no mesmo elemento do `container` era morto — `.container` sem camada vence a utility).
- `src/components/PublicLayout.tsx`: logo e controles do header com `relative z-[6]`, acima do backdrop (`z-[4]`) e do sheet (`z-[5]`); com o menu aberto o tema continua clicável.
- Testes: `Devs.test.tsx` (avatares locais + links GitHub) e `PublicLayout.test.tsx` (novo teste de stacking logo/controles acima do backdrop).

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 29 arquivos, 141 testes aprovados (era 29/140; ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- Preview em `127.0.0.1:4421` com o novo build: `/devs` 200 com avatares locais, links GitHub, sem hotlink, header `sticky top-0 z-40`, `h1` com clamp e `/assets/dev-eduardo.jpg` 200.

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado); conferir no navegador `/devs` 320–390px e desktop nos dois temas; `/privacidade` tem o mesmo padrão morto `container max-w-[800px]`, fora deste escopo.

## 2026-09-15 — Muse Spark: header público fixo + cobertura do rodapé

Pedido do dono: link de desenvolvedores no rodapé e header persistente no topo.

Alterações em código (front apenas, sem commit/push):

- `src/components/PublicLayout.tsx`: header público com `sticky top-0 z-40` (sempre visível, só CSS, sem JS; menu mobile, backdrop e filete gold preservados; painel admin inalterado). O link "Desenvolvedores" no rodapé já existia da entrega `/devs` — confirmado no HTML servido, sem mudança visual.
- `src/components/PublicLayout.test.tsx`: novo teste — header contém `sticky` + `top-0` e link "Desenvolvedores" aponta para `/devs`.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 29 arquivos, 140 testes aprovados (era 29/139; ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`; avisos de pureza do Zod no Rollup, já conhecidos).
- Preview em `127.0.0.1:4173` reiniciado com o novo build: `/devs` 200 com `<header class="sticky top-0 z-40 ...">` e `<h1>Desenvolvedores</h1>` conferidos no HTML servido.

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado); conferir no navegador com rolagem real (catálogo, detalhe, `/devs`, 390px + desktop, claro/escuro): header sempre visível, menu mobile abrindo abaixo dele, CTA sticky do detalhe passando por baixo sem cobrir nada.

## 2026-09-15 — Muse Spark: página /devs com fotos, nomes e @s

Pedido do dono: caminho `/devs` com as duas fotos (avatares GitHub), nomes e @s do Instagram.

Alterações em código (front apenas, sem commit/push):

- Novos `src/config/devs.ts` (Eduardo Gobatto @e.gobatto + Fernando Riad @_riad777, papel "Front-end e back-end" para os dois) e `src/pages/public/Devs.tsx` (cards com foto 112px, fallback para inicial, links Instagram em nova aba) + `Devs.test.tsx` (1 teste).
- `src/services/urls.ts`: `routes.devs`, `/devs` em `normalizedUrl`; `src/App.tsx`: rota `devs` no `PublicLayout`; `src/components/PublicLayout.tsx`: link "Desenvolvedores" só no rodapé.
- `src/seo/server.tsx`: `/devs` estática sem fetch, no `sitemap.xml` e no `llms.txt`; `src/seo/metadata.ts`: título `Desenvolvedores | Lucas Gobatto` + descrição com os dois @s, canonical `/devs`, `index,follow` pela regra geral.
- Testes: `server.test.ts` (sitemap 4→5 URLs, novo teste `/devs` 200 sem fetch + canonical + robots, `llms.txt` com `/devs`), `urls.test.ts` (`/devs` conhecida), `scripts/seo-smoke.mjs` (assert `/devs` com `<h1>`).

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 29 arquivos, 139 testes aprovados (era 28/136; ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`; avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado (inclui `/devs` 200 com `<h1>Desenvolvedores</h1>`).
- Conferência do bundle SSR (`dist/server/server.js`): contém `routes.devs`, título, descrição, sitemap e `llms.txt` com `/devs`.

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado); conferir no navegador `/devs` 320–390px e desktop nos dois temas, com clique nos dois Instagrams; fotos dependem do GitHub (fallback de inicial se quebrar).

## 2026-09-15 — Codex: rigor do E2E (revisão do dono)

Seis correções pedidas, todas aplicadas no front, sem commit/push/deploy:

- `src/services/http.test.ts`: teste de expiração agora parte de token preenchido
  (`stale-token`) e cobra a limpeza da aplicação — sem `setAccessToken(null)` manual.
- `tests/e2e/seo-ssr.spec.ts`: catálogo comprovado no HTML bruto (`<h1>` + marcador
  `<!--app-html-->` substituído) e em contexto com JavaScript desabilitado.
- `tests/e2e/midia.spec.ts`: `naturalWidth > 0` na ficha e no detalhe público,
  mais persistência via API (1 mídia, `capa: true`, URL pública).
- `tests/e2e/mobile-acess.spec.ts`: tema compara valor salvo x classe `.dark` após
  reload; teclado usa só Tab/Enter (foco inicial + ordem do menu).
- `tests/e2e/helpers/env.ts`: `NODE_TLS_REJECT_UNAUTHORIZED=0` só no processo de
  teste para o cert autoassinado (nunca no app).
- Trava anti-produção (config + fixture) e `E2E_STACK=teste`: base não-local aborta
  a suíte no carregamento (comprovado contra URL remota); teste com backend sem
  stack declarado pula. Limpeza completa com status verificado (contrato → comissão
  → imóvel → partes → cliente). README com provisionamento sem editar `.env`.

Achado de ambiente (importante): o `.env` deste checkout aponta `API_ORIGIN` à API
de produção e o banco local é o principal (`corretor-db`). Leituras do E2E/SSR
atingiram produção (catálogo, saúde, 1 login inválido); nenhuma escrita ocorreu
(todos os testes com escrita pularam por falta de cred/stack). Servidores da sessão
parados. Regra registrada em DECISIONS.md.

Testes executados (resultado real):

- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 28 arquivos, 136 testes aprovados.
- `npx playwright test`: 37 testes em 11 arquivos — 15 aprovados, 22 não executados
  (stack de teste + `E2E_ADMIN_*`/`E2E_CORRETOR_*` pendentes), 0 falhas.

Pendente do dono: banco de teste provisionado (`E2E_STACK=teste`), credenciais de
teste, HTTPS local e homologação real do Drive para os 22.

## 2026-09-15 — Codex: limpeza parcial no seed + allowlist de domínio

- Seed dentro do `try` com IDs opcionais em comissão, contrato (2 testes), lead
  (2), mídia (2), CRUD (2) e catálogo: falha entre criações limpa o que já foi
  criado; `finally` com guardas `if (id)` em ordem FK-safe.
- `E2E_ALLOW_REMOTE`/`E2E_ALLOW_EXTERNAL` e `assertSafeE2ETarget` removidos e
  unificados em `alvoE2ELiberado`/`assertSafeTarget` com `E2E_DOMINIOS_PERMITIDOS`;
  `playwright.config.ts` importa a trava (sem lógica duplicada). Comprovado:
  domínio remoto não listado aborta no carregamento; listado, carrega (37 testes).
- Validação: typecheck, lint, Vitest 28/136, Playwright 37 testes — 15 aprovados,
  22 não executados (stack + credenciais), 0 falhas. Preview parado. Sem commit.

## 2026-09-14 — Codex: estratégia de testes com Playwright + Vitest

Pedido do dono: testes ponta a ponta com Playwright cobrindo fluxos críticos, sem só planejar.

Alterações (front apenas, sem commit/push/deploy):

- Infra: `playwright.config.ts` (desktop 1280 + mobile 390, trace/screenshot/vídeo em falha, `ignoreHTTPSErrors` p/ cert autoassinado), `tests/e2e/helpers/{env,api}.ts`, `tests/e2e/fixtures.ts` (login via UI, portões com skip motivado), `tests/e2e/README.md`, scripts `test:e2e*` no `package.json`, `@playwright/test` **1.60.0 exato** (justificado em DECISIONS.md: CDN bloqueia o Chromium novo; 1.60 reaproveita o 1223 instalado), Vitest exclui `tests/e2e/**`, artefatos no `.gitignore`, `tsconfig` inclui o E2E no typecheck.
- 11 specs: `seo-ssr` (robots/sitemap/llms/404/noindex/proxy/h1), `auth-login` (validação, senha errada, login válido), `auth-sessao` (navegação, reload só-HTTPS, logout), `auth-papeis` (proteção, ADMIN x corretor), `catalogo` (busca, vazio, cartão→detalhe, deep-link, URL amigável; desktop+mobile), `lead` (sem consentimento barra, com consentimento persiste), `imovel-crud` (cadastro persiste no reload, edição), `midia` (upload PNG sintético→capa no detalhe, vídeo inválido recusado), `contrato-drive` (FALHOU preserva contrato + retentativa, painel exibe estado), `comissao` (400 sem confirmação/referência, baixa via UI persiste, idempotência), `mobile-acess` (menu/Escape, teclado, tema persistente, toques ≥44px).
- Vitest: `src/services/portuguese.test.ts` (9 testes: paginação, chaves legadas, query nula em tipo desconhecido, moeda/área, mídias, corretor reserva sem PII, contato, query vazia) e +2 em `http.test.ts` (limpeza/notificação em refresh 401, fallbacks PT por status + mensagem de negócio).
- Correção encontrada pelo E2E: helpers usavam `/api/v1/...`, mas o proxy remove `/api` e a API completa com `/api/v1` — caminho correto `/api/<rota>` (ex.: `/api/saude`). Expectativa ajustada ao contrato real, não o contrário.

Testes executados (resultado real, API + SSR preview reais no ar, depois parados):

- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 28 arquivos, 136 testes aprovados (era 27/125).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`).
- `node scripts/seo-smoke.mjs` em cópia temporária (portas 4299/4281, 4199/4180 ocupadas; cópia removida): aprovado.
- `npx playwright test` 2x: 19 aprovados, 17 não executados, 0 falhas (estável nas 2 execuções).

Não executado (bloqueio exato): os 17 pulados exigem `E2E_ADMIN_EMAIL/SENHA` (15) e `E2E_CORRETOR_EMAIL/SENHA` (2) de teste, e confirmação de que a API aponta ao banco de teste antes de qualquer escrita; reload com sessão exige HTTPS local (cookie Secure — sem ele o teste confirma a volta ao login, sem relaxar segurança); homologação real do Drive compartilhado é etapa externa. R2/Drive não declarados validados. Nenhum dado real tocado; nenhuma escrita de teste no banco (todos os testes com escrita pularam); servidores da sessão parados.

Risco/pendência: sem commit/push (aguardando dono, direto na `main`); prover credenciais de teste + HTTPS local para os 17; decidir retenção da branch de homologação; futuro: E2E de upload R2 real e pasta Drive real.

## 2026-09-13 — opencode — Perfil do admin + senha (front)

Pedido do dono: `/admin/perfil` ao clicar na foto, com foto maior e métricas do usuário; troca de senha
dentro do perfil; botão de redefinição onde o admin escolhe a senha na hora; e-mail só alterado pelo admin.

Alterações em código (front):

- `src/pages/admin/Profile.tsx` (nova) + `Profile.test.tsx` (3 testes): foto 96px com fallback da inicial,
  dados da conta (e-mail em leitura, "só o admin altera"), métricas (imóveis total + disponíveis/reservados/
  concluídos via `status`, contatos total + últimos 30 dias + recentes), edição própria (nome, WhatsApp, CRECI,
  foto HTTPS) com `refresh()` da sessão pós-save, e troca de senha (atual + nova + confirmação).
- `src/App.tsx` + `src/services/urls.ts` (+ teste): rota `perfil` em `/admin`, `routes.profile` e regex do
  `normalizedUrl`; painel segue `noindex`, fora do SSR.
- `src/services/api.ts`: `listProperties` aceita `status?`, `listLeads` aceita `createdFrom/To` (a API já
  suportava), novos `updateProfile` (`PATCH /auth/me`) e `changePassword` (`PATCH /auth/me/password`).
- `src/hooks/useAuth.tsx`: exposto `refresh()` (`GET /auth/me`); mocks de `Rentals.test`/`AdminLayout.test`
  atualizados.
- `src/pages/admin/AdminLayout.tsx` (+ teste): foto do desktop vira link "Ver perfil de …"; dropdown do
  mobile ganha item "Meu perfil"; sair e tema preservados.
- `src/pages/admin/AgentsList.tsx` + `AgentsList.test.tsx` (novo, 1 teste): botão "Redefinir senha" por linha
  (só ADMIN, como a página), diálogo com nova senha + confirmação (mín. 12), chamando o `PATCH /agents/:id`
  existente; aviso de que o acesso atual do alvo segue válido até sair ou o token expirar.
- Correção de teste: `aria-label` explícito nos campos de senha novos (o texto de dica/erro dentro do `<label>`
  mudava o nome acessível e quebrava o `getByLabelText`).

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 24 arquivos, 109 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`; avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- API (repositório irmão): typecheck, lint e 18 suítes/195 testes aprovados.

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado);
conferência no navegador com login pendente (perfil mobile/desktop, foto quebrada, troca invalidando a antiga,
reset pelo ADMIN); troca/reset não revoga outras sessões; deploy da API no Render pendente para os endpoints
novos valerem em produção.

## 2026-09-13 — opencode — Avatar do usuário + modo noturno visível

Pedido do dono (com prints): o avatar não aparecia no painel e o modo noturno não tinha onde ser ligado.

Alterações em código (front apenas):

- `src/hooks/useTheme.ts` (novo) + `src/hooks/useTheme.test.ts`: tema claro/escuro com persistência
  em `localStorage "theme"`, `prefers-color-scheme` como padrão e aplicação de `.dark` no
  `documentElement`; SSR-seguro (sem `window` no render, DOM só em efeito).
- `src/pages/admin/AdminLayout.tsx`: avatar (`avatarUrl`, fallback inicial, troca silenciosa se a
  URL quebrar); desktop com bloco no rodapé do `aside`; mobile com foto no topo abrindo dropdown
  (`menu`, Escape/clique fora) com nome, papel e "Sair da conta"; alternador de tema nos dois.
- `src/components/PublicLayout.tsx`: botão Sol/Lua no cabeçalho (desktop + mobile), ao lado do hambúrguer.
- `index.html`: script inline anti-flash que aplica `.dark` antes do bundle quando há escolha salva
  ou preferência do sistema.
- `src/pages/admin/AdminLayout.test.tsx` (3 → 6 testes) e `src/components/PublicLayout.test.tsx`
  (+1 teste): avatar, dropdown com logout, toggle com persistência.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 22 arquivos, 104 testes aprovados.
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`).

Risco/pendência: sem commit/push (aguardando confirmação do dono); conferir no navegador com login
o dropdown em 320–390px e o dark no público e no admin (contraste do dourado); `avatarUrl`
desatualizado após edição em Corretores até o próximo login (sem refetch do `useAuth`).

Ajuste posterior (mesma sessão, a pedido do dono): foto do mobile reduzida para 32px dentro do
botão de 44px (toque preservado). Typecheck, lint e 6 testes do `AdminLayout` aprovados.

## 2026-09-13 — opencode — Commit e push `5f916cb` (mobile vitrine + menu + admin)

A pedido do dono: commit e push direto na `main` das alterações pendentes (menu mobile,
mobile do admin, mobile público vitrine, header do admin afinado + plano
`docs/plans/2026-09-13-mobile-public.md`) — 23 arquivos.

Testes executados antes do commit (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados.
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`).
- Sem segredo no diff (`.env`, `dist/`, `.vercel/` ignorados).

Commit `5f916cb` ("feat: mobile vitrine no público, menu navegável e admin afinado"),
push `4e928e4..5f916cb main -> main`, árvore limpa e sincronizada com `origin/main`.
`PROJECT_STATUS.md` atualizado: itens pendentes passaram a apontar os commits
(`71d809b` UX-003/UX-004, `4e928e4` Tailwind, `2d0d8ac` hambúrguer, `376219d` capa/decode,
`5f916cb` menu/mobile/vitrine/header).

Risco/pendência: conferências manuais no navegador seguem pendentes (mobile 320–390px,
desktop do hambúrguer, catálogo com capa e upload misto com a API no ar).

## 2026-09-13 — opencode — Header do admin afinado no mobile

Relato do dono com print: a parte de cima do painel estava muito grossa no mobile.

Causa: `AdminLayout` empilhava marca + nav scroll + linha do usuário com `py-[18px]`,
`gap-3.5`, links `min-h-11/p-3` e `mt-auto` na linha do usuário, que abria um vazio
entre a nav e o usuário.

Alterações em código (front apenas):

- `src/pages/admin/AdminLayout.tsx`: `aside` com `px-4 py-2.5 gap-2`; marca
  `text-[16px] leading-tight`; nav sem `pb` e com `gap-1`; links `min-h-10 px-2.5 py-1.5
  text-[14px]`; linha do usuário sem `mt-auto` no mobile (`lg:mt-auto` só no desktop);
  botão `Sair da conta` com `min-h-9 px-3 py-1.5 text-[13px]`. Desktop via `lg:` inalterado.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test -- --run src/pages/admin/AdminLayout.test.tsx`: 3 testes aprovados.

Risco/pendência: suíte completa e build não repetidos; conferir no navegador 320–390px.
Sem commit/push (aguardando confirmação do dono).

## 2026-09-13 — opencode — Menu mobile não abria (corrigido)

 relato do dono com print: após clicar no hambúrguer (virava X), nenhuma opção aparecia.

Causa: no `<nav>` de `PublicLayout.tsx`, `max-[650px]:hidden` (base) e `max-[650px]:flex` (quando aberto) ficavam ativos ao mesmo tempo; na ordem do CSS gerado o `hidden` vence o `flex`, então o menu nunca exibia.

Alterações em código (front apenas):

- `src/components/PublicLayout.tsx`: `max-[650px]:hidden` saiu da base e virou alternativa exclusiva — aberto usa `max-[650px]:flex`, fechado usa `max-[650px]:hidden`.
- `src/components/PublicLayout.test.tsx`: regressão — nav fechada tem `max-[650px]:hidden`; aberta tem `max-[650px]:flex` e não tem `hidden`; Escape volta a esconder.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test -- --run src/components/PublicLayout.test.tsx src/seo/navigation.test.tsx`: 2 arquivos, 3 testes aprovados.
- Conferência no navegador (390px, `npm run dev` com dados reais): hambúrguer abre o sheet navy com Encontrar um imóvel, Alugar, Comprar, Área do corretor e rodapé CRECI 15776; print salvo em sessão.

Risco/pendência: suíte completa e build não foram repetidos após este fix de uma linha (só typecheck, lint e os testes do menu). Sem commit/push (aguardando confirmação do dono).

## 2026-09-13 — opencode — Mobile do admin (MOBILE-001)

Tarefa: pedido do dono ("faça tbm") — estender o padrão mobile do público ao painel, sem mudar rotas, contratos ou validações.

Alterações em código (front apenas):

- `src/pages/admin/AdminLayout.tsx`: links de navegação com 44px (`min-h-11`) e `snap-start`; barra horizontal com `snap-x` + `overscroll-contain` e respiro nas bordas; botão `Sair da conta` com 44px no mobile.
- Cabeçalhos (`Dashboard`, `PropertyList`, `LeadsList`, `AgentsList`, `PropertyForm`, const `heading` em `Rentals.tsx`): `flex-wrap` + empilhamento em ≤560px com CTA full-width.
- Tabelas (`tableWrap` em `Rentals.tsx`, `Dashboard`, `PropertyList`, `LeadsList`, `AgentsList`): `overscroll-contain`.
- Links de ação com 44px: `actions` em `Rentals.tsx`/`PropertyList`/`LeadsList`/`AgentsList`, `Abrir ficha`, `Abrir contrato`, voltar (`Imóveis`, `cadastros`, `contratos`, `site`), proprietario/inquilino na ficha do contrato e links dos cartões do dashboard.
- Filtros em 1 coluna no ≤560px: `toolbar` em `Rentals.tsx` e busca de contatos em `LeadsList.tsx` (botões full-width).
- `src/components/MediaManager.tsx`: botões de mídia com 44px (`min-h-11`, padding 12px/8px em vez de 9px/5px).
- Rodapés de formulário com `flex-wrap` (`PropertyForm`, `formFooter` em `Rentals.tsx`, editor de corretor); lista de documentos sem recuo padrão; ficha da pessoa (`dl`) com espaçamento e quebra de linha.
- `src/pages/admin/Login.tsx`: link `Voltar ao site` com 44px.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos).

Risco/pendência:

- Conferência manual 320–390px com login pendente (navegação lateral, tabelas, filtros, formulário, mídias, locações).
- Sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado).

## 2026-09-13 — opencode — Mobile público vitrine (P0/P1+P2, sem admin)

Tarefa: implementar `docs/plans/2026-09-13-mobile-public.md` só no público, adaptado ao Tailwind (os `.module.css` do plano não existem mais).

Alterações em código (front apenas):

- `src/components/PublicLayout.tsx`: menu `inset-x-0` alinhado ao container (sem `-18px`), links com 48px em sheet navy serif 19px + rodapé `CRECI 15776`, backdrop + trava de scroll, Escape com retorno de foco; removido o `onClick` no `<nav>` que roubava foco (fechar só no link/botão/backdrop/Escape). Rodapé compacto no mobile com links de 44px e `safe-area`.
- `src/pages/public/Catalog.tsx`: h1 32px + `text-balance` e intro 16px/1.6 no ≤560px; vitrine `clamp(220px,62vw,300px)` sem `margin-right`, `::before` escondido no mobile com soleira ouro `inset` + placa navy `#0A2042CC`, `verticalText` escondido; busca em 1 coluna, controles 48px sem `border-bottom` mobile, labels 12px caixa-alta, botão `Buscar` full-width 48px, `Limpar filtros` 44px; vazio "Nenhum ponto com esse filtro — limpe a cidade ou o preço." com botão `Limpar filtros`; grid mobile com gap 28px; `hero-anim` fade-up 240ms.
- `src/pages/public/PropertyDetail.tsx`: removido `row-[1]` do `aside` (ordem galeria > fatos > descrição > contato); botão do card escondido no mobile, CTA sticky único navy (preço serif branco + `Falar com corretor` ouro) com `safe-area`; referência segue escondida no mobile.
- `src/components/PropertyCard.tsx`: aspect 4/3 no mobile, seta 44px, título 19px, preço com wrap/`anywhere` + sufixo `/mês`, soleira ouro 3px no link da imagem.
- `src/components/MediaGallery.tsx`: altura `clamp` no mobile, soleira ouro, contador pill 13px navy `#0A2042CC`, thumbs 72px com `snap-mandatory`/`snap-start` + `overscroll-contain`.
- `src/components/LeadFormModal.tsx`: botão `Falar com corretor` (verbo único do plano).
- `src/styles/global.css`: `touch-action:manipulation` em botões/links, `overflow-x:clip` no body, `fade-up` só sem `prefers-reduced-motion`.
- `src/seo/navigation.test.tsx` + `src/components/LeadFormModal.test.tsx`: ajustes aos novos rótulos (`getAllByRole` para os dois `Limpar filtros`, `Falar com corretor`).

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos); CSS `index-*.css` com 51,0 KB.
- `node scripts/seo-smoke.mjs`: aprovado (SSR, metadados, paginação, 404, discovery, proxy e função Vercel).

Risco/pendência:

- Conferência manual 360/390px pendente (menu, busca, grid, galeria, CTA sticky, modal lead, `robots.txt`, `sitemap.xml` e 404) com a API no ar; hero sem scroll-X em 320–390px e toques ≥44px a confirmar no aparelho.
- Sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado).

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

## 2026-09-14 — opencode — Hamburger fora do desktop

Pedido do dono: tirar o hamburger da versão desktop.

Causa: o botão usava `buttonGhost hidden max-[650px]:inline-flex`; o `.buttonGhost` do `global.css` (`display: inline-flex`, carregado depois do Tailwind) empatava com o `hidden` e o botão aparecia no desktop.

Alterações:

- `src/components/PublicLayout.tsx`: botão do menu sem `buttonGhost`, só com utilities (`hidden` + `max-[650px]:inline-flex` e estilo fantasma equivalente).
- `src/components/PublicLayout.test.tsx`: regressão — botão com `hidden`/`max-[650px]:inline-flex` e sem `buttonGhost`.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test -- src/components/PublicLayout.test.tsx`: 2 testes aprovados.

Risco/pendência:

- Conferir no navegador: desktop >650px sem botão, mobile ≤650px com botão.
- Commit `6c99b3c` na main (direto na `main`, a pedido do dono).

## 2026-09-14 — Codex: contexto da API integral sincronizado

Atualizados AGENTS.md, README.md, PROJECT_STATUS.md, TASKS.md, DECISIONS.md, PLANO-PROJETO-CORRETOR.md, corretor-spec.json e docs/handoffs/2026-09-14-backend-portugues.md; pedido preservado em docs/specs/2026-09-13-backend-integral.md. Histórico mantido. Nenhum código de UI alterado; .vscode/ preexistente preservada.

Backend irmão validado com typecheck/lint/build, 169 testes locais + 4 PostgreSQL/HTTP reais. Frontend não retestado nesta entrega documental. A API nova muda endpoints/DTOs/auth/classificação/contratos/financeiro: adaptação e testes ponta a ponta do frontend são pré-requisito de deploy conjunto. Sem commit/push/deploy. Workspace/Drive e novo upload R2 ainda exigem homologação real; banco publicado não migrado.
## 14/09/2026 — integração frontend ao contrato português

- Adaptados `src/services/api.ts`, `http.ts` e `portuguese.ts` para autenticação, DTOs snake_case, paginação `itens`, classificações UUID, clientes, imóveis e mídia.
- SSR, catálogo, URLs amigáveis, SEO, seletores dinâmicos e painel administrativo atualizados. Incluídos cadastros, clientes manuais, leitura interna de imóveis, contratos com status/retry do Drive e comissões com parcelamento e baixa confirmada.
- Telefones brasileiros normalizados para WhatsApp; edições preservam vínculos históricos inativos quando não alterados; uploads usam `arquivos`, limites 10/30/60 MiB e bucket público de mídia.
- Validação: `npm run typecheck`, `npm run lint`, `npm run build`, smoke SSR/Vercel e testes direcionados passaram; 120 testes passaram na suíte completa, com dois erros transitórios de worker/jsdom no Windows na última execução concorrente.
- Pendente: credenciais e homologação real do Drive compartilhado, complementos/backup para migração de dados e publicação coordenada. Nenhum segredo foi adicionado.


## 2026-09-14 — Codex: textos e botões legíveis
Alterados styles/global.css e tailwind.css; PublicLayout, PropertyCard, Catalog, PropertyDetail e Login. Resolvida prioridade de CSS global sobre utilities, aliases escuros, cores de ação, textos navy, legendas sobre navy/foto e fallback de imagem. Container conserva margens responsivas. Documentação atualizada sem apagar histórico.
Validação: typecheck/lint aprovados; 27 arquivos e 125 testes aprovados (worker único); build aprovado, avisos conhecidos Zod. Smoke SSR/metadados/paginação/404/robots/sitemap/proxy/Vercel aprovado em portas alternativas 4299/4280 porque 4199 estava ocupada. Cópia temporária do smoke removida. Axe WCAG AA sem violações de contraste em catálogo/login/detalhe nos dois temas; textos sobre imagens exigem análise manual e foram inspecionados por captura. Catálogo mobile 390px: container 354px, sem overflow horizontal. Painel autenticado não exercitado nesta sessão; controles compartilhados corrigidos, sem alegar homologação completa. Sem commit/push/deploy; .vscode preexistente preservada.


## 2026-09-14 — Codex: posição do botão de tema
PublicLayout.tsx: grupo à direita contendo nav e controles, tema após Área do corretor; marca/espaçamento compactos até 900px. Preservadas alterações anteriores de contraste. Atualizados PROJECT_STATUS, TASKS e DECISIONS.
Validações: typecheck e lint aprovados; 27 arquivos/125 testes aprovados. Navegador em 390, 768 e 1280px, claro/escuro: sem overflow horizontal, tema 44x44px, distância desktop 16px e mobile 8px. Menu abre com foco no primeiro link, Escape devolve foco, Shift+Tab/Enter alterna tema com foco visível. Capturas desktop/tablet conferidas. Sem mudanças de API, commit, push ou deploy; build não repetido nesta alteração restrita ao cabeçalho.


## 2026-09-14 — Codex: publicação Git autorizada
Dono solicitou commit e push das correções de contraste e cabeçalho na main. Revisão preserva texto navy no CTA dourado do detalhe (PropertyDetail sem diff final) e corrige formatação histórica em DECISIONS. .vscode fora do commit. Validação final aprovada: typecheck, lint, 27 arquivos/125 testes e build; diff --check limpo. Commit/push autorizados na main; sem deploy manual.

## 2026-09-14 — Codex: endurecimento dos testes E2E
Corrigidos os três pontos da revisão: o teste mobile agora percorre os links com Tab e confirma a classe `dark` após recarregar; helpers de escrita bloqueiam alvos fora de localhost sem `E2E_ALLOW_EXTERNAL=true`; README documenta a autorização explícita para homologação remota. A execução autenticada continua condicionada às credenciais e ao backend de teste.

## 2026-09-15 — Muse Spark: hidratação do tema corrigida (sem commit)
Sintoma do dono no `dev`: `Warning: Expected server HTML to contain a matching <circle> in <svg>` (lucide `Sun`/`Moon` no header do `PublicLayout`) seguido de `Hydration failed` repetido e `Switched to client rendering`.
Causa: `useTheme` com `useState(() => initialTheme())` — SSR pinta `light`/`Moon`, cliente com `dark` salvo pintava `Sun`/label "Ativar modo claro" já no primeiro render; React descartava o SSR.
Alterados `src/hooks/useTheme.ts` (estado inicial fixo `light`, preferência resolvida/aplicada em efeito único sem flash) e `src/hooks/useTheme.test.ts` (regressão: primeiro render `light` com `dark` salvo, converge para `dark`). `PROJECT_STATUS.md` e `DECISIONS.md` atualizados.
Testes executados (resultado real):
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 29 arquivos/143 testes aprovados.
- `npm run build`: aprovado (cliente + SSR + Vercel Build Output).
- `node scripts/seo-smoke.mjs`: aprovado (catálogo, detalhe, `/devs`, 404, `robots.txt`, `llms.txt`, `sitemap.xml`, proxy `/api`, função Vercel standalone).
Risco/pendência: conferir no navegador com `theme=dark` salvo (console sem erro de hidratação, ícone Sol, alternância/persistência); sem commit/push (aguardando confirmação do dono).
## 2026-09-15 — Codex: CSS disponível antes do bundle React

Sintoma: após recarregar `/devs`, o SSR aparecia por alguns segundos como HTML
sem estilos e só depois recebia o layout visual.

Causa raiz: as folhas de estilo eram imports de `src/main.tsx`; no dev, o Vite
as injetava somente após o carregamento do módulo JavaScript.

Alterações:

- `index.html`: links antecipados para `src/styles/tailwind.css` e `src/styles/global.css`.
- `src/main.tsx`: removidos imports CSS duplicados.

Validação: `npm run typecheck`, `npm test` (29 arquivos, 143 testes) e `npm run build`
aprovados. O HTML servido em desenvolvimento contém os stylesheets no `<head>` antes
do bundle; o build gerou `dist/client/assets/index-*.css` normalmente.

Pendente: conferir visualmente no navegador do dono após reload forçado, especialmente
em conexão lenta.

## 2026-09-15 — Codex: revisão final e correções preventivas

Corrigidos dois pontos encontrados na revisão da página `/devs` e do cabeçalho:

- `useTheme` agora preserva o tema resolvido quando o React StrictMode repete
  efeitos de montagem; regressão coberta em StrictMode.
- `http.ts` não emite `session-expired` para `Origem não autorizada.`; teste
  confirma a mensagem específica sem logout por evento.

Validação: typecheck, lint, suíte completa (29 arquivos, 143 testes), build e
`git diff --check` aprovados. Avisos do Rollup sobre comentários `@__PURE__` do
Zod permanecem preexistentes.
## 2026-09-15 — Correções de documentação, SEO e isolamento local

Atualizados `README.md`, `AGENTS.md`, `TASKS.md`, `PROJECT_STATUS.md`, `DECISIONS.md` e `.env.example` conforme os
scripts atuais, sem modo demonstração. `/devs` permanece acessível e SSR, mas entrega `noindex,follow` e não aparece
no sitemap ou no `llms.txt`. Criado `scripts/safe-origin.mjs`; `dev` e `preview` recusam API remota por padrão.

Testes direcionados executados: `scripts/safe-origin.test.ts` aprovado; regressões SEO ajustadas. Validação completa
fica registrada após executar typecheck, lint, testes, build, smoke e `git diff --check`. UX-001 cold start permanece
adiada. A remoção de `.buttonGhost` foi mantida fora desta entrega por ainda haver consumidores administrativos.
## 2026-09-15 — Hardening observado em teste externo

- Alterados `src/seo/server.tsx`, `scripts/runtime.mjs` e `src/seo/server.test.ts`.
- Headers adicionados: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`.
- Nenhum dado, registro, imóvel ou banco foi alterado; CORS da API não foi modificado.
- Validação pendente nesta etapa: typecheck, lint, testes e build.

## 2026-09-16 — Correção dos achados de segurança do proxy web

Alterados `scripts/runtime.mjs`, `src/seo/deployment.ts`, `src/seo/server.tsx` e testes
correspondentes. O proxy agora preserva headers defensivos contra valores conflitantes do
upstream e os envia também em falhas de conexão/configuração; os rewrites da Vercel recebem
a mesma política; `API_ORIGIN` HTTP é rejeitado em produção. O token de sessão já estava em
memória; não houve mudança em dados, banco, uploads ou CORS. Validação real aprovada: `npm run
typecheck`, `npm run lint`, `npm test` (31 arquivos/150 testes), `npm run build`, `git diff --check`
e `node scripts/seo-smoke.mjs`.
## 2026-09-16 — Codex — melhorias públicas e painel administrativo

Alterados formatadores, cartão/detalhe público, formulário de lead, metadados SEO, Dashboard, lista de contatos,
formulário de imóvel e testes correspondentes. Incluídos preço/m², total mensal, status visível, relacionados,
mapa lazy, máscara de telefone, honeypot, OG dimensions, KPIs, filtros/CSV e `beforeunload` para alterações não salvas.

Validação real: `npm run typecheck` aprovado; `npm run lint` aprovado; `npm test -- --maxWorkers=1 --reporter=dot`
aprovado (31 arquivos/155 testes); `npm run build` aprovado; `node scripts/seo-smoke.mjs` aprovado.

Pendências: datalist de cidades, duplicação completa, links adicionais do rodapé, dados reais de privacidade/logo
oficial e conferência manual autenticada. Ordenação de catálogo permaneceu fora do corte. E2E autenticado não foi
executado sem stack/banco/credenciais de teste.


## 2026-09-16 — Codex: conclusão do pacote público e administrativo

Este registro complementa e substitui o estado parcial anterior sem apagar o histórico.

- Catálogo: datalist deduplicado de cidades da página; filtros e URLs preservados. Cards com rótulos reservado/concluído.
- Detalhe/lead: preço por área válida, soma parcial de encargos com aviso sobre periodicidade do IPTU, relacionados com fallback,
  mapa sob demanda, máscara nacional preservando internacionais, honeypot antes do popup e payload sem campo extra.
- Rodapé configurável, Alugar/Comprar, 404 com atalhos/espaçamento; OG alt e dimensões só do asset conhecido.
- Dashboard com métricas/erros independentes, todas as páginas financeiras e soma exata de parcelas ativas em centavos.
- Contatos: imóvel pesquisável, período inclusivo Cuiabá, filtros aplicados no envio, origem informativa, mensagem expansível,
  exportação apenas da página aplicada com BOM/escaping e proteção contra fórmulas; dados antigos/carga/erro impedem download.
- Imóveis: duplicação com novo título/POST/slug da API e sem mídias; rascunho protegido; preview nova aba; proteção de saída/reload,
  navegação SPA e histórico. Data router criado uma única vez no navegador; SSR preservado.
- Conferência visual corrigiu descrição escura e cartão de contato/cabeçalho fixo. Plano e documentos de contexto dos dois repositórios atualizados.

Validação real:
- Typecheck e lint aprovados.
- Vitest: 38 arquivos / 211 testes aprovados (worker único). Mensagens render failed são do teste intencional de ErrorBoundary.
- Build cliente/SSR/Vercel aprovado; avisos de anotação PURE do Zod preexistentes.
- Smoke SSR/proxy/cookies/robots/sitemap/llms/404/função Vercel aprovado usando fixture local.
- Playwright em 127.0.0.1:4180: 15 aprovados, 22 não executados, zero falhas na execução final. Primeira execução teve 1 falha porque
  a fixture não implementava /saude; adicionada resposta sintética ao smoke e suíte repetida sem enfraquecer a asserção.
- Navegador Chromium: catálogo/detalhe/rodapé/404 em 390px e desktop, temas claro/escuro, máscara e modal, mapa carregado por clique,
  navegação da 404 para Alugar; sem erro de hidratação observado. Verificação de largura sem overflow horizontal.
- Revisão independente somente leitura: nenhum achado de alta prioridade.

Limites: painel autenticado/banco/Drive/R2 reais não homologados nesta entrega por ausência de E2E_STACK=teste e credenciais;
componentes administrativos exercitados com APIs simuladas nos testes. Dados reais de privacidade, logo e contato comercial
aguardam o proprietário. Origem não é filtro global porque a API atual não o aceita; ordenação adiada conforme plano.
Sem dependências novas, escrita em dados reais, commit, push ou deploy. Processo de QA local encerrado ao finalizar.

## 2026-09-16 — Dados reais de marca e logo

- Aplicados controlador, e-mail, endereço, WhatsApp, horário e CRECI informados pelo proprietário em `src/config/brand.ts`.
- Incorporado o logo oficial enviado em `public/assets/brand-logo.jpg` e usado no cabeçalho público.
- Rodapé passou a exibir o CRECI quando informado; política de privacidade deixa o modo preparatório ao receber os dados completos.
- Validação focalizada: `npm run typecheck` aprovado; testes de `PublicLayout` e `format` aprovados (2 arquivos/20 testes); `git diff --check` aprovado. Sem commit, push ou deploy.

## 2026-09-16 — Correção do ativo do logo

- Substituído o JPG vertical com espaço vazio por recorte horizontal em PNG, preservando o lockup enviado.
- Removido o `mix-blend` do cabeçalho para não alterar as cores do logo entre temas.
## 2026-09-17 — Regressão de segurança do JSON-LD

Adicionado teste em `src/seo/metadata.test.ts` para payloads armazenados em título e descrição de imóvel. O teste extrai o JSON-LD SSR, executa `JSON.parse()`, confirma a preservação textual e garante que `</script>` não aparece literalmente no conteúdo serializado; também verifica o escape HTML de título e descrição nas meta tags.

Decisão registrada em `DECISIONS.md`: manter escape contextual Unicode em `serialize()`, sem regex de remoção de tags, DOMPurify ou `JSON.stringify()` direto no HTML. Nenhum dado, banco, API ou configuração de rate limit foi alterado.

Validação real: teste direcionado aprovado (1 arquivo/4 testes), `npm run typecheck` aprovado, `npm run lint` aprovado, suíte completa aprovada (37 arquivos/178 testes), `npm run build` aprovado e `git diff --check` aprovado. `node scripts/seo-smoke.mjs` permanece bloqueado por asserção preexistente que usa query parameters legados (`purpose/type`) e espera redirect 301, incompatível com as rotas/parâmetros atuais em português; o smoke não foi alterado nesta tarefa.
