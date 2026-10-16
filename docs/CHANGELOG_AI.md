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
