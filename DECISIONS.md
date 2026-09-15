# Decisões técnicas — corretor-web

Cada decisão registra a data, o motivo e o que **não** fazer. Antes de contrariar uma decisão, revise-a aqui
e registre a mudança com a nova data.

## 2026-09-11 — Front com SSR próprio, em vez de SPA pura

Decisão (implementada em `d4f6b2f`): as páginas públicas passam a ser renderizadas no servidor por um runtime
próprio em `src/seo/server.tsx` e `scripts/*.mjs`, com hidratação no cliente. O mesmo runtime responde
`robots.txt`, `sitemap.xml` e `llms.txt`, e faz proxy de `/api` para a API.

Motivo: catálogo e detalhe de imóvel precisam de HTML pronto, metadados e JSON-LD para indexação e para os
previews de link. Uma SPA entregaria página vazia ao rastreador.

Não fazer:

- Não acessar `window`, `document` ou `sessionStorage` durante a renderização de rota pública.
- Não voltar ao proxy do Vite: o `vite.config.ts` não tem mais `server.proxy`; quem faz o proxy é o runtime.
- Não indexar o painel: `/admin/*` fica fora do SSR e permanece `noindex`.

## 2026-09-11 — `/api` como caminho relativo, não domínio da API

Decisão: `VITE_API_URL=/api`. O navegador chama sempre o próprio domínio do front, e o servidor repassa para
`API_ORIGIN`, removendo o prefixo `/api`.

Motivo: mantém o cookie de refresh no domínio do front e evita configuração de CORS com credenciais entre domínios.

Não fazer:

- Não apontar `VITE_API_URL` direto para o domínio da API sem revisar cookie, CORS e `ALLOWED_ORIGINS` na API.
- Não colocar segredo em variável `VITE_*`: elas vão para o bundle do navegador.

## 2026-09-11 — Indexação desligada por padrão

Decisão: `SEO_INDEXABLE=false` até a publicação. Para liberar `index,follow`, o runtime exige `SITE_URL` e
`API_ORIGIN` em HTTPS, `NODE_ENV=production` e execução fora de preview.

Motivo: evita indexar ambiente de desenvolvimento, preview e modo demonstração.

Não fazer:

- Não ligar a indexação antes de ter domínio definitivo e API publicada em HTTPS.
- Não remover a checagem de preview: ela evita conteúdo duplicado.

## 2026-09-11 — `SITE_URL` é obrigatória para canonical e JSON-LD

Decisão: manter `SITE_URL` preenchida também em desenvolvimento (`http://127.0.0.1:5173`).

Motivo: descoberto na homologação. Sem `SITE_URL`, `buildSeo` não gera canonical nem o grafo JSON-LD,
e a página sai sem dados estruturados, sem erro visível.

Não fazer:

- Não deixar `SITE_URL` vazia ao testar SEO e supor que o recurso está quebrado.
- Não usar URL com caminho, usuário, senha ou query: o runtime aceita apenas esquema e host e lança erro caso contrário.

## 2026-09-11 — Sessão em memória, com refresh por cookie

Decisão (herdada e confirmada): o access token vive apenas em memória; a renovação usa o cookie `httpOnly`
enviado pela API, com uma única promessa de refresh compartilhada entre requisições simultâneas.

Motivo: evita token em `localStorage` e evita disparar renovações concorrentes.

Não fazer:

- Não gravar token em `localStorage`, `sessionStorage` ou cookie pelo front.
- Não criar um segundo caminho de renovação.

## 2026-09-12 — Modo demonstração removido do produto

Decisão: o modo demonstração foi **removido por inteiro**, a pedido do dono do projeto. Saíram `src/services/demo.ts`
(11 imóveis, 2 corretores e 4 leads fictícios), `src/services/demo.test.ts`, `.env.demo`, a variável `VITE_DEMO_MODE`,
os scripts `dev:demo`, `build:demo` e `preview:demo`, o campo `demo` de `SeoConfig`, o proxy de `api.ts`, os botões de
entrada fictícia no login, a faixa de aviso no site público, o sufixo "Demonstração" no painel e o comportamento
alternativo do formulário de contato. O front agora só fala com a API real.

