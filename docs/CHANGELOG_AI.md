# Histórico de trabalho dos agentes — corretor-web

**Regra:** a partir de 09/10/2026 este arquivo só recebe acréscimos. Cada entrega nova entra no fim, com data,
agente, arquivos, testes executados com o resultado real e pendências. Não reescreva entradas anteriores.

O histórico até 09/10 foi condensado por período em 09/10/2026. O detalhe completo continua no Git (versões
anteriores deste arquivo e mensagens de commit). Contagens de testes antigas descrevem a suíte daquela época.

## Resumo por período

### 11–13/09/2026 — Base, marca e ambiente de teste
- **Entregue:** sincronização com o SSR próprio (`d4f6b2f`); camada de contexto entre agentes; modo demonstração
  removido; marca centralizada em `src/config/brand.ts` e depois trocada para Lucas Gobatto (CRECI 15776, Juara/MT);
  Tailwind 4 no lugar dos CSS Modules; mobile público e do painel; tema escuro com alternador; perfil com troca de
  senha; URLs públicas em português com redirecionamento 301; primeira administração de locações (substituída em
  14/09). Projeto Vercel de teste `corretor-web-test` publicado.
- **Validação:** typecheck, lint, build e smoke do SSR a cada entrega; vitest subiu de 64 para 109 testes.
  Homologação em 11/09 com API, Neon e R2 reais (login pelo proxy, SSR de imóvel, lead com consentimento).

### 14–18/09/2026 — Contrato em português e contrato v2
- **Entregue:** front integrado ao modelo em português da API (serviços, sessão, classificações, mídia, contratos,
  Drive, comissões); contraste dos temas; E2E com Playwright (removido em 03/10); `/devs`; header fixo; correção de
  hidratação do tema; CSS no `index.html`; headers de segurança no SSR e no proxy; validação do slug antes da consulta;
  contrato v2 com ids inteiros e cadastro único de pessoas; pacote público/painel (KPIs, CSV, duplicação, guarda de
  navegação); escape no JSON-LD; build sempre em produção, `Dialogo` centralizado, grades por container, paleta mais
  confortável e logo por tema.
- **Validação:** typecheck, lint, build e smoke do SSR; vitest chegou a 37 arquivos e 177 testes em 16/09. E2E
  autenticado nunca rodou completo por falta de credenciais de teste.

### 02–04/10/2026 — Auditoria, suítes e catálogo real
- **Entregue:** auditoria full stack A01–A11; easter eggs do `/devs` (obra com áudio) e 404 com casa quebrada;
  correções da auditoria (sessão, formulário de imóvel, telefone, contatos, comissão, características); remoção de
  todas as suítes de teste a pedido do dono (03/10); refinamento do público e do painel com `AcaoIcone`, `Campo`,
  `Aviso` e `ConfirmarAcao`; 503 com `PaginaIndisponivel`, `CenaReparo` e recuperação automática; carga de 12 imóveis
  e 36 fotos no Neon; `dev` em `0.0.0.0`; suíte mínima recriada e documentação reunida em `docs/` (04/10).
- **Validação:** até 03/10, 43 arquivos e 231 testes; depois da remoção, `npm test` saía com 1 por falta de arquivos.
  Em 04/10, 3 arquivos e 21 testes. Smoke do SSR aprovado na época. QA de navegador com API simulada.

### 05–06/10/2026 — Área do Corretor
- **Entregue:** a refatoração de 05/10 e a "revisão de conforto" de 06/10 foram revertidas pelo dono em 06/10. A
  partir da base visual `a2a9f81` do parceiro: Contatos, ajustes da revisão (seletores, Esc pelo histórico, menu
  mobile, cards), conclusão da especificação (fichas em telas próprias, `CampoNumero`, guarda de modal, Ctrl/⌘+K),
  cabeçalhos com `.linha-nav`, Contatos em abas, foto de perfil por upload e filtros automáticos. Na API, sessão de 4h
  por inatividade sem rotação (`46f2235`) e upload da foto (`86ecf29`). Publicado no Git em `ea94f84`, `157c21f` e
  `2b3e27b`.
