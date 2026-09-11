# Tarefas — corretor-web

Status possíveis: `aberta`, `em andamento`, `em revisão`, `bloqueada`, `concluída`.
Quem assume uma tarefa escreve o próprio nome em Responsável e reflete isso no `PROJECT_STATUS.md`.
Tarefas da API ficam em `../Corretor-API/TASKS.md`.

---

## DEPLOY-002 — Publicar o front

Status: bloqueada
Responsável: —
Revisor: —

Objetivo:

Publicar o front com SSR, apontando para a API em produção.

Bloqueios atuais:

- A API ainda não está publicada (DEPLOY-001 no repositório irmão).
- O plano Hobby da Vercel restringe uso comercial, e o produto será vendido a corretores.
- O build atual é específico da Vercel: `scripts/build.mjs` gera `.vercel/output` no formato Build Output API v3,
  com função `render` declarada como `nodejs24.x`. Mudar de plataforma exige adaptar build e runtime.

Critérios de conclusão:

- Plataforma definida e registrada em `DECISIONS.md`.
- Variáveis de produção configuradas: `VITE_API_URL=/api`, `API_ORIGIN` com o domínio HTTPS da API,
  `SITE_URL` com o domínio público do site, `SEO_INDEXABLE` conforme a decisão e `VITE_DEMO_MODE=false`.
- `ALLOWED_ORIGINS` da API atualizado com o domínio do front, senão login, refresh e logout respondem 403.
- Conferir em produção: catálogo, detalhe de imóvel, login no painel com cookie de refresh, upload de mídia,
  envio de lead, `robots.txt`, `sitemap.xml` e uma rota inexistente.

---

## SEO-001 — Ligar a indexação

Status: bloqueada por DEPLOY-002
Responsável: —

Objetivo:

Sair de `noindex` e permitir a indexação das páginas públicas.

Critérios de conclusão:

- `SITE_URL` e `API_ORIGIN` em HTTPS, `NODE_ENV=production` e `SEO_INDEXABLE=true`.
- `robots.txt` publicando o `Sitemap:` e liberando as páginas públicas.
- `sitemap.xml` listando os imóveis reais.
- Páginas de catálogo e de imóvel com `index,follow`; painel, preview, 404 e filtros seguem sem indexação.
- Conferir o preview de link no WhatsApp e no LinkedIn.

---

## UX-001 — Cold start visível para o visitante

Status: aberta
Responsável: —

Objetivo:

O SSR busca dados da API com timeout de 10 s. Se a API estiver hospedada em plano que suspende por inatividade,
a primeira visita cai na página de indisponibilidade.

Critérios de conclusão:

- Decidir entre manter a API acordada, aumentar o timeout, servir um estado de carregamento no lugar do erro,
  ou aceitar o comportamento atual.
- Registrar a decisão em `DECISIONS.md` e, se houver mudança de código, cobrir com teste.

---

## DOC-002 — Atualizar o README do front

Status: aberta
Responsável: —

Objetivo:

O `README.md` está desatualizado: pede Node 20+ (o `package.json` exige `>=24 <25`), usa `Copy-Item` do PowerShell,
diz que a aplicação sobe em `localhost:5173` (o servidor escuta em `127.0.0.1`), descreve o proxy do Vite, que não
existe mais, e não lista os scripts `dev:demo`, `build:demo`, `preview:demo`, `test` e `typecheck`, nem as variáveis
`API_ORIGIN`, `SITE_URL` e `SEO_INDEXABLE`.

Critérios de conclusão:

- README refletindo os scripts, as variáveis e o fluxo de SSR atuais.

---

## Concluídas

### SYNC-001 — Sincronizar e validar a entrega de SEO/SSR — concluída em 11/09/2026 (Claude)

Cópia local atualizada de `78200ff` para `d4f6b2f`; 64 testes aprovados; lint, typecheck e build sem erro;
smoke do SSR em modo demo aprovado; homologação com API, Neon e R2 reais, com JSON-LD e `og:image` verificados.
Detalhes em `docs/handoffs/2026-09-11-infra-neon-r2.md`.
