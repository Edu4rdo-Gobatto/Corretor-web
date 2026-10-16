# Tarefas — corretor-web

Status: `aberta`, `em andamento`, `em revisão`, `bloqueada`, `concluída`.
Quem assume escreve o próprio nome em Responsável e registra no `PROJECT_STATUS.md`.
Tarefas da API ficam em [../../Corretor-API/docs/TASKS.md](../../Corretor-API/docs/TASKS.md).

## Abertas

### SMOKE-001 — Consertar o h1 esperado no smoke do SSR
- **Status:** concluída em 09/10 (Claude; código no `40f635b`). O smoke agora compara h1 e `<title>` com o slogan
  de `brand.ts` e passa.
- `scripts/seo-smoke.mjs:40` espera `<h1>Imóveis comerciais`. O h1 atual (`src/paginas/publico/Catalogo.tsx:57`) é
  "Imóveis para alugar e comprar", desde `2b3e27b` (06/10). O smoke falha desde então.
- Concluir: atualizar a expectativa e rodar `npm run build && node scripts/seo-smoke.mjs` até passar.

### DEPLOY-20261009 — Publicar comissão versionada e cadastros de contrato
- **Status:** aberta (aguardando autorização). **Responsável:** a definir.
- Depende da MIGRATION-20261009 da API (backup verificado, migration no Neon, API publicada antes).
- O código já está no `40f635b` (`origin/main`). Concluir: deploy só depois da API; ADMIN cadastra tipos e índices; conferir edição de comissão,
  arquivamento, Cadastros por categoria e contrato novo no ambiente de teste.
- Registro: [2026-10-09-comissao-versionada-cadastros-contrato.md](2026-10-09-comissao-versionada-cadastros-contrato.md).


### LIMPEZA-003 — Exclude de `tests/e2e` no `vite.config.ts`
- **Status:** aberta. **Responsável:** a definir.
- O `test.exclude` ainda lista `tests/e2e/**`, pasta removida. Concluir: tirar a entrada e rodar `npm test`.

### PUBLICAR-20261009 — Publicar o pacote de 09/10 no ambiente de teste
- **Status:** aberta (depende de autorização do dono). **Responsável:** a definir.
- Commits já no GitHub: API `6b987a5` (CRECI, `tipo_id` CSV, pessoas elegíveis) e web `aa4de75`.
- Ordem: API no Render primeiro, depois o front na Vercel. Conferir catálogo com vários tipos, CRECI e comissão.

### HOMOLOGACAO-001 — Homologação real do painel
- **Status:** aberta. **Responsável:** a definir.
- [ ] Perfil real com login, upload no R2 e gravação no Neon, ponta a ponta.
- [ ] Safari/iOS e celular físico (todas as entregas de 06/10 e 09/10 foram validadas só com API simulada ou
  Postgres descartável).
- [ ] Aceite visual do dono das entregas de 06/10 e 09/10.

### AUDIT-001 — Itens da auditoria que dependem de ambiente real
- **Status:** aberta. **Responsável:** a definir. Referência: [2026-10-02-auditoria-fullstack.md](2026-10-02-auditoria-fullstack.md).
- [ ] A09: desativar classificação → editar imóvel → reativar, no PostgreSQL real.
- [ ] A10: busca de telefone com dados legados reais.
- [ ] A11: cold start da API publicada contra o orçamento de 45s do SSR.
- [ ] H01: ACLs reais das pastas do Drive.

### LANCAMENTO-001 — Domínio e plano comercial
- **Status:** aberta (aguarda o dono). **Responsável:** a definir.
- Hoje só existe o ambiente de teste (Vercel `corretor-web-test` e Render). Falta escolher domínio, plano comercial
  da hospedagem e configurar `SITE_URL`, `API_ORIGIN` e `ALLOWED_ORIGINS` definitivos.

### CONTEUDO-001 — Fotos reais dos imóveis e acesso público do R2
- **Status:** aberta. **Responsável:** a definir.
- A URL pública do R2 respondeu 401 em 03/10; o catálogo usa fotos da Unsplash como paliativo.
- Concluir: domínio público do R2, fotos reais dos 12 imóveis e links atualizados no banco.

### ADMIN-001 — Conferir o WhatsApp do cadastro do administrador
- **Status:** aberta. **Responsável:** a definir.
- `src/config/brand.ts` já tem o WhatsApp real ((66) 98434-6427). `5565999999999` aparece só como exemplo nos
  formulários.
- Falta conferir no banco o WhatsApp do cadastro do administrador, usado nos anúncios do corretor responsável.

### TEST-API-001 — Testes de permissões e upload na API
- **Status:** aberta. Tarefa da API: autorização ADMIN × CORRETOR, comissões e upload. A API não tem suítes.

### RENTAL-004 — Regras de contratos e comissões
- **Status:** aberta (aguarda o dono). Acompanhar na [TASKS da API](../../Corretor-API/docs/TASKS.md).
- No código atual, CORRETOR cria e vê só os próprios contratos e comissões; ADMIN vê tudo.

### NOTIFY-001 — Avisar o corretor ao chegar um contato
- **Status:** aberta (aguarda o canal: WhatsApp ou e-mail). Integração no `POST /pessoas` da API.

### CABECALHOS-PENDENCIAS — Ajustes visuais relatados em 06/10
- **Status:** aberta (verificar). Chips do catálogo, raios variados, valores de tracking em maiúsculas e o X do
  `Dialogo` com borda. Os chips do painel ganharam 44px em 09/10; conferir o resto antes de mexer.

