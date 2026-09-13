# Decisões técnicas — corretor-web

Cada decisão registra a data, o motivo e o que **não** fazer. Antes de contrariar uma decisão, revise-a aqui
e registre a mudança com a nova data.

## 2026-09-11 — Front com SSR próprio, em vez de SPA pura

Decisão (implementada em `d4f6b2f`): as páginas públicas passam a ser renderizadas no servidor por um runtime
próprio em `src/seo/server.tsx` e `scripts/*.mjs`, com hidratação no cliente. O mesmo runtime responde
`robots.txt`, `sitemap.xml` e `llms.txt`, e faz proxy de `/api` para a API.

Motivo: catálogo e detalhe de imóvel precisam de HTML pronto, metadados e JSON-LD para indexação e para os
previews de link. Uma SPA entregaria página vazia ao rastreador.

Não fazer:

- Não acessar `window`, `document` ou `sessionStorage` durante a renderização de rota pública.
- Não voltar ao proxy do Vite: o `vite.config.ts` não tem mais `server.proxy`; quem faz o proxy é o runtime.
- Não indexar o painel: `/admin/*` fica fora do SSR e permanece `noindex`.

## 2026-09-11 — `/api` como caminho relativo, não domínio da API

Decisão: `VITE_API_URL=/api`. O navegador chama sempre o próprio domínio do front, e o servidor repassa para
`API_ORIGIN`, removendo o prefixo `/api`.

Motivo: mantém o cookie de refresh no domínio do front e evita configuração de CORS com credenciais entre domínios.

Não fazer:

- Não apontar `VITE_API_URL` direto para o domínio da API sem revisar cookie, CORS e `ALLOWED_ORIGINS` na API.
- Não colocar segredo em variável `VITE_*`: elas vão para o bundle do navegador.

## 2026-09-11 — Indexação desligada por padrão

Decisão: `SEO_INDEXABLE=false` até a publicação. Para liberar `index,follow`, o runtime exige `SITE_URL` e
`API_ORIGIN` em HTTPS, `NODE_ENV=production` e execução fora de preview.

Motivo: evita indexar ambiente de desenvolvimento, preview e modo demonstração.

Não fazer:

- Não ligar a indexação antes de ter domínio definitivo e API publicada em HTTPS.
- Não remover a checagem de preview: ela evita conteúdo duplicado.

## 2026-09-11 — `SITE_URL` é obrigatória para canonical e JSON-LD

Decisão: manter `SITE_URL` preenchida também em desenvolvimento (`http://127.0.0.1:5173`).

Motivo: descoberto na homologação. Sem `SITE_URL`, `buildSeo` não gera canonical nem o grafo JSON-LD,
e a página sai sem dados estruturados, sem erro visível.

Não fazer:

- Não deixar `SITE_URL` vazia ao testar SEO e supor que o recurso está quebrado.
- Não usar URL com caminho, usuário, senha ou query: o runtime aceita apenas esquema e host e lança erro caso contrário.

## 2026-09-11 — Sessão em memória, com refresh por cookie

Decisão (herdada e confirmada): o access token vive apenas em memória; a renovação usa o cookie `httpOnly`
enviado pela API, com uma única promessa de refresh compartilhada entre requisições simultâneas.

Motivo: evita token em `localStorage` e evita disparar renovações concorrentes.

Não fazer:

- Não gravar token em `localStorage`, `sessionStorage` ou cookie pelo front.
- Não criar um segundo caminho de renovação.

## 2026-09-12 — Modo demonstração removido do produto

Decisão: o modo demonstração foi **removido por inteiro**, a pedido do dono do projeto. Saíram `src/services/demo.ts`
(11 imóveis, 2 corretores e 4 leads fictícios), `src/services/demo.test.ts`, `.env.demo`, a variável `VITE_DEMO_MODE`,
os scripts `dev:demo`, `build:demo` e `preview:demo`, o campo `demo` de `SeoConfig`, o proxy de `api.ts`, os botões de
entrada fictícia no login, a faixa de aviso no site público, o sufixo "Demonstração" no painel e o comportamento
alternativo do formulário de contato. O front agora só fala com a API real.

Motivo: o produto vai ao ar com dados reais, e o dono não quer dado fictício no código. O `api.ts` ficou mais simples:
`export const api = realApi`, sem Proxy nem import dinâmico.

