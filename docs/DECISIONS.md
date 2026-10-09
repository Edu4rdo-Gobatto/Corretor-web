# Decisões técnicas — corretor-web

Cada decisão tem data, o que vale e o que não fazer. Antes de contrariar uma decisão, registre a mudança com nova
data. O texto completo das decisões antigas está no Git (versões anteriores deste arquivo).

## Decisões em vigor

### 09/10 — Comissão, cadastros de contrato e slogan
- **Edição de comissão** reutiliza o formulário de registro e sempre envia `versao_registro`; 409 oferece
  "Recarregar ficha". Com recebimento ou arquivada, o diálogo mostra só observações (decisão do dono: ocultar, não
  desabilitar). Arquivar e reativar ficam na ficha, com confirmação; o checkbox "Comissão ativa" saiu do formulário.
- **Cadastros** na rota `/admin/cadastros/:categoria`, com grupos Imóveis e Contratos. Tipos de contrato e índices de
  reajuste não entram em `classificacoesPublicas` nem no SSR. Não guardar a categoria só em estado de componente.
- **Contrato** escolhe tipo e índice entre opções ativas; contrato legado precisa ser classificado para salvar
  (decisão do dono). Não voltar a aceitar índice como texto livre.
- **Slogan** padrão em `brand.slogan`/`brand.tagline`, usado no h1, no rodapé e no `<title>` da home; o smoke compara
  com ele. Não repetir o texto do slogan em componentes.


### Arquitetura e SSR

- **11/09 — SSR próprio.** Páginas públicas renderizadas em `src/seo/server.tsx` e `scripts/*.mjs`, com hidratação.
  O mesmo runtime responde `robots.txt`, `sitemap.xml` e `llms.txt`. Não acessar `window`/`document` no render de
  rota pública. O painel fica fora do SSR e com `noindex`.
- **11/09 — `/api` relativo.** `VITE_API_URL=/api`; o runtime remove `/api` e repassa a `API_ORIGIN`; na Vercel, o
  rewrite de `src/seo/deployment.ts`. Não apontar `VITE_API_URL` para o domínio da API sem rever cookie e CORS.
- **11/09 — Indexação desligada por padrão.** `SEO_INDEXABLE=true` só vale com `NODE_ENV=production`, fora de preview
  e com `SITE_URL` e `API_ORIGIN` em HTTPS. Em 13/09 o dono ligou a indexação na Production do projeto de teste.
- **11/09 — `SITE_URL` gera canonical e JSON-LD.** Sem ela, a página sai sem dados estruturados e sem erro. O
  `.env.example` deixa vazia; preencha ao testar SEO. Só esquema e host.
- **15/09 — `/devs` discreto.** Público, estático, sempre `noindex,follow`, fora do sitemap e do `llms.txt`.
  Avatares locais em `public/assets/dev-*.jpg`, sem hotlink.
- **15/09 — Trava de origem local.** `dev` e `preview` recusam `API_ORIGIN` remoto (`scripts/safe-origin.mjs`). Não
  criar bypass genérico.
- **15–16/09 — Headers de segurança.** `nosniff`, `DENY`, `strict-origin-when-cross-origin` e `Permissions-Policy`
  no SSR, no proxy (aplicados depois dos da API) e nos rewrites da Vercel. Sem CSP por enquanto. `API_ORIGIN` em
  produção exige HTTPS.
- **15/09 — CSS no `index.html`.** As folhas de estilo são declaradas no HTML, não importadas pelo JS.
- **16/09 — Slug validado antes da consulta.** Slug fora de `[a-z0-9-]{1,240}` vira 404 sem chamar a API.
- **17/09 — JSON-LD só por `serialize()`.** Nunca `JSON.stringify()` direto no HTML.
- **18/09 — Build sempre em produção.** `scripts/build.mjs` fixa `NODE_ENV=production`.
- **03/10 — 503 com recuperação.** `PaginaIndisponivel`, `CenaReparo` e `useRecuperacaoPagina`: HEAD da própria URL
  após 30s, uma por vez, limite de 50s; 200/404 recarregam. SSR com 10s por busca e 45s no total, `Retry-After: 30`.
  Não usar `/saude` para declarar recuperação.
- **03/10 — 404 com volta automática.** `CasaQuebrada` e volta ao catálogo em 8s só no cliente, com "Ficar aqui". O
  SSR responde 404 sem redirecionar.
- **03/10 — `dev` na rede local.** `HOST` com padrão `0.0.0.0`, para conferir no celular. Nunca expor na internet.

### Sessão

- **06/10 — Sessão de 4h por inatividade, regra da API.** JWT de acesso de 15 min. Cookie `corretor_renovacao`
  httpOnly, `SameSite=strict` e `secure`, sem `maxAge`: some ao fechar o navegador. Token fixo, sem rotação; o prazo
  se estende com o uso. Revogado no "sair", na troca de senha e no reset ou desativação pelo ADMIN.
