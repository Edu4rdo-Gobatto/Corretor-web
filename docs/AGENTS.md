# Instruções do projeto — corretor-web

## 2026-10-09 — Ações de tabela sem quebra no desktop

Na tabela desktop, a coluna de ações deve manter ícones de 44px na mesma linha, com largura determinada pelo conteúdo. `Tabela.tsx` usa `flex-nowrap`/`min-w-max` apenas a partir de 40rem; os cartões mobile continuam com `flex-wrap` e sem overflow horizontal. Não usar largura fixa insuficiente na coluna de Contatos. Preservar tooltips, permissões, callbacks, linha clicável e ações financeiras com texto.

## 2026-10-09 — Padronização visual de todo o painel

Plano integral autorizado pelo dono, tomando todas as telas existentes como referências. A orientação de limitar as notas apenas ao imóvel abaixo permanece histórica: agora o acabamento comum vale para listas, fichas, Visão geral, Perfil, formulários, diálogos e entrada administrativa. Usar `BlocosPainel.tsx`: `SecaoPainel` associa título externo à seção; `GradePainel` compartilha alturas de título/superfície por subgrid; `DadosFicha`/`DadoFicha` preservam conteúdo e links. Classes próprias sempre em `.painel-ui`. Manter fontes/escala 28/22/18/16/14, azul/dourado, gaps 16px, superfícies com padding 16–20px e altura determinada pelo conteúdo.

Grade por container: 1 coluna abaixo de 44rem, 2 a partir de 44rem, até 3 a partir de 70rem. Composições de duas colunas usam `colunas={2}`; formulários longos mantêm suas seções, âncoras e grades de campos. Não transformar título do diálogo em título externo, adicionar filtros/controles ausentes, recolher dados de ficha ou cortar conteúdo. Novo/Editar/Buscar continuam só ícone com dica acessível; Salvar/Cancelar/confirmações/ações financeiras conservam texto. Chips têm alvo mínimo de 44px. Tabelas preservam linhas alternadas e cartões com ações à direita; quando dentro de outra superfície, apenas a superfície externa recebe detalhe dourado/sombra.

`FichaImovel` usa o mesmo `SecaoPainel`, mantendo modificadores locais, ordem, subgrid aprovado e dimensões exclusivas da galeria em utilities. Preservar Esc, Ctrl/⌘+K, guardas dirty/busy, permissões, seleções, formulários independentes de perfil/senha e consultas em edição sem permissão. Não alterar API, tipos, banco, dependências, site público ou suítes rastreadas. Entrega local em main; sem commit, push ou deploy. Resultado e validação: `2026-10-09-padronizacao-painel.md`; QA novo efêmero/ignorado.

## 2026-10-09 — Títulos externos e cards alinhados por linha

Correção pedida e plano autorizado pelo dono após revisão visual: títulos acima das superfícies, mesma altura dos cards dentro de cada linha. Esta orientação substitui a altura independente e os títulos internos da primeira versão abaixo. `Nota` usa seção `.imovel-bloco`, título associado por `aria-labelledby` e superfície `.imovel-nota`. Os grids compartilham linhas de título/conteúdo por subgrid; preservar quebras de título, leitura integral dos dados, containers e layout mobile. Não impor alturas fixas ou cortes nos cards. Modificadores da galeria/descrição/ficha interna permanecem na seção; seletores da galeria respeitam a superfície intermediária. Sem alterações de API/dados ou publicação; QA novo permanece efêmero/ignorado.

Ficha interna vem antes da Descrição, preenchendo a grade sem reordenar pelo CSS. Regras locais de dimensão da galeria devem continuar em `@layer utilities`: em components perderiam para as classes de altura/largura de `GaleriaMidia`. Preservar seu escopo exclusivo da ficha.

## 2026-10-09 — Ficha do imóvel em notas compactas

Plano autorizado pelo dono: `FichaImovel` usa galeria/resumo no topo e notas separadas em azul/dourado. Preservar todos os campos, links, permissões, ações, Esc e consulta na edição sem permissão. Estilos `.imovel-*` são exclusivos da ficha dentro de `.painel-ui`; não alterar `GaleriaMidia`, estilos gerais das fichas ou detalhe público para reproduzir esse layout. Grades seguem containers nomeados: 44rem para duas colunas e 70rem para três; ficha interna distribui campos conforme o espaço da própria nota. Sem dependências, API, banco ou publicação. QA efêmero em `artifacts/imovel-notas-2026-10-09`, sem novas suítes.