Substitui a decisão de 11/09/2026 ("Modo demonstração só por configuração explícita"), que fica revogada.

Não fazer:

- Não reintroduzir dados fictícios no código do produto. Dado de exemplo só em teste (`src/seo/fixture.ts` é o lugar).
- Não usar fallback de dados locais em falha de rede: a página de indisponibilidade é o comportamento correto.
- Se a demonstração voltar a ser necessária, discutir antes: ela deve ser um ambiente com banco próprio, não um
  ramo de código dentro do produto.

## 2026-09-12 — Identidade do site centralizada em `src/config/brand.ts`

Decisão: nome, logotipo, tagline, frase de rodapé, região de atuação e dados de privacidade vivem só em
`src/config/brand.ts`. Os 13 pontos que repetiam "Corretor Comercial" e "Mato Grosso" (títulos, descrições,
`og:site_name`, JSON-LD `Organization`/`WebSite`, `llms.txt`, logotipo do cabeçalho e hero do catálogo)
passaram a ler desse arquivo.

Motivo: a marca atual é um rótulo genérico de andaime. Trocar pelo nome real do negócio precisa ser uma
edição em um arquivo, não uma caçada por strings.

Não fazer:

- Não escrever nome de marca, região ou tagline direto em componente, título ou JSON-LD.
- Não preencher `brand.privacy` com dado inventado: enquanto `controller`, `contactEmail` e `address` estiverem
  vazios, a página `/privacidade` exibe o aviso de conteúdo preparatório, que é o comportamento correto.

## 2026-09-13 — Marca real Lucas Gobatto, só no front

Decisão: identidade `Lucas Gobatto — Corretor de imóveis — CRECI 15776`, região `Juara, Mato Grosso`,
paleta azul-marinho `#0A2042` + dourado `#C99B3F` + branco. `brand.ts` é a fonte única; `--green` foi
mantido como apelido do navy para não reescrever todos os módulos. JSON-LD usa `RealEstateAgent` com
`identifier: CRECI 15776`. O logotipo atual é um SVG inline aproximado; o PNG/SVG oficial com fundo
transparente enviado pelo dono entra em `public/assets/` quando chegar. Dashboard estilo Imobia é só
referência futura; Si9/Imonov seguem fora do escopo.

Motivo: o rótulo de andaime "Corretor Comercial / Mato Grosso" conflita com a marca enviada pelo dono
e o verde/creme atual não pertence a ela. A troca é exclusivamente visual no front.

Não fazer:

- Não mudar nada no back por causa do rebrand: sem migration, rota, DTO ou integração.
- Não usar dourado em texto corrido sobre branco (falha de contraste): dourado só em filetes, marcas e focos.
- Não reintroduzir "Corretor Comercial" ou `Organization` genérica no SEO.

## 2026-09-11 — Uma única branch: `main`

Decisão: o trabalho acontece direto na `main`, nos dois repositórios. No `corretor-api`, a branch `shura` foi
apagada por já estar contida na `main`. Este repositório sempre teve apenas a `main`.

Motivo: escolha do dono do projeto.

Não fazer:

- Não recriar branches paralelas sem combinar antes.
- Não commitar sem rodar `npm test`, `npm run lint` e `npm run typecheck`.
- Não commitar `.env` nem artefato de build.

## 2026-09-11 — Camada de contexto compartilhado entre agentes

Decisão: o repositório mantém `AGENTS.md`, `CLAUDE.md`, `PROJECT_STATUS.md`, `DECISIONS.md`, `TASKS.md`,
`CHANGELOG_AI.md` e `docs/handoffs/`, com o mesmo protocolo do repositório irmão.

Motivo: Codex e Claude não compartilham contexto entre sessões; o que precisa sobreviver fica versionado no Git.

Não fazer:

- Não trabalhar sem ler os arquivos de contexto.
- Não encerrar uma tarefa sem atualizar `PROJECT_STATUS.md` e `CHANGELOG_AI.md`.
- Não registrar segredo, token ou dado pessoal nesses arquivos.

## 2026-09-12 — Primeira entrega de administração de locações (Codex)

Escopo aprovado: cadastros PF/PJ de proprietários e inquilinos, dados bancários do proprietário, contratos e documentos privados. Acesso exclusivamente ADMIN, inclusive downloads. Um proprietário, um inquilino e um imóvel por contrato; início manual, sem importação e sem integração SI9/Imonov nesta etapa. Comissão aguarda definição do dono; não presumir a base nem implementar financeiro nesta entrega.

