# Estado atual — corretor-web

## 2026-10-09 — Claude: correção dos seis pontos (web)

Concluído localmente: campos number sem setinhas; `CampoCreci` compartilhado por Perfil e editor de corretores; tema
claro azul-acinzentado por tokens (escuro inalterado) e variáveis antigas sincronizadas; catálogo com vários tipos
funcionando após o contrato da API; `EditorComissao` com clientes elegíveis, limpeza ao trocar operação/contrato/imóvel
e revalidação antes do POST. `content.js` é de extensão do Chrome (ID `npclhjbddhklpbnacpjloidibaggcgon`).
Typecheck, lint, 23 testes e build aprovados; QA Chrome efêmero 63/63 contra API real com Postgres descartável.
Depende da API publicada antes. Detalhes: `2026-10-09-seis-pontos.md`.

## 2026-10-09 — Codex: ações desktop corrigidas

Correção local concluída após revisão no celular/desktop: a coluna de ações da tabela agora permanece em uma linha no desktop, incluindo quatro ações em Contatos. O mobile mantém quebra controlada nos cartões. Typecheck, lint, testes e build aprovados; conferência simulada de Contatos confirmou quatro botões em 44px, sem overflow em 1440px, e cartões mobile sem overflow em 390px. Sem API, dados ou publicação.

## 2026-10-09 — Codex: painel padronizado e validado localmente

Plano integral concluído: acabamento comum da entrada, listas, Visão geral, Perfil, fichas, formulários e diálogos. Seções com títulos externos, superfícies alinhadas por linha, grade por container, espaçamento/padding compactos, tabelas/cartões e filtros coerentes. Ficha de imóvel aprovada preservada; ações rápidas com ícone/dica e confirmações/finanças com texto. Detalhes em `2026-10-09-padronizacao-painel.md`.

Typecheck, lint, build, 23 testes existentes e smoke SSR de produção aprovados após ajustes finais. QA Chromium/API simulada: 270 cenários de listas/fichas/grades em 320/390/1024/1440/1920px, claro/escuro e ADMIN/CORRETOR; 49 cenários de formulários/login/estados; 5 fluxos de lista/Esc/paleta/menu. Regressão da ficha aprovada: 28 cenários e 2 fluxos novamente aprovados. Sem overflow, erros JS ou desalinhamento de superfícies; capturas selecionadas inspecionadas. Evidências ignoradas em `artifacts/painel-padrao-2026-10-09` e `artifacts/imovel-alinhamento-2026-10-09`.

Documentos de contexto e índice atualizados sem apagar histórico. API/dados, Safari/iOS, dispositivo físico, login/integradores reais e reprodução de vídeo real não homologados. Sem novas suítes, dependências, API/banco, commit, push ou deploy; alterações anteriores e índice Git preservados.

## 2026-10-09 — Codex: padronização visual integral em andamento

Plano autorizado pelo dono: todas as telas são referências; consolidar acabamento comum do painel inteiro, incluindo entrada, sem impor um único layout. Base/estilos compartilhados, fichas, listas, Perfil, formulários e diálogos serão adaptados. Preservar o resultado aprovado da ficha de imóvel, as funcionalidades, fontes/identidade, dados e permissões. Trabalho local em main, sem publicação, dependências, API/banco ou novas suítes. Alterações locais anteriores preservadas; agentes com arquivos separados para fichas, formulários/Perfil e listas. Validação e documentação finais pendentes.

## 2026-10-09 — Codex: alinhamento da ficha após revisão do dono

Entrega local concluída: títulos acima das superfícies e cards com topos/bases alinhados por linha, inclusive galeria/resumo e títulos quebrados. Estrutura e subgrid aplicados sem alturas fixas nos cards, mantendo as notas anteriores, campos, ações e permissões. Ficha interna precede Descrição para preencher a grade; dimensões locais da galeria prevalecem sobre as utilities compartilhadas. Typecheck, lint, build e 23 testes existentes aprovados. QA efêmero com API simulada: 28 cenários de layout e 2 fluxos de consulta sem permissão/Esc aprovados nos dois temas; desvio de topo/base 0px, sem overflow ou erros JavaScript. Foto até 380px e miniaturas 80×56 confirmadas. Sem commit, push, deploy ou mudança na API/banco; sem homologação real de dados, vídeo ou Safari/iOS.

## 2026-10-09 — Codex: ficha do imóvel em notas compactas

Implementado o plano autorizado: galeria/resumo em proporção 2:1 e notas de Características, Localização, Pessoas vinculadas, Descrição, Ficha interna e Observações internas. Identidade azul/dourado, sombras leves, grade por container, todos os dados acessíveis. Mesma apresentação na consulta da edição sem permissão. Typecheck, lint, build e 23 testes existentes aprovados. QA com API simulada cobre quatro larguras e dois temas; não equivale a homologação no banco real ou Safari/iOS. Entrega local, sem commit, push, deploy ou mudanças na API/banco.

## 2026-10-08 — Codex: 404 da foto corrigido na implantação

O dono autorizou resolver pela página aberta do Render usando Computer Use. Confirmado commit ativo antigo e3b0a32; implantação manual do origin/main 86ecf29 concluída (Deploy succeeded/Live), serviço srv-daj21e15efls73fab4gg, deploy dep-db4684m0tbcc73d9jtr0. Este registro substitui a pendência de acesso/publicação do diagnóstico abaixo.

URL original /api/corretores/1/foto?v=1f6h7x3 agora responde 302; seguindo redirect, HTTP 200 image/jpeg, 22322 bytes. /api/v1/saude da API retorna status ok. Perfil aberto recarregado para verificar a correção. Sem alterações funcionais, migrations, gravação de dados, commit ou push; documentação histórica preservada. Conector Render segue indisponível, mas sessão do navegador permitiu corrigir a implantação.


## 2026-10-08 — Codex: diagnóstico do 404 da foto publicado

Área: implantação da foto do perfil. Código local e origin/main da API em 86ecf29, com FotoCorretorController registrado. GET público via Vercel retorna 404 Cannot GET /corretores/1/foto; com /api/v1 também não reconhece a rota. Indício de versão implantada divergente, ainda sem acesso para confirmar o commit do Render.

Build API aprovado. QA efêmero com middleware antes do router e proxy real: foto externa 302 e foto gerenciada 200 com bytes corretos; banco/storage simulados. Primeira sondagem do harness falhou por registrar middleware depois de iniciar o servidor; corrigida somente no QA. Sem mudança funcional, dados, commit ou deploy. Conector Render exige reautenticação; aguardando conexão e autorização de publicação.


## 2026-10-06 — Codex: contatos, perfil com upload e filtros automáticos

Plano autorizado implementado localmente nos dois repositórios. Contatos em abas com paginação própria,
seletor sem partir palavras, WhatsApp com SVG e ações compactas; perfil com dois cards e faixa de métricas.
Arquivo/URL, prévia, substituição e remoção só persistem em Salvar perfil. API JSON/multipart e leitura
da foto pelo id funcionam com bucket privado. Filtros do catálogo/Imóveis/Pessoas/Contatos/Contratos
aplicam seleções imediatamente e texto após 350 ms, sem perder foco ou resultados válidos.

Typecheck, lint e build aprovados nos dois projetos; frontend 3 arquivos/21 testes e smoke SSR aprovados.
API não possui testes fonte: Jest com passWithNoTests confirma ausência, não cobertura.
QA HTTP: 22 cenários simulados e reprodução de foto concorrente corrigida. QA Chrome: 23 cenários e
32 capturas em 320/390/768/1440, claro/escuro, sem overflow/erros JS/chamadas inesperadas.
Revisão independente: limpeza de página/valor inválido e referência antiga de foto corrigidas/reverificadas.
R2 real: envio, leitura e exclusão (GET posterior 404) de objeto temporário isolado aprovados. Sem
gravação de perfil no Neon; login real, fluxo ponta a ponta e Safari/iOS/celular físico sem homologação.

Detalhes: `2026-10-06-refinamentos-sistema.md`. System Design clonado do template, original preservado,
seis páginas renderizadas e inspecionadas. Evidências ignoradas em artifacts/refinamentos-2026-10-06/.
Alterações anteriores da API preservadas, inclusive índice staged. Sem publicação ou migrations.

## 2026-10-06 — Claude: cabeçalhos padronizados e ajustes de consistência

Pedido do dono: botões dos cabeçalhos no estilo de "Encontrar um imóvel", remover esse link e tirar a borda do
botão de tema; painel incluído. Entregue com `.linha-nav` no site e no painel. Também ajustados links que pareciam
texto comum, rotas fixas nas páginas de erro, rótulos digitados em maiúsculas no login e espaçamento herdado
nos selects do catálogo. Typecheck, lint, 21 testes, build, smoke SSR, curl das rotas públicas e QA efêmero
(Chrome, 390/1440, claro/escuro, API simulada) aprovados. Evidências: `artifacts/cabecalhos-2026-10-06/`.
Sem commit, push ou publicação.


## 2026-10-06 — Codex: Área do Corretor concluída e validada localmente

Plano completo autorizado e implementado: Imóveis/Contratos/Comissões/Cadastros/Corretores/
Visão geral/Perfil, fichas próprias, formulário e mídias, CampoNumero, guarda de modais e
paleta Ctrl/⌘+K. Ajustes anteriores do dono e permissões preservados. Detalhes e limites em
`2026-10-06-conclusao-area-corretor.md`; entradas anteriores são snapshots da execução.

Validação final: typecheck, lint, 3 arquivos/21 testes, build e smoke SSR aprovados.
Chrome/API simulada: 320 cenários, 140 capturas, ADMIN/CORRETOR, 320/390/768/1440 claro/escuro;
sem erros JS, chamadas inesperadas ou overflow horizontal. Revisão estática concluída e
achados corrigidos/reverificados. Amostras visuais inspecionadas. Diff-check e índice preservado.
Evidências: artifacts/conclusao-area-corretor-2026-10-06/. Nenhuma suíte rastreada ampliada.

