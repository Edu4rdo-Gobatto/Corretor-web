# Tarefas — corretor-web

Status possíveis: `aberta`, `em andamento`, `em revisão`, `bloqueada`, `concluída`.
Quem assume uma tarefa escreve o próprio nome em Responsável e reflete isso no `PROJECT_STATUS.md`.
Tarefas da API ficam em `../Corretor-API/TASKS.md`.

---

## 1. Pendências Operacionais e Lançamento (Produção)

### DEPLOY-002 — Publicar o front-end em produção
- **Status:** bloqueada por DEPLOY-001 (publicação da API)
- **Responsável:** a definir
- **Objetivo:** Publicar a aplicação com SSR em produção conectada à API real.
- **Critérios de conclusão:**
  - Definir e registrar em `DECISIONS.md` a plataforma de hospedagem comercial (Vercel plano comercial ou alternativa Node.js).
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
