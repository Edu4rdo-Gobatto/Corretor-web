# Instruções do projeto — corretor-web

## Contexto

Front do site e do painel de um corretor de imóveis comerciais (Lucas Gobatto, Juara/MT): catálogo público,
detalhe de imóvel, contato com consentimento LGPD e painel `/admin`. React 18 + TypeScript estrito + Vite 7 +
React Router 7, react-hook-form + zod e Tailwind 4. Um **servidor SSR próprio** (`src/seo/` e `scripts/*.mjs`)
renderiza as páginas públicas, gera metadados, JSON-LD, `robots.txt`, `sitemap.xml` e `llms.txt`, e faz proxy de
`/api` para a API. Node `>=24 <25`.

Repositório irmão: **Corretor-API** (NestJS + TypeORM + Neon + R2 + Google Drive), em `../Corretor-API`. Os dois
compartilham `corretor-spec.json`. Contrato e regras da API: [README](../../Corretor-API/docs/README.md) e
[ENTENDENDO-O-BACKEND](../../Corretor-API/docs/ENTENDENDO-O-BACKEND.md) da API.

## Regras

**Dados e integração**
- Todas as chamadas à API passam por `src/servicos/api.ts` (e `locacoes.ts`). Não use `fetch` direto em componente.
- O token de acesso fica só em memória (`src/servicos/http.ts`). Não grave token em `localStorage`, `sessionStorage`
  nem em cookie pelo front.
- A renovação usa o cookie httpOnly `corretor_renovacao` da API. Não tente ler esse cookie no navegador.
- Uma renovação por vez: `renovarSessao` compartilha a promessa entre o 401 e a restauração do `ProvedorSessao`
  (`api.renovar`). Não crie outro caminho de renovação.
- A expiração (4h sem uso, JWT de 15 min, sem rotação) é regra da API. Não crie cronômetro de sessão no front.
- Em `dev` e `preview`, `API_ORIGIN` deve apontar para localhost ou loopback; origens remotas são recusadas.
- Nada de dado fictício no produto. Dado de exemplo só em `src/seo/fixture.ts` (`catalogoExemplo()`), usado no smoke.

**SSR**
- Todo componente de rota pública precisa renderizar no servidor: nada de `window`, `document` ou `sessionStorage`
  durante a renderização. Use efeito ou handler.
- Dados de página pública vêm do bootstrap do SSR; mantenha o contrato de `src/seo/context.tsx` e `src/seo/metadata.ts`.
- Ids são inteiros; o slug público termina no id e o SSR redireciona (301) quando o título mudou.
- Rota pública nova precisa de metadados, canonical, entrada no `sitemap.xml` e comportamento em 404.
- O painel (`/admin/*`) não é renderizado no servidor e permanece `noindex`.
- Bootstrap 5xx mostra `PaginaIndisponivel` e se recupera com `useRecuperacaoPagina` (HEAD da própria URL). Preserve
  HTTP 503, `no-store`, `Retry-After: 30` e o orçamento do SSR (10s por busca, 45s no total).
- JSON-LD só por `serialize()` (`src/seo/metadata.ts`).

**Código**
- TypeScript estrito, sem `any` e sem `@ts-ignore`.
- Validação de formulário só com react-hook-form + zod.
- Tailwind 4 com os tokens do `@theme` (`src/styles/tailwind.css`). Sem CSS Modules e sem cores literais nos
  componentes. Grades do painel e dos modais usam container query (`@container`). Todo modal usa `Dialogo`.
- Ícones Material Symbols inline em `src/componentes/Icones.tsx`. `lucide-react` só para GitHub e Instagram em `Devs.tsx`.
- Não adicione dependência sem justificar em `DECISIONS.md`.
- Vocabulário em português, com os mesmos nomes de campo do contrato da API (`snake_case`). Não reintroduza nomes em
  inglês para o domínio.

**Painel**
- Estilos próprios sempre dentro de `.painel-ui`. Escala 28/22/18/16/14. Azul e dourado; ação do painel em
  `--color-acao-painel`.
- Seções, grades e dados de ficha usam `BlocosPainel.tsx` (`SecaoPainel`, `GradePainel`, `DadosFicha`, `DadoFicha`).
- Listas usam `Tabela` (cartões abaixo de 40rem de container). Ações de lista só com `AcaoIcone` (44px, dica e nome
  acessível). Confirmações, Salvar/Cancelar e ações financeiras conservam texto.