Prévia Wi-Fi verificada no host: http://192.168.0.20:5173/admin/entrar; sondagem sem credenciais
chega à validação de campos sem rejeitar origem. Celular físico, Safari/iOS, login e integrações
reais permanecem sem homologação. Somente frontend/main; sem API/dados/dependências/publicação.

## 2026-10-06 — Codex: conclusão da Área do Corretor em andamento

O dono aprovou o plano completo para as telas restantes, fichas próprias, CampoNumero,
guardas de alterações e Ctrl/⌘+K. Esta autorização permite seguir após a revisão de Contatos.
Execução na main, preservando alterações locais e índice; frontend apenas, sem publicação.
Componentes compartilhados, integração e QA: Codex principal. Telas financeiras e cadastros:
implementador delegado com arquivos separados. Evidências em artifacts/conclusao-area-corretor-2026-10-06/.
Validação desta continuação ainda pendente; resultados anteriores não validam a nova entrega.

## 2026-10-06 — Codex: ajustes da revisão do dono

Plano aprovado e implementado: seletores de filtros compartilhados, tooltip sem rolagem,
retorno por Esc ao histórico interno, menu mobile em tela inteira, cards/ações alinhados,
Atendido estilizado, remoção do filtro sem foto e origem/consentimento reservados à ficha.
Implementação e validação local concluídas; fonte desta etapa: `2026-10-06-ajustes-painel.md`.
Etapas restantes do plano anterior continuam pendentes. Alterações locais/índice preservados,
sem backend, banco, novas dependências ou publicação.

**Validação final:** typecheck, lint, 3 arquivos/21 testes existentes, build e smoke SSR
aprovados. Chrome/API simulada: 63 cenários, 59 capturas, sem erros JavaScript,
requisições API inesperadas ou overflow horizontal. Matriz 320/390/768/1440 claro/escuro
para Pessoas, Contatos, Corretores, Imóveis, ficha, seletor e menu. Inclui teclado,
tooltip sem rolagem, histórico/POP/entrada direta, guarda de edição, seletores das demais
listagens, atendimento erro/retry/transições e permissões ADMIN/CORRETOR; regressão pública
de catálogo, detalhe e menu. Capturas representativas inspecionadas visualmente.
`git diff --check` aprovado; diff staged antes/depois com SHA-256 idêntico.
Evidência ignorada: `artifacts/ajustes-painel-2026-10-06/`.

API/banco/serviços reais, Safari/iOS e dispositivo físico continuam sem homologação.
QA simulado não altera dados reais. Nenhuma suíte rastreada foi criada ou ampliada.

## 2026-10-06 — Codex: Contatos implementado, em revisão do dono

Retomada autorizada a partir de `a2a9f81` (parceiro), usando a especificação
`2026-10-06-painel-especificacao-visual.md`, que prevalece sobre o plano anterior revertido.
Primeiro marco entregue: Pendentes/Atendidos, checkbox de ida e volta, finalização confirmada,
histórico separado e reabertura somente por ADMIN no frontend. Filtros, paginação por fila,
CSV da página, mensagem e WhatsApp preservados; Pessoas/EditorPessoa compartilham a permissão.
Tooltips do painel usam popover sem cortar nas listagens; erros/dicas seguem a escala auxiliar
e o cabeçalho de modal recebe o espaçamento mobile somente em `.painel-ui`.

Validação final: typecheck, lint, 21/21 testes existentes, build e smoke SSR aprovados.
Chrome com API simulada: 24 cenários e 38 capturas, incluindo ADMIN/CORRETOR, 390/768/1440,
claro/escuro, navegação, falhas/retry e regressão pública; sem erro JS ou overflow horizontal.
Evidências locais ignoradas: `artifacts/area-corretor-2026-10-06/`. Integração real e Safari/iOS
continuam sem homologação; a exclusividade ADMIN para reabrir não é imposta pela API nesta etapa.

**Próximo passo:** o dono revisar Contatos, conforme seção 8 da especificação: "Parar para o dono
conferir." Depois seguem Imóveis/Contratos, demais telas, fichas próprias, números, guardas e Ctrl+K.
Nenhuma dessas fases posteriores foi implementada nesta entrega. Main, histórico e alterações
preexistentes preservados; sem novas dependências, alterações de API/dados, migration ou publicação.

## 2026-10-04 — Antigravity: consolidação de todos os arquivos .md em docs/

A pedido explícito do dono, todos os arquivos markdown (.md) do projeto foram movidos para a pasta `docs/`.
As subpastas (`docs/audits/`, `.claude/agents/`, `.claude/commands/`) foram excluídas, centralizando
toda a documentação em um nível plano dentro de `docs/`.
Arquivos de regras e instruções (AGENTS.md, CLAUDE.md) atualizados para apontar para `docs/`.
## 2026-10-04 — Publicação autorizada pelo dono: ajustes da revisão externa e suíte mínima

Pedido explícito do dono: commit e push da implementação na main. Escopo: filtros do catálogo enxutos,
novo herói de rua comercial, ações do detalhe no card de valor, soma atenuada, catálogo de demonstração
variado, suíte mínima de 21 testes vitest, limpeza de tsconfig.json e .gitignore, documentação em docs/INDICE.md e docs/plans/.
Sincronizado via fast-forward com o commit be877c0 do parceiro antes do envio. Typecheck, lint, vitest
e seo-smoke aprovados (exit 0). Sem deploy/migração de produção.

## 2026-10-03 — Antigravity: remoção do andaime sobreposto ao operário em /devs

A pedido do dono, corrigida a animação do operário no overlay de /devs (CenaObra.tsx).
Removido o bloco do andaime que se sobrepunha diretamente ao personagem, eliminando o artefato
visual da prancha amarela atrás da cabeça e da haste vertical.
Validação: typecheck, lint, build e seo-smoke aprovados (exit 0).
npm test: exit 1, sem arquivos de teste, conforme decisão do dono.

## 2026-10-03 — Codex: carga persistente do catálogo concluída localmente

Pedido esclarecido pelo dono: preencher o Neon atual da API com 12 imóveis e fotos da internet,
sem modo de demonstração no frontend. Criar ADMIN Codice conforme escolhas em conversa.
Neon direto: 12 novos imóveis disponíveis, 36 fotos, 9 características, Codice ADMIN e nenhum
cadastro auxiliar duplicado. Backup privado antes da escrita; verificação comparou o snapshot
completo e preservou todas as linhas anteriores. As fotos ficam em cópia no R2 e o banco aponta
à CDN Unsplash, pois a URL pública do bucket responde 401; nenhuma política de acesso foi alterada.
SSR/ficha/galeria conferidos localmente com uma foto carregada. Typecheck/lint/build API aprovados;
npm test sai 1 sem suítes. Documentação da API e frontend atualizada. Sem migration, commit,
push ou deploy; credenciais ficam em pasta local restrita fora do Git/OneDrive.

## 2026-10-03 — Codex: publicação do cartoon de indisponibilidade autorizada

Pedido explícito do dono: commit e push da implementação na main. Escopo: cena de reparo,
sondagem/recuperação da página, smoke existente e os cinco documentos de contexto.
Após fetch, main/ origin estavam sincronizadas (0/0). Typecheck/lint/smoke repetidos e aprovados;
npm test repetido: exit 1, sem arquivos, conforme decisão do dono. Build e 22 checks Chrome da
implementação permanecem válidos: nenhuma mudança posterior no código de produção.
Excluir do commit dev.mjs, vite.config.ts e anexos preexistentes; artefatos ignorados não publicados.
Sem deploy/migration/API/dados reais; pendências de homologação do registro abaixo mantidas.

## 2026-10-03 — Codex: cartoon e recuperação da indisponibilidade concluídos localmente

Implementada a espera pública 5xx com cena de reparo silenciosa, pausa/movimento reduzido e
sondagem HEAD da própria página. Recuperação 200/404 recarrega a URL original; erro/timeout conserva
a espera. Timers/requests invalidados ao sair/trocar URL/ocultar/offline; filtros/hash preservados no JS.
Área liberada: Codex integrou serviço/hook/página/docs/QA; cena_reparo implementou SVG/CSS próprios.
Typecheck/lint/build e smoke SSR aprovados; 22/22 verificações Chrome com API simulada aprovadas
(14 cenários e 8 layouts 320/390/768/1440 claro/escuro). Sem erros JS/hidratação ou overflow observados.
`npm test` terminou exit 1 por ausência de arquivos, conforme remoção do dono; suítes não recriadas.
Pendências: cache/CDN/cold start publicados, API/serviços reais, Safari/iOS e dispositivos físicos.
Visibilidade testada por evento simulado; tempos 30/50s por relógio virtual. Serviços QA próprios encerrados.
Evidências ignoradas em `artifacts/indisponibilidade`; quatro diretórios vazios fora do repo ficaram após
rejeição automática da limpeza, descrita em CHANGELOG_AI. Main; alterações locais anteriores preservadas.
Sem dependências novas, commit/push/deploy ou alteração em dados/API reais.

## 2026-10-03 — Codex: cartoon e recuperação da indisponibilidade em andamento

Plano aprovado pelo dono em conversa. Área assumida: Codex (sondagem HEAD, hook de recuperação,
integração da página, documentação e QA); subagente cena_reparo (SVG e estilos próprios da cena).
Animação de reparo sem som, pausa/movimento reduzido e recuperação automática da URL original.
Somente frontend, direto na main; preservar dev.mjs, vite.config.ts e anexos locais preexistentes.
Sem API real, dependências novas, recriação de suítes, commit/push/deploy ou mudança de dados.
Validação prevista: typecheck/lint/build, smoke SSR e navegador com API simulada.

## 2026-10-03 — Codex: refinamento do frontend concluído localmente