Motivo: o produto vai ao ar com dados reais, e o dono não quer dado fictício no código. O `api.ts` ficou mais simples:
`export const api = realApi`, sem Proxy nem import dinâmico.

Substitui a decisão de 11/09/2026 ("Modo demonstração só por configuração explícita"), que fica revogada.

Não fazer:

- Não reintroduzir dados fictícios no código do produto. Dado de exemplo só em teste (`src/seo/fixture.ts` é o lugar).
- Não usar fallback de dados locais em falha de rede: a página de indisponibilidade é o comportamento correto.
- Se a demonstração voltar a ser necessária, discutir antes: ela deve ser um ambiente com banco próprio, não um
  ramo de código dentro do produto.

## 2026-09-12 — Identidade do site centralizada em `src/config/brand.ts`

Decisão: nome, logotipo, tagline, frase de rodapé, região de atuação e dados de privacidade vivem só em
`src/config/brand.ts`. Os 13 pontos que repetiam "Corretor Comercial" e "Mato Grosso" (títulos, descrições,
`og:site_name`, JSON-LD `Organization`/`WebSite`, `llms.txt`, logotipo do cabeçalho e hero do catálogo)
passaram a ler desse arquivo.

Motivo: a marca atual é um rótulo genérico de andaime. Trocar pelo nome real do negócio precisa ser uma
edição em um arquivo, não uma caçada por strings.

Não fazer:

- Não escrever nome de marca, região ou tagline direto em componente, título ou JSON-LD.
- Não preencher `brand.privacy` com dado inventado: enquanto `controller`, `contactEmail` e `address` estiverem
  vazios, a página `/privacidade` exibe o aviso de conteúdo preparatório, que é o comportamento correto.

## 2026-09-13 — Marca real Lucas Gobatto, só no front

Decisão: identidade `Lucas Gobatto — Corretor de imóveis — CRECI 15776`, região `Juara, Mato Grosso`,
paleta azul-marinho `#0A2042` + dourado `#C99B3F` + branco. `brand.ts` é a fonte única; `--green` foi
mantido como apelido do navy para não reescrever todos os módulos. JSON-LD usa `RealEstateAgent` com
`identifier: CRECI 15776`. O logotipo atual é um SVG inline aproximado; o PNG/SVG oficial com fundo
transparente enviado pelo dono entra em `public/assets/` quando chegar. Dashboard estilo Imobia é só
referência futura; Si9/Imonov seguem fora do escopo.

Motivo: o rótulo de andaime "Corretor Comercial / Mato Grosso" conflita com a marca enviada pelo dono
e o verde/creme atual não pertence a ela. A troca é exclusivamente visual no front.

Não fazer:

- Não mudar nada no back por causa do rebrand: sem migration, rota, DTO ou integração.
- Não usar dourado em texto corrido sobre branco (falha de contraste): dourado só em filetes, marcas e focos.
- Não reintroduzir "Corretor Comercial" ou `Organization` genérica no SEO.

## 2026-09-11 — Uma única branch: `main`

Decisão: o trabalho acontece direto na `main`, nos dois repositórios. No `corretor-api`, a branch `shura` foi
apagada por já estar contida na `main`. Este repositório sempre teve apenas a `main`.

Motivo: escolha do dono do projeto.

Não fazer:

- Não recriar branches paralelas sem combinar antes.
- Não commitar sem rodar `npm test`, `npm run lint` e `npm run typecheck`.
- Não commitar `.env` nem artefato de build.

## 2026-09-11 — Camada de contexto compartilhado entre agentes

Decisão: o repositório mantém `AGENTS.md`, `CLAUDE.md`, `PROJECT_STATUS.md`, `DECISIONS.md`, `TASKS.md`,
`CHANGELOG_AI.md` e `docs/handoffs/`, com o mesmo protocolo do repositório irmão.

Motivo: Codex e Claude não compartilham contexto entre sessões; o que precisa sobreviver fica versionado no Git.

Não fazer:

- Não trabalhar sem ler os arquivos de contexto.
- Não encerrar uma tarefa sem atualizar `PROJECT_STATUS.md` e `CHANGELOG_AI.md`.
- Não registrar segredo, token ou dado pessoal nesses arquivos.

## 2026-09-12 — Primeira entrega de administração de locações (Codex)

