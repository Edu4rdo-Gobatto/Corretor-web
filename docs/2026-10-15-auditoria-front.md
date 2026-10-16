# Auditoria completa do front-end — 2026-10-15

Auditoria de código estático do repositório `corretor-web` (React 18 + TypeScript + Vite 7 + Tailwind v4). Não houve alteração de código, commit, push nem deploy. A API (repositório separado), homologação em dispositivo físico/Safari e execução da suíte visual não fizeram parte do escopo.

## Veredito executivo

Qualidade de código **acima da média**: typecheck, lint e os 23 testes unitários passam limpos; segurança e acessibilidade são tratadas com maturidade rara em projetos deste tamanho. Os riscos concentram-se em **cobertura de testes** (a suíte visual não tem nenhum spec commitado e a unitária cobre só 3 módulos de serviço) e em alguns pontos de desempenho/polimento. Nenhum achado crítico de segurança.

## Verificações executadas

| Verificação | Resultado |
|---|---|
| `npm run typecheck` | ✅ sem erros |
| `npm run lint` | ✅ sem erros (4 `eslint-disable`, todos comentados) |
| `npm run test` | ✅ 23/23 em 3 arquivos (urls, formato, contato) |
| `npm audit` | ⚠️ 2 high em dev-deps (brace-expansion, source-map-js) |
| `npm outdated` | ℹ️ majors defasadas (ver M6) |
| Grep de padrões perigosos | ✅ nenhum `dangerouslySetInnerHTML`/`eval`; `innerHTML` só em template próprio escapado |

## Pontos fortes evidenciados

1. **Segurança madura**: `videoEmbed.ts` só aceita YouTube (nocookie) e Vimeo com validação de protocolo/credenciais; SEO/JSON-LD escapados (`escapeHtml`/`serialize`); honeypot no formulário público; `rel="noopener noreferrer"` em todos os `_blank`; token de acesso só em memória com renovação deduplicada e retentativa única em 401 (`http.ts`); headers de segurança no SSR e no proxy `/api`; parâmetros de URL com clamp (página ≤ 100000, ≤ 20 tipos, limites de valor/área); anti-flash de tema no `index.html`.
2. **Acessibilidade exemplar**: `Dialogo.tsx` usa `<dialog>` nativo com pilha de modais, restauração de foco, trava de rolagem com compensação de scrollbar e confirmação de "alterações não salvas"; `Campo.tsx` conecta rótulo/dica/erro via `aria-describedby`/`aria-invalid`/`aria-required`; `FiltroSuspenso` com fieldset/legend e teclado; skip-link e foco gerenciado no painel; `prefers-reduced-motion` respeitado; `aria-live` em contagens/estados.
3. **Arquitetura consistente**: vocabulário de domínio em PT-BR ponta a ponta, code-splitting de todo o painel (`lazy`), hooks com guarda de race condition (`sequencia`/`ativo`), filtros com debounce e deduplicação, marca centralizada em `config/brand.ts`, zero componentes mortos, zero `any`.
4. **SSR/SEO profissional**: canonical e robots por contexto, JSON-LD `RealEstateListing`/`BreadcrumbList`, orçamento de fetch público (45s), build duplo (client + SSR) gerando Vercel Build Output v3 com função Node 24 e streaming.
5. **Robustez de entrada**: CPF/CNPJ com dígito verificador, telefone/máscara nacionais, `normalizarDecimal` cobre "1.234,56" e "1234.5" com testes.

## Achados

### Alto

**A1 — Suíte visual sem nenhum teste commitado.** `tests/visual/` contém apenas os auxiliares (`ajudantes`, `api-simulada`, `orcamento`, `preparar`, `seguranca`); `playwright.visual.config.ts:27` referencia `**/publico.spec.ts`, que não existe. `npm run visual` executa 0 testes. Todo o QA visual descrito em `docs/` foi efêmero — a infraestrutura pronta (API simulada, 7 combinações de viewport/tema) está sem specs, então não há regressão automatizada de UI.
**Ação:** criar/ressuscitar os specs (catálogo público, detalhe, login, listas do painel) e commitá-los.