## 2026-10-08 — Codex: 404 da foto corrigido na implantação

O dono autorizou resolver pela página aberta do Render usando Computer Use. Confirmado commit ativo antigo e3b0a32; implantação manual do origin/main 86ecf29 concluída (Deploy succeeded/Live), serviço srv-daj21e15efls73fab4gg, deploy dep-db4684m0tbcc73d9jtr0. Este registro substitui a pendência de acesso/publicação do diagnóstico abaixo.

URL original /api/corretores/1/foto?v=1f6h7x3 agora responde 302; seguindo redirect, HTTP 200 image/jpeg, 22322 bytes. /api/v1/saude da API retorna status ok. Perfil aberto recarregado para verificar a correção. Sem alterações funcionais, migrations, gravação de dados, commit ou push; documentação histórica preservada. Conector Render segue indisponível, mas sessão do navegador permitiu corrigir a implantação.


## 2026-10-08 — Diagnóstico da rota de foto publicada

GET da foto publicado retornou Cannot GET nos caminhos legado e versionado. Código local/GitHub da API (86ecf29) já registra FotoCorretorController; build e proxy local aprovados com banco/storage simulados. Conferir commit/build/start do Render antes de alterar a implementação; preservar bucket privado e urlFotoCorretor. Conector exige reautenticação; publicação e foto real continuam pendentes.


## 2026-10-06 — Refinamento autorizado de contatos, perfil e filtros

Estado vigente em `2026-10-06-refinamentos-sistema.md`; System Design em `2026-10-06-system-design.docx`.
Este pedido autoriza os dois repositórios e amplia o PATCH do perfil, substituindo a restrição frontend
dos snapshots abaixo somente neste escopo. Entrega local: sem commit, push, deploy ou migrations.
Preservar fontes, azul/dourado, escala de texto, permissões, Esc e Ctrl/⌘+K. Contatos agora usa abas;
reabertura de finalizados continua exclusiva de ADMIN na interface, sem nova restrição na API.
Filtros usam `useFiltrosAutomaticos`: 350 ms para texto, seleção imediata, normalização e validação.
Manter Catalogo montado entre mudanças de filtro; usar replace automático e histórico na paginação.
Foto: prévia/arquivo são pendentes até Salvar perfil; não reenviar url_foto não editada. Exibir por
`urlFotoCorretor`, respeitando base/proxy. Não resetar o formulário de senha ao salvar dados.
Não recriar suítes: QA novo efêmero/ignorado. Distinguir simulação de banco de homologação real.
R2 real foi verificado com objeto isolado temporário; nenhum avatar foi gravado no Neon.

## 2026-10-06 — Orientação vigente após conclusão local da Área do Corretor

O dono autorizou as specs completas, incluindo as etapas posteriores a Contatos. Implementação
e validação local concluídas: `2026-10-06-conclusao-area-corretor.md`. Esse estado substitui as
pendências e o checkpoint de revisão dos registros anteriores, que permanecem como histórico.
Fichas novas são telas próprias; CampoNumero, guarda dirty/busy e Ctrl/⌘+K estão ativos.
Preservar `.painel-ui`, escala 28/22/18/16/14, selects dos editores, histórico interno por Esc,
permissões e DTOs. CORRETOR não consulta endpoints administrativos de corretores/classificações.
Guardar id/referência inicial ao restaurar seleções; Cancelar de editores usa data-fechar-dialogo.
Somente Ctrl/⌘+K; não reintroduzir atalhos descartados ou fichas em modal. Integrações reais
e Safari/iOS/celular continuam sem homologação. Manter main, índice, escopo frontend e ausência
de publicação/suítes novas sem pedido. QA efêmero e prints ficam ignorados em artifacts/.

## 2026-10-06 — Ajustes aprovados após a revisão de Contatos

O dono aprovou `2026-10-06-ajustes-painel.md`. Esc agora retorna à página anterior do painel,
com fallback para lista/Visão geral e prioridade das camadas abertas; substitui a regra anterior
de retorno sempre hierárquico. Usar SeletorFiltro nas listas dos filtros, mantendo selects dos
editores. Cards: nome à esquerda, valores e ações à direita. Menu mobile ocupa a tela inteira;
origem/consentimento somente na ficha e filtro “Só sem foto” removido. Preservar histórico,
main, índice preexistente e escopo frontend. Não ampliar suítes ou publicar sem pedido.

