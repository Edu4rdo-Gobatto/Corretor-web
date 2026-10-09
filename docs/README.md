# Corretor-web

Front do site e do painel de Lucas Gobatto, corretor de imóveis comerciais em Juara/MT. Tem catálogo público,
detalhe de imóvel, contato com consentimento LGPD e o painel `/admin`. A API NestJS fica no repositório irmão
`../Corretor-API` ([README da API](../../Corretor-API/docs/README.md)).

## Stack

- React 18 + TypeScript estrito + Vite 7 + React Router 7.
- Formulários com react-hook-form e zod. Estilos com Tailwind 4 (tokens em `src/styles/tailwind.css`).
- SSR próprio para as páginas públicas (`src/seo/` e `scripts/*.mjs`). O painel roda só no navegador.
- Node `>=24 <25`.

## Instalação e execução local

```bash
git clone https://github.com/Edu4rdo-Gobatto/Corretor-web.git
cd Corretor-web
npm ci
cp .env.example .env   # ou copie com a ferramenta do seu sistema
npm run dev            # SSR com HMR em http://127.0.0.1:5173
```

O `dev` escuta em `0.0.0.0` por padrão, para conferir no celular pela rede local. O painel fica em
`/admin/entrar`. Para entrar, a API irmã precisa estar rodando (`npm run start:dev` lá) com uma conta já cadastrada.

## Comandos

```bash
npm run dev          # SSR e HMR em 127.0.0.1:5173 (PORT e HOST mudam porta e interface)
npm run build        # tsc -b + dist/client, dist/server e .vercel/output
npm run preview      # serve o build em 127.0.0.1:4173
npm run typecheck
npm run lint
npm test             # vitest: 3 arquivos, 23 testes
npm run visual       # Playwright visual: hoje sem specs, não executa nada útil
node scripts/seo-smoke.mjs          # smoke do SSR após o build: falha desde 06/10 (ver Testes)
node scripts/seo-smoke.mjs --serve  # prévia com API fictícia em 127.0.0.1:4180 (API em 4199)
```

## Variáveis de ambiente

Copie `.env.example` para `.env`. Nunca suba o `.env` (já está no `.gitignore`).

| Variável | Onde vale | Função |
|---|---|---|
| `VITE_API_URL` | navegador (vai para o bundle) | base das chamadas; use `/api`. Sem valor, o front usa `/api` |
| `API_ORIGIN` | servidor (proxy, SSR e rewrite da Vercel) | origem da API, só esquema e host. Em produção exige HTTPS, exceto localhost |
| `API_PROXY_TARGET` | `scripts/dev.mjs` | alternativa ao `API_ORIGIN` só no `dev` |
| `SITE_URL` | servidor | origem pública do site. Sem ela não há canonical nem JSON-LD. O `.env.example` deixa vazia |
| `SEO_INDEXABLE` | servidor | `true` libera `index,follow`, só com `NODE_ENV=production`, fora de preview e com `SITE_URL` e `API_ORIGIN` em HTTPS |
| `NODE_ENV` | servidor | `production` habilita as checagens acima. O `build` força `production` |
| `VERCEL_ENV` | servidor (Vercel) | `preview` nunca indexa |
| `PORT` | `dev` e `preview` | porta (padrão 5173 e 4173) |
| `HOST` | `dev` | interface (padrão `0.0.0.0`) |

Nunca coloque segredo em variável `VITE_*`. Em `dev` e `preview`, `scripts/safe-origin.mjs` recusa `API_ORIGIN` que
não seja localhost ou loopback, para não alterar dados reais por acidente.

## Como o front fala com a API

- **Navegador:** chama `VITE_API_URL || '/api'` (`src/servicos/http.ts`), com `credentials: 'include'`. Todos os
  endpoints ficam em `src/servicos/api.ts` e `locacoes.ts`.
- **Proxy `/api`:** `scripts/runtime.mjs` remove o prefixo `/api` e repassa em streaming para `API_ORIGIN`. Sem
  `API_ORIGIN`, responde 503. A API usa o prefixo `/api/v1`, mas também aceita as rotas sem ele.
- **Na Vercel:** `src/seo/deployment.ts` cria o rewrite `^/api/(.*)` → `${API_ORIGIN}/$1` no build. Mudar
  `API_ORIGIN` exige novo build.
- **SSR:** busca dados públicos direto em `API_ORIGIN`, sem cookies, com 10s por requisição e 45s no total.

## Sessão

A regra fica na API. O front só reage a ela.

- **API:** JWT de acesso de 15 min. A renovação usa o cookie `corretor_renovacao` (httpOnly, `SameSite=strict`,
  `secure`, sem `maxAge`), que some ao fechar o navegador. A sessão expira após 4h sem uso. O token de renovação é
  fixo, sem rotação: cada uso estende o prazo.
- **Front:** o token de acesso fica só em memória. Um 401 dispara uma única renovação compartilhada
  (`renovarSessao`) e repete a requisição uma vez. Se a renovação falhar com 401/403, o front limpa o token e emite
  `session-expired`. A exceção é "Origem não autorizada.", que limpa o token sem emitir o evento.
- **Ao abrir o painel:** o `ProvedorSessao` (`src/hooks/useSessao.tsx`) restaura a sessão com `api.renovar()`,
  que é o mesmo `renovarSessao`.
- Não há cronômetro de inatividade no front.

Como o cookie é `secure`, a sessão no navegador exige HTTPS ou o proxy do próprio front.

## Estrutura de `src/`

