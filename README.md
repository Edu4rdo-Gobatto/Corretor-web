# Corretor Comercial

Interface editorial para imóveis comerciais, com catálogo público, detalhe de imóvel, captação de contatos e painel administrativo. O front é um repositório separado da API NestJS em `../Corretor-API`.

## Stack

- **Framework:** React 18 + TypeScript
- **Build tool:** Vite
- **Deploy:** Vercel (arquivos estáticos + função Node.js para SSR e proxy)

## Pré-requisitos

- Node.js 24.x
- npm 10+
- Git

## Instalação e execução local

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/corretor-web.git
cd corretor-web

# Instale as dependências
npm install

# Configure as variáveis de ambiente
Copy-Item .env.example .env
# Em desenvolvimento, API_ORIGIN aponta para http://localhost:3000

# Inicie em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
# URL usada pelo navegador; /api mantém o cookie no domínio do front
VITE_API_URL=/api
# Origem da API usada pelo servidor SSR e pelo proxy
API_ORIGIN=http://localhost:3000
# Domínio canônico; deixe vazio enquanto não estiver definido
SITE_URL=
SEO_INDEXABLE=false
# Ative apenas para uma prévia visual local sem serviços externos
VITE_DEMO_MODE=false
```

A Vercel encaminha `/api/*` por rewrite externo (o servidor local usa proxy em streaming) para `API_ORIGIN`, removendo `/api` e preservando métodos, corpo e cookies. A API NestJS não possui prefixo `/api`. Use `VITE_API_URL=/api` no navegador; consultas SSR usam um cliente separado, sem cookies, tokens ou renovação de sessão.

> Nunca suba o `.env` para o repositório. Ele já está no `.gitignore`.

## Modo demonstrativo

O comando `npm run dev:demo` ativa dados fictícios somente por configuração explícita. A faixa superior e o login identificam o modo. Contatos, imóveis criados e mídias ficam em memória e desaparecem ao recarregar; uma falha de rede nunca ativa esse modo.

Credenciais demonstrativas: use os botões Administrador ou Corretor na tela de login, ou `admin@demo.local` / `agent@demo.local`, senha `demo`.

## Scripts disponíveis

```bash
npm run dev       # Desenvolvimento com hot reload
npm run build     # Compila para produção
npm run preview   # Visualiza o build de produção localmente
npm run lint      # Verifica o código
```

## Estrutura do projeto

```
src/
├── assets/         # Imagens e arquivos estáticos
├── components/     # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── services/       # Comunicação com a API (fetch/axios)
├── hooks/          # Custom hooks
├── types/          # Tipagens TypeScript compartilhadas
└── main.tsx        # Entry point da aplicação
```

## SEO e renderização

As páginas públicas são renderizadas no servidor e hidratadas no navegador. O painel continua no cliente, com `noindex,nofollow` no HTML inicial e em `X-Robots-Tag`. Os dados iniciais são usados uma vez; voltar ao anúncio após navegar consulta novamente a API.

- Home: imóveis comerciais para alugar e comprar em Mato Grosso, com salas, lojas, galpões, prédios e terrenos no conteúdo.
- Anúncios: título, descrição, canonical, Open Graph, Twitter Cards, JSON-LD de imóvel/oferta e breadcrumbs. Dados e metadados são atualizados juntos durante a navegação.
- `/sitemap.xml`: consulta todas as páginas da API pública, em lotes de 100 com até seis consultas simultâneas, sem anúncios administrativos. Inclui home, privacidade e imóveis disponíveis; usa `updatedAt` para `lastmod`, remove duplicatas e divide em `/sitemaps/N.xml` acima de 45 mil URLs ou 45 MB por arquivo. O prazo total de consulta é 45 segundos; qualquer falha retorna 503, nunca um sitemap parcial.
- `/robots.txt`: aponta para o sitemap e bloqueia `/api` quando a indexação está habilitada. O painel não é bloqueado por robots para que o robô consiga ler seu `noindex`; autenticação continua sendo a proteção de acesso.
- `/llms.txt`: resumo público e links úteis. É complementar e não garante posicionamento ou presença em respostas de IA.
- Catálogo paginado sem filtros: canonical próprio e links navegáveis. Filtros: `noindex,follow`, canonical normalizado e exclusão do sitemap. Parâmetros de rastreamento não entram no canonical.
- Imóvel inexistente ou rota desconhecida: HTTP 404. API indisponível: HTTP 503. Erros e painel não recebem cache. Respostas públicas indexáveis usam cache de CDN por 300 segundos, sem cache no navegador.

Não há pesquisa de volume de buscas nem meta keywords: o foco é conteúdo útil por tipo, finalidade e localização real de cada imóvel. O desenho do site é preservado com ajustes de texto e breadcrumbs.

## Publicação na Vercel

O projeto usa a [Build Output API](https://vercel.com/docs/build-output-api), gerada por `npm run build`. O arquivo `vercel.json` seleciona **Other** (`framework: null`). Não use apenas a pasta estática `dist/client`: ela depende da função SSR.

1. Configure Node.js **24.x**, instalação `npm ci` e build `npm run build`. Remova overrides antigos de SPA no painel da Vercel; use a configuração versionada.
2. Defina `API_ORIGIN` no build e no runtime com a origem HTTPS da API (sem `/api` ou outros caminhos) e mantenha `VITE_API_URL=/api`. Configure no backend o domínio do front como origem permitida e cookies compatíveis com o proxy. O proxy não reescreve o atributo `Domain` de cookies. Na Vercel, os uploads seguem diretamente para o backend por rewrite, sem passar pela função SSR. Alterar `API_ORIGIN` exige novo build.
3. Defina `SITE_URL` com o domínio HTTPS oficial, sem caminho. Enquanto o domínio não estiver definido, deixe `SEO_INDEXABLE=false`.
4. Quando domínio e API estiverem prontos, defina `SEO_INDEXABLE=true` **somente em Production** e publique. A ativação exige origens HTTPS válidas. Preview, desenvolvimento e builds demonstrativos permanecem sem indexação.
5. Confira `/`, um anúncio, `/robots.txt`, `/sitemap.xml`, `/llms.txt` e `/admin/login` no domínio publicado. O HTML deve conter conteúdo e metadados antes de executar JavaScript.
6. Verifique a propriedade do domínio no Google Search Console, envie `sitemap.xml` e inspecione a home e um anúncio. Acompanhe indexação, erros 404/503 e Core Web Vitals; a implementação não garante indexação ou ranking.

Com indexação desativada, as páginas entregam `noindex`, robots bloqueia o rastreamento e o sitemap fica vazio para não divulgar URLs demonstrativas. O cache da CDN pode levar até cinco minutos para refletir alterações no catálogo. A validação local usa uma API fictícia; publicação e Search Console precisam dos acessos reais.

### Saídas e comandos

```bash
npm run dev          # SSR e HMR em http://127.0.0.1:5173
npm run dev:demo     # SSR demonstrativo, sem backend
npm run build       # dist/client, dist/server e .vercel/output
npm run preview     # Servidor do build em http://127.0.0.1:4173
npm run build:demo   # Build explicitamente demonstrativo
npm run preview:demo
npm run typecheck
npm run lint
npm test
node scripts/seo-smoke.mjs         # Após build: SSR e proxy contra API fictícia local
node scripts/seo-smoke.mjs --serve # Mantém a prévia de QA em http://127.0.0.1:4180
```

O smoke test usa as portas locais 4180 e 4199. `PORT` permite escolher outra porta para `dev`/`preview`. `API_PROXY_TARGET` continua aceito como fallback em desenvolvimento. Use `Ctrl+C` para encerrar as prévias.

Referências: [SSR do Vite](https://vite.dev/guide/ssr), [SEO JavaScript do Google](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) e [Vercel Functions](https://vercel.com/docs/build-output-api/primitives).

## Administração de locações — entrega de 12/09/2026

Cadastros de proprietários e inquilinos PF/PJ, dados bancários do proprietário, contratos e documentos privados estão disponíveis para ADMIN. Consulte `docs/plans/2026-09-12-rental-administration.md` para interfaces, limites e fluxo. Comissão, cobranças e repasses ainda não fazem parte desta entrega.

No painel: Proprietários → Novo cadastro; Inquilinos → Novo cadastro; Contratos → selecionar imóvel de locação e as duas partes. As fichas permitem editar dados, consultar contratos vinculados e anexar documentos. Pessoas com contrato ativo não podem ser desativadas. Contratos encerrados permanecem no histórico.

Pré-requisitos novos na API: aplicar a migration `1789257600000-create-rental-administration` após backup do Neon e configurar `R2_DOCUMENTS_BUCKET` com bucket **privado**, separado de `corretor-midia`, e permissão S3 de leitura/escrita no token existente. Sem bucket configurado, os anexos retornam 503; não há fallback público. Não aplicar migrations sem revisar o histórico existente. Não publicar arquivos .env nem dados pessoais.

Verificações: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` em cada repositório. No front, `node scripts/seo-smoke.mjs` confere SSR, proxy e discovery após o build. Node suportado: >=24 <25.