## 2026-10-06 — Orientação vigente para a retomada do painel

O dono autorizou implementar o plano a partir de `a2a9f81`. Ler
`2026-10-06-painel-especificacao-visual.md`: ela substitui o plano anterior revertido e os padrões
conflitantes das entradas históricas abaixo. Pessoas continua como referência; escopo `.painel-ui`,
escala 28/22/18/16/14, tabelas/cartões por container de 40rem e apenas Ctrl/⌘+K nas próximas fases.

Primeiro marco implementado: Contatos, agora em revisão do dono antes das demais telas (seção 8).
`src/servicos/pessoas.ts` centraliza edição por responsável/ADMIN e reabertura só por ADMIN no
frontend; preservar isso no editor e em novas ações. Não afirmar que a regra de reabertura está
garantida pela API. Dicas do painel usam popover; mudanças compartilhadas devem preservar o público.

Fichas próprias, CampoNumero e guardas/atalhos permanecem pendentes. Não reutilizar as antigas
implementações revertidas nem ampliar os 3 arquivos/21 testes sem pedido. QA efêmero e capturas
ficam em pasta ignorada; resultados simulados e homologação real devem ser registrados separadamente.
Main e restrições a dependências/API/dados/migrations/publicação continuam vigentes.

## Contexto

Front do sistema de corretor de imóveis comerciais: catálogo público, detalhe de imóvel, captação de leads com
consentimento LGPD e painel administrativo. React 18 + TypeScript estrito + Vite 7 + React Router 7,
formulários com react-hook-form e zod. Desde `d4f6b2f` existe um **servidor SSR próprio** em `src/seo/` e
`scripts/*.mjs`, que renderiza as páginas públicas, gera metadados, JSON-LD, `robots.txt`, `sitemap.xml` e
`llms.txt`, e faz proxy de `/api` para a API. Node `>=24 <25`.

Repositório irmão: **corretor-api** (NestJS + TypeORM + Neon + R2), em `../Corretor-API`.
Os dois compartilham `corretor-spec.json` e o `PLANO-PROJETO-CORRETOR.md`, e cada um mantém a sua cópia
dos arquivos de contexto descritos abaixo.

## Comandos

| Ação | Comando | Precisa da API |
|---|---|---|
| Instalar dependências | `npm ci` | não |
| Desenvolvimento (SSR) | `npm run dev` → `127.0.0.1:5173` | sim |
| Build de produção | `npm run build` → `dist/` e `.vercel/output` | não |
| Servir o build | `npm run preview` → `127.0.0.1:4173` | sim |
| Testes | `npm test` (vitest) | não |
| Lint | `npm run lint` | não |
| Tipos | `npm run typecheck` | não |
| Suíte visual (prints + layout + orçamento de requisições) | `npm run visual` (ou `visual:sem-build`) | não (API simulada) |
| Revisão visual / medição com subagente | `/revisar-design <tela>` e `/medir <tela>` (em `.claude/`) | não |

## Variáveis de ambiente

| Variável | Onde vale | Função |
|---|---|---|
| `VITE_API_URL` | navegador (embutida no bundle) | base das chamadas; use `/api`, que o servidor repassa à API |
| `API_ORIGIN` | servidor SSR | origem da API, só esquema e host, sem caminho; usada no proxy e nas buscas do SSR |
| `API_PROXY_TARGET` | servidor SSR (desenvolvimento) | alternativa ao `API_ORIGIN` em desenvolvimento |
| `SITE_URL` | servidor SSR | origem pública do site; **sem ela não há canonical nem JSON-LD** |
| `SEO_INDEXABLE` | servidor SSR | `true` libera `index,follow`; exige `SITE_URL` e `API_ORIGIN` em HTTPS, `NODE_ENV=production` e fora de preview |

Nunca coloque segredo em variável `VITE_*`: tudo que tem esse prefixo vai para o bundle do navegador.

## Regras