Público e painel refinados conforme o plano aprovado: ações auxiliares em ícones com alvos de
44px, catálogo compacto, filtros removíveis, custos e contato melhor posicionados no mobile,
galeria navegável, navegação completa do painel, resumo por prioridade e formulário em seis
seções com barra de salvar. Logo, cores, fontes, dados, permissões e contratos preservados.

Validação atual: typecheck/lint/build e smoke SSR aprovados; 97 verificações Chrome (84 layouts
e 13 cenários), mais 5 registros de fluxos complexos, sem falhas/erros de página. Matriz principal
320/390/768/1024/1440 nos dois temas; telas adicionais em 390/1440. API inteiramente simulada.
`npm test -- --maxWorkers=1 --reporter=dot` foi executado e terminou com código 1 por ausência
de arquivos de teste, conforme a remoção pelo dono; nenhuma suíte fonte foi recriada.

Pendências de homologação: API/banco/R2/Drive reais, reprodução de vídeos reais, Safari/iOS e
dispositivos físicos. Filtros administrativos na URL seguem tarefa futura. Documentos atualizados
sem apagar histórico. Main em 80717c0, HEAD/origin = 0/0 na conferência; API irmã limpa.
Sem dependências novas, commit/push/deploy ou escrita em dados reais. Evidências locais ignoradas
em `artifacts/refino`; prévia sintética em http://127.0.0.1:4180 durante esta sessão.

## 2026-10-03 — Codex: refinamento do frontend em andamento

Plano aprovado pelo dono: público e painel, identidade preservada, ações auxiliares com ícones
compactos, hierarquia e navegação mais claras. Área assumida: Codex (base compartilhada,
integração, documentação e QA), com subagentes em arquivos distintos do público, painel e formulários.
Somente frontend, direto na main; sem API, dependências, recriação de suítes, commit/push ou deploy.
Validação prevista: typecheck/lint/build, smoke SSR existente e navegador com API simulada.

## 2026-10-03 — Remoção de testes por solicitação do dono

Removidos 46 arquivos `*.test.*`/`*.spec.*` do frontend e 28 da API irmã. Mantido o código de produção.
Nenhum teste foi executado após a remoção; os resultados abaixo e no histórico são evidência da execução
anterior, não da árvore atual. Scripts e dependências de teste permanecem sem suítes fonte.

## 2026-10-03 — Codex: revisão das correções concluída localmente (sem commit)

Pedido do dono: revisar as correções baseadas na auditoria de 02/10 e melhorar o que estivesse inadequado.
Corrigidos vínculos legítimos no PATCH de contrato (A01), limite durante recepção multipart/concorrência e lock
fora de transação (A02), respostas obsoletas e refresh compartilhado (A04), preservação de características
sem ressuscitar vínculos removidos (A09) e busca telefônica com +55 (A10). Correções anteriores A05–A08 mantidas.

Validação: frontend typecheck/lint, 43 arquivos/231 testes, build e SEO smoke aprovados; API typecheck/lint,
27 suítes/188 testes e build aprovados, 1 suíte/4 testes PostgreSQL não executados. HTTP sintético cobre A01,
upload chunked agregado, autorização anterior ao storage, concorrência e limite de 20 arquivos. Sessões e
round-trip de características exercitados com persistência sintética. API lenta/recuperação e teto SSR testados.
Navegador local: catálogo, detalhe e 404; robots/sitemap por HTTP. Sem homologação de banco/Drive/R2 reais,
infra publicada ou testes de carga. A09/A10/A11/H01 conservam pendências operacionais no relatório.

Trabalho direto na main, HEADs sincronizados com origin/main após fetch (0/0 em ambos). Alterações locais
anteriores preservadas. Sem commit/push/deploy/migration ou escrita em serviços reais nesta revisão.
Relatório: docs/audits/2026-10-02-auditoria-fullstack.md no Corretor-web.


## 2026-10-03 — Codex: revisão das correções da auditoria (em andamento)

Área assumida: A01–A11 e documentação, por pedido do dono. Revisão e correções com testes locais/sintéticos; sem commit, deploy, migrations ou escrita em serviços reais. Alterações locais anteriores preservadas.


## 2026-10-03 — Muse Spark: manutenção da auditoria full stack concluída em código (sem commit)

Endurecidos A06 (fonte única), A07 (stale guard + remonte), A08 (sequência + erro visível + bloqueio),
A09 (tipo + round-trip, sem marcar) e A11 (orçamento 45s + `Retry-After`, sem marcar) após pull dos dois repos
(front `8d40cb8`, back `85a6301`). Validado: typecheck/lint, front 43 arquivos/223 testes, API 24 suítes/175 testes,
build e seo-smoke aprovados. Checkboxes A06–A08 atualizados; A09/A10/A11/H01 seguem abertos. Sem commit/push
(aguardando confirmação do dono, direto na `main`).

## 2026-10-02 — Antigravity: resolução dos Gaps de Execução no Frontend (GAP-06, GAP-07, GAP-08 concluídos)

Concluído com sucesso:
- GAP-06 (Audit A06): Validação estrita de telefone com DDD nacional no formulário de contato (`telefoneValido` em `src/servicos/contato.ts`), alinhada com `@TelefoneValido()` da API, e bloqueio de `window.open` em caso de telefone inválido (`src/componentes/FormularioContato.tsx`).
- GAP-07 (Audit A07): Sincronização da paginação das 3 colunas em `/admin/contatos` (`src/paginas/painel/Contatos.tsx`), resetando para página 1 ao alterar filtros de busca/data, e proteção do botão de exportação CSV em caso de erro na requisição.
- GAP-08 (Audit A08): Seleção direta de contratos por ID via `api.obterContrato(valor.id)` na tela de registro de comissões (`src/paginas/painel/Comissoes.tsx`), eliminando buscas aproximadas em lista paginada e garantindo vínculo correto do imóvel.
Validação: typecheck (0 erros), lint (0 avisos), 39 arquivos / 195 testes aprovados, build de produção e `seo-smoke` aprovados.

## 2026-10-02 — Antigravity: injeção de dados de demonstração concluída

Concluído povoamento do banco Neon (corretor-db): 9 imóveis completos com mídias e fichas internas (avaliações mercadológicas), 12 características, 5 corretores/usuários, 12 pessoas (clientes, proprietários, inquilinos e leads nos 3 status de contato), 2 contratos de locação ativos e 3 comissões com parcelas. Validado com testes passando em ambos os repositórios.

## 2026-10-02 — Codex: publicação dos easter eggs autorizada pelo dono

Pedido explícito: commit e push na main. Pacote: cartoon no `/devs` e 404,
diálogo acessível, som automático sujeito ao navegador, limpeza do áudio e testes.
Diff revisado, origem sincronizada antes do commit; publicação destinada a origin/main.
Validações da sessão registradas em CHANGELOG_AI. Somente arquivos dessa tarefa;
anexos locais e artefatos ignorados ficam fora do commit. Sem operação na API/banco.

## 2026-10-02 — Codex: autoplay da obra concluído (sem commit)

A pedido do dono, a intro tenta áudio automaticamente em toda entrada no `/devs`,
inclusive acesso direto. Botão e fallback preservados quando o navegador bloqueia.
Área assumida: ObraOverlay e testes/documentação; sem commit/push.
Validado: typecheck/lint, 42 arquivos/216 testes, build, seo-smoke e 5 cenários
Chrome direcionados a áudio/teclado. Autoplay autorizado toca as três faixas no
acesso direto; bloqueio permite repetir no botão. Mudo e saída param as faixas.

## 2026-10-02 — Codex: refinamento cartoon dos easter eggs concluído (sem commit)

Área assumida: cenas do `/devs` e 404, diálogo acessível, limpeza do áudio e validação visual.
Plano aprovado pelo dono: preservar intro de 5s, retorno em 8s e dados dos desenvolvedores.
Frontend apenas, direto na main, sem commit/push. Nenhum outro agente editando esta área.

Obra em perspectiva com operário e entrega da casa em etapas; 404 com ruína, porta/placa
balançando e feno atravessando. Intro usa `Dialogo` nativo; sem JS, o modal fica fechado
e os créditos acessíveis. Áudio pendente não reativa após saída, inclusive em StrictMode.
Validação: typecheck/lint, 42 arquivos/216 testes, build e seo-smoke aprovados; 20 cenários
Chrome desktop/matriz dos easter eggs + 5 cenários públicos mobile. Matriz revisada por
prints em 320/390/768/1440px, claro/escuro; teclado, áudio real/bloqueado, saída de rota,
redução de movimento, sem JS e histórico conferidos. API simulada; Safari/iOS e aparelhos
físicos não conferidos. Detalhes e comandos no novo registro de `CHANGELOG_AI.md`.

## 2026-10-03 — Muse Spark: 404 com casa quebrada (commit `92d9e99`)

Implementada a 404 personalizada: `CasaQuebrada` em SVG (ruína divertida, tokens
navy/gold, `animate-feno` + `animate-feno-girar` em `tailwind.css`, SSR-safe) e
`PaginaErro` com `404` gigante, countdown de 8s e volta automática ao catálogo com
botão `Ficar aqui` (só no 404; 503 inalterado). SSR segue 404 `noindex,nofollow`,
sem fetch. Validado: typecheck, lint, 42 arquivos/210 testes, build e seo-smoke
aprovados; CSS e bundle SSR conferidos. Commit `92d9e99` na `main` + push
`1c81e63..92d9e99` a pedido do dono. Pendente conferir no navegador: 404 desktop/mobile nos dois temas, reduced-motion,
countdown, volta automática e cancelamento.

## 2026-10-03 — Muse Spark: áudios reais no overlay do /devs (commit `a086849`)

