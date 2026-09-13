# Mobile público — plano de correção

Data: 2026-09-13
Origem: auditoria visual/CSS + regras ui-ux-pro-max (touch 44px, gap 8px, mobile-first).
Escopo: só público (header/footer, catálogo, detalhe, galeria, busca, modal lead). Admin fora.

## Diagnóstico (arquivo:linha)

- Header: `src/components/PublicLayout.module.css:22` — dropdown com `left:-18px/right:-18px`, links sem 44px, sem backdrop/scroll-lock; `src/components/PublicLayout.tsx:32` — `onClick` no `<nav>` rouba foco.
- Hero: `src/pages/public/Catalog.module.css:47` — h1 43px em ≤560px (maior que os 36px do ≤800px), `.verticalText right:-27px` vaza scroll horizontal.
- Busca: `src/pages/public/Catalog.module.css:19-28` — inputs 34px (<44px touch), grid 2-col espremido em 320px, `border-bottom` só no mobile quebra consistência.
- Detalhe: `src/pages/public/PropertyDetail.module.css:18` — `.aside{grid-row:1}` põe preço/CTA antes das fotos; CTA duplicado (botão full-width do card + `.mobileCta` sticky).
- Cards: `src/components/PropertyCard.module.css:2,8,18` — aspect 1.47 vira faixa fina no mobile, arrow 38px (<44px), `.bottom p{white-space:nowrap}` vaza preço/área.
- Galeria: `src/components/MediaGallery.module.css:12` — altura fixa 320px, thumbs sem snap/hint, contador 12px pequeno.
- Global: `src/styles/global.css` — sem `touch-action:manipulation`, footer `margin-top:80px` pesado no mobile.

## Tese (direção de estúdio)

Sujeito: ponto comercial em Juara/MT (sala, loja, galpão, prédio, terreno). Público: comerciante local no celular, com pressa e internet instável. Trabalho único da página: dar confiança para falar com o corretor.

Hero como tese: no mobile o mais característico não é texto grande — é a fachada. O hero vira "vitrine de rua": foto full-bleed de ponta a ponta, com filete dourado de soleira embaixo e legenda como placa de rua. Título curto por cima do contexto, não competindo com a foto.

Tokens mobile (só existentes, sem dependência nova):
- `--navy #0A2042` tinta / fundo balcão; `--navy-deep #071733` hover.
- `--gold #C99B3F` só em filetes, selos, foco e seta — nunca texto corrido sobre branco.
- `--gold-soft #F4E9CF` fundo da seta e realce ativo.
- `--paper #FFFFFF` fundo; `--soft #EEF1F6` ficha de fatos; `--line #E2E6EC` divisória; `--muted #556074` apoio.
- Tipo: display `Libre Baskerville` só em h1/h2/preço (32/26/20px no mobile, `letter-spacing:-0.04em`, `text-wrap:balance`); corpo `Source Sans 3` 16px/1.6; utilitário 12px caixa-alta `letter-spacing:.14em` para eyebrow, selo e contador.
- Ritmo: container `calc(100% - 36px)` em ≤520px (já no global), gaps 16–24px, raio 3–5px, filete ouro 2–4px.

Assinatura + risco: "soleira dourada + placa de rua". Todo bloco de foto (hero, card, galeria) ganha borda inferior dourada de 3px e legenda em faixa navy translúcida como placa. Risco justificado: foto colada na borda (full-bleed) em vez de card flutuante com sombra — em cidade pequena, vitrine encosta na calçada; diferencia do template de card branco flutuante e custa só CSS.

Crítica anti-genérico: rejeitados (1) fundo creme `#F4F1EA` + terracota, (2) fundo preto + verde-ácido, (3) broadsheet com hairlines e zero raio. O brief manda navy/gold/branco de Lucas Gobatto — seguimos o brief à risca. Número `01/02/03` não entra: o conteúdo não é sequência, é vitrine > ficha > contato.

Wireframes mobile (360px):