**Dados e integração**
- Todas as chamadas à API passam por `src/servicos/api.ts` (e `locacoes.ts`). Não use `fetch` direto em componente.
- O access token fica só em memória (`src/servicos/http.ts`). Não grave token em `localStorage` nem em cookie pelo front.
- O refresh é feito por cookie `httpOnly` enviado pela API. Não tente ler esse cookie no navegador.
- Uma renovação de sessão por vez: o cliente já compartilha a promessa de refresh. Não crie outro caminho de renovação.
- Em desenvolvimento e preview, `API_ORIGIN` deve apontar para localhost ou loopback; origens remotas são bloqueadas.

**SSR**
- Todo componente usado em rota pública precisa renderizar no servidor: nada de acessar `window`, `document` ou
  `sessionStorage` durante a renderização. Use efeito ou verificação de ambiente.
- Dados de página pública vêm do bootstrap do SSR; mantenha o contrato de `src/seo/context.tsx` e `src/seo/metadata.ts`.
- Ids são inteiros; o slug público termina no id e o SSR redireciona (301) quando o título mudou.
- Ao criar rota pública nova, trate também: metadados, canonical, entrada no `sitemap.xml` e comportamento em 404.
- O painel (`/admin/*`) não é renderizado no servidor e permanece `noindex`.

**Código**
- TypeScript estrito, sem `any` e sem `@ts-ignore`.
- Validação de formulário só com react-hook-form + zod. Não introduza outra biblioteca de validação.
- Estilos em Tailwind v4 com os tokens do `@theme` (`src/styles/tailwind.css`); não há CSS Modules. Sem cores
  literais nos componentes. Grades internas do painel e dos modais usam container query (`@container`), não
  breakpoints da janela. Todo modal usa o componente `Dialogo`.
- Não adicione dependência sem justificar em `DECISIONS.md`.
- Imagens enviadas pelo painel são comprimidas no navegador antes do upload; mantenha os limites atuais.

**Fluxo de trabalho**
- Nunca comite `.env`, `dist/`, `.vercel/` ou artefatos de build (já estão no `.gitignore`).
- Este projeto trabalha **direto na `main`**, sem branches paralelas (decisão do dono em 11/09/2026).
  Antes de commitar: rode os testes, confirme com o dono e nunca inclua segredo no commit.
- Rode `npm run typecheck`, `npm run lint` e `npm test` depois de qualquer mudança relevante, e registre o resultado.
- Mudança que afeta SEO ou SSR exige conferência manual: catálogo, detalhe de imóvel, `robots.txt`, `sitemap.xml` e uma rota inexistente.
- Antes de implementar, leia `PROJECT_STATUS.md`, `TASKS.md`, `DECISIONS.md`, o último registro de `CHANGELOG_AI.md`
  e, para regras de produto, `corretor-spec.json`.

## Protocolo entre agentes

Antes de trabalhar:

1. Ler `docs/PROJECT_STATUS.md`, `docs/TASKS.md`, `docs/DECISIONS.md` e o último registro de `docs/CHANGELOG_AI.md`.
2. Verificar o estado do Git: `git status`, `git log --oneline -5` e se a branch está sincronizada com o remoto.
3. Conferir em `docs/PROJECT_STATUS.md` se outro agente já assumiu a mesma área.
4. Atualizar `docs/PROJECT_STATUS.md` com a tarefa assumida, o seu nome e a data.

Depois de trabalhar:

1. Atualizar `docs/PROJECT_STATUS.md`.
2. Registrar decisões relevantes em `docs/DECISIONS.md`, com motivo e o que não fazer.
3. Registrar em `docs/CHANGELOG_AI.md` a tarefa, os arquivos alterados, os testes executados com o resultado real e as pendências.
4. Informar riscos e o que ficou sem teste.

Divisão sugerida de papéis:

| Etapa | Agente | Responsabilidade |
|---|---|---|
| Planejamento | Claude | Entender o problema, propor arquitetura e critérios de conclusão em `TASKS.md` |
| Implementação | Codex | Alterar código, criar testes e executar os comandos |
| Revisão | Claude | Ler o diff, procurar bugs e falhas de segurança, registrar em `CHANGELOG_AI.md` |
| Correções | Codex | Aplicar os ajustes da revisão |
| Validação final | Ambos | Conferir testes, build e estado do Git |

Não deixe os dois agentes editando a mesma área ao mesmo tempo.

## Mapa do código