A pedido do dono: saiu a seção fixa ("card da casa") e o overlay virou o easter egg único, agora com
áudios reais de obra em vez do synth. Três MP3 CC0 do BigSoundBank vendored em `public/assets`
(furadeira #0184 aparada p/ loop de 10s, martelo #0005, ambiente #0631 aparado p/ 30s; ~650KB, lazy só
no /devs). Overlay tenta o som sozinho p/ quem veio do rodapé, com botão Com som/Mudo; para tudo ao sair.
Validado: typecheck, lint, 40 arquivos/202 testes, build e seo-smoke aprovados; SSR 200, `noindex,follow`,
sem fetch; MP3s conferidos no `dist`. Commit `a086849` na `main` + push
`38b21fb..a086849` a pedido do dono. Pendente ouvir no navegador
(clique no rodapé, URL direta, temas, mobile, Safari/iOS).

## 2026-10-03 — Muse Spark: overlay de abertura da obra no /devs (sem commit)

Evolução do easter egg a pedido do dono: intro fullscreen com glassmorphism (`ObraOverlay`, `z-50`,
`backdrop-blur`) sobre o `/devs`, com a casa animada e saída automática em ~5s (botão Pular, Escape ou
clique fora também dispensam). Cena SVG extraída para `CenaObra.tsx`, reutilizada na seção fixa; som
continua só na seção (`CasaEmObra`). Validado: typecheck, lint, 41 arquivos/205 testes, build e seo-smoke
aprovados; SSR do `/devs` 200, `noindex,follow`, estático e sem fetch. Sem commit/push (aguardando o dono).
Pendente conferir no navegador: entrada/saída do overlay, temas, mobile e Safari/iOS.

## 2026-10-03 — Muse Spark: easter egg da casa em obra no /devs (sem commit)

Área assumida: canteiro sempre visível no `/devs` com casa em SVG animado + som de obra sintetizado
(`src/servicos/obra.ts`, `src/componentes/CasaEmObra.tsx`, integração em `Devs.tsx`/`LayoutPublico.tsx`,
keyframes em `tailwind.css`). Som liberado pelo clique que leva ao `/devs`, com botão fallback.
Validado: typecheck, lint, 40 arquivos/199 testes, build e seo-smoke aprovados; SSR do `/devs` 200,
`noindex,follow`, estático e sem fetch. Sem commit/push (aguardando confirmação do dono).
Pendente conferir no navegador com som: clique no rodapé, URL direta, temas, mobile e Safari/iOS.
> Marcador de merge histórico preservado como nota: `>>>>>>> 04d93d9740780040dfc9dc83cc37754f5ad5fbd0`.

## 2026-10-02 — Auditoria técnica full stack documentada

Auditoria registrada em `docs/audits/2026-10-02-auditoria-fullstack.md`; fotografia original: frontend `94ebcef`, API `e3b0a32`.
Veredito: bloquear publicação até corrigir A01. O remoto atual já contém alterações posteriores; A04/A05 têm correções aparentes descritas no relatório.
Na auditoria passaram typecheck/lint dos dois repositórios; frontend 37 arquivos/178 testes; API 25 suítes/173 testes,
com bootstrap e integração PostgreSQL excluídos. Três reproduções usaram dados sintéticos. Nenhuma correção foi iniciada nesta tarefa documental.

## 2026-09-16 — Claude: contrato v2 concluído no front (ids inteiros, pessoas, ficha do imóvel, português)

Implementado e validado: typecheck, lint, 37 arquivos/177 testes, build e `seo-smoke` aprovados no front;
na API, typecheck, lint, build, 175 testes e a integração da migration em PostgreSQL 16 aprovados.
Falta conferência no navegador com a API v2 local e E2E autenticado; publicação exige corte coordenado
(front e API juntos) e migração do banco com backup. Sem commit/push.

## 2026-09-16 — Claude: contrato v2 (ids inteiros, pessoas, ficha do imóvel, front em português)

Área assumida: implementação das decisões do dono de 16/09 nos dois repositórios, conforme
`docs/specs/2026-09-16-ids-inteiros-pessoas.md`. Front: tipos e serviços em português sem tradutor,
mídia enviada na criação do imóvel, contatos em três colunas, cadastro único de pessoas, filtros e
ordenação no catálogo, componentes compartilhados do painel. Fora desta rodada: aviso de novo
contato, regras de locação/comissão (tarefas abertas). Em andamento; sem commit/push.

## 2026-09-16 — Claude: diagnóstico de produto (somente leitura)

Área assumida: varredura completa do front e da API com olhar de corretor, sem alteração de código,
dados ou banco. Resultado em `docs/plans/2026-09-16-diagnostico-produto.md`: 7 pontos críticos
(rascunho/publicação, aviso de contato, funil, pessoas em três cadastros, ficha do imóvel, busca,
textos de privacidade), melhorias por área, funcionalidades em P1/P2/P3 e dívidas de manutenção
(Prettier, dois vocabulários, duplicação no painel). Aguarda o dono escolher a ordem para virar
tarefas em `TASKS.md`. Sem commit/push.

## 2026-09-16 — Slugs públicos inválidos retornando 503

Área assumida: correção do 503 causado por URL de imóvel malformada, sem alteração de dados,
API ou banco. O SSR agora valida o slug no formato aceito pela API antes de fazer a consulta;
o cliente também rejeita slugs inválidos como 404. A URL de teste com `OR`, aspas e `released`
passa a ser 404 sem alcançar a API; slugs válidos permanecem inalterados.
Validação inicial: testes direcionados (3 arquivos/50 testes) aprovados. Ainda pendentes as
validações completas e commit/push.

## 2026-09-16 — Correção de achados do relatório de segurança web

Área assumida: hardening do front/SSR, sem alteração de dados, banco, uploads ou CORS.
Corrigidos: headers do proxy que podiam ser sobrescritos pelo upstream; respostas de erro
do proxy sem headers; rewrites externos da Vercel sem headers; e `API_ORIGIN` HTTP aceito
em produção. O token de acesso já estava somente em memória e os achados de dados públicos,
brute force, upload e R2 pertencem à API/infraestrutura, não foram alterados nesta tarefa.
Validação: typecheck, lint, 31 arquivos/150 testes, build, `git diff --check` e `node scripts/seo-smoke.mjs`
aprovados. Sem commit/push; alterações locais anteriores foram preservadas.


## 2026-09-16 — Muse Spark: chip "Todos os imóveis" + scroll dos filtros concluídos (sem commit)

Corrigidos os dois sintomas do dono, só no front (back autorizado, mas não foi preciso):
chip "Todos os imóveis" com texto invisível e filtros rolando a página ao topo.
Causa do chip: `chipBase` + `chipSelected` empilhavam `bg-transparent` vs `bg-navy` e
`text-muted` vs `text-white` no mesmo elemento — no Tailwind vence a ordem do CSS gerado,
não a do atributo, e o resultado era branco sobre branco. Causa do scroll: `ScrollToTop`
fazia `scrollTo(0,0)` em toda troca de pathname, e filtro de tipo troca o pathname.
Validação: typecheck, lint, 30 arquivos/148 testes, build e seo-smoke aprovados.
Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador.

## 2026-09-15 — Headers defensivos no SSR

Aplicados headers de segurança no SSR e no proxy `/api`: `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`. Nenhum registro,
imóvel ou dado de banco foi alterado. CORS do backend permaneceu intacto.

## 2026-09-15 — CSS inicial antes da hidratação

Corrigido o flash de HTML sem estilos no reload das páginas SSR, observado no `/devs`.
O problema era que Tailwind e `global.css` só eram carregados como imports de
`src/main.tsx`, depois que o bundle React começava a executar. Os stylesheets agora
são declarados no `<head>` do `index.html`; o build de produção continua emitindo
um CSS versionado pelo Vite.

Correções finais da revisão: o tema foi protegido contra o replay de efeitos do
React StrictMode e a rejeição de origem não dispara mais `session-expired`.
Validação completa aprovada; publicação Git autorizada pelo dono.

> Backend integral de 14/09/2026: ver registro ao final e `docs/handoffs/2026-09-14-backend-portugues.md`. A UI atual ainda depende do contrato anterior; não publicar a API nova isoladamente.

Atualizado em: 2026-09-13
Agente responsável: opencode (commit e push `5f916cb` em 13/09/2026, a pedido do dono)
Commit da `main`: `5f916cb` — "feat: mobile vitrine no público, menu navegável e admin afinado"
Repositório irmão: corretor-api, `main` em `a41f49b`

## Em andamento

- Estratégia E2E endurecida em 14/09/2026: navegação mobile usa Tab real, persistência do tema verifica a classe `dark` após reload e escritas Playwright bloqueiam destinos externos sem `E2E_ALLOW_EXTERNAL=true`. A execução autenticada ainda exige credenciais e backend de homologação.

- Tailwind v4 migração total concluída no código (13/09/2026, opencode): `tailwindcss` + `@tailwindcss/vite`,
  `src/styles/tailwind.css` com `@theme` navy/gold + `.dark`, zero `.module.css` restantes (público + admin);
   typecheck, lint, 21 arquivos/98 testes, build e seo-smoke aprovados. Commit `4e928e4` na main.
   Pendente conferir no navegador: catálogo, detalhe, admin, dark e mobile 320–390px.
- UX-003 rebrand concluído e commitado em `71d809b` (13/09/2026, Codex): marca Lucas Gobatto CRECI 15776, Juara/MT,
   navy/gold/branco só no front; typecheck, lint, 18 arquivos/62 testes, build e seo-smoke aprovados.
   SVG/PNG oficial do logo pendente.
- Correção do 404 do painel de locações concluída: o serviço Render `Corretor-API` foi atualizado para `4b9377c`; API direta e proxy Vercel agora respondem `401 Unauthorized` nas rotas protegidas, confirmando que as rotas estão publicadas. A migration de locações já estava aplicada no banco de teste.

- Ambiente de desenvolvimento no ar: front SSR em `http://127.0.0.1:5173` e API em `http://localhost:3000`.
- Pesquisa de deploy (Render e Vercel) iniciada pelo Claude; resultado ainda não incorporado às tarefas.

## Concluído recentemente

