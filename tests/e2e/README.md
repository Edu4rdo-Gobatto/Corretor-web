# Testes ponta a ponta (Playwright Test)

Fluxos críticos no navegador real, com servidor SSR, proxy `/api`, backend e
banco reais de teste. Vitest continua para unidade/componentes; o E2E cobre o
que só existe com tudo ligado: SSR, proxy, autenticação e persistência.

## Pré-requisitos

1. `npm ci` e Chromium: `npx playwright install chromium`
   (fixado em `@playwright/test@1.60`, que reaproveita o Chromium já instalado).
2. API real no ar apontando ao banco de teste `homologacao_pt`
   (nunca produção): `HOMOLOGACAO_DATABASE_URL` no repositório irmão.
3. Front SSR no ar: `npm run preview` (ou `npm run dev`) em outro terminal.
4. HTTPS local (cookie `corretor_renovacao` é `Secure` e o navegador o descarta
   em HTTP). Gere um cert autoassinado fora do Git e suba SSR/API em HTTPS, ou
   use um proxy TLS local. `ignoreHTTPSErrors` já está ligado no config.

## Variáveis (sem segredos versionados)

| Variável | Função |
|---|---|
| `E2E_BASE_URL` | origem do SSR (padrão `http://127.0.0.1:4173`) |
| `E2E_WEB_SERVER=1` | sobe `npm run preview` automaticamente |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_SENHA` | conta ADMIN de teste (fluxos autenticados) |
| `E2E_CORRETOR_EMAIL` / `E2E_CORRETOR_SENHA` | conta CORRETOR de teste (papéis; opcional) |
| `E2E_ALLOW_EXTERNAL=true` | autoriza explicitamente escritas em homologação remota; sem isso, somente localhost é permitido |

Sem backend (`/api/saude` fora do ar) ou sem credenciais, os testes
dependentes pulam com o motivo explícito — contam como **não executados**,
nunca como aprovados.

## Comandos

```bash
npm run test:e2e          # desktop + mobile
npm run test:e2e:desktop  # só desktop
npm run test:e2e:mobile   # só viewport 390px
npm run test:e2e:ui       # modo interativo
```

Artefatos (`test-results/`, `playwright-report/`) ficam fora do Git.

## Dados e segurança

- Tudo sintético com prefixo `e2e-<execução>`; limpeza via API após cada teste.
- Banco de teste identificado (`homologacao_pt`); sem migrations, deploys ou
  escrita em produção pelos testes.
- R2 usa o bucket de homologação; Drive usa falha explícita (`FALHOU`) sem
  credenciais — a criação real no Drive compartilhado é homologação externa
  separada, não declarada aqui como validada.
