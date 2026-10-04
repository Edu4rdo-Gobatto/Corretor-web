# Instruções do projeto — corretor-web

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

