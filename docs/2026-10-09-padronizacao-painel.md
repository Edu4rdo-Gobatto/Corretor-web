# Padronização visual do painel — 09/10/2026

## Pedido e escopo autorizado

Após aprovar a ficha de imóvel com títulos externos e cards alinhados, o dono pediu padronizar o painel inteiro, considerando todas as telas como referências. A entrega harmoniza o acabamento sem substituir suas composições. Abrange entrada, Visão geral, listas, fichas, Perfil, formulários e diálogos. Trabalho somente no frontend, em main, preservando o trabalho anterior; sem dependências, API, tipos ou banco. Publicado no Git depois, em `36e73b1`; sem deploy registrado.

## Padrão aplicado

- `SecaoPainel`: título externo associado à seção e superfície independente. `GradePainel`: container nomeado, 1/2/3 colunas em 44/70rem e subgrid de títulos/conteúdo; cards têm a altura do maior conteúdo da linha. Grades de dois blocos permanecem com até duas colunas.
- `DadosFicha` e `DadoFicha`: rótulo/valor compactos, campos ausentes explícitos, links e conteúdo React preservados. Duas colunas apenas quando a própria superfície comporta os campos.
- Fontes e escala 28/22/18/16/14 mantidas; azul/dourado, raio 5px, detalhe superior dourado de 3px e sombra leve. Gap 16px e padding 16–20px; sem alturas fixas, cortes ou recolhimento novo dos dados.
- Listas mantêm tabelas/linhas alternadas e cartões por largura do container, com ações à direita. Busca, filtros, chips, contagens e estados recebem classes comuns; nenhum filtro/controle ausente foi criado. Tabelas aninhadas não repetem o detalhe dourado/sombra da superfície externa.
- Novo, Editar e Buscar usam ícone e dica acessível. Salvar, Cancelar, confirmações, CTAs de seção e ações financeiras conservam texto. Alvo de toque dos chips mínimo de 44px.
- Fichas organizam os dados por assunto; textos têm seção própria. A ficha de imóvel conserva galeria/resumo 2:1, ordem dos blocos, características, links e dimensões locais aprovadas, passando a usar a seção compartilhada.
- Formulário de imóvel conserva seis seções, números e âncoras; editores mantêm selects, validações, grupos recolhíveis e rodapés. Perfil/foto e senha conservam formulários independentes. Título do diálogo continua no cabeçalho interno.

Todos os estilos novos são restritos a `.painel-ui`. A entrada aplica esse escopo somente na área do formulário. Esc, Ctrl/⌘+K, menu mobile, foco, guardas dirty/busy, ações, permissões, consultas e contratos de dados permanecem ativos.

## Verificação executada

| Verificação | Resultado |
|---|---|
| `npm run typecheck` | Aprovado |
| `npm run lint` | Aprovado |
| `npm test` | 3 arquivos / 23 testes aprovados |
| `npm run build` | Cliente, SSR e Vercel Output gerados |
| Smoke SSR efêmero (cópia do `seo-smoke.mjs` com o h1 atual; o original falha, ver SMOKE-001 em TASKS) | Metadados, paginação, 404, discovery, streaming/cookies, runtime Vercel e 503/recuperação aprovados |
| `git diff --check` | Aprovado |
| Layout integrado | 270 cenários aprovados |
| Formulários/login/estados | 49 cenários aprovados |
| Listas/Esc/paleta/menu | 5 fluxos aprovados |
| Regressão da ficha de imóvel | 28 cenários e 2 fluxos aprovados novamente |

Layouts conferidos em 320/390/1024/1440/1920px, nos dois temas e cargos ADMIN/CORRETOR. Foram incluídos títulos quebrados, dados longos, campos ausentes e registros arquivados. Superfícies sem overflow e com topo/base alinhados por linha; títulos externos associados. Formulários incluem perfil/senha independentes, foto pendente, banco recolhível, validações, confirmações financeiras, guardas e envios simulados. Login cobre campos vazios, erro401, bloqueio durante envio e preservação de campos/foco; Pessoa/Contrato têm cabeçalhos sem ações de edição durante carga/erro.

Capturas selecionadas de desktop/mobile nos dois temas inspecionadas. Na revisão final, chips recuperaram o mínimo de 44px, métricas do Perfil passaram à grade comum, dados em duas colunas perderam padding/divisórias desiguais e tabelas internas ficaram com borda simples. Ajustes seguidos de build/checks/QA; nenhuma suíte rastreada criada.

Evidências locais ignoradas: `artifacts/painel-padrao-2026-10-09/resultados-finais.json`, capturas/harness na mesma pasta, `artifacts/imovel-alinhamento-2026-10-09/resultados.json` e smoke em `artifacts/esc-foco-2026-10-09/seo-smoke-atual.mjs`. Diagnósticos iniciais de seletores/expectativas de QA preservados, com repetições aprovadas separadamente. Avisos de build existentes: PURE do Zod e chunk cliente de 505,56kB acima do limite de 500kB.

## Limites da entrega

QA com API simulada e navegador Chromium, sem gravações em serviço real. Login real, Neon, R2, Drive, pagamentos reais, reprodução de vídeo real, Safari/iOS e dispositivo físico não homologados. Nenhuma mudança de contrato, API/banco ou dependência. Documentos de contexto e índice atualizados preservando todo o histórico.