- **Validação:** typecheck, lint, build e testes (21; 23 desde `2b3e27b`). QA Chrome com API simulada: até 320
  cenários e 140 capturas. R2 real conferido com objeto temporário. Sem homologação de perfil real, Safari/iOS ou
  celular físico. O `2b3e27b` mudou o h1 do catálogo e quebrou o `seo-smoke.mjs`.

### 08/10/2026 — Foto de perfil publicada
- **Entregue:** diagnóstico do 404 em `/api/corretores/:id/foto` (Render em `e3b0a32`) e deploy manual de `86ecf29`
  no Render.
- **Validação:** foto respondeu 302 e depois 200 `image/jpeg`; `/api/v1/saude` ok.

### 09/10/2026 — Padronização do painel e seis pontos
- **Entregue:** ficha do imóvel em notas com títulos externos; padronização do painel com `BlocosPainel`; ações de
  lista só com ícone; `BotaoVoltar` e Esc em todas as telas; sem contorno nos destinos de foco; ações da tabela numa
  linha no desktop; seis pontos (setinhas, CRECI, tema claro, vários tipos, `content.js`, clientes da comissão).
  Publicado no Git até `aa4de75`.
- **Validação:** typecheck, lint, build e 23 testes. QA com API simulada (270 cenários de layout, 49 de formulários)
  e QA de 63 cenários contra a API com Postgres descartável. Smoke do SSR só numa cópia efêmera com o h1 atual.
- **Documentação:** docs reescritos para o estado atual; `PLANO-PROJETO-CORRETOR.md` apagado.

## Entradas novas

<!-- Acrescente abaixo, da mais antiga para a mais nova. -->

## 09/10/2026 — Comissão editável, cadastros de contrato e slogan (Claude)

Entregue (o código entrou no `40f635b`, commit do dono enviado à `origin/main`; docs e spec sem commit; sem deploy):
- Comissão: edição completa com `versao_registro`, só observações após recebimento ou arquivada, conflito 409 com
  recarga, arquivar/reativar confirmados e histórico do plano na ficha.
- Cadastros em `/admin/cadastros/:categoria`, grupos Imóveis e Contratos, formulários de índice de reajuste e tipo
  de contrato, ficha que volta para a categoria (botão, Esc e navegador).
- Contrato: selects de tipo e índice, orientação sem opções, legado classificado, snapshot na ficha.
- Slogan padrão em `brand.ts` no h1, rodapé e `<title>`; smoke atualizado (SMOKE-001).

Arquivos: `src/servicos/{api,locacoes}.ts`, `src/tipos/index.ts`, `src/App.tsx`, `src/hooks/useVoltarPainel.ts`,
`src/config/brand.ts`, `src/seo/metadata.ts`, `src/paginas/publico/Catalogo.tsx`, `src/paginas/painel/`
(`EditoresComissao`, `DetalheComissao`, `Contratos`, `DetalheContrato`, `Cadastros`, `FichaClassificacao`,
`EditorClassificacao`, `esquemaLocacao`, novos `EditorCadastro`, `EditorCadastroContrato`, `categoriasCadastro`),
`scripts/seo-smoke.mjs`, `tests/visual/api-simulada.ts` (só tipos), `corretor-spec.json` e documentação.

Validação: typecheck e build aprovados; lint com 0 erros e 2 avisos que já existiam (`Catalogo.tsx`); `npm test` 23/23;
smoke de SSR aprovado. Navegador com a API completa e PostgreSQL descartável: 37/37.

Pendências: DEPLOY-20261009, depois da MIGRATION-20261009 da API.

### 13/10/2026 — Filtros do painel (Claude)
- **Entregue:** UX-007 (filtros e página na URL via `src/hooks/useParametrosLista.ts`), LIMPEZA-001 e 002, UX-008
  (`src/componentes/BarraFiltros.tsx` em Imóveis, Pessoas, Contratos, Contatos, Comissões e Cadastros; sem botão
  Buscar; Limpar na faixa de chips; Contratos ganhou chips). `estilos.barraFiltros`/`acoesFiltros` removidos.
- **Validação:** `typecheck`, `lint` e `build` passam. Testes não executados por pedido do dono; sem QA de navegador.
- **Revisão de lacunas (13/10):** página na URL passou a `replace` (Esc continuava percorrendo páginas);
  `useFiltrosAutomaticos` ganhou `externos` para o campo acompanhar a URL ao clicar no menu ou voltar; em Contatos,
  trocar de aba logo após digitar não apaga mais a busca (`definirFiltros` parcial).
