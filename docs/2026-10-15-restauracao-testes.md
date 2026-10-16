# Restaurar testes permanentes do frontend

Plano aprovado pelo dono em 15/10/2026. Implementação local na main, sem commit/push/deploy.

## Objetivo e base

- Atualizar a main e preservar relatório e histórico documental. Base sincronizada: `0dedf02`; a versão inspecionada no planejamento era `bac1c00`.
- Restaurar os auxiliares/dependências de teste removidos pelo remoto, mantendo as mudanças atuais de produto.
- Rede de segurança permanente com Vitest e Playwright; sem acesso a API, banco ou integradores reais.

## Infraestrutura

- Fixtures isoladas por teste, método/rota/payload estritos, visitante/login/logout e ADMIN/CORRETOR.
- API simulada em 127.0.0.1:4199 e SSR em 127.0.0.1:4180; build com VITE_API_URL=/api, API_ORIGIN local e SEO_INDEXABLE=false.
- Separar inicialização do servidor das asserções do smoke. Portas ocupadas falham; tráfego externo e chamadas inesperadas falham.
- Comandos visual, visual:sem-build e atualização explícita de referências. Validação normal não cria/regrava referências.

## Cobertura

- HTTP: renovação concorrente única, retry único, falhas, respostas antigas após troca de sessão e invalidação do cache apenas após escrita bem-sucedida.
- Cache/API: TTL de 2/10 minutos, promessas compartilhadas, falhas recuperáveis, limite de 40 entradas, concorrência, bootstrap e separação público/admin.
- Validação: complementar os testes existentes de CPF/CNPJ e normalização.
- Embeds: formatos autorizados de YouTube/Vimeo e entradas maliciosas/inválidas.
- SEO: robots, canonical, filtros, paginação, ausência de domínio e escape HTML/JSON-LD.
- Filtros automáticos: 350 ms, seleção imediata, deduplicação, validação, sincronização externa e cancelamento.
- Playwright: catálogo/detalhe/entrada/listas/ficha/Perfil; filtro/paginação/voltar, login/destino, Esc/diálogo alterado, erro de gravação, menu mobile, Ctrl+K e permissões de interface.
- Layout: overflow, foco, alvos 44px, ações na mesma linha no desktop e à direita no mobile, grades alinhadas.
- Cache no browser: hidratação sem consulta, filtro novo com uma chamada, retorno sem chamada, cards preservados durante busca e retry após erro.

## Referências e CI

- Sete projetos de largura/tema: claro 1440/1024/768/390/320 e escuro 1440/390; 320 somente público.
- 32 referências de viewport: catálogo, detalhe público, entrada, Visão geral, Imóveis, Contatos, ficha do imóvel e Perfil × claro/escuro × 1440/390.
- Chromium do Playwright 1.60, Node 24, locale pt-BR, fuso America/Cuiaba, dados/datas/escala fixos e animações desativadas nas capturas.
- GitHub Actions windows-2025: PR, push main e manual; instalação pelo lockfile, tipos/lint/unitários, build único, smoke e visual:sem-build. Relatório/diffs/traces por 14 dias.

## Aceitação

- Testes existentes e novos passam, com specs reais descobertos pelo Playwright.
- Duas execuções visuais seguidas passam sem atualizar referências; controle negativo temporário comprova a detecção.
- Nenhuma requisição inesperada ou erro JavaScript sem explicação.
- Atualizar contexto, decisões, tarefas, README, índice, changelog e auditoria sem apagar histórico. Evidência simulada não equivale a homologação real.

## Andamento

- [x] Sincronizar main e preservar documentação.
- [x] Implementar unitários HTTP/cache/API.
- [x] Implementar unitários validação/embeds/SEO/filtros.
- [x] Restaurar Playwright, mocks, scripts e referências.
- [x] Configurar CI e documentar uso.
- [x] Revisar e executar validação final/controle negativo.

## Retomada em 16/10/2026

