# Tarefas — corretor-web

## TABELA-ACOES-DESKTOP-20261009 — Ícones de ações sem quebra

- [x] Remover a largura fixa insuficiente da coluna de Contatos.
- [x] Travar a linha de ações apenas na tabela desktop e manter cartões mobile flexíveis.
- [x] Conferir Contatos com quatro ações, demais listas, 1440px e mobile 390px sem overflow.
- [x] Executar typecheck, lint, testes e build.
- Escopo local, visual e sem alterações de API, permissões, dados ou publicação.

## PAINEL-PADRAO-20261009 — Acabamento comum em todas as telas

- Responsável: Codex, com implementadores/revisão em arquivos separados. Plano autorizado pelo dono; implementação e validação local concluídas.
- [x] Componentes de seção/superfície/grade/dados, títulos externos e alinhamento por linha; 44/70rem por container.
- [x] Entrada, Visão geral, listas, todas as fichas, Perfil, formulários e diálogos adaptados preservando composições e controles existentes.
- [x] Ícones de ações rápidas, texto nas confirmações/finanças, busca/chips/contagens/estados e tabelas/cartões coerentes.
- [x] Esc, paleta, menu mobile, permissões, guardas dirty/busy, validação, banco recolhível e independência de perfil/senha conferidos com API simulada.
- [x] Typecheck, lint, build, 23 testes existentes, smoke SSR e diff-check aprovados; QA efêmero sem suítes novas.
- [x] 270 cenários de layout + 49 de formulários/login/estados + 5 fluxos; regressão do imóvel aprovado em 28 cenários + 2 fluxos. Histórico/contexto/índice atualizados.
- Entrega local: sem commit/push/deploy, dependências ou alterações na API/banco. Homologação de integrações reais/Safari/iOS/dispositivo físico fora desta validação.

## IMOVEL-ALINHAMENTO-20261009 — Revisão dos cards pelo dono

- Responsável: Codex. Plano autorizado; implementação e validação local concluídas.
- Títulos fora das superfícies; cards da mesma linha compartilham topo/base e altura, inclusive quando o título quebra.
- Subgrid de título/conteúdo, estrutura acessível e seletores adaptados da galeria. Mantidos containers, descrição larga e consulta sem permissão.
- Typecheck, lint, build e 23 testes existentes aprovados. QA efêmero em `artifacts/imovel-alinhamento-2026-10-09`: 28 cenários e 2 fluxos sem permissão/Esc aprovados; topo/base com desvio 0px, sem overflow. Títulos externos, quebra de títulos, galeria compacta e grade sem células vazias intermediárias conferidos; sem novas suítes.
- Sem publicação, dependências ou alterações de API/dados; histórico da versão anterior preservado.

## IMOVEL-NOTAS-20261009 — Ficha compacta estilo post-it

- Responsável: Codex. Plano autorizado pelo dono; implementação local concluída.
- Galeria com resumo ao lado; notas por assunto, descrição mais larga e campos internos compactos.
- Preservados campos, links, ações, permissões e Esc; consulta na edição sem permissão incluída.
- Typecheck, lint, build e testes existentes aprovados (3 arquivos/23 testes). QA visual efêmero com API simulada; sem novas suítes.
- Sem publicação, dependências, mudanças de contrato, API ou dados. Homologação real e Safari/iOS não executados.

## 2026-10-08 — Codex: 404 da foto corrigido na implantação

O dono autorizou resolver pela página aberta do Render usando Computer Use. Confirmado commit ativo antigo e3b0a32; implantação manual do origin/main 86ecf29 concluída (Deploy succeeded/Live), serviço srv-daj21e15efls73fab4gg, deploy dep-db4684m0tbcc73d9jtr0. Este registro substitui a pendência de acesso/publicação do diagnóstico abaixo.

URL original /api/corretores/1/foto?v=1f6h7x3 agora responde 302; seguindo redirect, HTTP 200 image/jpeg, 22322 bytes. /api/v1/saude da API retorna status ok. Perfil aberto recarregado para verificar a correção. Sem alterações funcionais, migrations, gravação de dados, commit ou push; documentação histórica preservada. Conector Render segue indisponível, mas sessão do navegador permitiu corrigir a implantação.


## FOTO-404-20261008 — Rota ausente na API publicada