- **Pendências:** conferência visual por tela (ADMIN e CORRETOR, 320/768/1440, dois temas).

### 16/10/2026 — Exibir no site, foco e gaps da revisão (Claude)
- **Entregue (web):** interruptor "Exibir no site" no cabeçalho de Editar imóvel (`src/componentes/InterruptorSite.tsx`),
  imediato; Arquivar/Desativar removidos de `Imoveis.tsx` e `DetalheImovel.tsx`; destaque removido do front;
  Situação de volta em Apresentação; seções 01–06 em círculo igual ao `BotaoVoltar` (`estilos.numeroSecao`); barra
  de salvar com texto de 18px e fundo `--color-barra-estado`; erro de campo só com ícone e borda; "Exclusividade
  válida até" removida; foco só por cor de borda em `--color-acao-painel-hover`; `data-foco-navegacao` removido;
  `Offer.availability` e descrição de SEO por situação (`src/seo/metadata.ts` + `metadata.test.ts`).
- **Entregue (API, `Corretor-API`):** `RESTRICAO_PUBLICA = 'imovel.ativo = true'`; detalhe e contato público só
  exigem `ativo`; testes novos `imoveis.service.spec.ts` e `pessoas.service.spec.ts`.
- **Validação:** web `typecheck`, `lint`, `build` e `npm test` (4 arquivos, 25 testes) passam; `node
  scripts/seo-smoke.mjs` passa. API `lint`, `build` e `jest` (3 suítes, 8 testes) passam; o teste de contato falha
  contra a regra antiga (conferido). API local em `--watch` com o Neon, só leitura: `/imoveis` foi de 7 para 9
  itens (entraram um Alugado e um Reservado). Preview SSR: `/` 200, detalhe do Alugado 200 com `SoldOut` e
  "Imóvel alugado: Casa em…", `robots.txt` 200, `sitemap.xml` 200 (vazio porque `SEO_INDEXABLE=false` local),
  rota inexistente 404. Capturas no Chrome do cartão "Alugado" e do detalhe "Indisponível" com contato. Foco
  medido no Chrome: borda `rgb(163,125,41)`, `outline: none`.
- **Não verificado:** painel real logado (toggle, listagem, ficha, barra), tema escuro e celular; nenhum dado do
  Neon foi alterado; produção não foi usada.
- **Pendências:** VISUAL-20261016; publicar a API antes do web (PUBLICAR-20261016).

### 16/10/2026 — Celular: barra de salvar e interruptor (Claude)
- **Causa:** no celular o `<p>` da barra de salvar tinha `flex-1` (base 0) dentro de `.superficie-painel`, que usa
  `overflow-wrap: anywhere`; a largura mínima caía para uma letra e o texto aparecia vertical ao lado dos botões.
- **Entregue:** até 520px a barra vira coluna (texto na largura toda; "Salvar imóvel" e "Voltar" lado a lado, o primário
  com o dobro da largura e alturas iguais); a legenda do interruptor "Exibir no site" fica só para leitores de tela
  (`aria-describedby`); no desktop nada muda. Arquivos: `src/styles/global.css`, `src/paginas/painel/FormularioImovel.tsx`.
- **Validação:** `typecheck`, `lint`, `build` passam. Capturas no Chrome com o CSS compilado e o mesmo HTML do
  formulário em 390px (claro), 360px (escuro) e 1280px: sem letras empilhadas, rótulo longo "Salvar imóvel e enviar
  mídias" em 2 linhas, desktop igual ao anterior.
- **Não verificado:** painel real logado em celular físico ou DevTools.

### 16/10/2026 — Seletor único e cadastro de Cidades (Claude)
- **Entregue:** `SeletorFiltro` virou `Seletor` (erro, dica, obrigatório, placeholder, id fixo, ref, efeito isomórfico,
  clique na barra de rolagem não fecha); `CampoSelecao` + `valorSelecao.ts`; os 15 `<select>` nativos migrados
  (Imóvel 6, Contratos 3 + placeholder de carregamento, Pessoa 3, Comissão 1, Corretor 1); categoria Cidades em
  Cadastros (editor com Estado, lista e ficha com UF); Estado → Cidade no imóvel; filtro de Cidade do catálogo pelo
  cadastro; `/cidades` no SSR e no smoke; specs e docs.