O código do parceiro avançou para `0513cc9` durante a pausa: seletor único, cadastro de cidades, publicação dos
imóveis e SEO por situação. Essas mudanças foram preservadas. As fixtures e os testes passam a acompanhar quatro
categorias de classificação, o foco por borda e os contratos atuais. A suíte de SEO nova do parceiro foi mantida;
a cobertura anterior foi recuperada em `metadata-regressao.test.ts`, sem sobrescrever testes existentes.

Verificação intermediária da retomada: **214 testes unitários em 13 arquivos**, lint, build visual e smoke SSR
aprovados. Discovery visual atual: 185 casos em quatro specs; execução completa e referências ainda em validação.

## Resultado final em 16/10/2026

Implementação e aceitação local concluídas na main sobre `0513cc9`. O relatório original, os documentos
históricos e as mudanças do parceiro foram preservados. Nenhum commit, push ou deploy foi feito.

| Verificação executada | Resultado |
|---|---|
| `npm test` | 214/214 em 13 arquivos |
| `npm run typecheck` e `npm run lint` | aprovados |
| `npm run visual:build` | aprovado; build isolado identificado por marca e hashes |
| `node scripts/seo-smoke.mjs` no build final | aprovado: SSR, metadados, paginação, 404, discovery, proxy/cookies, função Vercel e recuperação 503 |
| `npm run visual:sem-build`, primeira matriz | 185/185 em 1,6 min |
| `npm run visual:sem-build`, segunda matriz | 185/185 em 1,7 min, sem atualizar referências |
| Referências | 32 PNGs, oito telas × claro/escuro × 1440/390; inspeção visual e hashes preservados |
| Controle negativo CSS | saída 1; 7.782 pixels diferentes ao ocultar o h1, acima do limite de 100 |
| Controle negativo SSR | saída 1 no teardown por GET desconhecido e POST não autorizado, mesmo com caso consumidor aprovado |
| Revisão independente e diff | sem bloqueantes; `git diff --check` limpo |

Quatro defeitos reproduzidos receberam correções pequenas: carga pendente continua deduplicada mesmo após o
tempo de validade do resultado; renovação 5xx oculta mensagens internas; login respeita o destino protegido por
um único redirecionamento; Mais filtros muda a borda ao receber foco por teclado. Os testes não foram relaxados
para aceitar esses defeitos. Cidades e seletor único acompanham o contrato recebido do parceiro.

Os quatro specs permanentes estão em `tests/visual/`; imagens em `tests/visual/referencias/`; configuração em
`playwright.visual.config.ts`. O workflow `.github/workflows/testes.yml` está configurado para Windows 2025 e
Node 24 com Chromium do Playwright 1.60. CI remoto não foi executado, pois esta entrega permanece local.

Evidências locais ignoradas pelo Git: `artifacts/restauracao-testes-2026-10-15/` contém `unitarios-16.log`,
`build-foco-16.log`, `smoke-final-16.log`, `visual-completa-1.log`, `visual-completa-2.log`, `negativo-css.log`,
`negativo-ssr.log`, manifesto de hashes, folhas de inspeção e `review-integracao.md`. Os controles temporários
foram retirados da suíte ativa e preservados apenas nesse diretório. O negativo SSR teve uma ocorrência nativa
`UV_HANDLE_CLOSING` no encerramento; as matrizes normais passaram sem essa ocorrência, e a prova de reprovação
é o AssertionError explícito do teardown.

Limites: dados sintéticos e rede isolada comprovam o comportamento do front, sem homologar autorização do
backend, API/banco publicados, uploads R2, ACLs do Drive, Safari/iOS ou celular físico. O aceite visual do dono
e as publicações/migrações do parceiro continuam pendentes nas tarefas próprias. Os demais achados da auditoria
(headers, dependências e majors, entre outros) permanecem fora do escopo aprovado de restauração.

## Publicação autorizada em 16/10/2026

Após a entrega local, o dono autorizou commit e push do frontend e acompanhamento do GitHub Actions. A etapa
local acima permanece como histórico; a publicação agora faz parte do escopo. Revalidar o pacote, incluir os
quatro specs e 32 referências no Git, acompanhar o workflow do commit e registrar o resultado remoto.
Nenhum deploy manual, migration ou dado real está incluído nessa autorização.