- **UX-004 melhorias de front sem back (13/09/2026, opencode).** Conversão mobile (CTA fixo, share,
  mapa), galeria (eager/lazy, `aria-live`), LeadFormModal (`inputMode`, foco no erro), cards com
  fallback, skeletons, breadcrumb com classe, características legíveis, semelhantes, `end` no NavLink
   inicial e retoques do admin. Typecheck, lint, 20 arquivos/68 testes, build e seo-smoke aprovados.
   Commit `71d809b` na main.

- **Catálogo e detalhe público refinados (13/09/2026).** Melhorados hero, busca, estados vazios, cartões, card de
  contato, fatos da área, galeria com navegação por teclado e responsividade, sem alterar a API ou o fluxo de leads.
  Typecheck, lint, testes e build aprovados. A conferência manual do SSR exibiu a indisponibilidade esperada porque
  a API local não estava respondendo.

- **Modo demonstração removido por inteiro (12/09/2026).** Saíram `src/services/demo.ts`, `src/services/demo.test.ts`,
  `.env.demo`, a variável `VITE_DEMO_MODE`, os scripts `dev:demo`/`build:demo`/`preview:demo`, o campo `demo` de
  `SeoConfig`, o Proxy de `api.ts` e todos os ramos de interface (botões de login fictício, faixa de aviso no site,
  sufixo no painel, textos alternativos do formulário de contato). Decisão registrada em `DECISIONS.md`.
- **Identidade centralizada em `src/config/brand.ts` (12/09/2026).** Os 13 pontos que repetiam "Corretor Comercial"
  e "Mato Grosso" passaram a ler do `brand`, incluindo logotipo do cabeçalho, `og:site_name`, JSON-LD e `llms.txt`.
  A renderização final não mudou: foi conferida antes e depois.
- **Verificação após as duas mudanças:** 16 arquivos de teste e 57 testes aprovados (eram 17 e 64 — a diferença é o
  `demo.test.ts` removido); lint, typecheck e build sem erro; `scripts/seo-smoke.mjs` aprovado.

- **Sincronização:** a cópia local estava em `78200ff` e foi atualizada para `d4f6b2f`, que trouxe SSR das páginas
  públicas, metadados com Open Graph e Twitter Cards, JSON-LD, `robots.txt`, `sitemap.xml` e `llms.txt` dinâmicos,
  `vercel.json` com Build Output API v3 e as variáveis `API_ORIGIN`, `SITE_URL` e `SEO_INDEXABLE`.
- **Verificação local:** 17 arquivos de teste com 64 testes aprovados; lint, typecheck e build sem erro.
  O build gera `dist/client`, `dist/server` e `.vercel/output` com a função `render`.
- **Smoke do SSR em modo demo:** catálogo, detalhe de imóvel, `robots.txt`, `sitemap.xml`, `llms.txt`, política de
  privacidade e login responderam 200; rotas inexistentes responderam 404; com a indexação desligada, as páginas
  saem com `noindex` e o sitemap vem vazio, como esperado.
- **Homologação com a API, o Neon e o R2 reais:** login pelo proxy `/api` com cookie de refresh, página SSR de um
  imóvel renderizada com JSON-LD `RealEstateListing`, `BreadcrumbList`, canonical e `og:image` apontando para uma
  imagem real no R2, e lead registrado com consentimento.

## Bloqueios

- A API ainda não está publicada, então o front não tem para onde apontar em produção.
- Plano Hobby da Vercel restringe uso comercial; isso precisa ser resolvido antes de publicar um produto vendido a corretores.
- O SSR busca dados públicos da API com timeout de 10 s por requisição. Se a API ficar em um plano gratuito que
  suspende por inatividade, a primeira visita depois de um tempo parado tende a estourar esse limite e a página
  cai para o estado de indisponibilidade.

## Próximo passo

Concluir a pesquisa de publicação e decidir onde o front será hospedado, considerando a restrição comercial do
plano Hobby e o formato de build atual, que é específico da Vercel (Build Output API v3 com função `nodejs24.x`).

## Arquivos modificados recentemente

Removidos: `src/services/demo.ts`, `src/services/demo.test.ts`, `.env.demo`.
Alterados: `src/config/brand.ts` (reescrito), `src/services/api.ts`, `src/seo/server.tsx`, `src/seo/metadata.ts`,
`src/seo/server.test.ts`, `src/seo/navigation.test.tsx`, `src/pages/admin/Login.tsx`, `src/pages/admin/AdminLayout.tsx`,
`src/pages/admin/Admin.module.css`, `src/pages/public/Catalog.tsx`, `src/pages/public/PrivacyPolicy.tsx`,
`src/components/PublicLayout.tsx`, `src/components/PublicLayout.module.css`, `src/components/LeadFormModal.tsx`,
`src/components/LeadFormModal.module.css`, `scripts/dev.mjs`, `scripts/build.mjs`, `scripts/preview.mjs`,
`scripts/seo-smoke.mjs`, `package.json`, `.env.example`, `DECISIONS.md`, `TASKS.md`, `PROJECT_STATUS.md`, `CHANGELOG_AI.md`.

## Ambiente local

`.env` (não versionado) com `VITE_API_URL=/api`, `API_ORIGIN=http://localhost:3000`,
`SITE_URL=http://127.0.0.1:5173` e `SEO_INDEXABLE=false`. A linha `VITE_DEMO_MODE` foi retirada em 12/09. A `SITE_URL` local foi definida nesta sessão porque
sem ela o SSR não gera canonical nem JSON-LD.

## 2026-09-12 — Codex: administração de locações em implementação

Área assumida: cadastros, contratos e documentos privados (ADMIN). Escopo aprovado em docs/plans/2026-09-12-rental-administration.md. Comissão e financeiro aguardam etapa própria. Alterações preexistentes preservadas; sem commit/push e sem mudança automática do banco real.

Implementação local concluída e pronta para revisão. Front: rotas de proprietários, inquilinos e contratos, fichas, busca/paginação, seletores de imóvel/partes, anexos privados e download autenticado. API: módulo `rentals`, migration aditiva, criptografia de dados privados, validação de arquivos e regras de vínculo. Comissão de captação iniciada: valor equivalente a um aluguel, parcelas configuráveis e confirmação manual ADMIN. Migration do Neon e bucket R2 privado ainda não foram aplicados/configurados. SI9/Imonov permanece fora do escopo.

### Ambiente de teste (2026-09-13)
- Bucket privado R2 criado: \corretor-documentos-test\.
- Deploy Vercel e branch Neon pendentes de reconexão das sessões locais (CLI sem autenticação válida).

- Vercel conectado e primeiro deploy publicado: https://corretor-web-test.vercel.app
- Neon conectado; projeto de teste \
oyal-haze-18985318\ (corretor-db-test), migrations aplicadas.

## 2026-09-13 — Codex: revisão e deploy do front
Área assumida: revisão de UX-003/UX-004, validação e atualização do projeto Vercel corretor-web-test, conforme pedido do dono. Em andamento; alterações preexistentes preservadas.


### Revisão/deploy finalizados — 13/09/2026
Codex concluiu UX-003/UX-004 no ambiente https://corretor-web-test.vercel.app (dpl_8ZTk6bsKwV8xnqye5nUDo6EdcRV4, READY). Typecheck, lint, 68 testes, builds local/remoto e SEO smoke aprovados. Catálogo vazio na API remota; detalhe/modal/CTA conferidos com fixture local. Sem commit/push. Logo oficial, dados de privacidade, homologação autenticada e lançamento comercial continuam pendentes. Este registro substitui o estado em andamento desta revisão e corrige os bloqueios históricos de infraestrutura para o ambiente de teste.


## 2026-09-13 — Codex: URLs em português
Área assumida: rotas do front, compatibilidade e SEO; implementação do plano aprovado em andamento. API sem mudanças de contrato.


## 2026-09-13 — Codex: URLs em português concluídas
Rotas públicas: /imoveis/{tipo}, /imoveis/para-alugar, /imoveis/para-comprar e combinações; query cidade/preco-minimo/preco-maximo/pagina. Painel: /admin/entrar e /admin/contatos. URLs antigas redirecionam 301; navegador usa replace; slugs e APIs preservados.
Publicação Vercel dpl_Bbf5617bGJdqKv79WJbuDDFJaP1M READY, alias https://corretor-web-test.vercel.app. SITE_URL e SEO_INDEXABLE configuradas em Production conforme autorização. Robots, llms e sitemap respondem 200; raiz index,follow; filtros noindex,follow; painel noindex,nofollow. Sitemap contém início e privacidade (catálogo público sem imóveis no momento).
Validação: typecheck, lint, build, suíte de 93 testes e teste adicional de navegação aprovado (94 no total coberto); smoke SSR/proxy/discovery aprovado. Navegador: redirecionamento, paginação e detalhe com fixture local; catálogo filtrado publicado confirmado. Login autenticado/logout e fichas reais não exercitados no navegador nesta sessão; permissões existentes cobertas pela suíte. Sem commit/push.


## 2026-09-13 — Preparação de commit e push autorizada
Codex: revisão do diff concluída; typecheck, lint, 21 arquivos/94 testes, build e smoke de SEO aprovados novamente. Front: código e documentação das URLs; API: somente documentação correspondente. Alterações anteriores da API em .env.example e .gitignore excluídas do commit.


## 2026-09-13 — Codex: investigação de upload de mídia
Logs do Render para o POST de mídia registram `write EPROTO ... SSL alert handshake failure` no processo da API. O proxy SSR repassa o multipart corretamente (`request.pipe(upstream)`), e o erro ocorre no salto API → R2 antes de salvar metadados. Hipótese confirmada como configuração/endpoint TLS do R2 no ambiente Render; não há evidência de bug no formulário ou no proxy. Pendente corrigir `R2_ENDPOINT` no serviço Render para o endpoint S3 HTTPS da conta Cloudflare (sem bucket no caminho), então repetir upload.
Área assumida: erro HTTP 500 ao enviar mídia no ambiente corretor-web-test; rastrear proxy, API e R2. Em andamento (opencode, 13/09/2026, 15h42: token corrigido — saiu `AccessDenied`, agora `NoSuchBucket` no `PutObject` do bucket hardcoded `corretor-midia` em `media.service.ts:48`; falta criar o bucket de mídia na conta de teste).


