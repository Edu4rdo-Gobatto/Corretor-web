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