```text
index.html            # casca com marcadores <!--seo-head-->, <!--app-html--> e <!--bootstrap-->
scripts/dev.mjs       # servidor SSR de desenvolvimento sobre o Vite em modo middleware
scripts/build.mjs     # build do cliente e do SSR, e geração de .vercel/output (Build Output API v3)
scripts/preview.mjs   # serve o build com o mesmo runtime
scripts/runtime.mjs   # proxy /api → API_ORIGIN (remove o prefixo /api) e renderização das páginas
src/seo/              # server.tsx (rotas SSR, robots, sitemap, llms), metadata.ts (títulos, OG, JSON-LD), context.tsx, fixture.ts
src/tipos/            # domínio em português, igual ao contrato HTTP (Imovel, FichaImovel, Pessoa, Corretor, Pagina)
src/servicos/         # http.ts (token em memória, renovação única), api.ts, locacoes.ts, catalogo.ts, urls.ts, contato.ts, formato.ts, validacao.ts
src/paginas/publico/  # Catalogo, DetalheImovel, Privacidade, Devs
src/paginas/painel/   # LayoutPainel, Entrar, VisaoGeral, Imoveis, FormularioImovel, Contatos, Pessoas, FichaPessoa, Corretores, Cadastros, Contratos, DetalheContrato, Comissoes, Perfil
src/componentes/      # LayoutPublico, CartaoImovel, GaleriaMidia, FormularioContato, GerenciadorMidia, SelecaoMidia, SeletorRegistro, CabecalhoPagina, Tabela, Etiqueta, Dialogo, Paginacao, EstadoCarregamento, LimiteErro
src/hooks/            # useSessao, useRecurso, useDadosPainel, useTema, useGuardaFormulario
```

Vocabulário: código, tipos, nomes de arquivo e rótulos em português, com os mesmos nomes de campo do contrato da API
(`snake_case`). Não reintroduza tradutores de contrato nem nomes em inglês para o domínio.

## Serviços externos

| Serviço | Situação |
|---|---|
| API (corretor-api) | local em `http://localhost:3000`; ainda não publicada |
| Neon e Cloudflare R2 | ativos e homologados; ver `docs/handoffs/2026-09-11-infra-neon-r2.md` |
| Vercel | não criada; conferir a restrição de uso comercial do plano Hobby antes de publicar |

## 2026-09-14 — Instruções vigentes após refatoração integral

O pedido integral do dono em docs/specs/2026-09-13-backend-integral.md prevalece sobre instruções antigas conflitantes deste arquivo. Contrato e operação atual: docs/handoffs/2026-09-14-backend-portugues.md. Backend em português, auditoria universal, soft delete, dados pessoais em colunas sem cifra; documentos novos no Drive compartilhado privado e receita em comissões. Modelos antigos só permanecem nas migrations/histórico.

Migration 1789516800000 exige complementos reais e backup; use apenas os comandos npm documentados (executor sanitizado). Não editar migrations aplicadas nem imprimir dados privados. A chave antiga é necessária só para decifrar o legado na migração. Nenhuma migration/deploy automático. Cookie Secure exige HTTPS no navegador. Adaptar frontend e health check /api/v1/saude antes da publicação conjunta. main e regra de confirmação antes de commit continuam vigentes.

## 2026-10-03 — Base compartilhada do frontend

`src/componentes/AcaoIcone.tsx`, `Campo.tsx`, `Aviso.tsx` e `ConfirmarAcao.tsx` integram a base de UI.
Ações auxiliares usam ícone com nome contextual/dica e alvo de 44px; salvar, criar, buscar, WhatsApp
e transições de atendimento conservam texto. Campos têm no mínimo 16px; use Campo para ligar
rótulo/dica/erro ao controle e Aviso com tokens de estado. Tabela mostra os mesmos dados em cartões
abaixo de 40rem de container, com quebra de textos longos.

ConfirmarAcao não fecha automaticamente após resolver: o consumidor fecha ou avança a etapa só
quando obtém sucesso. Erros mantêm o diálogo aberto e ocupado bloqueia nova ação/fechamento.
Dialogo aceita `data-foco-inicial` em um descendente para foco após showModal; Cancelar é o padrão
das confirmações. Preserve a guarda de edição, o rascunho por aba e as duas etapas da duplicação.