### VISUAL-20261016 — Conferir no painel real as mudanças de 16/10
- **Status:** aberta. **Responsável:** a definir.
- Logado (ADMIN e CORRETOR), dois temas, 390/1024/1440: interruptor "Exibir no site" (liga, desliga, mantém
  edições), listagem e ficha sem Arquivar, círculos 01–06, barra de salvar, ícone de erro nos campos, foco só por cor.

### PUBLICAR-20261016 — Publicar a regra de exibição
- **Status:** aberta (depende do dono). **Responsável:** a definir.
- Publicar a API (`RESTRICAO_PUBLICA` só por `ativo`) antes do web. Sem migration. Depois, conferir no catálogo
  publicado um imóvel Vendido/Alugado ativo.

### PUBLICAR-CIDADES-20261016 — Publicar o cadastro de Cidades
- **Status:** aberta. **Responsável:** a definir.
- Ordem: backup do Neon → `migration:run` (`1789862400000`, cria `cidades` e carrega as cidades dos imóveis) →
  deploy da API → web. Sem a migration, a API nova recusa criar imóvel e `/cidades` falha (o catálogo segue sem a lista).
- Depois: conferir Cadastros › Cidades, Estado → Cidade no imóvel e o filtro de cidade do catálogo.

## Backlog (sugestões)

- **PERF-001 a 003:** cache no SSR para classificações; carga paralela no painel; bundle público menor (o chunk do
  cliente passou de 500 kB em 09/10).
- **AGENDA-001:** registro de visitas ligado aos contatos.
- **FICHA-001:** ficha do imóvel para impressão e preenchimento por CEP (ViaCEP).
- **RELATORIO-001:** visão mensal de comissões. A exportação CSV de contatos já existe (`exportacaoContatos.ts`,
  página aplicada); falta CSV de outras listas, se o dono quiser.
- **RASCUNHO-001:** cadastrar imóvel sem publicar no site.
- **SENHA-001:** "Esqueci minha senha" por e-mail.
- **PORTAIS-001:** feed XML para ZAP, VivaReal e OLX.
- **FORMATO-001:** Prettier com 120 colunas.

## Concluídas

| Tarefa | Data | Resumo |
|---|---|---|
| SELETOR-CIDADES-20261016 | 16/10 | `Seletor` único (15 selects nativos migrados), cadastro de Cidades, Estado → Cidade no imóvel, filtro de cidade do catálogo pelo cadastro |
| EXIBIR-SITE-20261016 | 16/10 | "Exibir no site" só por `ativo` (web + API), controle só em Editar, destaque removido, foco só por cor de borda (`#a37d29`), erro de campo com ícone, SEO por situação |
| LIMPEZA-TESTES | 14/10 | Removidos `tests/visual/`, `playwright.visual.config.ts`, scripts `visual`, `src/test/setup.ts` e as dependências jsdom e Testing Library. Ficam 3 testes de lógica pura (vitest em node) |
| UX-008 | 13/10 | `BarraFiltros` única em Imóveis, Pessoas, Contratos, Contatos, Comissões e Cadastros; sem botão Buscar; Limpar na faixa de chips (corrige o layout quebrado) |
| UX-007 / LIMPEZA-001 / LIMPEZA-002 | 13/10 | Filtros e página de Imóveis, Pessoas, Contratos e Contatos (busca, datas, aba) na URL via `useParametrosLista`; `sessaoTeste.ts` removido; comentário de `renovarSessao` corrigido |
| SEIS-PONTOS-20261009 | 09/10 | Setinhas, CRECI, tema claro, vários tipos, `content.js`, clientes da comissão. Publicação em PUBLICAR-20261009 |
| TABELA-ACOES-DESKTOP-20261009 | 09/10 | Ações da tabela desktop numa linha; cartões mobile flexíveis |
| PAINEL-PADRAO-20261009 | 09/10 | Acabamento comum do painel com `BlocosPainel` |
| IMOVEL-ALINHAMENTO / IMOVEL-NOTAS | 09/10 | Ficha do imóvel em notas com títulos externos e alturas por linha |
| FOCO-ESC-20261009 | 09/10 | Sem contorno nos destinos de foco de navegação após Esc |
| FOTO-404-20261008 | 08/10 | API `86ecf29` implantada no Render; foto responde 302/200 |
| REFINAMENTOS-20261006 | 06/10 | Contatos em abas, perfil com upload, filtros automáticos |
| CABECALHOS-20261006 | 06/10 | `.linha-nav` no site e no painel |
| AREA-CORRETOR-20261006 | 06/10 | Especificação completa do painel: fichas próprias, `CampoNumero`, guarda de modal, Ctrl/⌘+K |
| AJUSTES-PAINEL-20261006 | 06/10 | Seletores, Esc pelo histórico, menu mobile, cards |
| DEPLOY-001 | 08/10 | API no Render de teste, `/api/v1/saude` ok (último deploy registrado: `86ecf29`) |
| DEPLOY-002 | 13/09 | Front no projeto Vercel de teste `corretor-web-test` |
| SEO-001 | 13/09 | `SITE_URL` e `SEO_INDEXABLE=true` em Production do projeto de teste. Domínio definitivo em LANCAMENTO-001 |

Revertidas e retiradas desta lista: ÁREA-001 de 05/10 (ícones sem nome, fichas em modal, atalhos `/`, `?` e
Ctrl+Enter) e a "revisão de conforto" de 06/10 (sidebar com hover `#b18424`). O dono reverteu as duas em 06/10.