Padrões: NestJS/TypeORM e React/RHF/zod existentes, nenhuma dependência nova. Contatos, CPF/CNPJ, dados bancários e observações da ficha são cifrados com AES-256-GCM; notas do contrato também. Usa-se chave derivada com domínio próprio da LEADS_ENCRYPTION_KEY existente. Nomes permanecem pesquisáveis. Não trocar a chave sem procedimento de recifragem e backup: isso torna os campos anteriores ilegíveis.

Documentos: bucket privado separado, R2_DOCUMENTS_BUCKET opcional no boot. A variável deve apontar para bucket sem r2.dev, domínio público ou acesso anônimo, distinto de corretor-midia. O token S3 deve ter permissão nesse bucket. Sem variável, upload/download/exclusão falham com 503, sem fallback. Listagem de metadados continua disponível. Não colocar documentos de clientes no bucket público de mídia. PDF/JPEG/PNG, assinatura e limite de 10 MiB, download autenticado como attachment com no-store e nosniff. Upload compensado quando a gravação de metadados falha; monitorar e limpar órfãos caso a compensação também falhe.

Contratos: valores decimais exatos, datas civis, um ACTIVE por imóvel protegido por índice único e transação. Partes precisam ser do tipo correto e ativas para contratos não encerrados. Desativar pessoa com contrato ativo retorna 409. Encerrar contrato antigo continua permitido após mudança do imóvel para venda. Vencimentos 29–31 ficam apenas registrados; ajuste do calendário pertence à futura cobrança. Não excluir contratos nem apagar pessoas vinculadas; exclusão de imóvel vinculado é impedida por FK.

## 2026-09-12 — Comissão de captação equivalente a um aluguel (regra provisória)

O relato do dono indica que, ao fechar uma locação, o corretor recebe uma comissão equivalente a um aluguel, muitas vezes parcelada para o proprietário. A próxima etapa financeira adotará esse modelo configurável: total da comissão = um aluguel do contrato; número e vencimentos das parcelas são explícitos; cada parcela tem status pendente/paga e confirmação manual. O sistema exibirá total, recebido e saldo.

Não confundir essa comissão de captação com o repasse mensal do aluguel ao proprietário. Não presumir percentual, multa, juros, retenções, incidência tributária ou regra legal. A tela e a API devem marcar a regra como configurável e permitir validação/ajuste pelo ADMIN antes do uso operacional.

Operação: migration aditiva 1789257600000; não altera migrations anteriores e não roda automaticamente. Backup e validação do histórico do Neon são pré-requisitos de aplicação. Nenhum .env encontrado nos dois checkouts desta sessão; não foram reconstruídas credenciais nem escritos dados no Neon/R2. A migration de hardening preexistente 1789084805000 continua fora do data-source como estava: revisar seu histórico separadamente antes de aplicá-la, sem presumir que foi executada.

Correção de compatibilidade: mensagens do filtro global da API agora seguem string/lista em message, como esperado pelo front. Busca parcial por título foi adicionada somente ao DTO do catálogo administrativo para seleção de imóveis; contrato público/SSR preservado.

## 2026-09-13 — Atualizar o projeto Vercel de teste existente
Decisão: atender ao pedido de deploy publicando os arquivos locais no corretor-web-test via CLI com build remoto, preservando as variáveis e indexação bloqueada do ambiente. Motivo: o front e a API de teste já estão disponíveis; os registros antigos de ausência de deploy estão superados para teste. Não confundir target production da Vercel com autorização de lançamento comercial definitivo; não ligar indexação nem criar outro projeto. Sem commit/push nesta tarefa.


## 2026-09-13 — URLs públicas e indexação (Codex)
Plano aprovado: finalidades para-alugar/para-comprar e tipos salas/lojas/galpoes/predios/terrenos em /imoveis; cidade, preco-minimo, preco-maximo e pagina na query. Slugs estáveis e endpoints da API preservados. Aliases administrativos login -> entrar e leads -> contatos, com 301 no SSR e replace no cliente. Filtros continuam noindex,follow. Dono autorizou SITE_URL=https://corretor-web-test.vercel.app e SEO_INDEXABLE=true em Production da Vercel; API_ORIGIN existente deve ser HTTPS; previews bloqueados. Não alterar banco, storage ou permissões.