Escopo aprovado: cadastros PF/PJ de proprietários e inquilinos, dados bancários do proprietário, contratos e documentos privados. Acesso exclusivamente ADMIN, inclusive downloads. Um proprietário, um inquilino e um imóvel por contrato; início manual, sem importação e sem integração SI9/Imonov nesta etapa. Comissão aguarda definição do dono; não presumir a base nem implementar financeiro nesta entrega.

Padrões: NestJS/TypeORM e React/RHF/zod existentes, nenhuma dependência nova. Contatos, CPF/CNPJ, dados bancários e observações da ficha são cifrados com AES-256-GCM; notas do contrato também. Usa-se chave derivada com domínio próprio da LEADS_ENCRYPTION_KEY existente. Nomes permanecem pesquisáveis. Não trocar a chave sem procedimento de recifragem e backup: isso torna os campos anteriores ilegíveis.

Documentos: bucket privado separado, R2_DOCUMENTS_BUCKET opcional no boot. A variável deve apontar para bucket sem r2.dev, domínio público ou acesso anônimo, distinto de corretor-midia. O token S3 deve ter permissão nesse bucket. Sem variável, upload/download/exclusão falham com 503, sem fallback. Listagem de metadados continua disponível. Não colocar documentos de clientes no bucket público de mídia. PDF/JPEG/PNG, assinatura e limite de 10 MiB, download autenticado como attachment com no-store e nosniff. Upload compensado quando a gravação de metadados falha; monitorar e limpar órfãos caso a compensação também falhe.

Contratos: valores decimais exatos, datas civis, um ACTIVE por imóvel protegido por índice único e transação. Partes precisam ser do tipo correto e ativas para contratos não encerrados. Desativar pessoa com contrato ativo retorna 409. Encerrar contrato antigo continua permitido após mudança do imóvel para venda. Vencimentos 29–31 ficam apenas registrados; ajuste do calendário pertence à futura cobrança. Não excluir contratos nem apagar pessoas vinculadas; exclusão de imóvel vinculado é impedida por FK.

## 2026-09-12 — Comissão de captação equivalente a um aluguel (regra provisória)

O relato do dono indica que, ao fechar uma locação, o corretor recebe uma comissão equivalente a um aluguel, muitas vezes parcelada para o proprietário. A próxima etapa financeira adotará esse modelo configurável: total da comissão = um aluguel do contrato; número e vencimentos das parcelas são explícitos; cada parcela tem status pendente/paga e confirmação manual. O sistema exibirá total, recebido e saldo.

Não confundir essa comissão de captação com o repasse mensal do aluguel ao proprietário. Não presumir percentual, multa, juros, retenções, incidência tributária ou regra legal. A tela e a API devem marcar a regra como configurável e permitir validação/ajuste pelo ADMIN antes do uso operacional.

Operação: migration aditiva 1789257600000; não altera migrations anteriores e não roda automaticamente. Backup e validação do histórico do Neon são pré-requisitos de aplicação. Nenhum .env encontrado nos dois checkouts desta sessão; não foram reconstruídas credenciais nem escritos dados no Neon/R2. A migration de hardening preexistente 1789084805000 continua fora do data-source como estava: revisar seu histórico separadamente antes de aplicá-la, sem presumir que foi executada.

Correção de compatibilidade: mensagens do filtro global da API agora seguem string/lista em message, como esperado pelo front. Busca parcial por título foi adicionada somente ao DTO do catálogo administrativo para seleção de imóveis; contrato público/SSR preservado.

## 2026-09-13 — Atualizar o projeto Vercel de teste existente
Decisão: atender ao pedido de deploy publicando os arquivos locais no corretor-web-test via CLI com build remoto, preservando as variáveis e indexação bloqueada do ambiente. Motivo: o front e a API de teste já estão disponíveis; os registros antigos de ausência de deploy estão superados para teste. Não confundir target production da Vercel com autorização de lançamento comercial definitivo; não ligar indexação nem criar outro projeto. Sem commit/push nesta tarefa.