## 2026-09-13 — opencode: hambúrguer só no mobile (commit `2d0d8ac`)
Área assumida: botão hambúrguer aparecendo no desktop junto da navegação. Causa no `PublicLayout.module.css`: `.menuToggle{display:none}` empatava com `.buttonGhost{display:inline-flex}` do global. Fix com `button.menuToggle` (maior especificidade) no desktop e no `@media(max-width:650px)`. Typecheck, lint e 21 arquivos/98 testes aprovados. Commit `2d0d8ac` na main. Pendente conferir no navegador: desktop >650px sem botão, mobile ≤650px com botão.

## 2026-09-13 — opencode: mobile público com direção vitrine (plano commitado em `5f916cb`)

Área assumida: `docs/plans/2026-09-13-mobile-public.md` — tese ponto comercial Juara/MT, tokens navy/gold existentes, assinatura soleira dourada + placa de rua, wireframes 360px, P0/P1 com visual + P2 microcopy, validação 320–390px sem scroll-X e toques ≥44px. Plano e implementação commitados em `5f916cb`.

## 2026-09-13 — opencode: menu mobile não abria (corrigido, commit `5f916cb`)
Causa: `max-[650px]:hidden` + `max-[650px]:flex` aplicados juntos no `<nav>` — no CSS gerado o `hidden` vence o `flex`, então o menu nunca aparecia. Fix: classes mutuamente exclusivas + teste de regressão das classes. Conferido em 390px com dados reais: sheet navy abre com as 4 opções + CRECI. Typecheck, lint e testes do menu/navegação aprovados. Commit `5f916cb` na main.

## 2026-09-13 — opencode: mobile do admin (implementado, commit `5f916cb`)
Área assumida: mesmo padrão do público, agora no painel (`AdminLayout`, login, dashboard, listas, formulário, mídias, locações); sem `any`/dependência nova. Typecheck, lint, 21 arquivos/98 testes e build aprovados. Commit `5f916cb` na main. Pendente conferir no navegador 320–390px com login: navegação lateral, cabeçalhos, tabelas, filtros, formulário, mídias e fichas de locação.

## 2026-09-13 — opencode: mobile público vitrine (implementado, commit `5f916cb`)
Área assumida: `docs/plans/2026-09-13-mobile-public.md` — só público (header, catálogo, detalhe, galeria, busca, modal lead); admin fora. Base atual usa Tailwind (sem `.module.css`), então o plano foi aplicado como utilities, sem `any`/`fetch` direto/dependência nova. Typecheck, lint, 21 arquivos/98 testes, build e seo-smoke aprovados. Commit `5f916cb` na main. Pendente conferir no navegador 320–390px: menu, hero sem scroll-X, busca 1 coluna, CTA sticky navy único, galeria com snap, modal lead e toques ≥44px.

## 2026-09-13 — opencode: header do admin afinado no mobile (commit `5f916cb`)
Área assumida: `AdminLayout` — topo navy ocupava altura demais no mobile (print do dono).
Fix só com utilities: `aside` com `py-2.5/gap-2`, marca `16px/leading-tight`, nav sem `pb`
e links `min-h-10/text-14`, linha do usuário sem `mt-auto` no mobile e botão sair `min-h-9`.
Desktop (`lg:`) preservado. Typecheck, lint e teste do AdminLayout aprovados.
Commit `5f916cb` na main. Pendente conferir no navegador 320–390px.

## 2026-09-13 — opencode: avatar do usuário + modo noturno visível (implementado, sem commit)

Área assumida: a pedido do dono — avatar não aparecia e o modo noturno não tinha onde ser ligado.
`AdminLayout` exibe `avatarUrl` (fallback inicial); desktop mantém o bloco no rodapé do `aside`,
mobile mostra a foto no topo com dropdown (nome, papel, "Sair da conta", fecha em Escape/clique
fora). `useTheme` novo persiste `localStorage "theme"`, respeita `prefers-color-scheme` e aplica
`.dark`; alternador no header público e no painel + script anti-flash no `index.html`.
Typecheck, lint, 22 arquivos/104 testes e build aprovados. Sem commit/push (aguardando confirmação
do dono). Pendente conferir no navegador: dropdown 320–390px com login, dark no público e no admin.

## 2026-09-13 — opencode: perfil do admin + senha (implementado, sem commit)

Área assumida e concluída: `/admin/perfil` (foto grande, dados, métricas por status, edição própria),
troca da própria senha, reset de senha pelo ADMIN e filtro `status` no gerenciado da API.
Escopo autorizado pelo dono em 13/09/2026, incluindo back (repositório irmão).
E-mail só via Corretores/ADMIN, nunca no perfil.
Typecheck, lint, 24 arquivos/109 testes, build e seo-smoke aprovados.
Commit `31ee9bc` na main (inclui o trabalho pendente de avatar + modo noturno, `useTheme` e ajustes do
`PublicLayout`/`AdminLayout`, que estavam sem commit). Push `3f9f53f..31ee9bc main -> main`.
Pendente conferir no navegador com login: perfil 320–390px e desktop, avatar quebrado, edição,
troca de senha invalidando a antiga e reset pelo ADMIN.

## 2026-09-13 — opencode: capa no catálogo + decode no upload (commit `376219d`)
Área assumida: capa some no catálogo embora apareça no detalhe, mais o erro inglês "The source image could not be decoded." no formulário. Causa da capa na API (`PropertiesService.list()` sem `media`; corrigido no repositório irmão). Front: `prepareMediaFiles` agora pula arquivo ilegível com aviso em PT e mantém os válidos no lote; `MediaManager` exibe quais foram pulados e só envia quando há algo válido. Typecheck, lint, 21 arquivos/98 testes, build e seo-smoke aprovados. Commit `376219d` na main. Pendente conferir com a API no ar: catálogo com capa, upload misto (válido + corrompido) e redeploy da API no Render.


## 2026-09-13 — Codex: contrato da nova API em acompanhamento
Refatoração integral autorizada no repositório irmão; documentação compartilhada sob responsabilidade do Codex principal. Novo contrato português exige adaptação futura do front antes da publicação conjunta; esta tarefa implementa backend. Alteração preexistente .vscode/ preservada.

## 2026-09-14 — opencode: hamburger fora do desktop (commit `6c99b3c`)
Área assumida: a pedido do dono — botão hamburger aparecia no desktop. Causa: `buttonGhost` do `global.css` empatava com o `hidden` do Tailwind. Fix: botão só com utilities (`hidden` + `max-[650px]:inline-flex`). Typecheck, lint, 24 arquivos/109 testes aprovados. Commit `6c99b3c` na main. Pendente conferir no navegador >650px e ≤650px.

## 2026-09-14 — Codex: documentação do backend integral concluída

Sincronizados corretor-spec.json (histórico preservado), plano de projeto, AGENTS, decisões, tarefas e handoff docs/handoffs/2026-09-14-backend-portugues.md. API nova validada: typecheck/lint/build, 169 testes locais e 4 PostgreSQL/HTTP reais aprovados. Nenhum código frontend alterado, nenhum deploy/commit/push; pasta .vscode/ preexistente preservada.

A aplicação atual continua usando o contrato antigo. Próximo passo é API-PT-002: adaptar serviços, autenticação, classificações, clientes, contratos/Drive e financeiro/SSR antes da publicação conjunta. Homologação real de Drive/R2 e corte do banco ainda pendentes. Nenhum teste de UI executado por esta entrega documental.

## 14/09/2026 — frontend do modelo português em execução
Codex concluiu API-PT-002: painel, serviços, SSR, classificações dinâmicas, mídia, clientes, contratos e comissões integrados ao contrato português. Drive externo será configurado pelo dono. Plano: docs/plans/2026-09-14-frontend-portugues.md. Typecheck, lint, build e smoke SSR passaram; suíte completa teve 120 testes passando e dois erros transitórios de worker/jsdom no Windows na última execução.


## 2026-09-14 — Codex: contraste em execução
Área assumida: estilos compartilhados, textos e botões nos temas claro/escuro. Sem alteração de contrato ou publicação.


## 2026-09-14 — Codex: contraste concluído
Corrigida a cascata entre estilos globais e Tailwind, com tokens de ação para botões, textos adaptáveis ao tema e contraste em superfícies navy e cartões sem foto. Margens do container preservadas. Typecheck, lint, 125 testes, build e smoke SSR/Vercel aprovados. Catálogo/login/detalhe conferidos nos dois temas; mobile 390px sem overflow. Painel autenticado pendente de conferência visual; estilos compartilhados aplicados. Sem commit/deploy.

## 2026-09-14 — Codex: posição do alternador em execução
Cabeçalho público: agrupar navegação e tema à direita, preservando menu mobile e correções de contraste.


## 2026-09-14 — Codex: alternador público reposicionado
Concluído: navegação e tema agrupados à direita; 16px após Área do corretor no desktop, 8px entre tema/menu mobile. Cabeçalho compacto em telas intermediárias. Typecheck, lint e 125 testes aprovados. Navegador: 390/768/1280px nos dois temas, sem overflow; botão 44x44, menu/Escape e alternância por teclado confirmados. Sem commit/deploy.


## 2026-09-14 — Codex: publicação Git autorizada
Dono solicitou commit e push das correções de contraste e cabeçalho na main. Revisão preserva texto navy no CTA dourado do detalhe (PropertyDetail sem diff final) e corrige formatação histórica em DECISIONS. .vscode fora do commit. Validação final aprovada: typecheck, lint, 27 arquivos/125 testes e build; diff --check limpo. Commit/push autorizados na main; sem deploy manual.