- Retorno visual sempre por `BotaoVoltar`. Esc segue `escPodeVoltar` (`src/hooks/useEscVoltar.ts`); componente novo
  que trate Esc chama `preventDefault()`.
- Único atalho: Ctrl/⌘+K (paleta). Não reintroduzir `/`, `?`, Ctrl/⌘+Enter nem fichas em modal.
- Números com `CampoNumero`; CRECI com `CampoCreci` e `servicos/creci.ts`. Modais com edição usam `alterado`/`ocupado`
  do `Dialogo`.
- Reabrir contato finalizado é só para ADMIN, mas a regra existe apenas no front (`src/servicos/pessoas.ts`).

**Fluxo de trabalho**
- Trabalho direto na `main`, sem branches paralelas. Antes de commitar: rode as verificações, confirme com o dono e
  nunca inclua segredo.
- Nunca comite `.env`, `dist/`, `.vercel/`, `artifacts/` ou `test-results/`.
- Rode `npm run typecheck`, `npm run lint` e `npm test` depois de qualquer mudança relevante e registre o resultado real.
- Mudança que afeta SEO ou SSR exige conferência manual: catálogo, detalhe de imóvel, `robots.txt`, `sitemap.xml` e
  uma rota inexistente.
- Não amplie a suíte de testes sem pedido do dono. QA efêmero fica em `artifacts/` (ignorado) e não equivale a
  homologação real.
- Documentação só em `docs/`, plana, sem subpastas. Links relativos a partir de `docs/`.

## Protocolo entre agentes

Antes de trabalhar:

1. Ler `docs/PROJECT_STATUS.md`, `docs/TASKS.md`, `docs/DECISIONS.md` e o último registro de `docs/CHANGELOG_AI.md`.
2. Verificar o Git: `git status`, `git log --oneline -5` e se a branch está sincronizada com o remoto.
3. Conferir em `docs/PROJECT_STATUS.md` se outro agente já assumiu a mesma área.
4. Registrar em `docs/PROJECT_STATUS.md` a tarefa assumida, o seu nome e a data.

Depois de trabalhar:

1. Atualizar `docs/PROJECT_STATUS.md` e `docs/TASKS.md`.
2. Registrar decisões em `docs/DECISIONS.md`, com motivo e o que não fazer.
3. Acrescentar em `docs/CHANGELOG_AI.md` a tarefa, os arquivos, os testes com o resultado real e as pendências.
4. Informar riscos e o que ficou sem teste.

Não deixe dois agentes editando a mesma área ao mesmo tempo.

## Comandos

| Ação | Comando | Precisa da API |
|---|---|---|
| Instalar dependências | `npm ci` | não |
| Desenvolvimento (SSR) | `npm run dev` → `127.0.0.1:5173` | sim |
| Build de produção | `npm run build` → `dist/` e `.vercel/output` | não |
| Servir o build | `npm run preview` → `127.0.0.1:4173` | sim |
| Testes | `npm test` (vitest, 3 arquivos, 23 testes) | não |
| Lint / tipos | `npm run lint` / `npm run typecheck` | não |
| Smoke do SSR | `node scripts/seo-smoke.mjs` (falha no h1 desde 06/10; ver TASKS) | não (API fictícia) |
| Suíte visual | `npm run visual` (sem specs hoje) | não |
| Revisão visual / medição | prompts em [comando-revisar-design.md](comando-revisar-design.md) e [comando-medir.md](comando-medir.md) | não |

Os prompts `/revisar-design` e `/medir` (e os subagentes [revisor-design.md](revisor-design.md) e
[auditor-desempenho.md](auditor-desempenho.md)) não são carregados automaticamente desde a remoção de `.claude/` em
04/10, e dependem de specs visuais que não existem.

