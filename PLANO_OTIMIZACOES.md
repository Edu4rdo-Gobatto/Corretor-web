# Plano de Otimizações — UX, SEO e Crawl Budget

Objetivo: melhorar Core Web Vitals (LCP, CLS, INP), SEO on-page e reduzir o crawl budget do Googlebot (menos bytes rastreados, mais páginas indexadas).

Stack: React 18 + Vite + SSR custom (Express-like em `scripts/*.mjs`) + Tailwind v4 + `src/seo/` (meta, OG, Twitter, JSON-LD, sitemap, robots).

---

## Fase 0 — Crawl Budget (menos bytes rastreados pelo Googlebot)

**O que é:** o Googlebot rastreia um volume limitado de bytes por site. Quanto mais leve e focado for o site, mais páginas importantes ele indexa.

**Ações (servidor SSR em `scripts/dev.mjs`, `scripts/build.mjs`, `scripts/preview.mjs`):**

1. **Compressão gzip/brotli** nas respostas HTML e API.
2. **Cache-Control agressivo** em assets estáticos:
   - JS/CSS/imagens/fontes versionados: `public, max-age=31536000, immutable`
   - HTML dinâmico: `public, max-age=60, stale-while-revalidate=300`
3. **Sitemap.xml** (`src/seo/server.tsx`): listar apenas URLs canônicas e importantes (imóveis ativos, corretores, categorias). Excluir parâmetros de filtro/paginação que geram URLs duplicadas.
4. **robots.txt**: `Disallow: /api/` e caminhos privados; `Allow` apenas para páginas públicas.
5. **Canonical consistente** em todas as páginas públicas — evitar conteúdo duplicado que desperdiça crawl budget.
6. **HTML inicial mais leve**: inline apenas CSS crítico acima da dobra; adiar CSS não crítico.

---

## Fase 1 — Imagens (Core Web Vitals: LCP, CLS, dados móveis)

**Criar componente `<ImgOtimizada />`** em `src/componentes/`:
- `width`/`height` obrigatórios (evita CLS)
- `loading` / `decoding` configuráveis
- `srcset` / `sizes` opcionais (entrega imagem certa por tela)
- `fetchpriority` para acima da dobra
- `onError` com fallback

**Substituir `` cru por `<ImgOtimizada />`:**
- `src/paginas/publico/DetalheImovel.tsx` (foto corretor + galeria)
- `src/paginas/painel/FichaCorretor.tsx`
- `src/paginas/painel/Imoveis.tsx` (capa da lista)
- `src/paginas/painel/Perfil.tsx` (prévia)
- `src/componentes/CartaoImovel.tsx`
- `src/componentes/GaleriaMidia.tsx`

**Prioridade de carregamento:**
- Acima da dobra (hero, foto principal, foto do corretor na página pública): `loading="eager"` + `fetchpriority="high"`
- Abaixo da dobra / thumbnails: `loading="lazy"`

---

## Fase 2 — SEO (revisar lacunas)

A base já existe em `src/seo/` (title, description, robots, canonical, OG/Twitter, JSON-LD `RealEstateListing`, `RealEstateAgent`, `BreadcrumbList`, sitemap, robots).

**Confirmar/ajustar:**
- `og:image` + `og:image:width/height/alt` em `DetalheImovel`
- JSON-LD `RealEstateListing` inclui `image`
- Canônico correto em `imoveis/:slug`
- Meta title/description únicos por imóvel e corretor

---

## Fase 3 — Outras otimizações de desempenho e SEO

1. **Code splitting / lazy loading de rotas** — páginas do painel e públicas carregadas sob demanda.
2. **Adiar JS não crítico** — componentes de terceiro plano (`defer` ou carregamento condicional).
3. **WebP/AVIF nas imagens servidas** — garantir que o upload (`prepararMidia.ts`) já converte para WebP; servir AVIF quando suportado.
4. **Preload de fontes críticas** — `@fontsource` com `rel="preload"` para fontes acima da dobra.
5. **INP (Interaction to Next Paint)** — debounce em filtros de busca, evitar bloqueio da thread principal durante renderização de listas grandes.
6. **404 e 503 otimizados** — páginas de erro com `<Seo>` adequado e links para navegar de volta.

---

## Fase 4 — Verificação (quando liberar para execução)

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build` (produção) — checar bundle e assets

---

## Status

- Planejado: todas as fases.
- Em andamento: nenhuma.
- Concluído: import dinâmico do `browser-image-compression` + `loading="lazy" decoding="async"` em 4 arquivos (já feito no front).