Por pedido do dono, as suítes fonte foram removidas em 03/10/2026; consultar DECISIONS.md.
Não recriar suítes sem novo pedido nem alegar que npm test sem arquivos passou. Smoke existente
e verificações efêmeras com API simulada são documentados em CHANGELOG_AI.md; não equivalem
a homologação de API/serviços reais. Main e confirmação antes de commit continuam vigentes.

## 2026-10-03 — Espera pública e recuperação do 503

`PaginaIndisponivel`, `CenaReparo` e `useRecuperacaoPagina` cuidam do bootstrap público 5xx.
SSR/primeiro render e modo sem JS são estáticos; no cliente há loop silencioso com pausa e
movimento reduzido. A pausa da cena não interrompe a verificação da página.
Sondagem HEAD da mesma URL em `verificarPaginaPublica` (`api.ts`), primeira após 30s e próxima
30s depois da conclusão, uma por vez e limite 50s. Saúde isolada não permite declarar recuperação.
200/404 recarregam a URL atual; erros conservam a espera. Sair/trocar URL/ocultar/offline cancela
e invalida respostas; retomar aguarda 30s. Não aplicar o retorno de 8s da 404 a essa espera.
Preservar HTTP 503/SEO/no-store/Retry-After e orçamento SSR; sem keep-alive ou alteração de infra.

## 2026-10-03 — Catálogo persistente no Neon

A carga autorizada acrescentou 12 anúncios ilustrativos e 36 mídias ao banco da API. Não confundir
persistência real com oferta comercial confirmada: preços, áreas, características e endereços são
sintéticos; cada descrição identifica imagens/endereço de referência. Fontes/licenças em
`../Corretor-API/docs/2026-10-03-fontes-catalogo.md`. O cliente público continua usando a API normal,
sem fixture nem modo demo. A URL pública do bucket R2 respondeu 401; o seed mantém uma cópia dos
arquivos no R2 privado e grava URLs HTTPS da Unsplash no campo público da mídia. Não habilitar o
bucket publicamente sem decisão de infraestrutura. Reexecução `npm run seed:catalogo:executar`
reconcilia essas URLs apenas nos IDs e chaves do lote. Não alterar nem remover os 4 imóveis
anteriores, nem commitar/publicar sem autorização expressa. Ver `CHANGELOG_AI.md`/`TASKS.md` para
validação, credencial administrativa em pasta local restrita e limites desta carga.

## 2026-10-04 — Suíte mínima

Depois da revisão externa, 
pm test voltou a ter 3 arquivos em src/servicos/ (contato/LGPD, URL de filtro, valores e catálogo de exemplo). Não ampliar nem recriar as demais suítes sem novo pedido; 
pm run visual segue sem specs. Dados de demonstração: catalogoExemplo() em src/seo/fixture.ts. Índice da documentação: docs/INDICE.md.



## 2026-10-05 — Área do Corretor: ícones, teclado e fichas

O painel usa navegação compacta por ícones e seções abertas. Ações auxiliares devem reutilizar AcaoIcone (tipo submit nos filtros); confirmações, salvar e operações financeiras conservam texto. DicasPainel fornece tooltip por foco/hover a botões e destinos dentro de data-area-corretor, com aria-describedby, camada popover e posicionamento limitado à janela. Não depender de title nem adicionar outro listener global de Esc aos controles do painel.

Dialogo aceita alterado e ocupado: derivar alterado do isDirty do react-hook-form, marcar shouldDirty em seleções programáticas e guardar valores iniciais no defaultValues. Esc intacto fecha; alterado arma aviso e segundo Esc consecutivo descarta, sem prazo. Outra tecla, input ou clique desarma. Botões Cancelar de editores usam data-fechar-dialogo; fechar/clique externo pedem confirmação quando alterado. Ocupado bloqueia fechamento. Prioridade: tooltip, seleção aberta, modal superior, navegação. Não reverter operações já persistidas.

useAtalhosPainel controla Ctrl/Command+K, /, ?, Ctrl/Command+Enter e retorno com Esc. Somente formulários de edição seguros usam data-atalho-salvar; jamais marcar recebimentos ou criação financeira. Buscas de filtro usam data-busca-painel. O atalho consome Enter também quando a ação não é permitida. FichasPainel consulta dados disponíveis pela API atual; não completar perfil com chamadas privilegiadas. EntradaNumero preserva decimal textual durante edição e conversão no esquema de cada tela; não usar valueAsNumber em input text. Perfil e imóvel mantêm guarda de edição.

