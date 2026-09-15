# Testes ponta a ponta (Playwright Test)

Fluxos críticos no navegador real, com servidor SSR, proxy `/api`, backend e
banco reais de teste. Vitest continua para unidade/componentes; o E2E cobre o
que só existe com tudo ligado: SSR, proxy, autenticação e persistência.

## Pré-requisitos

1. `npm ci` e Chromium: `npx playwright install chromium`
   (fixado em `@playwright/test@1.60`, que reaproveita o Chromium já instalado).
2. Stack de teste provisionado (nunca produção):
   - API com o banco de teste, sem editar o `.env` (que aponta à produção):
     `DATABASE_URL="<url homologacao_pt>" npm run start:dev` no repositório
     irmão (a URL de homologação segue o fluxo habitual do dono, fora do chat).
   - SSR apontando à API local: `API_ORIGIN=http://localhost:3000 npm run preview`
     (ou `dev`) em outro terminal. O `.env` padrão aponta `API_ORIGIN` à
     produção — com ele, os testes com backend pulam por segurança.
   - Declarar o stack: `E2E_STACK=teste`. Sem isso, todo teste com backend
     pula (não executa nem leitura contra alvo não declarado).
3. HTTPS local (cookie `corretor_renovacao` é `Secure` e o navegador o descarta
   em HTTP). Gere um cert autoassinado fora do Git e suba SSR/API em HTTPS, ou
   use um proxy TLS local. `ignoreHTTPSErrors` já está ligado no config.

## Variáveis (sem segredos versionados)

| Variável | Função |
|---|---|
| `E2E_BASE_URL` | origem do SSR (padrão `http://127.0.0.1:4173`); fora de localhost aborta |
| `E2E_STACK=teste` | declara stack de teste provisionado (obrigatória p/ testes com backend) |
| `E2E_WEB_SERVER=1` | sobe `npm run preview` automaticamente |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_SENHA` | conta ADMIN de teste (fluxos autenticados) |
| `E2E_CORRETOR_EMAIL` / `E2E_CORRETOR_SENHA` | conta CORRETOR de teste (papéis; opcional) |
| `E2E_DOMINIOS_PERMITIDOS` | allowlist explícita (ex.: `homolog.exemplo.test`) para alvo remoto de homologação; sem o domínio listado, somente localhost roda — produção nunca deve ser listada |

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

- Tudo sintético com prefixo `e2e-<execução>`; limpeza completa via API após
  cada teste (contrato → comissão → imóvel → partes → cliente, soft-delete
  FK-safe), com o status de cada exclusão verificado — falha na limpeza falha
  o teste em vez de deixar sujeira silenciosa.
- Trava programática: `E2E_BASE_URL` fora de localhost/127.0.0.1 aborta antes
  de qualquer chamada (sem skip silencioso). Sem migrations, deploys ou
  escrita em produção pelos testes.
- HTTPS local com cert autoassinado: o navegador usa `ignoreHTTPSErrors` e o
  fetch Node dos helpers libera TLS só neste processo de teste
  (`NODE_TLS_REJECT_UNAUTHORIZED=0` em `helpers/env.ts`, nunca no app).
- R2 usa o bucket de homologação; Drive usa falha explícita (`FALHOU`) sem
  credenciais — a criação real no Drive compartilhado é homologação externa
  separada, não declarada aqui como validada.
