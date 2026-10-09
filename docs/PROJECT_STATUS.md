# Estado atual — corretor-web

## Estado atual (09/10/2026)

**Git:** `main` sincronizada com `origin/main` em `aa4de75`. API irmã em `6b987a5`.

**Serviços (último registro datado):**
- Front: Vercel de teste, `corretor-web-test.vercel.app`, desde 13/09. O commit implantado hoje não está registrado.
- API: Render de teste (`srv-daj21e15efls73fab4gg`), deploy de `86ecf29` em 08/10. Esse commit já inclui a sessão
  de 4h. O pacote de 09/10 (`6b987a5` e `aa4de75`) ainda não tem deploy registrado.
- Neon e R2 ativos. A URL pública do R2 respondeu 401 em 03/10; as fotos do catálogo vêm da Unsplash.
- Domínio comercial: não existe.

**Pronto no código:**
- Catálogo público com SSR, filtros por URL (inclusive vários tipos), detalhe, contato com consentimento, `/privacidade`,
  `/devs`, 404 com volta automática e 503 com recuperação automática.
- Painel com Visão geral, Imóveis, Contatos (abas), Pessoas, Corretores, Cadastros, Contratos, Comissões e Perfil
  (foto por upload). Fichas em telas próprias, `CampoNumero`, `CampoCreci`, guarda de modal, Esc, Ctrl/⌘+K e
  acabamento comum (`BlocosPainel`).
- Sessão: a API expira após 4h sem uso (JWT de 15 min, cookie de sessão do navegador, sem rotação). O front guarda o
  token só em memória e faz uma renovação compartilhada por vez. Pronta e validada em 06/10.
- Tema claro azul-acinzentado e tema escuro, só por tokens de `tailwind.css`.
- 09/10 (código no `40f635b`, enviado à `origin/main` pelo dono; sem deploy registrado): edição completa de comissão com versão, arquivar/reativar e histórico do plano;
  Cadastros em `/admin/cadastros/:categoria` com índices de reajuste e tipos de contrato; contrato com tipo e índice;
  slogan padrão no h1, rodapé e título. Depende da API com a migration de 09/10 (DEPLOY-20261009).

**Verificações:** `typecheck`, `lint`, `build` e `npm test` (3 arquivos, 23 testes) passam.
`node scripts/seo-smoke.mjs` passa desde a correção local de 09/10 (SMOKE-001); antes falhava desde 06/10.
`npm run visual` não tem specs. QA de navegador de 09/10: 37/37 com a API completa em PostgreSQL descartável.

**Falta homologar:** perfil real (login + R2 + Neon), Safari/iOS e celular físico, cold start publicado (A11),
ACLs do Drive (H01), A09 e A10 com dados reais.

**Bloqueios reais:** nenhum técnico. Publicar o pacote de 09/10 e escolher domínio e plano comercial dependem do dono.

**Em andamento:** nenhuma tarefa de código assumida. Documentação reescrita para o estado atual em 09/10 (Claude).

## Histórico resumido

| Data | Marco |
|---|---|
| 11/09 | Sincronização com o SSR próprio (`d4f6b2f`) e homologação com API, Neon e R2 reais |
| 12/09 | Modo demonstração removido; marca centralizada em `brand.ts`; primeira entrega de locações (depois substituída) |
| 13/09 | Marca Lucas Gobatto, Tailwind 4, mobile, tema escuro, perfil, URLs em português; projeto Vercel de teste publicado |
| 14/09 | Front integrado ao modelo em português da API; contraste dos temas; E2E com Playwright (removido em 03/10) |
| 15/09 | `/devs`, header fixo, hidratação do tema, CSS no HTML, headers de segurança, trava de `API_ORIGIN` local |
| 16/09 | Contrato v2: ids inteiros, cadastro único de pessoas, ficha do imóvel; pacote de melhorias público e painel |
| 17/09 | Escape contextual no JSON-LD |
| 18/09 | Build sempre em produção, `Dialogo` centralizado, grades por container, paleta mais confortável, logo por tema |
| 02/10 | Auditoria full stack A01–A11; easter eggs do `/devs` e 404 |
| 03/10 | Correções da auditoria; suítes de teste removidas; 503 com cena e recuperação; carga de 12 imóveis no Neon |
| 04/10 | Suíte mínima recriada (3 arquivos); documentação reunida em `docs/`, plana; `.claude/` removida |
| 05/10 | Refatoração da Área do Corretor (revertida pelo dono em 06/10) |
| 06/10 | Especificação do painel concluída a partir de `a2a9f81`; Contatos em abas, foto por upload, filtros automáticos; sessão de 4h na API (`46f2235`) |
| 08/10 | 404 da foto resolvido com o deploy de `86ecf29` no Render |
| 09/10 | Ficha do imóvel em notas, padronização do painel, ações só com ícone, `BotaoVoltar`, seis pontos (`aa4de75`); documentação atualizada |