## 2026-09-13 — URLs públicas e indexação (Codex)
Plano aprovado: finalidades para-alugar/para-comprar e tipos salas/lojas/galpoes/predios/terrenos em /imoveis; cidade, preco-minimo, preco-maximo e pagina na query. Slugs estáveis e endpoints da API preservados. Aliases administrativos login -> entrar e leads -> contatos, com 301 no SSR e replace no cliente. Filtros continuam noindex,follow. Dono autorizou SITE_URL=https://corretor-web-test.vercel.app e SEO_INDEXABLE=true em Production da Vercel; API_ORIGIN existente deve ser HTTPS; previews bloqueados. Não alterar banco, storage ou permissões.

## 2026-09-13 — Tailwind CSS v4 como sistema de estilos (opencode)

Decisão: adotar `tailwindcss` + `@tailwindcss/vite` (devDependencies) com configuração CSS-first em
`src/styles/tailwind.css` (`@import "tailwindcss"`, `@theme` com navy `#0A2042`/gold `#C99B3F` e tokens
paper/ink/muted/line/soft/error, `@custom-variant dark` + overrides `.dark`, `@layer base`). Os 10
`.module.css` foram removidos; todos os componentes e páginas usam utilities. As classes globais legadas
(`container`, `button`, `buttonSecondary`, `buttonGhost`, `field`, `error`, `muted`, `eyebrow`, `srOnly`,
`skipLink`) permanecem em `global.css` até migração própria.

Motivo: padronizar tokens (incluindo dark), responsivo e acessibilidade num só sistema, eliminando
duplicação entre módulos e hex hardcoded do admin.

Não fazer:

- Não reintroduzir `.module.css` nem hex fora do `@theme` (use `bg-navy`, `text-gold`, `border-line`, etc.).
- Não usar `dark:` sem conferir contraste (dourado só em filetes/marcas/focos sobre branco).
- Não quebrar o SSR: componentes de rota pública seguem sem `window`/`document` no render; asserts de
  SSR devem casar `<h1[^>]*>` (h1 agora carrega classes).

## 2026-09-13 — Avatar do usuário e alternador de tema (opencode)

Decisão: o bloco do usuário no painel exibe o `avatarUrl` do `Agent` (foto HTTPS cadastrada em
Corretores, com inicial como fallback e troca silenciosa se a URL quebrar). No desktop o conjunto
avatar + nome + papel + "Sair da conta" fica no rodapé do `aside`; no mobile a foto fica no topo e
abre um dropdown (`aria-haspopup="menu"`, fecha em Escape/clique fora) com nome, papel e
"Sair da conta". O modo noturno, antes só preparado no CSS, ganha alternador visível no cabeçalho
público e no painel (topo no mobile, rodapé no desktop), via `useTheme`: persiste em
`localStorage "theme"`, respeita `prefers-color-scheme` sem escolha salva e aplica `.dark` no
`documentElement`; script inline no `index.html` evita flash. Rotas públicas seguem sem `window`
no render (o hook só toca o DOM em efeito).

Motivo: pedido do dono — avatar não aparecia e o modo noturno não tinha onde ser ligado.

Não fazer:

- Não buscar a foto de outro lugar: a fonte é `Agent.avatarUrl`, a mesma do detalhe do imóvel.
- Não exibir mensagem de erro por URL de foto quebrada: cair para a inicial.
- Não guardar outro estado de tema além de `localStorage "theme"` + `.dark` no `documentElement`.

## 2026-09-13 — Upload pula arquivo ilegível sem derrubar o lote (opencode)

Decisão: `prepareMediaFiles` relata arquivos ilegíveis via callback `onError` e retorna só os válidos (em ordem, com progresso contando todos); o `MediaManager` envia os válidos, avisa os nomes pulados e só bloqueia o envio quando nada é legível.

Motivo: o `createImageBitmap` rejeita com "The source image could not be decoded." para arquivo corrompido ou com extensão trocada, e o erro cru em inglês abria o lote inteiro.

Não fazer:

- Não reintroduzir falha total do lote por um arquivo ruim.
- Não exibir a mensagem original em inglês: o texto ao usuário cita o nome do arquivo em português.

## 2026-09-13 — Perfil em /admin/perfil via avatar (opencode)

Decisão: a foto do AdminLayout leva a /admin/perfil (link no desktop, item "Meu perfil" no dropdown do
mobile, dropdown preservado). A página mostra foto grande (96px, fallback da inicial, troca silenciosa se a
URL quebrar), dados (e-mail em leitura), métricas do próprio usuário, edição própria e troca de senha.
Rota registrada em `routes.profile` e no regex do `normalizedUrl`; painel segue
`noindex` e fora do SSR.