## 2026-09-14 — Codex: estratégia de testes E2E em execução
Área assumida: Playwright Test no front + lacunas Vitest (contrato PT, sessão, comissões). Base: 27 arquivos/125 testes Vitest; API 26 suítes/169 + 4 integração homologacao_pt. Decisões do dono: HTTPS local autoassinado (cookie Secure), banco homologacao_pt existente, Playwright só em corretor-web. Sem commit/push/deploy sem autorização; .vscode/ preservada; sem dados reais.

## 2026-09-14 — Codex: estratégia de testes E2E concluída (sem commit)
Infra (`playwright.config.ts`, `tests/e2e/` com 11 specs, README, scripts `test:e2e*`) + Vitest (28 arquivos/136 testes). Validação: typecheck, lint, build, seo-smoke (portas alternativas) e Playwright 2x — 19 aprovados, 17 não executados (sem E2E_ADMIN_*/E2E_CORRETOR_*), 0 falhas. Servidores da sessão parados; estado de chegada restaurado. Bloqueio exato: credenciais de teste + confirmação do banco da API para os fluxos autenticados; HTTPS local para sessão pós-reload; homologação real do Drive. Detalhes em CHANGELOG_AI.md e DECISIONS.md. Sem commit/push/deploy.

## 2026-09-15 — Codex: rigor do E2E após revisão do dono (sem commit)
Corrigidos os 6 pontos: falso positivo do `http.test.ts`, SSR comprovado no HTML bruto + sem JS, imagem com carga real + persistência via API, tema comparado após reload + teclado só Tab/Enter, TLS autoassinado no fetch Node, trava anti-produção + `E2E_STACK=teste` + limpeza completa com status. Achado: `.env` local aponta à API de produção (só leituras atingiram produção; nenhuma escrita). Suíte: 37 testes/11 arquivos — 15 aprovados, 22 não executados (stack de teste + credenciais pendentes), 0 falhas. Servidores parados. Sem commit/push/deploy.

## 2026-09-15 — Codex: limpeza parcial + allowlist (sem commit)
Seed movido para dentro do `try` com IDs opcionais (comissão, contrato, lead, mídia, CRUD, catálogo): falha no meio do seed limpa o parcial, sem dado abandonado. Bypass `E2E_ALLOW_REMOTE`/`E2E_ALLOW_EXTERNAL` removido e unificado em `E2E_DOMINIOS_PERMITIDOS` (config importa a trava de `helpers/env`): remoto não listado aborta no carregamento (comprovado), domínio listado carrega. Validação: typecheck, lint, Vitest 136, Playwright 15/22/0. Preview parado. Sem commit.

## 2026-09-15 — Muse Spark: página /devs em execução
Área assumida: rota pública `/devs` com Eduardo Gobatto (@e.gobatto) e Fernando Riad (@_riad777), fotos dos avatares GitHub, links Instagram em nova aba, papel "Front-end e back-end" para os dois. Escopo: `src/config/devs.ts` + `src/pages/public/Devs.tsx`, rota cliente + SSR + metadados + sitemap + `llms.txt`, link só no rodapé, indexável. Sem commit/push sem confirmação do dono.

## 2026-09-15 — Muse Spark: página /devs concluída (sem commit)
Implementado e validado: typecheck, lint, 29 arquivos/139 testes, build e seo-smoke aprovados. Bundle SSR contém `/devs` (rota, título, sitemap, llms). Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador: `/devs` mobile/desktop nos dois temas + cliques nos Instagrams.

## 2026-09-15 — Muse Spark: header público fixo concluído (sem commit)
Link "Desenvolvedores" já existia no rodapé (confirmado no HTML servido); adicionada cobertura de teste para ele. Header do site público agora `sticky top-0 z-40`, sempre visível, só CSS, sem JS; painel admin inalterado. Validado: typecheck, lint, 29 arquivos/140 testes, build; preview em `127.0.0.1:4173` servindo o HTML com o header fixo. Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador com rolagem: menu mobile, CTA do detalhe e ambos os temas.

## 2026-09-15 — Muse Spark: commit e push `14aa53a` (página /devs + header fixo)
Commit e push direto na `main` a pedido do dono: 15 arquivos (`/devs` completa + header sticky + cobertura + `seo-smoke` + contexto). Push `15b6071..14aa53a main -> main`, `.vscode/` fora do commit. Pendente conferir no navegador com rolagem: `/devs`, menu mobile, CTA do detalhe, ambos os temas.

## 2026-09-15 — Muse Spark: refinamentos do /devs + header concluídos (sem commit)
Pacote 1–5 aplicado e validado: avatares locais em `public/assets`, links GitHub nos cards, `h1` com `clamp(32px,8vw,44px)`, logo/controles com `z-[6]` acima do backdrop e `container` + `div` interno `max-w-[800px]`. Typecheck, lint, 29 arquivos/141 testes, build e seo-smoke aprovados; `/devs` 200 conferido no HTML servido (avatares locais, GitHub, sem hotlink, sticky, clamp, imagem 200). Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador `/devs` 320–390px e desktop nos dois temas.

## 2026-09-15 — Muse Spark: privacidade + 403 do renovar concluídos (sem commit)
`/privacidade` com `container` + `div` interno `max-w-[800px]` e `h1` com clamp (mesmo padrão do `/devs`, pendência anterior eliminada). 403 do renovar diagnosticado: preview contra a API de produção + origem fora do `ALLOWED_ORIGINS` (`OrigemGuard`, comprovado via proxy); front agora relata a causa com verdade em vez de "sessão expirou" (limpeza mantida). Typecheck, lint, 29 arquivos/142 testes, build e seo-smoke aprovados; `/privacidade` 200 conferido no HTML servido. Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador `/privacidade` 320–390px e desktop nos dois temas; sessão no preview contra produção segue 403 por desenho.

## 2026-09-15 — Muse Spark: 404 de assets no preview diagnosticado e resolvido
Sintoma do dono: `GET /assets/index-DI-c97Mf.js 404` (+ css) na porta 4173, "dev não acha nada". Causa: preview antigo órfão (PID 85268, de sessão anterior de agente) servindo `index.html` antigo da memória com hashes de build anterior; cada `npm run build` apaga os hashes antigos do `dist`, daí o 404. O `dev` escuta na 5173 — aba presa na 4173 nunca veria o dev. Correção: processo antigo morto; preview novo na 4173 (`/` 200, js/css atuais 200) e `dev` na 5173 (`/` 200 com `<h1>`) conferidos e parados. Ação do dono: hard refresh (Ctrl+Shift+R) na aba da 4173 e usar a porta certa (dev 5173, preview 4173).

## 2026-09-15 — Muse Spark: hidratação do tema corrigida (sem commit)
Área assumida: `Hydration failed` + `Expected server HTML to contain a matching <circle> in <svg>` no `dev` (porta 5173). Causa no `useTheme`: o SSR sempre renderiza `light` (sem `window`), mas o primeiro render do cliente lia `localStorage`/`prefers-color-scheme` no `useState` e pintava `Sun` (com `<circle>`) contra a `Moon` do servidor — mesma divergência no `aria-label`. O React descartava o HTML do SSR e caía para renderização só no cliente. Fix: estado inicial sempre `light` (igual ao servidor), preferência salva aplicada em efeito único que não remove a classe `.dark` do script anti-flash no primeiro mount; persistência e `localStorage "theme"` + `.dark` inalterados. Teste de regressão em `useTheme.test.ts` (primeiro render `light` com `dark` salvo). Validado: typecheck, lint, 29 arquivos/143 testes, build e seo-smoke aprovados. Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador com `theme=dark` salvo: sem erro de hidratação no console, ícone Sol após carregar, alternância e persistência nos dois temas.
## 2026-09-15 — Documentação, SEO comercial e guarda de ambiente

Implementada a correção documental do README/AGENTS: scripts e variáveis refletem o runtime atual, com endereços
127.0.0.1 e sem modo demonstração. `/devs` permanece acessível, mas sempre usa `noindex,follow` e foi removido de
`sitemap.xml` e `llms.txt`. `dev` e `preview` agora recusam `API_ORIGIN` remoto por padrão por meio de
`scripts/safe-origin.mjs`, sem imprimir credenciais. UX-001 cold start foi marcada como adiada pelo proprietário.

Pendente nesta entrega: a remoção completa de `.buttonGhost` não foi feita porque ainda existem consumidores no
painel administrativo; a migração deve ser uma tarefa visual isolada para evitar regressões.
## 2026-09-16 — Codex: retomada do pacote completo

Área assumida nesta retomada: Codex integra catálogo/rodapé/SEO e documentação; agentes independentes
atuam em Dashboard, contatos/CSV, detalhe/lead e duplicação/guarda de navegação. Estado inicial: alterações
parciais da execução anterior preservadas; main. Sem escrita em banco nem publicação. Validação final em andamento.

## 2026-09-16 — Codex: pacote de melhorias públicas e painel em execução

Implementadas melhorias de formatação de preço, total mensal de locação, preço/m², selos de status,
relacionados por finalidade/cidade com fallback, mapa embed lazy, máscara/honeypot de leads, OG dimensions,
filtros de período/ imóvel e CSV de contatos, KPIs administrativos baseados nos endpoints existentes e
dirty guard do formulário de imóvel. Ordenação de catálogo, logo oficial, dados reais de privacidade, datalist
e duplicação completa ainda dependem de ajustes/insumos pendentes.

Validação desta etapa: typecheck aprovado; lint aprovado após correção; Vitest 31 arquivos/155 testes aprovado;
build aprovado; seo-smoke aprovado. Ainda pendente conferência manual e validação E2E autenticada com stack/credenciais.


## 2026-09-16 — Codex: pacote público/painel concluído em código