- **11/09, revista em 03/10 — Front.** Token só em memória. Um 401 dispara uma única renovação compartilhada
  (`renovarSessao`), também usada pelo `ProvedorSessao` via `api.renovar()`. Falha 401/403 limpa o token e emite
  `session-expired`; "Origem não autorizada." limpa sem emitir o evento (15/09). Não há cronômetro no front. Não
  criar outro caminho de renovação nem guardar token fora da memória.

### Dados e domínio

- **12/09 — Sem modo demonstração.** O front só fala com a API real. Dado de exemplo só em `src/seo/fixture.ts`.
- **12/09 e 13/09 — Marca em `src/config/brand.ts`.** Lucas Gobatto, CRECI 15776, Juara/MT, contato e privacidade.
  Nada de marca escrita direto em componente. Dourado nunca como texto sobre fundo claro.
- **14/09 — Modelo em português da API.** Dados pessoais em colunas sem cifra; documentos de contrato em pasta do
  Google Drive compartilhado; comissão informada manualmente, com até 600 parcelas.
- **16/09 — Contrato v2.** Tipos e serviços em português (`snake_case`), ids inteiros, cadastro único em
  `/admin/pessoas`, cargos ADMIN e CORRETOR. Endereços antigos (`/admin/clientes`, `/admin/proprietarios`,
  `/admin/inquilinos`, `/admin/leads`, `/admin/login`) redirecionam. Não criar um segundo vocabulário.
- **13/09 — Métricas sem endpoint novo.** Perfil e Visão geral usam `/admin/imoveis` e `/admin/pessoas` (com
  `criado_desde`) com `limite=1`. O escopo por cargo vem da API; não filtrar de novo no front.
- **13/09 — E-mail só pelo ADMIN.** O perfil mostra o e-mail em leitura; `PATCH /autenticacao/eu` não envia e-mail.
- **06/10 — Foto do corretor.** Fonte `Corretor.url_foto`; exibição por `urlFotoCorretor` (rota
  `/corretores/:id/foto` da API). Upload no `PATCH /autenticacao/eu`; `url_foto` não editada não é reenviada. Foto
  quebrada cai para a inicial.
- **13/09 — Upload tolerante.** `prepararMidia` pula arquivo ilegível e avisa em português; `GerenciadorMidia` envia
  os válidos. Imagens são comprimidas no navegador.
- **16/09 — Sem `/stats`.** KPIs reutilizam listagens. Comissões somadas em centavos com BigInt. CSV exporta a página
  aplicada, com fórmulas neutralizadas. Datas de contato incluem o dia final em America/Cuiaba.
- **18/09 — Formulário de imóvel com classificações públicas.** CORRETOR não chama `/admin/tipos-imovel` e afins;
  Cadastros é só do ADMIN.
- **03/10 — Catálogo persistente.** 12 imóveis ilustrativos no Neon, fotos da Unsplash porque o R2 público respondeu
  401. Não abrir o bucket sem decisão de infraestrutura.
- **06/10 — Reabertura de contato só para ADMIN, no front.** Regra em `src/servicos/pessoas.ts`; a API não a impõe.
- **09/10 — CRECI único.** `servicos/creci.ts` + `CampoCreci`, mesma regra da API (`^\d+[JF]?$`). Legado não editado
  não é reenviado.
- **09/10 — Vários tipos e clientes elegíveis.** O catálogo envia `tipo_id` em CSV. A comissão usa
  `GET /admin/comissoes/pessoas-elegiveis` e revalida o cliente antes do POST.

### Interface

- **13/09 — Tailwind 4 CSS-first.** Tokens em `src/styles/tailwind.css`; sem `.module.css` e sem cor literal fora do
  `@theme`. Classes legadas em `global.css`, dentro de `@layer components` (14/09).
- **13/09, revista em 15/09 — `useTema`.** Preferência em `localStorage "theme"` e classe `.dark`; primeiro render
  sempre claro, igual ao SSR; script anti-flash no `index.html`.
- **16/09 — Chips e rolagem.** Estados de chip exclusivos (`chipIdle`/`chipSelected`). `RolarAoTopo` não rola entre
  caminhos de `caminhosCatalogo`; a paginação rola até `#catalogo`.
- **18/09 — Modais e grades.** Todo modal usa `Dialogo` (centralizado, tamanhos 480/640/880, rodapé fixo). Grades do
  painel e dos modais por container query.
- **18/09 — Logo por tema.** Variantes WebP geradas por `scripts/gerar-logo.mjs`; o PNG original não é exibido.
- **06/10 — Ícones Material Symbols inline** em `Icones.tsx`. `lucide-react` só para GitHub e Instagram.
- **09/10 — Paleta atual (`tailwind.css`).** Claro: fundo `#dce5f0`, superfície `#eaf0f7`, campo `#e2eaf4`, suave
  `#cfdceb`, texto secundário `#4b5a70`, borda de controle `#63758e`, linha `#b6c5d8`, linhas alternadas
  `#e4ebf4`/`#d8e2ef`, linha em foco `#c7d7ea`, cabeçalho de tabela `#ccd8e7`. Ação do painel `#b3892d`, hover
  `#a37d29`. Escuro: fundo `#182d50`, superfície `#1f3761`. Variáveis antigas do `:root` apontam para os tokens.