Motivo: pedido do dono — clicar na foto e ver foto maior + métricas.

Não fazer:

- Não indexar o perfil nem incluí-lo no sitemap: é /admin/*, fora do SSR.
- Não exibir mensagem de erro por URL de foto quebrada: cair para a inicial, como no side.

## 2026-09-13 — Métricas do perfil sem endpoint novo (opencode)

Decisão: as métricas usam os endpoints existentes (GET /admin/properties com o status? novo e
GET /admin/leads com createdFrom), 7 consultas limit=1 em paralelo. O escopo por usuário já vem da API
(ADMIN vê tudo, AGENT vê só o próprio), sem filtro no front.

Motivo: evita endpoint de stats e segue a regra de ouro (caber no padrão existente).

Não fazer:

- Não filtrar por gentId no front: a API já restringe pelo viewer; filtro duplo mascara bug de permissão.
- Não criar GET /admin/stats sem necessidade comprovada de desempenho.

## 2026-09-13 — E-mail só via Corretores/ADMIN (opencode)

Decisão: o perfil exibe o e-mail como leitura ("só o admin altera"); a troca é exclusiva da página Corretores
(ADMIN) via PATCH /agents/:id, que já trata o 409 de e-mail duplicado.

Motivo: e-mail é identidade de login com unicidade no banco; edição própria exigiria verificação de posse
do endereço novo, fora do escopo.

Não fazer:

- Não incluir email no PATCH /auth/me: o pipe da API devolve 400 e o front nem oferece o campo.

## 2026-09-14 — Hamburger sem buttonGhost no desktop (opencode)

Decisão: o botão do menu público não usa `buttonGhost`; usa só utilities (`hidden` + `max-[650px]:inline-flex` com estilo fantasma equivalente).

Motivo: o `.buttonGhost` do `global.css` (carregado depois do Tailwind) tem a mesma especificidade do `hidden` e vencia no desktop, exibindo o hamburger junto da navegação.

Não fazer:

- Não combinar `buttonGhost` com `hidden` em elemento que deve sumir no desktop.

## 2026-09-14 — Modelo integral português e corte coordenado (Codex)

Pedido integral de 13/09/2026 e escolha de Drive compartilhado pelo dono substituem o MVP anterior. Referência normativa: docs/specs/2026-09-13-backend-integral.md; execução e contrato: docs/handoffs/2026-09-14-backend-portugues.md.

- Domínio ativo em português, DTOs/colunas snake_case, auditoria universal; classificação dinâmica e tags relacionais. NestJS/TypeORM/class-validator permanecem, sem dependência nova.
- Exclusão lógica com ativo (inclui associações e finanças). Exceções técnicas: mídia excluída no R2/banco; refresh consumido/expurgado. Não apagar histórico de contratos nem simular consentimento em cadastro manual.
- Dados pessoais em colunas reais pesquisáveis. Cifra antiga é lida exclusivamente pela migração; conservar chave original até verificar os dados e o backup. Não usar criptografia de coluna no runtime novo.
- Contratos por ADMIN/intermediador, sem trava de finalidade. Partes são alteradas por ADMIN; corretor lê apenas as vinculadas aos próprios contratos. Receita é comissão de venda/locação informada manualmente, com até 600 parcelas; não presumir valor de um aluguel, repasse mensal, integração bancária ou comissão de corretor.
- Drive via Service Account em Drive compartilhado privado (escolha expressa do dono). Quatro GOOGLE_DRIVE_* juntas; OAuth/HTTP nativos, IDs reservados e retentativa sem duplicação. Falha externa preserva contrato com estado explícito. Sem credenciais reais, marcar homologação Workspace pendente.
- Migration nova preserva tabelas antigas em legado_20260913 e aborta se faltarem CPF/complementos reais. Clientes manuais explícitos suportam comissões antigas sem leads. Nenhum documento histórico do R2 é removido. Alterações aplicadas são imutáveis; não executar migration direto em produção sem backup/restauração validados e corte coordenado.
- Comandos de migration agora usam executor com logs sanitizados e MIGRACAO_BACKUP_ARQUIVO para escrita. Não imprimir QueryFailedError, SQL com parâmetros ou detalhes de linhas decifradas.
- Cookie Secure/Strict/HttpOnly em todos ambientes; desenvolvimento de navegador exige HTTPS. API nova é incompatível com o contrato frontend antigo: adaptar cliente, SSR e painel antes do deploy conjunto. Ajustar health check Render para /api/v1/saude nesse corte.
- Homologação usa database vazia homologacao_pt na branch Neon br-ancient-sound-a5tsf5rf, PostgreSQL 16.15; testes transacionais são revertidos. Banco/API publicados permanecem intactos. Manter branch de homologação identificada até o dono definir retenção.


## 2026-09-14 — Cascata e contraste dos controles
Estilos legados ficam em @layer components para que utilities explícitas prevaleçam. Container próprio permanece fora da camada para preservar margens frente ao container nativo do Tailwind. Navy permanece cor de superfície; texto adaptável usa brand. Botões primários usam tokens action/on-action: navy/branco no claro, dourado/navy no escuro. Não reutilizar navy fixo como texto em superfícies que escurecem, nem deixar eyebrow escuro sobre fotos/navy.


## 2026-09-14 — Tema junto à navegação pública
PublicLayout agrupa navegação e controles à direita em ordem DOM: links, tema, menu. Distância de 16px após navegação e 8px entre controles. Marca e espaçamento compactados até 900px para caber em tablets; menu preserva breakpoint de 650px. Não duplicar alternador nem alterar persistência do tema.

## 2026-09-14 — Playwright Test para ponta a ponta, Vitest preservado (Codex)

Decisão: `@playwright/test` **1.60.0 exato** em devDependencies (`tests/e2e/`, `playwright.config.ts`),
com projetos `chromium-desktop` (1280px) e `chromium-mobile` (390px, Pixel 7).
Vitest exclui `tests/e2e/**`; relatórios e `test-results/` estão no `.gitignore`.

Motivo: cobrir o que o Vitest não alcança — navegador + SSR + proxy `/api` + sessão
+ persistência juntos. Seletores por papel/nome acessível, esperas automáticas,
trace/screenshot/vídeo só em falha, dados sintéticos `e2e-*` com limpeza via API.

Não fazer:

- Não permitir `^1.60.0`: versões novas baixam Chromium inexistente nesta máquina
  (CDN bloqueado); o 1.60.0 reaproveita o Chromium 1223 já instalado.
- Não enfraquecer o cookie `Secure` nem apontar teste a produção: sem HTTPS local
  a sessão pós-reload cai para o login — o teste confirma esse comportamento real.
- Não declarar R2/Drive validados com mocks: falha do Drive é `FALHOU` explícito;
  homologação no Workspace é etapa externa separada.

## 2026-09-15 — Trava anti-produção e stack de teste declarado (Codex)

Revisão do dono mostrou que o `.env` local aponta `API_ORIGIN` à API de produção
e o banco local é o principal: leituras do E2E caíram em produção. Regra nova:

- `E2E_BASE_URL` fora de localhost aborta a suíte no carregamento do config (vale
  para todos os testes); remoto só com o domínio em `E2E_DOMINIOS_PERMITIDOS`.
  Bypass genérico (`E2E_ALLOW_REMOTE`/`E2E_ALLOW_EXTERNAL`) foi removido: alguém
  poderia liberar produção manualmente.
- Teste com backend exige `E2E_STACK=teste`, declarado só após subir API local
  com o banco de teste (via `DATABASE_URL` de homologação, sem editar `.env`)
  e SSR com `API_ORIGIN=http://localhost:3000`. Sem isso, pula — nunca executa.
- Limpeza completa via API com status verificado (contrato → comissão → imóvel →
  partes → cliente, soft-delete FK-safe); falha na limpeza falha o teste.
- `NODE_TLS_REJECT_UNAUTHORIZED=0` só no processo de teste (cert autoassinado);
  nunca no app.

Não fazer:

- Não rodar E2E com backend sem `E2E_STACK=teste`, mesmo para "só leitura".
- Não imprimir `DATABASE_URL` em log/comando: host e banco se conferem sem a
  credencial (verificação com URL mascarada).

## 2026-09-15 — Página pública /devs (Muse Spark)

Decisão: `/devs` é página pública estática (como `/privacidade`): sem fetch de API,
sem `window`/`document` no render, com título/descrição/canonical próprios,
`index,follow` quando `SEO_INDEXABLE=true` e entrada em `sitemap.xml` + `llms.txt`.
Dados em `src/config/devs.ts` (nome, usuário, perfil e avatar). Fotos via hotlink
dos avatares do GitHub informados pelo dono, com fallback para a inicial se a URL
quebrar. Links do Instagram abrem em nova aba (`target=_blank`, `rel="me noopener
noreferrer"`). Link público só no rodapé, fora do menu principal.

Motivo: pedido do dono com as duas fotos, nomes e @s (Eduardo Gobatto @e.gobatto,
Fernando Riad @_riad777, ambos "Front-end e back-end").

Não fazer:

- Não buscar `/devs` na API nem colocar a página no catálogo.
- Não exibir mensagem de erro por avatar quebrado: cair para a inicial.
- Não indexar fora da regra geral nem listar no sitemap quando `SEO_INDEXABLE=false`.

## 2026-09-15 — Header público fixo com CSS (Muse Spark)

Decisão: header do site público (`PublicLayout`) com `sticky top-0 z-40`, sempre
visível, só com classes Tailwind, sem JS e sem `window` no render (SSR preservado).
`bg-paper` opaco mantém o conteúdo passando por baixo sem vazar. Menu mobile
(`absolute top-[84px]`, backdrop `z-[4]`, sheet `z-[5]`) e CTA sticky do detalhe
(`z-[5]`) passam sob o header. Painel admin inalterado, por escolha do dono.

Não fazer:

- Não usar `fixed` (tira o header do fluxo e exige compensar altura no `main`).
- Não controlar visibilidade com scroll em JS nesta etapa: o pedido é "nunca sumir".

## 2026-09-15 — Refinos do /devs e do header mobile (Muse Spark)

- Avatares do `/devs` vendored em `public/assets/dev-*.jpg` (cópia dos avatares
  GitHub informados pelo dono), referenciados como `/assets/...` em `devs.ts`.
  Motivo: hotlink quebra sem aviso, vaza `Referer` e depende de terceiro; local
  sai no bundle do build e responde 200 pelo próprio domínio.
- Links GitHub (`githubUrl` em `devs.ts`) ao lado do Instagram em cada card, com
  `rel="me noopener noreferrer"` e `target=_blank`. Logins conferidos na API do
  GitHub: `Edu4rdo-Gobatto` e `SHURIKA6`.
- `h1` do `/devs` com `text-[clamp(32px,8vw,44px)]`: 44px no desktop, 32px em
  320px. O `44px` fixo anterior estourava a largura mínima.
- Backdrop do menu mobile (`z-[4]`) não cobre mais logo e controles do header:
  ambos com `relative z-[6]`, acima do backdrop e do sheet (`z-[5]`). Antes, com
  o menu aberto o alternador de tema era bloqueado (o clique caía no backdrop e
  só fechava o menu).
- `.container` é estilo sem camada (`global.css`); utility `max-w-[800px]` em
  camada perde para ele, então `container max-w-[800px]` nunca limitou a 800px.
  No `/devs`, `container` fica no `article` e a medida vai num `div` interno
  (`mx-auto max-w-[800px]`). O `/privacidade` tem o mesmo padrão morto e fica
  como pendência, fora deste escopo.

Não fazer:

- Não voltar a hotlink externo em página pública sem motivo e sem fallback.
- Não combinar `container` com `max-w-*` no mesmo elemento esperando limite.

## 2026-09-15 — Erro de sessão com mensagem conforme a causa (Muse Spark)
Causa raiz do `POST /api/autenticacao/renovar 403` no preview: o `.env` local
aponta `API_ORIGIN` à API de produção, cujo `ALLOWED_ORIGINS` não lista a
origem do preview — a API responde `{"message":"Origem não autorizada."}` via
`OrigemGuard` (comprovado por reprodução via proxy), antes de qualquer lógica
de sessão. O front tratava todo 401/403 do renovar como "sessão expirou", o
que era falso neste caso e derrubava o usuário ao login sem explicação.

Decisão: `refreshAccess` (`http.ts`) mantém a limpeza (token + `session-expired`),
mas quando o corpo é `Origem não autorizada.` a mensagem passa a ser "Esta origem
não é autorizada pelo serviço. Confira o endereço da API e entre novamente."
O 403 em si é comportamento correto da API e não há o que "corrigir" no proxy:
remover o `Origin` no repasse contornaria a proteção CSRF do guard.

Não fazer:

- Não remover nem reescrever `Origin`/`Sec-Fetch-Site` no proxy `/api`.
- Não adicionar origem `localhost`/`127.0.0.1` ao `ALLOWED_ORIGINS` de produção
  para "fazer o preview funcionar": sessão de produção a partir de máquina local.
- Não comparar a mensagem do guard por substring genérica: igualdade exata com
  o contrato atual da API irmã.

## 2026-09-15 — Tema com primeiro render igual ao SSR (Muse Spark)

Causa raiz do `Hydration failed` (`Expected server HTML to contain a matching
<circle> in <svg>` no `PublicLayout`): o SSR renderiza o tema `light` (ícone
`Moon`, sem `<circle>`), mas o `useState(() => initialTheme())` lia
`localStorage`/`prefers-color-scheme` já no primeiro render do cliente e
pintava `Sun` (com `<circle>`) quando o usuário tinha `dark` salvo — o
`aria-label` do botão divergia junto. O React descartava todo o HTML do SSR.

Decisão: o estado inicial do `useTheme` é sempre `light`, idêntico ao servidor;
a preferência salva é resolvida e aplicada num único efeito de mount, que nunca
remove a classe `.dark` que o script anti-flash do `index.html` já aplicou.
Leitura de `localStorage`/`matchMedia` e toque no DOM só em efeito, como já
exigia a decisão de SSR próprio. Persistência (`localStorage "theme"` + `.dark`)
e script anti-flash inalterados.

Não fazer:

- Não ler `localStorage`, `matchMedia` ou qualquer estado do navegador no
  `useState` inicial (ou no corpo do render) de componente de rota pública.
- Não "corrigir" com `suppressHydrationWarning` no botão de tema: mascara a
  divergência e mantém o descarte do SSR.
- Não separar em dois efeitos (sincroniza + aplica por `[theme]`): o aplica do
  mount rodaria com `light` e apagaria o `.dark` do script anti-flash,
  causando flash claro.
## 2026-09-15 — Folhas de estilo declaradas no HTML

Decisão: carregar `src/styles/tailwind.css` e `src/styles/global.css` por links
no `index.html`, removendo os imports equivalentes de `src/main.tsx`.

Motivo: o SSR entregava o conteúdo correto, mas o navegador pintava o HTML sem
estilos até baixar e executar o bundle React que injetava o CSS. O Vite processa
os links no desenvolvimento e os transforma em assets versionados no build.

Não fazer:

- Não voltar a carregar o CSS exclusivamente por imports JavaScript no entrypoint.

## 2026-09-15 — Sessão e tema durante efeitos duplicados

Decisão: uma resposta exata `Origem não autorizada.` limpa o token e retorna a
mensagem específica, mas não emite o evento `session-expired`; esse evento fica
reservado para expiração/rejeição real da sessão. O hook de tema preserva a
preferência já resolvida quando o React StrictMode repete o efeito de montagem.

Motivo: uma origem rejeitada não significa que a sessão expirou, e o replay do
StrictMode não deve causar flash de tema claro nem logout visual indevido.
## 2026-09-15 — SEO comercial e isolamento local

`/devs` continua público para acesso discreto pelo rodapé, mas é sempre `noindex,follow` e não entra em `sitemap.xml`
nem `llms.txt`, pois créditos técnicos não fazem parte do SEO white-label comercial. Os servidores `dev` e `preview`
recusam `API_ORIGIN` remoto por padrão e aceitam somente localhost/loopback; isso evita que desenvolvimento altere dados
de produção. Não criar bypass remoto genérico. O cold start (UX-001) foi adiado pelo proprietário.

Não remover SSR, proxy `/api`, autenticação ou o contrato da API. A limpeza de `.buttonGhost` fica separada porque o
painel ainda possui consumidores ativos.