**A2 — Cobertura unitária restrita a 3 módulos.** Sem teste algum: `http.ts` (renovação de sessão e retentativa 401 — a lógica mais crítica e cheia de casos do app), `validacao.ts` (CPF/CNPJ), `videoEmbed.ts` (parser de segurança), `seo/metadata.ts` (`buildSeo`: robots/canonical/JSON-LD), todos os hooks (`useFiltrosAutomaticos`, `useDadosPainel`, `useRecurso`) e componentes de interação (`Dialogo`).
**Ação:** priorizar http/validacao/videoEmbed/buildSeo — são puros e triviais de testar.

### Médio

**M1 — Classificações re-baixadas a cada consulta.** `api.ts:107-110` (`listarImoveis`) chama `classificacoes()` (paginação das 3 categorias) sempre que há tipo/finalidade no filtro, sem cache; `Catalogo.tsx:35` carrega as mesmas classificações de novo para os seletores. Cada troca de filtro/página dispara ≥ 4 requisições redundantes.
**Ação:** cache em módulo (memo com TTL curto) e reuso entre os dois pontos.

**M2 — Typo em produção.** "a opção **idela**" em `src/paginas/publico/Catalogo.tsx:87` (ler "ideal").

**M3 — Cidades do filtro derivadas só da página atual.** `Catalogo.tsx:40` monta o seletor a partir dos 9 imóveis carregados: cidades de outras páginas/filtros ficam fora, e a lista muda conforme a navegação.
**Ação:** endpoint/facet dedicado na API ou lista completa em cache.

**M4 — 2 vulnerabilidades high em dev-deps.** `brace-expansion` e `source-map-js` (cadeia do eslint/typescript-eslint). Sem impacto no bundle de produção; `npm audit fix` resolve.

**M5 — Sem CSP nem HSTS.** Os headers básicos existem (nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy) no SSR e no proxy `/api`, mas não há `Content-Security-Policy` (allowlist cobriria youtube-nocookie, player.vimeo, wa.me) nem `Strict-Transport-Security`.

**M6 — Majors defasadas.** React 18→19, Vite 7→8, TS 5.9→7, ESLint 9→10, lucide-react 0.468→1.57, jsdom 26→29, @vitejs/plugin-react 5→6. Sem urgência; planejar janela de atualização com a suíte visual de pé (A1) para segurar regressão.

### Baixo

**B1 — Helper de teste em árvore de produção.** `src/paginas/painel/sessaoTeste.ts` importa `vitest` e não tem nenhum importador. Mover para `src/test/` ou excluir.

**B2 — Sem AbortSignal nos hooks de dados.** `useRecurso`/`useDadosPainel` descartam respostas fora de ordem, mas as requisições órfãs seguem até o timeout de 65s. Repassar `signal` cortaria o desperdício.

**B3 — `ContextoSessao` sem memo no value** (`useSessao.tsx:49`): consumidores re-renderizam a qualquer render do provedor. Impacto prático pequeno.

**B4 — Config conservadora.** `tsconfig` sem `noUncheckedIndexedAccess`; ESLint sem plugin de a11y (compensado pela disciplina manual atual).

**B5 — `useRecurso` mapeia qualquer erro ≠ 404 para 503** (`useRecurso.ts:21`), mascarando outros status na UI.

**B6 — Asserções não-nulas pontuais** (`Catalogo.tsx:20` com `!`, `main.tsx:9-11`): seguras hoje porque o roteamento e o HTML são controlados, mas frágeis a refactor.

## Recomendações em ordem

1. Commitar specs visuais (transforma todo o histórico de QA efêmero em regressão permanente).
2. Testes unitários para `http.ts`, `validacao.ts`, `videoEmbed.ts`, `buildSeo` e `useFiltrosAutomaticos`.
3. Cache de classificações + reuso catálogo/API.
4. Corrigir typo "idela" (M2) — 1 linha.
5. `npm audit fix` + adicionar CSP/HSTS.
6. Mover/excluir `sessaoTeste.ts`.
7. Plano de atualização de majors (após 1).
8. Fonte estável para a lista de cidades do filtro.