- Responsável: Codex.
- Status: diagnóstico local concluído; correção da implantação pendente.
- [x] Reproduzir 404 publicado nos caminhos legado e versionado.
- [x] Confirmar endpoint no código local/GitHub e validar build/proxy com banco/storage simulados.
- [ ] Reconectar Render, verificar commit/build/start e publicar API atual se autorizado.
- [ ] Revalidar URL real e foto do perfil após implantação.


## REFINAMENTOS-20261006 — Contatos, perfil e filtros

- **Responsável:** Codex.
- **Status:** concluída localmente; homologação real do perfil e aceite visual separados.
- [x] Seletor por conteúdo/viewport, teclado e ações com ícone WhatsApp.
- [x] Contatos em Pendentes/Atendidos/Finalizados; paginação por aba, CSV e permissões preservadas.
- [x] Perfil compacto, arquivo/URL pendentes, prévia, guarda e senha independente.
- [x] JSON/multipart, leitura por id e compensação no R2 pela API irmã; sem schema/migration.
- [x] Filtros automáticos existentes, debounce 350 ms, validação, replace/SSR e respostas antigas.
- [x] Comandos, QA efêmero, revisão independente e System Design renderizado.
- [x] Contexto, especificações e índices atualizados sem apagar snapshots anteriores.
- [ ] Homologar um perfil real com login, R2 e Neon juntos; Safari/iOS e celular físico.
- [ ] Aceite do dono e eventual autorização de publicação (fora da entrega local).

## CABECALHOS-20261006 — Botões dos cabeçalhos no estilo de "Encontrar um imóvel"

- **Responsável:** Claude.
- **Status:** concluída (implementação e validação local).
- [x] `.linha-nav` compartilhada: negrito, linha dourada no hover/foco e no destino atual.
- [x] Cabeçalho público: remover "Encontrar um imóvel"; Alugar/Comprar/Área do corretor e tema sem borda.
- [x] Painel: sidebar e menu mobile com linha dourada; botões do topo sem borda.
- [x] Consistência: `.link-texto`, `urlCatalogo` nas páginas de erro, eyebrows do login, tracking dos selects.
- [x] Typecheck, lint, 21 testes, build, smoke SSR, curl e QA efêmero com capturas.
- [ ] Pendências relatadas ao dono, fora do pedido: chips do catálogo, raios variados (2–12px), cinco valores de
  tracking em maiúsculas e o X do `Dialogo` com borda.


## AREA-CORRETOR-20261006-CONCLUSAO — Specs completas do painel

- **Responsável:** Codex; implementação/revisão delegadas em arquivos separados.
- **Status:** concluída (implementação e validação local; homologação real separada).
- **Referência:** `2026-10-06-conclusao-area-corretor.md` e especificação vigente com adendos.
- [x] Autorização do dono para seguir as etapas posteriores a Contatos, incluindo comportamentos completos.
- [x] Imóveis/Contratos, Comissões/Cadastros/Corretores, Visão geral/Perfil e formulários/mídias.
- [x] Fichas próprias de imóvel/comissão/classificação/corretor; vínculos, estados e dados por cargo.
- [x] CampoNumero com unidades, edição decimal/colagem, limites e DTO existentes.
- [x] Guarda dirty/busy, camadas e Esc/Enter; perfil/senha e rascunho preservados.
- [x] Paleta pesquisável Ctrl/⌘+K, comandos/destinos permitidos e foco posterior ao fechamento.
- [x] Revisões estáticas e correções de pagamento, foco, desarme, colagem e seleção restaurada.
- [x] Typecheck, lint, 21 testes, build, smoke SSR, 320 cenários/140 capturas, diff-check e índice preservado.
- [x] Atualizar contexto/documentação sem apagar histórico; retirar scripts efêmeros de QA.
- [ ] Homologação real e Safari/iOS/celular físico (fora desta conclusão local).

Os status pendentes do marco AREA-CORRETOR-20261006 abaixo retratam a entrega anterior.
Não bloqueiam esta continuação, expressamente autorizada. Sem dependências/API/dados/migrations
ou commit/push/deploy; reabertura somente por ADMIN continua sendo uma restrição do frontend.

## AJUSTES-PAINEL-20261006 — Revisão visual e de navegação

- **Responsável:** Codex.
- **Status:** concluída (implementação e validação local).
- **Referência:** `2026-10-06-ajustes-painel.md`, plano aprovado pelo dono.
- [x] Tooltips sem setinhas/rolagem e seletores de filtros compartilhados.
- [x] Esc retorna ao histórico interno, com prioridade de camadas e guarda existente.
- [x] Menu mobile ocupa a tela inteira; cards/valores/ações alinhados à direita.
- [x] Atendido estilizado, permissões preservadas, sem foto e origem retirados das listas.
- [x] Typecheck, lint, 21 testes, build, smoke SSR, diff-check e QA simulado (63 cenários/59 capturas); limites registrados.