- **Validação:** `typecheck`, `lint`, `build`, `npm test` (6 arquivos, 30 testes; novos: `valorSelecao`, cidades do
  imóvel) e `node scripts/seo-smoke.mjs` passam. Harness no Chrome com o `Seletor`/`CampoSelecao` reais e o CSS
  compilado, 390px claro e 1280px escuro: 14/14 cenários (erro com ícone, foco no primeiro inválido, clique, check,
  Esc, digitação + Enter, reescolher sem efeito, estado limpa cidade, lista longa dentro da tela, número no envio,
  lista por cima de `<dialog>` modal). Os únicos erros de console foram 404 das fontes no servidor do harness.
- **Não verificado:** painel real logado; catálogo com a API nova antes da migration no Neon.
- **Pendências:** PUBLICAR-CIDADES-20261016.

### 16/10/2026 — Restauração dos testes permanentes (Codex)
- **Autorização e preservação:** plano aprovado em 15/10; trabalho direto na main. Base inicial sincronizada em
  `0dedf02`, retomada sobre `0513cc9`, preservando seletor único, cidades, publicação e testes novos do parceiro.
  Relatório original e histórico documental preservados, inclusive no arquivo integral de 15/10; nenhum commit,
  push, deploy ou acesso a dados reais.
- **Entregue:** testes HTTP/cache/API, validação, embeds, SEO e filtros automáticos; quatro specs Playwright,
  API simulada estrita para browser/SSR, sete projetos e 32 referências; scripts de build/execução/atualização
  explícita; workflow Windows 2025/Node24. Dev-deps restauradas: React Testing Library e jsdom.
- **Correções reproduzidas:** `servicos/cache.ts` inicia TTL do resultado na resolução, mantendo a promessa
  pendente compartilhada; `servicos/http.ts` oculta mensagem interna de 5xx da renovação; `painel/Entrar.tsx` usa
  um único redirecionamento para o destino protegido; `FiltrosCatalogo.tsx` corrige a precedência da borda de foco.
- **Arquivos:** novos `*.test.ts/tsx` nas áreas acima, `tests/visual/` e suas referências,
  `playwright.visual.config.ts`, `scripts/visual.mjs`, `scripts/visual-servidor.mjs`, `.github/workflows/testes.yml`;
  package/lock, Vitest/TypeScript e docs AGENTS/DECISIONS/TASKS/PROJECT_STATUS/README/INDICE/plano/auditoria alinhados.
- **Validação executada:** 214/214 unitários em 13 arquivos; typecheck, lint, build visual e smoke final aprovados.
  Duas matrizes Playwright completas: **185/185 em 1,6 min e 185/185 em 1,7 min**, sem atualizar imagens. As 32
  referências foram inspecionadas e mantiveram os hashes. CSS proposital detectou 7.782 pixels divergentes
  (saída 1); requisições SSR desconhecidas reprovaram no teardown mesmo com consumidor verde (saída 1).
  Revisão independente sem bloqueantes e `git diff --check` limpo. Logs/revisões em
  `artifacts/restauracao-testes-2026-10-15/`, ignorado. O negativo SSR registrou isoladamente `UV_HANDLE_CLOSING`
  no encerramento, ausente nas matrizes normais; o AssertionError do gate foi conferido separadamente.
- **Pendências/limites:** executar o workflow após publicação; aceite visual do dono e homologação com API,
  banco, R2, Drive, Safari/iOS e celular físico. As publicações/migrações do parceiro permanecem nas tarefas
  próprias. Avisos existentes do build sobre anotações do Zod e tamanho do chunk não impediram a compilação.

### 16/10/2026 — Primeiro CI verde após duas falhas do runner (Claude)