- **03/10 — Ações discretas.** `AcaoIcone` com alvo de 44px, dica e nome acessível. `Campo` liga rótulo, dica e erro.
  `ConfirmarAcao` não fecha sozinho: o consumidor fecha após sucesso.
- **06/10 — Painel.** Estilos em `.painel-ui`; escala 28/22/18/16/14; fichas em telas próprias; `CampoNumero` mantém
  texto e converte nos adaptadores; `Dialogo` com `alterado`/`ocupado` (Esc + Esc ou Enter descarta); único atalho
  Ctrl/⌘+K.
- **06/10 — Navegação do painel.** Esc volta à página anterior; sem histórico, à lista e depois à Visão geral.
  `SeletorFiltro` nos filtros; menu mobile em tela inteira; cabeçalhos com `.linha-nav`.
- **06/10 — Contatos em abas.** Pendentes, Atendidos e Finalizados, com páginas independentes e CSV da página.
  Filtros automáticos por `useFiltrosAutomaticos`: seleção imediata, texto após 350 ms.
- **09/10 — Esc e voltar em todas as telas.** `BotaoVoltar` em toda tela com retorno. No site e no login, Esc fora do
  catálogo leva ao início. Regra única em `escPodeVoltar`.
- **09/10 — Ações de lista só com ícone.** WhatsApp, Editar, atendimento e arquivar viram `AcaoIcone` nas listas.
  Fichas, formulários, confirmações, ações financeiras e site público conservam texto.
- **09/10 — `BlocosPainel`.** `SecaoPainel`, `GradePainel`, `DadosFicha` e `DadoFicha`: título externo, mesma altura
  por linha, 2 colunas a partir de 44rem e 3 a partir de 70rem de container. Ações da tabela desktop numa linha.
- **09/10 — Foco de navegação.** `data-foco-navegacao` tira o contorno só de destinos não interativos.
- **02–03/10 — `/devs`.** Intro em `Dialogo` com obra animada e três MP3 CC0 locais; tenta tocar ao abrir e cai para
  o botão se o navegador bloquear. Nada de áudio fora do `/devs` nem depois de fechar.

### Processo

- **11/09 — Só a `main`.** Sem branches paralelas. Confirmar com o dono antes de commitar.
- **11/09 — Contexto entre agentes.** `AGENTS.md`, `CLAUDE.md`, `PROJECT_STATUS.md`, `TASKS.md`, `DECISIONS.md` e
  `CHANGELOG_AI.md` versionados. Sem segredo nem dado pessoal neles.
- **13/09 — Um projeto Vercel de teste.** Atualizar o `corretor-web-test`; não criar outro.
- **04/10 — Documentação plana em `docs/`.** Sem subpastas e sem `.claude/`. Os prompts de agente ficam em
  `docs/*.md` como referência.
- **04/10 — Suíte mínima.** 3 arquivos em `src/servicos/` (23 testes desde 06/10). Não ampliar sem pedido. QA extra é
  efêmero, em `artifacts/`, e não equivale a homologação real.

## Substituídas

| Data | Decisão antiga | Substituída por |
|---|---|---|
| 12/09 | Dados de locação cifrados (AES-256-GCM) e `R2_DOCUMENTS_BUCKET` | Colunas sem cifra e Google Drive (14/09) |
| 12/09 | Comissão de captação igual a um aluguel | Comissão informada manualmente (14/09) |
| 13/09 | `Agent.avatarUrl`, `useTheme`, `AdminLayout` com dropdown | `Corretor.url_foto`, `useTema`, `LayoutPainel` |
| 14–15/09 | E2E com Playwright em `tests/e2e/` e variáveis `E2E_*` | Removido com as suítes em 03/10 |
| 15/09 | `/devs` indexável, no sitemap, com fotos por hotlink | `noindex,follow` e avatares locais (15/09) |
| 15/09 | Som do `/devs` sintetizado com Web Audio | MP3 CC0 locais (03/10) |
| 16/09 | Contatos em três colunas, filtros só ao enviar | Abas e filtros automáticos (06/10) |
| 18/09 | Paleta clara com fundo `#ebf1f9` | Paleta de 09/10 |
| 18/09 | `api.renovar()` como caminho de renovação separado | `renovarSessao` único (03/10) |
| até 06/10 | Renovação com rotação do token e cookie de 30 dias | Sessão de 4h por inatividade, sem rotação (06/10) |
| 03/10 | "Não recriar suítes" | Suíte mínima de 04/10 |
| 03/10 | Bootstrap 503 sem recuperação automática | `PaginaIndisponivel` + `useRecuperacaoPagina` (03/10) |
| 05/10 | Trilho de ícones sem nome, tooltips centrais, fichas em modal, `/`, `?`, Ctrl+Enter | Revertido pelo dono em 06/10 |
| 06/10 | Sidebar de "conforto" com hover `#b18424` e tabelas a 52rem | Revertido em 06/10; hover atual `#a37d29` |
| 06/10 | Esc sempre volta à lista ou à Visão geral | Página anterior do painel (06/10) |
| 06/10 | Duas filas em Contatos | Três abas (06/10) |