Variáveis de ambiente: tabela no [README](README.md#variáveis-de-ambiente).

## Mapa do código

```text
index.html               # casca com <!--seo-head-->, <!--app-html--> e <!--bootstrap-->
vercel.json              # framework null, build npm run build, saída .vercel/output
scripts/dev.mjs          # SSR de desenvolvimento sobre o Vite em modo middleware (HOST/PORT)
scripts/build.mjs        # build cliente + SSR e .vercel/output (Build Output API v3, nodejs24.x)
scripts/preview.mjs      # serve o build em 127.0.0.1:4173
scripts/runtime.mjs      # proxy /api → API_ORIGIN (remove /api) e renderização das páginas
scripts/safe-origin.mjs  # recusa API_ORIGIN remoto em dev/preview
scripts/seo-smoke.mjs    # smoke do SSR com API fictícia (4180/4199); --serve mantém a prévia
scripts/gerar-logo.mjs   # gera as variantes WebP do logo por tema
tests/visual/            # só ajudantes do Playwright (api-simulada, orcamento, preparar, seguranca, ajudantes)

src/App.tsx              # rotas, RolarAoTopo, redirecionamentos antigos
src/main.tsx             # entrada do cliente (hidrata o HTML do SSR)
src/config/              # brand.ts (marca, contato, privacidade), devs.ts
src/seo/                 # server.tsx (SSR, robots, sitemap, llms, 404/503), metadata.ts, context.tsx,
                         # deployment.ts (rotas e rewrite da Vercel), fixture.ts (catalogoExemplo)
src/tipos/index.ts       # tipos do contrato HTTP (Imovel, FichaImovel, Pessoa, Corretor, Pagina...)
src/servicos/            # http.ts (token em memória, renovarSessao), api.ts, locacoes.ts, catalogo.ts, urls.ts
                         # (caminhosCatalogo, urlNormalizada), contato.ts, validacao.ts, formato.ts, creci.ts,
                         # pessoas.ts (permissões de pessoa), registros.ts, fotos.ts (urlFotoCorretor),
                         # exportacaoContatos.ts (CSV), videoEmbed.ts, obra.ts (áudio do /devs), *.test.ts
src/hooks/               # useSessao (ProvedorSessao), useTema, useRecurso, useDadosPainel, useFiltrosAutomaticos,
                         # useGuardaFormulario, useEscVoltar, useVoltarPainel, useComandosPainel, useRecuperacaoPagina
src/paginas/publico/     # Catalogo, DetalheImovel, Privacidade, Devs
src/paginas/painel/      # LayoutPainel, Entrar, VisaoGeral, Perfil
                         # Imoveis, DetalheImovel (rota /admin/imoveis/:id) + FichaImovel, FormularioImovel, esquemaImovel, rascunhoImovel
                         # Contatos, Pessoas, FichaPessoa, EditorPessoa
                         # Corretores, FichaCorretor, EditorCorretor
                         # Cadastros, FichaClassificacao, EditorClassificacao
                         # Contratos, DetalheContrato, esquemaLocacao
                         # Comissoes, DetalheComissao, EditoresComissao
                         # sessaoTeste.ts (órfão, importa vitest; ver TASKS)
src/componentes/         # público: LayoutPublico, CartaoImovel, FiltrosCatalogo, FormularioContato, GaleriaMidia,
                         #   PaginaIndisponivel, CenaReparo, CasaQuebrada, CenaObra, ObraOverlay
                         # painel: BlocosPainel, Tabela, CabecalhoPagina, BotaoVoltar, AcaoIcone, PaletaPainel,
                         #   SeletorFiltro, FiltroSuspenso, SeletorRegistro, CampoNumero, CampoCreci,
                         #   GerenciadorMidia, prepararMidia.ts, SelecaoMidia, estilosPainel.ts
                         # comuns: Dialogo, ConfirmarAcao, Campo, Aviso, Etiqueta, Paginacao, EstadoCarregamento,
                         #   LimiteErro, Icones
src/styles/              # tailwind.css (tokens @theme e .dark), global.css (classes legadas e .painel-ui)
src/test/setup.ts        # setup do vitest
```

## Serviços publicados

Último registro datado de cada um. Não afirme o commit implantado sem conferir no painel do serviço.

| Serviço | Situação |
|---|---|
| Front (Vercel) | projeto de teste `corretor-web-test`, <https://corretor-web-test.vercel.app>, publicado desde 13/09. Em 08/10 respondia e repassava `/api` |
| API (Render) | serviço `srv-daj21e15efls73fab4gg`; deploy manual de `86ecf29` em 08/10, `/api/v1/saude` ok |
| Neon e Cloudflare R2 | ativos. A URL pública do R2 respondeu 401 em 03/10; as fotos do catálogo vêm da Unsplash |
| Google Drive | código pronto na API; homologação das ACLs pendente (H01) |

Domínio comercial e lançamento definitivo ainda não existem.

## Documentos relacionados

- [INDICE.md](INDICE.md): lista de todos os documentos.
- [Integração com o modelo português da API](../../Corretor-API/docs/2026-09-14-backend-portugues.md).
- [Foto de perfil na API](../../Corretor-API/docs/2026-10-06-foto-perfil.md).
- [Fontes das fotos do catálogo](../../Corretor-API/docs/2026-10-03-fontes-catalogo.md).