- Commit da restauração (`ba0930b`) reprovou o workflow no runner windows-2025: 180/185. (1) As referências de
  `contatos` divergiram nos 4 temas por 338 pixels: o placeholder nativo do `input[type=date]` segue o idioma da
  **UI do Chromium**, que no runner é en-US (`mm/dd/yyyy`), e não o `locale` do contexto; confirmado por
  experimento local (`--lang=en-US` muda o formato numa máquina pt-BR). Correção: `launchOptions
  ['--lang=pt-BR']` no `playwright.visual.config.ts`; referências intactas. (2) `claro-768` no fluxo do menu
  responsivo: o painel ignora Ctrl+K com qualquer `<dialog>` aberto (`LayoutPainel.tsx`) e a tecla saía com o menu
  em tela inteira ainda fechando; o teste agora espera o diálogo de navegação ficar oculto antes do atalho.
- Correções em `f4cb446`; matriz 185/185 local e workflow **verde no CI** (run 38980687347, 3m6s), cumprindo a
  pendência "executar o workflow após publicação". Aviso inofensivo do `upload-artifact@v4` sobre Node 20.

### 16/10/2026 — Commit, push e CI verde (Claude)

- **Entregue:** commits `64f0547` (DOCS) e `f4cb446` (matriz visual) enviados à `origin/main` via `git push`. API também
  comitada (`564b765`): README da API atualizado com estado 16/10, migrations aplicadas e deploy aguarda autorização.
- **Validação:** workflow CI **verde** (run 38981025796), 185/185 testes passaram em 3m6s. Todos os testes visuais
  aprovaram: `contatos.png` com placeholder de data em pt-BR, menu responsivo com Ctrl+K funcionando.
- **Pendências:** DEPLOY-001 (API para Render) e PUBLISH-CIDADES-20261016 (front após API). O owner deve conectar Render,
  verificar `/api/v1/saude` e configurar `ALLOWED_ORIGINS`, depois publicar o front na Vercel.

### 16/10/2026 — Atualização do TASKS.md (Claude)

- CI-20261016 marcada como concluída, com checklist atualizado. Status do projeto sincronizado com o push da API.

### 16/10/2026 — Filtros em card, catálogo com Seletor e foto do perfil recortada (Claude)

- **Entregue:** `BarraFiltros` vira card com X de limpar (chips e botão duplicado removidos); catálogo (desktop) com `Seletor`
  (`FiltroSuspenso` removido; tipo de imóvel em escolha única); dica do CRECI removida do editor de corretor; foto do perfil
  só por arquivo: `AjustadorFoto` (arrastar, pinça, zoom, setas; prévias nos tamanhos de uso, ocultas em celular baixo) +
  `servicos/recorteFoto.ts` (quadrado 512 WebP/JPEG); foto por URL removida de Meu perfil e do editor de corretor.
- **Validação:** `tsc`, `eslint` e vitest (220 testes) limpos; matriz Playwright 191/191 após atualizar 14 referências
  (catálogo, contatos, imóveis e perfil, nos temas e larguras afetados) e novo teste de foto (arrastar, zoom, recorte, envio
  multipart). Capturas conferidas em 390×844 e 360×640. Dependências de teste e Chromium instalados localmente (`npm install`,
  `playwright install chromium`).
- **Pendências:** API ainda aceita foto por URL (API-FOTO-URL-20261016); pinça só verificada por leitura de código (o teste
  automatizado usa mouse); QA em celular físico/Safari iOS. Filtros e catálogo já estão no commit `81fe5ff`; a foto do perfil, as referências e as docs ficam sem commit.

### 17/10/2026 — Otimizações de cache, imagens, SEO e bundle (Claude)

- **Entregue (plano em `PLANO_OTIMIZACOES.md`, ajustes e motivos em `DECISIONS.md` de 17/10):**
  - Fase 0: `deploymentRoutes` com `Cache-Control: immutable` só para `/assets/*` com hash (js/css/woff2) e cache de 1 dia +
    stale-while-revalidate para o resto de `/assets/*` (sem hash); a mesma política em `preview.mjs` (`cacheDeAsset`, mais
    tipos `.mp3 .ico .json .txt .avif`); HTML SSR indexável com `s-maxage=60, stale-while-revalidate=300`; `Disallow: /admin`.
  - Fase 1: `src/componentes/ImgOtimizada.tsx` (novo) em todos os `<img>` do app, 14 pontos (hero do catálogo e do login,
    galeria, cartão, corretor, logos, `Devs`, painel). Hero 1200×896 e login 1400×935 com `sizes` corrigido (`max-width:1023px`).
  - Fase 2: `og:image:alt` (título) na foto real do detalhe; descrição cortada em limite de palavra com reticências.
  - Fase 3: `manualChunks` (`react`, `formularios`) restaurado em `scripts/build.mjs`; `FormularioContato` em `React.lazy` com
    Suspense local, pré-carga em ociosidade/hover/foco e carga antes de abrir (falha vira `Dialogo` local);
    `telefoneWhatsapp` movido para `servicos/formato.ts`; import dinâmico real de `browser-image-compression`;
    `vite:preloadError` recarrega uma vez; plugin de preload de 4 fontes em `vite.config.ts`; peso 500 do Source Sans 3
    removido; âncora para a página inicial no `LimiteErro`.
  - Sem mudança: sitemap, canonical, JSON-LD, 404/503 (já corretos), debounce/paginação (já existiam). Não feitos: AVIF,
    CSS crítico inline, medição de INP.