Concluídos os pendentes da execução anterior: datalist, rodapé configurável, duplicação/preview, guarda SPA/histórico,
mensagem expansível e 404. Corrigidos KPIs paginados, CSV seguro, datas inclusivas, dimensões OG de imagens desconhecidas,
telefone internacional e detalhes visuais nos dois temas. Plano/checklist: docs/plans/2026-09-16-melhorias-publico-painel.md.
Dados reais de marca/privacidade e contato recebidos do proprietário e registrados em `src/config/brand.ts`; logo oficial copiado para `public/assets/brand-logo.jpg`.
Homologação autenticada real aguarda stack/credenciais de teste. Nenhuma alteração de backend ou de dados reais.
## 2026-09-17 — Regressão de XSS no JSON-LD coberta

Confirmada a proteção existente em `src/seo/metadata.ts`: `serialize()` escapa caracteres de controle do contexto HTML antes de renderizar o JSON-LD. Adicionado teste com `<svg/onload>`, `<script>` e `</script><script>` verificando parse válido, preservação do texto e impossibilidade de fechar a tag SSR. Meta tags continuam cobertas por `escapeHtml()`.

Validação desta tarefa: teste direcionado aprovado; validação completa registrada no `CHANGELOG_AI.md`. Sem alteração de dados, API, banco, migrations, uploads ou rate limiting.
# 2026-10-03 — Codex: dev SSR acessível pela rede local

O servidor `npm run dev` agora escuta em `0.0.0.0` por padrão, permitindo conferir o frontend em celular na mesma rede Wi-Fi. O host pode ser sobrescrito por `HOST`.
Servidor local iniciado nesta sessão em `http://0.0.0.0:5173`; endereço de acesso no Wi-Fi: `http://192.168.0.20:5173`.

## 2026-10-03 — Codex: refinamento do frontend concluído localmente


## 2026-10-05 — Codex: refinamento da Área do Corretor em andamento

Plano autorizado em conversa: seções abertas, ícones/tooltips por foco e mouse, inputs numéricos, fichas de consulta em modal, contratos clicáveis e atalhos com menu de comandos. Esc trata uma sobreposição por vez; edição pendente no modal exige dois Esc consecutivos. Codex integra base/layout/QA; agentes fichas e numeros trabalham em arquivos distintos, QA prepara verificação efêmera. Somente frontend na main, sem novos testes fonte, dependências, API/dados, commit, push ou deploy.


## 2026-10-05 — Codex: Área do Corretor concluída localmente

Implementado o plano autorizado: seções abertas, ícones/tooltips em foco e hover, inputs refinados/numéricos, fichas de consulta em modal, contratos clicáveis e atalhos com menu Ctrl/Command+K. Modal alterado exige dois Esc consecutivos após tratar tooltip/seleção; outra interação desarma, ocupado bloqueia. Guarda de edição de imóvel preservada e perfil/senha protegidos.

Typecheck/lint/build/smoke SSR/diff-check aprovados; 21/21 testes da suíte mínima atual. QA final Chrome com API simulada: 28/28 checks, 72 capturas, 390/768/1440 claro/escuro. Revisão independente realizada e achados corrigidos; sem erros JS, overflow ou falhas de alvos/fonte observados. Ver CHANGELOG_AI para comandos/cobertura. QA próprio encerrado.

Pendentes somente homologação em serviços reais e Safari/iOS/dispositivo físico. Sem dependências novas, API/dados/migration ou publicação; histórico dos documentos preservado e trabalho preexistente da API intocado.

## 2026-10-06 — Área do Corretor: clareza, conforto e elegância concluídos localmente

Sidebar com nomes e bases douradas, textos 18/16/20px, ações arredondadas com ícone/texto, campos outlined e contatos em blocos suaves. Cabeçalhos e Responder contatos alinhados; tabelas com espaçamento e limiar mobile antecipado. Funcionalidades anteriores preservadas.

Validação desta revisão: npm run typecheck, npm run lint, 21/21 testes existentes (3 arquivos), npm run build, node scripts/seo-smoke.mjs e git diff --check aprovados. Build com avisos conhecidos de annotations da dependência Zod; sem falha. Chrome com API simulada: 28 cenários aprovados no resultado consolidado; primeira execução final 27/28 e um timeout de estabilidade ao clicar em Editar, repetido isoladamente e aprovado. Seis matrizes de layout e 72 capturas das dez telas e dois modais em 390/768/1440 nos temas claro/escuro, sem overflow, campos abaixo de 18px ou alvos de AcaoIcone abaixo de 48px. Conferidos título 20px, token dourado e sidebar 260px. Evidências ignoradas em artifacts/refino-conforto/resultados-consolidados.json; nenhum teste fonte ampliado.

Inspeção de capturas de Contatos, Visão geral, Imóveis, Contratos e formulários/modais verificou legibilidade, alinhamento, quebra, foco e aparência. Regressão cobre tooltips/aria/Tab/ShiftTab/hover/Esc, modais intactos/alterados/valores restaurados/desarme/ocupado/sobreposição, fichas/retry/404/foco, contratos e controles internos, campos numéricos, atalhos e ADMIN/CORRETOR. As primeiras medições intermediárias de cor foram corrigidas para ler o token durante animação de hover; uma execução intermediária com preview anterior ao rebuild foi descartada após reiniciar o preview. Resultados finais acima são do build atualizado.

Validação simulada não homologa API/banco/Drive/R2 reais, Safari/iOS ou dispositivo físico. Site público preservado pelo escopo de CSS; smoke SSR público aprovado. Sem novas dependências, API/dados/migrations, commit/push/deploy. Os cinco documentos foram atualizados por acréscimo, mantendo o histórico. Preview QA próprio encerrado ao finalizar; desenvolvimento existente em localhost:5173 permanece disponível ao dono.

## 2026-10-06 — Refatoração da Área do Corretor revertida pelo dono

Pedido explícito: “reverta tudo, e me dê um plano e um resumo do que foi pedido”. Revertidas integralmente as duas etapas desta conversa: mudanças visuais, sidebar, fontes, botões/inputs, tooltips centralizados, entradas numéricas, fichas em modal, contratos clicáveis, atalhos e fechamento com dois Esc. Arquivos fonte rastreados restaurados ao estado anterior da refatoração; cinco componentes/hooks novos retirados do código ativo. API, banco, dependências e trabalho anterior preservados. Nenhum commit, push ou deploy.

Os registros de implementação/validação de 05 e 06/10 acima são históricos e NÃO descrevem o produto atual. As orientações específicas dessa refatoração ficam canceladas como instruções de implementação vigente. O novo documento PLANO-AREA-CORRETOR.md contém apenas o pedido consolidado e a proposta de execução futura; não autoriza reimplementar. Preservar o restante das orientações do repositório. Backup local ignorado em artifacts/reversao-area-corretor-2026-10-06.

Verificação da reversão: todos os arquivos rastreados de src comparados por hash ao HEAD, sem diferenças; componentes novos ausentes e referências removidas. npm run build e node scripts/seo-smoke.mjs aprovados após a reversão, assim como git diff --check. A suíte de testes não foi repetida nesta reversão. Plano entregue em docs/PLANO-AREA-CORRETOR.md.

## 2026-10-06 — Codex: retomada da Área do Corretor, primeiro checkpoint

Pedido atual do dono: implementar o plano proposto a partir do commit a2a9f81 do parceiro.
Área assumida por Codex: base compartilhada e Contatos; revisão visual de Contatos é o primeiro
marco antes de propagar às telas restantes, conforme a especificação de 06/10. Pessoas e a base
visual do parceiro permanecem como referência. Histórico e alterações locais preservados.
Somente frontend na main, sem novas dependências, API/dados reais/migration ou publicação.
Validação prevista: verificações efêmeras com API simulada, typecheck, lint, 21 testes existentes,
build e smoke SSR. O restante do plano inclui fichas próprias, padronização, números e teclado.

## 2026-10-09 — Codex: contorno de foco após Esc

Implementado o plano autorizado: `data-foco-navegacao` no main do painel e no h1 de Desenvolvedores; `[data-foco-navegacao]:focus { outline: none; }` em global.css. Preservados tabIndex, foco programático, Pular para o conteúdo, retorno do foco e regras de Esc. A marcação é exclusiva de destinos não interativos; não aplicar a todos os elementos com tabindex=-1 nem remover o foco visível de controles.

Validação: typecheck, lint, build e testes existentes aprovados (3 arquivos, 23 testes). QA efêmero Chrome com API simulada: 19 verificações aprovadas, incluindo reprodução da borda de 3px com a nova regra removida via CSSOM, Visão geral/Imóveis/Contratos/Devs nos dois temas, Tab em link/botão/input, filtro, menu mobile, diálogo intacto com retorno do foco e diálogo alterado com dois Esc. Capturas e resultados ignorados em artifacts/esc-foco-2026-10-09. Sem erros JavaScript nos cenários concluídos. Primeiro QA usou rótulo inexistente Abrir menu; corrigido para Menu. Reinícios do navegador foram necessários antes da rodada final completa.

O smoke original scripts/seo-smoke.mjs falhou na expectativa antiga do h1 Imóveis comerciais; a tela atual usa Imóveis para alugar e comprar. Cópia efêmera com apenas essa expectativa e caminhos de import ajustados passou: SSR, metadados, paginação, 404, discovery, proxy/cookies, função Vercel gerada e indisponibilidade/recuperação 503. O script original foi preservado; sua expectativa continua pendente de atualização fora deste escopo. Build emitiu avisos de anotação PURE do Zod e chunk maior que 500 kB, sem impedir conclusão.

Entrega local concluída; alterações preexistentes preservadas. Sem novas suítes, dependências, API, banco, commit, push ou deploy por esta tarefa. QA simulado não equivale a homologação real nem validação em Safari/iOS.

2026-10-09 — Atualização: dono autorizou commit e push da correção de foco e destes registros na main. Validações da entrega acima permanecem aplicáveis; publicação no Git não confirma deploy.