## 2026-10-06 — Conforto visual da Área do Corretor

Esta revisão substitui a direção anterior de sidebar sem nomes: usar sidebar de 260px com ícone e nome, inclusive no menu mobile. Textos principais 18px, auxiliares 16px, títulos principais/modal 20px e subtítulos 18px. Preservar fontes e catálogo público. Estilos compartilhados ficam no escopo data-area-corretor; tokens de ação #b3892d / hover #b18424, desenho branco e texto azul #0a2042. Ações destrutivas conservam vermelho com contraste.

Novo/Filtrar/WhatsApp/Responder usam ícone e texto; AcaoIcone aceita texto opcional. Editar/ver ficha mantêm tooltip. Botões com raio 12px, alvo mínimo 48px, ícones 23px; campos outlined, rótulos acima e fonte 18px. Contatos usam blocos suaves; tabelas passam à apresentação mobile abaixo de 52rem do container. Preservar as regras de teclado, dirty state, permissões e fichas registradas anteriormente.

## 2026-10-06 — Refatoração da Área do Corretor revertida pelo dono

Pedido explícito: “reverta tudo, e me dê um plano e um resumo do que foi pedido”. Revertidas integralmente as duas etapas desta conversa: mudanças visuais, sidebar, fontes, botões/inputs, tooltips centralizados, entradas numéricas, fichas em modal, contratos clicáveis, atalhos e fechamento com dois Esc. Arquivos fonte rastreados restaurados ao estado anterior da refatoração; cinco componentes/hooks novos retirados do código ativo. API, banco, dependências e trabalho anterior preservados. Nenhum commit, push ou deploy.

Os registros de implementação/validação de 05 e 06/10 acima são históricos e NÃO descrevem o produto atual. As orientações específicas dessa refatoração ficam canceladas como instruções de implementação vigente. O novo documento PLANO-AREA-CORRETOR.md contém apenas o pedido consolidado e a proposta de execução futura; não autoriza reimplementar. Preservar o restante das orientações do repositório. Backup local ignorado em artifacts/reversao-area-corretor-2026-10-06.

## 2026-10-09 — Codex: contorno de foco após Esc

Implementado o plano autorizado: `data-foco-navegacao` no main do painel e no h1 de Desenvolvedores; `[data-foco-navegacao]:focus { outline: none; }` em global.css. Preservados tabIndex, foco programático, Pular para o conteúdo, retorno do foco e regras de Esc. A marcação é exclusiva de destinos não interativos; não aplicar a todos os elementos com tabindex=-1 nem remover o foco visível de controles.

Validação: typecheck, lint, build e testes existentes aprovados (3 arquivos, 23 testes). QA efêmero Chrome com API simulada: 19 verificações aprovadas, incluindo reprodução da borda de 3px com a nova regra removida via CSSOM, Visão geral/Imóveis/Contratos/Devs nos dois temas, Tab em link/botão/input, filtro, menu mobile, diálogo intacto com retorno do foco e diálogo alterado com dois Esc. Capturas e resultados ignorados em artifacts/esc-foco-2026-10-09. Sem erros JavaScript nos cenários concluídos. Primeiro QA usou rótulo inexistente Abrir menu; corrigido para Menu. Reinícios do navegador foram necessários antes da rodada final completa.

O smoke original scripts/seo-smoke.mjs falhou na expectativa antiga do h1 Imóveis comerciais; a tela atual usa Imóveis para alugar e comprar. Cópia efêmera com apenas essa expectativa e caminhos de import ajustados passou: SSR, metadados, paginação, 404, discovery, proxy/cookies, função Vercel gerada e indisponibilidade/recuperação 503. O script original foi preservado; sua expectativa continua pendente de atualização fora deste escopo. Build emitiu avisos de anotação PURE do Zod e chunk maior que 500 kB, sem impedir conclusão.

Entrega local concluída; alterações preexistentes preservadas. Sem novas suítes, dependências, API, banco, commit, push ou deploy por esta tarefa. QA simulado não equivale a homologação real nem validação em Safari/iOS.

2026-10-09 — Atualização: dono autorizou commit e push da correção de foco e destes registros na main. Validações da entrega acima permanecem aplicáveis; publicação no Git não confirma deploy.