Status possíveis: `aberta`, `em andamento`, `em revisão`, `bloqueada`, `concluída`.
Quem assume uma tarefa escreve o próprio nome em Responsável e reflete isso no `docs/PROJECT_STATUS.md`.
Tarefas da API ficam em `../Corretor-API/docs/TASKS.md`.

## AREA-CORRETOR-20261006 — Continuar a especificação do parceiro

- **Status:** em revisão (primeiro marco: Contatos).
- **Responsável:** Codex; revisão visual: dono.
- **Referência vigente:** `2026-10-06-painel-especificacao-visual.md`, base `a2a9f81`.
- [x] Preservar a tela Pessoas e a base visual do parceiro; corrigir tooltip, dicas/erros e espaçamento de modal no painel.
- [x] Contatos: Pendentes e Atendidos, checkbox PENDENTE ↔ RESPONDIDO, confirmação FINALIZADO e histórico por filtro.
- [x] Reabertura somente por ADMIN no frontend, inclusive no EditorPessoa; edição só por responsável ou ADMIN.
- [x] Filtros inclusivos UTC-04, paginação independente, CSV da página, links reais, mensagem e WhatsApp.
- [x] Typecheck, lint, 21 testes existentes, build, smoke SSR e QA efêmero com API simulada (24 cenários/38 capturas).
- [ ] Revisão de Contatos pelo dono, antes de propagar às próximas telas (seção 8 da especificação).
- [ ] Imóveis e Contratos; depois Comissões, Cadastros, Corretores, Visão geral, Perfil e demais formulários/modais.
- [ ] Fichas de consulta em telas próprias: imóvel, comissão, classificação e corretor; reutilizar serviços existentes e permissões.
- [ ] CampoNumero, links de imóvel/corretor, guarda de modal (Esc + Esc ou Enter), Esc sem modal e somente Ctrl/⌘+K.
- [ ] Homologação com API real e Safari/iOS/dispositivo físico, separada dos resultados simulados.

Limite desta entrega: frontend na main, sem ampliar suítes rastreadas, dependências, API/dados,
migrations, commit, push ou deploy. A API não garante a regra específica ADMIN para reabertura;
isso exige um escopo posterior de backend. As tarefas históricas abaixo permanecem preservadas.

---

## 1. Pendências Operacionais e Lançamento (Produção)

### DEPLOY-002 — Publicar o front-end em produção
- **Status:** bloqueada por DEPLOY-001 (publicação da API)
- **Responsável:** a definir
- **Objetivo:** Publicar a aplicação com SSR em produção conectada à API real.
- **Critérios de conclusão:**
  - Definir e registrar em `docs/DECISIONS.md` a plataforma de hospedagem comercial (Vercel plano comercial ou alternativa Node.js).
  - Configurar variáveis de produção:
    - `VITE_API_URL=/api`
    - `API_ORIGIN` com o domínio HTTPS real da API
    - `SITE_URL` com o domínio público final
    - `SEO_INDEXABLE=true`
  - Garantir que `ALLOWED_ORIGINS` da API autorize o domínio do front-end (essencial para cookies e CORS).
  - Validação ponta a ponta: catálogo, detalhes, painel administrativo, upload de fotos e envio de leads.