- **Validação (resultados reais):**
  - `tsc --noEmit` e `eslint .` limpos; `npm test`: 14 arquivos, **220 testes passaram** (a contagem "214 em 13" de
    `docs/AGENTS.md` está defasada); `npm run build` ok; `node scripts/seo-smoke.mjs` passou;
    `visual:build` + `visual:sem-build`: **191/191 passaram**, sem `visual:atualizar` (nenhuma referência alterada), duas vezes
    (a segunda depois do ajuste do formulário de contato).
  - Bundle inicial (arquivos gerados em `dist/client/assets`): antes um `index` de 514.739 B (167.529 B gzip); agora `index`
    142.804 B + `react` 238.225 B = 381.029 B (**125.154 B gzip**, -25%). Fora do caminho inicial: `formularios` 129.182 B
    (39.251 B gzip) e `browser-image-compression` 53.167 B (20.840 B gzip). CSS inalterado (92.299 B; 17.855 B gzip).
    `dist/client/index.html` com 4 `<link rel="preload" as="font">` apontando para arquivos existentes; o hash do chunk `react`
    não muda entre os dois builds (cache estável).
  - `curl`/HTTP no `preview`: JS, CSS e woff2 com hash → `immutable`; `rua-comercial-960.webp`, logos e mp3 → 1 dia + SWR;
    `favicon.svg` sem cabeçalho de cache (fora de `/assets`, inalterado).
  - SSR indexável via `handleRequest` (o `preview` recusa `SEO_INDEXABLE=true` com API local): `/` e detalhe com
    `s-maxage=60, stale-while-revalidate=300` e `index,follow`; rota inexistente 404 `no-store`; `/admin` `no-store`;
    `robots.txt` com `Disallow: /api/`, `/api`, `/admin` e `Sitemap`; `sitemap.xml` com 13 URLs; detalhe com foto real:
    `og:image:alt` = título, sem `og:image:width`; descrição de 161 caracteres terminando em reticências.
  - Chromium real (Playwright 1.60, script descartável): catálogo não baixa `formularios`; detalhe o pré-carrega em
    ociosidade e o diálogo abre sem erro nem aviso no console (inclui `fetchPriority`); com o chunk bloqueado, há exatamente
    uma recarga e o clique mostra o aviso local, sem a tela de erro do roteador.
- **Defeito encontrado e corrigido durante o QA:** com o chunk do formulário indisponível, o erro caía no ErrorBoundary padrão
  do React Router ("Unexpected Application Error"), não no `LimiteErro`. Corrigido carregando o chunk antes de abrir.
- **Pendências / não testado:**
  - Cabeçalhos de cache da Vercel só foram verificados no `config.json` gerado e no `preview` (equivalente local); não há
    deploy desta versão, e o deploy de teste está `noindex`. Conferir após publicar e ligar `SEO_INDEXABLE`.
  - ERRO-ROTAS: rotas sem `errorElement` próprio mostram o ErrorBoundary padrão do roteador para qualquer erro de
    renderização (já era assim; o `LimiteErro` só cobre o que está fora do roteador).
  - Sem medição de Core Web Vitals reais (LCP/CLS/INP): nenhuma ferramenta de RUM ou Lighthouse foi executada.
  - Safari/iOS e celular físico não testados (`requestIdleCallback` tem fallback para `setTimeout`).
  - Mudanças ainda sem commit; a autorização de commit depende do dono (`docs/AGENTS.md`).