```text
src/
├── App.tsx, main.tsx   # rotas e entrada do cliente
├── componentes/        # UI compartilhada: Tabela, Dialogo, AcaoIcone, CampoNumero, CampoCreci, GerenciadorMidia...
├── config/             # brand.ts (marca, contato, privacidade) e devs.ts
├── hooks/              # useSessao, useTema, useRecurso, useDadosPainel, useFiltrosAutomaticos, useEscVoltar...
├── paginas/painel/     # telas do /admin: LayoutPainel, Entrar, VisaoGeral, listas, fichas e editores
├── paginas/publico/    # Catalogo, DetalheImovel, Privacidade, Devs
├── seo/                # server.tsx (SSR, robots, sitemap, llms), metadata.ts, context.tsx, deployment.ts, fixture.ts
├── servicos/           # http.ts, api.ts, locacoes.ts, urls.ts, contato.ts, formato.ts e demais regras
├── styles/             # tailwind.css (tokens) e global.css
├── test/               # setup.ts do vitest
└── tipos/              # index.ts: tipos do contrato da API, em português
```

O mapa completo está em [AGENTS.md](AGENTS.md#mapa-do-código).

## Rotas

- **Públicas:** `/`, `/imoveis/{salas|lojas|galpoes|predios|terrenos}`, `/imoveis/{para-alugar|para-comprar}` e as
  combinações, `/imoveis/:slug`, `/privacidade` e `/devs`. Rota desconhecida dá 404 e volta ao início em 8s.
- **Painel:** `/admin/entrar` e, dentro do layout, `/admin`, `imoveis`, `imoveis/novo`, `imoveis/:id`,
  `imoveis/:id/editar`, `contatos`, `pessoas`, `pessoas/:id`, `corretores`, `corretores/:id`, `cadastros`,
  `cadastros/:categoria/:id`, `comissoes`, `comissoes/:id`, `contratos`, `contratos/:id` e `perfil`.
- **Endereços antigos:** `/admin/login`, `/admin/leads`, `/admin/clientes`, `/admin/proprietarios` e
  `/admin/inquilinos` redirecionam para `entrar`, `contatos` ou `pessoas`.

## SEO e renderização

As páginas públicas são renderizadas no servidor e hidratadas no navegador. O painel não passa pelo SSR e sai com
`noindex,nofollow`.

- Anúncios têm título, descrição, canonical, Open Graph, Twitter Cards, JSON-LD de imóvel e breadcrumbs.
- `/sitemap.xml` lista home, privacidade e imóveis disponíveis. `/devs` fica fora do sitemap e é sempre
  `noindex,follow`.
- `/robots.txt` aponta para o sitemap. `/llms.txt` traz um resumo público.
- Filtros do catálogo saem com `noindex,follow` e canonical normalizado.
- Imóvel inexistente ou rota desconhecida: 404. API indisponível: 503 com `Retry-After: 30`; a página espera e se
  recupera sozinha. Respostas indexáveis usam `s-maxage=300`.
- Com a indexação desligada, as páginas saem com `noindex` e o sitemap fica vazio.

## Publicação

O build gera a Build Output API v3 da Vercel em `.vercel/output`: função `render.func` com `nodejs24.x`,
`maxDuration: 60` e streaming. O `vercel.json` usa `framework: null`, `buildCommand: npm run build` e
`outputDirectory: .vercel/output`. Esta pasta local não está vinculada a um projeto Vercel.

Ambiente de teste, conforme os últimos registros datados:

- **Front:** projeto Vercel `corretor-web-test`, em <https://corretor-web-test.vercel.app>, desde 13/09. Em 13/09
  o dono autorizou `SITE_URL=https://corretor-web-test.vercel.app` e `SEO_INDEXABLE=true` em Production. Em 08/10
  o domínio respondia e repassava `/api` para a API.
- **API:** Render, serviço `srv-daj21e15efls73fab4gg`. Último deploy registrado em 08/10, com o commit `86ecf29`
  da API.
- O commit do front implantado hoje não está registrado. Confira no painel da Vercel antes de afirmar.

Checklist para publicar:

1. Node 24.x, `npm ci` e `npm run build`.
2. `API_ORIGIN` com a origem HTTPS da API, no build e no runtime. `VITE_API_URL=/api`.
3. Na API, o domínio do front em `ALLOWED_ORIGINS`.
4. `SITE_URL` com o domínio HTTPS oficial. `SEO_INDEXABLE=true` só em Production.
5. Conferir `/`, um anúncio, `/robots.txt`, `/sitemap.xml`, `/llms.txt` e `/admin/entrar` no domínio publicado.

Quando o mesmo pacote muda API e front, publique a API primeiro.

## Testes

- `npm test`: vitest com 3 arquivos e 23 testes em `src/servicos/` (contato/LGPD, URLs de filtro e formatação de
  valores). As suítes antigas foram removidas em 03/10 e a mínima foi recriada em 04/10.
- `npm run visual`: o `playwright.visual.config.ts` aponta para `tests/visual/`, mas lá só há ajudantes. Não há
  specs.
- `node scripts/seo-smoke.mjs`: falha desde 06/10, porque a linha 40 ainda espera o h1 antigo "Imóveis comerciais".
- A API irmã não tem suítes.

## Navegação por teclado

- **Esc volta:** no site e no login, fora do catálogo, Esc leva ao início. No painel, volta à página anterior
  (sem histórico: lista da seção, depois Visão geral).
- Esc fecha antes diálogos, menu, dicas e filtros abertos, e é ignorado com o foco em campo de texto. Regra em
  `src/hooks/useEscVoltar.ts`.
- **Ctrl/⌘+K** abre a paleta de comandos do painel.
- O retorno visual é sempre o `BotaoVoltar` (seta em círculo no topo da tela).

## Documentação

Comece pelo [INDICE.md](INDICE.md).