```text
CATÁLOGO                    DETALHE
┌──────────┐                ┌──────────┐
│ logo ☰   │                │ ‹ voltar │
│ JUARA·MT │                │ Título   │
│ Título32 │                │ local    │
│ intro 16 │                │[galeria] │
│[vitrine] │                │placa 1/8 │
│ soleira═ │                │preço     │
│[Buscar▾] │                │[ficha 2c]│
│ card     │                │descrição │
│ card     │                │[balcão▓] │ ← sticky navy
│ navy fim │                │semelh.   │
└──────────┘                └──────────┘
```

## P0 (quebra / conversão)

1. Menu mobile: full-width alinhado ao container (sem `-18px`), itens com 48px, backdrop + lock de scroll + fechar no Escape, foco no primeiro link e retorno ao botão.
2. Hero ≤560px: h1 32px, esconder `verticalText`, visual `58vw max 280px`, caption compacta.
3. Busca: 1 coluna em ≤560px, inputs/selects 48px, manter borda padrão do global, botão full-width 48px, manter erro com `role=alert`.
4. Detalhe: ordem galeria > fatos > descrição > contato; 1 CTA sticky único (preço + contato) com `safe-area`, card sem duplicar botão no mobile.

## P1 (desconforto)

5. Cards: aspect 4/3 no mobile, arrow 44px, preço com wrap permitido, título 19px.
6. Galeria: altura em `clamp`, thumbs com `scroll-snap`, contador com contraste legível.
7. Polish: footer compacto no mobile, `touch-action:manipulation` em botões, `overscroll-behavior:contain` nos carrosséis, respeitar `prefers-reduced-motion` (já existe no global).

## Incremento visual (aditivo, não substitui P0/P1)

- Menu: sheet navy com links serif 19px, rodapé `CRECI 15776`; fechar só no link/botão/Escape (sem `onClick` no `<nav>` que rouba foco).
- Hero vitrine: visual full-bleed `height:clamp(220px,62vw,300px)` sem `margin-right`, `::before` ouro vira soleira inferior (`height:3px`), caption como placa navy 12px, `intro` 16px/1.6, `text-wrap:balance`.
- Busca "ficha de balcão": `label` 12px caixa-alta, botão navy com filete ouro, "limpar" 44px sublinhado, `priceFields` empilha.
- Detalhe balcão: CTA sticky navy (preço serif branco + `Falar com corretor` ouro), `reference` escondido no mobile.
- Cards: soleira ouro 3px no `.imageLink`, selo `purpose` navy/ouro 11px caixa-alta, preço serif 20px navy com `white-space:normal; overflow-wrap:anywhere`, gap 28px.
- Galeria: thumbs 72px com `snap-align:start`, contador pill 13px fundo `#0A2042CC`, botão expandir 44px, `aria-live`/`aria-current` mantidos.
- Ritmo: footer `margin-top:48px`, `padding:32px 0 14px`, links 44px; uma única entrada `fade-up 240ms` no hero (só sem `prefers-reduced-motion`); foco ouro 3px mantido.

## P2 (voz e microcopy, sem custo de layout)

- Verbos de ação únicos: `Falar com corretor`, `Ver no mapa`, `Compartilhar`, `Buscar`, `Limpar filtros`.
- Vazio: "Nenhum ponto com esse filtro — limpe a cidade ou o preço." Erro: o que houve + como tentar de novo. Sem pedido de desculpa, sem texto inglês.
- Preço sempre com sufixo (`/mês` ou `venda`); área com `m²` sem nowrap quebrado.

## Não fazer

- Sem `any` / `@ts-ignore` (TypeScript estrito).
- Sem `fetch` direto em componente (só `src/services/api.ts`).
- Sem tocar SSR/SEO/URLs, sem dependência nova sem justificar em `DECISIONS.md`.
- CSS Modules + tokens existentes (`--navy`, `--gold`, etc.).
- Sem `window`/`document` durante render de rota pública (regra SSR).

## Validação

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Conferência manual 360/390px: menu, busca, grid, galeria, CTA sticky, modal lead, mais `robots.txt`, `sitemap.xml` e 404 (regra do AGENTS.md para mudança visual pública).
- Incremento visual: hero sem scroll-X em 320–390px, toques ≥44px, ouro nunca como texto sobre branco, `prefers-reduced-motion` sem animação.
- Sem commit sem confirmação do dono (trabalho direto na `main`).