### DEPLOY-001 — Publicar a API em produção (Corretor-API)
- **Status:** aberta
- **Responsável:** a definir
- **Objetivo:** Subir o backend no serviço de hospedagem definitiva (Render/VPS) apontando para o Neon e Cloudflare R2 reais.
- **Critérios de conclusão:**
  - Ambiente Node 24 com `npm run start:prod`.
  - Configurar variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`, credenciais do R2, etc.).
  - Health check da API respondendo 200 em `/api/v1/saude`.

### CONTEUDO-001 — Fotos comerciais reais dos imóveis e acesso público do R2
- **Status:** aberta (trazida em CARGA-001 e REVISAO-001)
- **Responsável:** a definir
- **Objetivo:** Substituir as fotos ilustrativas da Unsplash pelas fotos comerciais reais dos 12 imóveis cadastrados no Neon, e resolver a permissão de leitura pública do bucket R2.
- **Critérios de conclusão:**
  - Configurar acesso público/domínio customizado no Cloudflare R2 (atualmente a URL pública do R2 retorna 401, necessitando do CDN da Unsplash como paliativo temporário).
  - Fazer upload das fotos reais dos imóveis comerciais de Juara/MT.
  - Atualizar os links no banco e validar carregamento no catálogo, na galeria e nas miniaturas.

### TEST-VISUAL-001 — Especificações de teste para a suíte visual Playwright
- **Status:** aberta (trazida em REVISAO-001)
- **Responsável:** a definir
- **Objetivo:** Criar arquivos de teste `.spec.ts` para `tests/visual/` para que o comando `npm run visual` funcione corretamente.
- **Critérios de conclusão:**
  - A pasta `tests/visual/` atualmente só possui arquivos utilitários (`api-simulada.ts`, `orcamento.ts`), fazendo o Playwright falhar por falta de specs.
  - Criar testes visuais cobrindo páginas públicas e painel nos temas claro e escuro e nas larguras responsivas.
  - Garantir que `npm run visual` conclua a execução gerando o relatório sem falhas.

### TEST-API-001 — Testes de permissões e upload na API irmã (Corretor-API)
- **Status:** aberta (trazida em REVISAO-001)
- **Responsável:** a definir
- **Objetivo:** Cobrir no backend (`Corretor-API`) a autorização por perfil (ADMIN vs CORRETOR), cálculo de comissões e round-trip de upload de arquivos.

### SEO-001 — Liberar a indexação pública nos motores de busca
- **Status:** bloqueada por DEPLOY-002
- **Responsável:** a definir
- **Objetivo:** Permitir que Googlebot e outros buscadores indexem as páginas públicas.
- **Critérios de conclusão:**
  - `SITE_URL` e `API_ORIGIN` rodando em HTTPS com `NODE_ENV=production` e `SEO_INDEXABLE=true`.
  - `robots.txt` apontando para o `sitemap.xml` e liberando `/` e `/imoveis/`.
  - `sitemap.xml` dinâmico listando os imóveis reais cadastrados.
  - Testar prévias de compartilhamento (Open Graph / WhatsApp / LinkedIn).

### ADMIN-001 — Configurar o WhatsApp comercial definitivo
- **Status:** aberta (aguardando número real)
- **Responsável:** a definir
- **Objetivo:** Substituir o número provisório de exemplo (`5565999999999`) pelo telefone real de atendimento do corretor Lucas Gobatto.
- **Critérios de conclusão:**
  - Atualizar o cadastro do administrador no painel ou via API.
  - Validar se o botão flutuante e os botões de contato de cada imóvel direcionam para o WhatsApp correto com a mensagem predefinida.

### AUDIT-001 / AUDIT-REV — Homologação dos itens da Auditoria Full Stack
- **Status:** aberta para homologação em ambiente real
- **Responsável:** a definir
- **Objetivo:** Validar em produção as correções de integridade e segurança realizadas localmente.
- **Critérios de conclusão:**
  - Testar banco PostgreSQL com as migrations aplicadas e integridade referencial.
  - Validar upload e leitura de mídias no Cloudflare R2 em produção.
  - Validar integração com Google Drive para criação automática das pastas privadas de contratos.
  - Validar comportamento e tempo de resposta em caso de cold start da API.

### RENTAL-004 — Definição de regras e permissões de contratos e comissões
- **Status:** aberta (aguardando alinhamento de produto com o dono)
- **Responsável:** a definir
- **Objetivo:** Consolidar regras de negócio para a gestão de contratos e intermediações.
- **Critérios de conclusão:**
  - Definir fluxo exato para encerramento ou renovação de contratos de locação.
  - Definir se corretores comuns podem criar ou apenas visualizar contratos e comissões atribuídos a eles.
  - Validar o cálculo e baixa manual de parcelas de comissão de captação.

### NOTIFY-001 — Notificação automática ao receber novo lead
- **Status:** aberta (aguardando definição de canal com o dono)
- **Responsável:** a definir
- **Objetivo:** Alertar imediatamente o corretor responsável quando um visitante enviar uma proposta ou mensagem de contato no site.
- **Critérios de conclusão:**
  - Escolher canal de envio (WhatsApp via API externa ou E-mail transacional via Resend/SendGrid).
  - Integrar envio no momento do registro do contato (`POST /pessoas`).

### UX-007 — Preservar filtros do painel administrativo na URL
- **Status:** aberta
- **Responsável:** a definir
- **Objetivo:** Sincronizar filtros das tabelas de imóveis, pessoas e contratos com a query string da URL.
- **Critérios de conclusão:**
  - Permitir recarregar a página ou compartilhar links do painel mantendo filtros ativos (ex: busca, status e paginação).

---

## 2. Sugestões de Melhorias e Backlog Futuro

### PERF-001 a PERF-003 — Caches e otimização de performance
- **Prioridade:** Média (P2)
- **Sugestão:**
  - Cache em memória no SSR para categorias, tipos e finalidades de imóveis (SWR), reduzindo idas desnecessárias à API.
  - Carregamento de dados em paralelo na inicialização do painel administrativo.
  - Otimização do tamanho do bundle público removendo validações desnecessárias para visitantes.

### AGENDA-001 — Módulo de agendamento de visitas
- **Prioridade:** Média (P2)
- **Sugestão:**
  - Registro de visitas a imóveis integrado ao funil de contatos (data, horário, corretor e parecer/resultado da visita).

### FICHA-001 — Ficha para impressão e busca automática por CEP
- **Prioridade:** Média (P2)
- **Sugestão:**
  - Estilo CSS `@media print` para gerar folha de apresentação em PDF/impressão de qualquer imóvel.
  - Integração com ViaCEP para preencher automaticamente logradouro, bairro, cidade e UF a partir do CEP informado no formulário.

### RELATORIO-001 — Relatórios financeiros e exportação de dados
- **Prioridade:** Média (P2)
- **Sugestão:**
  - Visão mensal consolidada de comissões (valores recebidos, a receber e parcelas em atraso).
  - Exportação de listas de contatos e clientes em formato CSV/Excel com filtros aplicados.

### RASCUNHO-001 — Controle de publicação de anúncios (Modo Rascunho)
- **Prioridade:** Média (P2)
- **Sugestão:**
  - Permitir cadastrar o imóvel sem disponibilizá-lo imediatamente no site público, com botão explícito de "Publicar Anúncio".

### SENHA-001 — Recuperação de senha no painel ("Esqueci minha senha")
- **Prioridade:** Baixa (P3)
- **Sugestão:**
  - Envio de link seguro de redefinição de senha por e-mail, evitando necessidade de intervenção do administrador do sistema.

### PORTAIS-001 — Integração com portais imobiliários (Feed XML)
- **Prioridade:** Baixa (P3)
- **Sugestão:**
  - Geração de feed XML nos padrões do ZAP Imóveis, VivaReal e OLX para sincronização automática dos imóveis comerciais.

### FORMATO-001 — Padronização de formatação de código com Prettier
- **Prioridade:** Baixa (P3)
- **Sugestão:**
  - Configuração do Prettier com quebra de linha de 120 colunas para garantir legibilidade homogênea no repositório.


## 2026-10-05 — ÁREA-001: refinamento da Área do Corretor

Plano autorizado em conversa, implementado localmente; validação final registrada em CHANGELOG_AI.

- [x] Seções abertas, navegação por ícones e inputs refinados nos dois temas.
- [x] Tooltips em foco/hover com nome contextual, aria-describedby e prioridade de Esc.
- [x] Campos numéricos compartilhados com unidades externas, decimais PT-BR e validação existente.
- [x] Contratos abertos pela linha/item inteiro, preservando ações internas independentes e links reais.
- [x] Fichas de imóvel/corretor em modal, carregamento/erro/retry e edição separada conforme permissão.
- [x] Esc intacto fecha; edição exige dois Esc consecutivos, outro evento desarma; ocupado bloqueia.
- [x] Menu Ctrl/Command+K, busca /, ajuda ?, envio seguro Ctrl/Command+Enter e retorno interno com Esc.
- [x] Guarda de edição em imóvel/perfil; preservar rascunho e operações já persistidas.
- [ ] Homologação posterior com API/serviços reais e Safari/iOS/dispositivos físicos. Não confundir QA simulado com homologação.

Sem dependências novas, alteração de dados/API, migration ou publicação nesta entrega.

## 2026-10-06 — Revisão de conforto do painel

- [x] Restaurar sidebar 260px com ícones e nomes, destino ativo e menu mobile nomeado.
- [x] Tipografia principal 18px, auxiliar 16px, título principal/modal 20px e subtítulos 18px.
- [x] Botões dourados arredondados, desenhos brancos, textos azuis, alvos 48px e distinção destrutiva/desabilitada.
- [x] Novo/Filtrar/WhatsApp/Responder com ícone e texto; editar/consulta com tooltip.
- [x] Inputs outlined com rótulo acima, foco/erro e unidades numéricas externas.
- [x] Contatos em blocos suaves; tabelas confortáveis e mudança mobile antes de apertar colunas.
- [x] Cabeçalhos e Responder contatos alinhados; preservar fichas, atalhos, permissões e dois Esc.
- [ ] Homologação em API/serviços reais e dispositivos físicos continua separada do QA simulado.

Sem dependências, API/dados, migrations, commit, push ou deploy.

- [x] Typecheck, lint, 21 testes, build, smoke SSR e diff-check.
- [x] Revisão Chrome simulada: seis matrizes/72 capturas, 28 cenários aprovados após repetição isolada de um timeout; detalhes em CHANGELOG_AI.

## 2026-10-06 — Refatoração da Área do Corretor revertida pelo dono

Pedido explícito: “reverta tudo, e me dê um plano e um resumo do que foi pedido”. Revertidas integralmente as duas etapas desta conversa: mudanças visuais, sidebar, fontes, botões/inputs, tooltips centralizados, entradas numéricas, fichas em modal, contratos clicáveis, atalhos e fechamento com dois Esc. Arquivos fonte rastreados restaurados ao estado anterior da refatoração; cinco componentes/hooks novos retirados do código ativo. API, banco, dependências e trabalho anterior preservados. Nenhum commit, push ou deploy.

Os registros de implementação/validação de 05 e 06/10 acima são históricos e NÃO descrevem o produto atual. As orientações específicas dessa refatoração ficam canceladas como instruções de implementação vigente. O novo documento PLANO-AREA-CORRETOR.md contém apenas o pedido consolidado e a proposta de execução futura; não autoriza reimplementar. Preservar o restante das orientações do repositório. Backup local ignorado em artifacts/reversao-area-corretor-2026-10-06.

Verificação da reversão: todos os arquivos rastreados de src comparados por hash ao HEAD, sem diferenças; componentes novos ausentes e referências removidas. npm run build e node scripts/seo-smoke.mjs aprovados após a reversão, assim como git diff --check. A suíte de testes não foi repetida nesta reversão. Plano entregue em docs/PLANO-AREA-CORRETOR.md.

## 2026-10-09 — Codex: contorno de foco após Esc

Implementado o plano autorizado: `data-foco-navegacao` no main do painel e no h1 de Desenvolvedores; `[data-foco-navegacao]:focus { outline: none; }` em global.css. Preservados tabIndex, foco programático, Pular para o conteúdo, retorno do foco e regras de Esc. A marcação é exclusiva de destinos não interativos; não aplicar a todos os elementos com tabindex=-1 nem remover o foco visível de controles.

Validação: typecheck, lint, build e testes existentes aprovados (3 arquivos, 23 testes). QA efêmero Chrome com API simulada: 19 verificações aprovadas, incluindo reprodução da borda de 3px com a nova regra removida via CSSOM, Visão geral/Imóveis/Contratos/Devs nos dois temas, Tab em link/botão/input, filtro, menu mobile, diálogo intacto com retorno do foco e diálogo alterado com dois Esc. Capturas e resultados ignorados em artifacts/esc-foco-2026-10-09. Sem erros JavaScript nos cenários concluídos. Primeiro QA usou rótulo inexistente Abrir menu; corrigido para Menu. Reinícios do navegador foram necessários antes da rodada final completa.

O smoke original scripts/seo-smoke.mjs falhou na expectativa antiga do h1 Imóveis comerciais; a tela atual usa Imóveis para alugar e comprar. Cópia efêmera com apenas essa expectativa e caminhos de import ajustados passou: SSR, metadados, paginação, 404, discovery, proxy/cookies, função Vercel gerada e indisponibilidade/recuperação 503. O script original foi preservado; sua expectativa continua pendente de atualização fora deste escopo. Build emitiu avisos de anotação PURE do Zod e chunk maior que 500 kB, sem impedir conclusão.

Entrega local concluída; alterações preexistentes preservadas. Sem novas suítes, dependências, API, banco, commit, push ou deploy por esta tarefa. QA simulado não equivale a homologação real nem validação em Safari/iOS.

2026-10-09 — Atualização: dono autorizou commit e push da correção de foco e destes registros na main. Validações da entrega acima permanecem aplicáveis; publicação no Git não confirma deploy.