## Anexo — amostra examinada

`App.tsx`, `main.tsx`, `LayoutPainel.tsx`, `Catalogo.tsx`, `Dialogo.tsx`, `FiltroSuspenso.tsx`, `Campo.tsx`, `FormularioContato.tsx`, `useSessao.tsx`, `useDadosPainel.ts`, `useRecurso.ts`, `useFiltrosAutomaticos.ts`, `http.ts` (íntegra), `api.ts`, `formato.ts`, `validacao.ts`, `urls.ts`, `catalogo.ts`, `contato.ts`, `videoEmbed.ts`, `seo/context.tsx`, `seo/metadata.ts`, `seo/server.tsx` (parcial), `seo/deployment.ts`, `config/brand.ts`, `tipos/index.ts`, `vercel.json`, `tsconfig.json`, `eslint.config.js`, `index.html`, `playwright.visual.config.ts`, `scripts/build.mjs` (parcial), `tests/visual/*`, `package.json`, além de greps de padrões perigosos em todo o `src`.

## Adendo de 15/10 — Base revalidada e restauração autorizada

O texto original acima foi preservado. Ele descreve o checkout local `36e73b1`; após autorização do dono, a main
foi atualizada por fast-forward para `0dedf02`. As conclusões não devem ser aplicadas indistintamente à base nova.

- A1: ausência de specs confirmada por discovery (0 testes, exit 1). O remoto também removeu a infraestrutura
  visual em 14/10. O dono autorizou explicitamente restaurá-la, com specs, referências e CI, em 15/10.
- A2: `validacao.ts` já tinha cobertura indireta de CPF/CNPJ em `contato.test.ts`; cobertura limitada, não ausência
  total. A ampliação cobre os caminhos críticos e preserva os testes existentes.
- M1: a main atualizada já possui cache público, seed do SSR e deduplicação (catálogo 2 min/classificações 10 min).
  A restauração testa esse comportamento em vez de implementá-lo novamente. A contagem original de chamadas
  também dependia do filtro e da saída do bootstrap, não ocorria igualmente em toda interação.
- M3: cidade é input livre com datalist. As sugestões derivadas da página variam, mas uma cidade ausente pode ser
  digitada. Não há endpoint dedicado de cidades nos códigos inspecionados; a melhoria continua fora desta entrega.
- B1: `sessaoTeste.ts` já foi removido pela main recebida. O smoke também já compara o slogan atual da marca.

Plano: [2026-10-15-restauracao-testes.md](2026-10-15-restauracao-testes.md). Resultados da implementação serão
registrados no status/changelog com os comandos realmente executados. Este adendo não representa nova auditoria
de segurança nem homologação das integrações reais.

### Atualização de 16/10 — Mudanças recebidas durante a retomada

A main agora está em `0513cc9`. O cadastro de cidades e o endpoint `/cidades` foram implementados pelo parceiro;
o catálogo usa essa fonte estável, substituindo o input livre/datalist descrito no adendo anterior. A resposta de
classificações passou a incluir `cidades`. O novo seletor unificado e as regras de publicação/SEO por situação
também foram preservados e incorporados às fixtures e expectativas dos testes. Esses recursos não foram
reimplementados nesta restauração.

### Conclusão da restauração — 16/10/2026

As recomendações de cobertura A1/A2 receberam implementação local: quatro specs Playwright, 32 referências
prontas para versionamento, testes críticos e GitHub Actions. Resultado executado: **214 unitários/13 arquivos**,
**185/185 Playwright em duas matrizes completas consecutivas**, tipos, lint, build e smoke aprovados. Controles
negativos CSS e SSR comprovaram reprovação; referências preservadas. Os testes encontraram quatro defeitos
corrigidos em cache, renovação, destino de login e foco de Mais filtros.

Não houve commit/push/deploy; o workflow remoto ainda não foi executado. Esta entrega não encerra os demais
achados nem substitui homologação real ou aceite visual do dono. Detalhes e evidências no
[resultado do plano](2026-10-15-restauracao-testes.md#resultado-final-em-16102026).
