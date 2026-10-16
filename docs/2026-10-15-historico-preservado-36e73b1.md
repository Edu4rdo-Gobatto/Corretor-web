# Histórico documental preservado — 15/10/2026

Conteúdo integral dos documentos locais alterados na sincronização de `36e73b1` para `0dedf02`. Esta cópia é histórica; as orientações atuais estão nos arquivos correspondentes em `docs/`. Preservação autorizada no plano de restauração dos testes.


---

## Arquivo original: 2026-10-02-auditoria-fullstack.md

# Auditoria técnica full stack — 02/10/2026

## Atualização de 03/10/2026 — revisão das correções por Codex

Esta atualização complementa a fotografia original abaixo, preservando seu histórico. Revisão sobre frontend
`8d40cb8` com as alterações locais anteriores e API `85a6301`, seguida de correções locais, sem commit/deploy.
Os dois HEADs foram conferidos contra `origin/main` após fetch: zero commits de diferença.

Foram reproduzidas e corrigidas falhas restantes nas correções:

- **A01:** a exclusão do contrato atual na autorização impedia editar partes legitimamente compartilhadas pelo ADMIN.
  O PATCH preserva as partes persistidas antes da alteração; novas referências alheias continuam proibidas.
- **A02:** o guard antecipado não limitava o buffering. Storage do Multer soma bytes durante a leitura, rejeita
  o chunk excedente com 413 e limpa buffers; duas requisições simultâneas por instância, contando também o envio R2.
  O transporte rejeitado é drenado pelo Multer sem armazenamento adicional, não destruído abruptamente.
  Corrigido também lock pessimista fora de transação na autorização anterior ao R2; o lock continua na gravação.
- **A04:** restauração pendente podia ressuscitar uma sessão expirada ou sobrescrever login recente.
  Provedor ignora resultados invalidados; restauração e HTTP compartilham refresh; geração impede token antigo
  de sobrescrever o token de um login posterior.
- **A09:** a ficha administrativa expunha vínculos removidos e podia reativá-los. Agora expõe apenas associações
  ativas, inclusive quando a classificação global está inativa. PATCH omite coleção inalterada e envia remoção
  explícita. Classificação inativa só é aceita se a associação ainda estiver ativa antes da gravação.
- **A10:** pesquisar com +55 não encontrava legado sem prefixo. A busca telefônica remove esse prefixo quando
  corresponde ao tamanho nacional completo; o parâmetro de CPF/CNPJ conserva todos os dígitos.

| Item | Resultado da revisão | Evidência / limite |
|---|---|---|
| A01 | Corrigido e validado por HTTP local | Dois corretores e ADMIN; POST/PATCH alheios 403, leitura não se amplia; compartilhamento ADMIN preservado. Banco e autenticação simulados, serviços e DTOs reais. |
| A02 | Corrigido e validado por HTTP local | Multipart chunked, limite agregado reduzido, concorrência, rejeição antes do serviço e autorização antes do storage; 20 arquivos aceitos/21 recusados. Sem R2 real/carga. |
| A03 | Correção anterior mantida e revalidada | Duas sessões do alvo deixam de ser consumíveis após reset; outra conta permanece válida; serviços de senha e sessão reais com persistência sintética. PostgreSQL real não exercitado. |
| A04 | Corrigido e revalidado | Remonte, expiração, respostas fora de ordem, uma renovação para restauração/401 e preservação do token novo. |
| A05 | Correção anterior mantida | Carga inicial oculta entradas antes do reset; suíte de formulário aprovada. |
| A06 | Correção anterior mantida | Validador único no frontend corresponde à API; testes de telefone e formulário aprovados. |
| A07 | Correções locais anteriores mantidas | Filtros remontam colunas na página 1; CSV bloqueado em carga/falha; respostas obsoletas ignoradas. |
| A08 | Correções locais anteriores mantidas | Busca por ID, sequência, limpeza e falha testadas; registro bloqueado durante resolução. |
| A09 | Código corrigido; homologação PostgreSQL pendente | Round-trip sintético desativar classificação → editar título → reativar preserva valor; remoção não reaparece. Teste HTTP do cliente distingue coleção omitida, removida e editada. |
| A10 | Código corrigido; SQL com legado real pendente | Normalização de coluna/termo e +55 conferidas; testes não executam PostgreSQL. |
| A11 | Validação local ampliada; ambiente implantado pendente | API lenta simulada gera 503/noindex/no-store/Retry-After; nova tentativa recupera catálogo/detalhe; teto total encerra paginação. Timings reduzidos apenas no teste. |
| H01 | Pendente; hipótese de infraestrutura | Sem inspeção das ACLs reais do Drive e sem mudança de permissões. |

**Resultado:** o bloqueio funcional A01 foi tratado e verificado em HTTP sintético. Isso não homologou produção.
A09/A10/A11/H01 continuam com caixas abertas por dependerem de validação integrada ou operacional.
Em um bootstrap SSR 503, `AppRoutes` mostra `PaginaErro`: **Tentar novamente recarrega a página**.
`useRecurso` só atua nas páginas públicas efetivamente montadas; não recupera automaticamente aquele bootstrap.

Validação desta revisão: frontend typecheck/lint, 43 arquivos/231 testes e build aprovados; API typecheck/lint,
27 suítes/188 testes e build aprovados, com 1 suíte/4 testes PostgreSQL não executados. Smoke do build aprovado
(SSR, metadados, paginação, descoberta, 404, proxy/cookies e função Vercel local). Navegador local: catálogo,
detalhe e 404 conferidos, sem avisos/erros de console no catálogo/detalhe. `robots.txt` e `sitemap.xml` conferidos
por HTTP; a fixture é noindex e gera sitemap vazio. Sitemap indexável/paginado coberto em `server.test.ts`.
Não houve migration, banco real, upload R2/Drive, alteração de ACL, commit, push ou deploy.

Escopo: `Corretor-web` e o repositório irmão `Corretor-API`. A auditoria original examinou frontend `94ebcef` e API `e3b0a32`. Antes da publicação deste relatório, chegaram ao remoto `0a8b84e` no frontend e `f585fed`/`f9a1fcb` na API; o código atual incorpora esses commits. O relatório mantém os achados como fotografia das revisões auditadas e registra abaixo as mudanças sincronizadas. Não representa homologação do ambiente publicado.

## A. Veredito executivo

**Decisão: bloquear publicação até corrigir A01.** Um corretor autenticado consegue criar um contrato que amplia sua própria permissão de leitura sobre pessoas atribuídas a outros corretores. A resposta de pessoa inclui CPF/CNPJ, endereço e dados bancários.

Também foram encontrados problemas de disponibilidade no recebimento de mídia, revogação de sessões, preservação de dados em formulários e divergências entre frontend e API. Os testes existentes passaram, mas não cobrem todos esses caminhos.

## B. Mapa do projeto e cobertura

O frontend usa React 18, TypeScript estrito, Vite 7, React Router, Tailwind, react-hook-form e zod. As páginas públicas são renderizadas por SSR próprio; o painel é carregado no navegador.

A API usa NestJS, TypeORM, PostgreSQL, JWT e Argon2. Mídia é armazenada no Cloudflare R2; pastas de documentos de contratos são criadas no Google Drive.

| Fluxo | Caminho analisado |
|---|---|
| Catálogo e detalhe | URL → SSR → consultas de classificações e imóveis → HTML, metadados e hidratação |
| Sessão | Login → access token em memória → cookie de refresh → renovação rotativa |
| Contato público | Formulário → abertura do WhatsApp → `POST /pessoas` → consentimento e responsável |
| Painel | Formulários → serviços HTTP → DTOs → autorização → transações |
| Mídia | Compressão no navegador → multipart → buffers da API → validação → R2 |
| Contrato e receita | Pessoas e imóvel → contrato → Drive; comissão → parcelas → confirmação de pagamento |

A leitura cobriu as implementações dos módulos de autenticação, corretores, pessoas, imóveis, classificações, locações, comissões, mídia e Drive; serviços e hooks do frontend; principais páginas e componentes públicos e administrativos; SSR, proxy e configurações de build/deploy. Testes e migrations foram examinados seletivamente.

Ficaram fora da cobertura: infraestrutura implantada, banco real, ACLs efetivas do Drive, objetos R2, segredos, testes de carga, navegador autenticado, conferência visual de acessibilidade/responsividade, cadeia integral de migrations e análise completa de avisos de segurança de dependências. Não afirmo cobertura integral de todos os arquivos nem garantia de segurança.

## Atualização — commits sincronizados antes da publicação

A revisão `0a8b84e` alterou a sessão, o formulário de imóvel e a edição de características. A04 e A05 têm correções aparentes acompanhadas de testes no commit; A09 passou a exibir e preservar classificações/características inativas na edição. Marquei esses itens como correções presentes no remoto, mas os testes desse commit não foram executados nesta tarefa documental. A07 e A08 não foram corrigidos por `0a8b84e`; seguem abertos.

A revisão `f585fed` da API corrige a criação de imóveis duplicados por dependência de `nextval` e slug antes do insert. Isso não altera os achados A01–A03, A09 ou A10. A revisão `f9a1fcb` é documental.

| Achado | Estado na ponta sincronizada | Evidência |
|---|---|---|
| A04 | Correção presente; não revalidada nesta tarefa | `0a8b84e`, `useSessao.tsx` e `useSessao.test.tsx` |
| A05 | Correção presente; não revalidada nesta tarefa | `0a8b84e`, `FormularioImovel.tsx` |
| A09 | Correção parcial/aparente; requer validar round-trip de vínculos | `0a8b84e`, `esquemaImovel.ts` e `FormularioImovel.tsx` |
| A07, A08 | Seguem abertos após inspeção do diff sincronizado | arquivos respectivos sem correção funcional do achado |
| API: id/slug de imóvel | Correção presente; fora dos achados originais | `f585fed`, `imoveis.service.ts` |

## C. Achados priorizados

| ID | Problema | Área | Severidade | Certeza | Local principal | Esforço |
|---|---|---|---|---|---|---|
| A01 | Contrato permite fabricar acesso a pessoas de outros responsáveis | Backend | **Alta** | Confirmado; reprodução em memória | `Corretor-API/src/locacoes/locacoes.service.ts:85` | Médio |
| A02 | Upload pode acumular memória antes do limite agregado | Backend | Média | Buffering confirmado; queda não testada | `Corretor-API/src/midias/midias.controller.ts:17` | Médio |
| A03 | Reset administrativo não revoga refresh tokens existentes | Backend | Média | Confirmado | `Corretor-API/src/corretores/corretores.service.ts:48` | Pequeno a médio |
| A04 | Remontar o painel reaplica um resultado antigo de sessão | Frontend | Média | Confirmado e reproduzido | `Corretor-web/src/hooks/useSessao.tsx:21` | Médio |
| A05 | Carregamento inicial pode apagar o preenchimento de um imóvel novo | Frontend | Média | Confirmado pelo fluxo | `Corretor-web/src/paginas/painel/FormularioImovel.tsx:70` | Pequeno |
| A06 | Telefone aceito no formulário é rejeitado pela API | Integração | Média | Confirmado e reproduzido | `Corretor-web/src/servicos/contato.ts:6` | Pequeno |
| A07 | Filtros deixam a paginação e o CSV fora de sincronia | Frontend | Média | Confirmado pelo fluxo | `Corretor-web/src/paginas/painel/Contatos.tsx:41` | Pequeno a médio |
| A08 | Resposta antiga pode trocar o imóvel de uma comissão | Frontend | Média | Confirmado pelo fluxo | `Corretor-web/src/paginas/painel/Comissoes.tsx:33` | Pequeno a médio |
| A09 | Editar outro campo pode desativar uma característica oculta | Integração | Média | Confirmado pelo fluxo | `Corretor-API/src/imoveis/imoveis.service.ts:179` | Médio |
| A10 | Busca telefones formatados com padrão diferente do armazenamento | Backend | Média | Confirmado pelo código | `Corretor-API/src/pessoas/pessoas.service.ts:65` | Pequeno a médio |
| A11 | Timeout SSR curto pode responder 503 enquanto a API inicia | Integração/infra | Média | Condicional; estado implantado não verificado | `Corretor-web/src/seo/server.tsx:41` | Médio |
| H01 | Isolamento direto das pastas no Drive depende de ACLs não verificadas | Infraestrutura | Média potencial | Hipótese a validar | `Corretor-API/src/drive/drive-cliente.ts:96` | Médio a grande |

### A01 — O contrato permite fabricar acesso a pessoas de outros responsáveis

**Problema e evidência:** a criação confere se o intermediador é o próprio corretor, mas busca locador e locatário por ID sem verificar se já estão autorizados ao usuário (`locacoes.service.ts:73–82, 85–90`). A visibilidade de pessoas passa a incluir qualquer cadastro citado num contrato do corretor (`pessoas.service.ts:13, 99–102`), inclusive contrato inativo ou desativado. A resposta de pessoa inclui CPF/CNPJ, endereço, agência, conta, PIX e observações (`pessoa.entity.ts:44–53`).

**Condição e impacto:** um CORRETOR autenticado, com imóvel válido e IDs de outras pessoas, cria ou altera um contrato próprio com essas referências. Depois consegue ler essas pessoas pela API. A UI limita o seletor, mas chamadas diretas não estão limitadas pela mesma regra. A escrita das pessoas continua restrita ao responsável ou ADMIN.

**Validação:** serviço real executado em memória com repositórios e Drive simulados aceitou um contrato próprio `INATIVO` com duas pessoas atribuídas a outros responsáveis. A cadeia que libera a leitura foi confirmada no código; não foi executado SQL nem requisição real.

**Correção preferida:** autorizar as referências independentemente do contrato que o usuário está criando. ADMIN pode atribuir pessoas entre responsáveis; CORRETOR só deve poder usar referências previamente autorizadas. Preserve o acesso ao histórico legitimamente compartilhado.

**Critério de conclusão:** testes HTTP com dois corretores rejeitam referências alheias no POST e PATCH e não ampliam a listagem de pessoas; atribuições permitidas ao ADMIN continuam funcionando. **Esforço médio**, pois envolve regras de contratos e pessoas.

### A02 — O limite agregado de mídia só é aplicado depois do buffering

**Problema e evidência:** o interceptor aceita 20 arquivos de até 30 MiB (`midias.controller.ts:17`; `validacao-arquivo.ts:5–6`). O total de 60 MiB é conferido em `midias.service.ts:25–26`, depois que os arquivos já chegaram como buffers. A autorização do imóvel é posterior, em `midias.service.ts:31`.

**Condição e impacto:** qualquer corretor autenticado pode enviar uma requisição que acumula até aproximadamente 600 MiB antes da rejeição, inclusive contra imóvel alheio ou inexistente. Esgotamento de memória depende do gateway, da RAM e da concorrência; não provoquei uma queda. O Multer usa armazenamento em memória por padrão quando não se especifica armazenamento/destino; ver [documentação do Multer](https://expressjs.com/en/resources/middleware/multer/).

**Correção preferida:** autorizar o recurso antes da recepção multipart, interromper o stream ao atingir o limite agregado e limitar uploads simultâneos. Conferir somente `Content-Length` não cobre envio chunked.

**Validação:** multipart sintético com limite reduzido deve interromper a leitura ao atingir o agregado e não chamar o R2; teste também upload concorrente e imóvel não autorizado. **Esforço médio.**

### A03 — Reset de senha pelo ADMIN não revoga as sessões

**Problema e evidência:** `corretores.service.ts:48–65` atualiza o hash quando recebe `dto.senha`, sem revogar sessões. A revogação aparece na troca de senha feita pelo próprio usuário (`autenticacao.service.ts:32–35`). A renovação verifica se o corretor segue ativo, mas não se a senha foi redefinida (`autenticacao.service.ts:24–27`).

**Condição e impacto:** alguém que já possui o refresh roubado pode continuar renovando depois do reset administrativo enquanto a conta estiver ativa. Este achado não fornece um caminho para obter o token.

**Contexto de decisão:** uma decisão anterior preservava sessões em resets; o hardening posterior descreve a revogação após troca de senha, mas foi implementado no fluxo próprio. O comportamento é confirmado; a política documental deve ser esclarecida.

**Correção preferida:** centralizar reset e troca com revogação transacional. A invalidação imediata de access tokens curtos é decisão separada.

**Validação:** criar duas sessões do alvo, redefinir a senha como ADMIN e verificar que refreshes antigos falham; refresh de outra conta deve continuar funcionando. **Esforço pequeno a médio.**

### A04 — Remontar o painel pode reaplicar uma falha antiga de sessão

**Problema e evidência:** `useSessao.tsx:14, 21–25` conserva globalmente a promessa inicial de restauração, mesmo se rejeitada. `entrar()` atualiza apenas o estado React (`:30–32`). As rotas públicas e administrativas montam o provedor em lugares separados (`App.tsx:93, 108`).

**Condição e impacto:** a restauração inicial recebe 401, o login funciona, a pessoa visita o site e retorna ao painel. O provedor recém-montado reutiliza a rejeição anterior e define `corretor=null`, exigindo novo login. Uma promessa resolvida também pode reaplicar perfil antigo. A autorização real continua no backend.

**Validação:** hook real, jsdom e API simulada; após login e remonte, o usuário autenticado desapareceu.

**Correção preferida:** invalidar e sincronizar o cache global em login, atualização e expiração. Compartilhe a promessa enquanto a renovação está pendente; não mantenha indefinidamente um resultado resolvido ou rejeitado.

**Critério de conclusão:** navegar painel → site → painel conserva a sessão e o perfil atual. **Esforço médio.**

### A05 — A carga de classificações pode apagar dados de um imóvel novo

**Problema e evidência:** o estado `carregando` começa como `!!id` (`FormularioImovel.tsx:48`), portanto é falso na criação. O formulário pode aparecer antes das classificações; ao recebê-las, `carregar()` executa `reset(...)` (`:70–75`). O rascunho automático também permanece inativo nesse intervalo (`:92–98`).

**Condição e impacto:** resposta lenta de classificações e usuário começa a digitar título ou descrição. A chegada da resposta restaura os valores iniciais e descarta esse preenchimento.

**Correção preferida:** manter a criação em estado de carga até concluir classificações e restaurar o rascunho, antes de permitir entrada.

**Validação:** atrasar de forma controlada a promessa de classificações e comprovar que o formulário não aceita entradas sujeitas a um reset posterior. **Esforço pequeno.** Na edição, a carga inicial já oculta o formulário.

### A06 — O telefone aceito no frontend não corresponde ao contrato da API

**Problema e evidência:** o esquema do frontend aceita oito dígitos (`servicos/contato.ts:6`). A API usa `@TelefoneValido()` no DTO público (`pessoas.dto.ts:13`) e exige número nacional válido com DDD (`comum/validacao.ts:18–22`).

**Validação:** `12345678` passou no esquema real do frontend e falhou na regra real da API; nenhum POST foi feito.

**Condição e impacto:** o formulário abre o WhatsApp antes do POST (`FormularioContato.tsx:39–45`). Um telefone inválido não é registrado e a pessoa recebe apenas uma falha genérica. Abrir o WhatsApp nessa ordem é uma decisão de produto; a diferença entre validadores é o defeito.

**Correção preferida:** espelhar no formulário a regra `telefoneValido` usada pelo domínio da API e mostrar erro de campo antes de abrir o WhatsApp.

**Validação:** número sem DDD, fixo/celular nacional válido, prefixo `+55`, pontuação e internacional incompatível. **Esforço pequeno.**

### A07 — Filtros deixam a paginação e o CSV fora de sincronia

**Problema e evidência:** cada coluna de contatos mantém página própria (`Contatos.tsx:41`); aplicar ou limpar filtros não zera essa página (`:93–107`). `useDadosPainel.ts:12–18` conserva os dados anteriores quando uma consulta falha, e o botão CSV só considera carga e existência de itens (`Contatos.tsx:55`).

**Condição e impacto:** aplicar um filtro estando na página 3 pode exibir uma coluna vazia apesar de resultados na página 1. Se a nova consulta falha, a exportação volta a ficar habilitada e pode gerar CSV com os resultados antigos e a página atual.

**Correção preferida:** reiniciar página ao aplicar/limpar filtros e vincular cada resposta à consulta que a produziu. Desabilitar exportação sem resposta válida para os filtros atuais.

**Validação:** estar na página 2 e filtrar para um resultado de uma página; em seguida, simular falha mantendo resposta antiga e confirmar que o CSV fica indisponível. **Esforço pequeno a médio.**

### A08 — Respostas fora de ordem podem selecionar o imóvel errado na comissão

**Problema e evidência:** `Comissoes.tsx:33–40` grava o contrato escolhido, consulta novamente listas de contratos e depois grava o imóvel encontrado, sem verificar se a seleção ainda é atual. A chamada do componente não trata a rejeição (`:54`). A API confere se contrato e imóvel coincidem.

**Condição e impacto:** selecionar contrato A e depois B, limpar a seleção ou trocar o tipo de operação enquanto a consulta de A está pendente. Uma resposta tardia pode reaplicar o imóvel anterior. O servidor rejeita o vínculo incompatível; não confirmei alteração financeira persistida.

**Correção preferida:** consultar pelo ID, descartar respostas cuja seleção deixou de ser atual, tratar falha e impedir envio enquanto a resolução está pendente.

**Validação:** resolver chamadas A/B em ordem inversa, limpar durante a consulta e simular erro. **Esforço pequeno a médio.**

### A09 — Editar outro campo pode desativar um vínculo de característica oculto

**Problema e evidência:** a resposta interna reutiliza a resposta pública do imóvel, que omite características inativas (`imoveis.resposta.ts:21, 28–30`). O formulário envia sempre a coleção de características que recebeu (`esquemaImovel.ts:67, 84`). Ao salvar, a API desativa todos os vínculos e reativa apenas os enviados (`imoveis.service.ts:170–183`).

**Condição e impacto:** desativar globalmente uma característica, abrir um imóvel que ainda a possui e editar somente o título. O vínculo oculto também fica inativo; reativar a característica global não reativa sua associação. A ficha perde silenciosamente esse vínculo e valor.

**Correção preferida:** expor vínculos completos na resposta administrativa e enviar a coleção só quando editada, com remoção explícita.

**Validação:** desativar a característica, editar apenas título, reativá-la e conferir que o vínculo e o valor foram preservados. **Esforço médio** entre frontend e API.

### A10 — A busca normaliza o termo, mas não o telefone armazenado

**Problema e evidência:** a validação aceita espaços, parênteses e hífen (`comum/validacao.ts:18–22`); a pessoa é persistida com a formatação recebida (`pessoas.service.ts:27–30, 44–47`). A busca remove pontuação do termo, mas compara diretamente `pessoa.telefone LIKE :digitos` (`pessoas.service.ts:64–67`).

**Exemplo e impacto:** um cadastro armazenado como `(66) 99999-9999` não é encontrado por `66999999999`. Cadastros deixam de aparecer na busca telefônica, favorecendo duplicação manual.

**Correção preferida:** normalizar a expressão SQL da coluna e do termo na consulta para corrigir o legado sem modificar dados nesta etapa. Padronizar armazenamento fica para mudança autorizada futura.

**Validação:** encontrar o mesmo telefone pontuado, sem pontuação e com prefixo 55. **Esforço baixo** no filtro; médio se envolver dados existentes.

### A11 — O SSR pode expirar enquanto a API gratuita ainda inicializa

**Problema e evidência:** `publicGet` cancela cada chamada após dez segundos (`server.tsx:39–43`); a renderização pública converte a falha em 503. A função gerada prevê duração máxima de 60 segundos. O Render informa que serviços Free podem levar cerca de um minuto para voltar após inatividade: [documentação do Render](https://render.com/docs/free).

**Condição e impacto:** se a API for hospedada nesse plano e estiver iniciando, o SSR pode responder 503 antes de ela ficar pronta. O código configura esse prazo; o ambiente implantado e a frequência do incidente não foram verificados.

**Correção preferida:** usar um orçamento total coerente com a duração máxima do SSR e permitir que o cliente tente novamente quando a API retornar, mantendo 503/noindex enquanto os dados necessários não estiverem disponíveis. Aumentar cada timeout individual sem um limite total pode exceder a duração da função.

**Validação:** simular API lenta, verificar catálogo e detalhe durante a partida e confirmar recuperação após ficar disponível. **Esforço médio.**

### H01 — O isolamento das pastas de contrato no Drive requer validação das ACLs

**Evidência:** a API restringe leitura de contrato ao intermediador/ADMIN, mas a pasta é aberta diretamente no Drive. O cliente bloqueia permissões `anyone`/`domain`, consulta apenas o tipo das permissões (`drive-cliente.ts:87–101`) e não sincroniza usuários ou grupos com o responsável.

**Condição/impacto potencial:** se corretores forem membros do mesmo grupo/raiz, podem abrir pastas alheias diretamente; se só administradores/service account puderem acessar a raiz, o intermediador talvez não abra sua pasta.

**Certeza e validação:** hipótese a validar nas ACLs reais; nenhum acesso indevido foi confirmado. A API e o Drive podem ter controles complementares que não foram inspecionados.

**Próximo passo:** homologar acesso direto como ADMIN, intermediador A e corretor B, incluindo transferência/desativação de contrato. Esforço médio a grande, dependendo da política da conta Google.

### Controles confirmados que reduzem outros riscos

- Login possui limitação de tentativas e resposta 429; ausência de rate limit de login não é um achado.
- Troca própria de senha já revoga sessões refresh; o achado A03 é específico ao reset administrativo.
- Access token do frontend fica em memória; refresh usa cookie HttpOnly.
- DTOs passam pelo `ValidationPipe`; respostas públicas de imóvel separam campos internos.
- JSON-LD e bootstrap usam serialização contextual; não confirmei XSS nesses fluxos.
- Cálculo financeiro utiliza `bigint` para centavos; a confirmação de pagamento usa lock e impede divergência de comprovante em baixa repetida.
- Upload verifica assinatura básica dos formatos aceitos. O achado A02 é sobre consumo de memória anterior à validação agregada.

## D. Plano de ação

| Ordem | Etapa | Itens e critério |
|---|---|---|
| 1 | Antes da publicação | A01: bloquear ganho de acesso a pessoas por contrato criado pelo próprio corretor. |
| 2 | Antes da publicação | A02 e A03: limitar consumo durante upload e revogar refresh no reset administrativo. |
| 3 | Antes da publicação | A04–A06 e A09: preservar sessão, entrada de formulários, dados do contato e vínculo de características. |
| 4 | Próxima etapa | A07, A08 e A10: alinhar consulta/exportação, seleção de comissão e busca telefônica. |
| 5 | Homologação operacional | Validar A11 e permissões reais do Drive (H01) antes de depender dos fluxos em ambiente publicado. |

A01 deve ser tratado antes dos testes autenticados com múltiplos corretores. As correções que tocam migrations ou dados existentes exigem plano e autorização próprios; este relatório não altera dados.

## E. Validação realizada

| Verificação | Resultado |
|---|---|
| Frontend `npm run typecheck` | Aprovado |
| Frontend `npm run lint` | Aprovado |
| Frontend Vitest, um worker, sem cache | 37 arquivos e 178 testes aprovados |
| API `npm run typecheck -- --incremental false` | Aprovado |
| API `npm run lint` | Aprovado |
| API Jest, sem cache; integração PostgreSQL e bootstrap excluídos | 25 suítes e 173 testes aprovados |
| A01: serviço real com banco/Drive simulados e dados sintéticos | Confirmou criação do contrato indevido; sem SQL/rede |
| A04: hook real em jsdom com API simulada | Confirmou perda de sessão após remonte |
| A06: comparação dos validadores reais | Confirmou aceite no frontend e rejeição pela regra da API; nenhum POST |
| `git diff --check` nos dois repositórios | Aprovado |

Não foram executados build, smoke de produção, Playwright, startup real da API, testes PostgreSQL, migrations, carga, upload real ou chamadas a serviços implantados. Os testes de regressão novos estão descritos nos achados; ainda precisam ser implementados e executados.

## F. Recomendações técnicas

**Corrigir primeiro:** A01, autorização de referências de pessoas em contratos.

**Manter:** frameworks e arquitetura atuais, token de acesso em memória, refresh HttpOnly, serialização contextual do JSON-LD, autorização real no backend e cálculo de centavos com `bigint`.

**Simplificar:** ciclo de vida da sessão, estado associado às consultas e busca de contrato por ID. Distinguir no PATCH coleção omitida, preservada e removida.

**Não alterar agora:** migrations já aplicadas, registros de produção, infraestrutura ou serviços externos. A auditoria não dá evidência para trocar framework nem introduzir dependências.

## Tasks para acompanhar as correções

Marque cada item somente depois de implementar e validar o critério. Registre abaixo do item o commit ou a evidência do teste quando concluído.

- [x] **A01 — Restringir vínculos de contrato.** POST/PATCH com pessoa sem autorização falha; ADMIN e vínculos legítimos continuam acessíveis. Evidência: `locacoes.http.spec.ts` e `locacoes.service.spec.ts`, HTTP local com persistência/autenticação sintéticas em 03/10/2026; compartilhamento ADMIN mantido no PATCH.
- [x] **A02 — Limitar upload antes de consumir memória.** Limite agregado e concorrência são aplicados durante a leitura; teste sintético não chama R2 após rejeição. Evidência: `recepcao-midias.ts`, `recepcao-midias.spec.ts`, `midias.http.spec.ts`; HTTP chunked com teto reduzido, guard antes do storage, 2 uploads por instância, 20 arquivos aceitos/21 recusados; sem R2/carga real.
- [x] **A03 — Revogar refresh no reset administrativo.** Tokens anteriores falham; outras contas permanecem válidas. Evidência: `corretores.service.spec.ts` usa `CorretoresService` e `SessoesService` reais com sessões sintéticas; dois refreshes antigos rejeitados e refresh da outra conta válido em 03/10/2026.
- [x] **A04 — Corrigir restauração da sessão ao remontar o painel.** Correção e testes de regressão chegaram em `0a8b84e`; reexecução pendente. Evidência:
- [x] **A05 — Evitar reset do formulário de imóvel após entrada.** A carga agora precede a exibição do formulário em `0a8b84e`; reexecução pendente. Evidência:
- [x] **A06 — Unificar validação de telefone do contato.** Entradas aceitas pelo formulário são aceitas pela API e erros aparecem antes de abrir WhatsApp. Evidência: `telefoneValido` com fonte única em `src/servicos/validacao.ts` (reexportado por `contato.ts`), validação prévia em `src/componentes/FormularioContato.tsx`, testes em `contato.test.ts` e `FormularioContato.test.tsx` (front 43 arquivos/223 testes em 03/10/2026).
- [x] **A07 — Sincronizar filtros, paginação e CSV dos contatos.** Página reinicia com filtro; falha de consulta não exporta resposta antiga. Evidência: remonte por chave de filtros (página 1 em 1 fetch) + `useDadosPainel` com guarda de sequência que descarta resposta obsoleta + botão CSV desabilitado com `Boolean(erro)` em `src/paginas/painel/Contatos.tsx`; testes em `Contatos.test.tsx`.
- [x] **A08 — Evitar respostas fora de ordem na seleção da comissão.** Seleção rápida, limpeza e falha não aplicam imóvel obsoleto. Evidência: busca por ID via `api.obterContrato(valor.id)` com token de sequência, erro visível, dica `Buscando imóvel…` e botão bloqueado durante a resolução em `src/paginas/painel/Comissoes.tsx`; 3 testes em `Comissoes.test.tsx` (direta, fora de ordem, limpar/falha).
- [ ] **A09 — Preservar vínculos de características ocultas.** `0a8b84e` passa a enviar itens inativos da ficha; validar persistência em edição antes de marcar concluído. Evidência (03/10/2026, sem marcar): back `GAP-04` expõe todos os vínculos com `caracteristica_ativa` e aceita inativa já vinculada; front tipa `caracteristica_ativa?` e tem teste de round-trip em `esquemaImovel.test.ts`. Falta homologação integrada (desativar, editar título, reativar e conferir).
- [ ] **A10 — Corrigir a busca de telefone formatado.** Mesmo cadastro é encontrado com e sem pontuação. Evidência (back `7f59109`, sem marcar no front): `regexp_replace(pessoa.telefone, '\D', '', 'g')` em `pessoas.service.ts` com teste unitário `GAP-05 / A10`; falta busca real com legado pontuado.
- [ ] **A11 — Validar timeout e recuperação do SSR.** API lenta não impede recuperação; erro mantém resposta segura até haver dados válidos. Evidência (03/10/2026, sem marcar): `ORCAMENTO_PUBLICO_MS=45s` + 10s por requisição + `Retry-After: 30` e `noindex` em 503 em `src/seo/server.tsx`, retentativa no cliente via `useRecurso`; teste de 503 em `server.test.ts`. Falta simular API lenta e confirmar recuperação pós-partida.
- [ ] **H01 — Homologar ACLs do Drive.** ADMIN, intermediador e corretor sem vínculo têm acesso conforme política decidida. Evidência:

### Nota posterior — remoção das suítes, 03/10/2026

Por solicitação do dono, os 46 arquivos `*.test.*`/`*.spec.*` do frontend e os 28 da API irmã foram removidos
após a validação descrita abaixo. Os resultados de testes permanecem como histórico da revisão anterior; não
representam validação da árvore atual. Não executar nem afirmar testes após esta remoção.

### Complemento final do checklist — Codex, 03/10/2026

A04/A05 foram reexecutados: as pendências de reexecução nas linhas anteriores são históricas.
A04 tem testes novos de expiração/login durante refresh e renovação compartilhada. A05 tem teste com
classificações pendentes: não há campo editável antes da carga/reset inicial. Frontend final: 43 arquivos/231 testes.
A09 preserva somente associações ativas (mesmo com classificação global inativa), omite coleção inalterada
no PATCH e testa remoção/round-trip sintéticos. A10 ganhou busca nacional com +55 sem modificar registros.
A11 foi simulado com API lenta, recuperação por nova requisição e limite total da paginação. Bootstrap 503
exibe botão de recarga da página; a menção anterior a useRecurso não significa recuperação automática desse estado.
A09/A10/A11 continuam abertos apenas quanto à homologação integrada/operacional; H01 depende das ACLs reais.


---

## Arquivo original: 2026-10-03-carga-catalogo.md

# Carga persistente do catálogo — 03/10/2026

Plano aprovado em conversa e esclarecido: o dono quer preencher de verdade o banco atual da API
com conteúdo ilustrativo e fotos obtidas na internet, sem criar modo demo no site.

- Criar 12 imóveis de Juara/MT: 3 salas, 3 lojas, 3 galpões, 2 terrenos e 1 prédio;
  7 locações, 4 vendas, 1 locação/venda, 3 destaques e 1 terreno sob consulta.
- Fotos de referência licenciadas, 3 por anúncio, capa distinta. Descrição identifica imagens
  ilustrativas e endereços são de conteúdo, sem alegar estoque comercial confirmado.
- Criar ADMIN Codice, codice@demo.invalid, CPF sintético válido/único, WhatsApp da marca.
  Senha aleatória forte gerada e guardada antes do insert fora de Git/OneDrive, ACL privada.
- ADMIN ativo id 1 é autor do novo administrador. Codice assume os anúncios.
- Usar serviços/DTOs e TypeORM existentes, TLS verificado, sem migration/dependências novas.
- Simulação consulta sem escrever; backup completo não vazio antes da escrita.
- Marcador interno por anúncio e manifesto privado por lote. Reexecução ignora registros
  concluídos e nunca altera senha, imóveis/mídias anteriores ou edições posteriores.
- Conexão Neon direta e trava de sessão dedicada. Imóveis começam inativos; upload fora
  de transação PostgreSQL; publicação somente após completar galeria e verificar integridade.
- Retomada reconcilia banco/R2/journal; divergência exige revisão, sem sobrescrita automática.
- QA: typecheck/lint/build, ausência de suítes registrada no npm test; API/R2 reais e navegador
  local, catálogo/detalhes/filtros/galerias/robots/sitemap/404. Nada de commit/push/deploy.
- Atualizar documentação de contexto dos dois repositórios sem apagar histórico.

## Registro de execução

| Etapa | Responsável | Estado |
|---|---|---|
| Comando de carga e proteção de reexecução | Codex | concluído; revisão independente reportou correções já incorporadas antes da quota do agente |
| Manifesto e proveniência das fotos | Codex | concluído; 36 fontes/licenças documentadas |
| Backup, credenciais privadas e execução | Codex | concluído; backup privado, Neon direto e R2 verificados |
| Revisão do comando | Codex | concluído por inspeção final e typecheck/lint/build |
| QA e documentos finais | Codex | concluído localmente; UI SSR, imagem carregada, verificação completa do backup |

Resultado real: foram criados 12 imóveis ativos, 9 características, 1 ADMIN Codice e 36 mídias,
preservando as 114 linhas do snapshot. R2 confirmou os objetos, mas `R2_PUBLIC_URL` retornou HTTP
401. O comando conserva cópias no R2 sem mudar a política do bucket e usa as URLs originais
`images.unsplash.com` nas linhas de mídia; 36/36 responderam HTTP 200 em 03/10/2026. Sem migration,
commit, push, deploy ou alteração dos anúncios anteriores. `npm test` continua sem arquivos e não
foi contado como aprovação.

Decisões: trabalhar direto na main por instrução do dono; não recriar suítes removidas.
O frontend conserva seu contrato de dados e não recebe fallback fictício ou configuração demo.


---

## Arquivo original: 2026-10-06-ajustes-painel.md

# Ajustes de usabilidade e layout do painel — 06/10/2026

Pedido do dono após a revisão de Contatos: corrigir tooltips, Esc, seletores, atendimento,
cards/alinhamento, menu mobile e informações desnecessárias nas listagens. O plano foi
aprovado expressamente com “Implement the proposed plan.”

## Decisões e entrega

- Somente frontend; preservar alterações locais e índice Git. Sem API/banco/migrations,
  dependências novas, commit, push ou deploy.
- Esc sem camada aberta volta à entrada anterior do histórico interno do painel, incluindo
  query/hash. Sem histórico disponível, detalhes/edições voltam à lista; telas principais
  voltam à Visão geral. A Visão geral sem histórico não navega. Não abre a página externa
  anterior. O histórico é por permanência no painel, não persiste após recarregar/sair.
- Tooltip, seleção e modal consomem Esc antes do retorno. Campo de texto, composição e
  repetição da tecla não disparam navegação. A guarda de edição existente segue válida.
- `SeletorFiltro` controlado padroniza as listas dos filtros de Pessoas, Contatos, Imóveis,
  Contratos, Comissões e Cadastros. Não substitui selects dos formulários de edição.
  Usa tokens existentes, listbox na camada popover, direção conforme espaço, foco no
  combobox, setas/Home/End, Enter/Espaço, busca por prefixo, Tab, Esc e clique fora.
- O menu mobile usa a variante `telaInteira` de Dialogo, com áreas seguras, cabeçalho fixo,
  rolagem interna e restauração de foco. Outros diálogos conservam o formato existente.
- Cards da Tabela têm separação entre registros, nome/identificação à esquerda e demais
  valores à direita. Ações ocupam uma faixa à direita. Grupos de ícones nas tabelas ficam
  horizontais, com alvo mínimo de 44px; faixas maiores podem quebrar para caber.
- Cabeçalhos e grupos buscar/limpar alinham ações à direita, sem impor botões de largura
  total no mobile. Não altera o padrão dos rodapés de edição.
- Atendido continua checkbox, com contorno e estados marcado, foco, ocupado e desabilitado.
  Preserva as transições, confirmações e permissões existentes. Reabertura exclusiva de ADMIN
  continua sendo uma restrição do frontend, não uma garantia homologada da API.
- Removido o filtro local “Só sem foto”, incluindo resumo e contagem especiais; o placeholder
  de imagem ausente continua disponível. Origem Manual/Site e consentimento saem das listas
  de Pessoas/Contatos e permanecem na ficha da pessoa.
- Tooltip conserva nome acessível/dica curta, sem barra/setinhas de rolagem. O reset de
  overflow e do pseudo-elemento é restrito ao painel.

## Progresso e evidência

Implementação e validação local concluídas. Evidência efêmera e capturas:
`artifacts/ajustes-painel-2026-10-06/`, ignorado pelo Git.

A verificação anterior à implementação reproduziu origem na lista, menu parcial, Esc sem
retorno e filtro sem foto presente. A revisão visual/independente encontrou ações da
tabela comprimidas em coluna; o grupo de ícones foi corrigido para não quebrar internamente.

**Validação final:** typecheck, lint, 3 arquivos/21 testes existentes, build e smoke SSR
aprovados. Chrome/API simulada: 63 cenários, 59 capturas, sem erros JavaScript,
requisições API inesperadas ou overflow horizontal. Matriz 320/390/768/1440 claro/escuro
para Pessoas, Contatos, Corretores, Imóveis, ficha, seletor e menu. Inclui teclado,
tooltip sem rolagem, histórico/POP/entrada direta, guarda de edição, seletores das demais
listagens, atendimento erro/retry/transições e permissões ADMIN/CORRETOR; regressão pública
de catálogo, detalhe e menu. Capturas representativas inspecionadas visualmente.
`git diff --check` aprovado; diff staged antes/depois com SHA-256 idêntico.
Evidência ignorada: `artifacts/ajustes-painel-2026-10-06/`.

API/banco/serviços reais, Safari/iOS e dispositivo físico continuam sem homologação.
QA simulado não altera dados reais. Nenhuma suíte rastreada foi criada ou ampliada.


---

## Arquivo original: 2026-10-06-conclusao-area-corretor.md

# Conclusão local da especificação da Área do Corretor — 06/10/2026

O dono aprovou a continuação integral após Contatos: aplicar as specs completas ao restante
do painel, incluindo fichas próprias, CampoNumero, descarte de alterações e Ctrl/⌘+K.
Fontes vigentes: `2026-10-06-painel-especificacao-visual.md` e seu adendo 12,
`2026-10-06-ajustes-painel.md`. Este registro substitui o estado pendente das etapas anteriores,
preservadas como histórico. Implementação e validação local concluídas; sem publicação.

## Entrega

| Frente | Resultado |
|---|---|
| Imóveis e formulário | Lista com link real/linha clicável, consulta separada da edição, ações por permissão, responsável/proprietário vinculados; rascunho, duplicação, mídias e DTO preservados |
| Contratos e detalhe | Listagem compartilhada, vínculos para fichas, edição/arquivamento existentes, operações financeiras e Drive com texto e fluxos atuais |
| Comissões | Lista e ficha própria, referências com estados independentes, editor e recebimento; valores/parcelamento em centavos e confirmações preservados |
| Cadastros e Corretores | Listas, editores e fichas próprias, ações discretas à direita e consultas conforme cargo |
| Visão geral e Perfil | Resumos com Tabela, vínculos e tipografia vigentes; guarda conjunta para perfil/senha e reset apenas da edição salva |
| Pessoas | Ficha e vínculos consistentes, edição protegida, seleção original restaurável e origem/consentimento somente na ficha |
| CampoNumero | Unidade externa, vírgula/ponto e colagem agrupada, sem letras/sinais/exponente; esquemas/limites/DTO existentes |
| Dialogo | Dirty/busy opt-in, Esc + Esc/Enter, desarme, X/Cancelar/clique externo com confirmação, prioridade da camada superior e bloqueio durante envio |
| Comandos | Ctrl/⌘+K pesquisável, destinos/ações permitidos, setas/Enter/Esc; botão de busca disponível no mobile |

As novas consultas são rotas próprias: `/admin/imoveis/:id`, `/admin/comissoes/:id`,
`/admin/cadastros/:categoria/:id` e `/admin/corretores/:id`. O próprio corretor abre
`/admin/perfil`. ADMIN usa os GETs existentes de corretores/classificações. CORRETOR consulta
somente dados públicos de outro corretor já disponíveis nas fichas autorizadas de imóveis,
sem pedir CPF, e-mail ou endpoints de corretores restritos. Não encontrar dados vira
indisponível; 500/conexão mantém erro e retry. Id/categoria inválidos não geram consulta inválida.

Os ajustes anteriores continuam: menu mobile inteiro; seletores dos filtros estilizados;
Esc retorna ao histórico interno com fallback e guarda; cards mantêm identificação à esquerda
e valores/ações à direita; checkbox Atendido; tooltip sem setas/rolagem; filtro sem foto removido.
A regra de reabertura de atendimento somente por ADMIN permanece uma restrição do frontend.

## Decisões de implementação

- `CampoNumero` mantém texto durante edição. Ao receber `1.234,56`, remove apenas os pontos
  de milhar, ficando `1234,56`, para permitir apagar/editar os decimais sem travar. A conversão
  fica nos adaptadores das telas; dinheiro de contrato/comissão continua string decimal exata.
- `Dialogo` recebe `alterado`/`ocupado` opcionais; consumidores públicos conservam os defaults.
  A pilha controla fechamento/foco e trava do corpo quando há modais aninhados. Teclas rejeitadas
  pelos controles também desarmam o aviso; repetição de Esc não confirma descarte.
- Cancelar dos editores usa `data-fechar-dialogo`. Descarte de formulário nunca desfaz mídia,
  pagamento ou outra operação já persistida. Pagamento de comissão também participa da guarda.
- A paleta executa depois da desmontagem do diálogo, para comandos de foco não serem
  sobrescritos pela restauração de foco. Não há `/`, `?` ou Ctrl/⌘+Enter.
- Perfil protege as duas edições em conjunto. Se o PATCH salvar mas a atualização da sessão
  falhar, informa explicitamente que a gravação ocorreu; não volta a tratar o perfil como pendente.
- Selecionar novamente o imóvel original de uma pessoa reutiliza sua referência inicial:
  a mudança do título de apresentação não mantém o formulário sujo quando o id é igual.
- Reutilizados serviços, tokens, fontes e ícones. Estilos adicionados ficam em `.painel-ui`.
  Nenhuma dependência, endpoint de backend, migração ou alteração persistente foi introduzida.

## Validação executada

Após as correções finais, todos com exit 0:

- `npm run typecheck`, `npm run lint`, `npm test`: 3 arquivos, 21 testes existentes.
- `npm run build`: cliente, SSR e saída Vercel; avisos conhecidos de annotations do Zod.
- `node scripts/seo-smoke.mjs --serve`, reiniciado após o build final: SSR/metadados/paginação,
  redirecionamento/404/descoberta, proxy e cookies, função Vercel independente, 503/HEAD/recuperação.
- Chrome/API simulada: **320 cenários, 140 capturas**, sem erros JavaScript, requisições API
  inesperadas ou overflow horizontal. 232 cenários de matriz + 36 comportamentos + 52 complementares.
- Matriz de todas as telas/fichas/formulário de imóvel em 320/390/768/1440, claro/escuro,
  ADMIN/CORRETOR, excluindo telas administrativas não permitidas no cargo CORRETOR.
- Menu inteiro e foco; sidebar sem scroll em 1366×657 e 1440×900; linhas, links reais,
  Ctrl+clique e ação interna independente; tooltip/seletores antes do Esc e histórico/fallback.
- Modal limpo/pré-preenchido, dois Esc/Esc+Enter, desarme por tecla/clique/edição, valores
  restaurados, X/Cancelar/clique externo, camada superior, repeat, scroll e envio ocupado/erro/retry.
- Números por teclado/colagem/vírgula/ponto/Backspace, vencimento 1–31, parcelas 1–600,
  prévia com centavos/fim de mês, áreas e vazios opcionais; DTOs decimais preservados.
- Rascunho e guarda do imóvel; perfil/senha com reset independente e falha de sessão após salvar;
  fichas 403/404/500/retry, identidade própria, classificação inválida e consultas por cargo.
- Atendimento: marcar/desmarcar/finalizar/reabrir; pagamento exige confirmação explícita e
  descartar não baixa parcela. Regressão pública de catálogo, detalhe e menu nos dois temas.
- Revisão estática delegada das telas e revisão consolidada. Cinco lacunas de guarda/foco/
  desarme/colagem/valor restaurado corrigidas; revisão posterior não encontrou novo achado acionável.
- `git diff --check`; índice staged idêntico ao snapshot anterior, SHA-256
  `65c8c19c83ff479bbfc0667377c8cb087dd0008d64c9feafcf994f635ef7661c`.

Capturas representativas foram inspecionadas visualmente. Evidência ignorada:
`artifacts/conclusao-area-corretor-2026-10-06/` (JSONs, prints, relatórios e snapshots).
Scripts efêmeros de QA removidos ao terminar; nenhuma suíte rastreada foi criada/ampliada.

## Prévia e limites

Servidor de desenvolvimento mantido em `0.0.0.0:5173`. Wi-Fi atual verificado neste host:
`http://192.168.0.20:5173/admin/entrar` (HEAD 200). Uma sondagem de login com corpo vazio,
sem credenciais, e Origin desse endereço retornou 400 de validação dos campos, sem rejeição
de origem. Isso não homologa um login real nem prova conectividade do dispositivo físico.
O IP/processos de desenvolvimento são temporários; revalidar ao retomá-los.

QA simulado não alcançou banco/API reais. Login autenticado, permissões do backend, upload
R2, Drive, pagamentos reais, Safari/iOS e celular físico continuam sem homologação nesta etapa.
Trabalho local diretamente na main, preservando histórico, alterações anteriores e índice.
Sem commit, push ou deploy.


---

## Arquivo original: 2026-10-06-painel-especificacao-visual.md

# Área do Corretor — especificação visual e de comportamento (06/10/2026)

Especificação consolidada com o dono, em conversa ponto a ponto, a partir do plano de outra IA, que foi descartado.
Este documento substitui aquele plano. Serve para **entender** o que foi decidido e para **aplicar** o padrão nas
telas que ainda faltam.

- **Escopo:** somente frontend.
- **Proibido sem novo pedido:** dependência nova, mudança de API ou dados, migration, commit, push ou deploy.
- **Fonte de verdade:** o código. Quando este texto e o código divergirem, confira o código e atualize este arquivo.

## 1. Situação

| Parte | Situação |
|---|---|
| Base visual do painel: tokens, `.painel-ui`, botões, campos | Feito |
| Sidebar: 260px, logo, ícones, sem scroll, cartão do perfil | Feito |
| Ícones Material Symbols no painel e no site público | Feito |
| Listagem padrão (`Tabela`) e cabeçalho de página | Feito |
| Tela de referência **Pessoas** e modal `EditorPessoa` | Feito, aprovado como "razoável" |
| Contatos em duas listas | Pendente |
| Imóveis, Contratos, Comissões, Cadastros, Corretores, Visão geral, Perfil, formulários e modais | Pendente (aplicar o padrão) |
| `CampoNumero`, links de imóvel e corretor, guarda de modal (Esc), Esc sem modal, Ctrl+K | Pendente |
| Registro em `PROJECT_STATUS.md`, `TASKS.md` e `CHANGELOG_AI.md` | Pendente |

Nada foi commitado.

## 2. Princípios

1. **Agradável e legível:** texto grande e confortável, menos caixas decorativas e destaque claro das ações.
2. **Um padrão só:** toda listagem, botão e campo do painel usa os mesmos componentes. Não faça correções isoladas
   por tela.
3. **Identidade azul e dourado preservada:** o painel usa um dourado um pouco mais fechado que o do site, para o
   ícone branco ficar legível.
4. **Site público intacto:** tudo do painel fica escopado em `.painel-ui`. A única mudança pública autorizada é a
   troca de ícones.

## 3. Tokens

Os tokens ficam em `src/styles/tailwind.css` (`@theme` e `.dark`). Nos componentes, use só os tokens, nunca cores
literais.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--color-acao-painel` | `#b3892d` | igual | Fundo dos botões de ação; base do ícone ativo na sidebar |
| `--color-acao-painel-hover` | `#a37d29` | igual | Hover dos botões (um pouco mais escuro) |
| `--color-sobre-acao` | `#ffffff` | igual | Desenho do ícone sobre o dourado |
| `--color-campo` | `#f3f6fb` | `#1a2f55` | Fundo discreto dos campos |
| `--color-linha-a` | `#f5f6f8` | `#192d52` | Linhas ímpares da listagem |
| `--color-linha-b` | `#e8ebef` | `#213a64` | Linhas pares da listagem |
| `--color-linha-foco` | `#d9e2ef` | `#2a4470` | Linha sob o mouse |
| `--color-cabecalho-tabela` | `#dfe5ee` | `#142748` | Fundo do cabeçalho das colunas |
| `--color-texto-cabecalho-tabela` | `#2c3a52` | `#dce4f0` | Títulos das colunas |

Contraste:
- Texto azul (`navy-deep`) sobre o dourado: cerca de 5,5:1 no normal e 4,7:1 no hover.
- Ícone branco sobre o dourado: cerca de 3,2:1, o que basta para ícone (mínimo de 3:1).

Não use o dourado `#c99b3f` do site em botões do painel: o branco sobre ele fica em cerca de 2,4:1.

## 4. Tipografia

As fontes continuam Source Sans 3 (texto) e Libre Baskerville (títulos).

| Papel | Tamanho | Onde |
|---|---|---|
| Título de página | 28px | `CabecalhoPagina` (h1) |
| Subtítulo e título de modal | 22px | `.dialogo-titulo`, títulos de seção |
| Texto principal | 18px | Base de `.painel-ui`, campos, células e botões |
| Auxiliar | 16px | Rótulos, dicas, erros, metadados das linhas e títulos das colunas |
| Etiqueta de situação | 14px | `Etiqueta` (sem quebra de linha) |

Evite rótulo em caixa alta espaçada (eyebrow) acima dos títulos. Ao migrar cada tela, remova o `rotulo` do
`CabecalhoPagina`.

## 5. Componentes compartilhados

### 5.1 Escopo `.painel-ui`

A raiz de `LayoutPainel.tsx` recebe `painel-ui`. As regras do painel ficam no fim do `@layer components` de
`src/styles/global.css`, sempre prefixadas com `.painel-ui`. A especificidade maior vence as regras públicas.

Utilitários do Tailwind ainda vencem essas regras. Se um utilitário (por exemplo `text-sm`) impedir o padrão, troque o
utilitário por uma classe semântica, como foi feito com `campo-dica`, `campo-erro`, `dialogo-titulo` e `acao-perigo`.

### 5.2 Botões

| Tipo | Aparência | Quando usar |
|---|---|---|
| `.button` (ação principal) | Fundo dourado, raio 12px, altura mínima 48px, ícone branco de 22px, texto azul-escuro 18px | Ação que precisa de texto ("Salvar pessoa", "Salvar contrato") |
| `AcaoIcone` fora de lista | Quadrado dourado de 48px, ícone branco, dica ao passar o mouse ou focar | Ação óbvia: `+` Novo, lápis Editar, lupa Buscar |
| `AcaoIcone` dentro de lista | Sem fundo, 40px, ícone de 22px na cor do texto da linha; hover e foco com fundo translúcido | Ações da linha, sempre à direita |
| `.buttonSecondary` / `.buttonGhost` | Contorno de 1,5px, raio 12px, texto na cor do texto | Ações secundárias: Cancelar, Limpar |
| `.buttonPerigo` / `tom="perigo"` | Vermelho de erro | Ações destrutivas |

Regras:
- Confirmações e ações financeiras **sempre com texto**.
- Desabilitado: opacidade reduzida e `cursor: not-allowed`, já presente na base.

### 5.3 `AcaoIcone` (`src/componentes/AcaoIcone.tsx`)

- `rotulo`: verbo curto mostrado na dica ("Editar", "Arquivar", "Nova pessoa").
- `contexto`: complemento que entra **só no nome acessível**. `rotulo="Editar" contexto={pessoa.nome}` mostra a dica
  "Editar", e o leitor de tela lê "Editar Maria".
  - Com `contexto`, a dica fica `aria-hidden` e o botão fica sem `aria-describedby`, para não repetir.
- A dica aparece ao passar o mouse ou focar, não intercepta o clique e não corta na borda da tela. Esc fecha a dica
  primeiro.
- `tipo="submit"` serve para botões de formulário, como a lupa dos filtros.
- **Nunca** coloque o nome do registro na dica visível.

### 5.4 Campos

- Use `Campo` (`src/componentes/Campo.tsx`): rótulo acima, dica e erro ligados ao controle por `aria-describedby`.
- Aparência: altura mínima 48px, contorno de 1,5px, raio 10px, fundo `--color-campo` e texto 18px.
  - Foco: borda e contorno dourados.
  - Erro: borda vermelha e mensagem de 16px.
- Componentes com dica ou erro próprios (por exemplo `SeletorRegistro`) usam as classes `campo-dica` e `campo-erro`.

### 5.5 Listagem padrão (`src/componentes/Tabela.tsx`)

**Todas as listagens do painel** seguem este padrão:

- Linhas alternadas (`linha-a` e `linha-b`); hover em `linha-foco`.
- Cabeçalho das colunas com fundo e cor próprios, em texto normal (sem caixa alta).
- Contêiner com raio de 12px e borda; sem um "painel" em volta da tabela, para reduzir caixas.
- **Linha inteira clicável** com `linkLinha={(item) => url}`:
  - Clique comum navega na mesma guia.
  - Ctrl, ⌘ ou Shift + clique, ou o botão do meio, abrem nova guia.
  - Clique em link, botão, campo, checkbox ou dica dentro da linha executa só a própria ação.
  - Texto selecionado não dispara navegação.
  - A primeira coluna **deve** conter um `<Link>` real para o mesmo destino, para o teclado e o leitor de tela.
- Coluna `acoes: true`:
  - Sempre a última, alinhada à direita, sem título visível (o título fica só para o leitor de tela).
  - Botões agrupados dentro de `.acoes-linha`.
- Quando o container da tabela tem menos de 40rem, a tabela vira **blocos alternados**. A primeira coluna é o título
  do bloco, as demais aparecem como pares rótulo/valor e as ações ficam à direita no fim.
- Lista vazia: frase que orienta a próxima ação, por exemplo "Nenhuma pessoa encontrada. Ajuste a busca ou cadastre
  uma nova pessoa."
- Metadados da linha: separe com espaço, não com "·".

### 5.6 Cabeçalho de página (`CabecalhoPagina`)

- Título de 28px à esquerda, **ações na borda direita da mesma linha**, descrição de 16px abaixo.
- No celular as ações quebram para baixo do título.

### 5.7 Modais (`Dialogo`)

- Título de 22px.
- Botão fechar: quadrado neutro de 48px com o ícone `close`.
- O rodapé do formulário fica fixo no fim do modal: ação principal dourada com ícone, mais Cancelar com contorno.
- **Pendência:** a linha 46 de `Dialogo.tsx` foi editada fora da sessão para `max-520px:px-22px` e
  `max-520px:pt-5`. Esse formato provavelmente não é válido no Tailwind, o que tira o espaçamento do cabeçalho dos
  modais no celular. O original era `max-[520px]:px-[22px] max-[520px]:pt-5`. Só restaurar quando o dono confirmar.

### 5.8 Ícones (`src/componentes/Icones.tsx`)

- Material Symbols (Google), estilo **Outlined preenchido** (FILL 1, peso 400), Apache 2.0. Valem no painel e no site
  público.
- SVG inline com `fill="currentColor"` e prop `size`, que funciona como no lucide.
- Para adicionar um ícone, baixe o SVG oficial e copie o atributo `d` para `criar(...)`, com o nome do catálogo em
  comentário. O endereço é:
  `https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/<nome>/materialsymbolsoutlined/<nome>_fill1_24px.svg`
- O `lucide-react` fica só para os logos GitHub e Instagram de `Devs.tsx`.
- Proibido:
  - misturar ícones de contorno;
  - usar `strokeWidth`;
  - carregar a fonte do Google Fonts.

Ícones já usados:

| Uso | Componente | Material |
|---|---|---|
| Novo | `IconeAdicionar` | `add` |
| Editar | `IconeEditar` | `edit` |
| Ver ficha | `IconeVer` | `visibility` |
| Buscar | `IconeBuscar` | `search` |
| Fechar | `IconeFechar` | `close` |
| Salvar | `IconeSalvar` | `save` |
| Excluir | `IconeExcluir` | `delete` |
| Arquivar / reativar | `IconeArquivar` / `IconeDesarquivar` | `archive` / `unarchive` |
| Copiar | `IconeCopiar` | `content_copy` |
| Senha | `IconeChave` | `key` |
| Carregando | `IconeCarregando` | `progress_activity` |
| Avisos | `IconeSucesso` / `IconeErro` / `IconeInfo` / `IconeAtencao` | `check_circle` / `error` / `info` / `warning` |
| Sidebar | `IconeVisaoGeral`, `IconeEdificio`, `IconeContatos`, `IconePessoas`, `IconeContrato`, `IconeComissoes`, `IconeCadastros`, `IconeCorretores`, `IconeAbrirFora`, `IconePessoa` | `dashboard`, `apartment`, `forum`, `group`, `contract`, `paid`, `checklist`, `work`, `open_in_new`, `person` |

Ícone sugerido para **Finalizar contato**: `task_alt` (baixar).

### 5.9 Sidebar (`LayoutPainel.tsx`)

- **Largura:** 260px, fundo azul-marinho e borda dourada à direita.
- **Topo:** logo oficial na variante para fundo escuro (`brand.logo.temaEscuro`, 48px de altura) e "Área do corretor"
  em 14px.
- **Itens:** ícone e nome (18px).
  - Os itens dividem a altura livre entre **40px e 64px** (`flex-[1_1_52px] min-h-10 max-h-16`): ficam espaçados em
    telas altas e sem scroll até cerca de 620px de altura.
  - Abaixo disso a sidebar rola. Uma altura mínima calculada impede que os itens fiquem por cima do cartão do perfil.
- **Item ativo:** base dourada arredondada de 36px com o ícone branco e fundo leve na linha. Os demais itens têm o
  ícone neutro, sem base.
- **Cartão do perfil:** foto ou inicial, nome, cargo e uma seta. O cartão inteiro leva a **Meu perfil** e fica com a
  borda dourada quando o perfil está aberto. "Sair da conta" e o botão de tema ficam abaixo dele.
- **Celular:** barra superior com o logo, tema, conta e o botão "Menu", que abre o menu com os nomes num modal.

## 6. Telas

### 6.1 Pessoas: referência pronta

Use como modelo ao migrar as outras telas. Arquivos: `src/paginas/painel/Pessoas.tsx` e `EditorPessoa.tsx`.

- **Cabeçalho:** título "Pessoas", descrição e `+` dourado só com ícone, com a dica "Nova pessoa", na borda direita.
- **Filtros:** Buscar (campo largo), Situação, Cadastro e a lupa dourada (`tipo="submit"`). "Limpar" com contorno só
  aparece quando há filtro. Os filtros aplicados aparecem como chips removíveis.
- **Listagem:** linha clicável para `/admin/pessoas/:id`; lápis discreto à direita com a dica "Editar". O botão de
  olho saiu, porque a linha já abre a ficha.

### 6.2 Contatos: nova estrutura (pendente)

- **Duas listas lado a lado:** **Pendentes** e **Atendidos**. No celular ficam empilhadas.
  - Cada uma usa a listagem padrão: linhas alternadas, linha clicável para a ficha da pessoa e ações à direita.
- **Checkbox à direita** em cada linha:
  - Marcar envia `status_contato: 'RESPONDIDO'` e a linha vai para Atendidos.
  - Desmarcar volta para `PENDENTE`.
  - O checkbox tem nome acessível, por exemplo "Marcar Maria como atendida".
- Em Atendidos, botão de ícone **Finalizar** (`task_alt`) com confirmação (`ConfirmarAcao`, com texto).
  - Ao confirmar, envia `FINALIZADO` e o contato **some das duas listas**.
- **Finalizados** só aparecem quando o filtro "Finalizados" é escolhido.
- **Só ADMIN reabre** um finalizado.
  - Em `EditorPessoa.tsx`, para CORRETOR, o select de situação não oferece sair de `FINALIZADO`.
  - A regra existe só no frontend, pois a API não será alterada. Registre isso como risco.
- O WhatsApp continua como ação com texto.
- Use o serviço atual: `api.salvarPessoa(...)`, como em `Contatos.tsx`.

### 6.3 Imóveis (pendente)

- A linha clicável abre a ficha em **tela própria** (`FichaImovel`): clique comum na mesma guia, Ctrl+clique em nova
  guia.
- **Ações à direita:**
  - Editar, só para quem tem permissão.
  - Arquivar ou reativar, com confirmação.
- O botão `+` "Novo imóvel" fica no cabeçalho.
- Remova o botão de olho que for redundante.

### 6.4 Contratos (pendente)

- A linha clicável abre o contrato, mantendo o link real no número do contrato.
- Na tabela, as ações ficam à direita.
- Ações financeiras e confirmações sempre com texto.

### 6.5 Comissões, Cadastros, Corretores e Visão geral (pendente)

- Mesmo padrão de listagem e cabeçalho.
- Em Visão geral, as listas resumidas também ficam com linhas alternadas e clicáveis.
- O nome ou avatar do corretor, em qualquer tela, abre o perfil dele, inclusive o próprio.
  - Estados obrigatórios: carregando, erro com "Tentar de novo" e indisponível.
  - Mostrar apenas os dados autorizados.

## 7. Comportamentos (pendentes)

### 7.1 Campos numéricos (`CampoNumero`, novo, em `src/componentes/`)

- Para valores, áreas, percentuais e quantidades. A unidade fica fora da área de edição (R$, m², %).
- **Aceita:** vírgula ou ponto decimal, e colagem como `1.234,56`.
- **Rejeita:** letras, sinais e notação científica.
- Preserva precisão, limites, campos opcionais e o **formato atual enviado à API**.
- Integra com react-hook-form e zod.
- **Onde aplicar:**
  - `Contratos.tsx:59`
  - `Comissoes.tsx:78`
  - `FormularioImovel.tsx:192`
  - demais `type="number"` ou `inputMode="decimal"`

### 7.2 Modais com alterações não salvas (no `Dialogo` ou num hook compartilhado)

| Situação | Comportamento |
|---|---|
| Sem alterações | Um Esc fecha. Antes disso, Esc fecha tooltip ou seleção aberta. |
| Com alterações, 1º Esc | Mostra "Há alterações não salvas. Pressione Esc ou Enter para descartar e sair." |
| Em seguida, Esc **ou** Enter | Descarta as alterações e fecha. Não há prazo. |
| Outra tecla, clique ou nova edição | Desarma o aviso |
| Valores voltaram ao inicial | Conta como sem alterações. Valor pré-preenchido não é alteração. |
| Botão X ou clique fora (quando permitido) | Com alterações, pede confirmação explícita |
| Durante salvamento | Fechar fica bloqueado |
| Modais sobrepostos | Fecha só o do topo |

Descartar não desfaz o que já foi salvo. Compare valores atuais com os iniciais, por exemplo com o `isDirty` /
`dirtyFields` do react-hook-form.

### 7.3 Esc sem modal aberto

- Em ficha ou detalhe, volta à lista.
- Telas principais voltam à Visão geral.
- Respeita a guarda de formulário (`useGuardaFormulario.tsx`).
- Ignorado enquanto o foco está num campo de texto.

### 7.4 Atalhos

Só **Ctrl/⌘+K**: abre uma paleta de comandos pesquisável com os destinos e ações permitidos ao cargo. Navega com as
setas, Enter executa e Esc fecha.

Os atalhos `/`, `?` e Ctrl+Enter foram **descartados** pelo dono.

## 8. Ordem para aplicar

1. **Contatos** (seção 6.2), porque muda estrutura e permissão. Parar para o dono conferir.
2. **Imóveis e Contratos** (6.3 e 6.4).
3. **Comissões, Cadastros, Corretores, Visão geral, Perfil**, formulários e modais restantes. Ao migrar cada tela:
   - remover eyebrows, "↗" e símbolos soltos;
   - aplicar `contexto` nas dicas;
   - usar `acoes: true` e `linkLinha`.
4. **Comportamentos:** `CampoNumero` → links de imóvel e corretor → guarda de modal → Esc sem modal → Ctrl+K.
5. **Registro:** `PROJECT_STATUS.md`, `TASKS.md`, `DECISIONS.md` e `CHANGELOG_AI.md`, preservando o histórico.
   Separe o QA com API simulada do teste com integração real.

## 9. Verificação

- `npm run typecheck`, `npm run lint`, `npm test` (3 arquivos, 21 testes) e `npm run build`.
- **Prints com a API simulada:**
  1. Crie uma spec temporária em `test-results/prints-temp/`, que é ignorada pelo git. Ela importa `simularApiPainel`
     de `tests/visual/api-simulada.ts`.
  2. Sirva com `node scripts/seo-smoke.mjs --serve` (127.0.0.1:4180). Reinicie o servidor depois de cada build.
  3. **Apague a spec ao terminar**, senão o vitest a recolhe e acusa falha.
- **Conferir em cada tela:**
  - Larguras 390, 768 e 1440, temas claro e escuro.
  - Sidebar sem scroll em 1366×657 e 1440×900.
  - Linhas alternadas, cabeçalho das colunas, ações discretas à direita, dica curta.
  - Clique comum, Ctrl+clique e ação interna que não navega.
  - Teclado e foco visível; sem rolagem horizontal.
  - Contatos: marcar, desmarcar, finalizar e reabrir, este só com ADMIN.
  - Números com vírgula, ponto e colagem.
  - Modais: Esc limpo, dois Esc, Esc + Enter, desarme, valores restaurados, X e clique fora, bloqueio no salvamento.
  - Ctrl+K.
  - Perfis ADMIN e CORRETOR.
- **Site público:** catálogo, detalhe de imóvel e menu, sem mudança além dos ícones.

## 10. Não fazer

- Cor literal em componente; dourado `#c99b3f` em botão do painel.
- Botão dourado com fundo dentro de listagem.
- Nome do registro na dica visível.
- Ícones de contorno ou da fonte do Google.
- Eyebrow em caixa alta.
- Regras do painel fora de `.painel-ui`.
- Correção visual isolada numa tela quando o problema é do componente compartilhado.
- Suítes de teste novas sem pedido do dono (a suíte mínima de 03–04/10 continua valendo).

## 11. Registro de execução — primeiro marco (Codex, 06/10/2026)

Este adendo atualiza o estado da seção 1 sem apagar o snapshot original: a base do parceiro já
foi commitada em `a2a9f81` (`[NEW] Front style and Icons`); o "Nada foi commitado" acima se referia
à redação anterior. A implementação deste marco permanece local, sem commit/push/deploy.

| Parte | Estado atual |
|---|---|
| Base/Pessoas do parceiro | Preservadas; correções compartilhadas de tooltip, dica/erro e espaçamento de modal no painel |
| Contatos (6.2) | Implementado; em revisão do dono, antes de seguir o item 2 da seção 8 |
| Registro documental | Atualizado em AGENTS, PROJECT_STATUS, TASKS, DECISIONS, CHANGELOG_AI, INDICE e plano histórico |
| Demais telas, fichas próprias, CampoNumero, guarda de modal, Esc sem modal e Ctrl+K | Pendentes |

Contatos usa Pendentes/Atendidos e filtro Finalizados. Paginação de cada fila, CSV da página,
filtros de imóvel/período inclusivo UTC-04, mensagem e WhatsApp foram preservados. Transições só
movem após sucesso; falha mantém fila/diálogo e permite retry. A página é ajustada quando perde
o último registro. `IconeFinalizar` já contém o SVG oficial `task_alt`, Outlined/FILL 1.
Permissão de edição/reabertura é compartilhada com Pessoas/EditorPessoa; CORRETOR não consegue
reabrir pelo select, inclusive ao adulterar seu valor. **Essa regra continua só no frontend.**

QA final: typecheck, lint, 21 testes existentes, build e smoke SSR aprovados. Chrome/API simulada:
24 cenários e 38 capturas, com a matriz de Contatos/editor 390/768/1440 claro/escuro em ADMIN/CORRETOR,
navegação, transições, falhas/retry, filtros/CSV e público. Amostras inspecionadas visualmente;
evidências em pasta ignorada `artifacts/area-corretor-2026-10-06/`. A verificação temporária usa
script sem sufixo `.test`/`.spec`, para não entrar no Vitest; scripts temporários retirados ao finalizar,
com resultados/capturas preservados. Nenhuma suíte rastreada foi ampliada.
Integração real e Safari/iOS/dispositivo físico permanecem sem homologação.

Próximo marco exige a conferência visual de Contatos pelo dono, como definido no item 1 da seção 8.
Consultas novas seguirão o plano aprovado com telas próprias e serviços/permissões existentes;
não aplicar a proposta histórica de fichas em modal nem os atalhos descartados.

## 12. Ajustes aprovados pelo dono após revisão — 06/10/2026

O novo pedido e as escolhas explícitas estão em `2026-10-06-ajustes-painel.md`, aprovados para
implementação. Este adendo substitui requisitos conflitantes anteriores: Esc volta à página
anterior interna (fallback lista/Visão geral); seletores dos filtros têm listas estilizadas;
cards mantêm nome à esquerda e valores/ações à direita; menu mobile em tela inteira; origem e
consentimento somente na ficha; filtro sem foto removido. Atendido conserva checkbox e regras.

Essa revisão autoriza os ajustes indicados nas telas existentes e na base compartilhada.
Não equivale à aprovação/conclusão de todas as próximas fases da seção 8.

Implementação/validação local desta revisão concluídas: typecheck, lint, 21 testes, build,
smoke SSR e QA simulado com 63 cenários/59 capturas. Limites e evidência na documentação
da etapa; integração real e Safari/iOS/dispositivo físico continuam sem homologação.

## 13. Conclusão autorizada das specs completas — 06/10/2026

Após o pedido para aplicar as specs ao restante da Área do Corretor, o dono autorizou a
implementação completa, inclusive comportamentos. Isso permite continuar após o checkpoint
de Contatos da seção 8. O estado pendente das seções 1/6/7/11 é histórico e fica substituído:

| Frente | Estado atual |
|---|---|
| Imóveis, Contratos, Comissões, Cadastros, Corretores, Visão geral, Perfil e editores/mídias | Implementados e validados localmente |
| Consultas próprias de imóvel/comissão/classificação/corretor e vínculos de pessoa | Implementadas, conforme serviços e cargo |
| CampoNumero, guarda dirty/busy e Ctrl/⌘+K | Implementados; apenas o atalho aprovado |
| Ajustes do adendo 12 e histórico interno por Esc | Preservados |
| Contexto, decisões, tarefas e changelog | Atualizados preservando snapshots anteriores |
| Integração real, Safari/iOS e dispositivo físico | Sem homologação nesta etapa |

Registro detalhado: `2026-10-06-conclusao-area-corretor.md`. Typecheck, lint, 3 arquivos/21
testes existentes, build e smoke SSR aprovados. QA Chrome/API simulada: 320 cenários,
140 capturas, 320/390/768/1440 claro/escuro ADMIN/CORRETOR, sem erros JS, chamadas inesperadas
ou overflow horizontal. Revisões estáticas e correções verificadas. Índice staged preservado;
sem suite rastreada nova, dependências, backend/dados/migrations ou commit/push/deploy.

## 14. Refinamento autorizado de contatos, perfil e filtros — 06/10/2026

O plano aprovado em `2026-10-06-refinamentos-sistema.md` substitui, neste escopo, as restrições e layouts
dos snapshots anteriores. API também autorizada; identidade azul/dourado, fontes e escala preservadas.

- Seletor: lista por conteúdo limitada à janela; largura base 220px. Não partir palavras; conteúdo longo
  quebra entre palavras. Preservar teclado, foco, Esc e posicionamento acima/abaixo.
- Contatos: lista de largura inteira, abas Pendentes (inicial), Atendidos e Finalizados. Filtros comuns;
  páginas independentes, CSV da página, mensagens e fichas. WhatsApp com SVG/texto; edição/atendimento
  em grupo compacto, na mesma linha em containers amplos. Sem nomes de ação partidos.
- Perfil: Dados e foto / Segurança em duas colunas quando principal >=58rem, uma coluna abaixo.
  Métricas em faixa de três itens a partir de 38rem. Dados unificados, foto 80px e formulários independentes.
- Enviar foto / Usar URL, prévia/substituição/remoção pendentes até Salvar perfil; guarda/busy incluem
  arquivo. JPG/PNG/WebP até 30 MiB antes de compressão; API limita a 10 MiB e valida assinatura/origem.
- Filtros existentes: seleções/datas/registros/abas imediatos; digitação após 350 ms. Buscar/Enter
  antecipam sem duplicar. Erros conservam último resultado válido; chips/limpeza são imediatos.
  Público: rascunho controlado, URL/SSR, replace automático, histórico da paginação e foco/scroll estáveis.

Typecheck, lint, builds, 21 testes e smoke SSR aprovados; QA Chrome simulado 23 cenários/32 capturas
em 320/390/768/1440, claro/escuro, sem overflow. Upload HTTP simulado e R2 temporário real verificados
separadamente; perfil real no Neon, Safari/iOS e aparelho físico ainda sem homologação.
System Design: seis páginas verificadas, original do template preservado. Sem publicação/migrations.


---

## Arquivo original: 2026-10-06-refinamentos-sistema.md

# Refinamento de contatos, perfil e filtros — plano autorizado

Pedido do dono em 06/10/2026: corrigir quebras de texto, Contatos em abas, WhatsApp com ícone,
perfil em grid compacto, upload real da foto e filtros automáticos no público e painel.
Implementação local nos dois repositórios, preservando trabalho anterior, sem publicação/migration.

## Execução

- [x] Seletores e Contatos: largura por conteúdo, abas, paginação independente e ações compactas.
- [x] Filtros: seleções imediatas, digitação 350 ms, validação e sincronização de URL/SSR.
- [x] Perfil: grid compacto, prévia, arquivo/URL, guarda e formulários independentes.
- [x] API: PATCH JSON/multipart, R2 compartilhado, compensação e leitura pública controlada.
- [x] Validar comandos, cenários HTTP/browser e render do documento System Design.
- [x] Atualizar contexto e índice dos dois repositórios sem apagar histórico.

## Decisões de execução

- O plano da conversa é a especificação vinculante. Execução direta na main foi autorizada;
  instruções do projeto e pedido atual prevalecem sobre worktree/commits da skill.
- Não recriar suítes rastreadas: cenários novos ficam em artifacts ignorados. API sem suíte fonte;
  frontend conserva os três arquivos atuais. Não usar resultados históricos como prova desta entrega.
- Manter url_foto HTTPS no banco; exibição usa rota da API por id/revisão, inclusive para URLs externas.
  Evita migration, URLs temporárias e mudança na política do bucket privado.

## Validação

Concluída localmente em 06/10/2026. Homologação de uma conta real e aceite visual do dono
permanecem como etapas posteriores, sem impedir a entrega local autorizada.

| Verificação executada | Resultado e alcance |
| --- | --- |
| `npm run typecheck`, `npm run lint`, `npm run build` nos dois repositórios | Aprovados. Build do frontend mantém os avisos já existentes de anotações do Zod/Rollup. |
| `npm test -- --maxWorkers=1 --reporter=dot` no frontend | 3 arquivos existentes, 21 testes aprovados; nenhuma suíte fonte nova. |
| `npm test -- --runInBand --passWithNoTests` na API | Saída 0, sem testes encontrados; não representa cobertura por suíte da API. |
| `node scripts/seo-smoke.mjs` no frontend | SSR, metadados, paginação, 404, descoberta, proxy com cookies, função Vercel em Node isolado e recuperação de indisponibilidade aprovados. |
| HTTP efêmero, controllers/DTO/interceptors/serviços reais | 22 cenários aprovados com R2 e repositório simulados. Guard de sessão sintético; OrigemGuard real. |
| Reprodução de foto concorrente | URL gerenciada obsoleta recebe 409; foto atual permanece registrada e armazenada. |
| Navegador Chrome, frontend de produção e API isolada | 22 cenários funcionais e uma matriz visual aprovados (23 registros), sem erros inesperados. |
| Matriz visual | 32 capturas: Contatos, Perfil, Pessoas e Catálogo × 320/390/768/1440px × claro/escuro; sem overflow horizontal. |
| R2 real, objeto temporário isolado | Envio, leitura byte a byte e exclusão confirmados; leitura posterior retornou ausência do objeto. Sem gravação de avatar no banco. |
| System Design | 6 páginas renderizadas e todas inspecionadas visualmente; template original preservado, estilos/geometria mantidos. |
| Integridade dos repositórios | `git diff --check` aprovado; patch do índice preexistente da API preservado byte a byte. |

### Comportamentos conferidos

- Seletores: rótulos extensos, largura pelo conteúdo, posicionamento acima/abaixo, teclado e Esc.
  Contatos: abas com páginas independentes, CSV da página, edição/atendimento/finalização,
  reabertura por ADMIN no frontend e falha com nova tentativa.
- Filtros: espera de 350 ms, seleção durante espera, Enter sem duplicata, limpeza e chips,
  intervalos inválidos conservando resultados, URL direta, voltar/avançar, foco e scroll preservados,
  respostas antigas descartadas. Imóveis, Pessoas, Contatos e Contratos usam a lógica compartilhada.
  Comissões e Cadastros conservam a filtragem automática existente.
- Perfil: prévia local, troca entre arquivo/URL, substituição, remoção somente ao salvar, guarda de
  alterações e bloqueio durante envio. Salvar dados/foto preserva a senha digitada no formulário
  independente. Sessão e exibição da foto são atualizadas após sucesso.
- API: JSON compatível, multipart exclusivo com um arquivo, origem, tipos/assinatura, arquivo vazio,
  limite de 10 MiB e arquivo adicional; falhas de R2/banco, compensação, ordem Put → banco → Delete,
  URL externa preservada, corretor inativo sem foto pública e chaves arbitrárias ignoradas.

### Ajustes encontrados durante a revisão

As reproduções iniciais expuseram perda de foco ao mudar a URL do catálogo, limpeza ineficaz
quando somente a página estava alterada, validação numérica dependente do DOM anterior ao commit
e risco de restaurar uma foto antiga de outra aba. As correções foram verificadas novamente:
catálogo permanece montado, limpeza reinicia a URL, validação usa o rascunho e o estado de entrada,
frontend omite `url_foto` quando não foi editada e API rejeita referência gerenciada obsoleta.
Na conferência visual, os campos do perfil foram alinhados e as ações de Contatos reunidas em
uma linha em containers amplos. Falhas iniciais do roteiro/fixture foram corrigidas no próprio
roteiro e não usadas como evidência de defeito do produto.

### Limites da homologação

O armazenamento foi verificado no R2 real com objeto temporário, posteriormente removido.
Fluxos HTTP/browser usaram banco e autenticação isolados; não houve login real, gravação de avatar
no Neon ou homologação conjunta login → upload → persistência → proxy. Também não houve teste
em aparelho físico ou Safari/iOS. Esses limites estão registrados no status e no System Design.
Falha de exclusão de um objeto gera log para tratamento operacional; não desfaz perfil confirmado.

## Entrega e referências

Alterações permanecem locais, sem commit, push, deploy ou migrations. Os arquivos de catálogo e
o índice preexistentes da API foram conservados; mudanças de documentação são aditivas.
Roteiros e capturas de QA ficam somente em `artifacts/refinamentos-2026-10-06/`, ignorados pelo Git,
e os servidores temporários foram encerrados.

- [Especificação visual atualizada](2026-10-06-painel-especificacao-visual.md)
- [System Design — documento editável](2026-10-06-system-design.docx)
- [Contrato da foto na API](../../Corretor-API/docs/2026-10-06-foto-perfil.md)
- [Índice da documentação](INDICE.md)


---

## Arquivo original: 2026-10-09-padronizacao-painel.md

# Padronização visual do painel — 09/10/2026

## Pedido e escopo autorizado

Após aprovar a ficha de imóvel com títulos externos e cards alinhados, o dono pediu padronizar o painel inteiro, considerando todas as telas como referências. A entrega harmoniza o acabamento sem substituir suas composições. Abrange entrada, Visão geral, listas, fichas, Perfil, formulários e diálogos. Trabalho somente no frontend, local em main, preservando o trabalho anterior; sem commit, push, deploy, dependências, API, tipos ou banco.

## Padrão aplicado

- `SecaoPainel`: título externo associado à seção e superfície independente. `GradePainel`: container nomeado, 1/2/3 colunas em 44/70rem e subgrid de títulos/conteúdo; cards têm a altura do maior conteúdo da linha. Grades de dois blocos permanecem com até duas colunas.
- `DadosFicha` e `DadoFicha`: rótulo/valor compactos, campos ausentes explícitos, links e conteúdo React preservados. Duas colunas apenas quando a própria superfície comporta os campos.
- Fontes e escala 28/22/18/16/14 mantidas; azul/dourado, raio 5px, detalhe superior dourado de 3px e sombra leve. Gap 16px e padding 16–20px; sem alturas fixas, cortes ou recolhimento novo dos dados.
- Listas mantêm tabelas/linhas alternadas e cartões por largura do container, com ações à direita. Busca, filtros, chips, contagens e estados recebem classes comuns; nenhum filtro/controle ausente foi criado. Tabelas aninhadas não repetem o detalhe dourado/sombra da superfície externa.
- Novo, Editar e Buscar usam ícone e dica acessível. Salvar, Cancelar, confirmações, CTAs de seção e ações financeiras conservam texto. Alvo de toque dos chips mínimo de 44px.
- Fichas organizam os dados por assunto; textos têm seção própria. A ficha de imóvel conserva galeria/resumo 2:1, ordem dos blocos, características, links e dimensões locais aprovadas, passando a usar a seção compartilhada.
- Formulário de imóvel conserva seis seções, números e âncoras; editores mantêm selects, validações, grupos recolhíveis e rodapés. Perfil/foto e senha conservam formulários independentes. Título do diálogo continua no cabeçalho interno.

Todos os estilos novos são restritos a `.painel-ui`. A entrada aplica esse escopo somente na área do formulário. Esc, Ctrl/⌘+K, menu mobile, foco, guardas dirty/busy, ações, permissões, consultas e contratos de dados permanecem ativos.

## Verificação executada

| Verificação | Resultado |
|---|---|
| `npm run typecheck` | Aprovado |
| `npm run lint` | Aprovado |
| `npm test` | 3 arquivos / 23 testes aprovados |
| `npm run build` | Cliente, SSR e Vercel Output gerados |
| Smoke SSR efêmero | Metadados, paginação, 404, discovery, streaming/cookies, runtime Vercel e 503/recuperação aprovados |
| `git diff --check` | Aprovado |
| Layout integrado | 270 cenários aprovados |
| Formulários/login/estados | 49 cenários aprovados |
| Listas/Esc/paleta/menu | 5 fluxos aprovados |
| Regressão da ficha de imóvel | 28 cenários e 2 fluxos aprovados novamente |

Layouts conferidos em 320/390/1024/1440/1920px, nos dois temas e cargos ADMIN/CORRETOR. Foram incluídos títulos quebrados, dados longos, campos ausentes e registros arquivados. Superfícies sem overflow e com topo/base alinhados por linha; títulos externos associados. Formulários incluem perfil/senha independentes, foto pendente, banco recolhível, validações, confirmações financeiras, guardas e envios simulados. Login cobre campos vazios, erro401, bloqueio durante envio e preservação de campos/foco; Pessoa/Contrato têm cabeçalhos sem ações de edição durante carga/erro.

Capturas selecionadas de desktop/mobile nos dois temas inspecionadas. Na revisão final, chips recuperaram o mínimo de 44px, métricas do Perfil passaram à grade comum, dados em duas colunas perderam padding/divisórias desiguais e tabelas internas ficaram com borda simples. Ajustes seguidos de build/checks/QA; nenhuma suíte rastreada criada.

Evidências locais ignoradas: `artifacts/painel-padrao-2026-10-09/resultados-finais.json`, capturas/harness na mesma pasta, `artifacts/imovel-alinhamento-2026-10-09/resultados.json` e smoke em `artifacts/esc-foco-2026-10-09/seo-smoke-atual.mjs`. Diagnósticos iniciais de seletores/expectativas de QA preservados, com repetições aprovadas separadamente. Avisos de build existentes: PURE do Zod e chunk cliente de 505,56kB acima do limite de 500kB.

## Limites da entrega

QA com API simulada e navegador Chromium, sem gravações em serviço real. Login real, Neon, R2, Drive, pagamentos reais, reprodução de vídeo real, Safari/iOS e dispositivo físico não homologados. Nenhuma mudança de contrato, API/banco, dependência, commit, push ou deploy. Documentos de contexto e índice atualizados preservando todo o histórico.


---

## Arquivo original: AGENTS.md

# Instruções do projeto — corretor-web

## 2026-10-09 — Ações de tabela sem quebra no desktop

Na tabela desktop, a coluna de ações deve manter ícones de 44px na mesma linha, com largura determinada pelo conteúdo. `Tabela.tsx` usa `flex-nowrap`/`min-w-max` apenas a partir de 40rem; os cartões mobile continuam com `flex-wrap` e sem overflow horizontal. Não usar largura fixa insuficiente na coluna de Contatos. Preservar tooltips, permissões, callbacks, linha clicável e ações financeiras com texto.

## 2026-10-09 — Padronização visual de todo o painel

Plano integral autorizado pelo dono, tomando todas as telas existentes como referências. A orientação de limitar as notas apenas ao imóvel abaixo permanece histórica: agora o acabamento comum vale para listas, fichas, Visão geral, Perfil, formulários, diálogos e entrada administrativa. Usar `BlocosPainel.tsx`: `SecaoPainel` associa título externo à seção; `GradePainel` compartilha alturas de título/superfície por subgrid; `DadosFicha`/`DadoFicha` preservam conteúdo e links. Classes próprias sempre em `.painel-ui`. Manter fontes/escala 28/22/18/16/14, azul/dourado, gaps 16px, superfícies com padding 16–20px e altura determinada pelo conteúdo.

Grade por container: 1 coluna abaixo de 44rem, 2 a partir de 44rem, até 3 a partir de 70rem. Composições de duas colunas usam `colunas={2}`; formulários longos mantêm suas seções, âncoras e grades de campos. Não transformar título do diálogo em título externo, adicionar filtros/controles ausentes, recolher dados de ficha ou cortar conteúdo. Novo/Editar/Buscar continuam só ícone com dica acessível; Salvar/Cancelar/confirmações/ações financeiras conservam texto. Chips têm alvo mínimo de 44px. Tabelas preservam linhas alternadas e cartões com ações à direita; quando dentro de outra superfície, apenas a superfície externa recebe detalhe dourado/sombra.

`FichaImovel` usa o mesmo `SecaoPainel`, mantendo modificadores locais, ordem, subgrid aprovado e dimensões exclusivas da galeria em utilities. Preservar Esc, Ctrl/⌘+K, guardas dirty/busy, permissões, seleções, formulários independentes de perfil/senha e consultas em edição sem permissão. Não alterar API, tipos, banco, dependências, site público ou suítes rastreadas. Entrega local em main; sem commit, push ou deploy. Resultado e validação: `2026-10-09-padronizacao-painel.md`; QA novo efêmero/ignorado.

## 2026-10-09 — Títulos externos e cards alinhados por linha

Correção pedida e plano autorizado pelo dono após revisão visual: títulos acima das superfícies, mesma altura dos cards dentro de cada linha. Esta orientação substitui a altura independente e os títulos internos da primeira versão abaixo. `Nota` usa seção `.imovel-bloco`, título associado por `aria-labelledby` e superfície `.imovel-nota`. Os grids compartilham linhas de título/conteúdo por subgrid; preservar quebras de título, leitura integral dos dados, containers e layout mobile. Não impor alturas fixas ou cortes nos cards. Modificadores da galeria/descrição/ficha interna permanecem na seção; seletores da galeria respeitam a superfície intermediária. Sem alterações de API/dados ou publicação; QA novo permanece efêmero/ignorado.

Ficha interna vem antes da Descrição, preenchendo a grade sem reordenar pelo CSS. Regras locais de dimensão da galeria devem continuar em `@layer utilities`: em components perderiam para as classes de altura/largura de `GaleriaMidia`. Preservar seu escopo exclusivo da ficha.

## 2026-10-09 — Ficha do imóvel em notas compactas

Plano autorizado pelo dono: `FichaImovel` usa galeria/resumo no topo e notas separadas em azul/dourado. Preservar todos os campos, links, permissões, ações, Esc e consulta na edição sem permissão. Estilos `.imovel-*` são exclusivos da ficha dentro de `.painel-ui`; não alterar `GaleriaMidia`, estilos gerais das fichas ou detalhe público para reproduzir esse layout. Grades seguem containers nomeados: 44rem para duas colunas e 70rem para três; ficha interna distribui campos conforme o espaço da própria nota. Sem dependências, API, banco ou publicação. QA efêmero em `artifacts/imovel-notas-2026-10-09`, sem novas suítes.

## 2026-10-08 — Codex: 404 da foto corrigido na implantação

O dono autorizou resolver pela página aberta do Render usando Computer Use. Confirmado commit ativo antigo e3b0a32; implantação manual do origin/main 86ecf29 concluída (Deploy succeeded/Live), serviço srv-daj21e15efls73fab4gg, deploy dep-db4684m0tbcc73d9jtr0. Este registro substitui a pendência de acesso/publicação do diagnóstico abaixo.

URL original /api/corretores/1/foto?v=1f6h7x3 agora responde 302; seguindo redirect, HTTP 200 image/jpeg, 22322 bytes. /api/v1/saude da API retorna status ok. Perfil aberto recarregado para verificar a correção. Sem alterações funcionais, migrations, gravação de dados, commit ou push; documentação histórica preservada. Conector Render segue indisponível, mas sessão do navegador permitiu corrigir a implantação.


## 2026-10-08 — Diagnóstico da rota de foto publicada

GET da foto publicado retornou Cannot GET nos caminhos legado e versionado. Código local/GitHub da API (86ecf29) já registra FotoCorretorController; build e proxy local aprovados com banco/storage simulados. Conferir commit/build/start do Render antes de alterar a implementação; preservar bucket privado e urlFotoCorretor. Conector exige reautenticação; publicação e foto real continuam pendentes.


## 2026-10-06 — Refinamento autorizado de contatos, perfil e filtros

Estado vigente em `2026-10-06-refinamentos-sistema.md`; System Design em `2026-10-06-system-design.docx`.
Este pedido autoriza os dois repositórios e amplia o PATCH do perfil, substituindo a restrição frontend
dos snapshots abaixo somente neste escopo. Entrega local: sem commit, push, deploy ou migrations.
Preservar fontes, azul/dourado, escala de texto, permissões, Esc e Ctrl/⌘+K. Contatos agora usa abas;
reabertura de finalizados continua exclusiva de ADMIN na interface, sem nova restrição na API.
Filtros usam `useFiltrosAutomaticos`: 350 ms para texto, seleção imediata, normalização e validação.
Manter Catalogo montado entre mudanças de filtro; usar replace automático e histórico na paginação.
Foto: prévia/arquivo são pendentes até Salvar perfil; não reenviar url_foto não editada. Exibir por
`urlFotoCorretor`, respeitando base/proxy. Não resetar o formulário de senha ao salvar dados.
Não recriar suítes: QA novo efêmero/ignorado. Distinguir simulação de banco de homologação real.
R2 real foi verificado com objeto isolado temporário; nenhum avatar foi gravado no Neon.

## 2026-10-06 — Orientação vigente após conclusão local da Área do Corretor

O dono autorizou as specs completas, incluindo as etapas posteriores a Contatos. Implementação
e validação local concluídas: `2026-10-06-conclusao-area-corretor.md`. Esse estado substitui as
pendências e o checkpoint de revisão dos registros anteriores, que permanecem como histórico.
Fichas novas são telas próprias; CampoNumero, guarda dirty/busy e Ctrl/⌘+K estão ativos.
Preservar `.painel-ui`, escala 28/22/18/16/14, selects dos editores, histórico interno por Esc,
permissões e DTOs. CORRETOR não consulta endpoints administrativos de corretores/classificações.
Guardar id/referência inicial ao restaurar seleções; Cancelar de editores usa data-fechar-dialogo.
Somente Ctrl/⌘+K; não reintroduzir atalhos descartados ou fichas em modal. Integrações reais
e Safari/iOS/celular continuam sem homologação. Manter main, índice, escopo frontend e ausência
de publicação/suítes novas sem pedido. QA efêmero e prints ficam ignorados em artifacts/.

## 2026-10-06 — Ajustes aprovados após a revisão de Contatos

O dono aprovou `2026-10-06-ajustes-painel.md`. Esc agora retorna à página anterior do painel,
com fallback para lista/Visão geral e prioridade das camadas abertas; substitui a regra anterior
de retorno sempre hierárquico. Usar SeletorFiltro nas listas dos filtros, mantendo selects dos
editores. Cards: nome à esquerda, valores e ações à direita. Menu mobile ocupa a tela inteira;
origem/consentimento somente na ficha e filtro “Só sem foto” removido. Preservar histórico,
main, índice preexistente e escopo frontend. Não ampliar suítes ou publicar sem pedido.

## 2026-10-06 — Orientação vigente para a retomada do painel

O dono autorizou implementar o plano a partir de `a2a9f81`. Ler
`2026-10-06-painel-especificacao-visual.md`: ela substitui o plano anterior revertido e os padrões
conflitantes das entradas históricas abaixo. Pessoas continua como referência; escopo `.painel-ui`,
escala 28/22/18/16/14, tabelas/cartões por container de 40rem e apenas Ctrl/⌘+K nas próximas fases.

Primeiro marco implementado: Contatos, agora em revisão do dono antes das demais telas (seção 8).
`src/servicos/pessoas.ts` centraliza edição por responsável/ADMIN e reabertura só por ADMIN no
frontend; preservar isso no editor e em novas ações. Não afirmar que a regra de reabertura está
garantida pela API. Dicas do painel usam popover; mudanças compartilhadas devem preservar o público.

Fichas próprias, CampoNumero e guardas/atalhos permanecem pendentes. Não reutilizar as antigas
implementações revertidas nem ampliar os 3 arquivos/21 testes sem pedido. QA efêmero e capturas
ficam em pasta ignorada; resultados simulados e homologação real devem ser registrados separadamente.
Main e restrições a dependências/API/dados/migrations/publicação continuam vigentes.

## Contexto

Front do sistema de corretor de imóveis comerciais: catálogo público, detalhe de imóvel, captação de leads com
consentimento LGPD e painel administrativo. React 18 + TypeScript estrito + Vite 7 + React Router 7,
formulários com react-hook-form e zod. Desde `d4f6b2f` existe um **servidor SSR próprio** em `src/seo/` e
`scripts/*.mjs`, que renderiza as páginas públicas, gera metadados, JSON-LD, `robots.txt`, `sitemap.xml` e
`llms.txt`, e faz proxy de `/api` para a API. Node `>=24 <25`.

Repositório irmão: **corretor-api** (NestJS + TypeORM + Neon + R2), em `../Corretor-API`.
Os dois compartilham `corretor-spec.json` e o `PLANO-PROJETO-CORRETOR.md`, e cada um mantém a sua cópia
dos arquivos de contexto descritos abaixo.

## Comandos

| Ação | Comando | Precisa da API |
|---|---|---|
| Instalar dependências | `npm ci` | não |
| Desenvolvimento (SSR) | `npm run dev` → `127.0.0.1:5173` | sim |
| Build de produção | `npm run build` → `dist/` e `.vercel/output` | não |
| Servir o build | `npm run preview` → `127.0.0.1:4173` | sim |
| Testes | `npm test` (vitest) | não |
| Lint | `npm run lint` | não |
| Tipos | `npm run typecheck` | não |
| Suíte visual (prints + layout + orçamento de requisições) | `npm run visual` (ou `visual:sem-build`) | não (API simulada) |
| Revisão visual / medição com subagente | `/revisar-design <tela>` e `/medir <tela>` (em `.claude/`) | não |

## Variáveis de ambiente

| Variável | Onde vale | Função |
|---|---|---|
| `VITE_API_URL` | navegador (embutida no bundle) | base das chamadas; use `/api`, que o servidor repassa à API |
| `API_ORIGIN` | servidor SSR | origem da API, só esquema e host, sem caminho; usada no proxy e nas buscas do SSR |
| `API_PROXY_TARGET` | servidor SSR (desenvolvimento) | alternativa ao `API_ORIGIN` em desenvolvimento |
| `SITE_URL` | servidor SSR | origem pública do site; **sem ela não há canonical nem JSON-LD** |
| `SEO_INDEXABLE` | servidor SSR | `true` libera `index,follow`; exige `SITE_URL` e `API_ORIGIN` em HTTPS, `NODE_ENV=production` e fora de preview |

Nunca coloque segredo em variável `VITE_*`: tudo que tem esse prefixo vai para o bundle do navegador.

## Regras

**Dados e integração**
- Todas as chamadas à API passam por `src/servicos/api.ts` (e `locacoes.ts`). Não use `fetch` direto em componente.
- O access token fica só em memória (`src/servicos/http.ts`). Não grave token em `localStorage` nem em cookie pelo front.
- O refresh é feito por cookie `httpOnly` enviado pela API. Não tente ler esse cookie no navegador.
- Uma renovação de sessão por vez: o cliente já compartilha a promessa de refresh. Não crie outro caminho de renovação.
- Em desenvolvimento e preview, `API_ORIGIN` deve apontar para localhost ou loopback; origens remotas são bloqueadas.

**SSR**
- Todo componente usado em rota pública precisa renderizar no servidor: nada de acessar `window`, `document` ou
  `sessionStorage` durante a renderização. Use efeito ou verificação de ambiente.
- Dados de página pública vêm do bootstrap do SSR; mantenha o contrato de `src/seo/context.tsx` e `src/seo/metadata.ts`.
- Ids são inteiros; o slug público termina no id e o SSR redireciona (301) quando o título mudou.
- Ao criar rota pública nova, trate também: metadados, canonical, entrada no `sitemap.xml` e comportamento em 404.
- O painel (`/admin/*`) não é renderizado no servidor e permanece `noindex`.

**Código**
- TypeScript estrito, sem `any` e sem `@ts-ignore`.
- Validação de formulário só com react-hook-form + zod. Não introduza outra biblioteca de validação.
- Estilos em Tailwind v4 com os tokens do `@theme` (`src/styles/tailwind.css`); não há CSS Modules. Sem cores
  literais nos componentes. Grades internas do painel e dos modais usam container query (`@container`), não
  breakpoints da janela. Todo modal usa o componente `Dialogo`.
- Não adicione dependência sem justificar em `DECISIONS.md`.
- Imagens enviadas pelo painel são comprimidas no navegador antes do upload; mantenha os limites atuais.

**Fluxo de trabalho**
- Nunca comite `.env`, `dist/`, `.vercel/` ou artefatos de build (já estão no `.gitignore`).
- Este projeto trabalha **direto na `main`**, sem branches paralelas (decisão do dono em 11/09/2026).
  Antes de commitar: rode os testes, confirme com o dono e nunca inclua segredo no commit.
- Rode `npm run typecheck`, `npm run lint` e `npm test` depois de qualquer mudança relevante, e registre o resultado.
- Mudança que afeta SEO ou SSR exige conferência manual: catálogo, detalhe de imóvel, `robots.txt`, `sitemap.xml` e uma rota inexistente.
- Antes de implementar, leia `PROJECT_STATUS.md`, `TASKS.md`, `DECISIONS.md`, o último registro de `CHANGELOG_AI.md`
  e, para regras de produto, `corretor-spec.json`.

## Protocolo entre agentes

Antes de trabalhar:

1. Ler `docs/PROJECT_STATUS.md`, `docs/TASKS.md`, `docs/DECISIONS.md` e o último registro de `docs/CHANGELOG_AI.md`.
2. Verificar o estado do Git: `git status`, `git log --oneline -5` e se a branch está sincronizada com o remoto.
3. Conferir em `docs/PROJECT_STATUS.md` se outro agente já assumiu a mesma área.
4. Atualizar `docs/PROJECT_STATUS.md` com a tarefa assumida, o seu nome e a data.

Depois de trabalhar:

1. Atualizar `docs/PROJECT_STATUS.md`.
2. Registrar decisões relevantes em `docs/DECISIONS.md`, com motivo e o que não fazer.
3. Registrar em `docs/CHANGELOG_AI.md` a tarefa, os arquivos alterados, os testes executados com o resultado real e as pendências.
4. Informar riscos e o que ficou sem teste.

Divisão sugerida de papéis:

| Etapa | Agente | Responsabilidade |
|---|---|---|
| Planejamento | Claude | Entender o problema, propor arquitetura e critérios de conclusão em `TASKS.md` |
| Implementação | Codex | Alterar código, criar testes e executar os comandos |
| Revisão | Claude | Ler o diff, procurar bugs e falhas de segurança, registrar em `CHANGELOG_AI.md` |
| Correções | Codex | Aplicar os ajustes da revisão |
| Validação final | Ambos | Conferir testes, build e estado do Git |

Não deixe os dois agentes editando a mesma área ao mesmo tempo.

## Mapa do código

```text
index.html            # casca com marcadores <!--seo-head-->, <!--app-html--> e <!--bootstrap-->
scripts/dev.mjs       # servidor SSR de desenvolvimento sobre o Vite em modo middleware
scripts/build.mjs     # build do cliente e do SSR, e geração de .vercel/output (Build Output API v3)
scripts/preview.mjs   # serve o build com o mesmo runtime
scripts/runtime.mjs   # proxy /api → API_ORIGIN (remove o prefixo /api) e renderização das páginas
src/seo/              # server.tsx (rotas SSR, robots, sitemap, llms), metadata.ts (títulos, OG, JSON-LD), context.tsx, fixture.ts
src/tipos/            # domínio em português, igual ao contrato HTTP (Imovel, FichaImovel, Pessoa, Corretor, Pagina)
src/servicos/         # http.ts (token em memória, renovação única), api.ts, locacoes.ts, catalogo.ts, urls.ts, contato.ts, formato.ts, validacao.ts
src/paginas/publico/  # Catalogo, DetalheImovel, Privacidade, Devs
src/paginas/painel/   # LayoutPainel, Entrar, VisaoGeral, Imoveis, FormularioImovel, Contatos, Pessoas, FichaPessoa, Corretores, Cadastros, Contratos, DetalheContrato, Comissoes, Perfil
src/componentes/      # LayoutPublico, CartaoImovel, GaleriaMidia, FormularioContato, GerenciadorMidia, SelecaoMidia, SeletorRegistro, CabecalhoPagina, Tabela, Etiqueta, Dialogo, Paginacao, EstadoCarregamento, LimiteErro
src/hooks/            # useSessao, useRecurso, useDadosPainel, useTema, useGuardaFormulario
```

Vocabulário: código, tipos, nomes de arquivo e rótulos em português, com os mesmos nomes de campo do contrato da API
(`snake_case`). Não reintroduza tradutores de contrato nem nomes em inglês para o domínio.

## Serviços externos

| Serviço | Situação |
|---|---|
| API (corretor-api) | local em `http://localhost:3000`; ainda não publicada |
| Neon e Cloudflare R2 | ativos e homologados; ver `docs/handoffs/2026-09-11-infra-neon-r2.md` |
| Vercel | não criada; conferir a restrição de uso comercial do plano Hobby antes de publicar |

## 2026-09-14 — Instruções vigentes após refatoração integral

O pedido integral do dono em docs/specs/2026-09-13-backend-integral.md prevalece sobre instruções antigas conflitantes deste arquivo. Contrato e operação atual: docs/handoffs/2026-09-14-backend-portugues.md. Backend em português, auditoria universal, soft delete, dados pessoais em colunas sem cifra; documentos novos no Drive compartilhado privado e receita em comissões. Modelos antigos só permanecem nas migrations/histórico.

Migration 1789516800000 exige complementos reais e backup; use apenas os comandos npm documentados (executor sanitizado). Não editar migrations aplicadas nem imprimir dados privados. A chave antiga é necessária só para decifrar o legado na migração. Nenhuma migration/deploy automático. Cookie Secure exige HTTPS no navegador. Adaptar frontend e health check /api/v1/saude antes da publicação conjunta. main e regra de confirmação antes de commit continuam vigentes.

## 2026-10-03 — Base compartilhada do frontend

`src/componentes/AcaoIcone.tsx`, `Campo.tsx`, `Aviso.tsx` e `ConfirmarAcao.tsx` integram a base de UI.
Ações auxiliares usam ícone com nome contextual/dica e alvo de 44px; salvar, criar, buscar, WhatsApp
e transições de atendimento conservam texto. Campos têm no mínimo 16px; use Campo para ligar
rótulo/dica/erro ao controle e Aviso com tokens de estado. Tabela mostra os mesmos dados em cartões
abaixo de 40rem de container, com quebra de textos longos.

ConfirmarAcao não fecha automaticamente após resolver: o consumidor fecha ou avança a etapa só
quando obtém sucesso. Erros mantêm o diálogo aberto e ocupado bloqueia nova ação/fechamento.
Dialogo aceita `data-foco-inicial` em um descendente para foco após showModal; Cancelar é o padrão
das confirmações. Preserve a guarda de edição, o rascunho por aba e as duas etapas da duplicação.

Por pedido do dono, as suítes fonte foram removidas em 03/10/2026; consultar DECISIONS.md.
Não recriar suítes sem novo pedido nem alegar que npm test sem arquivos passou. Smoke existente
e verificações efêmeras com API simulada são documentados em CHANGELOG_AI.md; não equivalem
a homologação de API/serviços reais. Main e confirmação antes de commit continuam vigentes.

## 2026-10-03 — Espera pública e recuperação do 503

`PaginaIndisponivel`, `CenaReparo` e `useRecuperacaoPagina` cuidam do bootstrap público 5xx.
SSR/primeiro render e modo sem JS são estáticos; no cliente há loop silencioso com pausa e
movimento reduzido. A pausa da cena não interrompe a verificação da página.
Sondagem HEAD da mesma URL em `verificarPaginaPublica` (`api.ts`), primeira após 30s e próxima
30s depois da conclusão, uma por vez e limite 50s. Saúde isolada não permite declarar recuperação.
200/404 recarregam a URL atual; erros conservam a espera. Sair/trocar URL/ocultar/offline cancela
e invalida respostas; retomar aguarda 30s. Não aplicar o retorno de 8s da 404 a essa espera.
Preservar HTTP 503/SEO/no-store/Retry-After e orçamento SSR; sem keep-alive ou alteração de infra.

## 2026-10-03 — Catálogo persistente no Neon

A carga autorizada acrescentou 12 anúncios ilustrativos e 36 mídias ao banco da API. Não confundir
persistência real com oferta comercial confirmada: preços, áreas, características e endereços são
sintéticos; cada descrição identifica imagens/endereço de referência. Fontes/licenças em
`../Corretor-API/docs/2026-10-03-fontes-catalogo.md`. O cliente público continua usando a API normal,
sem fixture nem modo demo. A URL pública do bucket R2 respondeu 401; o seed mantém uma cópia dos
arquivos no R2 privado e grava URLs HTTPS da Unsplash no campo público da mídia. Não habilitar o
bucket publicamente sem decisão de infraestrutura. Reexecução `npm run seed:catalogo:executar`
reconcilia essas URLs apenas nos IDs e chaves do lote. Não alterar nem remover os 4 imóveis
anteriores, nem commitar/publicar sem autorização expressa. Ver `CHANGELOG_AI.md`/`TASKS.md` para
validação, credencial administrativa em pasta local restrita e limites desta carga.

## 2026-10-04 — Suíte mínima

Depois da revisão externa, 
pm test voltou a ter 3 arquivos em src/servicos/ (contato/LGPD, URL de filtro, valores e catálogo de exemplo). Não ampliar nem recriar as demais suítes sem novo pedido; 
pm run visual segue sem specs. Dados de demonstração: catalogoExemplo() em src/seo/fixture.ts. Índice da documentação: docs/INDICE.md.



## 2026-10-05 — Área do Corretor: ícones, teclado e fichas

O painel usa navegação compacta por ícones e seções abertas. Ações auxiliares devem reutilizar AcaoIcone (tipo submit nos filtros); confirmações, salvar e operações financeiras conservam texto. DicasPainel fornece tooltip por foco/hover a botões e destinos dentro de data-area-corretor, com aria-describedby, camada popover e posicionamento limitado à janela. Não depender de title nem adicionar outro listener global de Esc aos controles do painel.

Dialogo aceita alterado e ocupado: derivar alterado do isDirty do react-hook-form, marcar shouldDirty em seleções programáticas e guardar valores iniciais no defaultValues. Esc intacto fecha; alterado arma aviso e segundo Esc consecutivo descarta, sem prazo. Outra tecla, input ou clique desarma. Botões Cancelar de editores usam data-fechar-dialogo; fechar/clique externo pedem confirmação quando alterado. Ocupado bloqueia fechamento. Prioridade: tooltip, seleção aberta, modal superior, navegação. Não reverter operações já persistidas.

useAtalhosPainel controla Ctrl/Command+K, /, ?, Ctrl/Command+Enter e retorno com Esc. Somente formulários de edição seguros usam data-atalho-salvar; jamais marcar recebimentos ou criação financeira. Buscas de filtro usam data-busca-painel. O atalho consome Enter também quando a ação não é permitida. FichasPainel consulta dados disponíveis pela API atual; não completar perfil com chamadas privilegiadas. EntradaNumero preserva decimal textual durante edição e conversão no esquema de cada tela; não usar valueAsNumber em input text. Perfil e imóvel mantêm guarda de edição.

## 2026-10-06 — Conforto visual da Área do Corretor

Esta revisão substitui a direção anterior de sidebar sem nomes: usar sidebar de 260px com ícone e nome, inclusive no menu mobile. Textos principais 18px, auxiliares 16px, títulos principais/modal 20px e subtítulos 18px. Preservar fontes e catálogo público. Estilos compartilhados ficam no escopo data-area-corretor; tokens de ação #b3892d / hover #b18424, desenho branco e texto azul #0a2042. Ações destrutivas conservam vermelho com contraste.

Novo/Filtrar/WhatsApp/Responder usam ícone e texto; AcaoIcone aceita texto opcional. Editar/ver ficha mantêm tooltip. Botões com raio 12px, alvo mínimo 48px, ícones 23px; campos outlined, rótulos acima e fonte 18px. Contatos usam blocos suaves; tabelas passam à apresentação mobile abaixo de 52rem do container. Preservar as regras de teclado, dirty state, permissões e fichas registradas anteriormente.

## 2026-10-06 — Refatoração da Área do Corretor revertida pelo dono

Pedido explícito: “reverta tudo, e me dê um plano e um resumo do que foi pedido”. Revertidas integralmente as duas etapas desta conversa: mudanças visuais, sidebar, fontes, botões/inputs, tooltips centralizados, entradas numéricas, fichas em modal, contratos clicáveis, atalhos e fechamento com dois Esc. Arquivos fonte rastreados restaurados ao estado anterior da refatoração; cinco componentes/hooks novos retirados do código ativo. API, banco, dependências e trabalho anterior preservados. Nenhum commit, push ou deploy.

Os registros de implementação/validação de 05 e 06/10 acima são históricos e NÃO descrevem o produto atual. As orientações específicas dessa refatoração ficam canceladas como instruções de implementação vigente. O novo documento PLANO-AREA-CORRETOR.md contém apenas o pedido consolidado e a proposta de execução futura; não autoriza reimplementar. Preservar o restante das orientações do repositório. Backup local ignorado em artifacts/reversao-area-corretor-2026-10-06.

## 2026-10-09 — Codex: contorno de foco após Esc

Implementado o plano autorizado: `data-foco-navegacao` no main do painel e no h1 de Desenvolvedores; `[data-foco-navegacao]:focus { outline: none; }` em global.css. Preservados tabIndex, foco programático, Pular para o conteúdo, retorno do foco e regras de Esc. A marcação é exclusiva de destinos não interativos; não aplicar a todos os elementos com tabindex=-1 nem remover o foco visível de controles.

Validação: typecheck, lint, build e testes existentes aprovados (3 arquivos, 23 testes). QA efêmero Chrome com API simulada: 19 verificações aprovadas, incluindo reprodução da borda de 3px com a nova regra removida via CSSOM, Visão geral/Imóveis/Contratos/Devs nos dois temas, Tab em link/botão/input, filtro, menu mobile, diálogo intacto com retorno do foco e diálogo alterado com dois Esc. Capturas e resultados ignorados em artifacts/esc-foco-2026-10-09. Sem erros JavaScript nos cenários concluídos. Primeiro QA usou rótulo inexistente Abrir menu; corrigido para Menu. Reinícios do navegador foram necessários antes da rodada final completa.

O smoke original scripts/seo-smoke.mjs falhou na expectativa antiga do h1 Imóveis comerciais; a tela atual usa Imóveis para alugar e comprar. Cópia efêmera com apenas essa expectativa e caminhos de import ajustados passou: SSR, metadados, paginação, 404, discovery, proxy/cookies, função Vercel gerada e indisponibilidade/recuperação 503. O script original foi preservado; sua expectativa continua pendente de atualização fora deste escopo. Build emitiu avisos de anotação PURE do Zod e chunk maior que 500 kB, sem impedir conclusão.

Entrega local concluída; alterações preexistentes preservadas. Sem novas suítes, dependências, API, banco, commit, push ou deploy por esta tarefa. QA simulado não equivale a homologação real nem validação em Safari/iOS.

2026-10-09 — Atualização: dono autorizou commit e push da correção de foco e destes registros na main. Validações da entrega acima permanecem aplicáveis; publicação no Git não confirma deploy.


---

## Arquivo original: auditor-desempenho.md

---
name: auditor-desempenho
description: Mede as requisições /api de cada tela, o peso do bundle e dos assets do corretor-web e compara com o orçamento em tests/visual/orcamento.ts. Use antes e depois de mudanças de dados, cache, SSR ou build. Não edita código.
tools: Bash, Read, Grep, Glob
---

Você audita a velocidade do corretor-web. Meta do dono: menor tempo de resposta e o menor número de requisições.
Escreva em português, com números medidos. Nunca estime o que dá para medir.

## Medições

1. Bundle: `npm run build` e anote `index-*.js` e `index-*.css` (tamanho e gzip) e os maiores chunks. Se o bundle
   contiver `react-dom.development`, o build não está em modo produção: é bloqueante.
2. Requisições por tela: `npm run visual:sem-build -- --reporter=json > <pasta temporária>/visual.json` e leia as
   anotações `requisicoes` de cada teste (trazem a contagem, o limite e a lista de chamadas). Compare com
   `tests/visual/orcamento.ts`. Aponte chamadas repetidas na mesma tela, em cascata ou que o SSR já tinha trazido.
3. SSR e cache HTTP: `node scripts/seo-smoke.mjs --serve` em segundo plano; depois `curl -sI` na raiz, num detalhe de
   imóvel e num arquivo de `/assets` para conferir `Cache-Control`, e `curl -s <url> | wc -c` para o peso do HTML.
   Encerre o servidor ao terminar.
4. Assets públicos: `ls -la public/assets` e fontes importadas em `src/styles/global.css`.

## Relatório

- Tabela: tela | medido agora | orçamento | situação (ok / acima / abaixo: dá para apertar o limite).
- Regressões com a chamada responsável e o `arquivo:linha` provável.
- Oportunidades em ordem de impacto, separando o que é só front, o que depende da API (`../Corretor-API`) e o que é
  infraestrutura (região da API e do banco, CDN das imagens).
- Nunca proponha subir um limite do orçamento sem justificativa; limites só descem quando uma otimização entra.


---

## Arquivo original: CHANGELOG_AI.md

# Histórico de trabalho dos agentes — corretor-web

## 2026-10-09 — Codex: ações de tabela sem quebra no desktop

- Corrigido `Tabela.tsx`: células de ações desktop agora usam largura baseada no conteúdo, `whitespace-nowrap`, `flex-nowrap` e `min-w-max` a partir de 40rem; cartões mobile continuam flexíveis.
- Removida a largura fixa `@min-[58rem]/tabela:min-w-[12rem]` da coluna de ações de `Contatos.tsx`, que fazia a quarta ação cair para uma segunda linha.
- Validação: quatro ícones em uma linha a 1440px, sem overflow; cartões mobile conferidos a 390px. `npm run typecheck`, `npm run lint`, `npm test` (3 arquivos/23 testes) e `npm run build` aprovados. Avisos existentes de PURE do Zod e chunk cliente acima de 500kB permanecem.
- Sem alterações de API, dados, permissões, dependências, commit, push ou deploy.

## 2026-10-09 — Codex: padronização integral do painel

- Plano autorizado pelo dono: todas as telas existentes como referências, acabamento comum no painel inteiro e entrega local. Alterações anteriores da ficha de imóvel/documentação preservadas; implementação delegada por arquivos, integração e QA pelo agente principal.
- Novo `src/componentes/BlocosPainel.tsx`: seções com títulos externos associados, superfícies, grades alinhadas por subgrid e pares de dados/links. `global.css` e `estilosPainel.ts`: espaçamento 16px, padding 16–20px, grades de container 44/70rem, borda dourada/sombra discreta e classes de busca/chips/contagens/estados. `Tabela`, `Aviso`, `EstadoCarregamento`, `Paginacao`: acabamento comum com escopo administrativo.
- Visão geral, Imóveis, Contatos, Pessoas, Contratos, Comissões e Cadastros: cabeçalhos/indicadores/filtros coerentes e ações rápidas com ícones. Corretores já usa os componentes compartilhados; não precisou de alteração local. Fichas Pessoa/Corretor/Classificação/Contrato/Comissão e Imóvel usam blocos externos preservando campos, links, tabelas e permissões.
- Perfil, FormularioImovel e editores Pessoa/Corretor/Classificação/Comissão: títulos externos e espaçamento, preservando âncoras, guardas, grupos recolhíveis, schemas, seleções e forms de perfil/senha independentes. Entrar recebeu escala/controles do painel na área do formulário. Título do diálogo e ações financeiras conservam texto e comportamento.
- Revisão independente levou a preservar alvo 44px dos chips e unificar a grade das métricas do Perfil. Conferência visual corrigiu a especificidade para remover divisórias/padding desigual em dados com duas colunas e eliminou ouro/sombra duplicados nas tabelas dentro de superfícies. Guardas das ações de Pessoa/Contrato conferidas: dados derivados já ficam nulos em carga/erro, sem exposição de registros antigos.
- Typecheck, lint, build e 23 testes existentes (3 arquivos) aprovados no estado final; `git diff --check` aprovado. Avisos conhecidos de PURE do Zod e chunk cliente de 505,56kB acima de 500kB mantidos, sem impedir geração. Smoke SSR efêmero aprovado: metadados, paginação, 404, discovery, proxy streaming/cookies, runtime Vercel e indisponibilidade/recuperação pública; expectativa de h1 atualizada somente na cópia ignorada, sem alterar suíte rastreada.
- QA final Chromium/API simulada: 270 cenários de listas/fichas/grades (ADMIN/CORRETOR, claro/escuro, 320/390/1024/1440/1920 e textos longos/arquivado/quebra de títulos), 49 de formulários/login/estados e 5 fluxos de vazio/erro/recuperação/Esc/paleta/menu. Regressão da ficha aprovada: 28 cenários + 2 fluxos novamente aprovados, topos/bases com desvio 0px, título externo, galeria compacta e consulta sem permissão. Sem overflow, erros JS ou chamadas inesperadas. Capturas selecionadas claras/escuras e mobile/desktop inspecionadas.
- Falhas iniciais de QA eram expectativas do harness: estados vazios diferentes com/sem filtro, mensagem genérica para erro500, redirecionamento ao editar após criação e campos/checkbox exigidos pelas validações existentes. Harness ignorado corrigido e fluxos repetidos; diagnósticos preservados. Evidência consolidada em `artifacts/painel-padrao-2026-10-09/resultados-finais.json`; regressão do imóvel em `artifacts/imovel-alinhamento-2026-10-09`. Nenhuma suíte nova rastreada.
- AGENTS, PROJECT_STATUS, TASKS, DECISIONS, CHANGELOG_AI e índice atualizados sem apagar histórico; entrega detalhada em `2026-10-09-padronizacao-painel.md`. Sem dependências, API/tipos/banco, commit/push/deploy ou gravação real. API simulada não homologa login, Drive/R2/pagamentos reais, vídeo real, Safari/iOS ou dispositivo físico.

## 2026-10-09 — Codex: títulos acima e alinhamento dos cards de imóvel

- Plano autorizado após revisão visual do dono: títulos externos e mesma altura por linha, substituindo a apresentação da primeira versão sem remover seu histórico.
- `FichaImovel.tsx`: seção externa `.imovel-bloco`, h2 associado por `useId`/`aria-labelledby` e superfície `.imovel-nota` apenas para conteúdo.
- `global.css`: stretch/subgrid para compartilhar linhas de títulos e superfícies; seletores da galeria adaptados. Mantidos containers, larguras, descrição e escala tipográfica, sem alturas fixas/cortes nos cards.
- Ficha interna movida antes da Descrição no DOM para preencher a linha de Pessoas em duas colunas, sem CSS dense ou divergência da ordem de leitura/teclado. QA inicial identificou que as utilities do componente compartilhado venciam as dimensões locais da galeria; apenas seus dois seletores locais passaram a `@layer utilities`, com foto até 380px e miniaturas 80×56.
- AGENTS, PROJECT_STATUS, TASKS e DECISIONS atualizados, preservando o histórico. Typecheck, lint, build e 23 testes existentes aprovados após o ajuste da ordem; build novamente aprovado após a correção de camada CSS. Avisos existentes de PURE do Zod e chunk acima de 500kB não impediram geração.
- QA final Chromium/API simulada: 28 cenários (24 de normal/textos longos e arquivado/campos ausentes, em 390/1000/1440/1920px e dois temas; 4 de quebra de título forçada apenas no DOM) e 2 fluxos de consulta sem permissão/Esc aprovados. Títulos externos e associados, topos/bases alinhados com desvio 0px, ausência de overflow e células vazias intermediárias; galeria até 380px e miniaturas 80×56 confirmadas. Ampliação/Esc, seleção/renderização de vídeo, links e ausência de ações de edição/arquivamento de outro corretor verificadas; sem erros JavaScript. Capturas desktop/mobile revisadas; resultados e harness ignorados em `artifacts/imovel-alinhamento-2026-10-09`. Primeira rodada preservada apenas como diagnóstico em resultados-primeira.json.
- Limites: API/dados simulados; vídeo conferido por seleção/renderização, sem reprodução de arquivo real. Integração real e Safari/iOS não homologados.
- Sem novas suítes, dependências, API/banco, commit, push ou deploy.

## 2026-10-09 — Codex: ficha do imóvel estilo post-it

- Plano autorizado implementado em `src/paginas/painel/FichaImovel.tsx`: galeria e resumo, notas de características com ícones/áreas, localização, pessoas, descrição, ficha interna e observações. Campos e valores originais preservados, incluindo nomes/valores exatos das características destacadas.
- `src/styles/global.css`: estilos exclusivos `.imovel-*`, espaçamento de 16px, padding 16–20px, containers nomeados e galeria compacta sem alterar o componente compartilhado. Descrição ocupa duas colunas quando possível; ficha interna adapta os campos à largura da nota.
- AGENTS, PROJECT_STATUS, TASKS e DECISIONS atualizados, preservando os registros anteriores.
- Validação: typecheck, lint, build e testes existentes aprovados (3 arquivos/23 testes). Build manteve avisos de anotação PURE do Zod e chunk acima de 500 kB, sem impedir geração.
- QA efêmero Chrome/Chromium com API simulada: 24 cenários (390/1000/1440/1920px, claro/escuro, normal/textos longos e imóvel arquivado/campos ausentes e sem fotos). Grades de 1/2/3 colunas sem transbordamento nos cards; ampliação/Esc, seleção de vídeo, links e consulta sem permissão verificadas. Capturas/resultados em `artifacts/imovel-notas-2026-10-09` (ignorado). Ajuste final de compactação da ficha interna seguido de novo build e QA: todos os 24 cenários aprovados novamente; capturas desktop/mobile revisadas. Reinício do QA com Chromium foi necessário após demora na abertura do Chrome; sem alteração no produto para esse contorno.
- Sem novas suítes, dependências, API, banco, commit, push ou deploy. Integração real, reprodução de vídeo real e Safari/iOS não homologados.

## 2026-10-09 — Ações de lista padronizadas só com ícone (pedido do dono)

- `src/paginas/painel/FichaPessoa.tsx`: WhatsApp da ficha virou `AcaoIcone` (href `wa.me`, `target _blank`,
  `rel` automático), igual à lista de Contatos; cabeçalho da ficha com 3 ícones uniformes.
- `src/paginas/painel/DetalheComissao.tsx`: `Registrar recebimento` mantido com texto (ação financeira).
- `docs/DECISIONS.md`: registrada a exceção só-ícone para colunas de Ações das listas.
- Listas Imóveis/Pessoas/Corretores/Cadastros já eram 100% ícone; fichas primárias, formulários e site
  público conservam texto.

Validação: typecheck, lint, build e testes existentes.

## 2026-10-09 — Claude: botão de voltar unificado e Esc global

- `src/componentes/BotaoVoltar.tsx` novo; aplicado no detalhe público, Privacidade, Devs, Entrar e nas
  fichas do painel via `CabecalhoPagina` (imóvel, pessoa, contrato, comissão, corretor, cadastro, formulário).
- Detalhe público: removidos "Voltar aos imóveis", breadcrumb, status e eyebrow; título ao lado da seta,
  em largura total.
- `src/hooks/useEscVoltar.ts`: `escPodeVoltar` (regra compartilhada com `useVoltarPainel`) e
  `useEscVoltar`, ligado em `LayoutPublico` (fora do catálogo) e em `Entrar`. Menu mobile passa a
  consumir o Esc (`preventDefault`).
- Header Alugar/Comprar rola até `#catalogo` (estado `rolarCatalogo`, respeitado por `RolarAoTopo`).

Validação: typecheck, lint e testes existentes.

## 2026-10-08 — Codex: 404 da foto corrigido na implantação

O dono autorizou resolver pela página aberta do Render usando Computer Use. Confirmado commit ativo antigo e3b0a32; implantação manual do origin/main 86ecf29 concluída (Deploy succeeded/Live), serviço srv-daj21e15efls73fab4gg, deploy dep-db4684m0tbcc73d9jtr0. Este registro substitui a pendência de acesso/publicação do diagnóstico abaixo.

URL original /api/corretores/1/foto?v=1f6h7x3 agora responde 302; seguindo redirect, HTTP 200 image/jpeg, 22322 bytes. /api/v1/saude da API retorna status ok. Perfil aberto recarregado para verificar a correção. Sem alterações funcionais, migrations, gravação de dados, commit ou push; documentação histórica preservada. Conector Render segue indisponível, mas sessão do navegador permitiu corrigir a implantação.


## 2026-10-08 — Codex: investigação do GET da foto com 404

Reproduzido GET https://corretor-web-test.vercel.app/api/corretores/1/foto?v=1f6h7x3: 404 Cannot GET; caminho versionado também ausente. API local sincronizada com origin/main (86ecf29); controller registrado no módulo. npm run build da API aprovado. QA efêmero usando controllers/services compilados e proxy scripts/runtime.mjs: redirect HTTPS 302 e imagem privada 200/bytes corretos, banco e storage simulados. Primeiro harness falhou por middleware adicionado após listen; repetição com ordem do bootstrap aprovada.

Atualizados AGENTS, PROJECT_STATUS, TASKS, DECISIONS e CHANGELOG_AI em ambos os repositórios, preservando histórico. Sem alteração funcional ou dados. Commit implantado não confirmado; Render requer reautenticação. Correção remota e validação da foto real pendentes; nenhum deploy realizado.


## 2026-10-06 — Codex: refinamento de contatos, perfil e filtros

Implementado o plano aprovado: seletor por conteúdo; lista de Contatos em abas e ações compactas com SVG;
perfil em cards, prévia de arquivo/URL, guarda/busy, compressão existente; filtros automáticos compartilhados.
Catalogo controlado e sincronizado com URL, replace automático, histórico explícito, SSR e foco preservados.
`urlFotoCorretor` centraliza exibição da foto; adaptador PATCH admite multipart. API irmã implementa
storage/quota compartilhados, foto por id, envio e compensação sem migration.

Revisão final independente encontrou três falhas: limpar somente paginação, limpar número inválido e
restaurar foto antiga por outra aba. Reproduções efêmeras antes/depois; corrigidas. A inspeção visual
também alinhou campos do perfil ao topo e deixou ações de Contatos na mesma linha em containers amplos.

Validação: typecheck/lint/build ambos; 21 testes existentes e smoke SSR frontend. Jest API sem fontes.
HTTP simulado 22 cenários + foto concorrente; navegador simulado 23 cenários/32 capturas, sem overflow,
JS ou rotas inesperadas. Falhas iniciais de QA por nomes acessíveis, origem ausente da fixture CSV e PNG
inválido do próprio script foram corrigidas; não contam como validação. R2 real Put/Get/Delete, com
GET 404 após limpeza, aprovado sem banco. Perfil real/Neon e dispositivos reais continuam sem homologação.

Documentação e especificações atualizadas por registros adicionais; System Design em DOCX, seis páginas
inspecionadas e referência original intacta. Trabalho prévio staged/untracked da API preservado.
Sem novas dependências, suites rastreadas, alterações de schema, commit, push, deploy ou migrations.

## 2026-10-06 — Claude: cabeçalhos no estilo de "Encontrar um imóvel"

Pedido: todos os botões dos cabeçalhos com negrito e linha dourada no hover; remover "Encontrar um imóvel";
tirar a borda do botão de tema; painel incluído; corrigir outras diferenças encontradas.

Arquivos: `global.css` (`.linha-nav`, `.link-texto`), LayoutPublico, LayoutPainel, App, PaginaIndisponivel,
FormularioContato, Catalogo, DetalheImovel, Privacidade, Devs e Entrar.

Validação (exit 0): typecheck, lint, 3 arquivos/21 testes, build cliente/SSR/Vercel e `seo-smoke`. Curl no preview:
`/`, `/imoveis/para-alugar`, detalhe, `robots.txt`, `sitemap.xml` e `/privacidade` com 200; rota inexistente com 404.
O SSR não traz mais "Encontrar um imóvel" e marca Alugar com `aria-current`.

QA efêmero em Playwright/Chrome com API simulada: 4 projetos (claro/escuro 1440 e 390) × 2 cenários, 8 de 8
aprovados. O primeiro rodou com 4 falhas, todas do próprio script (seletor ambíguo e expectativa errada da
transformação), corrigido em seguida. Verificado: sem link removido, linha ativa, tema sem borda, foco em Alugar
ao abrir o menu mobile, sem overflow, sem erro JS e sem chamada de API inesperada. Capturas inspecionadas
visualmente e guardadas em `artifacts/cabecalhos-2026-10-06/`; spec temporária removida. `git diff --check`
aprovado. Sem commit, push ou publicação.


## 2026-10-06 — Codex: conclusão local das specs completas da Área do Corretor

Pedido aprovado: aplicar o plano completo ao restante do painel. Implementados padrões em
Imóveis/Contratos/Comissões/Cadastros/Corretores/Visão geral/Perfil e editores/mídias; novas
fichas em rotas próprias; CampoNumero, guarda de alterações e paleta Ctrl/⌘+K. Vínculos,
permissões, contratos da API, rascunhos e operações existentes preservados. Detalhes em
`2026-10-06-conclusao-area-corretor.md`, incluindo autorização e limites.

Arquivos: App; componentes CampoNumero/PaletaPainel/Dialogo/ConfirmarAcao/GerenciadorMidia/
SelecaoMidia/estilosPainel; hooks useComandosPainel/useGuardaFormulario; serviços api/urls/
registros; telas Imoveis/DetalheImovel/FichaImovel/FormularioImovel/FichaPessoa/EditorPessoa/
Pessoas/Contatos/LayoutPainel/Contratos/DetalheContrato/Comissoes/DetalheComissao/EditoresComissao/
Cadastros/FichaClassificacao/EditorClassificacao/Corretores/FichaCorretor/EditorCorretor/Perfil/
VisaoGeral; estilos globais restritos ao painel. Documentação e índice atualizados sem apagar histórico.

Implementação delegada financeira/cadastros/corretores e revisão independente concluídas.
Revisão consolidada encontrou lacunas em guarda de pagamento, foco da paleta, desarme com
tecla rejeitada, edição de colagem agrupada e restauração do imóvel original; corrigidas e
reverificadas estática e comportamentalmente. Uma tentativa inicial de revisão parou por limite
de uso; outra revisão consolidada concluiu o trabalho, sem novo achado acionável após correções.

Validação final (exit 0): typecheck, lint, 3 arquivos/21 testes existentes, build cliente/SSR/
Vercel e smoke SSR reiniciado após build. Avisos conhecidos do Zod, sem erro de build.
Chrome/API simulada: 320 cenários, 140 capturas; matriz 320/390/768/1440 claro/escuro em
ADMIN/CORRETOR, guardas/teclado/foco, números/DTO/limites, estados/permissões, atendimento,
rascunho/perfil/senha, recebimento confirmado, links/guia e público. Sem erros JS, chamadas API
inesperadas ou overflow horizontal; amostras inspecionadas. Relatórios/JSONs/prints/snapshots
ignorados em artifacts/conclusao-area-corretor-2026-10-06/. Scripts temporários retirados.
Diff-check aprovado, staged SHA-256 idêntico: 65c8c19c83ff479bbfc0667377c8cb087dd0008d64c9feafcf994f635ef7661c.

Prévia local: 0.0.0.0:5173, Wi-Fi 192.168.0.20; HEAD login 200 e sondagem sem credenciais
retorna validação 400 em vez de rejeição de origem. Não é homologação de login/dispositivo.
API/banco/Drive/R2/pagamentos reais e Safari/iOS/celular físico seguem sem homologação.
Sem novas suítes/dependências, alterações de backend/dados, commit, push ou deploy.

## 2026-10-06 — Codex: ajustes aprovados da revisão visual do painel

Pedido: implementar o plano de correção após os prints e escolhas do dono.
Entrega: SeletorFiltro; histórico/Esc; variante telaInteira de Dialogo; tooltip sem rolagem;
Tabela/cards e ações à direita; filtros/cabeçalhos alinhados; Atendido estilizado; remoção de
semFoto e origem/consentimento nas listas. Preservados permissões, contratos, guardas existentes,
alterações locais e índice Git. Detalhes em `2026-10-06-ajustes-painel.md`.

**Validação final:** typecheck, lint, 3 arquivos/21 testes existentes, build e smoke SSR
aprovados. Chrome/API simulada: 63 cenários, 59 capturas, sem erros JavaScript,
requisições API inesperadas ou overflow horizontal. Matriz 320/390/768/1440 claro/escuro
para Pessoas, Contatos, Corretores, Imóveis, ficha, seletor e menu. Inclui teclado,
tooltip sem rolagem, histórico/POP/entrada direta, guarda de edição, seletores das demais
listagens, atendimento erro/retry/transições e permissões ADMIN/CORRETOR; regressão pública
de catálogo, detalhe e menu. Capturas representativas inspecionadas visualmente.
`git diff --check` aprovado; diff staged antes/depois com SHA-256 idêntico.
Evidência ignorada: `artifacts/ajustes-painel-2026-10-06/`.

API/banco/serviços reais, Safari/iOS e dispositivo físico continuam sem homologação.
QA simulado não altera dados reais. Nenhuma suíte rastreada foi criada ou ampliada.
Sem novas suítes rastreadas, dependências, API/banco/migrations, commit/push/deploy.

## 2026-10-06 — Codex: primeiro marco de Contatos a partir de `a2a9f81`

Pedido atual: implementar o plano do parceiro preservando a base existente. Especificação vigente:
`2026-10-06-painel-especificacao-visual.md`. Entrega local em revisão do dono, conforme o primeiro
checkpoint explícito; não corresponde à implementação integral das etapas seguintes.

**Mudanças:** Contatos passa a Pendentes/Atendidos, com checkbox bidirecional, confirmação de
finalização e histórico por filtro. Reabrir fica disponível apenas a ADMIN. Mensagem, WhatsApp,
busca, imóvel/período, paginação independente e CSV da página continuam disponíveis. Mutação só
move após sucesso, bloqueia duplicidade e mantém erro com retry; a última página vazia volta à anterior.
Permissão compartilhada protege EditorPessoa/Pessoas; editor de CORRETOR não oferece reabrir
FINALIZADO e também recusa valor adulterado antes do envio. Tooltip do painel usa popover para não
ser cortado; dicas/erros auxiliares e cabeçalho mobile do modal seguem a base do parceiro.

**Arquivos de produto:** `src/paginas/painel/{Contatos,EditorPessoa,Pessoas}.tsx`,
`src/servicos/pessoas.ts`, `src/hooks/useDadosPainel.ts`,
`src/componentes/{AcaoIcone,Dialogo,Icones,Tabela}.tsx`, `estilosPainel.ts` e `src/styles/global.css`.
Documentação atualizada sem apagar histórico: AGENTS, PROJECT_STATUS, TASKS, DECISIONS, CHANGELOG_AI,
INDICE, especificação visual e adendo ao plano anterior. Nenhuma alteração na API irmã ou no índice Git preexistente.

**Validação final executada (exit 0):**
- `npm run typecheck` e `npm run lint`.
- `npm test -- --maxWorkers=1 --reporter=dot`: 3 arquivos, 21/21 testes.
- `npm run build`: cliente, SSR e saída Vercel; apenas avisos conhecidos de annotations do Zod.
- `node scripts/seo-smoke.mjs --serve`, reiniciado após o build: SSR/metadados/paginação/404,
  proxy/cookies, função Vercel independente, indisponibilidade 503 e recuperação.
- QA efêmero com Chrome/API simulada: 24 cenários, 38 capturas; sem erros JS ou requisições de API
  inesperadas. Cobriu transições, cancelamento/erro/retry, ADMIN/CORRETOR, bloqueio no editor adulterado,
  filtros/datas UTC-04, CSV, última página, vazio, links/fundo/seleção de texto/Ctrl/Meta/Shift/meio,
  teclado, tooltips e matriz 390/768/1440 claro/escuro. Sidebar sem scroll em 1366×657 e 1440×900.
  Regressão pública: catálogo, detalhe, menu, tooltip e modal em 390/1440 nos dois temas.
- `git diff --check` após retirar uma linha vazia excedente no fim de Contatos.

Capturas representativas de Contatos desktop/mobile, editor e público inspecionadas visualmente.
Evidências ignoradas em `artifacts/area-corretor-2026-10-06/` (`resultados.json`, CSV e `prints/`);
execuções intermediárias corrigiram seletores ambíguos e a expectativa da mensagem sanitizada de HTTP 500.
Scripts temporários retirados ao finalizar; resultados, CSV e capturas preservados. Nenhuma suíte
rastreada foi criada/ampliada. QA simulado não homologa API/banco/Drive/R2 reais ou
Safari/iOS/dispositivo físico. A regra específica ADMIN para reabrir continua somente no frontend.

**Pendente:** revisão visual de Contatos pelo dono; depois Imóveis/Contratos, demais telas, fichas
próprias, números, guardas e Ctrl/⌘+K. Sem novas dependências, migrations, dados reais, commit, push ou deploy.

## 2026-10-04 — Antigravity: consolidação de todos os arquivos .md em docs/

Pedido: mover todos os arquivos .md para a pasta docs/ e remover todas as subpastas em docs e agentes.
Entrega:
- Todos os arquivos .md da raiz, de `.claude/` e de `docs/audits/` foram movidos para a pasta `docs/` de forma plana.
- Subpastas `docs/audits/`, `.claude/agents/`, `.claude/commands/` e `.claude/` foram removidas.
- Atualizados `docs/AGENTS.md` e `docs/CLAUDE.md` com os novos caminhos.
## 2026-10-04 — Revisão externa: ajustes de design, suíte mínima e índice (Claude)

Pedido: tratar a revisão do repositório (riscos operacionais e 5 ajustes de design).

Arquivos: `src/paginas/publico/Catalogo.tsx` (cidade/bairro movidos para "Mais filtros: local, preço e área";
herói trocado por `public/assets/rua-comercial-{640,960,1200}.webp`), `src/paginas/publico/DetalheImovel.tsx`
(compartilhar/mapa foram do cabeçalho para o card de valor; "Soma dos valores informados" sem negrito, em cor atenuada),
`src/seo/fixture.ts` (`catalogoExemplo()` com 11 imóveis variados e tipos Loja/Terreno/Prédio),
`scripts/seo-smoke.mjs` e `tests/visual/api-simulada.ts` (usam o catálogo variado), `tsconfig.json` (removido `tests/e2e` e
`playwright.config.ts`, inexistentes), `docs/INDICE.md` (novo), testes novos `src/servicos/{contato,urls,formato}.test.ts`.

Testes executados (resultado real): `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` 3 arquivos/21 testes passaram;
`npm run build` exit 0; `node scripts/seo-smoke.mjs` passou (SSR, 404, robots/sitemap/llms, proxy, 503). Prints Chrome do catálogo
e do detalhe em 1440 e 390 conferidos manualmente. `npm run visual` NÃO foi executado: continua sem `.spec.ts`.

Pendências: fotos reais dos imóveis (hoje Unsplash); testes de autorização, comissão e upload são da API irmã;
imagem do herói gerada por IA, trocar por foto real de Juara quando houver. Commit e push autorizados pelo dono na main.

## 2026-10-03 — Antigravity: remoção de artefato do operário em CenaObra (/devs)

Pedido: analisar e corrigir artefato visual na cena do operário em /devs (parecia um suporte amarelo atrás da cabeça).
Entrega:
- `src/componentes/CenaObra.tsx`: removido o bloco `<g>` do andaime posicionado diretamente atrás do operário.
  Eliminada a prancha `var(--color-gold)` que vazava atrás do capacete e a barra vertical que simulava uma haste.
- Atualizados `PROJECT_STATUS.md`, `DECISIONS.md` e `CHANGELOG_AI.md`.
Validação:
- `npm run typecheck`, `npm run lint`, `npm run build`: exit 0.
- `node scripts/seo-smoke.mjs`: exit 0.
- `npm test`: exit 1 (conforme esperado, nenhuma suíte de teste presente).

## 2026-10-03 — CARGA-001: catálogo persistente no Neon

Por solicitação do dono, a API irmã recebeu 12 imóveis ilustrativos de Juara/MT, 9 características,
1 conta ADMIN Codice e 36 fotos; o frontend continuou no contrato real, sem fallback/modo demo.
Os imóveis existentes e registros das outras tabelas foram preservados. Valores, áreas, itens e
endereços são sintéticos, não confirmam disponibilidade. As descrições identificam fotos e endereço
de referência; proveniência/licenças das imagens estão no documento da API.

O comando fez uma simulação direta sem escrita e exigiu backup completo do mesmo Neon fora do
repositório e OneDrive. Snapshot de 39 tabelas/114 linhas: todas as linhas anteriores conferidas
intactas após a carga. Os 36 objetos ficaram no R2 e tiveram hash validado; a URL `r2.dev` configurada
respondeu 401. A política do bucket permaneceu igual; o banco aponta às URLs Unsplash verificadas,
36/36 HTTP 200. SSR do catálogo, página 2, detalhe e galeria foram conferidos em browser local; a
capa carregou (1400×933). Localmente, `robots.txt` segue `Disallow: /`, sitemap vazio com indexação
desativada e uma rota desconhecida respondeu 404.

Validação API final: typecheck/lint/build aprovados; `npm test` exit 1 por ausência de suites fonte
removidas a pedido do dono, sem recriação. Execução repetida: 12 itens ignorados, 0 duplicados.
Nenhum código funcional do frontend foi alterado neste trabalho; nenhum commit/push/deploy foi feito.
Credencial aleatória do Codice ficou em arquivo privado local fora do repositório/OneDrive.

## 2026-10-03 — Codex: commit e push do cartoon de indisponibilidade autorizados

Pedido explícito do dono: commit e push na main. Escopo autorizado: os 12 arquivos da cena,
recuperação/sondagem, integração, smoke e cinco documentos de contexto. Dev server/Vite/anexos
preexistentes e artefatos ignorados ficam fora do commit. Não há alteração da API nem dados reais.
Fetch confirmado, HEAD/origin/main 0/0 antes da publicação. Repetidos typecheck/lint/smoke: exit 0;
npm test: exit 1, sem arquivos conforme remoção solicitada. Build e 22 verificações Chrome do
registro anterior permanecem evidência desta implementação, sem alterações posteriores em produção.
Revisão do diff e escopo antes de publicar. Sem deploy/migration; homologações pendentes preservadas.

## 2026-10-03 — Codex: cartoon de reparo e recuperação automática da indisponibilidade

Pedido: implementar o plano aprovado de cartoon de reparo enquanto o backend está indisponível,
abrindo automaticamente a mesma página quando ela voltar. Somente frontend, direto na main.

Entrega:
- Novos `src/componentes/CenaReparo.tsx`, `PaginaIndisponivel.tsx` e `src/hooks/useRecuperacaoPagina.ts`.
  Casa apagada/operário/quadro de energia em SVG local, loop suave de 6s, sem som. Pausa conserva
  o progresso e não pausa sondagens; reduced-motion e SSR/primeiro render permanecem estáticos.
- `src/App.tsx`, `src/servicos/api.ts` e `src/styles/tailwind.css`: integração dos estados públicos 5xx,
  serviço central HEAD da própria URL e estilos de reparo. Primeira tentativa após 30s, próximas
  30s após terminar, limite 50s e uma por vez. 200/404 recarregam a URL com filtros/hash; demais
  respostas/erros/timeout conservam a espera. Ocultar/offline/sair/trocar URL/retry manual cancela
  requests/timers e invalida respostas anteriores. Link manual funciona sem JS (path/query).
- `scripts/seo-smoke.mjs`: ampliado smoke existente com falha sintética dos dados, saúde ainda 200,
  HTTP 503/no-store/noindex/Retry-After, cena estática sem JS e sondagem HEAD 503 -> 200 sem corpo.
- AGENTS.md, PROJECT_STATUS.md, TASKS.md, DECISIONS.md e este histórico atualizados sem apagar registros.
  Nova decisão substitui o 503 sem ilustração/recuperação; tempos do /devs e 404 preservados.

Validação real após integração e correção de acessibilidade:
- `npm run typecheck`, `npm run lint`, `npm run build`: exit 0. Build cliente/SSR/Vercel local;
  avisos PURE do Zod preexistentes. `node scripts/seo-smoke.mjs`: exit 0, incluindo catálogo,
  detalhe, /devs, 404, robots/sitemap/llms, proxy/cookies, função Vercel e novo fluxo HTTP 503/HEAD.
- `npm test -- --maxWorkers=1 --reporter=dot`: exit 1, No test files found. Nenhuma suíte fonte recriada.
- `node artifacts/indisponibilidade/qa-browser.mjs`: exit 0, 22/22 checks (14 cenários + 8 layouts).
  API inteiramente simulada. Recuperação 200/filtros/hash, slug 301, imóvel removido 404, saúde positiva
  com catálogo falhando, espera persistente, erro de rede, limite 50s sem concorrência, cancelamento
  e resposta antiga ao navegar, ocultar/retomar, offline/online, retry manual durante request,
  pausa por teclado independente da recuperação, reduced-motion e sem JS/link manual.
  Layouts 320/390/768/1440 claro/escuro: sem overflow, alvos >=44px, arte depois do texto no mobile.
  Sem pageerror/erro de console inesperado/hidratação; status HTTP de falha deliberados.
  Tempos medidos com relógio virtual; visibilidade por propriedade/evento simulados.
- Prints integrados de 320 claro, 390 escuro e 1440 claro inspecionados; cena isolada nos dois temas,
  pausa preservando matriz do braço e reduced-motion sem animação também conferidos pelo subagente.
- Revisão independente identificou animação no SSR sem controle de pausa; corrigida para iniciar
  somente após montagem do cliente. Releitura não encontrou outros problemas concretos.
  `git diff --check`: exit 0. Não afirmar homologação por esta revisão estática.

Evidências ignoradas: `artifacts/indisponibilidade/resultados.json`, `layout-*.png`, harness/log;
`artifacts/reparo-cena` contém provas isoladas. Serviços próprios de QA encerrados.
Durante captura, URL.pathname codificou o caminho Windows e criou diretórios paralelos; corrigido
para fileURLToPath e os oito PNG recuperados para o diretório correto. A revisão automática rejeitou
a remoção somente das quatro pastas vazias, com motivo `blocked by policy`; não houve contorno.
Restam vazias em `C:\Users\ferna\OneDrive\%C3%81rea%20de%20Trabalho\Corretor-web\artifacts\indisponibilidade`.

Limites: cache/CDN/cold start no publicado, API/banco/R2/Drive reais, Safari/iOS e dispositivos físicos
não homologados. HEAD ainda executa buscas/render SSR e a recarga repete o trabalho; timeout servidor
inalterado. Erros inline/painel fora do fluxo. `scripts/dev.mjs`, `vite.config.ts` e anexos preexistentes
preservados. Sem dependências novas, escrita em dados reais, API irmã, commit/push ou deploy.

## 2026-10-03 — Codex: refinamento do público e painel aprovado pelo dono

Pedido: implementar o plano de acabamento, com menos caixas nas ações secundárias (Editar vira
lápis). Preservada a identidade navy/dourado, fontes, logo, conteúdo comercial, rotas e contratos.
Somente frontend, direto na main; nenhuma alteração na API irmã, dependência nova ou dado real.

Entrega:
- `AcaoIcone`: desenho de 19px/alvo 44px, nome contextual, dica legível no hover/foco, Escape
  também quando só há hover, posição limitada à tela, foco com contraste e estado ocupado.
  Ações primárias e transições de atendimento continuam com texto.
- `Campo`, `Aviso` e `ConfirmarAcao` padronizam rótulos/erros, estados e confirmações nativas.
  Cancelar recebe foco inicial; operações bloqueiam nova ação/fechamento e permitem retry.
  Tabelas viram cartões por container abaixo de 40rem, mantendo os campos; textos longos quebram
  sem recortar as dicas. Corrigidos asterisco em linha separada e foco perdido ao limpar seletor.
- Catálogo com hero menor, busca antes da foto no mobile, ordenação visível, filtros removíveis
  e cartões alinhados. Detalhe coloca custos/corretor antes da descrição no mobile e reserva espaço
  para o CTA fixo após o rodapé. Galeria recebe setas, navegação ampliada e fallback de foto.
  Consentimento fica alinhado; falha do registro do contato mantém retentativa sem reabrir WhatsApp.
  CTA geral usa o WhatsApp comercial configurado em `brand`.
- Painel com menu móvel completo por cargo, título de página e skip link. Resumo prioriza
  contatos pendentes/reutiliza essa leitura; portfólio e financeiro conservam cálculos/serviços.
  Listas recebem ícones e contexto dos filtros. Seletor/listas/comissões ocultam ações obsoletas.
  Formulário mantém seis seções abertas, âncoras, rascunho, guarda e duplicação em duas etapas,
  com barra de salvar/progresso. Formulários e controles de mídia usam a base compartilhada.

Arquivos de produção alterados:
- `src/componentes/`: AcaoIcone.tsx, Aviso.tsx, Campo.tsx, ConfirmarAcao.tsx (novos);
  CabecalhoPagina.tsx, CartaoImovel.tsx, Dialogo.tsx, EstadoCarregamento.tsx,
  FormularioContato.tsx, GaleriaMidia.tsx, GerenciadorMidia.tsx, LayoutPublico.tsx,
  SelecaoMidia.tsx, SeletorRegistro.tsx, Tabela.tsx e estilosPainel.ts.
- `src/paginas/publico/`: Catalogo.tsx e DetalheImovel.tsx.
- `src/paginas/painel/`: LayoutPainel.tsx, VisaoGeral.tsx, Imoveis.tsx, Pessoas.tsx,
  Contatos.tsx, Corretores.tsx, Cadastros.tsx, FormularioImovel.tsx, EditorPessoa.tsx,
  Contratos.tsx, DetalheContrato.tsx, Comissoes.tsx, Perfil.tsx e Entrar.tsx.
- `src/hooks/useGuardaFormulario.tsx`, `src/styles/global.css` e `src/styles/tailwind.css`.
- Documentação: AGENTS.md, PROJECT_STATUS.md, TASKS.md, DECISIONS.md e CHANGELOG_AI.md.

Validação real após integração/correções:
- `npm run typecheck`, `npm run lint` e `npm run build`: exit 0. Build cliente/SSR/Vercel local;
  avisos PURE do Zod preexistentes. Não houve deploy.
- `npm test -- --maxWorkers=1 --reporter=dot`: exit 1, “No test files found”. Respeitada a
  remoção pelo dono: não recriadas suítes fonte, nem executado `npm run visual` sem specs.
- `node scripts/seo-smoke.mjs --serve`: aprovado, inclusive SSR/metadados/paginação/404,
  robots/sitemap/descoberta, proxy streaming/cookies e função Vercel no Node local.
- `node artifacts/refino/validar.mjs`: exit 0, 97 verificações, sem falhas/pageerror. 84 layouts:
  catálogo/detalhe/resumo/imóveis/contatos/formulário em 320/390/768/1024/1440 e dois temas;
  pessoas/corretores/cadastros/contratos/comissões/perfil em 390/1440 e dois temas.
  Confere overflow da página/tabela, fonte mínima dos campos, rótulos e alvos dos ícones.
  Outros 13 cenários cobrem foco/dicas/Escape, navegação/permissões, consentimento inválido,
  contato válido/falha/retry, filtros/ordenação/histórico/intervalo, galeria/fallback/teclado,
  rascunho/guarda/erro, confirmação cancelada/busy/falha/retry, footer mobile, SSR sem JS,
  movimento reduzido, registros longos, imóvel sem mídia/sob consulta.
- `node artifacts/refino/fluxos-painel.mjs`: exit 0, 5/5 registros, sem pageerror/chamadas
  inesperadas. Duplicação com duas confirmações e rascunho existente; âncora dirty/guarda
  cancelar/prosseguir/restauração; selector lento/erro/clear/foco/teclado; mídia cancelar/retry/busy.
- Conferência focal adicional da galeria: embed seguro e vídeo arquivo com controles;
  setas no player não trocam a mídia. Embed simulado e arquivo indisponível, sem provar playback real.
- Prints inspecionados de catálogo, detalhe, contatos, resumo, formulário e rodapé nos dois temas.
  Evidências/scripts efêmeros ignorados em `artifacts/refino`, incluindo resultado.json,
  fluxos-painel.json e resultado-galeria.json. Sem alteração em tests/ ou suites novas.
- `git diff --check`: exit 0. Main em 80717c0, HEAD/origin = 0/0; API irmã limpa na conferência.
  Anexos `.codex-remote-attachments/` preexistentes preservados; nenhum artefato de build rastreado.

Limites: API/banco/Drive/R2 reais, gravação/upload reais, playback de vídeos reais, Safari/iOS e
dispositivos físicos não homologados. Filtros administrativos na URL permanecem parte aberta de
UX-007; itens de performance/infra anteriores não foram assumidos. Sem commit/push/deploy.
Prévia sintética local em http://127.0.0.1:4180 enquanto o processo desta sessão permanecer ativo.

## 2026-10-03 — Remoção dos arquivos de teste

Por solicitação do dono, removidos os 46 arquivos `*.test.*`/`*.spec.*` do frontend e os 28 equivalentes
do `../Corretor-API`, incluindo fontes modificados e novos não rastreados. Código de produção e módulo
`src/midias/recepcao-midias.ts` preservados. Validação: conferência dos caminhos removidos no Git; testes
não executados após a exclusão. Scripts e dependências de teste permanecem, mas já não há suítes fonte.

## 2026-10-03 — Codex: revisão das correções da auditoria full stack

Pedido do dono: revisar as correções e alterar o que estivesse inadequado. Mantidas as alterações locais
anteriores de A06–A08/SSR; corrigidas corridas na restauração de sessão, unificado refresh com o cliente HTTP,
invalidados tokens de respostas antigas e omitida a coleção de características inalterada no PATCH.
API irmã: autorização de contrato sem bloquear compartilhamento legítimo, armazenamento multipart limitado,
concorrência, lock de upload dentro da transação, associação removida fora da ficha e busca com +55.

Arquivos alterados nesta revisão no frontend: src/hooks/useSessao.tsx e useSessao.test.tsx;
src/servicos/http.ts, http.test.ts, api.ts e api.test.ts; src/seo/server.test.ts;
src/paginas/painel/FormularioImovel.test.tsx; docs/audits/2026-10-02-auditoria-fullstack.md;
PROJECT_STATUS.md, TASKS.md, DECISIONS.md e este CHANGELOG_AI.md.
Os diffs anteriores em useDadosPainel, Contatos, Comissoes/testes, esquemaImovel.test, server.ts,
contato.ts e tipos/index.ts foram revisados e preservados. Marcadores de merge documentais antigos foram
convertidos em notas, preservando seu texto e o histórico.

Validação real final:
- npm run typecheck e npm run lint: aprovados nos dois repositórios.
- npm test -- --maxWorkers=1 --reporter=dot: 43 arquivos/231 testes aprovados no frontend.
- API npm test: 27 suítes/188 testes aprovados; 1 suíte/4 testes PostgreSQL não executados.
- npm run build: aprovado nos dois repositórios. Avisos PURE do Zod preexistentes.
- node scripts/seo-smoke.mjs --serve: smoke aprovado (SSR/metadados/paginação/404/descoberta/proxy/cookies
  e função Vercel em Node local); modo serve usado apenas para a conferência manual.
- Navegador local: catálogo, detalhe e 404 conferidos; sem avisos/erros de console no catálogo/detalhe.
  robots.txt/sitemap.xml/404 conferidos também por HTTP. Fixture noindex gera sitemap vazio;
  sitemap indexável/paginado coberto nos testes. Navegador bloqueou abertura do robots.txt; leitura HTTP aprovada.
- API lenta e recuperação do catálogo/detalhe, teto total SSR e carga inicial do imóvel novo testados.
- git diff --check aprovado nos dois; git fetch + rev-list mostram HEAD...origin/main = 0/0 em ambos.

Limites: sem banco real, migrations, carga, R2/Drive reais, ACLs, Safari/iOS ou homologação implantada.
A09/A10/A11/H01 permanecem com pendências operacionais no relatório. Nenhuma dependência nova,
commit/push/deploy ou escrita em serviços reais. Mensagens render failed são do teste intencional de LimiteErro.


## 2026-10-03 — Muse Spark: manutenção da auditoria (endurecer A06–A08, A09/A11 sem marcar)

Pedido do dono: pull nos dois repos (front `8d40cb8`, back `85a6301`; DELL de e2e/docs mortos incluído) e
manutenção front + back do relatório `docs/audits/2026-10-02-auditoria-fullstack.md`. Baseline antes de mexer:
front 43 arquivos/220 testes; API 24 suítes/175 testes.

Alterações no front (sem commit/push):
- `src/servicos/contato.ts`: `telefoneValido` com fonte única em `validacao.ts` (reexport por compatibilidade).
- `src/hooks/useDadosPainel.ts`: guarda de sequência — só a consulta mais recente aplica dados/erro/carregando.
- `src/paginas/painel/Contatos.tsx`: coluna remonta pela chave dos filtros (página 1 em 1 fetch); CSV segue
  desabilitado com erro; sem `useEffect` de reset.
- `src/paginas/painel/Comissoes.tsx`: `escolherContrato` com sequência, erro visível, dica
  `Buscando imóvel…`, botão bloqueado resolvendo, e troca de operação invalida pendência.
- `src/tipos/index.ts` + `esquemaImovel.test.ts`: `caracteristica_ativa?` tipada e teste de round-trip A09.
- `src/paginas/painel/Comissoes.test.tsx`: +2 testes A08 (fora de ordem; limpar/falha).
- `src/seo/server.tsx` + `server.test.ts`: `ORCAMENTO_PUBLICO_MS=45s`, 10s por requisição, `Retry-After: 30`
  e `noindex` em 503.
- Docs: checkboxes A06–A08 com evidência atualizada; A09/A10/A11 com progresso sem marcar; decisão em
  `DECISIONS.md`; estado em `PROJECT_STATUS.md`.

Validação real (03/10/2026):
- `npm run typecheck`: aprovado (front e API com `--incremental false`).
- `npm run lint`: aprovado (front e API).
- Front `npm test -- --maxWorkers=1`: 43 arquivos/223 testes aprovados (+3: 2 de A08 e 1 de A09).
- API `npm test -- --runInBand`: 24 suítes/175 testes aprovados (sem mudança de código no back nesta sessão).
- `npm run build` + `node scripts/seo-smoke.mjs`: aprovados.
- `git diff --check`: aprovado (rodar antes de commitar).

Pendências e riscos: A09/A10/A11 e H01 seguem abertos (critério exige homologação integrada/lenta/ACLs);
A02 chunked + concorrência segue mitigado (guard + Content-Length + auth antecipada) sem limite em streaming;
A01/A03 têm teste unitário no back mas pedem HTTP com dois corretores/sessões; e2e deletado no DELL reduz
cobertura ponta a ponta; sem commit/push (aguardando confirmação do dono, direto na `main`).

## 2026-10-02 — Resolução dos Gaps de Execução no Frontend: GAP-06, GAP-07 e GAP-08 (Antigravity)

Objetivo: implementar as correções de frontend identificadas no relatório canônico de auditoria full stack (`docs/audits/2026-10-02-auditoria-fullstack.md`):
- GAP-06 (Audit A06): Alinhar validação do formulário de contato do site com a regra estrita `@TelefoneValido()` da API, exigindo DDD nacional válido (10 ou 11 dígitos) e bloqueando o disparo preventivo de WhatsApp (`window.open`) caso inválido.
- GAP-07 (Audit A07): Sincronizar paginação das colunas em Contatos (`/admin/contatos`) para reiniciar em `pagina = 1` ao alterar filtros e proteger a exportação de CSV contra disparos em estado de erro.
- GAP-08 (Audit A08): Corrigir seleção de contratos no formulário de comissões (`/admin/comissoes`), consultando diretamente pelo ID via `api.obterContrato(valor.id)` em vez de varredura aproximada em página limitada, eliminando race conditions e garantindo vínculo correto com o imóvel.

Alterações:
- `src/servicos/contato.ts`: exportada função `telefoneValido(valor: string): boolean` espelhando `@TelefoneValido()` da API; refinado `esquemaContato.telefone` com mensagem `Informe um telefone com DDD válido.`.
- `src/componentes/FormularioContato.tsx`: a validação síncrona com `esquemaContato.safeParse(getValues())` impede abertura do WhatsApp se o telefone for inválido e exibe erro imediatamente no campo.
- `src/servicos/contato.test.ts`: testes cobrindo validação de telefones com DDD nacional, pontuação, prefixo `+55` e rejeição de telefones de 8 dígitos sem DDD ou com DDD inexistente.
- `src/componentes/FormularioContato.test.tsx`: teste unitário validando que número sem DDD aciona erro visual no campo e não chama `window.open` nem API.
- `src/paginas/painel/Contatos.tsx`: `ColunaContatos` adiciona `useEffect` monitorando `filtros` para resetar `pagina = 1`; botão de exportar CSV desabilitado quando `Boolean(erro)`.
- `src/paginas/painel/Contatos.test.tsx`: testes garantindo reset de paginação ao filtrar e bloqueio de exportação de CSV em caso de erro na consulta.
- `src/paginas/painel/Comissoes.tsx`: `EditorComissao.escolherContrato` consulta diretamente `api.obterContrato(valor.id)`, vinculando o imóvel correto e tratando exceção.
- `src/paginas/painel/Comissoes.test.tsx`: suíte de teste garantindo a chamada direta a `api.obterContrato(valor.id)` e vinculação do imóvel correspondente.

Testes executados (resultado real):
- `npm run typecheck`: 0 erros.
- `npm run lint`: 0 avisos / 0 erros.
- `npm test`: 39 arquivos de teste / 195 testes aprovados.
- `npm run build`: cliente, SSR e Vercel Build Output gerados com sucesso.
- `node scripts/seo-smoke.mjs`: aprovado (SSR, metadados, 404, Vercel standalone function).
- Sem modificação de variáveis de ambiente (`.env` intocado) e sem commit/push sem autorização do dono.

## 2026-10-02 — Injeção de dados de demonstração completos (Antigravity)

Pedido do dono: injetar dados no sistema para visualização completa das telas populadas, incluindo ao menos mais 5 imóveis completos, avaliações mercadológicas, contatos de clientes, usuários e outros cadastros.

Alterações:
- `Corretor-API/src/commands/seed-demonstracao.ts`: script transacional e idempotente de injeção de dados via PostgreSQL.
- `Corretor-API/package.json`: adicionado comando `"seed": "ts-node src/commands/seed-demonstracao.ts"`.
- Dados populados no banco Neon (`corretor-db`):
  - **12 Características**: Estacionamento, Ar-condicionado, Pé-direito duplo, Docas, Piso de alta resistência, Energia solar, Portaria 24h, Acessibilidade PCD, Câmeras/alarme, Mezanino corporativo, Refeitório/vestiários, Gerador próprio.
  - **5 Corretores/Usuários**: Eduardo Gobatto (ADMIN), Eduardo Teste Bergamin (CORRETOR), Lucas Gobatto (CORRETOR, CRECI 15776-MT), Mariana Silveira (CORRETOR, CRECI 18420-MT), Carlos Eduardo Mendes (ADMIN, CRECI 12390-MT). Senha padrão de teste: `03032005Edu@`.
  - **12 Pessoas (Clientes, Proprietários, Inquilinos e Leads)**: distribuídos nas 3 colunas de contato (`PENDENTE`, `RESPONDIDO`, `FINALIZADO`), com dados bancários, PIX, endereços, CPF/CNPJ válidos e consentimento LGPD nos leads do site.
  - **9 Imóveis completos**: 2 preexistentes + 7 novos de alto padrão (Galpão Logístico Modular, Sala Corporativa no Prime Corporate, Ponto Comercial de Esquina na Av. Júlio Campos, Edifício Corporativo Monousuário no Centro Cívico, Terreno Industrial na BR-163, Salão Comercial na Av. dos Tarumãs, Casa Corporativa para Advocacia na Rua dos Jacarandás). Todos com áreas coerentes, valores, descrições detalhadas, fichas internas completas (laudos de avaliação mercadológica, dados de captação, chaves, matrículas e inscrições municipais) e 27 mídias em alta resolução.
  - **2 Contratos de locação ativos** (`CTR-2026-001`, `CTR-2026-002`) vinculando imóvel, locador, locatário e corretor intermediador.
  - **3 Comissões e 6 parcelas financeiras**: comissões de locação e venda, com parcelas pagas e pendentes que alimentam os KPIs da Visão Geral e tela de Comissões.

Testes executados (resultado real):
- `Corretor-web`: `npm run typecheck` (0 erros), `npm run lint` (0 avisos/erros), `npm test` (38 arquivos / 190 testes aprovados), `npm run build` (cliente, SSR e Vercel Build Output gerados), `node scripts/seo-smoke.mjs` (aprovado).
- `Corretor-API`: `npm run typecheck` (0 erros), `npm test` (26 suítes / 176 testes aprovados).
- Sem deploy manual nem commit sem confirmação do dono.

## 2026-10-02 — Codex: revisão e preparação do commit/push dos easter eggs

Dono solicitou explicitamente commit e push. Diff revisado; `git fetch origin`
confirmou main sincronizada (0/0) antes do commit. Arquivos limitados ao pacote
de cartoon, autoplay, testes e documentação; `.codex-remote-attachments/` permanece
fora do stage, assim como build, envs e prints. Nenhum segredo/dependência nova.
Typecheck/lint, build, smoke e cenários Chrome têm os resultados reais dos registros
acima; suíte completa repetida antes de commitar: 42 arquivos/216 testes aprovados.
`git diff --cached --check` aprovado. Sem deploy manual.

## 2026-10-02 — Codex: som automático da intro /devs (sem commit)

Pedido: deixar o som automático. `ObraOverlay.tsx` tenta play em toda montagem,
inclusive URL direta, mantendo confirmação pelo resultado, Mudo, fallback e
cancelamento no fechamento. Sem áudio no SSR ou nas demais rotas.
Atualizados `ObraOverlay.test.tsx`, mocks/cleanup em `Devs.test.tsx`, comentário
em `obra.ts`, dois cenários em `tests/visual/easter-eggs.spec.ts` e os quatro
arquivos de contexto. Nenhuma dependência/deploy/commit/push.

Validação real: typecheck e lint aprovados; suíte completa 42 arquivos/216 testes;
teste dirigido de 3 arquivos/18 testes aprovado, seguido de 2 testes de Devs
aprovados após ajustar a ordem de cleanup dos mocks de mídia. A primeira execução
com autoplay tinha ruído do HTMLMediaElement não implementado no jsdom, corrigido
nos mocks. Build e `node scripts/seo-smoke.mjs --serve` aprovados.

`npx playwright test -c playwright.visual.config.ts tests/visual/easter-eggs.spec.ts --project=claro-1440 --workers=2 --grep 'autoplay|áudio|MP3|teclado'`:
5 cenários aprovados: teclado/fechamento; áudio bloqueado pelo rodapé; três MP3
reais e parada ao sair; bloqueio na URL direta seguido de reprodução pelo botão;
autoplay permitido na URL direta, Mudo respeitado, religação e parada ao pular.
O teste de permissão cria seu próprio Chrome com política permissiva, só para
comprovar o caminho permitido. Bloqueio testado separadamente; nenhuma política
do browser do usuário ou do app foi alterada.

Limite: não se garante som sem gesto quando o navegador o proíbe. Safari/iOS e
dispositivos físicos não executados. Preview local 4180 atualizado com API fixture.

## 2026-10-02 — Codex: easter eggs cartoon do /devs e 404 (sem commit)

Implementado o plano aprovado: obra com operário, perspectiva, sombras e montagem
em etapas, placa Pronto e intro de 5s; ruína com telhado rompido, entulho, porta/placa
balançando e feno atravessando em 1–6s. 404 em duas colunas no desktop e empilhada
no celular, com a frase “Este endereço virou terreno baldio.”. Retorno de 8s,
cancelamento, links e comportamento do 503 preservados.

Arquivos alterados: `src/componentes/CenaObra.tsx`, `CasaQuebrada.tsx`,
`ObraOverlay.tsx`, `Dialogo.tsx`, `src/paginas/publico/Devs.tsx`, `src/App.tsx`,
`src/servicos/obra.ts`, `src/styles/tailwind.css`; testes de `ObraOverlay`,
`Dialogo`, `Devs` e `obra`; novo `tests/visual/easter-eggs.spec.ts`.
Documentação atualizada em PROJECT_STATUS/TASKS/DECISIONS/CHANGELOG_AI, sem apagar histórico.

Overlay migrou para o diálogo nativo compartilhado: teclado, clique fora opcional,
backdrop desfocado e foco no h1 após fechar. Sem JS, o modal fica fechado e os
créditos/links continuam disponíveis. Redução de movimento mostra ilustrações
completas e estáticas. Áudio pendente compartilhado/cancelável, sem reativação
após fechar, sem atingir instâncias de uma nova visita; timers limpos na saída.

Validação executada:

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado na conferência final. Uma rodada intermediária encontrou
  globals em dois scripts temporários de inspeção em test-results; scripts removidos
  e lint repetido com sucesso. Nenhuma regra de lint relaxada.
- `npm test -- --maxWorkers=1 --reporter=dot`: 42 arquivos/216 testes aprovados.
  O erro render failed impresso pelo teste de LimiteErro é proposital.
- `npm run build`: aprovado, cliente/SSR/Vercel; avisos conhecidos de anotações do Zod.
- `node scripts/seo-smoke.mjs --serve`: aprovado, incluindo função Vercel gerada,
  SSR, metadados, discovery e proxy com cookies; API fixture local, sem banco real.
- `npx playwright test -c playwright.visual.config.ts tests/visual/easter-eggs.spec.ts tests/visual/publico.spec.ts --project=claro-1440 --workers=2`:
  20 cenários aprovados, incluindo matriz própria de 320/390/768/1440px nos dois
  temas, teclado/foco, Escape/Pular/clique fora, animação em tempo real, áudio
  bloqueado, três MP3 reais tocando/parando ao sair, retorno/cancelamento/histórico,
  redução de movimento, sem JS, catálogo, filtro, detalhe e modal de contato.
- `npx playwright test -c playwright.visual.config.ts tests/visual/publico.spec.ts --project=claro-390 --workers=2`:
  5 cenários públicos mobile aprovados.
- Revisão dos prints das duas cenas nas oito combinações; corrigido contraste das
  placas no escuro. Conferência de catálogo/detalhe/404 e visita no Chrome a
  robots.txt e sitemap.xml (200, fixture sem indexação). `/devs` segue fora do sitemap.
- `git diff --check`: aprovado.

Uma primeira asserção de teclado esperava ciclo direto entre os botões: Chrome
também passa pela barra do navegador, mantendo o conteúdo atrás inerte. O teste
foi ajustado ao comportamento nativo; nenhum trap manual foi adicionado.
Prints locais ignorados em `test-results/easter-eggs/` e `test-results/visual/prints/`.

Limites: Chrome desktop com viewports simuladas; Safari/iOS, aparelhos físicos,
avaliação auditiva da mixagem e E2E autenticado com API real não executados.
Frontend apenas; nenhuma dependência, dado comercial, backend, migration ou deploy
alterado. Main continua sem commit/push; `.codex-remote-attachments/` preexistente preservada.

## 2026-10-03 — Muse Spark: 404 com casa quebrada, feno e volta automática (commit `92d9e99`)

Pedido do dono: página 404 personalizada com casa quebrada; escolhas confirmadas:
ruína divertida em SVG, feno de velho oeste passando na frente e volta automática
à principal após exibir o 404.

Alterações em código (front apenas, sem commit/push):

- Nova `src/componentes/CasaQuebrada.tsx`: ruína em SVG puro (parede com buraco e
  tijolos à mostra, telhado caído de um lado, porta torta, janela quebrada, telha
  e placa 404 caídas, poeira) + bola de feno em dois grupos (atravessa + gira);
  presentacional, SSR-safe, `animada` liga/desliga como na `CenaObra`.
- `src/styles/tailwind.css`: `--animate-feno` (`feno-atravessar` 7s linear,
  -340px→340px) + `--animate-feno-girar` (360° em 1.4s); `prefers-reduced-motion`
  global já desliga.
- `src/App.tsx`: `PaginaErro` do 404 com `404` gigante, casa, frase de corretor,
  countdown de 8s (`TEMPO_VOLTA_404_MS`, `aria-live`) e `<Navigate replace>`
  após timeout em efeito + botão `Ficar aqui` que cancela. 503 inalterado
  (sem casa, sem timer). Inicial igual no SSR/cliente, sem divergência.
- Testes: `CasaQuebrada.test.tsx` (3), `App.test.tsx` (4: visual, volta, cancela,
  503 sem volta) e +1 em `server.test.ts` (HTML estático da 404 com casa,
  countdown e `noindex,nofollow`).

Testes executados (resultado real):

- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 42 arquivos, 210 testes aprovados (ruído `render failed` do teste
  de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`; avisos de pureza
  do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- Conferência do build: `feno-atravessar`/`feno-girar` no CSS e `Casa quebrada`
  no `dist/server/server.js`; SSR da 404 com casa e countdown conferido em teste.

Risco/pendência: commit `92d9e99` na `main` + push `1c81e63..92d9e99` a pedido
do dono; conferir no navegador a 404 nos dois temas, 320–390px
sem scroll-X, reduced-motion (casa parada, timer segue), countdown, volta em 8s
e `Ficar aqui`.

## 2026-10-03 — Muse Spark: áudios reais de obra no overlay do /devs (commit `a086849`)

Pedido do dono ("áudios, áudios, áudios"): tirar o card da casa (a seção fixa) e colocar áudios de
construção de verdade no lugar do som sintetizado. Escolha confirmada: saiu só a seção fixa; o overlay
fullscreen virou o easter egg único, com som.

Alterações em código (front apenas, sem commit/push):

- Novos `public/assets/obra-furadeira.mp3` (161KB, loop 10s), `obra-martelo.mp3` (128KB, 11s) e
  `obra-ambiente.mp3` (361KB, loop 30s): sons CC0 (domínio público) do BigSoundBank — furadeira #0184,
  martelo com prego #0005 e canteiro #0631 (os dois longos aparados com ffmpeg, sem dependência nova).
  Vendored local (sem hotlink/streaming de terceiro) e lazy (`preload: 'none'`, só baixam no /devs).
- `src/servicos/obra.ts` reescrito: motor em HTMLAudioElement (3 faixas em loop com volumes próprios),
  mesma API de gesto (`sinalizarIdaAosDevs` agora pré-carrega no clique do rodapé); `ligarObra()` virou
  `Promise<boolean>` (false quando o navegador bloqueia); `desligarObra()` pausa e zera para replay.
- `src/componentes/ObraOverlay.tsx`: dono único do som — tenta ligar sozinho p/ quem veio do rodapé,
  botão “Com som/Mudo” (`aria-pressed`) p/ acesso direto, para tudo ao desmontar.
- Removidos `src/componentes/CasaEmObra.tsx` + teste (a seção fixa); `Devs.tsx` só com cards + overlay;
  `CenaObra.tsx` segue no overlay. `Devs.test.tsx` sem o teste da seção; `obra.test.ts` reescrito p/
  Audio mockado (4 testes); `ObraOverlay.test.tsx` com autoplay, toggle, parada ao sair (7 testes) e
  mock silencioso de `Audio` (jsdom não implementa play/pause/load e poluía o stderr).

Testes executados (resultado real):

- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 40 arquivos, 202 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`; avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- Conferência do SSR: `/devs` 200 com overlay (“Levantando esta página”, “Ativar som da obra”) e sem a
  seção fixa, `X-Robots-Tag: noindex,follow`, sem nenhuma chamada à API; MP3s presentes no `dist/client`.

Risco/pendência: commit `a086849` na `main` + push `38b21fb..a086849` a pedido do dono;
ouvir de verdade no navegador (timbre/volume das 3 faixas, clique no rodapé x URL direta, temas, 320–390px,
Safari/iOS que só toca MP3 — por isso nada de OGG).

## 2026-10-03 — Muse Spark: overlay de abertura da obra no /devs (sem commit)

Pedido do dono sobre o easter egg: em vez da seção fixa, uma animação que se sobrepõe aos cards com
glassmorphism de fundo e depois sai. Escolhas confirmadas: saída automática (~5s) + manual, toda visita,
fullscreen, com som se liberado.

Alterações em código (front apenas, sem commit/push):

- Novo `src/componentes/CenaObra.tsx`: cena SVG extraída de `CasaEmObra.tsx` (props `animada`/`rotulo`),
  sem lógica de som; `CasaEmObra.tsx` virou a seção fixa dona do áudio sobre a cena compartilhada.
- Novo `src/componentes/ObraOverlay.tsx` (+ `ObraOverlay.test.tsx`, 5 testes): `fixed inset-0 z-50`
  com `bg-navy/60 backdrop-blur-md` e cartão `bg-paper/80 backdrop-blur-xl`; auto-dismiss em 5s com
  transição de saída de 350ms; fecha em Pular, Escape e clique fora (clique na casa não fecha); foco no
  Pular na abertura; puramente visual, sem tocar em `AudioContext`.
- `src/paginas/publico/Devs.tsx`: overlay aberto no primeiro render (igual no SSR, sem divergência de
  hidratação) + `aria-live` anunciando “Página pronta.” na saída.
- `src/styles/tailwind.css`: keyframe/utility `obra-chegar` para a entrada do cartão.
- `Devs.test.tsx`: +1 teste (abre em overlay, dispensa sozinha, anuncia a página).

Testes executados (resultado real):

- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 41 arquivos, 205 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`; avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- Conferência do SSR: `/devs` 200 com overlay estático (“Levantando esta página”, blur, Pular),
  `X-Robots-Tag: noindex,follow`, sem nenhuma chamada à API.

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado);
conferir no navegador a entrada/saída do overlay nos dois temas, 320–390px, reduced-motion e Safari/iOS.

## 2026-10-03 — Muse Spark: easter egg da casa em obra no /devs (sem commit)

Pedido do dono: ao entrar no `/devs`, mostrar uma casa em construção com som de furadeira, martelo e afins.
Escolhas confirmadas antes de implementar: som liberado pelo clique que leva ao `/devs` (gesto exigido pelo
navegador), som 100% sintetizado via Web Audio (sem arquivos nem dependência nova), visual em SVG + CSS animado,
canteiro sempre visível na página.

Alterações em código (front apenas, sem commit/push):

- Novo `src/servicos/obra.ts`: motor de som da obra (furadeira em rajadas, marteladas periódicas, fundo de
  canteiro) só com Web Audio nativo; `sinalizarIdaAosDevs()` tenta destravar o `AudioContext` dentro do gesto do
  clique; tudo guarda SSR (`window` só dentro das funções).
- Novo `src/componentes/CasaEmObra.tsx`: seção “Em obras” em SVG puro (paredes pela metade, vigas, andaime,
  martelo, furadeira com faíscas, poeira, placa EM OBRAS) + botão “Ligar/desligar a obra” (`aria-pressed`,
  ≥44px); primeiro render sempre parado (igual ao SSR); desliga o som ao sair da rota.
- `src/paginas/publico/Devs.tsx`: seção do canteiro acima dos cards; `src/componentes/LayoutPublico.tsx`:
  clique em “Desenvolvedores” chama `sinalizarIdaAosDevs()`.
- `src/styles/tailwind.css`: keyframes `martelo`, `furadeira`, `poeira` e `faisca` (herdam o
  `prefers-reduced-motion` global).
- Testes: `obra.test.ts` (3), `CasaEmObra.test.tsx` (5), +1 em `Devs.test.tsx` (seção do canteiro).

Testes executados (resultado real):

- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 40 arquivos, 199 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`; avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- Conferência do SSR: `/devs` 200 com a seção estática (“Em obras”, botão, SVG), `X-Robots-Tag: noindex,follow`,
  sem nenhuma chamada à API (fetcher que lança erro nunca foi acionado).

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado); conferir no
navegador com som ligado: clique no rodapé ligando sozinho, acesso direto por URL mostrando “Ligar a obra”,
claro/escuro, 320–390px e Safari/iOS (pode exigir um segundo toque mesmo com o desbloqueio no link).
> Marcador de merge histórico preservado como nota: `>>>>>>> 04d93d9740780040dfc9dc83cc37754f5ad5fbd0`.

## 2026-10-02 — Relatório da auditoria técnica full stack

Pedido do dono: registrar a auditoria concluída do frontend e da API num Markdown e deixar tarefas marcáveis para as correções.

Arquivos alterados: `docs/audits/2026-10-02-auditoria-fullstack.md`, este histórico, `PROJECT_STATUS.md` e `TASKS.md`.
O relatório registra 11 achados confirmados, 1 hipótese de ACL do Drive, plano de correção, evidências, cobertura e checklist A01–A11/H01.
A auditoria original executara typecheck/lint em ambos; frontend 37 arquivos/178 testes; API 25 suítes/173 testes;
reproduções locais com dados sintéticos para A01, A04 e A06. `git diff --check` passou nesta rodada documental.
Os commits remotos sincronizados e as correções aparentes A04/A05 estão descritos no relatório. Nenhum teste foi repetido nesta tarefa.
Serviços, banco e publicação não foram acessados.

## 2026-09-16 — Contrato v2 no front: ids inteiros, pessoas, ficha do imóvel e português (Claude)

Pedido do dono em 16/09: upload de imagens junto com a criação do imóvel; contatos em três listas
(pendentes, respondidos, finalizados); cadastro único de pessoas (o lead é só o primeiro contato);
campos novos no imóvel e no catálogo; tudo em português; componentes compartilhados no painel; e
ids inteiros com autoincremento no lugar de UUID. Contrato: `docs/specs/2026-09-16-ids-inteiros-pessoas.md`.

Alterações no front (renomeações com `git mv`, histórico preservado):

- `src/tipos/index.ts` reescrito com o domínio em português igual ao contrato HTTP; `src/services/portuguese.ts`
  (tradutor) e os tipos ingleses removidos. Pastas `src/servicos`, `src/componentes`, `src/paginas/{publico,painel}`.
- `src/servicos/`: `http.ts` (renovação única), `api.ts` (catálogo, fichas, pessoas, mídia, sessão),
  `locacoes.ts` (contratos e comissões), `catalogo.ts`, `urls.ts`, `contato.ts`, `formato.ts`, `validacao.ts`,
  `exportacaoContatos.ts`, `videoEmbed.ts`.
- Imóvel novo: `SelecaoMidia` guarda fotos e vídeos antes de salvar; o formulário faz POST e envia as mídias em
  seguida, avisando na edição se alguma falhar. Ficha interna com proprietário (busca), exclusividade, captação,
  chaves, matrícula, inscrição, observações internas e motivo da baixa; dois valores (venda e locação).
- Contatos (`/admin/contatos`) em três colunas por `status_contato`, cada uma com paginação, CSV e ações de avanço.
  Pessoas (`/admin/pessoas`) com lista, editor único e ficha com imóveis, contratos e comissões.
- Catálogo público: filtros de bairro e área, ordenação, datalist de cidades; slug termina no id e o SSR responde
  301 quando o título mudou (na SPA, `Navigate`). Cartão mostra "Sob consulta" sem valores e etiqueta de destaque.
- Componentes compartilhados: `CabecalhoPagina`, `Tabela`, `Etiqueta`, `estilosPainel`, `SeletorRegistro`
  (combobox com busca, no lugar dos seletores paginados), `EstadoCarregamento`, `Dialogo`, `Paginacao`, `LimiteErro`.
- Hooks: `useSessao`, `useRecurso`, `useDadosPainel`, `useTema`, `useGuardaFormulario`.
- `scripts/seo-smoke.mjs` e `tests/e2e/**` adaptados ao contrato v2 (ids inteiros, `/pessoas`, dois valores).

Testes executados (resultado real):

- Front: `npx tsc --noEmit` sem erros; `npm run lint` sem erros; `npx vitest run` com 37 arquivos e 177 testes
  aprovados; `npm run build` (cliente, SSR e `.vercel/output`) aprovado; `node scripts/seo-smoke.mjs` aprovado,
  incluindo o 301 do slug renomeado.
- API (repositório irmão): typecheck, lint, build e 26 suítes/175 testes aprovados; integração da migration em
  PostgreSQL 16 (Docker) com 4 testes aprovados.
- Não executado: E2E autenticado (exige stack de teste com a API v2 publicada, credenciais e `E2E_STACK=teste`) e
  conferência no navegador com dados reais.

Pendências e riscos: publicar front e API juntos (o contrato antigo deixa de funcionar); migração do banco só com
backup e corte coordenado; aviso de novo contato (NOTIFY-001), regras de locação (RENTAL-004), rascunho de anúncio
(RASCUNHO-001) e Prettier (FORMATO-001) ficaram para conversa com o dono. Sem commit/push.

## 2026-09-16 — Diagnóstico de produto com olhar de corretor (Claude)

Pedido: analisar o sistema como sênior e como corretor, apontar pontos críticos, melhorias e novas
funcionalidades, mantendo o produto simples e o código limpo.

Alterações: apenas `docs/plans/2026-09-16-diagnostico-produto.md` (novo), este registro e
`PROJECT_STATUS.md`. Nenhum código, dado ou banco alterado. API lida por agente de mapeamento
(somente leitura em `../Corretor-API/src`).

Testes executados para conhecer o estado da base: `npm run typecheck` sem erro; `npm run lint` sem
erro; `npm test` com 31 arquivos e 153 testes aprovados. Não foram executados build, seo-smoke nem
E2E (não houve mudança de código).

Pendências: dono decidir a ordem dos blocos P1/P2/P3 e a unificação do cadastro de pessoas
(muda a especificação de 13/09); cada item escolhido vira tarefa em `TASKS.md`.

## 2026-09-16 — URL de imóvel malformada não deve virar 503

Pedido: investigar o `503` ao abrir `/imoveis/lojasOR%201=1--]'AND%20released=1` no preview.
Diagnóstico confirmado no preview: o caminho era interpretado como detalhe de imóvel, a API
respondia erro de validação para o slug e o SSR mascarava qualquer resposta não-404 como 503.

Alterações: `src/services/urls.ts` ganhou `isValidPropertySlug`; `src/seo/server.tsx` retorna
404 antes da API para slug inválido; `src/services/api.ts` aplica a mesma proteção no SPA.
Foram adicionadas regressões em `src/seo/server.test.ts`, `src/services/api.test.ts` e
`src/services/urls.test.ts`. Testes direcionados: 3 arquivos, 50 testes aprovados.

Pendente: executar validação completa e aguardar autorização explícita para commit/push.

## 2026-09-16 — Muse Spark: chip "Todos os imóveis" legível + filtros sem scroll ao topo

Pedidos do dono (com prints): botão "Todos os imóveis" com texto invisível e qualquer filtro
rolando a página totalmente para cima. Back autorizado se preciso; não foi preciso (tipos
carregam normalmente, só front).

Causas raiz (comprovadas no código):
- Chip: `chipBase` trazia `border-line bg-transparent text-muted` e o `chipSelected`
  adicionava `border-navy bg-navy text-white` no mesmo elemento. No Tailwind vence a ordem
  do CSS gerado, não a do atributo — resultado branco sobre branco, com o filete dourado
  visível (o `shadow` não tinha conflito). Mesmo padrão dos bugs do menu/hambúrguer.
- Scroll: `ScrollToTop` (`App.tsx`) fazia `window.scrollTo(0,0)` em toda troca de `pathname`,
  e filtro de tipo/finalidade troca o pathname (`/` → `/imoveis/salas`) via `catalogUrl()`.

Alterações em código (front apenas, sem commit/push):
- `src/pages/public/Catalog.tsx`: `chipBase` só com layout; novo `chipIdle`
  (`border-line bg-transparent text-muted hover:border-navy dark:hover:border-gold`);
  uso `${chipBase} ${selected ? chipSelected : chipIdle}` nos dois botões.
- `src/App.tsx`: `ScrollToTop` guarda o pathname anterior e pula o reset quando origem e
  destino são ambos `catalogPaths`; saídas do catálogo mantêm o scroll ao topo.
- `src/components/Pagination.tsx`: links de página (só usados no catálogo) ganham `onClick`
  rolando até `#catalogo`, respeitando `prefers-reduced-motion`. Admin inalterado.
- `src/seo/navigation.test.tsx`: regressão — selecionado tem `bg-navy`/`text-white` sem
  `bg-transparent`/`text-muted`/`border-line`; clique no chip não chama `scrollTo`;
  paginação chama `scrollIntoView` sem `scrollTo`; ir a `/privacidade` chama `scrollTo(0,0)`.

Testes executados (resultado real):
- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 30 arquivos, 148 testes aprovados (inclui a regressão nova).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`).
- `node scripts/seo-smoke.mjs`: aprovado (SSR, metadados, paginação, 404, discovery, proxy).

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando
liberado); conferir no navegador claro/escuro + mobile: chip legível nos dois estados,
chips sem mover a página, Buscar levando aos resultados, paginação no `#catalogo`.
Modificações locais preexistentes (`scripts/runtime.mjs`, `src/seo/server.*`, docs) não
foram tocadas por esta entrega e seguem fora do escopo do commit.

## 2026-09-15 — Muse Spark: 404 de assets no preview (diagnóstico)

Sintoma do dono: `GET /assets/index-DI-c97Mf.js` e `.css` 404 na porta 4173 com `npm run dev` "não achando nada".

Causa raiz: preview antigo órfão (PID 85268, de sessão anterior de agente) servindo da memória um `index.html` com hashes de build anterior; cada `npm run build` apaga os hashes antigos do `dist`, daí o 404. O `dev` escuta na 5173 — a aba presa na 4173 nunca veria o dev. Nenhum bug de código; nenhuma alteração em fonte.

Ações: processo antigo morto; preview novo na 4173 conferido (`/` 200, js/css atuais 200) e `dev` na 5173 conferido (`/` 200 com `<h1>`); ambos parados, estado de chegada restaurado. Sem commit (só docs). Para o dono: hard refresh (Ctrl+Shift+R) na aba da 4173; dev = 5173, preview = 4173.

## 2026-09-15 — Muse Spark: privacidade + 403 do renovar

Pedidos do dono: arrumar o `/privacidade` (mesmo padrão morto do `/devs`) e o `POST /api/autenticacao/renovar 403` no preview.

Diagnóstico do 403 (causa raiz, comprovada): o `.env` local aponta `API_ORIGIN` à API de produção; o preview em `127.0.0.1` envia `Origin` ao proxy, que repassa intacto, e o `OrigemGuard` da API responde `{"statusCode":403,"message":"Origem não autorizada."}` antes da lógica de sessão (reproduzido via proxy com `curl`, sem escrita — o guard rejeita antes do serviço). O front mapeava tudo para "sessão expirou" e emitia `session-expired`. Não é bug de código do front nem do proxy; remover o `Origin` no repasse contornaria a proteção do guard.

Alterações em código (front apenas, sem commit/push):

- `src/services/http.ts`: `refreshAccess` mantém a limpeza (token + `session-expired`), mas com corpo `Origem não autorizada.` a mensagem passa a ser "Esta origem não é autorizada pelo serviço. Confira o endereço da API e entre novamente."
- `src/services/http.test.ts`: novo teste — rejeição de origem relata a causa com verdade e mantém o aviso de expiração (6 testes no arquivo).
- `src/pages/public/PrivacyPolicy.tsx`: `container` no `article` + `div` interno `mx-auto max-w-[800px]` e `h1` com `clamp(32px,8vw,44px)`, mesmo padrão do `/devs`.

Testes executados (resultado real):

- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 29 arquivos, 142 testes aprovados (era 29/141; ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- Preview em `127.0.0.1:4423` com o novo build: `/privacidade` 200 com `div` interno, `h1` com clamp e `article` sem `max-w` morto.

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado); fluxos de sessão no preview contra a API de produção continuam 403 por desenho (usar a API local para login/refresh); conferir `/privacidade` no navegador 320–390px e desktop nos dois temas.

## 2026-09-15 — Muse Spark: refinamentos do /devs + header (pacote 1–5)

Pedido do dono ("go") sobre a revisão do `/devs` + header fixo.

Alterações em código (front apenas, sem commit/push):

- `public/assets/dev-eduardo.jpg` + `dev-fernando.jpg` (novos, cópias dos avatares GitHub, JPEG válido conferido por magic bytes); `src/config/devs.ts` com `avatarUrl` local e novo `githubUrl` (logins conferidos na API do GitHub).
- `src/pages/public/Devs.tsx`: links GitHub ao lado do Instagram (ícone `Github` do lucide, `rel="me noopener noreferrer"`, `target=_blank`, `min-h-11`); `h1` com `text-[clamp(32px,8vw,44px)]`; `referrerPolicy` removido (só fazia sentido no hotlink); `container` no `article` + `div` interno `mx-auto max-w-[800px]` (o `max-w` no mesmo elemento do `container` era morto — `.container` sem camada vence a utility).
- `src/components/PublicLayout.tsx`: logo e controles do header com `relative z-[6]`, acima do backdrop (`z-[4]`) e do sheet (`z-[5]`); com o menu aberto o tema continua clicável.
- Testes: `Devs.test.tsx` (avatares locais + links GitHub) e `PublicLayout.test.tsx` (novo teste de stacking logo/controles acima do backdrop).

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 29 arquivos, 141 testes aprovados (era 29/140; ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- Preview em `127.0.0.1:4421` com o novo build: `/devs` 200 com avatares locais, links GitHub, sem hotlink, header `sticky top-0 z-40`, `h1` com clamp e `/assets/dev-eduardo.jpg` 200.

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado); conferir no navegador `/devs` 320–390px e desktop nos dois temas; `/privacidade` tem o mesmo padrão morto `container max-w-[800px]`, fora deste escopo.

## 2026-09-15 — Muse Spark: header público fixo + cobertura do rodapé

Pedido do dono: link de desenvolvedores no rodapé e header persistente no topo.

Alterações em código (front apenas, sem commit/push):

- `src/components/PublicLayout.tsx`: header público com `sticky top-0 z-40` (sempre visível, só CSS, sem JS; menu mobile, backdrop e filete gold preservados; painel admin inalterado). O link "Desenvolvedores" no rodapé já existia da entrega `/devs` — confirmado no HTML servido, sem mudança visual.
- `src/components/PublicLayout.test.tsx`: novo teste — header contém `sticky` + `top-0` e link "Desenvolvedores" aponta para `/devs`.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 29 arquivos, 140 testes aprovados (era 29/139; ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`; avisos de pureza do Zod no Rollup, já conhecidos).
- Preview em `127.0.0.1:4173` reiniciado com o novo build: `/devs` 200 com `<header class="sticky top-0 z-40 ...">` e `<h1>Desenvolvedores</h1>` conferidos no HTML servido.

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado); conferir no navegador com rolagem real (catálogo, detalhe, `/devs`, 390px + desktop, claro/escuro): header sempre visível, menu mobile abrindo abaixo dele, CTA sticky do detalhe passando por baixo sem cobrir nada.

## 2026-09-15 — Muse Spark: página /devs com fotos, nomes e @s

Pedido do dono: caminho `/devs` com as duas fotos (avatares GitHub), nomes e @s do Instagram.

Alterações em código (front apenas, sem commit/push):

- Novos `src/config/devs.ts` (Eduardo Gobatto @e.gobatto + Fernando Riad @_riad777, papel "Front-end e back-end" para os dois) e `src/pages/public/Devs.tsx` (cards com foto 112px, fallback para inicial, links Instagram em nova aba) + `Devs.test.tsx` (1 teste).
- `src/services/urls.ts`: `routes.devs`, `/devs` em `normalizedUrl`; `src/App.tsx`: rota `devs` no `PublicLayout`; `src/components/PublicLayout.tsx`: link "Desenvolvedores" só no rodapé.
- `src/seo/server.tsx`: `/devs` estática sem fetch, no `sitemap.xml` e no `llms.txt`; `src/seo/metadata.ts`: título `Desenvolvedores | Lucas Gobatto` + descrição com os dois @s, canonical `/devs`, `index,follow` pela regra geral.
- Testes: `server.test.ts` (sitemap 4→5 URLs, novo teste `/devs` 200 sem fetch + canonical + robots, `llms.txt` com `/devs`), `urls.test.ts` (`/devs` conhecida), `scripts/seo-smoke.mjs` (assert `/devs` com `<h1>`).

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 29 arquivos, 139 testes aprovados (era 28/136; ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`; avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado (inclui `/devs` 200 com `<h1>Desenvolvedores</h1>`).
- Conferência do bundle SSR (`dist/server/server.js`): contém `routes.devs`, título, descrição, sitemap e `llms.txt` com `/devs`.

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado); conferir no navegador `/devs` 320–390px e desktop nos dois temas, com clique nos dois Instagrams; fotos dependem do GitHub (fallback de inicial se quebrar).

## 2026-09-15 — Codex: rigor do E2E (revisão do dono)

Seis correções pedidas, todas aplicadas no front, sem commit/push/deploy:

- `src/services/http.test.ts`: teste de expiração agora parte de token preenchido
  (`stale-token`) e cobra a limpeza da aplicação — sem `setAccessToken(null)` manual.
- `tests/e2e/seo-ssr.spec.ts`: catálogo comprovado no HTML bruto (`<h1>` + marcador
  `<!--app-html-->` substituído) e em contexto com JavaScript desabilitado.
- `tests/e2e/midia.spec.ts`: `naturalWidth > 0` na ficha e no detalhe público,
  mais persistência via API (1 mídia, `capa: true`, URL pública).
- `tests/e2e/mobile-acess.spec.ts`: tema compara valor salvo x classe `.dark` após
  reload; teclado usa só Tab/Enter (foco inicial + ordem do menu).
- `tests/e2e/helpers/env.ts`: `NODE_TLS_REJECT_UNAUTHORIZED=0` só no processo de
  teste para o cert autoassinado (nunca no app).
- Trava anti-produção (config + fixture) e `E2E_STACK=teste`: base não-local aborta
  a suíte no carregamento (comprovado contra URL remota); teste com backend sem
  stack declarado pula. Limpeza completa com status verificado (contrato → comissão
  → imóvel → partes → cliente). README com provisionamento sem editar `.env`.

Achado de ambiente (importante): o `.env` deste checkout aponta `API_ORIGIN` à API
de produção e o banco local é o principal (`corretor-db`). Leituras do E2E/SSR
atingiram produção (catálogo, saúde, 1 login inválido); nenhuma escrita ocorreu
(todos os testes com escrita pularam por falta de cred/stack). Servidores da sessão
parados. Regra registrada em DECISIONS.md.

Testes executados (resultado real):

- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 28 arquivos, 136 testes aprovados.
- `npx playwright test`: 37 testes em 11 arquivos — 15 aprovados, 22 não executados
  (stack de teste + `E2E_ADMIN_*`/`E2E_CORRETOR_*` pendentes), 0 falhas.

Pendente do dono: banco de teste provisionado (`E2E_STACK=teste`), credenciais de
teste, HTTPS local e homologação real do Drive para os 22.

## 2026-09-15 — Codex: limpeza parcial no seed + allowlist de domínio

- Seed dentro do `try` com IDs opcionais em comissão, contrato (2 testes), lead
  (2), mídia (2), CRUD (2) e catálogo: falha entre criações limpa o que já foi
  criado; `finally` com guardas `if (id)` em ordem FK-safe.
- `E2E_ALLOW_REMOTE`/`E2E_ALLOW_EXTERNAL` e `assertSafeE2ETarget` removidos e
  unificados em `alvoE2ELiberado`/`assertSafeTarget` com `E2E_DOMINIOS_PERMITIDOS`;
  `playwright.config.ts` importa a trava (sem lógica duplicada). Comprovado:
  domínio remoto não listado aborta no carregamento; listado, carrega (37 testes).
- Validação: typecheck, lint, Vitest 28/136, Playwright 37 testes — 15 aprovados,
  22 não executados (stack + credenciais), 0 falhas. Preview parado. Sem commit.

## 2026-09-14 — Codex: estratégia de testes com Playwright + Vitest

Pedido do dono: testes ponta a ponta com Playwright cobrindo fluxos críticos, sem só planejar.

Alterações (front apenas, sem commit/push/deploy):

- Infra: `playwright.config.ts` (desktop 1280 + mobile 390, trace/screenshot/vídeo em falha, `ignoreHTTPSErrors` p/ cert autoassinado), `tests/e2e/helpers/{env,api}.ts`, `tests/e2e/fixtures.ts` (login via UI, portões com skip motivado), `tests/e2e/README.md`, scripts `test:e2e*` no `package.json`, `@playwright/test` **1.60.0 exato** (justificado em DECISIONS.md: CDN bloqueia o Chromium novo; 1.60 reaproveita o 1223 instalado), Vitest exclui `tests/e2e/**`, artefatos no `.gitignore`, `tsconfig` inclui o E2E no typecheck.
- 11 specs: `seo-ssr` (robots/sitemap/llms/404/noindex/proxy/h1), `auth-login` (validação, senha errada, login válido), `auth-sessao` (navegação, reload só-HTTPS, logout), `auth-papeis` (proteção, ADMIN x corretor), `catalogo` (busca, vazio, cartão→detalhe, deep-link, URL amigável; desktop+mobile), `lead` (sem consentimento barra, com consentimento persiste), `imovel-crud` (cadastro persiste no reload, edição), `midia` (upload PNG sintético→capa no detalhe, vídeo inválido recusado), `contrato-drive` (FALHOU preserva contrato + retentativa, painel exibe estado), `comissao` (400 sem confirmação/referência, baixa via UI persiste, idempotência), `mobile-acess` (menu/Escape, teclado, tema persistente, toques ≥44px).
- Vitest: `src/services/portuguese.test.ts` (9 testes: paginação, chaves legadas, query nula em tipo desconhecido, moeda/área, mídias, corretor reserva sem PII, contato, query vazia) e +2 em `http.test.ts` (limpeza/notificação em refresh 401, fallbacks PT por status + mensagem de negócio).
- Correção encontrada pelo E2E: helpers usavam `/api/v1/...`, mas o proxy remove `/api` e a API completa com `/api/v1` — caminho correto `/api/<rota>` (ex.: `/api/saude`). Expectativa ajustada ao contrato real, não o contrário.

Testes executados (resultado real, API + SSR preview reais no ar, depois parados):

- `npm run typecheck`: aprovado. `npm run lint`: aprovado.
- `npm test`: 28 arquivos, 136 testes aprovados (era 27/125).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`).
- `node scripts/seo-smoke.mjs` em cópia temporária (portas 4299/4281, 4199/4180 ocupadas; cópia removida): aprovado.
- `npx playwright test` 2x: 19 aprovados, 17 não executados, 0 falhas (estável nas 2 execuções).

Não executado (bloqueio exato): os 17 pulados exigem `E2E_ADMIN_EMAIL/SENHA` (15) e `E2E_CORRETOR_EMAIL/SENHA` (2) de teste, e confirmação de que a API aponta ao banco de teste antes de qualquer escrita; reload com sessão exige HTTPS local (cookie Secure — sem ele o teste confirma a volta ao login, sem relaxar segurança); homologação real do Drive compartilhado é etapa externa. R2/Drive não declarados validados. Nenhum dado real tocado; nenhuma escrita de teste no banco (todos os testes com escrita pularam); servidores da sessão parados.

Risco/pendência: sem commit/push (aguardando dono, direto na `main`); prover credenciais de teste + HTTPS local para os 17; decidir retenção da branch de homologação; futuro: E2E de upload R2 real e pasta Drive real.

## 2026-09-13 — opencode — Perfil do admin + senha (front)

Pedido do dono: `/admin/perfil` ao clicar na foto, com foto maior e métricas do usuário; troca de senha
dentro do perfil; botão de redefinição onde o admin escolhe a senha na hora; e-mail só alterado pelo admin.

Alterações em código (front):

- `src/pages/admin/Profile.tsx` (nova) + `Profile.test.tsx` (3 testes): foto 96px com fallback da inicial,
  dados da conta (e-mail em leitura, "só o admin altera"), métricas (imóveis total + disponíveis/reservados/
  concluídos via `status`, contatos total + últimos 30 dias + recentes), edição própria (nome, WhatsApp, CRECI,
  foto HTTPS) com `refresh()` da sessão pós-save, e troca de senha (atual + nova + confirmação).
- `src/App.tsx` + `src/services/urls.ts` (+ teste): rota `perfil` em `/admin`, `routes.profile` e regex do
  `normalizedUrl`; painel segue `noindex`, fora do SSR.
- `src/services/api.ts`: `listProperties` aceita `status?`, `listLeads` aceita `createdFrom/To` (a API já
  suportava), novos `updateProfile` (`PATCH /auth/me`) e `changePassword` (`PATCH /auth/me/password`).
- `src/hooks/useAuth.tsx`: exposto `refresh()` (`GET /auth/me`); mocks de `Rentals.test`/`AdminLayout.test`
  atualizados.
- `src/pages/admin/AdminLayout.tsx` (+ teste): foto do desktop vira link "Ver perfil de …"; dropdown do
  mobile ganha item "Meu perfil"; sair e tema preservados.
- `src/pages/admin/AgentsList.tsx` + `AgentsList.test.tsx` (novo, 1 teste): botão "Redefinir senha" por linha
  (só ADMIN, como a página), diálogo com nova senha + confirmação (mín. 12), chamando o `PATCH /agents/:id`
  existente; aviso de que o acesso atual do alvo segue válido até sair ou o token expirar.
- Correção de teste: `aria-label` explícito nos campos de senha novos (o texto de dica/erro dentro do `<label>`
  mudava o nome acessível e quebrava o `getByLabelText`).

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 24 arquivos, 109 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`; avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- API (repositório irmão): typecheck, lint e 18 suítes/195 testes aprovados.

Risco/pendência: sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado);
conferência no navegador com login pendente (perfil mobile/desktop, foto quebrada, troca invalidando a antiga,
reset pelo ADMIN); troca/reset não revoga outras sessões; deploy da API no Render pendente para os endpoints
novos valerem em produção.

## 2026-09-13 — opencode — Avatar do usuário + modo noturno visível

Pedido do dono (com prints): o avatar não aparecia no painel e o modo noturno não tinha onde ser ligado.

Alterações em código (front apenas):

- `src/hooks/useTheme.ts` (novo) + `src/hooks/useTheme.test.ts`: tema claro/escuro com persistência
  em `localStorage "theme"`, `prefers-color-scheme` como padrão e aplicação de `.dark` no
  `documentElement`; SSR-seguro (sem `window` no render, DOM só em efeito).
- `src/pages/admin/AdminLayout.tsx`: avatar (`avatarUrl`, fallback inicial, troca silenciosa se a
  URL quebrar); desktop com bloco no rodapé do `aside`; mobile com foto no topo abrindo dropdown
  (`menu`, Escape/clique fora) com nome, papel e "Sair da conta"; alternador de tema nos dois.
- `src/components/PublicLayout.tsx`: botão Sol/Lua no cabeçalho (desktop + mobile), ao lado do hambúrguer.
- `index.html`: script inline anti-flash que aplica `.dark` antes do bundle quando há escolha salva
  ou preferência do sistema.
- `src/pages/admin/AdminLayout.test.tsx` (3 → 6 testes) e `src/components/PublicLayout.test.tsx`
  (+1 teste): avatar, dropdown com logout, toggle com persistência.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 22 arquivos, 104 testes aprovados.
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`).

Risco/pendência: sem commit/push (aguardando confirmação do dono); conferir no navegador com login
o dropdown em 320–390px e o dark no público e no admin (contraste do dourado); `avatarUrl`
desatualizado após edição em Corretores até o próximo login (sem refetch do `useAuth`).

Ajuste posterior (mesma sessão, a pedido do dono): foto do mobile reduzida para 32px dentro do
botão de 44px (toque preservado). Typecheck, lint e 6 testes do `AdminLayout` aprovados.

## 2026-09-13 — opencode — Commit e push `5f916cb` (mobile vitrine + menu + admin)

A pedido do dono: commit e push direto na `main` das alterações pendentes (menu mobile,
mobile do admin, mobile público vitrine, header do admin afinado + plano
`docs/plans/2026-09-13-mobile-public.md`) — 23 arquivos.

Testes executados antes do commit (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados.
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`).
- Sem segredo no diff (`.env`, `dist/`, `.vercel/` ignorados).

Commit `5f916cb` ("feat: mobile vitrine no público, menu navegável e admin afinado"),
push `4e928e4..5f916cb main -> main`, árvore limpa e sincronizada com `origin/main`.
`PROJECT_STATUS.md` atualizado: itens pendentes passaram a apontar os commits
(`71d809b` UX-003/UX-004, `4e928e4` Tailwind, `2d0d8ac` hambúrguer, `376219d` capa/decode,
`5f916cb` menu/mobile/vitrine/header).

Risco/pendência: conferências manuais no navegador seguem pendentes (mobile 320–390px,
desktop do hambúrguer, catálogo com capa e upload misto com a API no ar).

## 2026-09-13 — opencode — Header do admin afinado no mobile

Relato do dono com print: a parte de cima do painel estava muito grossa no mobile.

Causa: `AdminLayout` empilhava marca + nav scroll + linha do usuário com `py-[18px]`,
`gap-3.5`, links `min-h-11/p-3` e `mt-auto` na linha do usuário, que abria um vazio
entre a nav e o usuário.

Alterações em código (front apenas):

- `src/pages/admin/AdminLayout.tsx`: `aside` com `px-4 py-2.5 gap-2`; marca
  `text-[16px] leading-tight`; nav sem `pb` e com `gap-1`; links `min-h-10 px-2.5 py-1.5
  text-[14px]`; linha do usuário sem `mt-auto` no mobile (`lg:mt-auto` só no desktop);
  botão `Sair da conta` com `min-h-9 px-3 py-1.5 text-[13px]`. Desktop via `lg:` inalterado.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test -- --run src/pages/admin/AdminLayout.test.tsx`: 3 testes aprovados.

Risco/pendência: suíte completa e build não repetidos; conferir no navegador 320–390px.
Sem commit/push (aguardando confirmação do dono).

## 2026-09-13 — opencode — Menu mobile não abria (corrigido)

 relato do dono com print: após clicar no hambúrguer (virava X), nenhuma opção aparecia.

Causa: no `<nav>` de `PublicLayout.tsx`, `max-[650px]:hidden` (base) e `max-[650px]:flex` (quando aberto) ficavam ativos ao mesmo tempo; na ordem do CSS gerado o `hidden` vence o `flex`, então o menu nunca exibia.

Alterações em código (front apenas):

- `src/components/PublicLayout.tsx`: `max-[650px]:hidden` saiu da base e virou alternativa exclusiva — aberto usa `max-[650px]:flex`, fechado usa `max-[650px]:hidden`.
- `src/components/PublicLayout.test.tsx`: regressão — nav fechada tem `max-[650px]:hidden`; aberta tem `max-[650px]:flex` e não tem `hidden`; Escape volta a esconder.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test -- --run src/components/PublicLayout.test.tsx src/seo/navigation.test.tsx`: 2 arquivos, 3 testes aprovados.
- Conferência no navegador (390px, `npm run dev` com dados reais): hambúrguer abre o sheet navy com Encontrar um imóvel, Alugar, Comprar, Área do corretor e rodapé CRECI 15776; print salvo em sessão.

Risco/pendência: suíte completa e build não foram repetidos após este fix de uma linha (só typecheck, lint e os testes do menu). Sem commit/push (aguardando confirmação do dono).

## 2026-09-13 — opencode — Mobile do admin (MOBILE-001)

Tarefa: pedido do dono ("faça tbm") — estender o padrão mobile do público ao painel, sem mudar rotas, contratos ou validações.

Alterações em código (front apenas):

- `src/pages/admin/AdminLayout.tsx`: links de navegação com 44px (`min-h-11`) e `snap-start`; barra horizontal com `snap-x` + `overscroll-contain` e respiro nas bordas; botão `Sair da conta` com 44px no mobile.
- Cabeçalhos (`Dashboard`, `PropertyList`, `LeadsList`, `AgentsList`, `PropertyForm`, const `heading` em `Rentals.tsx`): `flex-wrap` + empilhamento em ≤560px com CTA full-width.
- Tabelas (`tableWrap` em `Rentals.tsx`, `Dashboard`, `PropertyList`, `LeadsList`, `AgentsList`): `overscroll-contain`.
- Links de ação com 44px: `actions` em `Rentals.tsx`/`PropertyList`/`LeadsList`/`AgentsList`, `Abrir ficha`, `Abrir contrato`, voltar (`Imóveis`, `cadastros`, `contratos`, `site`), proprietario/inquilino na ficha do contrato e links dos cartões do dashboard.
- Filtros em 1 coluna no ≤560px: `toolbar` em `Rentals.tsx` e busca de contatos em `LeadsList.tsx` (botões full-width).
- `src/components/MediaManager.tsx`: botões de mídia com 44px (`min-h-11`, padding 12px/8px em vez de 9px/5px).
- Rodapés de formulário com `flex-wrap` (`PropertyForm`, `formFooter` em `Rentals.tsx`, editor de corretor); lista de documentos sem recuo padrão; ficha da pessoa (`dl`) com espaçamento e quebra de linha.
- `src/pages/admin/Login.tsx`: link `Voltar ao site` com 44px.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos).

Risco/pendência:

- Conferência manual 320–390px com login pendente (navegação lateral, tabelas, filtros, formulário, mídias, locações).
- Sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado).

## 2026-09-13 — opencode — Mobile público vitrine (P0/P1+P2, sem admin)

Tarefa: implementar `docs/plans/2026-09-13-mobile-public.md` só no público, adaptado ao Tailwind (os `.module.css` do plano não existem mais).

Alterações em código (front apenas):

- `src/components/PublicLayout.tsx`: menu `inset-x-0` alinhado ao container (sem `-18px`), links com 48px em sheet navy serif 19px + rodapé `CRECI 15776`, backdrop + trava de scroll, Escape com retorno de foco; removido o `onClick` no `<nav>` que roubava foco (fechar só no link/botão/backdrop/Escape). Rodapé compacto no mobile com links de 44px e `safe-area`.
- `src/pages/public/Catalog.tsx`: h1 32px + `text-balance` e intro 16px/1.6 no ≤560px; vitrine `clamp(220px,62vw,300px)` sem `margin-right`, `::before` escondido no mobile com soleira ouro `inset` + placa navy `#0A2042CC`, `verticalText` escondido; busca em 1 coluna, controles 48px sem `border-bottom` mobile, labels 12px caixa-alta, botão `Buscar` full-width 48px, `Limpar filtros` 44px; vazio "Nenhum ponto com esse filtro — limpe a cidade ou o preço." com botão `Limpar filtros`; grid mobile com gap 28px; `hero-anim` fade-up 240ms.
- `src/pages/public/PropertyDetail.tsx`: removido `row-[1]` do `aside` (ordem galeria > fatos > descrição > contato); botão do card escondido no mobile, CTA sticky único navy (preço serif branco + `Falar com corretor` ouro) com `safe-area`; referência segue escondida no mobile.
- `src/components/PropertyCard.tsx`: aspect 4/3 no mobile, seta 44px, título 19px, preço com wrap/`anywhere` + sufixo `/mês`, soleira ouro 3px no link da imagem.
- `src/components/MediaGallery.tsx`: altura `clamp` no mobile, soleira ouro, contador pill 13px navy `#0A2042CC`, thumbs 72px com `snap-mandatory`/`snap-start` + `overscroll-contain`.
- `src/components/LeadFormModal.tsx`: botão `Falar com corretor` (verbo único do plano).
- `src/styles/global.css`: `touch-action:manipulation` em botões/links, `overflow-x:clip` no body, `fade-up` só sem `prefers-reduced-motion`.
- `src/seo/navigation.test.tsx` + `src/components/LeadFormModal.test.tsx`: ajustes aos novos rótulos (`getAllByRole` para os dois `Limpar filtros`, `Falar com corretor`).

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos); CSS `index-*.css` com 51,0 KB.
- `node scripts/seo-smoke.mjs`: aprovado (SSR, metadados, paginação, 404, discovery, proxy e função Vercel).

Risco/pendência:

- Conferência manual 360/390px pendente (menu, busca, grid, galeria, CTA sticky, modal lead, `robots.txt`, `sitemap.xml` e 404) com a API no ar; hero sem scroll-X em 320–390px e toques ≥44px a confirmar no aparelho.
- Sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado).

## 2026-09-13 — opencode — Tailwind v4 migração total (público + admin, com dark)

Tarefa: adotar o Tailwind no sistema (migração total, tudo junto, com dark preparado).

Alterações em código (front apenas):

- Infra: `tailwindcss` + `@tailwindcss/vite` em devDependencies; plugin no `vite.config.ts`;
  novo `src/styles/tailwind.css` (`@theme` navy/gold/paper/ink/muted/line/soft/error, `font-display/sans`,
  radius, `animate-shimmer`, `@custom-variant dark` + `.dark`); importado em `src/main.tsx` antes do `global.css`.
- Migrados para utilities (imports de `.module.css` removidos e arquivos excluídos): `Shared` (AsyncState,
  Pagination, Dialog), `PropertyCard`, `PublicLayout`, `MediaGallery`, `LeadFormModal`, `PrivacyPolicy`,
  `MediaManager`, `Catalog`, `PropertyDetail` e o painel admin (`AdminLayout`, `Dashboard`, `PropertyList`,
  `PropertyForm`, `LeadsList`, `AgentsList`, `Login`, `Rentals` + `Admin.module.css`).
- Ajustes de teste/SRR: `src/seo/server.test.ts` e `scripts/seo-smoke.mjs` passam a casar `<h1[^>]*>`
  (o h1 agora carrega classes Tailwind); conteúdo e escaping preservados.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (cliente + SSR + `.vercel/output`); bundle CSS `index-*.css` com 47,2 KB.
- `node scripts/seo-smoke.mjs`: aprovado (SSR, metadados, paginação, 404, discovery, proxy e função Vercel).

Pendências: conferir no navegador catálogo, detalhe, `robots`/`sitemap`/rota inexistente, fluxos do admin,
modo `.dark`, mobile 320–390px sem scroll-X e toques ≥44px. Sem commit/push (aguardando confirmação do dono).

## 2026-09-13 — opencode — Hambúrguer só no mobile

Tarefa: esconder o botão hambúrguer no desktop, mantendo-o só no mobile (≤650px).

Alterações em código (front apenas):

- `src/components/PublicLayout.module.css`: `.menuToggle` → `button.menuToggle` no desktop
  e no `@media(max-width:650px)`. Motivo: `.buttonGhost` do `global.css` tem a mesma
  especificidade com `display:inline-flex` e vencia/empatava conforme a ordem do bundle,
  deixando o botão visível no desktop junto da navegação.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados (ruído `render failed` do teste de boundary
  é esperado, como nas sessões anteriores).

Pendências: conferir no navegador desktop (>650px, sem botão) e mobile (≤650px, com botão).
Sem commit/push (aguardando confirmação do dono).

## 2026-09-13 — opencode — UX-004 melhorias de front sem back

Tarefa: aplicar as fatias P0–P3 do plano de melhorias (conversão mobile, galeria, lead, cards,
skeletons, a11y, admin) sem nenhuma mudança no back: sem rota, DTO, migration ou contrato novo.

Alterações em código (front apenas):

- `src/pages/public/PropertyDetail.tsx` (+ `.module.css`): ações Compartilhar (Web Share com
  fallback clipboard, SSR-safe) e Ver no mapa (Google Maps por query); barra de CTA fixa no
  mobile com `safe-area`; breadcrumb com classe (sem `style` inline); características via
  `featureLabel`/`featureValue`; seção "Você também pode gostar" com `api.listProperties`
  existente (client-side, sem back novo).
- `src/services/format.ts` (+ `format.test.ts`): `featureLabel`/`featureValue` sem `any`
  (boolean→Sim/Não, listas/objetos sem `JSON.stringify` cru).
- `src/components/MediaGallery.tsx`: primeira mídia `eager` + `fetchpriority`, demais `lazy`;
  `decoding="async"`; contador com `aria-live`; `aria-current` nos thumbnails; lightbox só
  para imagem.
- `src/components/PropertyCard.tsx`: fallback "Foto em breve" em vez de `display:none`;
  `loading="lazy" decoding="async"`.
- `src/components/AsyncState.tsx` (+ `AsyncState.test.tsx`, `Shared.module.css`): variante
  skeleton `cards`/`detail` com shimmer (respeita `prefers-reduced-motion` global); usada no
  catálogo e no detalhe.
- `src/components/LeadFormModal.tsx` (+ CSS): `inputMode="tel"`, foco no primeiro campo com
  erro via `setFocus`, área de toque do consent com 44 px.
- `src/components/PublicLayout.tsx`: `end` no NavLink inicial (o RR já emite `aria-current`).
- `src/pages/admin/Admin.module.css`: arte do login no navy da marca; `.table` com
  `min-width` para rolagem horizontal correta.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 20 arquivos, 68 testes aprovados (ruído `render failed` do teste de boundary
  é esperado, como nas sessões anteriores).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- Bundle SSR (`dist/server/server.js`) contém as novas marcas: Compartilhar, mobileCta,
  breadcrumb, skeletons, aria-live, inputMode.

Risco/pêndencia:

- Conferência visual manual (detalhe com fotos, modal, CTA mobile, semelhantes) pendente
  com a API local no ar.
- Sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado).

## 2026-09-13 — Codex — rebrand Lucas Gobatto (UX-003, só front)

Tarefa: aplicar a marca real (azul-marinho + dourado + branco, Lucas Gobatto — CRECI 15776, Juara/MT)
sem nenhuma mudança no back.

Alterações em código (front apenas):

- `src/config/brand.ts`: nome, credential, creci, logo, tagline, closing e região `Juara, Mato Grosso` (`City`).
- `src/styles/global.css`: tokens navy/gold/branco; `--green` mantido como apelido do navy; botão, foco e eyebrow atualizados.
- `src/components/PublicLayout.tsx` + `.module.css`: marca SVG inline dourada, header branco com filete dourado, rodapé navy com CRECI.
- `Catalog.module.css` (filetes dourados, bloco de fechamento navy), `PropertyCard.module.css` (selo navy/gold),
  `PropertyDetail.module.css` (card de contato com topo dourado), `Admin.module.css` (sidebar navy).
- `public/favicon.svg`, `index.html` (`theme-color #0A2042`).
- `src/seo/metadata.ts`: JSON-LD `Organization` → `RealEstateAgent` com `identifier: CRECI 15776`.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 18 arquivos, 62 testes aprovados (mensagens de erro simuladas do teste de boundary são esperadas).
- `npm run build`: aprovado; cliente, SSR e `.vercel/output` gerados (avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado (SSR, metadados, paginação, 404, discovery e proxy com cookies).

Risco/pêndencia:

- Logo atual é SVG inline aproximado; trocar pelo PNG/SVG oficial com fundo transparente quando o dono enviar.
- Conferência visual manual (catálogo, detalhe, mobile) pendente com a API local no ar; dourado restrito a detalhes por contraste.
- Sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado).

## 2026-09-13 — Claude — refinamento do catálogo e detalhe público

Tarefa: UX-002 — melhorar o front sem alterar o backend.

Alterações em andamento:

- Refinados hero, busca, estados vazios, espaçamentos e CTA final do catálogo em `Catalog.module.css`.
- Refinados hover/foco e leitura visual dos cartões em `PropertyCard.module.css`.
- Refinados hierarquia do detalhe, card de contato, fatos da área e responsividade em `PropertyDetail.module.css`.
- Galeria agora aceita navegação por setas quando focada, além de receber acabamento visual e feedback nos thumbnails.

Validação parcial:

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 18 arquivos e 62 testes aprovados; mensagens de erro simuladas pelo teste de boundary são esperadas.

Validação final:

- `npm run build`: aprovado; cliente, SSR e `.vercel/output` gerados.
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 18 arquivos e 62 testes aprovados.
- Conferência no navegador: o runtime respondeu a página de indisponibilidade, comportamento esperado sem a API local;
  não foi possível conferir dados reais, galeria populada e modal de lead nessa execução.

Risco/pêndencia:

- Repetir a conferência manual com a API local disponível antes de publicar, especialmente catálogo com resultados,
  detalhe, filtros, galeria populada e modal de contato.

## 2026-09-13 — Codex — diagnóstico de 404 no painel de locações

O deploy `corretor-web-test.vercel.app` retornava 404 em `/api/admin/rental-parties` e `/api/admin/leases`. A investigação confirmou que o proxy do SSR repassa corretamente as requisições e que o front usa os caminhos previstos. O código atual da API (`4b9377c`) possui `RentalsModule` e os controllers; o serviço alcançado pelo deploy responde `Cannot GET /admin/...` e corresponde ao backend anterior `a41f49b`, que não importava o módulo.

Conclusão: não há correção de código no front. Publicar o `corretor-api` em `4b9377c` ou posterior, aplicar a migration de locações no banco de teste e confirmar `API_ORIGIN` no projeto Vercel. Nenhuma alteração externa ou segredo foi realizado nesta sessão.

Correção: deploy do serviço Render `Corretor-API` disparado no commit `4b9377c` e concluído com status `live`. Verificação direta no Render e pelo proxy da Vercel retornou `401 Unauthorized` para as rotas protegidas, confirmando que o 404 foi eliminado. A migration já aplicada no banco de teste não precisou ser executada novamente.

## 2026-09-13 — Codex — comissão de captação parcelada

Adicionada à ficha do contrato a comissão de captação equivalente a um aluguel, com quantidade de parcelas, primeiro vencimento, total, saldo e confirmação manual ADMIN. A interface chama as rotas financeiras protegidas e mantém SI9/Imonov fora do fluxo.

Verificação: typecheck e suíte completa do front (18 arquivos, 62 testes) aprovados antes/apos a inclusão da área; a API passou typecheck, lint, build e 18 suítes/190 testes. A migration financeira ainda aguarda aplicação no Neon.

## 2026-09-12 — Codex — primeira entrega de administração de locações

Tarefa: RENTAL-001. Implementadas no painel ADMIN as páginas e formulários de proprietários, inquilinos e contratos, com busca/paginação, vínculos a imóveis de locação, dados bancários do proprietário, fichas detalhadas, contratos vinculados e anexos privados. O cliente HTTP ganhou chamadas tipadas e download binário com o mesmo refresh de sessão compartilhado.

Arquivos principais: `src/pages/admin/Rentals.tsx`, `src/pages/admin/rentalSchema.ts`, `src/services/api.ts`, `src/services/http.ts`, `src/App.tsx`, `src/pages/admin/AdminLayout.tsx` e testes de autorização/contratos.

Verificação real: `npm run typecheck`, `npm run lint`, `npm test` (18 arquivos, 62 testes) e `npm run build` passaram. O build produziu cliente, SSR e `.vercel/output`; os avisos emitidos vieram de comentários de pureza em dependências do Zod durante o Rollup. Smoke SSR ainda depende de executar `node scripts/seo-smoke.mjs` com ambiente de preview e será repetido na validação final.

Pendências: aplicar a migration da API após backup do Neon, configurar `R2_DOCUMENTS_BUCKET` privado e homologar o fluxo real. Comissão, cobrança, repasse, SI9/Imonov e importação de planilhas permanecem fora do escopo.

Registro objetivo, do mais recente para o mais antigo. Cada entrada traz tarefa, alterações,
testes com resultado real e pendências.

## 2026-09-12 — Claude (ambiente de desenvolvimento e limpeza de dados fixos)

Tarefa: subir o ambiente de desenvolvimento e remover dados fixos do código, a pedido do dono do projeto.

Alterações em código:

- **Modo demonstração removido por inteiro.** Apagados `src/services/demo.ts` (11 imóveis, 2 corretores e 4 leads
  fictícios, com fotos do Unsplash), `src/services/demo.test.ts` e `.env.demo`. Retirados: a variável
  `VITE_DEMO_MODE` (do `.env`, do `.env.example` e do `scripts/seo-smoke.mjs`), os scripts `dev:demo`, `build:demo`
  e `preview:demo` do `package.json`, o argumento `--demo` dos três scripts de runtime, o campo `demo` de `SeoConfig`
  e do bootstrap do SSR, o `isDemo` de `brand.ts`, o Proxy de `api.ts` (virou `export const api = realApi`), os botões
  de entrada fictícia em `Login.tsx`, a faixa de aviso em `PublicLayout.tsx`, o sufixo "Demonstração" em
  `AdminLayout.tsx`, os três ramos condicionais de `LeadFormModal.tsx` e as classes CSS `.demo` e `.demoNote`.
- **Identidade centralizada em `src/config/brand.ts`**, agora com `name`, `logo`, `tagline`, `closing`, `region` e
  `privacy`. Os 13 pontos que repetiam "Corretor Comercial" e "Mato Grosso" passaram a ler dali: títulos e descrições
  de `metadata.ts`, `og:site_name`, JSON-LD `Organization` e `WebSite`, o `llms.txt` de `server.tsx`, o logotipo do
  cabeçalho e o hero do catálogo.

Testes executados:

- `npm run typecheck`: sem erro.
- `npm run lint`: sem erro.
- `npm test`: 16 arquivos, 57 testes aprovados. Antes eram 17 arquivos e 64 testes; a diferença é o `demo.test.ts`
  removido (7 testes que só exercitavam o módulo de demonstração).
- `npm run build`: sem erro; gerou `dist/client`, `dist/server` e `.vercel/output`.
- `node scripts/seo-smoke.mjs`: aprovado (SSR, metadados, paginação, 404, discovery e proxy de API com cookies,
  mais a função da Vercel em runtime Node isolado).
- Conferência manual com a API real no ar: `/` 200 com título, `og:site_name` e `<h1>` idênticos aos de antes do
  refactor; `/admin/login` 200; `/privacidade` 200; `/api/properties` 200 pelo proxy; `/llms.txt` com o nome do
  `brand`; rota inexistente 404; faixa de demonstração ausente do HTML.

Achados:

- `src/seo/fixture.ts` mantém dados de exemplo ("Rua de demonstração", Cuiabá/MT). Foi mantido de propósito: é
  fixture de teste, usada por `server.test.ts` e `navigation.test.tsx`, e não entra no bundle do produto.
- `brand.privacy` continua com `controller`, `contactEmail` e `address` vazios. A página `/privacidade` mostra o
  aviso de conteúdo preparatório enquanto for assim — é o comportamento correto, mas bloqueia a publicação.

Pendências:

- Preencher `brand.privacy` e decidir o nome real do negócio (hoje "Corretor Comercial", um rótulo de andaime).
- DEPLOY-002 e SEO-001 seguem bloqueadas pela publicação da API.

## 2026-09-11 — Claude (sincronização e homologação)

Tarefa: SYNC-001 — sincronizar a entrega de SEO/SSR, validar localmente e homologar contra a API real.

Alterações em código: nenhuma. Alterações em arquivos versionados: criação da camada de contexto
(`AGENTS.md`, `CLAUDE.md`, `PROJECT_STATUS.md`, `DECISIONS.md`, `TASKS.md`, `CHANGELOG_AI.md`, `docs/handoffs/`).

Ações:

- `git pull --ff-only` de `78200ff` para `d4f6b2f` (entrega de SEO e SSR).
- `.env` local criado a partir do `.env.example` e, depois, `SITE_URL=http://127.0.0.1:5173` definida.

Testes executados:

- `npm ci`: ok, 0 vulnerabilidades.
- `npm test`: 17 arquivos, 64 testes aprovados.
- `npm run lint`, `npm run typecheck`, `npm run build`: sem erro. O build gerou `dist/client`, `dist/server` e
  `.vercel/output` com a função `render`.
- Smoke do SSR em modo demo (`npm run dev:demo`): catálogo, detalhe de imóvel, `robots.txt`, `sitemap.xml`,
  `llms.txt`, privacidade e login com 200; rotas inexistentes com 404; `noindex` e sitemap vazio, como esperado
  com a indexação desligada.
- Homologação com a API, o Neon e o R2 reais (`npm run dev`): login pelo proxy `/api` com cookie de refresh;
  página SSR do imóvel com título, JSON-LD `RealEstateListing` e `BreadcrumbList`, canonical e `og:image`
  apontando para imagem real no R2; lead registrado com consentimento.

Achados:

- Sem `SITE_URL`, o SSR não gera canonical nem JSON-LD. Não há erro visível: a página simplesmente sai sem os dados
  estruturados. Foi o que motivou a decisão de manter `SITE_URL` preenchida também em desenvolvimento.
- O runtime de proxy copia o header `Origin` do navegador, então a API precisa ter a origem do front em
  `ALLOWED_ORIGINS`, senão login, refresh e logout respondem 403.
- Com a API fora do ar, `/api/*` responde 503 e as páginas públicas caem para o estado de indisponibilidade.

Pendências:

- DEPLOY-002 e SEO-001 dependem da publicação da API.
- UX-001: decidir o que fazer com o cold start diante do timeout de 10 s do SSR.
- DOC-002: README desatualizado.

## Registros anteriores

O trabalho anterior a 11/09/2026 está nos commits do Git, no `PLANO-PROJETO-CORRETOR.md` e no `AUDITORIA-FRONTEND.md`.
Não havia registro por agente antes desta data.

## 2026-09-13 — Ambiente de teste
- Provisionamento Cloudflare R2 registrado; bucket privado \corretor-documentos-test\ criado para documentos administrativos.
- Vercel/Neon aguardam autenticação válida da sessão local.

## 2026-09-13 — Ambientes conectados
- Vercel: projeto \corretor-web-test\ publicado em https://corretor-web-test.vercel.app.
- Neon: projeto \
oyal-haze-18985318\ criado e oito migrations aplicadas com sucesso.

## 2026-09-13 — Codex: revisão e deploy UX-003/UX-004 concluídos

Pedido do dono: revisar, opinar e publicar as alterações locais do front. Main sincronizada com origin/main em 433392d após git fetch (0/0). Revisão do diff sem bloqueador para atualizar o ambiente de teste; código preexistente preservado, sem commit/push.

Publicação: https://corretor-web-test.vercel.app — deployment dpl_8ZTk6bsKwV8xnqye5nUDo6EdcRV4, READY, target production do projeto de teste existente. Build remoto a partir dos arquivos locais via Vercel CLI, mantendo as variáveis configuradas no projeto.

Validação: typecheck e lint aprovados; 20 arquivos/68 testes aprovados; build local e remoto aprovados; scripts/seo-smoke.mjs aprovado, incluindo função Vercel independente, SSR, metadados, paginação, 404 e proxy com cookies. Avisos de anotação do Zod no Rollup não impediram o build. Conferência no navegador em viewport estreita: catálogo, detalhe com fixture local, CTA mobile, modal e foco no primeiro erro aprovados. Catálogo publicado confirmado com a nova marca.

HTTP publicado: /, /admin/login, /robots.txt e /sitemap.xml = 200; rota e imóvel inexistentes = 404; /api/properties = 200 com zero imóveis; /api/admin/leases = 401 sem autenticação. Robots mantém Disallow: / e sitemap vazio no ambiente de teste.

Opinião: navy/gold e tipografia deixam a identidade mais consistente; ações de mapa/compartilhar, CTA mobile e foco de formulário melhoram a navegação. Próximo refinamento: nomes de características com acentuação e preservação dos rótulos de objetos (featureValue hoje reduz objetos aos valores).

Limites: catálogo remoto vazio impede homologar detalhe real; detalhe conferido apenas com fixture local. Não foram executados login autenticado, upload, criação real de lead, compartilhamento nativo ou navegação da galeria com múltiplas fotos. Logo oficial e dados de brand.privacy continuam pendentes para lançamento comercial. Os registros antigos de API/Vercel não publicados estão superados para o ambiente de teste; lançamento comercial e indexação continuam pendentes.

Arquivos alterados nesta revisão: PROJECT_STATUS.md, TASKS.md, DECISIONS.md e CHANGELOG_AI.md (registros aditivos). Nenhuma dependência ou mudança no backend.


## 2026-09-13 — Codex: URLs em português concluídas
Rotas públicas: /imoveis/{tipo}, /imoveis/para-alugar, /imoveis/para-comprar e combinações; query cidade/preco-minimo/preco-maximo/pagina. Painel: /admin/entrar e /admin/contatos. URLs antigas redirecionam 301; navegador usa replace; slugs e APIs preservados.
Publicação Vercel dpl_Bbf5617bGJdqKv79WJbuDDFJaP1M READY, alias https://corretor-web-test.vercel.app. SITE_URL e SEO_INDEXABLE configuradas em Production conforme autorização. Robots, llms e sitemap respondem 200; raiz index,follow; filtros noindex,follow; painel noindex,nofollow. Sitemap contém início e privacidade (catálogo público sem imóveis no momento).
Validação: typecheck, lint, build, suíte de 93 testes e teste adicional de navegação aprovado (94 no total coberto); smoke SSR/proxy/discovery aprovado. Navegador: redirecionamento, paginação e detalhe com fixture local; catálogo filtrado publicado confirmado. Login autenticado/logout e fichas reais não exercitados no navegador nesta sessão; permissões existentes cobertas pela suíte. Sem commit/push.
Arquivos do front: services/urls.ts e testes, App.tsx, Catalog, PublicLayout, PropertyCard, PropertyDetail, AdminLayout, Dashboard, Login, PropertyForm, SEO server/metadata e testes, scripts/seo-smoke.mjs. API: apenas documentação; alterações preexistentes em .env.example e .gitignore preservadas. Nenhuma dependência, migration ou alteração de dados.


## 2026-09-13 — Preparação de commit e push autorizada
Codex: revisão do diff concluída; typecheck, lint, 21 arquivos/94 testes, build e smoke de SEO aprovados novamente. Front: código e documentação das URLs; API: somente documentação correspondente. Alterações anteriores da API em .env.example e .gitignore excluídas do commit.

## 2026-09-13 — opencode: capa no catálogo + decode no upload

Tarefa: capa definida no painel não aparecia no catálogo ("Foto em breve"), só no detalhe; formulário exibia "The source image could not be decoded." em inglês.

Causa da capa (API, repositório irmão): `PropertiesService.list()` carregava só `agent`, então `toPropertyResponse` devolvia `media: []` na listagem. Corrigido com segunda query por imóvel, paginação preservada; teste novo de capa ordenada.

Alterações em código (front apenas):

- `src/components/mediaUpload.ts`: `createImageBitmap` com erro PT por arquivo; `prepareMediaFiles` pula ilegíveis via `onError`, mantém ordem e progresso.
- `src/components/MediaManager.tsx`: envia os válidos, avisa os pulados, bloqueia só quando nada é legível.
- `src/components/mediaUpload.test.ts` (+2 testes) e `src/components/MediaManager.test.tsx` (+2 testes).

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 21 arquivos, 98 testes aprovados (ruído `render failed` do teste de boundary é esperado).
- `npm run build`: aprovado (avisos de pureza do Zod no Rollup, já conhecidos).
- `node scripts/seo-smoke.mjs`: aprovado.
- API: `npm run typecheck`, `npm run lint` e `npm test` aprovados (18 suítes, 191 testes).

Risco/pendência:

- Conferência manual com a API no ar (catálogo com capa, upload misto, `robots.txt`, `sitemap.xml`, 404) e redeploy da API no Render pendentes.
- Sem commit/push (aguardando confirmação do dono, direto na `main` quando liberado).

## 2026-09-14 — opencode — Hamburger fora do desktop

Pedido do dono: tirar o hamburger da versão desktop.

Causa: o botão usava `buttonGhost hidden max-[650px]:inline-flex`; o `.buttonGhost` do `global.css` (`display: inline-flex`, carregado depois do Tailwind) empatava com o `hidden` e o botão aparecia no desktop.

Alterações:

- `src/components/PublicLayout.tsx`: botão do menu sem `buttonGhost`, só com utilities (`hidden` + `max-[650px]:inline-flex` e estilo fantasma equivalente).
- `src/components/PublicLayout.test.tsx`: regressão — botão com `hidden`/`max-[650px]:inline-flex` e sem `buttonGhost`.

Testes executados (resultado real):

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test -- src/components/PublicLayout.test.tsx`: 2 testes aprovados.

Risco/pendência:

- Conferir no navegador: desktop >650px sem botão, mobile ≤650px com botão.
- Commit `6c99b3c` na main (direto na `main`, a pedido do dono).

## 2026-09-14 — Codex: contexto da API integral sincronizado

Atualizados AGENTS.md, README.md, PROJECT_STATUS.md, TASKS.md, DECISIONS.md, PLANO-PROJETO-CORRETOR.md, corretor-spec.json e docs/handoffs/2026-09-14-backend-portugues.md; pedido preservado em docs/specs/2026-09-13-backend-integral.md. Histórico mantido. Nenhum código de UI alterado; .vscode/ preexistente preservada.

Backend irmão validado com typecheck/lint/build, 169 testes locais + 4 PostgreSQL/HTTP reais. Frontend não retestado nesta entrega documental. A API nova muda endpoints/DTOs/auth/classificação/contratos/financeiro: adaptação e testes ponta a ponta do frontend são pré-requisito de deploy conjunto. Sem commit/push/deploy. Workspace/Drive e novo upload R2 ainda exigem homologação real; banco publicado não migrado.
## 14/09/2026 — integração frontend ao contrato português

- Adaptados `src/services/api.ts`, `http.ts` e `portuguese.ts` para autenticação, DTOs snake_case, paginação `itens`, classificações UUID, clientes, imóveis e mídia.
- SSR, catálogo, URLs amigáveis, SEO, seletores dinâmicos e painel administrativo atualizados. Incluídos cadastros, clientes manuais, leitura interna de imóveis, contratos com status/retry do Drive e comissões com parcelamento e baixa confirmada.
- Telefones brasileiros normalizados para WhatsApp; edições preservam vínculos históricos inativos quando não alterados; uploads usam `arquivos`, limites 10/30/60 MiB e bucket público de mídia.
- Validação: `npm run typecheck`, `npm run lint`, `npm run build`, smoke SSR/Vercel e testes direcionados passaram; 120 testes passaram na suíte completa, com dois erros transitórios de worker/jsdom no Windows na última execução concorrente.
- Pendente: credenciais e homologação real do Drive compartilhado, complementos/backup para migração de dados e publicação coordenada. Nenhum segredo foi adicionado.


## 2026-09-14 — Codex: textos e botões legíveis
Alterados styles/global.css e tailwind.css; PublicLayout, PropertyCard, Catalog, PropertyDetail e Login. Resolvida prioridade de CSS global sobre utilities, aliases escuros, cores de ação, textos navy, legendas sobre navy/foto e fallback de imagem. Container conserva margens responsivas. Documentação atualizada sem apagar histórico.
Validação: typecheck/lint aprovados; 27 arquivos e 125 testes aprovados (worker único); build aprovado, avisos conhecidos Zod. Smoke SSR/metadados/paginação/404/robots/sitemap/proxy/Vercel aprovado em portas alternativas 4299/4280 porque 4199 estava ocupada. Cópia temporária do smoke removida. Axe WCAG AA sem violações de contraste em catálogo/login/detalhe nos dois temas; textos sobre imagens exigem análise manual e foram inspecionados por captura. Catálogo mobile 390px: container 354px, sem overflow horizontal. Painel autenticado não exercitado nesta sessão; controles compartilhados corrigidos, sem alegar homologação completa. Sem commit/push/deploy; .vscode preexistente preservada.


## 2026-09-14 — Codex: posição do botão de tema
PublicLayout.tsx: grupo à direita contendo nav e controles, tema após Área do corretor; marca/espaçamento compactos até 900px. Preservadas alterações anteriores de contraste. Atualizados PROJECT_STATUS, TASKS e DECISIONS.
Validações: typecheck e lint aprovados; 27 arquivos/125 testes aprovados. Navegador em 390, 768 e 1280px, claro/escuro: sem overflow horizontal, tema 44x44px, distância desktop 16px e mobile 8px. Menu abre com foco no primeiro link, Escape devolve foco, Shift+Tab/Enter alterna tema com foco visível. Capturas desktop/tablet conferidas. Sem mudanças de API, commit, push ou deploy; build não repetido nesta alteração restrita ao cabeçalho.


## 2026-09-14 — Codex: publicação Git autorizada
Dono solicitou commit e push das correções de contraste e cabeçalho na main. Revisão preserva texto navy no CTA dourado do detalhe (PropertyDetail sem diff final) e corrige formatação histórica em DECISIONS. .vscode fora do commit. Validação final aprovada: typecheck, lint, 27 arquivos/125 testes e build; diff --check limpo. Commit/push autorizados na main; sem deploy manual.

## 2026-09-14 — Codex: endurecimento dos testes E2E
Corrigidos os três pontos da revisão: o teste mobile agora percorre os links com Tab e confirma a classe `dark` após recarregar; helpers de escrita bloqueiam alvos fora de localhost sem `E2E_ALLOW_EXTERNAL=true`; README documenta a autorização explícita para homologação remota. A execução autenticada continua condicionada às credenciais e ao backend de teste.

## 2026-09-15 — Muse Spark: hidratação do tema corrigida (sem commit)
Sintoma do dono no `dev`: `Warning: Expected server HTML to contain a matching <circle> in <svg>` (lucide `Sun`/`Moon` no header do `PublicLayout`) seguido de `Hydration failed` repetido e `Switched to client rendering`.
Causa: `useTheme` com `useState(() => initialTheme())` — SSR pinta `light`/`Moon`, cliente com `dark` salvo pintava `Sun`/label "Ativar modo claro" já no primeiro render; React descartava o SSR.
Alterados `src/hooks/useTheme.ts` (estado inicial fixo `light`, preferência resolvida/aplicada em efeito único sem flash) e `src/hooks/useTheme.test.ts` (regressão: primeiro render `light` com `dark` salvo, converge para `dark`). `PROJECT_STATUS.md` e `DECISIONS.md` atualizados.
Testes executados (resultado real):
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test`: 29 arquivos/143 testes aprovados.
- `npm run build`: aprovado (cliente + SSR + Vercel Build Output).
- `node scripts/seo-smoke.mjs`: aprovado (catálogo, detalhe, `/devs`, 404, `robots.txt`, `llms.txt`, `sitemap.xml`, proxy `/api`, função Vercel standalone).
Risco/pendência: conferir no navegador com `theme=dark` salvo (console sem erro de hidratação, ícone Sol, alternância/persistência); sem commit/push (aguardando confirmação do dono).
## 2026-09-15 — Codex: CSS disponível antes do bundle React

Sintoma: após recarregar `/devs`, o SSR aparecia por alguns segundos como HTML
sem estilos e só depois recebia o layout visual.

Causa raiz: as folhas de estilo eram imports de `src/main.tsx`; no dev, o Vite
as injetava somente após o carregamento do módulo JavaScript.

Alterações:

- `index.html`: links antecipados para `src/styles/tailwind.css` e `src/styles/global.css`.
- `src/main.tsx`: removidos imports CSS duplicados.

Validação: `npm run typecheck`, `npm test` (29 arquivos, 143 testes) e `npm run build`
aprovados. O HTML servido em desenvolvimento contém os stylesheets no `<head>` antes
do bundle; o build gerou `dist/client/assets/index-*.css` normalmente.

Pendente: conferir visualmente no navegador do dono após reload forçado, especialmente
em conexão lenta.

## 2026-09-15 — Codex: revisão final e correções preventivas

Corrigidos dois pontos encontrados na revisão da página `/devs` e do cabeçalho:

- `useTheme` agora preserva o tema resolvido quando o React StrictMode repete
  efeitos de montagem; regressão coberta em StrictMode.
- `http.ts` não emite `session-expired` para `Origem não autorizada.`; teste
  confirma a mensagem específica sem logout por evento.

Validação: typecheck, lint, suíte completa (29 arquivos, 143 testes), build e
`git diff --check` aprovados. Avisos do Rollup sobre comentários `@__PURE__` do
Zod permanecem preexistentes.
## 2026-09-15 — Correções de documentação, SEO e isolamento local

Atualizados `README.md`, `AGENTS.md`, `TASKS.md`, `PROJECT_STATUS.md`, `DECISIONS.md` e `.env.example` conforme os
scripts atuais, sem modo demonstração. `/devs` permanece acessível e SSR, mas entrega `noindex,follow` e não aparece
no sitemap ou no `llms.txt`. Criado `scripts/safe-origin.mjs`; `dev` e `preview` recusam API remota por padrão.

Testes direcionados executados: `scripts/safe-origin.test.ts` aprovado; regressões SEO ajustadas. Validação completa
fica registrada após executar typecheck, lint, testes, build, smoke e `git diff --check`. UX-001 cold start permanece
adiada. A remoção de `.buttonGhost` foi mantida fora desta entrega por ainda haver consumidores administrativos.
## 2026-09-15 — Hardening observado em teste externo

- Alterados `src/seo/server.tsx`, `scripts/runtime.mjs` e `src/seo/server.test.ts`.
- Headers adicionados: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`.
- Nenhum dado, registro, imóvel ou banco foi alterado; CORS da API não foi modificado.
- Validação pendente nesta etapa: typecheck, lint, testes e build.

## 2026-09-16 — Correção dos achados de segurança do proxy web

Alterados `scripts/runtime.mjs`, `src/seo/deployment.ts`, `src/seo/server.tsx` e testes
correspondentes. O proxy agora preserva headers defensivos contra valores conflitantes do
upstream e os envia também em falhas de conexão/configuração; os rewrites da Vercel recebem
a mesma política; `API_ORIGIN` HTTP é rejeitado em produção. O token de sessão já estava em
memória; não houve mudança em dados, banco, uploads ou CORS. Validação real aprovada: `npm run
typecheck`, `npm run lint`, `npm test` (31 arquivos/150 testes), `npm run build`, `git diff --check`
e `node scripts/seo-smoke.mjs`.
## 2026-09-16 — Codex — melhorias públicas e painel administrativo

Alterados formatadores, cartão/detalhe público, formulário de lead, metadados SEO, Dashboard, lista de contatos,
formulário de imóvel e testes correspondentes. Incluídos preço/m², total mensal, status visível, relacionados,
mapa lazy, máscara de telefone, honeypot, OG dimensions, KPIs, filtros/CSV e `beforeunload` para alterações não salvas.

Validação real: `npm run typecheck` aprovado; `npm run lint` aprovado; `npm test -- --maxWorkers=1 --reporter=dot`
aprovado (31 arquivos/155 testes); `npm run build` aprovado; `node scripts/seo-smoke.mjs` aprovado.

Pendências: datalist de cidades, duplicação completa, links adicionais do rodapé, dados reais de privacidade/logo
oficial e conferência manual autenticada. Ordenação de catálogo permaneceu fora do corte. E2E autenticado não foi
executado sem stack/banco/credenciais de teste.


## 2026-09-16 — Codex: conclusão do pacote público e administrativo

Este registro complementa e substitui o estado parcial anterior sem apagar o histórico.

- Catálogo: datalist deduplicado de cidades da página; filtros e URLs preservados. Cards com rótulos reservado/concluído.
- Detalhe/lead: preço por área válida, soma parcial de encargos com aviso sobre periodicidade do IPTU, relacionados com fallback,
  mapa sob demanda, máscara nacional preservando internacionais, honeypot antes do popup e payload sem campo extra.
- Rodapé configurável, Alugar/Comprar, 404 com atalhos/espaçamento; OG alt e dimensões só do asset conhecido.
- Dashboard com métricas/erros independentes, todas as páginas financeiras e soma exata de parcelas ativas em centavos.
- Contatos: imóvel pesquisável, período inclusivo Cuiabá, filtros aplicados no envio, origem informativa, mensagem expansível,
  exportação apenas da página aplicada com BOM/escaping e proteção contra fórmulas; dados antigos/carga/erro impedem download.
- Imóveis: duplicação com novo título/POST/slug da API e sem mídias; rascunho protegido; preview nova aba; proteção de saída/reload,
  navegação SPA e histórico. Data router criado uma única vez no navegador; SSR preservado.
- Conferência visual corrigiu descrição escura e cartão de contato/cabeçalho fixo. Plano e documentos de contexto dos dois repositórios atualizados.

Validação real:
- Typecheck e lint aprovados.
- Vitest: 38 arquivos / 211 testes aprovados (worker único). Mensagens render failed são do teste intencional de ErrorBoundary.
- Build cliente/SSR/Vercel aprovado; avisos de anotação PURE do Zod preexistentes.
- Smoke SSR/proxy/cookies/robots/sitemap/llms/404/função Vercel aprovado usando fixture local.
- Playwright em 127.0.0.1:4180: 15 aprovados, 22 não executados, zero falhas na execução final. Primeira execução teve 1 falha porque
  a fixture não implementava /saude; adicionada resposta sintética ao smoke e suíte repetida sem enfraquecer a asserção.
- Navegador Chromium: catálogo/detalhe/rodapé/404 em 390px e desktop, temas claro/escuro, máscara e modal, mapa carregado por clique,
  navegação da 404 para Alugar; sem erro de hidratação observado. Verificação de largura sem overflow horizontal.
- Revisão independente somente leitura: nenhum achado de alta prioridade.

Limites: painel autenticado/banco/Drive/R2 reais não homologados nesta entrega por ausência de E2E_STACK=teste e credenciais;
componentes administrativos exercitados com APIs simuladas nos testes. Dados reais de privacidade, logo e contato comercial
aguardam o proprietário. Origem não é filtro global porque a API atual não o aceita; ordenação adiada conforme plano.
Sem dependências novas, escrita em dados reais, commit, push ou deploy. Processo de QA local encerrado ao finalizar.

## 2026-09-16 — Dados reais de marca e logo

- Aplicados controlador, e-mail, endereço, WhatsApp, horário e CRECI informados pelo proprietário em `src/config/brand.ts`.
- Incorporado o logo oficial enviado em `public/assets/brand-logo.jpg` e usado no cabeçalho público.
- Rodapé passou a exibir o CRECI quando informado; política de privacidade deixa o modo preparatório ao receber os dados completos.
- Validação focalizada: `npm run typecheck` aprovado; testes de `PublicLayout` e `format` aprovados (2 arquivos/20 testes); `git diff --check` aprovado. Sem commit, push ou deploy.

## 2026-09-16 — Correção do ativo do logo

- Substituído o JPG vertical com espaço vazio por recorte horizontal em PNG, preservando o lockup enviado.
- Removido o `mix-blend` do cabeçalho para não alterar as cores do logo entre temas.
## 2026-09-17 — Regressão de segurança do JSON-LD

Adicionado teste em `src/seo/metadata.test.ts` para payloads armazenados em título e descrição de imóvel. O teste extrai o JSON-LD SSR, executa `JSON.parse()`, confirma a preservação textual e garante que `</script>` não aparece literalmente no conteúdo serializado; também verifica o escape HTML de título e descrição nas meta tags.

Decisão registrada em `DECISIONS.md`: manter escape contextual Unicode em `serialize()`, sem regex de remoção de tags, DOMPurify ou `JSON.stringify()` direto no HTML. Nenhum dado, banco, API ou configuração de rate limit foi alterado.

Validação real: teste direcionado aprovado (1 arquivo/4 testes), `npm run typecheck` aprovado, `npm run lint` aprovado, suíte completa aprovada (37 arquivos/178 testes), `npm run build` aprovado e `git diff --check` aprovado. `node scripts/seo-smoke.mjs` permanece bloqueado por asserção preexistente que usa query parameters legados (`purpose/type`) e espera redirect 301, incompatível com as rotas/parâmetros atuais em português; o smoke não foi alterado nesta tarefa.
# 2026-10-03 — Codex: acesso do dev server pelo celular

Alterado `scripts/dev.mjs` para escutar em `HOST` ou, por padrão, `0.0.0.0`. O servidor foi reiniciado com `npm run dev` e iniciou em `http://0.0.0.0:5173`.

Validação: inicialização real do servidor aprovada. Endereço Wi-Fi observado: `http://192.168.0.20:5173`. Não foram executados typecheck, lint, testes ou build, pois a mudança é somente no bind do servidor de desenvolvimento.


## 2026-10-05 — Codex: refinamento da Área do Corretor concluído localmente

Plano autorizado pelo dono em conversa, incluindo a correção: modal intacto fecha com um Esc; edição pendente exige dois Esc consecutivos, sem prazo. Tooltip e seleção têm prioridade antes do fechamento. Implementado: seções abertas em vez de cartões decorativos, trilho desktop com ícones e navegação mobile nomeada, dicas por foco/hover em todos os botões e destinos, campos refinados/números com unidade externa, fichas de consulta de imóvel/corretor, contratos abertos pelo fundo de toda a linha/item, menu de comandos e atalhos. Guarda de imóvel preservada e perfil/senha protegidos ao navegar.

Arquivos: novos DicasPainel, EntradaNumero, ComandosPainel, FichasPainel e useAtalhosPainel; base AcaoIcone, Campo via CSS, Dialogo, ConfirmarAcao, SeletorRegistro, Tabela e estilosPainel; global.css e telas LayoutPainel, VisaoGeral, Perfil, Imoveis, FormularioImovel, Contatos, Pessoas, EditorPessoa, FichaPessoa, FichaImovel, Corretores, Cadastros, Contratos, DetalheContrato e Comissoes. Cinco documentos de contexto atualizados por acréscimo, sem remover histórico.

Revisão independente e correções: desarmar descarte por outra tecla também quando o seletor consume preventDefault; aviso de Esc fixo abaixo do cabeçalho para formulário longo; trava de rolagem/foco mantida por pilha; tooltip reposicionado em scroll/resize e restaurado para o botão focado ao sair do hover; Ctrl/Command+Enter consumido em confirmações financeiras/destrutivas para impedir ativação nativa; alturas de input uniformizadas quando campo vizinho possui dica. Sem novos achados confirmados na revisão.

Validação final real:

- npm run typecheck: exit 0.
- npm run lint: exit 0.
- npm test -- --maxWorkers=1 --reporter=dot: exit 0, 3 arquivos e 21 testes existentes aprovados; nenhuma suíte fonte ampliada.
- npm run build: exit 0, cliente/SSR/Build Output gerados. Somente avisos de annotations de dependência Zod no Rollup, sem falha.
- node scripts/seo-smoke.mjs: exit 0, SSR/metadados/paginação/404/discovery/proxy cookies/runtime standalone/indisponibilidade pública e HEAD.
- node artifacts/refino-painel/validar.mjs: exit 0, 28/28 checks (22 funcionais e 6 matrizes), 72 capturas em 390/768/1440 claro/escuro. Sem erros JS, rotas inesperadas, overflow, campos abaixo de 16px ou alvos abaixo de 44px.
- 17 verificações efêmeras adicionais de EntradaNumero/RHF em DOM/jsdom aprovadas. Verificação Chrome cobre colagem, edição e limpeza após colagem.
- git diff --check: exit 0.

QA usa Chrome e API inteiramente simulada, com chamadas externas bloqueadas. Cobriu foco/mouse/Tab/ShiftTab/aria/tooltip Esc, modal intacto/dirty/valores restaurados/desarme/confirmar saída/ocupado, sobreposição de fichas, erro/retry/404, prioridades do seletor, Ctrl/Command+K, /, ?, Ctrl/Command+Enter e exclusão financeira/destrutiva, navegação e guardas de imóvel/perfil, permissões ADMIN/CORRETOR e contratos em desktop/mobile. Capturas de contratos, fichas, perfil e formulário inspecionadas visualmente. Evidências ignoradas em artifacts/refino-painel/resultados.json e artifacts/refino-area-numeros; não integram o produto. Preview QA próprio 4186 e demais processos próprios encerrados.

Pendências: API/banco/Drive/R2 reais, Safari/iOS e dispositivos físicos não homologados nesta entrega. Main, sem novas dependências, mudanças de API/dados, migrations, commit, push ou deploy. Alterações preexistentes da API não foram tocadas.

## 2026-10-06 — Área do Corretor: clareza, conforto e elegância concluídos localmente

Sidebar com nomes e bases douradas, textos 18/16/20px, ações arredondadas com ícone/texto, campos outlined e contatos em blocos suaves. Cabeçalhos e Responder contatos alinhados; tabelas com espaçamento e limiar mobile antecipado. Funcionalidades anteriores preservadas.

Validação desta revisão: npm run typecheck, npm run lint, 21/21 testes existentes (3 arquivos), npm run build, node scripts/seo-smoke.mjs e git diff --check aprovados. Build com avisos conhecidos de annotations da dependência Zod; sem falha. Chrome com API simulada: 28 cenários aprovados no resultado consolidado; primeira execução final 27/28 e um timeout de estabilidade ao clicar em Editar, repetido isoladamente e aprovado. Seis matrizes de layout e 72 capturas das dez telas e dois modais em 390/768/1440 nos temas claro/escuro, sem overflow, campos abaixo de 18px ou alvos de AcaoIcone abaixo de 48px. Conferidos título 20px, token dourado e sidebar 260px. Evidências ignoradas em artifacts/refino-conforto/resultados-consolidados.json; nenhum teste fonte ampliado.

Inspeção de capturas de Contatos, Visão geral, Imóveis, Contratos e formulários/modais verificou legibilidade, alinhamento, quebra, foco e aparência. Regressão cobre tooltips/aria/Tab/ShiftTab/hover/Esc, modais intactos/alterados/valores restaurados/desarme/ocupado/sobreposição, fichas/retry/404/foco, contratos e controles internos, campos numéricos, atalhos e ADMIN/CORRETOR. As primeiras medições intermediárias de cor foram corrigidas para ler o token durante animação de hover; uma execução intermediária com preview anterior ao rebuild foi descartada após reiniciar o preview. Resultados finais acima são do build atualizado.

Validação simulada não homologa API/banco/Drive/R2 reais, Safari/iOS ou dispositivo físico. Site público preservado pelo escopo de CSS; smoke SSR público aprovado. Sem novas dependências, API/dados/migrations, commit/push/deploy. Os cinco documentos foram atualizados por acréscimo, mantendo o histórico. Preview QA próprio encerrado ao finalizar; desenvolvimento existente em localhost:5173 permanece disponível ao dono.

## 2026-10-06 — Refatoração da Área do Corretor revertida pelo dono

Pedido explícito: “reverta tudo, e me dê um plano e um resumo do que foi pedido”. Revertidas integralmente as duas etapas desta conversa: mudanças visuais, sidebar, fontes, botões/inputs, tooltips centralizados, entradas numéricas, fichas em modal, contratos clicáveis, atalhos e fechamento com dois Esc. Arquivos fonte rastreados restaurados ao estado anterior da refatoração; cinco componentes/hooks novos retirados do código ativo. API, banco, dependências e trabalho anterior preservados. Nenhum commit, push ou deploy.

Os registros de implementação/validação de 05 e 06/10 acima são históricos e NÃO descrevem o produto atual. As orientações específicas dessa refatoração ficam canceladas como instruções de implementação vigente. O novo documento PLANO-AREA-CORRETOR.md contém apenas o pedido consolidado e a proposta de execução futura; não autoriza reimplementar. Preservar o restante das orientações do repositório. Backup local ignorado em artifacts/reversao-area-corretor-2026-10-06.

Verificação da reversão: todos os arquivos rastreados de src comparados por hash ao HEAD, sem diferenças; componentes novos ausentes e referências removidas. npm run build e node scripts/seo-smoke.mjs aprovados após a reversão, assim como git diff --check. A suíte de testes não foi repetida nesta reversão. Plano entregue em docs/PLANO-AREA-CORRETOR.md.

## 2026-10-09 — Codex: contorno de foco após Esc

Implementado o plano autorizado: `data-foco-navegacao` no main do painel e no h1 de Desenvolvedores; `[data-foco-navegacao]:focus { outline: none; }` em global.css. Preservados tabIndex, foco programático, Pular para o conteúdo, retorno do foco e regras de Esc. A marcação é exclusiva de destinos não interativos; não aplicar a todos os elementos com tabindex=-1 nem remover o foco visível de controles.

Validação: typecheck, lint, build e testes existentes aprovados (3 arquivos, 23 testes). QA efêmero Chrome com API simulada: 19 verificações aprovadas, incluindo reprodução da borda de 3px com a nova regra removida via CSSOM, Visão geral/Imóveis/Contratos/Devs nos dois temas, Tab em link/botão/input, filtro, menu mobile, diálogo intacto com retorno do foco e diálogo alterado com dois Esc. Capturas e resultados ignorados em artifacts/esc-foco-2026-10-09. Sem erros JavaScript nos cenários concluídos. Primeiro QA usou rótulo inexistente Abrir menu; corrigido para Menu. Reinícios do navegador foram necessários antes da rodada final completa.

O smoke original scripts/seo-smoke.mjs falhou na expectativa antiga do h1 Imóveis comerciais; a tela atual usa Imóveis para alugar e comprar. Cópia efêmera com apenas essa expectativa e caminhos de import ajustados passou: SSR, metadados, paginação, 404, discovery, proxy/cookies, função Vercel gerada e indisponibilidade/recuperação 503. O script original foi preservado; sua expectativa continua pendente de atualização fora deste escopo. Build emitiu avisos de anotação PURE do Zod e chunk maior que 500 kB, sem impedir conclusão.

Entrega local concluída; alterações preexistentes preservadas. Sem novas suítes, dependências, API, banco, commit, push ou deploy por esta tarefa. QA simulado não equivale a homologação real nem validação em Safari/iOS.

2026-10-09 — Atualização: dono autorizou commit e push da correção de foco e destes registros na main. Validações da entrega acima permanecem aplicáveis; publicação no Git não confirma deploy.


---

## Arquivo original: CLAUDE.md

@docs/AGENTS.md

# Instruções específicas do Claude

Antes de responder ou modificar arquivos:

- Leia `docs/PROJECT_STATUS.md`, `docs/TASKS.md` e `docs/DECISIONS.md`.
- Leia o último registro de `docs/CHANGELOG_AI.md`.
- Confira o estado do Git e se a branch está sincronizada com o remoto.
- Em dúvida sobre regra de produto, consulte `corretor-spec.json`.

Durante o trabalho:

- Não confie no `docs/README.md`, no `docs/PLANO-PROJETO-CORRETOR.md` nem em auditorias antigas para afirmar o que existe:
  eles estão desatualizados em pontos conhecidos. A fonte de verdade é o código.
- Os arquivos `.ts`/`.tsx` deste repositório têm linhas muito longas; ao ler, use `fold -w 400 -s <arquivo>` para
  não perder conteúdo truncado.
- Mudança em SSR, SEO, contrato com a API ou variável de ambiente exige registro em `docs/DECISIONS.md`.
- Prefira revisar e planejar a implementar em paralelo com o outro agente na mesma área.

Quando terminar:

- Atualize o status da tarefa em `docs/PROJECT_STATUS.md` e `docs/TASKS.md`.
- Registre decisões arquiteturais em `docs/DECISIONS.md`.
- Liste em `docs/CHANGELOG_AI.md` os testes executados e o resultado real, incluindo falhas.
- Para mudanças em página pública, confira também no navegador ou por `curl`: catálogo, detalhe de imóvel,
  `robots.txt`, `sitemap.xml` e uma rota inexistente.
- Não considere uma tarefa concluída só porque o código compila.


---

## Arquivo original: comando-medir.md

---
description: Mede requisições por tela, bundle e cache HTTP e compara com o orçamento do projeto
argument-hint: "[tela ou trecho do nome do teste: catalogo, visao-geral, perfil...]"
---

Use o subagente `auditor-desempenho` para medir: $ARGUMENTS

Sem argumento, meça todas as telas. Traga a tabela medido × orçamento, as regressões e as oportunidades separadas em
front, API e infraestrutura, sem alterar código.


---

## Arquivo original: comando-revisar-design.md

---
description: Revisa o visual de uma tela (ou das telas alteradas) com prints reais e devolve problemas priorizados
argument-hint: "[tela ou trecho do nome do teste: corretores, modal, catalogo...]"
---

Use o subagente `revisor-design` para revisar: $ARGUMENTS

Sem argumento, revise as telas afetadas pelo `git diff` atual; se não houver diff, revise todas. Traga o relatório com
a triagem e os caminhos dos prints, e não altere código.


---

## Arquivo original: DECISIONS.md

# Decisões técnicas — corretor-web

## 2026-10-09 — Ações de tabela alinhadas no desktop

- A coluna de ações do componente compartilhado não usa mais `w-px`/flex wrap no layout desktop. A largura segue o conteúdo e `min-w-max` mantém os ícones na mesma linha; a partir de 40rem, o wrapper usa `flex-nowrap`.
- A tabela mobile continua usando cartões e `flex-wrap`, permitindo que ações ocupem mais de uma linha quando a largura não comportar todos os botões. Essa separação evita overflow horizontal sem sacrificar o alvo de toque de 44px.
- Contatos deixou de impor `min-w-[12rem]`, que era menor que quatro ícones mais os espaçamentos. Permissões, tooltips, links e callbacks permanecem sem alteração.

## 2026-10-09 — Vocabulário comum para o painel inteiro

- O dono aprovou a ficha de imóvel e pediu padronizar o painel, definindo todas as telas como referências. Consolidar acabamento e componentes sem impor a composição de uma única tela às demais. Esta decisão amplia o escopo visual das notas registrado abaixo; comportamento e contratos permanecem iguais.
- `SecaoPainel`, `GradePainel`, `DadosFicha` e `DadoFicha` centralizam a apresentação. Título externo associado por `useId`/`aria-labelledby`, superfície separada e subgrid garantem topo/base iguais por linha, mesmo com títulos quebrados; sem altura fixa ou corte de conteúdo. Superfícies em azul/dourado, raio 5px, borda superior 3px, sombra leve, gaps 16px e padding 16–20px.
- Container `grade-painel`: duas colunas em 44rem e até três em 70rem. Grade dupla permanece em duas; grids de campos/formulários têm os limites próprios existentes. Ficha de imóvel conserva container/galeria e a ordem aprovados, usando a seção compartilhada.
- Formulários mantêm âncoras, grupos recolhíveis, selects, rodapés e guardas. Cabeçalho de diálogo continua dentro dele. Perfil/senha ficam em seções distintas sem unir os formulários. Rótulos de indicadores continuam junto dos valores; títulos dos grupos de indicadores ficam externos.
- Novo/Editar/Buscar usam ícone e dica acessível; Salvar/Cancelar, confirmações, CTAs de seção e ações financeiras mantêm texto. Não criar filtros/controles para preencher espaços. Chips preservam alvo de toque de 44px. Tabelas mantêm alternância/ações à direita; se aninhadas numa superfície, não repetem borda dourada ou sombra interna.
- Estados e paginação compartilhados recebem classes com regras restritas a `.painel-ui`. Na entrada, o escopo vale apenas para o formulário, preservando a composição de marca. Site público, APIs, tipos, schemas, permissões e dados não entram no escopo.
- Validação efêmera com API simulada e revisão independente; nenhuma nova suíte/dependência. Entrega local em main, preservando histórico e índice Git, sem publicação. Documento de entrega: `2026-10-09-padronizacao-painel.md`.

## 2026-10-09 — Ficha com títulos externos e alturas uniformes por linha

- O dono rejeitou o desalinhamento da primeira composição e escolheu mesma altura por linha. Esta decisão substitui a altura independente dos cards e os títulos dentro da superfície registrados abaixo.
- Cada seção usa título externo associado por `useId`/`aria-labelledby` e superfície independente. Subgrid compartilha as linhas de título e conteúdo, incluindo títulos quebrados; stretch alinha as bases sem alturas fixas, max-height, cortes ou rolagem interna.
- A altura continua determinada pelo conteúdo maior daquela linha. Cards menores têm espaço livre para cumprir o alinhamento solicitado. No celular, cada seção ocupa sua própria linha.
- Preservar a proporção 2:1 do topo, limites de 44/70rem, descrição em duas colunas e container da própria superfície para os campos internos. Ajustar apenas os seletores locais da galeria à estrutura nova.
- Ficha interna precede Descrição no DOM para preencher a segunda coluna ao lado de Pessoas, evitando célula vazia intermediária sem `grid-auto-flow: dense` ou divergência da ordem visual/teclado. Apenas as duas regras de dimensão da galeria ficam em `@layer utilities`, no mesmo nível das classes do componente compartilhado; a especificidade local garante foto até 380px e miniaturas 80×56 exclusivamente nesta ficha.

## 2026-10-09 — Notas compactas somente na ficha administrativa de imóvel

- `FichaImovel` concentra a nova composição, incluindo a consulta em `FormularioImovel` sem permissão. Não duplicar componentes nem alterar contratos.
- Post-its discretos: superfícies dos tokens existentes, borda superior dourada, sombra leve, sem rotação ou cores adicionais. Altura acompanha o conteúdo, sem recolher dados.
- Container `ficha-imovel`: topo 2:1 e grade de duas colunas a partir de 44rem, três a partir de 70rem. Container da nota permite duas colunas nos campos internos a partir de 20rem. Manter a escala de fontes do painel.
- Estilos específicos `.painel-ui .imovel-*`; galeria compartilhada permanece intacta. Não propagar esses estilos ao site público ou a outras fichas.

## 2026-10-09 — Ações de lista só com ícone; texto só fora das listas (pedido do dono)

- Colunas de Ações das listas do painel usam só `AcaoIcone` (44px, tooltip, sem texto visível): WhatsApp,
  Editar, transições de atendimento e arquivar/reativar. Contatos e ficha de pessoa seguem esse padrão.
- Exceção à regra "WhatsApp conserva texto": ela continua valendo para fichas (`FichaCorretor`), site
  público e CTAs de seção; nas listas o ícone com `aria-label` + tooltip basta e evita pill destoante.
- `Registrar recebimento` (parcelas) conserva `buttonGhost` com texto: ação financeira com confirmação
  não vira ícone. Formulários/diálogos (Salvar/Cancelar/Registrar/Entrar) e CTAs primários de ficha
  (`Ver anúncio`, `Abrir pasta no Drive`) também conservam texto. Não aplicar o padrão só-ícone no site público.

## 2026-10-09 — Botão único de voltar e Esc em todas as telas (pedido do dono)

- Toda tela com retorno usa `BotaoVoltar` (seta em círculo de 44px, fundo `soft`, hover dourado com
  ícone navy nos dois temas); o texto fica só em `aria-label`/`title`. `CabecalhoPagina.voltar` recebe
  `{ to, rotulo }`. Saíram breadcrumb, selo de status e eyebrow do detalhe público do imóvel; o título
  ocupa a linha cheia, à direita da seta.
- Esc é o atalho de voltar do sistema inteiro. Público e login (`useEscVoltar`): fora do catálogo, Esc
  leva à tela inicial (`/`); no catálogo não faz nada. Painel (`useVoltarPainel`): mantém a decisão de
  06/10 (página anterior; sem histórico, lista da seção e depois Visão geral).
- Esc só volta se nenhuma camada o consumiu: diálogo aberto, `[data-esc-camada]`, menu mobile, dicas,
  filtros suspensos (todos chamam `preventDefault`) ou foco em campo de texto. Regra única em
  `escPodeVoltar` (`src/hooks/useEscVoltar.ts`). Componente novo que trate Esc deve chamar
  `preventDefault()` para não disparar o retorno.
- Botões de ação "Voltar" de telas de erro e o "Voltar" do rodapé do formulário de imóvel continuam
  como botões com texto (são ação principal/cancelar, não navegação do cabeçalho).

## 2026-10-08 — Codex: 404 da foto corrigido na implantação

O dono autorizou resolver pela página aberta do Render usando Computer Use. Confirmado commit ativo antigo e3b0a32; implantação manual do origin/main 86ecf29 concluída (Deploy succeeded/Live), serviço srv-daj21e15efls73fab4gg, deploy dep-db4684m0tbcc73d9jtr0. Este registro substitui a pendência de acesso/publicação do diagnóstico abaixo.

URL original /api/corretores/1/foto?v=1f6h7x3 agora responde 302; seguindo redirect, HTTP 200 image/jpeg, 22322 bytes. /api/v1/saude da API retorna status ok. Perfil aberto recarregado para verificar a correção. Sem alterações funcionais, migrations, gravação de dados, commit ou push; documentação histórica preservada. Conector Render segue indisponível, mas sessão do navegador permitiu corrigir a implantação.


## 2026-10-08 — 404 de rota da foto na implantação

Não substituir a leitura por id por acesso direto ao bucket privado para contornar Cannot GET. O proxy e a rota atual foram validados localmente (302 externo/200 gerenciado, banco/storage simulados). Verificar versão/build/start do Render antes de modificar código ou dados; publicar somente com autorização. O commit publicado ainda não foi confirmado: conexão Render expirada.


## 2026-10-06 — Refinamento de contatos, perfil e filtros

- O plano explicitamente aprovado autoriza frontend e API; sem commit/push/deploy/migrations.
- Seletores medem conteúdo e limitam largura à janela; rótulos quebram entre palavras. Mantidos popover,
  foco, Esc e posicionamento. Contatos tem uma lista e três abas, com páginas independentes.
- Perfil usa dois cards a partir de 58rem do container principal e três métricas a partir de 38rem.
  Os formulários são independentes. Seleção de arquivo entra na guarda e no bloqueio de salvamento.
- `useFiltrosAutomaticos` centraliza debounce, cancelamento, normalização, erro e deduplicação. Seleções,
  datas e chips aplicam imediatamente; inválidos preservam resultados. Limpar também trata página isolada.
- Catalogo mantém a mesma montagem entre URLs; consultas automáticas usam replace, paginação mantém
  histórico. Validação usa valores candidatos e estado de badInput, sem consultar o DOM anterior ao render.
- url_foto não editada é omitida; a API rejeita restauração de URL gerenciada antiga. Exibição por id/hash
  usa `urlFotoCorretor` no perfil, sidebar, ficha e detalhe, respeitando base e proxy.
- Bucket permanece privado. JSON compatível, multipart e leitura por id sem chaves arbitrárias;
  storage/quota compartilhados, Put antes da transação e limpeza compensatória/após commit.
- Não acrescentar suíte rastreada. R2 temporário real e banco simulado são evidências diferentes;
  não declarar homologação de avatar no Neon. System Design preserva o pacote visual do template.

## 2026-10-06 — Cabeçalhos no estilo de "Encontrar um imóvel" (pedido do dono)

- Todos os botões dos cabeçalhos, no site e no painel, usam `.linha-nav` (`global.css`): negrito e linha dourada
  de 2px que cresce no hover/foco e fica fixa no destino atual (`aria-current`). Hover só em `@media (hover:hover)`.
- "Encontrar um imóvel" saiu do cabeçalho: levava a `/`, o mesmo destino do logo. O foco inicial do menu mobile
  passa para "Alugar". O rodapé continua com "Imóveis comerciais".
- O botão de tema (site) e os botões do topo da sidebar (Buscar, Menu, Sair da conta, tema) ficaram sem borda.
- Painel: o destino ativo deixa a pílula de fundo e passa à linha dourada sob o nome, com todos os itens em negrito.
  A base dourada do ícone ativo continua. Isso substitui esse ponto da especificação visual de 06/10, por escolha
  expressa do dono.
- Links dentro de texto usam `.link-texto` (sublinhado discreto, dourado no hover). Páginas de erro montam
  Alugar/Comprar com `urlCatalogo`, sem caminhos fixos.


## 2026-10-06 — Conclusão autorizada das specs completas do painel

- O novo pedido autoriza as etapas posteriores a Contatos e todos os comportamentos aprovados.
  Estado corrente em `2026-10-06-conclusao-area-corretor.md`; snapshots anteriores preservados.
- Fichas próprias usam rotas e serviços existentes. ADMIN consulta corretor/classificação;
  CORRETOR usa somente campos públicos do responsável já disponíveis em fichas autorizadas.
  403/404 vira indisponível; demais falhas mantêm retry. Não ampliar contratos/endpoints.
- CampoNumero mantém texto e remove só separadores de milhar da colagem para permitir editar;
  conversão/validação/decimal da API permanecem nos adaptadores e esquemas atuais.
- Dialogo recebe dirty/busy opt-in e mantém defaults públicos. Descarte arma Esc/Enter,
  outras teclas desarmam mesmo se rejeitadas, somente topo fecha, envio bloqueia fechamento.
  Cancelar de editor usa data-fechar-dialogo; descarte não reverte operações persistidas.
- Perfil agrega dirty dos dois formulários e reseta só o salvo; falha de refresh após PATCH
  informa persistência. Restaurar imóvel da pessoa compara id e reutiliza referência inicial.
- Só Ctrl/⌘+K: paleta com destinos/ações permitidos; execução após desmontagem preserva foco.
  Não reintroduzir `/`, `?`, Ctrl/⌘+Enter, fichas em modal ou regras CSS fora de `.painel-ui`.
- Manter main, índice e trabalhos anteriores; QA somente efêmero/simulado, sem suíte nova,
  backend, dados, dependências ou publicação. Homologação real permanece explicitamente separada.

## 2026-10-06 — Revisão de usabilidade aprovada pelo dono

- Esc retorna à página anterior do painel, conforme escolha expressa do dono; detalhes sem
  histórico vão à lista e telas principais à Visão geral. Não usar histórico externo nem ignorar
  camadas/foco de edição. Substitui a decisão anterior de retorno sempre à lista/Visão geral.
- “Gavetas” significa seletores dos filtros. SeletorFiltro tem valores/opções/callback tipados,
  sem dependência nova; selects dos editores permanecem. Menu mobile usa tela inteira apenas
  nessa variante de Dialogo. Campo/label continuam ligados ao controle acessível.
- Cards mantêm identificação à esquerda e valores/ações à direita. Ações das listagens têm
  alvos de 44px; grupos curtos de ícones não quebram dentro da coluna desktop.
- Atendido preserva checkbox e regras atuais. Remover filtro sem foto e detalhes de origem das
  listas não remove dados; origem/consentimento permanecem na ficha da pessoa.
- Esta aprovação autoriza os ajustes pedidos nas telas e base compartilhada. Não antecipa
  fichas novas, CampoNumero, guarda adicional de modais, Ctrl+K ou backend/publicação.

## 2026-10-06 — Retomada pelo padrão do parceiro e primeiro marco de Contatos

- O pedido atual autoriza continuar a implementação do plano com a base `a2a9f81`. A especificação
  visual de 06/10 substitui `PLANO-AREA-CORRETOR.md`; requisitos históricos conflitantes ficam como histórico.
- Respeitar a ordem explícita: implementar e validar Contatos, apresentar ao dono e aguardar essa
  revisão antes das outras telas. Não registrar o plano inteiro como concluído neste marco.
- Contatos usa duas filas paginadas e histórico separado. Checkbox alterna PENDENTE/RESPONDIDO;
  finalizar exige confirmação e só remove da fila após sucesso. Erro mantém o estado e permite retry.
- Compartilhar as permissões de pessoa entre Contatos, Pessoas e EditorPessoa: ADMIN ou responsável
  edita; só ADMIN sai de FINALIZADO. O bloqueio de reabertura é do frontend; não substitui autorização
  do backend nem homologa essa regra na API atual.
- Reutilizar Tabela, Campo, AcaoIcone e ConfirmarAcao. Mensagem expansível não abre a linha; links
  reais preservam teclado e atalhos de guia. IconeFinalizar usa o SVG oficial Material Symbols
  Outlined/FILL 1 (`task_alt`), embutido, sem fonte ou dependência nova.
- Tooltip usa a camada popover apenas em `.painel-ui`, limitado à janela; Esc consome a dica primeiro.
  Correção do espaçamento mobile do cabeçalho de Dialogo também fica restrita ao painel.
- Após a revisão, consultas novas serão telas próprias, conforme o plano aprovado, usando os serviços
  atuais e somente dados autorizados. CampoNumero, guardas e Ctrl/⌘+K ficam para as próximas fases;
  `/`, `?` e Ctrl/⌘+Enter não serão reintroduzidos.
- Evidência efêmera em `artifacts/area-corretor-2026-10-06/`, ignorada pelo Git. Preservar os 3 arquivos
  e 21 testes existentes; sem API/dados/migrations, novas dependências ou publicação.

## 2026-10-04 — Centralização de documentação em estrutura plana na pasta docs/ (Antigravity)

- **Decisão:** Todos os arquivos de documentação em markdown (`.md`), incluindo instruções de agentes (`AGENTS.md`, `CLAUDE.md`), histórico (`CHANGELOG_AI.md`), decisões (`DECISIONS.md`), status (`PROJECT_STATUS.md`), tarefas (`TASKS.md`), plano do projeto (`PLANO-PROJETO-CORRETOR.md`), README e auditorias devem residir exclusivamente dentro da pasta `docs/`.
- **Estrutura plana:** A pasta `docs/` é estritamente plana (sem subpastas como `docs/audits/`, etc.) e pastas de configuração de agentes isoladas (como `.claude/`) foram eliminadas.
- **Motivo:** Decisão explícita do proprietário para organizar a navegação humana, eliminando arquivos markdown dispersos na raiz do repositório e em múltiplas árvores de diretórios.
- **O que não fazer:** Não recriar arquivos `.md` soltos na raiz nem subdiretórios dentro de `docs/`. Todos os agentes de IA devem ler e manter a documentação diretamente em `docs/*.md`.
## 2026-10-04 — Suíte mínima recriada e filtros reorganizados (Claude)

- Após a revisão externa, o dono pediu a recuperação da rede de segurança sem voltar aos 46 arquivos. Foram recriados apenas
  3 arquivos em `src/servicos/` (contato/LGPD/WhatsApp/CPF-CNPJ, URL de filtro e cálculos de valor com o catálogo de exemplo).
  Isto substitui, só neste escopo, a regra "não recriar suítes sem novo pedido". Não ampliar sem pedido.
- `npm test` volta a passar de verdade; `visual` continua sem specs e não deve ser alegado como verificado.
- Cidade e bairro saem da linha principal do filtro e vão para "Mais filtros" (dois campos sem uso comum não valem a linha principal).
  Não recolocar campos opcionais na linha principal sem dado que justifique.
- O herói do catálogo não pode reutilizar a capa de anúncios. Dados de demonstração devem variar tipo, finalidade, valor e bairro.
- Ações secundárias do detalhe (compartilhar/mapa) ficam no card de valor, nunca soltas acima da galeria.

## 2026-10-03 — Limpeza visual da animação do operário no /devs (Antigravity)

- Removido o bloco de andaime em `CenaObra.tsx` posicionado nas mesmas coordenadas do operário.
  A prancha superior dourada (`var(--color-gold)`) vazava pelas laterais do capacete, criando a
  ilusão de um suporte/haste amarelo fixado na cabeça do operário.
- Com a remoção, a silhueta do personagem, o capacete e o movimento do martelo ficam destacados
  e limpos, em consonância com a apresentação do operário em `CenaReparo.tsx`. Não recolocar
  estruturas estáticas com a mesma cor do personagem sobre a mesma área de desenho.

## 2026-10-03 — Catálogo com dados persistentes na API (Codex)

- Esclarecimento do dono: preencher de verdade o banco da API com 12 anúncios e fotos da internet.
  O frontend continua consumindo o contrato real; não adicionar fixtures/fallback ou modo demo.
- Conteúdo de Juara/MT com preços, áreas, características e endereços sintéticos, e fotos
  ilustrativas identificadas nas descrições. Fontes e licença das 36 imagens ficam documentadas
  na API. Arquivos originais também são armazenados no R2 existente; como `R2_PUBLIC_URL` responde
  HTTP 401, `imoveis_midias.url` usa a URL Unsplash licenciada. Não abrir/publicar o bucket para
  corrigir isso; fazer a migração para domínio público próprio quando houver configuração aprovada.
- ADMIN Codice responsável pelos imóveis; criação/dados assinados tecnicamente pelo ADMIN id 1.
  Contatos vêm do WhatsApp comercial confirmado; não inventar contatos de pessoas desconhecidas.
- Preservar dados atuais, logo/cores/layout, os 503/404 e mudanças locais anteriores.
  QA local usa controllers/services e banco/R2 reais, sem scheduler financeiro/limpeza de sessões.
  Sem migration, commit, push ou deploy nesta carga; não alterar os dados de imóveis existentes.

## 2026-10-03 — Cartoon de reparo e recuperação do 503 (Codex)

- Plano aprovado pelo dono: casa apagada e operário ajustando o quadro de energia, SVG local na
  identidade existente, loop suave de 6s sem som. Pausa congela o progresso; movimento reduzido e
  SSR/primeiro render são estáticos. O movimento começa só quando o controle pode ser montado.
- Substitui as decisões anteriores que mantinham o 503 sem cena/recuperação: sondar a própria URL
  pública por HEAD em `verificarPaginaPublica`, centralizado em `api.ts`, sem cliente JSON/token.
  `/saude` isolado não prova que classificações/catálogo/detalhe voltaram. Não usar saúde para recarregar.
- Primeira sondagem após 30s, próxima 30s após terminar, uma por vez e limite de 50s (SSR conserva
  orçamento de 45s). Resposta 200/404, após redirects internos, recarrega a URL atual com filtros/hash;
  erro/timeout/outros status conservam a espera. Não declarar recuperação pela duração da animação.
- Visibilidade/conexão governam as sondagens; ocultar/offline cancela e retomar aguarda outros 30s.
  Sair/trocar URL/retry manual invalida timers e respostas anteriores, inclusive em StrictMode.
- Tentar novamente é link estilizado: sem JS preserva path/query; com JS cancela a sondagem e recarrega,
  preservando também hash. O href renderizado omite hash, que não chega ao SSR, para evitar hidratação
  divergente. Pausar a cena não pausa a recuperação.
- HTTP 503, noindex, no-store e Retry-After permanecem. HEAD ainda realiza as buscas/render SSR;
  não aumentar timeouts do servidor, criar keep-alive nem mudar plano/infra nesta entrega.
  Erros inline do catálogo/painel continuam fora deste fluxo. Sem dependências ou mudança da API.
- QA pelo smoke existente e scripts efêmeros ignorados; não recriar suítes fonte removidas.
  Cache/CDN e cold start no ambiente publicado exigem homologação própria.

## 2026-10-03 — Refinamento do público e painel com ações discretas (Codex)

- Preservar logo, navy/dourado e fontes existentes. Ações auxiliares usam `AcaoIcone`
  com desenho de 19px, área de toque de 44px, nome contextual, dica no hover/foco e Escape.
  Salvar, criar, buscar, WhatsApp e transições de atendimento continuam com texto. Não substituir
  decisões importantes por símbolos ambíguos nem diminuir o alvo junto com o desenho.
- `Campo` conecta rótulo, dica e erro sem trocar RHF/zod; controles têm pelo menos 16px.
  `Aviso` usa tokens de estado próprios nos dois temas. `Tabela` conserva todas as colunas nos
  cartões quando seu container tem menos de 40rem; não esconder identificadores ou dados.
- Confirmações usam `ConfirmarAcao`/`Dialogo`, com foco inicial em Cancelar e bloqueio durante
  a operação. O consumidor fecha ou avança após sucesso; falhas mantêm a confirmação aberta.
  Não fechar automaticamente em toda resolução: há erros tratados e duplicação em duas etapas.
- Formulário de imóvel conserva seis seções abertas e rascunho por aba. Âncoras internas não
  disparam a guarda; mudança de página/query e saída do navegador continuam protegidas.
  Mídias de imóvel existente continuam salvas imediatamente, com aviso explícito ao usuário.
- Navegação móvel do painel usa diálogo completo, com destinos conforme o cargo. Resumo
  prioriza contatos pendentes e reutiliza sua leitura; finanças e portfólio preservam os cálculos.
  Listas e seletores ocultam ações/resultados antigos durante recarga ou erro. Não criar endpoints.
- Catálogo compacto, filtros removíveis e ordenação usam o contrato de URL existente. Preços,
  encargos e corretor vêm antes da descrição no mobile; o CTA fixo reserva espaço após o rodapé.
  WhatsApp geral usa o contato comercial já configurado em `brand`, nunca contatos de desenvolvedores.
  Consentimento, validação síncrona e abertura do WhatsApp no gesto do envio permanecem preservados.
- QA desta mudança usa scripts de smoke existentes e verificações efêmeras em `artifacts/refino`
  (ignorado), com API simulada. Respeita a exclusão das suítes fonte pelo dono; não recriá-las nem
  apresentar `npm test` sem arquivos como aprovado. Sem API, dependências novas ou publicação.

## 2026-10-03 — Remover os arquivos de teste

Por pedido explícito do dono, excluir todos os fontes `*.test.*` e `*.spec.*` dos dois repositórios.
Manter configurações/scripts e dependências de teste por enquanto; não alegar validação atual por testes.
Resultados registrados antes da exclusão são históricos. Não recriar suítes sem novo pedido.

## 2026-10-03 — Revisão da auditoria: sessão e preservação de características (Codex)

- Restauração explícita e retentativa por 401 passam por `renovarSessao` no cliente HTTP, compartilhando a
  promessa apenas enquanto pendente. Uma geração invalida respostas de refresh anteriores a login/saída.
  O provedor só aplica a promessa de restauração que continua atual. Substitui o paliativo documental de dois
  caminhos de refresh. Não criar outra renovação nem persistir token fora da memória.
- PATCH de imóvel omite a coleção de características quando IDs/valores não mudaram; coleção vazia enviada
  significa remover todos os vínculos, e valores alterados são enviados explicitamente. A ficha administrativa
  inclui associação ativa com classificação global inativa; associação removida permanece fora do formulário.
- O bootstrap SSR 503 monta `PaginaErro` e seu botão recarrega a página; não afirmar recuperação automática
  por `useRecurso` nesse estado. Prazo total de 45s, individual de 10s e `Retry-After` preservados e testados com
  timings reduzidos em simulação. Nenhuma mudança de plano/serviço ou dependência.
- Evidência sintética não equivale a banco/Drive/R2/infra reais. A09/A10/A11/H01 mantêm homologação operacional
  pendente, mesmo com os testes locais aprovados.

Cada decisão registra a data, o motivo e o que **não** fazer. Antes de contrariar uma decisão, revise-a aqui
e registre a mudança com a nova data.

## 2026-10-03 — Manutenção da auditoria: fonte única, respostas vinculadas e orçamento do SSR (Muse Spark)

- **Telefone com fonte única (A06).** `src/servicos/contato.ts` importa `telefoneValido` de `src/servicos/validacao.ts`
  (idêntico ao `telefoneValido` da API) e só reexporta por compatibilidade. Motivo: o GAP-06 duplicou a regex no
  contato; duas cópias voltam a divergir como na auditoria. Não fazer: nova regra local de telefone no formulário.
- **Respostas vinculadas à consulta (A07/A08).** `useDadosPainel` guarda sequência e só aplica dados/erro/carregando
  da consulta mais recente; `Contatos` remonta a coluna pela chave dos filtros (página 1 em um único fetch, sem
  `useEffect` de reset); `Comissoes.escolherContrato` guarda sequência, ignora resposta obsoleta/limpa, exibe erro
  de carga, mostra `Buscando imóvel…` e bloqueia o `Registrar` durante a resolução. Motivo: o GAP-07/08 zerava a
  página e buscava por ID, mas a resposta tardia ainda vencia a atual. Não fazer: `setPagina(1)` em efeito após fetch
  com a página antiga nem `catch` silencioso em escolha de contrato.
- **SSR com orçamento total (A11).** `ORCAMENTO_PUBLICO_MS=45s` limita o conjunto das buscas públicas (10s por
  requisição), preservando `noindex` e `Cache-Control: no-store` em erro e adicionando `Retry-After: 30` no 503; o
  cliente hidrata via `useRecurso` e pode tentar de novo. Motivo: aumentar cada timeout sem teto estoura os 60s da
  função; cold start de plano gratuito continua possível e deve degradar para 503 seguro + retentativa. Não fazer:
  subir o timeout por requisição sem teto total nem transformar 503 em 200 parcial.
- **A09 sem marcar como concluído.** Back expõe `caracteristica_ativa` e aceita inativa já vinculada; front tipa o
  campo opcional e testa o round-trip. A persistência real (desativar → editar título → reativar) exige homologação
  integrada e segue aberta. Não marcar A09/A10/A11 como concluídos só com teste unitário.

## 2026-10-02 — Tentativa automática de som em toda abertura do /devs (Codex)

Novo pedido do dono: a intro tenta `ligarObra()` em efeito de montagem, inclusive
em URL direta, sem exigir o sinal de entrada pelo rodapé. Substitui a restrição
anterior de começar sempre mudo em acesso direto. O SSR continua mudo e sem áudio.
O navegador pode recusar autoplay audível; rejeição mantém o botão Com som para
repetir após gesto. A interface só indica som ligado depois do resultado de play.
Mute manual não dispara nova tentativa automática durante a mesma intro.

Não contornar as políticas do navegador, adicionar listeners que liguem som em
qualquer clique, alterar os 5s ou deixar áudio depois de fechar. A flag de permissão
usada na prova de autoplay é exclusiva do navegador do teste, nunca do produto.

## 2026-10-02 — Cartoon, diálogo nativo e cancelamento da reprodução da obra (Codex)

Plano aprovado: mesma família de ilustração SVG nas duas cenas, com perspectiva,
tokens e fontes existentes. A obra prepara o alicerce em 0–1s, revela paredes em
1–2,6s, assenta o telhado em 2,6–3,5s e entrega a placa em 3,5–5s; saída de 350ms.
A ruína permanece distinta e o feno começa em 1s, cruza até 6s e repete a cada 7s.
As legendas das placas usam `--color-cena-legenda`, constante nos dois temas:
`--color-on-action` escurece no tema escuro e não serve para texto sobre placas navy.

O overlay agora usa `Dialogo`/`showModal`, com `fecharAoClicarFora` opcional (padrão false)
e `classe` opcional (padrão vazio). Modais existentes conservam o comportamento.
O diálogo fechado do SSR não obstrui os créditos sem JS; foco retorna ao título
do `/devs` após desmontar a intro. Redução de movimento mostra a casa pronta e
remove a legenda temporal, mantendo os tempos e controles confirmados.

`obra.ts` compartilha o play pendente e identifica gerações de reprodução.
Desligar invalida a geração e libera as instâncias; play antigo que resolve tarde
pausa apenas os seus áudios. O overlay ignora respostas antigas, cancela timers
e preserva a origem pelo rodapé durante a repetição de efeitos do StrictMode.

Não fazer: adicionar biblioteca/áudio novo; reutilizar a cena de construção como
ruína; deixar áudio após a saída; fechar outros modais ao clicar fora por padrão;
remover Pular/Ficar aqui; alterar HTTP 404/SEO, o 503 ou dados dos desenvolvedores.

## 2026-10-03 — 404 com casa quebrada, feno e volta automática (Muse Spark)

Decisão: a 404 usa `CasaQuebrada` própria em SVG puro (ruína divertida, distinta da
`CenaObra` de construção), só com tokens do `@theme` e duas animações novas
(`feno-atravessar` 7s linear + `feno-girar` 1.4s linear, desligadas pelo
`prefers-reduced-motion` global). A volta ao catálogo (8s, `TEMPO_VOLTA_404_MS`)
é só navegação cliente declarativa (`<Navigate replace>` após timeout em efeito,
com countdown `aria-live` e botão `Ficar aqui` que cancela); o SSR segue
respondendo HTTP 404 estático com `noindex,nofollow`, sem redirect nem fetch.
O 503 mantém o visual anterior, sem casa e sem timer.

Motivo: pedido do dono (casa quebrada + feno + redirecionar à principal),
sem sequestrar a navegação de quem quer copiar a URL ou ler com calma.

Não fazer:

- Não reutilizar a `CenaObra` de obra na 404 nem voltar a imagem externa/hotlink.
- Não redirecionar no SSR (301/302) nem indexar a 404: status continua 404.
- Não aplicar a volta automática ao 503 nem remover o `Ficar aqui`.

## 2026-10-03 — Easter egg da obra no /devs com Web Audio nativo (Muse Spark)

Decisão: o canteiro do `/devs` (`CasaEmObra` + `src/servicos/obra.ts`) usa só SVG + CSS para o visual e só
Web Audio nativo (`Oscillator`/`BiquadFilter`/`Gain`, sem arquivos de áudio e sem dependência nova). O som só
começa após gesto do usuário: o clique no link "Desenvolvedores" do rodapé tenta destravar o `AudioContext`
(`sinalizarIdaAosDevs`); se o navegador bloquear, ou no acesso direto por URL, vale o botão "Ligar a obra".
O primeiro render é sempre parado (igual no SSR); áudio e timers só em efeito/handler, com desligamento total
ao desmontar. O `/devs` segue estático, sem fetch, `noindex,follow`, fora de sitemap/`llms.txt`.

Motivo: pedido do dono (casa construindo com furadeira/martelo); autoplay com som é bloqueado pelos
navegadores, e a regra do projeto proíbe dependência nova sem justificativa.

Não fazer:

- Não adicionar Howler/Tone.js nem `.mp3` para este easter egg sem revisar esta decisão.
- Não tentar autoplay sem gesto nem mascarar o bloqueio: acesso direto por URL mostra o botão, por desenho.
- Não tocar em `window`/`AudioContext` durante o render de rota pública nem buscar o `/devs` na API.

## 2026-10-03 — Intro em overlay com glassmorphism no /devs (Muse Spark)

Extensão do easter egg acima, a pedido do dono: `ObraOverlay` (`fixed inset-0 z-50`, acima do header
`z-40`) com fundo `bg-navy/60 backdrop-blur-md` e cartão `bg-paper/80 backdrop-blur-xl`. Abre em toda
visita, sai sozinho em ~5s (transição de 350ms) ou antes via Pular/Escape/clique fora; o overlay é
puramente visual e nunca toca em áudio — o som continua só na seção fixa. Primeiro render sempre aberto,
igual no SSR; timers, foco e teclado só em efeito. Cena SVG compartilhada via `CenaObra.tsx`, sem duplicação.
(Atualização no mesmo dia, ver decisão seguinte: a seção fixa foi removida e o overlay virou o dono único
do som, agora com áudios reais.)

Não fazer (então; revisto abaixo):

- Não colocar lógica de som no overlay: um único dono de áudio (`CasaEmObra`) evita dois loops simultâneos.
- Não usar `window`/`document` fora de efeito ou handler em rota pública (SSR). (Segue valendo.)

## 2026-10-03 — Áudios reais CC0 no overlay do /devs (Muse Spark)

Supersede parcial da decisão do synth, a pedido do dono ("áudios são a parte legal do easter egg"): o som
saiu do Web Audio sintetizado e passou a três MP3 reais em `public/assets` — `obra-furadeira.mp3` (#0184,
loop 10s), `obra-martelo.mp3` (#0005, 11s) e `obra-ambiente.mp3` (#0631, loop 30s) — todos CC0 (domínio
público) do BigSoundBank, sem atribuição obrigatória. Arquivos vendored no repo (sha conferido por tamanho
e magic bytes `ID3`; os longos aparados com ffmpeg local, sem dependência nova): nada de hotlink nem
streaming de terceiro. Formato MP3 de propósito (Safari não toca OGG). Custo só para quem visita o `/devs`
(`preload: 'none'` + `load()` no gesto do rodapé); resto do site e orçamento visual (`tests/visual`,
sem cobertura do `/devs`) inalterados. A seção fixa saiu (`CasaEmObra` removida); o overlay é o dono único
do som e para tudo ao desmontar.

Não fazer:

- Não voltar a hotlink externo de áudio sem motivo (quebra sem aviso, vaza `Referer`, depende de terceiro).
- Não subir OGG como único formato (Safari/iOS mudo) nem WAV/AIFF sem aparar (megabytes à toa).
- Não tocar áudio fora de gesto: acesso direto por URL começa mudo, com botão "Ativar som", por desenho.

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

## 2026-09-13 — Tailwind CSS v4 como sistema de estilos (opencode)

Decisão: adotar `tailwindcss` + `@tailwindcss/vite` (devDependencies) com configuração CSS-first em
`src/styles/tailwind.css` (`@import "tailwindcss"`, `@theme` com navy `#0A2042`/gold `#C99B3F` e tokens
paper/ink/muted/line/soft/error, `@custom-variant dark` + overrides `.dark`, `@layer base`). Os 10
`.module.css` foram removidos; todos os componentes e páginas usam utilities. As classes globais legadas
(`container`, `button`, `buttonSecondary`, `buttonGhost`, `field`, `error`, `muted`, `eyebrow`, `srOnly`,
`skipLink`) permanecem em `global.css` até migração própria.

Motivo: padronizar tokens (incluindo dark), responsivo e acessibilidade num só sistema, eliminando
duplicação entre módulos e hex hardcoded do admin.

Não fazer:

- Não reintroduzir `.module.css` nem hex fora do `@theme` (use `bg-navy`, `text-gold`, `border-line`, etc.).
- Não usar `dark:` sem conferir contraste (dourado só em filetes/marcas/focos sobre branco).
- Não quebrar o SSR: componentes de rota pública seguem sem `window`/`document` no render; asserts de
  SSR devem casar `<h1[^>]*>` (h1 agora carrega classes).

## 2026-09-13 — Avatar do usuário e alternador de tema (opencode)

Decisão: o bloco do usuário no painel exibe o `avatarUrl` do `Agent` (foto HTTPS cadastrada em
Corretores, com inicial como fallback e troca silenciosa se a URL quebrar). No desktop o conjunto
avatar + nome + papel + "Sair da conta" fica no rodapé do `aside`; no mobile a foto fica no topo e
abre um dropdown (`aria-haspopup="menu"`, fecha em Escape/clique fora) com nome, papel e
"Sair da conta". O modo noturno, antes só preparado no CSS, ganha alternador visível no cabeçalho
público e no painel (topo no mobile, rodapé no desktop), via `useTheme`: persiste em
`localStorage "theme"`, respeita `prefers-color-scheme` sem escolha salva e aplica `.dark` no
`documentElement`; script inline no `index.html` evita flash. Rotas públicas seguem sem `window`
no render (o hook só toca o DOM em efeito).

Motivo: pedido do dono — avatar não aparecia e o modo noturno não tinha onde ser ligado.

Não fazer:

- Não buscar a foto de outro lugar: a fonte é `Agent.avatarUrl`, a mesma do detalhe do imóvel.
- Não exibir mensagem de erro por URL de foto quebrada: cair para a inicial.
- Não guardar outro estado de tema além de `localStorage "theme"` + `.dark` no `documentElement`.

## 2026-09-13 — Upload pula arquivo ilegível sem derrubar o lote (opencode)

Decisão: `prepareMediaFiles` relata arquivos ilegíveis via callback `onError` e retorna só os válidos (em ordem, com progresso contando todos); o `MediaManager` envia os válidos, avisa os nomes pulados e só bloqueia o envio quando nada é legível.

Motivo: o `createImageBitmap` rejeita com "The source image could not be decoded." para arquivo corrompido ou com extensão trocada, e o erro cru em inglês abria o lote inteiro.

Não fazer:

- Não reintroduzir falha total do lote por um arquivo ruim.
- Não exibir a mensagem original em inglês: o texto ao usuário cita o nome do arquivo em português.

## 2026-09-13 — Perfil em /admin/perfil via avatar (opencode)

Decisão: a foto do AdminLayout leva a /admin/perfil (link no desktop, item "Meu perfil" no dropdown do
mobile, dropdown preservado). A página mostra foto grande (96px, fallback da inicial, troca silenciosa se a
URL quebrar), dados (e-mail em leitura), métricas do próprio usuário, edição própria e troca de senha.
Rota registrada em `routes.profile` e no regex do `normalizedUrl`; painel segue
`noindex` e fora do SSR.

Motivo: pedido do dono — clicar na foto e ver foto maior + métricas.

Não fazer:

- Não indexar o perfil nem incluí-lo no sitemap: é /admin/*, fora do SSR.
- Não exibir mensagem de erro por URL de foto quebrada: cair para a inicial, como no side.

## 2026-09-13 — Métricas do perfil sem endpoint novo (opencode)

Decisão: as métricas usam os endpoints existentes (GET /admin/properties com o status? novo e
GET /admin/leads com createdFrom), 7 consultas limit=1 em paralelo. O escopo por usuário já vem da API
(ADMIN vê tudo, AGENT vê só o próprio), sem filtro no front.

Motivo: evita endpoint de stats e segue a regra de ouro (caber no padrão existente).

Não fazer:

- Não filtrar por gentId no front: a API já restringe pelo viewer; filtro duplo mascara bug de permissão.
- Não criar GET /admin/stats sem necessidade comprovada de desempenho.

## 2026-09-13 — E-mail só via Corretores/ADMIN (opencode)

Decisão: o perfil exibe o e-mail como leitura ("só o admin altera"); a troca é exclusiva da página Corretores
(ADMIN) via PATCH /agents/:id, que já trata o 409 de e-mail duplicado.

Motivo: e-mail é identidade de login com unicidade no banco; edição própria exigiria verificação de posse
do endereço novo, fora do escopo.

Não fazer:

- Não incluir email no PATCH /auth/me: o pipe da API devolve 400 e o front nem oferece o campo.

## 2026-09-14 — Hamburger sem buttonGhost no desktop (opencode)

Decisão: o botão do menu público não usa `buttonGhost`; usa só utilities (`hidden` + `max-[650px]:inline-flex` com estilo fantasma equivalente).

Motivo: o `.buttonGhost` do `global.css` (carregado depois do Tailwind) tem a mesma especificidade do `hidden` e vencia no desktop, exibindo o hamburger junto da navegação.

Não fazer:

- Não combinar `buttonGhost` com `hidden` em elemento que deve sumir no desktop.

## 2026-09-14 — Modelo integral português e corte coordenado (Codex)

Pedido integral de 13/09/2026 e escolha de Drive compartilhado pelo dono substituem o MVP anterior. Referência normativa: docs/specs/2026-09-13-backend-integral.md; execução e contrato: docs/handoffs/2026-09-14-backend-portugues.md.

- Domínio ativo em português, DTOs/colunas snake_case, auditoria universal; classificação dinâmica e tags relacionais. NestJS/TypeORM/class-validator permanecem, sem dependência nova.
- Exclusão lógica com ativo (inclui associações e finanças). Exceções técnicas: mídia excluída no R2/banco; refresh consumido/expurgado. Não apagar histórico de contratos nem simular consentimento em cadastro manual.
- Dados pessoais em colunas reais pesquisáveis. Cifra antiga é lida exclusivamente pela migração; conservar chave original até verificar os dados e o backup. Não usar criptografia de coluna no runtime novo.
- Contratos por ADMIN/intermediador, sem trava de finalidade. Partes são alteradas por ADMIN; corretor lê apenas as vinculadas aos próprios contratos. Receita é comissão de venda/locação informada manualmente, com até 600 parcelas; não presumir valor de um aluguel, repasse mensal, integração bancária ou comissão de corretor.
- Drive via Service Account em Drive compartilhado privado (escolha expressa do dono). Quatro GOOGLE_DRIVE_* juntas; OAuth/HTTP nativos, IDs reservados e retentativa sem duplicação. Falha externa preserva contrato com estado explícito. Sem credenciais reais, marcar homologação Workspace pendente.
- Migration nova preserva tabelas antigas em legado_20260913 e aborta se faltarem CPF/complementos reais. Clientes manuais explícitos suportam comissões antigas sem leads. Nenhum documento histórico do R2 é removido. Alterações aplicadas são imutáveis; não executar migration direto em produção sem backup/restauração validados e corte coordenado.
- Comandos de migration agora usam executor com logs sanitizados e MIGRACAO_BACKUP_ARQUIVO para escrita. Não imprimir QueryFailedError, SQL com parâmetros ou detalhes de linhas decifradas.
- Cookie Secure/Strict/HttpOnly em todos ambientes; desenvolvimento de navegador exige HTTPS. API nova é incompatível com o contrato frontend antigo: adaptar cliente, SSR e painel antes do deploy conjunto. Ajustar health check Render para /api/v1/saude nesse corte.
- Homologação usa database vazia homologacao_pt na branch Neon br-ancient-sound-a5tsf5rf, PostgreSQL 16.15; testes transacionais são revertidos. Banco/API publicados permanecem intactos. Manter branch de homologação identificada até o dono definir retenção.


## 2026-09-14 — Cascata e contraste dos controles
Estilos legados ficam em @layer components para que utilities explícitas prevaleçam. Container próprio permanece fora da camada para preservar margens frente ao container nativo do Tailwind. Navy permanece cor de superfície; texto adaptável usa brand. Botões primários usam tokens action/on-action: navy/branco no claro, dourado/navy no escuro. Não reutilizar navy fixo como texto em superfícies que escurecem, nem deixar eyebrow escuro sobre fotos/navy.


## 2026-09-14 — Tema junto à navegação pública
PublicLayout agrupa navegação e controles à direita em ordem DOM: links, tema, menu. Distância de 16px após navegação e 8px entre controles. Marca e espaçamento compactados até 900px para caber em tablets; menu preserva breakpoint de 650px. Não duplicar alternador nem alterar persistência do tema.

## 2026-09-14 — Playwright Test para ponta a ponta, Vitest preservado (Codex)

Decisão: `@playwright/test` **1.60.0 exato** em devDependencies (`tests/e2e/`, `playwright.config.ts`),
com projetos `chromium-desktop` (1280px) e `chromium-mobile` (390px, Pixel 7).
Vitest exclui `tests/e2e/**`; relatórios e `test-results/` estão no `.gitignore`.

Motivo: cobrir o que o Vitest não alcança — navegador + SSR + proxy `/api` + sessão
+ persistência juntos. Seletores por papel/nome acessível, esperas automáticas,
trace/screenshot/vídeo só em falha, dados sintéticos `e2e-*` com limpeza via API.

Não fazer:

- Não permitir `^1.60.0`: versões novas baixam Chromium inexistente nesta máquina
  (CDN bloqueado); o 1.60.0 reaproveita o Chromium 1223 já instalado.
- Não enfraquecer o cookie `Secure` nem apontar teste a produção: sem HTTPS local
  a sessão pós-reload cai para o login — o teste confirma esse comportamento real.
- Não declarar R2/Drive validados com mocks: falha do Drive é `FALHOU` explícito;
  homologação no Workspace é etapa externa separada.

## 2026-09-15 — Trava anti-produção e stack de teste declarado (Codex)

Revisão do dono mostrou que o `.env` local aponta `API_ORIGIN` à API de produção
e o banco local é o principal: leituras do E2E caíram em produção. Regra nova:

- `E2E_BASE_URL` fora de localhost aborta a suíte no carregamento do config (vale
  para todos os testes); remoto só com o domínio em `E2E_DOMINIOS_PERMITIDOS`.
  Bypass genérico (`E2E_ALLOW_REMOTE`/`E2E_ALLOW_EXTERNAL`) foi removido: alguém
  poderia liberar produção manualmente.
- Teste com backend exige `E2E_STACK=teste`, declarado só após subir API local
  com o banco de teste (via `DATABASE_URL` de homologação, sem editar `.env`)
  e SSR com `API_ORIGIN=http://localhost:3000`. Sem isso, pula — nunca executa.
- Limpeza completa via API com status verificado (contrato → comissão → imóvel →
  partes → cliente, soft-delete FK-safe); falha na limpeza falha o teste.
- `NODE_TLS_REJECT_UNAUTHORIZED=0` só no processo de teste (cert autoassinado);
  nunca no app.

Não fazer:

- Não rodar E2E com backend sem `E2E_STACK=teste`, mesmo para "só leitura".
- Não imprimir `DATABASE_URL` em log/comando: host e banco se conferem sem a
  credencial (verificação com URL mascarada).

## 2026-09-15 — Página pública /devs (Muse Spark)

Decisão: `/devs` é página pública estática (como `/privacidade`): sem fetch de API,
sem `window`/`document` no render, com título/descrição/canonical próprios,
`index,follow` quando `SEO_INDEXABLE=true` e entrada em `sitemap.xml` + `llms.txt`.
Dados em `src/config/devs.ts` (nome, usuário, perfil e avatar). Fotos via hotlink
dos avatares do GitHub informados pelo dono, com fallback para a inicial se a URL
quebrar. Links do Instagram abrem em nova aba (`target=_blank`, `rel="me noopener
noreferrer"`). Link público só no rodapé, fora do menu principal.

Motivo: pedido do dono com as duas fotos, nomes e @s (Eduardo Gobatto @e.gobatto,
Fernando Riad @_riad777, ambos "Front-end e back-end").

Não fazer:

- Não buscar `/devs` na API nem colocar a página no catálogo.
- Não exibir mensagem de erro por avatar quebrado: cair para a inicial.
- Não indexar fora da regra geral nem listar no sitemap quando `SEO_INDEXABLE=false`.

## 2026-09-15 — Header público fixo com CSS (Muse Spark)

Decisão: header do site público (`PublicLayout`) com `sticky top-0 z-40`, sempre
visível, só com classes Tailwind, sem JS e sem `window` no render (SSR preservado).
`bg-paper` opaco mantém o conteúdo passando por baixo sem vazar. Menu mobile
(`absolute top-[84px]`, backdrop `z-[4]`, sheet `z-[5]`) e CTA sticky do detalhe
(`z-[5]`) passam sob o header. Painel admin inalterado, por escolha do dono.

Não fazer:

- Não usar `fixed` (tira o header do fluxo e exige compensar altura no `main`).
- Não controlar visibilidade com scroll em JS nesta etapa: o pedido é "nunca sumir".

## 2026-09-15 — Refinos do /devs e do header mobile (Muse Spark)

- Avatares do `/devs` vendored em `public/assets/dev-*.jpg` (cópia dos avatares
  GitHub informados pelo dono), referenciados como `/assets/...` em `devs.ts`.
  Motivo: hotlink quebra sem aviso, vaza `Referer` e depende de terceiro; local
  sai no bundle do build e responde 200 pelo próprio domínio.
- Links GitHub (`githubUrl` em `devs.ts`) ao lado do Instagram em cada card, com
  `rel="me noopener noreferrer"` e `target=_blank`. Logins conferidos na API do
  GitHub: `Edu4rdo-Gobatto` e `SHURIKA6`.
- `h1` do `/devs` com `text-[clamp(32px,8vw,44px)]`: 44px no desktop, 32px em
  320px. O `44px` fixo anterior estourava a largura mínima.
- Backdrop do menu mobile (`z-[4]`) não cobre mais logo e controles do header:
  ambos com `relative z-[6]`, acima do backdrop e do sheet (`z-[5]`). Antes, com
  o menu aberto o alternador de tema era bloqueado (o clique caía no backdrop e
  só fechava o menu).
- `.container` é estilo sem camada (`global.css`); utility `max-w-[800px]` em
  camada perde para ele, então `container max-w-[800px]` nunca limitou a 800px.
  No `/devs`, `container` fica no `article` e a medida vai num `div` interno
  (`mx-auto max-w-[800px]`). O `/privacidade` tem o mesmo padrão morto e fica
  como pendência, fora deste escopo.

Não fazer:

- Não voltar a hotlink externo em página pública sem motivo e sem fallback.
- Não combinar `container` com `max-w-*` no mesmo elemento esperando limite.

## 2026-09-15 — Erro de sessão com mensagem conforme a causa (Muse Spark)
Causa raiz do `POST /api/autenticacao/renovar 403` no preview: o `.env` local
aponta `API_ORIGIN` à API de produção, cujo `ALLOWED_ORIGINS` não lista a
origem do preview — a API responde `{"message":"Origem não autorizada."}` via
`OrigemGuard` (comprovado por reprodução via proxy), antes de qualquer lógica
de sessão. O front tratava todo 401/403 do renovar como "sessão expirou", o
que era falso neste caso e derrubava o usuário ao login sem explicação.

Decisão: `refreshAccess` (`http.ts`) mantém a limpeza (token + `session-expired`),
mas quando o corpo é `Origem não autorizada.` a mensagem passa a ser "Esta origem
não é autorizada pelo serviço. Confira o endereço da API e entre novamente."
O 403 em si é comportamento correto da API e não há o que "corrigir" no proxy:
remover o `Origin` no repasse contornaria a proteção CSRF do guard.

Não fazer:

- Não remover nem reescrever `Origin`/`Sec-Fetch-Site` no proxy `/api`.
- Não adicionar origem `localhost`/`127.0.0.1` ao `ALLOWED_ORIGINS` de produção
  para "fazer o preview funcionar": sessão de produção a partir de máquina local.
- Não comparar a mensagem do guard por substring genérica: igualdade exata com
  o contrato atual da API irmã.

## 2026-09-15 — Tema com primeiro render igual ao SSR (Muse Spark)

Causa raiz do `Hydration failed` (`Expected server HTML to contain a matching
<circle> in <svg>` no `PublicLayout`): o SSR renderiza o tema `light` (ícone
`Moon`, sem `<circle>`), mas o `useState(() => initialTheme())` lia
`localStorage`/`prefers-color-scheme` já no primeiro render do cliente e
pintava `Sun` (com `<circle>`) quando o usuário tinha `dark` salvo — o
`aria-label` do botão divergia junto. O React descartava todo o HTML do SSR.

Decisão: o estado inicial do `useTheme` é sempre `light`, idêntico ao servidor;
a preferência salva é resolvida e aplicada num único efeito de mount, que nunca
remove a classe `.dark` que o script anti-flash do `index.html` já aplicou.
Leitura de `localStorage`/`matchMedia` e toque no DOM só em efeito, como já
exigia a decisão de SSR próprio. Persistência (`localStorage "theme"` + `.dark`)
e script anti-flash inalterados.

Não fazer:

- Não ler `localStorage`, `matchMedia` ou qualquer estado do navegador no
  `useState` inicial (ou no corpo do render) de componente de rota pública.
- Não "corrigir" com `suppressHydrationWarning` no botão de tema: mascara a
  divergência e mantém o descarte do SSR.
- Não separar em dois efeitos (sincroniza + aplica por `[theme]`): o aplica do
  mount rodaria com `light` e apagaria o `.dark` do script anti-flash,
  causando flash claro.
## 2026-09-15 — Folhas de estilo declaradas no HTML

Decisão: carregar `src/styles/tailwind.css` e `src/styles/global.css` por links
no `index.html`, removendo os imports equivalentes de `src/main.tsx`.

Motivo: o SSR entregava o conteúdo correto, mas o navegador pintava o HTML sem
estilos até baixar e executar o bundle React que injetava o CSS. O Vite processa
os links no desenvolvimento e os transforma em assets versionados no build.

Não fazer:

- Não voltar a carregar o CSS exclusivamente por imports JavaScript no entrypoint.

## 2026-09-15 — Sessão e tema durante efeitos duplicados

Decisão: uma resposta exata `Origem não autorizada.` limpa o token e retorna a
mensagem específica, mas não emite o evento `session-expired`; esse evento fica
reservado para expiração/rejeição real da sessão. O hook de tema preserva a
preferência já resolvida quando o React StrictMode repete o efeito de montagem.

Motivo: uma origem rejeitada não significa que a sessão expirou, e o replay do
StrictMode não deve causar flash de tema claro nem logout visual indevido.
## 2026-09-15 — SEO comercial e isolamento local

`/devs` continua público para acesso discreto pelo rodapé, mas é sempre `noindex,follow` e não entra em `sitemap.xml`
nem `llms.txt`, pois créditos técnicos não fazem parte do SEO white-label comercial. Os servidores `dev` e `preview`
recusam `API_ORIGIN` remoto por padrão e aceitam somente localhost/loopback; isso evita que desenvolvimento altere dados
de produção. Não criar bypass remoto genérico. O cold start (UX-001) foi adiado pelo proprietário.

Não remover SSR, proxy `/api`, autenticação ou o contrato da API. A limpeza de `.buttonGhost` fica separada porque o
painel ainda possui consumidores ativos.
## 2026-09-16 — Chips com estados mutuamente exclusivos + ScrollToTop fora do catálogo (Muse Spark)

- Nunca empilhar utilities conflitantes de cor no mesmo elemento (`bg-transparent` com
  `bg-navy`, `text-muted` com `text-white`, `border-line` com `border-navy`): no Tailwind
  vence a ordem do CSS gerado, não a do atributo `class`, e o chip selecionado saiu
  branco sobre branco (texto invisível). Base de layout (`chipBase`) sem cor; `chipIdle`
  e `chipSelected` como alternativas exclusivas — mesmo padrão dos fixes do menu mobile
  e do hambúrguer.
- `ScrollToTop` (`App.tsx`) pula o `scrollTo(0,0)` quando origem e destino são ambos
  rotas do catálogo (`catalogPaths`): filtro de tipo/finalidade troca o pathname e não
  deve jogar ao topo; o usuário fica onde está, a pedido do dono. Saídas do catálogo
  (detalhe, privacidade, admin) mantêm o reset ao topo. Paginação do catálogo rola até
  `#catalogo` (respeita `prefers-reduced-motion`), nunca ao topo da página.

Não fazer:

- Não concatenar `${chipBase} ${selected ? chipSelected : ''}` deixando cor base + cor
  de estado ativas juntas.
- Não voltar o `ScrollToTop` a observar só `pathname` sem exceção do catálogo.
- Não usar `window`/`document` fora de efeito ou handler em rota pública (SSR).

## 2026-09-15 — Headers defensivos sem alteração de dados

O SSR e o proxy devem enviar headers básicos de hardening em todas as respostas.
Escolha: `nosniff`, `DENY`, `strict-origin-when-cross-origin` e bloqueio de
periféricos via `Permissions-Policy`, sem CSP nesta etapa para não quebrar os
scripts inline existentes. Não alterar CORS ou dados do catálogo neste corte.

## 2026-09-16 — Fechamento dos achados de proxy web

Headers de segurança são aplicados depois dos headers recebidos da API no proxy Node,
para impedir que o upstream enfraqueça `X-Frame-Options`, `Referrer-Policy` ou
`Permissions-Policy`. A mesma política foi adicionada aos rewrites externos da Vercel
e às respostas de erro do proxy. Em produção, `API_ORIGIN` configurado exige HTTPS;
HTTP continua válido apenas para desenvolvimento/local.

Não fazer: apagar dados de teste a partir de relatório externo, alterar CORS da API ou
tratar achados exclusivos do backend como correção do front.

## 2026-09-16 — Validar slug antes da consulta pública

Escolha: reutilizar no front a regra de slug público da API (`[a-z0-9-]{1,240}`) no SSR e
na chamada SPA. URLs de imóvel são reconhecidas estruturalmente pelo roteador, então um
segmento malformado chegava à API, recebia 400 e era convertido em 503 pelo SSR. A validação
local transforma esse caso em 404 e evita tráfego desnecessário, sem alterar slugs válidos.

Não fazer: aceitar caracteres arbitrários no slug, encaminhar payloads de teste à API ou
alterar a validação/contrato de dados no backend.
## 2026-09-16 — Melhorias incrementais sem endpoint de estatísticas

KPIs do Dashboard reutilizam listagens existentes de imóveis, clientes, contratos e comissões; nenhum `/stats`
foi criado. A ordenação pública foi adiada para preservar o contrato atual e evitar ordenar somente a página.
O CSV é exportado com os registros carregados e os filtros aplicados. Nenhuma dependência nova foi adicionada.


## 2026-09-16 — Fechamento das decisões do pacote público/painel

- Somar comissões em centavos com BigInt, percorrendo todas as páginas autorizadas; métricas falham e repetem independentemente.
- CSV exporta somente a página aplicada, identificado no botão, com neutralização de fórmulas/controles e URL liberada após o download.
- Datas de contatos incluem o dia final no fuso America/Cuiaba. Origem é informativa: o DTO de consulta não a aceita.
- O IPTU não tem periodicidade no contrato atual; mostrar soma dos valores informados e condição parcial, sem anunciar mensalidade fechada.
- Mapa externo carrega mediante clique; OG só anuncia dimensões do asset local conhecido. Não inferir medidas das fotos R2.
- Duplicação não copia mídia, identidade nem histórico; dono/ADMIN revisa e cria pelo POST existente. Rascunho novo só é sobrescrito após confirmação.
- Adotar data router no navegador para useBlocker (inclui Voltar/Avançar); instância lazy única evita listeners duplicados em StrictMode. SSR continua usando AppRoutes/StaticRouter.
- Informações públicas de identidade, privacidade e contato permanecem centralizadas em `src/config/brand.ts`; dados recebidos do proprietário foram aplicados sem variáveis secretas. Logo oficial recortado fica em `public/assets/brand-logo.png`.
- Não usar Render/env para esses campos nesta etapa: são conteúdo público versionado, e mover para runtime exigiria expor configuração também ao cliente/SSR.
Nenhuma dependência nova.

## 2026-09-16 — Contrato v2 no front: ids inteiros, pessoas, ficha do imóvel e vocabulário em português (Claude)

Decisões do dono em 16/09 (`docs/specs/2026-09-16-ids-inteiros-pessoas.md`), aplicadas no front:

- **Domínio em português, sem tradutor.** `src/tipos` reproduz o contrato HTTP (`titulo`, `valor_venda`, `status_contato`...);
  `portuguese.ts` e os tipos ingleses foram removidos. Pastas, arquivos, componentes e hooks em português. Ids são `number`.
- **Mídia junto com a criação.** O formulário de imóvel novo guarda arquivos e links de vídeo (`SelecaoMidia`); ao salvar,
  faz o POST do imóvel e em seguida envia as mídias. Falha de mídia não perde o imóvel: a edição abre com o aviso.
- **Contatos em três colunas** (Pendentes, Respondidos, Finalizados) sobre `status_contato` de `pessoas`; cada coluna tem
  paginação e CSV próprios. Filtros só se aplicam ao enviar; datas cobrem o dia inteiro em `America/Cuiaba`.
- **Cadastro único de pessoas** (`/admin/pessoas` e ficha com imóveis, contratos e comissões). As páginas de proprietários e
  inquilinos deixaram de existir; contratos e comissões escolhem pessoas pelo `SeletorRegistro` (busca com sugestões), que
  substitui os seletores paginados em todo o painel.
- **Ficha do imóvel**: dois valores (`valor_venda`, `valor_locacao`; nenhum = "Sob consulta" no site), `destaque`, proprietário,
  exclusividade e validade, captação, chaves, matrícula, inscrição, observações internas e motivo da baixa (só para
  vendido, alugado ou retirado). Situações `VENDIDO | ALUGADO | RETIRADO` no lugar de `CONCLUIDO`.
- **Catálogo**: bairro, área mínima/máxima e ordenação (`?bairro=`, `?area-minima=`, `?area-maxima=`, `?ordenar=`), além dos
  filtros existentes. URLs antigas em inglês continuam redirecionando. Slug público termina no id: link antigo abre pelo
  id e o SSR responde 301 para o slug atual; na SPA, `Navigate` faz a troca.
- **Componentes compartilhados do painel**: `CabecalhoPagina`, `Tabela`, `Etiqueta` e `estilosPainel` substituem as classes
  repetidas em cinco páginas.
- **Rotas do painel**: `/admin/pessoas`, `/admin/pessoas/:id`; `/admin/clientes`, `/admin/proprietarios` e `/admin/inquilinos`
  redirecionam para `/admin/pessoas`.

Não fazer: criar um segundo vocabulário (inglês) para o domínio; voltar aos seletores paginados; enviar UUID ou tratar id
como texto; expor no site os campos internos da ficha; salvar imóvel novo sem enviar as mídias escolhidas.
## 2026-09-17 — Escape contextual obrigatório no JSON-LD SSR

O JSON-LD renderizado pelo SSR deve ser produzido exclusivamente por `serialize()` antes de ser inserido em uma tag `<script>`. A serialização substitui `<`, `>`, `&`, U+2028 e U+2029 por escapes Unicode, preservando o texto original após `JSON.parse()` e impedindo que dados de imóveis encerrem prematuramente a tag.

Não usar `JSON.stringify()` diretamente no HTML, remoção de tags por regex ou sanitização destrutiva de títulos e descrições. Esses campos são texto; consumidores que os exibirem na interface devem usar `textContent`, ou uma biblioteca de sanitização somente se HTML for um requisito explícito.

## 2026-09-18 — UI, velocidade e telas divididas: Etapa 0 e Fase 1 (Claude)

Plano aprovado pelo dono em 17/09 (resumo em `TASKS.md`). Escopo só front; API e infraestrutura viraram tarefas.

- **Build sempre em produção.** `scripts/build.mjs` fixa `process.env.NODE_ENV = 'production'`. Com `NODE_ENV=development`
  no `.env` local, o Vite adotava o valor do arquivo e o bundle saía com o React de desenvolvimento (700 kB em vez de
  447 kB), distorcendo preview, smoke e medições. O build remoto da Vercel não lia o `.env` e não foi afetado.
  Não fazer: depender do `NODE_ENV` do ambiente ou do `.env` para decidir o modo do build.
- **Modal sempre com `m-auto`.** O reset do Tailwind v4 zera a margem que o navegador usa para centralizar `<dialog>`;
  sem ela todo modal colava no canto superior esquerdo (a "tela dividida" relatada pelo dono). `Dialogo` ganhou
  `tamanho` (480/640/880px), corpo rolável que é container das grades, fundo navy (`--color-sobreposicao`) e rodapé de
  ações fixo (`estilos.rodapeDialogo`). A trava de rolagem compensa a largura da barra com `padding-right` no `body`.
  Não fazer: `<dialog>` sem o componente `Dialogo`; `scrollbar-gutter: stable` (deixava uma tira clara ao lado do
  fundo escuro do modal); grade de formulário por breakpoint da janela dentro de modal.
- **Grades do painel por container query.** `estilos.painel`/`estilos.formulario` são `@container` e `estilos.grade` só
  vira 2 colunas com 38rem de container; o `main` do painel é `@container/principal` e as grades de 3 colunas
  (Contatos, ficha de pessoa, indicadores) seguem a largura dele. O shell usa `grid-rows-[auto_1fr]` abaixo de 1024px.
  Não fazer: `md:`/`lg:grid-cols-*` ou `md:col-span-*` em grade interna do painel; campo sozinho sem `col-span-full`.
- **Paleta mais confortável (pedido do dono em 18/09).** Claro: fundo `#ebf1f9` (azul bem claro), superfícies `#f8fafd`,
  linhas `#d3ddea`, fundo suave `#e2eaf5`. Escuro: fundo `#182d50` e superfícies `#1f3761` (antes `#071733`), texto
  secundário `#b3bdd0`, erro `#f0a09b`, borda de campo `#8a9bb7`. Contraste medido: texto 9,8–15:1, secundário
  5,2–7,3:1, borda de campo ≥3:1. Bordas de campo usam `--color-control-line` (a cor fixa antiga tinha 1,9:1). Revisa o
  "branco" da paleta de 13/09 como cor de fundo. Não fazer: voltar ao branco puro como fundo de página; cor literal fora
  do `@theme`.
- **Logo por tema.** A arte oficial (`brand-logo.png`, 697 KB) tem texto branco e sumia no cabeçalho claro. O cabeçalho usa
  variantes WebP de 7–35 KB geradas por `node scripts/gerar-logo.mjs` (Chrome do sistema, sem dependência nova): texto
  navy no tema claro e cores originais no escuro, trocadas só por CSS (SSR igual nos dois temas). Não fazer: exibir o
  PNG original; `mix-blend` para "consertar" contraste do logo.
- **Formulário de imóvel usa lookups públicos.** As rotas `/admin/tipos-imovel|finalidades-imovel|caracteristicas` são
  exclusivas do ADMIN e davam 403 ao CORRETOR. O formulário carrega `api.classificacoes()` (público, só ativos) junto
  com a ficha e inclui como "(inativo)" os valores atuais da ficha (`comClassificacoesDaFicha`). "Cadastros" só aparece
  e só carrega para ADMIN. Não fazer: pedir lookups `/admin/...` fora da tela Cadastros.
- **Sessão (paliativo até a Fase 4).** A restauração guarda `Promise<Corretor>`; falha, expiração e saída zeram, e
  entrar/atualizar gravam o corretor válido. Voltar do site ao painel não pede login outra vez. Registrado para a Fase 4:
  `api.renovar()` ainda é um caminho de renovação separado da promessa compartilhada do `http.ts`; unificar antes de
  paralelizar a carga do painel. Não fazer: paralelizar a restauração com outras chamadas antes dessa unificação.
- **Suíte visual com API simulada só em teste.** `tests/visual/` + `playwright.visual.config.ts` (`npm run visual`): build
  de produção servido pelo `seo-smoke --serve`, API do painel simulada no navegador (`page.route`, rota não prevista
  falha), Chrome do sistema (`channel: 'chrome'`, os navegadores do Playwright não estão instalados e o download é
  bloqueado). Verifica modal centralizado, rolagem horizontal, barra do painel e o orçamento de requisições de
  `tests/visual/orcamento.ts`, que começa na linha de base de 18/09 e só desce. Subagentes `revisor-design` e
  `auditor-desempenho` em `.claude/agents/` usam essa suíte. Não fazer: fixture de dados no código do produto; apontar a
  suíte para API real; subir limite do orçamento sem justificativa no `CHANGELOG_AI.md`.
# 2026-10-03 — Desenvolvimento SSR acessível pela rede local

`scripts/dev.mjs` usa `HOST` quando informado e `0.0.0.0` como padrão, porque a conferência em celular precisa aceitar conexões além do loopback. O endereço público continua sendo informado pelo IP local do computador; `localhost` permanece válido apenas no próprio computador.

Não fazer: expor o servidor de desenvolvimento na internet ou usar isso como configuração de produção.

# 2026-10-06 — Ícones Material Symbols inline

Por pedido do dono, painel e site público usam ícones Material Symbols (Google), estilo Outlined preenchido (FILL 1,
peso 400), em `src/componentes/Icones.tsx`. Os desenhos foram copiados de
`github.com/google/material-design-icons/tree/master/symbols/web` (Apache License 2.0) e ficam inline como SVG
(`fill="currentColor"`, prop `size` igual à do lucide), sem fonte externa nem pacote novo. `lucide-react` continua
só para os logos GitHub/Instagram de `Devs.tsx`, porque o Material não tem marcas.

Não fazer: carregar a fonte Material Symbols do Google Fonts (requisição externa e arquivo grande); misturar ícones de
contorno do lucide com os preenchidos; adicionar ícone novo sem baixar o SVG oficial do mesmo estilo.

## 2026-10-05 — Refinamento da Área do Corretor

- Navegação desktop em trilho de ícones, nomes em tooltip acessível; menu mobile conserva ícone e nome. Seções por espaçamento/divisórias substituem caixas decorativas. Identidade azul/dourado e fontes existentes preservadas; sem dependências novas.
- Tooltip central na camada superior nativa popover, tanto por foco quanto mouse, com limites da janela e reposicionamento ao rolar/redimensionar. Esc consome apenas o tooltip antes das demais ações. AcaoIcone mantém comportamento público anterior fora do painel.
- Dois Esc para descartar mudanças no modal, pedido explícito do dono: primeiro avisa, segundo descarta somente pendências; sem timeout. Tecla diferente, edição e clique desarmam. Sem alterações, um Esc fecha após eventuais tooltip/seleção. Fechar com botão/clique externo usa confirmação explícita. Ocupado não fecha; nada já persistido é revertido.
- Detecção por isDirty/defaultValues e shouldDirty nas seleções, incluindo restauração ao valor original. Modal superior é a única sobreposição fechada e a pilha mantém trava de rolagem/foco. Guarda de edição permanece no imóvel e cobre perfil/senha na página.
- Menu de comandos pesquisa destinos e ações permitidos. / e ? ignoram digitação; Ctrl/Command+Enter só envia formulário marcado da área ativa. Pagamentos e criação financeira exigem botão. Enter do atalho é consumido mesmo em confirmação sem formulário seguro.
- EntradaNumero aceita inteiros ou decimais até duas casas, vírgula/ponto, colagem PT-BR, sem símbolos/letras/sinal/exponente; unidades ficam fora. Schemas e payloads atuais continuam validando limites e formatos. Características e números de endereço continuam texto livre conforme o domínio.
- Consulta de imóvel e corretor em modal reutiliza serviços e dados atuais. Perfil só expõe informações administrativas já disponíveis e autorizadas; edição permanece separada. Linhas de contratos navegam pelo fundo, controles internos não disparam a linha e links reais preservam navegação nativa.
- Não fazer: mudar API/banco, introduzir endpoint de perfil, gravar fixture no produto, recriar suítes fonte, commit/push/deploy sem novo pedido.

## 2026-10-06 — Clareza, conforto e elegância no painel

A simplificação anterior retirou identificação e reduziu a legibilidade. Por pedido do dono, restauramos nomes na navegação, textos maiores e destaque das ações, mantendo simplicidade por espaçamento e hierarquia. Sidebar 260px; tipografia 18/16/20px; contatos em blocos com fundo discreto.

A cor de ação do painel é #b3892d, hover #b18424: desenho branco, texto azul #0a2042. Contrastes calculados da cor base: branco 3,21:1 para desenho e azul 5,03:1 para texto; hover 3,39:1 / 4,77:1. Vermelho das ações destrutivas permanece separado. Tokens e componentes compartilhados, sem alterações globais ao site público ou novas dependências.

CabecalhoPagina aproxima a ação do título, com descrição na linha seguinte. Responder contatos ganha ícone/texto e espaçamento da divisória. AcaoIcone mantém texto opcional sem alterar controles públicos. Tabela é usada somente no painel; limiar 52rem evita colunas comprimidas com fontes maiores. Funcionalidade e contratos atuais da API preservados.

## 2026-10-06 — Refatoração da Área do Corretor revertida pelo dono

Pedido explícito: “reverta tudo, e me dê um plano e um resumo do que foi pedido”. Revertidas integralmente as duas etapas desta conversa: mudanças visuais, sidebar, fontes, botões/inputs, tooltips centralizados, entradas numéricas, fichas em modal, contratos clicáveis, atalhos e fechamento com dois Esc. Arquivos fonte rastreados restaurados ao estado anterior da refatoração; cinco componentes/hooks novos retirados do código ativo. API, banco, dependências e trabalho anterior preservados. Nenhum commit, push ou deploy.

Os registros de implementação/validação de 05 e 06/10 acima são históricos e NÃO descrevem o produto atual. As orientações específicas dessa refatoração ficam canceladas como instruções de implementação vigente. O novo documento PLANO-AREA-CORRETOR.md contém apenas o pedido consolidado e a proposta de execução futura; não autoriza reimplementar. Preservar o restante das orientações do repositório. Backup local ignorado em artifacts/reversao-area-corretor-2026-10-06.

## 2026-10-09 — Codex: contorno de foco após Esc

Implementado o plano autorizado: `data-foco-navegacao` no main do painel e no h1 de Desenvolvedores; `[data-foco-navegacao]:focus { outline: none; }` em global.css. Preservados tabIndex, foco programático, Pular para o conteúdo, retorno do foco e regras de Esc. A marcação é exclusiva de destinos não interativos; não aplicar a todos os elementos com tabindex=-1 nem remover o foco visível de controles.

Validação: typecheck, lint, build e testes existentes aprovados (3 arquivos, 23 testes). QA efêmero Chrome com API simulada: 19 verificações aprovadas, incluindo reprodução da borda de 3px com a nova regra removida via CSSOM, Visão geral/Imóveis/Contratos/Devs nos dois temas, Tab em link/botão/input, filtro, menu mobile, diálogo intacto com retorno do foco e diálogo alterado com dois Esc. Capturas e resultados ignorados em artifacts/esc-foco-2026-10-09. Sem erros JavaScript nos cenários concluídos. Primeiro QA usou rótulo inexistente Abrir menu; corrigido para Menu. Reinícios do navegador foram necessários antes da rodada final completa.

O smoke original scripts/seo-smoke.mjs falhou na expectativa antiga do h1 Imóveis comerciais; a tela atual usa Imóveis para alugar e comprar. Cópia efêmera com apenas essa expectativa e caminhos de import ajustados passou: SSR, metadados, paginação, 404, discovery, proxy/cookies, função Vercel gerada e indisponibilidade/recuperação 503. O script original foi preservado; sua expectativa continua pendente de atualização fora deste escopo. Build emitiu avisos de anotação PURE do Zod e chunk maior que 500 kB, sem impedir conclusão.

Entrega local concluída; alterações preexistentes preservadas. Sem novas suítes, dependências, API, banco, commit, push ou deploy por esta tarefa. QA simulado não equivale a homologação real nem validação em Safari/iOS.

2026-10-09 — Atualização: dono autorizou commit e push da correção de foco e destes registros na main. Validações da entrega acima permanecem aplicáveis; publicação no Git não confirma deploy.


---

## Arquivo original: INDICE.md

# Índice da documentação — corretor-web

## Padronização vigente do painel (09/10/2026)

[`2026-10-09-padronizacao-painel.md`](2026-10-09-padronizacao-painel.md) registra o acabamento comum de todas as telas administrativas, incluindo a entrada, preservando a ficha de imóvel aprovada e os comportamentos de 06/10. Títulos externos, alinhamento por linha, superfícies compactas, listas/filtros/formulários/diálogos coerentes. Typecheck, lint, 23 testes, build, smoke SSR e QA efêmero aprovados. Escopo frontend/local, sem publicação ou alteração de API/banco; os marcos abaixo permanecem como histórico.

## Refinamento vigente de 06/10/2026

[Contatos, perfil com upload e filtros automáticos](2026-10-06-refinamentos-sistema.md) registra o plano,
implementação, revisão e validação. [System Design](2026-10-06-system-design.docx) descreve arquitetura,
contratos e limites. Este marco atualiza os snapshots abaixo: agora há trabalho autorizado também na API.
R2 temporário real aprovado; perfil no Neon e dispositivo físico ainda sem homologação.
Sem commit, push, deploy ou migrations.

Uma página para achar o estado real do produto sem reler ~250 KB de histórico.
Atualize este índice quando um documento mudar de papel.

## Estado vigente do painel (06/10/2026)

**Atualização mais recente:** specs completas implementadas e validadas localmente.
[`2026-10-06-conclusao-area-corretor.md`](2026-10-06-conclusao-area-corretor.md) reúne telas,
fichas próprias, CampoNumero, guarda e Ctrl/⌘+K, revisões, 320 cenários/140 capturas e limites.
Typecheck/lint/21 testes/build/smoke SSR aprovados. Homologação real pendente; sem publicação.
O parágrafo abaixo permanece como snapshot do primeiro marco, substituído por esta conclusão.

Retomada autorizada pelo dono com a especificação do parceiro `a2a9f81`.
Contatos foi implementado localmente e aguarda revisão visual antes das demais telas. O plano
`PLANO-AREA-CORRETOR.md` permanece como histórico da reversão; a direção vigente é
[`2026-10-06-painel-especificacao-visual.md`](2026-10-06-painel-especificacao-visual.md), com adendo de execução.
Detalhes/limites nas entradas de 06/10 de PROJECT_STATUS, TASKS, DECISIONS e CHANGELOG_AI.
Typecheck, lint, 21 testes, build, smoke SSR e QA simulado (24 cenários/38 capturas) aprovados;
integração real pendente. As fases posteriores do plano não estão concluídas.

## Comece por aqui

| Preciso saber… | Leia | Observação |
|---|---|---|
| Como rodar, regras e mapa do código | [`AGENTS.md`](AGENTS.md) | Fonte das regras do projeto e do protocolo entre agentes |
| O que está em andamento e quem assumiu | [`PROJECT_STATUS.md`](PROJECT_STATUS.md) | Só as 2–3 entradas do topo importam; o resto é histórico |
| O que falta fazer | [`TASKS.md`](TASKS.md) | Uma seção por tarefa, com status |
| Por que algo foi decidido (e o que não fazer) | [`DECISIONS.md`](DECISIONS.md) | Ordem cronológica inversa |
| O que mudou, arquivos e testes executados | [`CHANGELOG_AI.md`](CHANGELOG_AI.md) | Só o último registro é obrigatório no protocolo |
| Regras de produto e contrato | `corretor-spec.json` e [`PLANO-PROJETO-CORRETOR.md`](PLANO-PROJETO-CORRETOR.md) | Compartilhados com a API |
| Última auditoria | [`2026-10-02-auditoria-fullstack.md`](2026-10-02-auditoria-fullstack.md) | Achados A01–A11 |
| Carga do catálogo no Neon | [`2026-10-03-carga-catalogo.md`](2026-10-03-carga-catalogo.md) | Fontes das fotos na API irmã |
| Padrão visual e comportamentos do painel | [`2026-10-06-painel-especificacao-visual.md`](2026-10-06-painel-especificacao-visual.md) | Tokens, listagem, ícones, sidebar e o que falta aplicar |

## Estado resumido (04/10/2026)

- **Produto:** catálogo público SSR, detalhe, contato com consentimento LGPD e painel `/admin`.
- **Verificações automáticas:** `npm run typecheck`, `npm run lint`, `npm test` (suíte mínima, ver abaixo) e `node scripts/seo-smoke.mjs`.
- **Testes:** em 03/10/2026 o dono removeu as suítes antigas. Foi recriada uma suíte **mínima** em
  `src/servicos/*.test.ts` (contato/LGPD, URL de filtro, cálculos de valor e catálogo de exemplo).
  Autorização por perfil, comissão e round-trip de upload moram na API irmã e continuam sem teste.
- **Catálogo real:** 12 anúncios ilustrativos no Neon; fotos na CDN da Unsplash porque a URL pública do R2 responde 401.
  Trocar por fotos reais dos imóveis é pendência de conteúdo, não de código.
- **Dados de demonstração (SSR/visual):** `catalogoExemplo()` em `src/seo/fixture.ts`; nunca usado como fallback de rede.
- **Publicação:** nada publicado; API, Vercel e domínio ainda não existem.

## Regra para não deixar o histórico crescer sem controle

Entradas de `PROJECT_STATUS.md` com mais de duas semanas e concluídas podem ser movidas para
`docs/arquivo/` (sem apagar), mantendo aqui o ponteiro. Decisão ainda não aplicada: exige confirmação do dono.

- [Ajustes aprovados do painel em 06/10/2026](2026-10-06-ajustes-painel.md): seletores, Esc, menu mobile, cards e atendimento.


---

## Arquivo original: PLANO-AREA-CORRETOR.md

# Área do Corretor — pedido consolidado e plano futuro

Data: 06/10/2026. Estado: refatoração anterior revertida; este documento é somente planejamento, sem autorização para nova implementação.

## Resumo do pedido

Deixar o painel agradável para trabalhar, elegante, simples e fácil de entender. Reduzir caixas decorativas sem eliminar organização, identificação das telas ou destaque das ações. Preservar fontes, identidade azul/dourado, site público, dados, permissões e contratos da API.

A tentativa com ícones sem nomes e textos pequenos foi rejeitada. A direção final solicitada é sidebar com nomes visíveis, ícones destacados, botões arredondados, campos outlined e textos confortáveis. A reversão solicitada abrange as mudanças visuais e funcionais desta conversa.

## Requisitos visuais

- Textos principais 18px, auxiliares 16px e títulos principais 20px; subtítulos 18px com peso maior, inclusive nos formulários e modais.
- Sidebar aproximadamente 260px, ícone e nome em cada destino, indicação clara da tela ativa; mobile com menu nomeado.
- Desenhos brancos sobre bases amarelas/douradas arredondadas na sidebar, acompanhados dos nomes.
- Ações principais Novo, Filtrar, WhatsApp e Responder com ícone e texto. Editar e ver ficha com ícone e tooltip contextual.
- Botão de ação inteiro dourado #b3892d, hover #b18424, desenho branco e texto azul-escuro; preservar distinção destrutiva e desabilitada.
- Botões com cantos de 12px, altura mínima 48px e ícones de 22–24px. Confirmações e ações financeiras mantêm texto.
- Inputs/selects/textarea com rótulo acima, contorno nítido, fundo discreto, cantos arredondados e texto 18px; foco, erro e dicas visíveis.
- Contatos em blocos suaves, com fundo discretamente diferente e espaço interno. Imóveis e Contratos continuam em tabelas confortáveis, mudando para mobile antes de comprimir colunas.
- Cabeçalhos com ações próximas ao título; corrigir alinhamento de Responder contatos e evitar símbolos soltos/espaços excessivos.
- Usar componentes e tokens compartilhados somente no painel, sem espalhar correções isoladas ou alterar o site público.

## Requisitos funcionais

1. Tooltips em cada botão ao receber foco ou hover, com nome acessível e aria-describedby. Permanecem enquanto houver foco/hover, sem interceptar clique ou cortar nas bordas. Esc fecha primeiro a dica e consome esse evento.
2. Contratos abrem ao clicar na linha/item inteiro; manter link acessível e abertura em outra aba. Controles/referências internos executam somente a própria ação.
3. Clique no imóvel abre ficha de consulta; nome/avatar do corretor abre perfil, inclusive a própria conta. Reutilizar Dialogo e ficha existente, separar edição por permissão e mostrar apenas dados disponíveis/autorizados. Incluir loading, erro com retry, indisponível e restauração de foco.
4. Campos numéricos compartilhados para valores, áreas, percentuais e quantidades, com unidade fora da edição. Aceitar vírgula/ponto e colagem 1.234,56; rejeitar letras, sinais e notação científica. Preservar precisão, limites, opcionais e formatos atuais da API.
5. Modal sem mudanças fecha com um Esc após tooltip/seleção. Com mudanças, primeiro Esc avisa: “Há alterações não salvas. Pressione Esc novamente para descartar e sair.” Segundo Esc consecutivo descarta pendências e fecha, sem prazo. Nova edição, clique ou outra tecla desarma.
6. Comparar valores atuais/iniciais: conteúdo pré-preenchido não é alteração e restaurar os valores iniciais permite fechar com um Esc. Bloquear fechamento durante operações; descarte não reverte o que já foi persistido.
7. Fechar apenas a sobreposição superior. Botão fechar e clique externo permitido pedem confirmação explícita se houver alterações. Sem sobreposição, Esc volta dentro do painel respeitando guardas; acesso direto retorna à lista e telas principais à visão geral.
8. Ctrl/⌘+K abre comandos pesquisáveis permitidos, com setas/Enter; / foca busca e ? abre ajuda fora da digitação. Ctrl/⌘+Enter envia edição ativa, priorizando modal, com validação e bloqueio de duplicidade, sem confirmar ações destrutivas/financeiras.

## Plano de execução futura

1. **Revisar o painel atual e conversar ponto a ponto.** Identificar o que já atende ao pedido e apresentar uma lista curta dos ajustes necessários.
2. **Preparar uma tela de referência.** Usar Contatos para demonstrar tipografia, botões, campos, sidebar e blocos. Revisar com o dono antes de propagar a linguagem visual às demais telas.
3. **Consolidar componentes compartilhados.** Aplicar a referência aprovada em Visão geral, Imóveis, Contratos, formulários e modais; conferir público intacto.
4. **Implementar os comportamentos em etapas.** Tooltips e números; contratos e fichas; depois pilha de modais, dois Esc, guardas e atalhos. Preservar serviços e permissões existentes.
5. **Validar a entrega.** Typecheck, lint, os 21 testes existentes, build e smoke SSR, sem ampliar suítes fonte. Conferir teclado, foco, tooltips, seletores, modais sobrepostos, dois Esc/desarme/valores restaurados, ações internas, números e ADMIN/CORRETOR.
6. **Revisar visualmente e registrar.** Contatos, Visão geral, Imóveis, Contratos, formulários e modais em 390/768/1440, claro/escuro; legibilidade, contraste, alinhamento, quebra e ausência de overflow. Atualizar os cinco documentos preservando histórico e separar QA simulado de integração real.

## Limites

Somente frontend. Sem novas dependências, alterações de API ou dados, migrations, commit, push ou deploy. Não reimplementar automaticamente: a solicitação atual é reverter e entregar este plano.

## 06/10/2026 — Adendo: retomada autorizada pelo dono

O texto acima preserva o pedido de reversão e a proposta daquele momento. Depois, o parceiro
publicou a base visual em `a2a9f81` e o dono pediu para continuar e implementar o plano.
A fonte vigente passa a ser `2026-10-06-painel-especificacao-visual.md`, que substitui esta proposta.
Ela define a escala 28/22/18/16/14, Pessoas como referência, duas filas em Contatos, somente
Ctrl/⌘+K e descarte armado também com Enter. No plano aprovado, fichas novas são telas próprias.

Primeiro marco implementado e validado: Contatos; aguarda revisão do dono conforme seção 8 da
especificação antes de propagar às outras telas. Próximas fases e limites em TASKS/PROJECT_STATUS.
Os registros e requisitos anteriores permanecem como histórico, sem autorizar a volta dos padrões rejeitados.

## 06/10/2026 — Adendo: specs completas autorizadas e concluídas localmente

O dono autorizou aplicar a especificação vigente ao restante do painel, incluindo fichas em
telas próprias, CampoNumero, guarda e somente Ctrl/⌘+K. A continuação foi implementada e
validada; registro em `2026-10-06-conclusao-area-corretor.md`. O checkpoint e as pendências
anteriores retratam o primeiro marco. Não retomar os padrões/atalhos rejeitados deste plano
histórico. Integração real e Safari/iOS/celular físico continuam sem homologação; sem publicação.


---

## Arquivo original: PROJECT_STATUS.md

# Estado atual — corretor-web

## 2026-10-09 — Codex: ações desktop corrigidas

Correção local concluída após revisão no celular/desktop: a coluna de ações da tabela agora permanece em uma linha no desktop, incluindo quatro ações em Contatos. O mobile mantém quebra controlada nos cartões. Typecheck, lint, testes e build aprovados; conferência simulada de Contatos confirmou quatro botões em 44px, sem overflow em 1440px, e cartões mobile sem overflow em 390px. Sem API, dados ou publicação.

## 2026-10-09 — Codex: painel padronizado e validado localmente

Plano integral concluído: acabamento comum da entrada, listas, Visão geral, Perfil, fichas, formulários e diálogos. Seções com títulos externos, superfícies alinhadas por linha, grade por container, espaçamento/padding compactos, tabelas/cartões e filtros coerentes. Ficha de imóvel aprovada preservada; ações rápidas com ícone/dica e confirmações/finanças com texto. Detalhes em `2026-10-09-padronizacao-painel.md`.

Typecheck, lint, build, 23 testes existentes e smoke SSR de produção aprovados após ajustes finais. QA Chromium/API simulada: 270 cenários de listas/fichas/grades em 320/390/1024/1440/1920px, claro/escuro e ADMIN/CORRETOR; 49 cenários de formulários/login/estados; 5 fluxos de lista/Esc/paleta/menu. Regressão da ficha aprovada: 28 cenários e 2 fluxos novamente aprovados. Sem overflow, erros JS ou desalinhamento de superfícies; capturas selecionadas inspecionadas. Evidências ignoradas em `artifacts/painel-padrao-2026-10-09` e `artifacts/imovel-alinhamento-2026-10-09`.

Documentos de contexto e índice atualizados sem apagar histórico. API/dados, Safari/iOS, dispositivo físico, login/integradores reais e reprodução de vídeo real não homologados. Sem novas suítes, dependências, API/banco, commit, push ou deploy; alterações anteriores e índice Git preservados.

## 2026-10-09 — Codex: padronização visual integral em andamento

Plano autorizado pelo dono: todas as telas são referências; consolidar acabamento comum do painel inteiro, incluindo entrada, sem impor um único layout. Base/estilos compartilhados, fichas, listas, Perfil, formulários e diálogos serão adaptados. Preservar o resultado aprovado da ficha de imóvel, as funcionalidades, fontes/identidade, dados e permissões. Trabalho local em main, sem publicação, dependências, API/banco ou novas suítes. Alterações locais anteriores preservadas; agentes com arquivos separados para fichas, formulários/Perfil e listas. Validação e documentação finais pendentes.

## 2026-10-09 — Codex: alinhamento da ficha após revisão do dono

Entrega local concluída: títulos acima das superfícies e cards com topos/bases alinhados por linha, inclusive galeria/resumo e títulos quebrados. Estrutura e subgrid aplicados sem alturas fixas nos cards, mantendo as notas anteriores, campos, ações e permissões. Ficha interna precede Descrição para preencher a grade; dimensões locais da galeria prevalecem sobre as utilities compartilhadas. Typecheck, lint, build e 23 testes existentes aprovados. QA efêmero com API simulada: 28 cenários de layout e 2 fluxos de consulta sem permissão/Esc aprovados nos dois temas; desvio de topo/base 0px, sem overflow ou erros JavaScript. Foto até 380px e miniaturas 80×56 confirmadas. Sem commit, push, deploy ou mudança na API/banco; sem homologação real de dados, vídeo ou Safari/iOS.

## 2026-10-09 — Codex: ficha do imóvel em notas compactas

Implementado o plano autorizado: galeria/resumo em proporção 2:1 e notas de Características, Localização, Pessoas vinculadas, Descrição, Ficha interna e Observações internas. Identidade azul/dourado, sombras leves, grade por container, todos os dados acessíveis. Mesma apresentação na consulta da edição sem permissão. Typecheck, lint, build e 23 testes existentes aprovados. QA com API simulada cobre quatro larguras e dois temas; não equivale a homologação no banco real ou Safari/iOS. Entrega local, sem commit, push, deploy ou mudanças na API/banco.

## 2026-10-08 — Codex: 404 da foto corrigido na implantação

O dono autorizou resolver pela página aberta do Render usando Computer Use. Confirmado commit ativo antigo e3b0a32; implantação manual do origin/main 86ecf29 concluída (Deploy succeeded/Live), serviço srv-daj21e15efls73fab4gg, deploy dep-db4684m0tbcc73d9jtr0. Este registro substitui a pendência de acesso/publicação do diagnóstico abaixo.

URL original /api/corretores/1/foto?v=1f6h7x3 agora responde 302; seguindo redirect, HTTP 200 image/jpeg, 22322 bytes. /api/v1/saude da API retorna status ok. Perfil aberto recarregado para verificar a correção. Sem alterações funcionais, migrations, gravação de dados, commit ou push; documentação histórica preservada. Conector Render segue indisponível, mas sessão do navegador permitiu corrigir a implantação.


## 2026-10-08 — Codex: diagnóstico do 404 da foto publicado

Área: implantação da foto do perfil. Código local e origin/main da API em 86ecf29, com FotoCorretorController registrado. GET público via Vercel retorna 404 Cannot GET /corretores/1/foto; com /api/v1 também não reconhece a rota. Indício de versão implantada divergente, ainda sem acesso para confirmar o commit do Render.

Build API aprovado. QA efêmero com middleware antes do router e proxy real: foto externa 302 e foto gerenciada 200 com bytes corretos; banco/storage simulados. Primeira sondagem do harness falhou por registrar middleware depois de iniciar o servidor; corrigida somente no QA. Sem mudança funcional, dados, commit ou deploy. Conector Render exige reautenticação; aguardando conexão e autorização de publicação.


## 2026-10-06 — Codex: contatos, perfil com upload e filtros automáticos

Plano autorizado implementado localmente nos dois repositórios. Contatos em abas com paginação própria,
seletor sem partir palavras, WhatsApp com SVG e ações compactas; perfil com dois cards e faixa de métricas.
Arquivo/URL, prévia, substituição e remoção só persistem em Salvar perfil. API JSON/multipart e leitura
da foto pelo id funcionam com bucket privado. Filtros do catálogo/Imóveis/Pessoas/Contatos/Contratos
aplicam seleções imediatamente e texto após 350 ms, sem perder foco ou resultados válidos.

Typecheck, lint e build aprovados nos dois projetos; frontend 3 arquivos/21 testes e smoke SSR aprovados.
API não possui testes fonte: Jest com passWithNoTests confirma ausência, não cobertura.
QA HTTP: 22 cenários simulados e reprodução de foto concorrente corrigida. QA Chrome: 23 cenários e
32 capturas em 320/390/768/1440, claro/escuro, sem overflow/erros JS/chamadas inesperadas.
Revisão independente: limpeza de página/valor inválido e referência antiga de foto corrigidas/reverificadas.
R2 real: envio, leitura e exclusão (GET posterior 404) de objeto temporário isolado aprovados. Sem
gravação de perfil no Neon; login real, fluxo ponta a ponta e Safari/iOS/celular físico sem homologação.

Detalhes: `2026-10-06-refinamentos-sistema.md`. System Design clonado do template, original preservado,
seis páginas renderizadas e inspecionadas. Evidências ignoradas em artifacts/refinamentos-2026-10-06/.
Alterações anteriores da API preservadas, inclusive índice staged. Sem publicação ou migrations.

## 2026-10-06 — Claude: cabeçalhos padronizados e ajustes de consistência

Pedido do dono: botões dos cabeçalhos no estilo de "Encontrar um imóvel", remover esse link e tirar a borda do
botão de tema; painel incluído. Entregue com `.linha-nav` no site e no painel. Também ajustados links que pareciam
texto comum, rotas fixas nas páginas de erro, rótulos digitados em maiúsculas no login e espaçamento herdado
nos selects do catálogo. Typecheck, lint, 21 testes, build, smoke SSR, curl das rotas públicas e QA efêmero
(Chrome, 390/1440, claro/escuro, API simulada) aprovados. Evidências: `artifacts/cabecalhos-2026-10-06/`.
Sem commit, push ou publicação.


## 2026-10-06 — Codex: Área do Corretor concluída e validada localmente

Plano completo autorizado e implementado: Imóveis/Contratos/Comissões/Cadastros/Corretores/
Visão geral/Perfil, fichas próprias, formulário e mídias, CampoNumero, guarda de modais e
paleta Ctrl/⌘+K. Ajustes anteriores do dono e permissões preservados. Detalhes e limites em
`2026-10-06-conclusao-area-corretor.md`; entradas anteriores são snapshots da execução.

Validação final: typecheck, lint, 3 arquivos/21 testes, build e smoke SSR aprovados.
Chrome/API simulada: 320 cenários, 140 capturas, ADMIN/CORRETOR, 320/390/768/1440 claro/escuro;
sem erros JS, chamadas inesperadas ou overflow horizontal. Revisão estática concluída e
achados corrigidos/reverificados. Amostras visuais inspecionadas. Diff-check e índice preservado.
Evidências: artifacts/conclusao-area-corretor-2026-10-06/. Nenhuma suíte rastreada ampliada.

Prévia Wi-Fi verificada no host: http://192.168.0.20:5173/admin/entrar; sondagem sem credenciais
chega à validação de campos sem rejeitar origem. Celular físico, Safari/iOS, login e integrações
reais permanecem sem homologação. Somente frontend/main; sem API/dados/dependências/publicação.

## 2026-10-06 — Codex: conclusão da Área do Corretor em andamento

O dono aprovou o plano completo para as telas restantes, fichas próprias, CampoNumero,
guardas de alterações e Ctrl/⌘+K. Esta autorização permite seguir após a revisão de Contatos.
Execução na main, preservando alterações locais e índice; frontend apenas, sem publicação.
Componentes compartilhados, integração e QA: Codex principal. Telas financeiras e cadastros:
implementador delegado com arquivos separados. Evidências em artifacts/conclusao-area-corretor-2026-10-06/.
Validação desta continuação ainda pendente; resultados anteriores não validam a nova entrega.

## 2026-10-06 — Codex: ajustes da revisão do dono

Plano aprovado e implementado: seletores de filtros compartilhados, tooltip sem rolagem,
retorno por Esc ao histórico interno, menu mobile em tela inteira, cards/ações alinhados,
Atendido estilizado, remoção do filtro sem foto e origem/consentimento reservados à ficha.
Implementação e validação local concluídas; fonte desta etapa: `2026-10-06-ajustes-painel.md`.
Etapas restantes do plano anterior continuam pendentes. Alterações locais/índice preservados,
sem backend, banco, novas dependências ou publicação.

**Validação final:** typecheck, lint, 3 arquivos/21 testes existentes, build e smoke SSR
aprovados. Chrome/API simulada: 63 cenários, 59 capturas, sem erros JavaScript,
requisições API inesperadas ou overflow horizontal. Matriz 320/390/768/1440 claro/escuro
para Pessoas, Contatos, Corretores, Imóveis, ficha, seletor e menu. Inclui teclado,
tooltip sem rolagem, histórico/POP/entrada direta, guarda de edição, seletores das demais
listagens, atendimento erro/retry/transições e permissões ADMIN/CORRETOR; regressão pública
de catálogo, detalhe e menu. Capturas representativas inspecionadas visualmente.
`git diff --check` aprovado; diff staged antes/depois com SHA-256 idêntico.
Evidência ignorada: `artifacts/ajustes-painel-2026-10-06/`.

API/banco/serviços reais, Safari/iOS e dispositivo físico continuam sem homologação.
QA simulado não altera dados reais. Nenhuma suíte rastreada foi criada ou ampliada.

## 2026-10-06 — Codex: Contatos implementado, em revisão do dono

Retomada autorizada a partir de `a2a9f81` (parceiro), usando a especificação
`2026-10-06-painel-especificacao-visual.md`, que prevalece sobre o plano anterior revertido.
Primeiro marco entregue: Pendentes/Atendidos, checkbox de ida e volta, finalização confirmada,
histórico separado e reabertura somente por ADMIN no frontend. Filtros, paginação por fila,
CSV da página, mensagem e WhatsApp preservados; Pessoas/EditorPessoa compartilham a permissão.
Tooltips do painel usam popover sem cortar nas listagens; erros/dicas seguem a escala auxiliar
e o cabeçalho de modal recebe o espaçamento mobile somente em `.painel-ui`.

Validação final: typecheck, lint, 21/21 testes existentes, build e smoke SSR aprovados.
Chrome com API simulada: 24 cenários e 38 capturas, incluindo ADMIN/CORRETOR, 390/768/1440,
claro/escuro, navegação, falhas/retry e regressão pública; sem erro JS ou overflow horizontal.
Evidências locais ignoradas: `artifacts/area-corretor-2026-10-06/`. Integração real e Safari/iOS
continuam sem homologação; a exclusividade ADMIN para reabrir não é imposta pela API nesta etapa.

**Próximo passo:** o dono revisar Contatos, conforme seção 8 da especificação: "Parar para o dono
conferir." Depois seguem Imóveis/Contratos, demais telas, fichas próprias, números, guardas e Ctrl+K.
Nenhuma dessas fases posteriores foi implementada nesta entrega. Main, histórico e alterações
preexistentes preservados; sem novas dependências, alterações de API/dados, migration ou publicação.

## 2026-10-04 — Antigravity: consolidação de todos os arquivos .md em docs/

A pedido explícito do dono, todos os arquivos markdown (.md) do projeto foram movidos para a pasta `docs/`.
As subpastas (`docs/audits/`, `.claude/agents/`, `.claude/commands/`) foram excluídas, centralizando
toda a documentação em um nível plano dentro de `docs/`.
Arquivos de regras e instruções (AGENTS.md, CLAUDE.md) atualizados para apontar para `docs/`.
## 2026-10-04 — Publicação autorizada pelo dono: ajustes da revisão externa e suíte mínima

Pedido explícito do dono: commit e push da implementação na main. Escopo: filtros do catálogo enxutos,
novo herói de rua comercial, ações do detalhe no card de valor, soma atenuada, catálogo de demonstração
variado, suíte mínima de 21 testes vitest, limpeza de tsconfig.json e .gitignore, documentação em docs/INDICE.md e docs/plans/.
Sincronizado via fast-forward com o commit be877c0 do parceiro antes do envio. Typecheck, lint, vitest
e seo-smoke aprovados (exit 0). Sem deploy/migração de produção.

## 2026-10-03 — Antigravity: remoção do andaime sobreposto ao operário em /devs

A pedido do dono, corrigida a animação do operário no overlay de /devs (CenaObra.tsx).
Removido o bloco do andaime que se sobrepunha diretamente ao personagem, eliminando o artefato
visual da prancha amarela atrás da cabeça e da haste vertical.
Validação: typecheck, lint, build e seo-smoke aprovados (exit 0).
npm test: exit 1, sem arquivos de teste, conforme decisão do dono.

## 2026-10-03 — Codex: carga persistente do catálogo concluída localmente

Pedido esclarecido pelo dono: preencher o Neon atual da API com 12 imóveis e fotos da internet,
sem modo de demonstração no frontend. Criar ADMIN Codice conforme escolhas em conversa.
Neon direto: 12 novos imóveis disponíveis, 36 fotos, 9 características, Codice ADMIN e nenhum
cadastro auxiliar duplicado. Backup privado antes da escrita; verificação comparou o snapshot
completo e preservou todas as linhas anteriores. As fotos ficam em cópia no R2 e o banco aponta
à CDN Unsplash, pois a URL pública do bucket responde 401; nenhuma política de acesso foi alterada.
SSR/ficha/galeria conferidos localmente com uma foto carregada. Typecheck/lint/build API aprovados;
npm test sai 1 sem suítes. Documentação da API e frontend atualizada. Sem migration, commit,
push ou deploy; credenciais ficam em pasta local restrita fora do Git/OneDrive.

## 2026-10-03 — Codex: publicação do cartoon de indisponibilidade autorizada

Pedido explícito do dono: commit e push da implementação na main. Escopo: cena de reparo,
sondagem/recuperação da página, smoke existente e os cinco documentos de contexto.
Após fetch, main/ origin estavam sincronizadas (0/0). Typecheck/lint/smoke repetidos e aprovados;
npm test repetido: exit 1, sem arquivos, conforme decisão do dono. Build e 22 checks Chrome da
implementação permanecem válidos: nenhuma mudança posterior no código de produção.
Excluir do commit dev.mjs, vite.config.ts e anexos preexistentes; artefatos ignorados não publicados.
Sem deploy/migration/API/dados reais; pendências de homologação do registro abaixo mantidas.

## 2026-10-03 — Codex: cartoon e recuperação da indisponibilidade concluídos localmente

Implementada a espera pública 5xx com cena de reparo silenciosa, pausa/movimento reduzido e
sondagem HEAD da própria página. Recuperação 200/404 recarrega a URL original; erro/timeout conserva
a espera. Timers/requests invalidados ao sair/trocar URL/ocultar/offline; filtros/hash preservados no JS.
Área liberada: Codex integrou serviço/hook/página/docs/QA; cena_reparo implementou SVG/CSS próprios.
Typecheck/lint/build e smoke SSR aprovados; 22/22 verificações Chrome com API simulada aprovadas
(14 cenários e 8 layouts 320/390/768/1440 claro/escuro). Sem erros JS/hidratação ou overflow observados.
`npm test` terminou exit 1 por ausência de arquivos, conforme remoção do dono; suítes não recriadas.
Pendências: cache/CDN/cold start publicados, API/serviços reais, Safari/iOS e dispositivos físicos.
Visibilidade testada por evento simulado; tempos 30/50s por relógio virtual. Serviços QA próprios encerrados.
Evidências ignoradas em `artifacts/indisponibilidade`; quatro diretórios vazios fora do repo ficaram após
rejeição automática da limpeza, descrita em CHANGELOG_AI. Main; alterações locais anteriores preservadas.
Sem dependências novas, commit/push/deploy ou alteração em dados/API reais.

## 2026-10-03 — Codex: cartoon e recuperação da indisponibilidade em andamento

Plano aprovado pelo dono em conversa. Área assumida: Codex (sondagem HEAD, hook de recuperação,
integração da página, documentação e QA); subagente cena_reparo (SVG e estilos próprios da cena).
Animação de reparo sem som, pausa/movimento reduzido e recuperação automática da URL original.
Somente frontend, direto na main; preservar dev.mjs, vite.config.ts e anexos locais preexistentes.
Sem API real, dependências novas, recriação de suítes, commit/push/deploy ou mudança de dados.
Validação prevista: typecheck/lint/build, smoke SSR e navegador com API simulada.

## 2026-10-03 — Codex: refinamento do frontend concluído localmente

Público e painel refinados conforme o plano aprovado: ações auxiliares em ícones com alvos de
44px, catálogo compacto, filtros removíveis, custos e contato melhor posicionados no mobile,
galeria navegável, navegação completa do painel, resumo por prioridade e formulário em seis
seções com barra de salvar. Logo, cores, fontes, dados, permissões e contratos preservados.

Validação atual: typecheck/lint/build e smoke SSR aprovados; 97 verificações Chrome (84 layouts
e 13 cenários), mais 5 registros de fluxos complexos, sem falhas/erros de página. Matriz principal
320/390/768/1024/1440 nos dois temas; telas adicionais em 390/1440. API inteiramente simulada.
`npm test -- --maxWorkers=1 --reporter=dot` foi executado e terminou com código 1 por ausência
de arquivos de teste, conforme a remoção pelo dono; nenhuma suíte fonte foi recriada.

Pendências de homologação: API/banco/R2/Drive reais, reprodução de vídeos reais, Safari/iOS e
dispositivos físicos. Filtros administrativos na URL seguem tarefa futura. Documentos atualizados
sem apagar histórico. Main em 80717c0, HEAD/origin = 0/0 na conferência; API irmã limpa.
Sem dependências novas, commit/push/deploy ou escrita em dados reais. Evidências locais ignoradas
em `artifacts/refino`; prévia sintética em http://127.0.0.1:4180 durante esta sessão.

## 2026-10-03 — Codex: refinamento do frontend em andamento

Plano aprovado pelo dono: público e painel, identidade preservada, ações auxiliares com ícones
compactos, hierarquia e navegação mais claras. Área assumida: Codex (base compartilhada,
integração, documentação e QA), com subagentes em arquivos distintos do público, painel e formulários.
Somente frontend, direto na main; sem API, dependências, recriação de suítes, commit/push ou deploy.
Validação prevista: typecheck/lint/build, smoke SSR existente e navegador com API simulada.

## 2026-10-03 — Remoção de testes por solicitação do dono

Removidos 46 arquivos `*.test.*`/`*.spec.*` do frontend e 28 da API irmã. Mantido o código de produção.
Nenhum teste foi executado após a remoção; os resultados abaixo e no histórico são evidência da execução
anterior, não da árvore atual. Scripts e dependências de teste permanecem sem suítes fonte.

## 2026-10-03 — Codex: revisão das correções concluída localmente (sem commit)

Pedido do dono: revisar as correções baseadas na auditoria de 02/10 e melhorar o que estivesse inadequado.
Corrigidos vínculos legítimos no PATCH de contrato (A01), limite durante recepção multipart/concorrência e lock
fora de transação (A02), respostas obsoletas e refresh compartilhado (A04), preservação de características
sem ressuscitar vínculos removidos (A09) e busca telefônica com +55 (A10). Correções anteriores A05–A08 mantidas.

Validação: frontend typecheck/lint, 43 arquivos/231 testes, build e SEO smoke aprovados; API typecheck/lint,
27 suítes/188 testes e build aprovados, 1 suíte/4 testes PostgreSQL não executados. HTTP sintético cobre A01,
upload chunked agregado, autorização anterior ao storage, concorrência e limite de 20 arquivos. Sessões e
round-trip de características exercitados com persistência sintética. API lenta/recuperação e teto SSR testados.
Navegador local: catálogo, detalhe e 404; robots/sitemap por HTTP. Sem homologação de banco/Drive/R2 reais,
infra publicada ou testes de carga. A09/A10/A11/H01 conservam pendências operacionais no relatório.

Trabalho direto na main, HEADs sincronizados com origin/main após fetch (0/0 em ambos). Alterações locais
anteriores preservadas. Sem commit/push/deploy/migration ou escrita em serviços reais nesta revisão.
Relatório: docs/audits/2026-10-02-auditoria-fullstack.md no Corretor-web.


## 2026-10-03 — Codex: revisão das correções da auditoria (em andamento)

Área assumida: A01–A11 e documentação, por pedido do dono. Revisão e correções com testes locais/sintéticos; sem commit, deploy, migrations ou escrita em serviços reais. Alterações locais anteriores preservadas.


## 2026-10-03 — Muse Spark: manutenção da auditoria full stack concluída em código (sem commit)

Endurecidos A06 (fonte única), A07 (stale guard + remonte), A08 (sequência + erro visível + bloqueio),
A09 (tipo + round-trip, sem marcar) e A11 (orçamento 45s + `Retry-After`, sem marcar) após pull dos dois repos
(front `8d40cb8`, back `85a6301`). Validado: typecheck/lint, front 43 arquivos/223 testes, API 24 suítes/175 testes,
build e seo-smoke aprovados. Checkboxes A06–A08 atualizados; A09/A10/A11/H01 seguem abertos. Sem commit/push
(aguardando confirmação do dono, direto na `main`).

## 2026-10-02 — Antigravity: resolução dos Gaps de Execução no Frontend (GAP-06, GAP-07, GAP-08 concluídos)

Concluído com sucesso:
- GAP-06 (Audit A06): Validação estrita de telefone com DDD nacional no formulário de contato (`telefoneValido` em `src/servicos/contato.ts`), alinhada com `@TelefoneValido()` da API, e bloqueio de `window.open` em caso de telefone inválido (`src/componentes/FormularioContato.tsx`).
- GAP-07 (Audit A07): Sincronização da paginação das 3 colunas em `/admin/contatos` (`src/paginas/painel/Contatos.tsx`), resetando para página 1 ao alterar filtros de busca/data, e proteção do botão de exportação CSV em caso de erro na requisição.
- GAP-08 (Audit A08): Seleção direta de contratos por ID via `api.obterContrato(valor.id)` na tela de registro de comissões (`src/paginas/painel/Comissoes.tsx`), eliminando buscas aproximadas em lista paginada e garantindo vínculo correto do imóvel.
Validação: typecheck (0 erros), lint (0 avisos), 39 arquivos / 195 testes aprovados, build de produção e `seo-smoke` aprovados.

## 2026-10-02 — Antigravity: injeção de dados de demonstração concluída

Concluído povoamento do banco Neon (corretor-db): 9 imóveis completos com mídias e fichas internas (avaliações mercadológicas), 12 características, 5 corretores/usuários, 12 pessoas (clientes, proprietários, inquilinos e leads nos 3 status de contato), 2 contratos de locação ativos e 3 comissões com parcelas. Validado com testes passando em ambos os repositórios.

## 2026-10-02 — Codex: publicação dos easter eggs autorizada pelo dono

Pedido explícito: commit e push na main. Pacote: cartoon no `/devs` e 404,
diálogo acessível, som automático sujeito ao navegador, limpeza do áudio e testes.
Diff revisado, origem sincronizada antes do commit; publicação destinada a origin/main.
Validações da sessão registradas em CHANGELOG_AI. Somente arquivos dessa tarefa;
anexos locais e artefatos ignorados ficam fora do commit. Sem operação na API/banco.

## 2026-10-02 — Codex: autoplay da obra concluído (sem commit)

A pedido do dono, a intro tenta áudio automaticamente em toda entrada no `/devs`,
inclusive acesso direto. Botão e fallback preservados quando o navegador bloqueia.
Área assumida: ObraOverlay e testes/documentação; sem commit/push.
Validado: typecheck/lint, 42 arquivos/216 testes, build, seo-smoke e 5 cenários
Chrome direcionados a áudio/teclado. Autoplay autorizado toca as três faixas no
acesso direto; bloqueio permite repetir no botão. Mudo e saída param as faixas.

## 2026-10-02 — Codex: refinamento cartoon dos easter eggs concluído (sem commit)

Área assumida: cenas do `/devs` e 404, diálogo acessível, limpeza do áudio e validação visual.
Plano aprovado pelo dono: preservar intro de 5s, retorno em 8s e dados dos desenvolvedores.
Frontend apenas, direto na main, sem commit/push. Nenhum outro agente editando esta área.

Obra em perspectiva com operário e entrega da casa em etapas; 404 com ruína, porta/placa
balançando e feno atravessando. Intro usa `Dialogo` nativo; sem JS, o modal fica fechado
e os créditos acessíveis. Áudio pendente não reativa após saída, inclusive em StrictMode.
Validação: typecheck/lint, 42 arquivos/216 testes, build e seo-smoke aprovados; 20 cenários
Chrome desktop/matriz dos easter eggs + 5 cenários públicos mobile. Matriz revisada por
prints em 320/390/768/1440px, claro/escuro; teclado, áudio real/bloqueado, saída de rota,
redução de movimento, sem JS e histórico conferidos. API simulada; Safari/iOS e aparelhos
físicos não conferidos. Detalhes e comandos no novo registro de `CHANGELOG_AI.md`.

## 2026-10-03 — Muse Spark: 404 com casa quebrada (commit `92d9e99`)

Implementada a 404 personalizada: `CasaQuebrada` em SVG (ruína divertida, tokens
navy/gold, `animate-feno` + `animate-feno-girar` em `tailwind.css`, SSR-safe) e
`PaginaErro` com `404` gigante, countdown de 8s e volta automática ao catálogo com
botão `Ficar aqui` (só no 404; 503 inalterado). SSR segue 404 `noindex,nofollow`,
sem fetch. Validado: typecheck, lint, 42 arquivos/210 testes, build e seo-smoke
aprovados; CSS e bundle SSR conferidos. Commit `92d9e99` na `main` + push
`1c81e63..92d9e99` a pedido do dono. Pendente conferir no navegador: 404 desktop/mobile nos dois temas, reduced-motion,
countdown, volta automática e cancelamento.

## 2026-10-03 — Muse Spark: áudios reais no overlay do /devs (commit `a086849`)

A pedido do dono: saiu a seção fixa ("card da casa") e o overlay virou o easter egg único, agora com
áudios reais de obra em vez do synth. Três MP3 CC0 do BigSoundBank vendored em `public/assets`
(furadeira #0184 aparada p/ loop de 10s, martelo #0005, ambiente #0631 aparado p/ 30s; ~650KB, lazy só
no /devs). Overlay tenta o som sozinho p/ quem veio do rodapé, com botão Com som/Mudo; para tudo ao sair.
Validado: typecheck, lint, 40 arquivos/202 testes, build e seo-smoke aprovados; SSR 200, `noindex,follow`,
sem fetch; MP3s conferidos no `dist`. Commit `a086849` na `main` + push
`38b21fb..a086849` a pedido do dono. Pendente ouvir no navegador
(clique no rodapé, URL direta, temas, mobile, Safari/iOS).

## 2026-10-03 — Muse Spark: overlay de abertura da obra no /devs (sem commit)

Evolução do easter egg a pedido do dono: intro fullscreen com glassmorphism (`ObraOverlay`, `z-50`,
`backdrop-blur`) sobre o `/devs`, com a casa animada e saída automática em ~5s (botão Pular, Escape ou
clique fora também dispensam). Cena SVG extraída para `CenaObra.tsx`, reutilizada na seção fixa; som
continua só na seção (`CasaEmObra`). Validado: typecheck, lint, 41 arquivos/205 testes, build e seo-smoke
aprovados; SSR do `/devs` 200, `noindex,follow`, estático e sem fetch. Sem commit/push (aguardando o dono).
Pendente conferir no navegador: entrada/saída do overlay, temas, mobile e Safari/iOS.

## 2026-10-03 — Muse Spark: easter egg da casa em obra no /devs (sem commit)

Área assumida: canteiro sempre visível no `/devs` com casa em SVG animado + som de obra sintetizado
(`src/servicos/obra.ts`, `src/componentes/CasaEmObra.tsx`, integração em `Devs.tsx`/`LayoutPublico.tsx`,
keyframes em `tailwind.css`). Som liberado pelo clique que leva ao `/devs`, com botão fallback.
Validado: typecheck, lint, 40 arquivos/199 testes, build e seo-smoke aprovados; SSR do `/devs` 200,
`noindex,follow`, estático e sem fetch. Sem commit/push (aguardando confirmação do dono).
Pendente conferir no navegador com som: clique no rodapé, URL direta, temas, mobile e Safari/iOS.
> Marcador de merge histórico preservado como nota: `>>>>>>> 04d93d9740780040dfc9dc83cc37754f5ad5fbd0`.

## 2026-10-02 — Auditoria técnica full stack documentada

Auditoria registrada em `docs/audits/2026-10-02-auditoria-fullstack.md`; fotografia original: frontend `94ebcef`, API `e3b0a32`.
Veredito: bloquear publicação até corrigir A01. O remoto atual já contém alterações posteriores; A04/A05 têm correções aparentes descritas no relatório.
Na auditoria passaram typecheck/lint dos dois repositórios; frontend 37 arquivos/178 testes; API 25 suítes/173 testes,
com bootstrap e integração PostgreSQL excluídos. Três reproduções usaram dados sintéticos. Nenhuma correção foi iniciada nesta tarefa documental.

## 2026-09-16 — Claude: contrato v2 concluído no front (ids inteiros, pessoas, ficha do imóvel, português)

Implementado e validado: typecheck, lint, 37 arquivos/177 testes, build e `seo-smoke` aprovados no front;
na API, typecheck, lint, build, 175 testes e a integração da migration em PostgreSQL 16 aprovados.
Falta conferência no navegador com a API v2 local e E2E autenticado; publicação exige corte coordenado
(front e API juntos) e migração do banco com backup. Sem commit/push.

## 2026-09-16 — Claude: contrato v2 (ids inteiros, pessoas, ficha do imóvel, front em português)

Área assumida: implementação das decisões do dono de 16/09 nos dois repositórios, conforme
`docs/specs/2026-09-16-ids-inteiros-pessoas.md`. Front: tipos e serviços em português sem tradutor,
mídia enviada na criação do imóvel, contatos em três colunas, cadastro único de pessoas, filtros e
ordenação no catálogo, componentes compartilhados do painel. Fora desta rodada: aviso de novo
contato, regras de locação/comissão (tarefas abertas). Em andamento; sem commit/push.

## 2026-09-16 — Claude: diagnóstico de produto (somente leitura)

Área assumida: varredura completa do front e da API com olhar de corretor, sem alteração de código,
dados ou banco. Resultado em `docs/plans/2026-09-16-diagnostico-produto.md`: 7 pontos críticos
(rascunho/publicação, aviso de contato, funil, pessoas em três cadastros, ficha do imóvel, busca,
textos de privacidade), melhorias por área, funcionalidades em P1/P2/P3 e dívidas de manutenção
(Prettier, dois vocabulários, duplicação no painel). Aguarda o dono escolher a ordem para virar
tarefas em `TASKS.md`. Sem commit/push.

## 2026-09-16 — Slugs públicos inválidos retornando 503

Área assumida: correção do 503 causado por URL de imóvel malformada, sem alteração de dados,
API ou banco. O SSR agora valida o slug no formato aceito pela API antes de fazer a consulta;
o cliente também rejeita slugs inválidos como 404. A URL de teste com `OR`, aspas e `released`
passa a ser 404 sem alcançar a API; slugs válidos permanecem inalterados.
Validação inicial: testes direcionados (3 arquivos/50 testes) aprovados. Ainda pendentes as
validações completas e commit/push.

## 2026-09-16 — Correção de achados do relatório de segurança web

Área assumida: hardening do front/SSR, sem alteração de dados, banco, uploads ou CORS.
Corrigidos: headers do proxy que podiam ser sobrescritos pelo upstream; respostas de erro
do proxy sem headers; rewrites externos da Vercel sem headers; e `API_ORIGIN` HTTP aceito
em produção. O token de acesso já estava somente em memória e os achados de dados públicos,
brute force, upload e R2 pertencem à API/infraestrutura, não foram alterados nesta tarefa.
Validação: typecheck, lint, 31 arquivos/150 testes, build, `git diff --check` e `node scripts/seo-smoke.mjs`
aprovados. Sem commit/push; alterações locais anteriores foram preservadas.


## 2026-09-16 — Muse Spark: chip "Todos os imóveis" + scroll dos filtros concluídos (sem commit)

Corrigidos os dois sintomas do dono, só no front (back autorizado, mas não foi preciso):
chip "Todos os imóveis" com texto invisível e filtros rolando a página ao topo.
Causa do chip: `chipBase` + `chipSelected` empilhavam `bg-transparent` vs `bg-navy` e
`text-muted` vs `text-white` no mesmo elemento — no Tailwind vence a ordem do CSS gerado,
não a do atributo, e o resultado era branco sobre branco. Causa do scroll: `ScrollToTop`
fazia `scrollTo(0,0)` em toda troca de pathname, e filtro de tipo troca o pathname.
Validação: typecheck, lint, 30 arquivos/148 testes, build e seo-smoke aprovados.
Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador.

## 2026-09-15 — Headers defensivos no SSR

Aplicados headers de segurança no SSR e no proxy `/api`: `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`. Nenhum registro,
imóvel ou dado de banco foi alterado. CORS do backend permaneceu intacto.

## 2026-09-15 — CSS inicial antes da hidratação

Corrigido o flash de HTML sem estilos no reload das páginas SSR, observado no `/devs`.
O problema era que Tailwind e `global.css` só eram carregados como imports de
`src/main.tsx`, depois que o bundle React começava a executar. Os stylesheets agora
são declarados no `<head>` do `index.html`; o build de produção continua emitindo
um CSS versionado pelo Vite.

Correções finais da revisão: o tema foi protegido contra o replay de efeitos do
React StrictMode e a rejeição de origem não dispara mais `session-expired`.
Validação completa aprovada; publicação Git autorizada pelo dono.

> Backend integral de 14/09/2026: ver registro ao final e `docs/handoffs/2026-09-14-backend-portugues.md`. A UI atual ainda depende do contrato anterior; não publicar a API nova isoladamente.

Atualizado em: 2026-09-13
Agente responsável: opencode (commit e push `5f916cb` em 13/09/2026, a pedido do dono)
Commit da `main`: `5f916cb` — "feat: mobile vitrine no público, menu navegável e admin afinado"
Repositório irmão: corretor-api, `main` em `a41f49b`

## Em andamento

- Estratégia E2E endurecida em 14/09/2026: navegação mobile usa Tab real, persistência do tema verifica a classe `dark` após reload e escritas Playwright bloqueiam destinos externos sem `E2E_ALLOW_EXTERNAL=true`. A execução autenticada ainda exige credenciais e backend de homologação.

- Tailwind v4 migração total concluída no código (13/09/2026, opencode): `tailwindcss` + `@tailwindcss/vite`,
  `src/styles/tailwind.css` com `@theme` navy/gold + `.dark`, zero `.module.css` restantes (público + admin);
   typecheck, lint, 21 arquivos/98 testes, build e seo-smoke aprovados. Commit `4e928e4` na main.
   Pendente conferir no navegador: catálogo, detalhe, admin, dark e mobile 320–390px.
- UX-003 rebrand concluído e commitado em `71d809b` (13/09/2026, Codex): marca Lucas Gobatto CRECI 15776, Juara/MT,
   navy/gold/branco só no front; typecheck, lint, 18 arquivos/62 testes, build e seo-smoke aprovados.
   SVG/PNG oficial do logo pendente.
- Correção do 404 do painel de locações concluída: o serviço Render `Corretor-API` foi atualizado para `4b9377c`; API direta e proxy Vercel agora respondem `401 Unauthorized` nas rotas protegidas, confirmando que as rotas estão publicadas. A migration de locações já estava aplicada no banco de teste.

- Ambiente de desenvolvimento no ar: front SSR em `http://127.0.0.1:5173` e API em `http://localhost:3000`.
- Pesquisa de deploy (Render e Vercel) iniciada pelo Claude; resultado ainda não incorporado às tarefas.

## Concluído recentemente

- **UX-004 melhorias de front sem back (13/09/2026, opencode).** Conversão mobile (CTA fixo, share,
  mapa), galeria (eager/lazy, `aria-live`), LeadFormModal (`inputMode`, foco no erro), cards com
  fallback, skeletons, breadcrumb com classe, características legíveis, semelhantes, `end` no NavLink
   inicial e retoques do admin. Typecheck, lint, 20 arquivos/68 testes, build e seo-smoke aprovados.
   Commit `71d809b` na main.

- **Catálogo e detalhe público refinados (13/09/2026).** Melhorados hero, busca, estados vazios, cartões, card de
  contato, fatos da área, galeria com navegação por teclado e responsividade, sem alterar a API ou o fluxo de leads.
  Typecheck, lint, testes e build aprovados. A conferência manual do SSR exibiu a indisponibilidade esperada porque
  a API local não estava respondendo.

- **Modo demonstração removido por inteiro (12/09/2026).** Saíram `src/services/demo.ts`, `src/services/demo.test.ts`,
  `.env.demo`, a variável `VITE_DEMO_MODE`, os scripts `dev:demo`/`build:demo`/`preview:demo`, o campo `demo` de
  `SeoConfig`, o Proxy de `api.ts` e todos os ramos de interface (botões de login fictício, faixa de aviso no site,
  sufixo no painel, textos alternativos do formulário de contato). Decisão registrada em `DECISIONS.md`.
- **Identidade centralizada em `src/config/brand.ts` (12/09/2026).** Os 13 pontos que repetiam "Corretor Comercial"
  e "Mato Grosso" passaram a ler do `brand`, incluindo logotipo do cabeçalho, `og:site_name`, JSON-LD e `llms.txt`.
  A renderização final não mudou: foi conferida antes e depois.
- **Verificação após as duas mudanças:** 16 arquivos de teste e 57 testes aprovados (eram 17 e 64 — a diferença é o
  `demo.test.ts` removido); lint, typecheck e build sem erro; `scripts/seo-smoke.mjs` aprovado.

- **Sincronização:** a cópia local estava em `78200ff` e foi atualizada para `d4f6b2f`, que trouxe SSR das páginas
  públicas, metadados com Open Graph e Twitter Cards, JSON-LD, `robots.txt`, `sitemap.xml` e `llms.txt` dinâmicos,
  `vercel.json` com Build Output API v3 e as variáveis `API_ORIGIN`, `SITE_URL` e `SEO_INDEXABLE`.
- **Verificação local:** 17 arquivos de teste com 64 testes aprovados; lint, typecheck e build sem erro.
  O build gera `dist/client`, `dist/server` e `.vercel/output` com a função `render`.
- **Smoke do SSR em modo demo:** catálogo, detalhe de imóvel, `robots.txt`, `sitemap.xml`, `llms.txt`, política de
  privacidade e login responderam 200; rotas inexistentes responderam 404; com a indexação desligada, as páginas
  saem com `noindex` e o sitemap vem vazio, como esperado.
- **Homologação com a API, o Neon e o R2 reais:** login pelo proxy `/api` com cookie de refresh, página SSR de um
  imóvel renderizada com JSON-LD `RealEstateListing`, `BreadcrumbList`, canonical e `og:image` apontando para uma
  imagem real no R2, e lead registrado com consentimento.

## Bloqueios

- A API ainda não está publicada, então o front não tem para onde apontar em produção.
- Plano Hobby da Vercel restringe uso comercial; isso precisa ser resolvido antes de publicar um produto vendido a corretores.
- O SSR busca dados públicos da API com timeout de 10 s por requisição. Se a API ficar em um plano gratuito que
  suspende por inatividade, a primeira visita depois de um tempo parado tende a estourar esse limite e a página
  cai para o estado de indisponibilidade.

## Próximo passo

Concluir a pesquisa de publicação e decidir onde o front será hospedado, considerando a restrição comercial do
plano Hobby e o formato de build atual, que é específico da Vercel (Build Output API v3 com função `nodejs24.x`).

## Arquivos modificados recentemente

Removidos: `src/services/demo.ts`, `src/services/demo.test.ts`, `.env.demo`.
Alterados: `src/config/brand.ts` (reescrito), `src/services/api.ts`, `src/seo/server.tsx`, `src/seo/metadata.ts`,
`src/seo/server.test.ts`, `src/seo/navigation.test.tsx`, `src/pages/admin/Login.tsx`, `src/pages/admin/AdminLayout.tsx`,
`src/pages/admin/Admin.module.css`, `src/pages/public/Catalog.tsx`, `src/pages/public/PrivacyPolicy.tsx`,
`src/components/PublicLayout.tsx`, `src/components/PublicLayout.module.css`, `src/components/LeadFormModal.tsx`,
`src/components/LeadFormModal.module.css`, `scripts/dev.mjs`, `scripts/build.mjs`, `scripts/preview.mjs`,
`scripts/seo-smoke.mjs`, `package.json`, `.env.example`, `DECISIONS.md`, `TASKS.md`, `PROJECT_STATUS.md`, `CHANGELOG_AI.md`.

## Ambiente local

`.env` (não versionado) com `VITE_API_URL=/api`, `API_ORIGIN=http://localhost:3000`,
`SITE_URL=http://127.0.0.1:5173` e `SEO_INDEXABLE=false`. A linha `VITE_DEMO_MODE` foi retirada em 12/09. A `SITE_URL` local foi definida nesta sessão porque
sem ela o SSR não gera canonical nem JSON-LD.

## 2026-09-12 — Codex: administração de locações em implementação

Área assumida: cadastros, contratos e documentos privados (ADMIN). Escopo aprovado em docs/plans/2026-09-12-rental-administration.md. Comissão e financeiro aguardam etapa própria. Alterações preexistentes preservadas; sem commit/push e sem mudança automática do banco real.

Implementação local concluída e pronta para revisão. Front: rotas de proprietários, inquilinos e contratos, fichas, busca/paginação, seletores de imóvel/partes, anexos privados e download autenticado. API: módulo `rentals`, migration aditiva, criptografia de dados privados, validação de arquivos e regras de vínculo. Comissão de captação iniciada: valor equivalente a um aluguel, parcelas configuráveis e confirmação manual ADMIN. Migration do Neon e bucket R2 privado ainda não foram aplicados/configurados. SI9/Imonov permanece fora do escopo.

### Ambiente de teste (2026-09-13)
- Bucket privado R2 criado: \corretor-documentos-test\.
- Deploy Vercel e branch Neon pendentes de reconexão das sessões locais (CLI sem autenticação válida).

- Vercel conectado e primeiro deploy publicado: https://corretor-web-test.vercel.app
- Neon conectado; projeto de teste \
oyal-haze-18985318\ (corretor-db-test), migrations aplicadas.

## 2026-09-13 — Codex: revisão e deploy do front
Área assumida: revisão de UX-003/UX-004, validação e atualização do projeto Vercel corretor-web-test, conforme pedido do dono. Em andamento; alterações preexistentes preservadas.


### Revisão/deploy finalizados — 13/09/2026
Codex concluiu UX-003/UX-004 no ambiente https://corretor-web-test.vercel.app (dpl_8ZTk6bsKwV8xnqye5nUDo6EdcRV4, READY). Typecheck, lint, 68 testes, builds local/remoto e SEO smoke aprovados. Catálogo vazio na API remota; detalhe/modal/CTA conferidos com fixture local. Sem commit/push. Logo oficial, dados de privacidade, homologação autenticada e lançamento comercial continuam pendentes. Este registro substitui o estado em andamento desta revisão e corrige os bloqueios históricos de infraestrutura para o ambiente de teste.


## 2026-09-13 — Codex: URLs em português
Área assumida: rotas do front, compatibilidade e SEO; implementação do plano aprovado em andamento. API sem mudanças de contrato.


## 2026-09-13 — Codex: URLs em português concluídas
Rotas públicas: /imoveis/{tipo}, /imoveis/para-alugar, /imoveis/para-comprar e combinações; query cidade/preco-minimo/preco-maximo/pagina. Painel: /admin/entrar e /admin/contatos. URLs antigas redirecionam 301; navegador usa replace; slugs e APIs preservados.
Publicação Vercel dpl_Bbf5617bGJdqKv79WJbuDDFJaP1M READY, alias https://corretor-web-test.vercel.app. SITE_URL e SEO_INDEXABLE configuradas em Production conforme autorização. Robots, llms e sitemap respondem 200; raiz index,follow; filtros noindex,follow; painel noindex,nofollow. Sitemap contém início e privacidade (catálogo público sem imóveis no momento).
Validação: typecheck, lint, build, suíte de 93 testes e teste adicional de navegação aprovado (94 no total coberto); smoke SSR/proxy/discovery aprovado. Navegador: redirecionamento, paginação e detalhe com fixture local; catálogo filtrado publicado confirmado. Login autenticado/logout e fichas reais não exercitados no navegador nesta sessão; permissões existentes cobertas pela suíte. Sem commit/push.


## 2026-09-13 — Preparação de commit e push autorizada
Codex: revisão do diff concluída; typecheck, lint, 21 arquivos/94 testes, build e smoke de SEO aprovados novamente. Front: código e documentação das URLs; API: somente documentação correspondente. Alterações anteriores da API em .env.example e .gitignore excluídas do commit.


## 2026-09-13 — Codex: investigação de upload de mídia
Logs do Render para o POST de mídia registram `write EPROTO ... SSL alert handshake failure` no processo da API. O proxy SSR repassa o multipart corretamente (`request.pipe(upstream)`), e o erro ocorre no salto API → R2 antes de salvar metadados. Hipótese confirmada como configuração/endpoint TLS do R2 no ambiente Render; não há evidência de bug no formulário ou no proxy. Pendente corrigir `R2_ENDPOINT` no serviço Render para o endpoint S3 HTTPS da conta Cloudflare (sem bucket no caminho), então repetir upload.
Área assumida: erro HTTP 500 ao enviar mídia no ambiente corretor-web-test; rastrear proxy, API e R2. Em andamento (opencode, 13/09/2026, 15h42: token corrigido — saiu `AccessDenied`, agora `NoSuchBucket` no `PutObject` do bucket hardcoded `corretor-midia` em `media.service.ts:48`; falta criar o bucket de mídia na conta de teste).


## 2026-09-13 — opencode: hambúrguer só no mobile (commit `2d0d8ac`)
Área assumida: botão hambúrguer aparecendo no desktop junto da navegação. Causa no `PublicLayout.module.css`: `.menuToggle{display:none}` empatava com `.buttonGhost{display:inline-flex}` do global. Fix com `button.menuToggle` (maior especificidade) no desktop e no `@media(max-width:650px)`. Typecheck, lint e 21 arquivos/98 testes aprovados. Commit `2d0d8ac` na main. Pendente conferir no navegador: desktop >650px sem botão, mobile ≤650px com botão.

## 2026-09-13 — opencode: mobile público com direção vitrine (plano commitado em `5f916cb`)

Área assumida: `docs/plans/2026-09-13-mobile-public.md` — tese ponto comercial Juara/MT, tokens navy/gold existentes, assinatura soleira dourada + placa de rua, wireframes 360px, P0/P1 com visual + P2 microcopy, validação 320–390px sem scroll-X e toques ≥44px. Plano e implementação commitados em `5f916cb`.

## 2026-09-13 — opencode: menu mobile não abria (corrigido, commit `5f916cb`)
Causa: `max-[650px]:hidden` + `max-[650px]:flex` aplicados juntos no `<nav>` — no CSS gerado o `hidden` vence o `flex`, então o menu nunca aparecia. Fix: classes mutuamente exclusivas + teste de regressão das classes. Conferido em 390px com dados reais: sheet navy abre com as 4 opções + CRECI. Typecheck, lint e testes do menu/navegação aprovados. Commit `5f916cb` na main.

## 2026-09-13 — opencode: mobile do admin (implementado, commit `5f916cb`)
Área assumida: mesmo padrão do público, agora no painel (`AdminLayout`, login, dashboard, listas, formulário, mídias, locações); sem `any`/dependência nova. Typecheck, lint, 21 arquivos/98 testes e build aprovados. Commit `5f916cb` na main. Pendente conferir no navegador 320–390px com login: navegação lateral, cabeçalhos, tabelas, filtros, formulário, mídias e fichas de locação.

## 2026-09-13 — opencode: mobile público vitrine (implementado, commit `5f916cb`)
Área assumida: `docs/plans/2026-09-13-mobile-public.md` — só público (header, catálogo, detalhe, galeria, busca, modal lead); admin fora. Base atual usa Tailwind (sem `.module.css`), então o plano foi aplicado como utilities, sem `any`/`fetch` direto/dependência nova. Typecheck, lint, 21 arquivos/98 testes, build e seo-smoke aprovados. Commit `5f916cb` na main. Pendente conferir no navegador 320–390px: menu, hero sem scroll-X, busca 1 coluna, CTA sticky navy único, galeria com snap, modal lead e toques ≥44px.

## 2026-09-13 — opencode: header do admin afinado no mobile (commit `5f916cb`)
Área assumida: `AdminLayout` — topo navy ocupava altura demais no mobile (print do dono).
Fix só com utilities: `aside` com `py-2.5/gap-2`, marca `16px/leading-tight`, nav sem `pb`
e links `min-h-10/text-14`, linha do usuário sem `mt-auto` no mobile e botão sair `min-h-9`.
Desktop (`lg:`) preservado. Typecheck, lint e teste do AdminLayout aprovados.
Commit `5f916cb` na main. Pendente conferir no navegador 320–390px.

## 2026-09-13 — opencode: avatar do usuário + modo noturno visível (implementado, sem commit)

Área assumida: a pedido do dono — avatar não aparecia e o modo noturno não tinha onde ser ligado.
`AdminLayout` exibe `avatarUrl` (fallback inicial); desktop mantém o bloco no rodapé do `aside`,
mobile mostra a foto no topo com dropdown (nome, papel, "Sair da conta", fecha em Escape/clique
fora). `useTheme` novo persiste `localStorage "theme"`, respeita `prefers-color-scheme` e aplica
`.dark`; alternador no header público e no painel + script anti-flash no `index.html`.
Typecheck, lint, 22 arquivos/104 testes e build aprovados. Sem commit/push (aguardando confirmação
do dono). Pendente conferir no navegador: dropdown 320–390px com login, dark no público e no admin.

## 2026-09-13 — opencode: perfil do admin + senha (implementado, sem commit)

Área assumida e concluída: `/admin/perfil` (foto grande, dados, métricas por status, edição própria),
troca da própria senha, reset de senha pelo ADMIN e filtro `status` no gerenciado da API.
Escopo autorizado pelo dono em 13/09/2026, incluindo back (repositório irmão).
E-mail só via Corretores/ADMIN, nunca no perfil.
Typecheck, lint, 24 arquivos/109 testes, build e seo-smoke aprovados.
Commit `31ee9bc` na main (inclui o trabalho pendente de avatar + modo noturno, `useTheme` e ajustes do
`PublicLayout`/`AdminLayout`, que estavam sem commit). Push `3f9f53f..31ee9bc main -> main`.
Pendente conferir no navegador com login: perfil 320–390px e desktop, avatar quebrado, edição,
troca de senha invalidando a antiga e reset pelo ADMIN.

## 2026-09-13 — opencode: capa no catálogo + decode no upload (commit `376219d`)
Área assumida: capa some no catálogo embora apareça no detalhe, mais o erro inglês "The source image could not be decoded." no formulário. Causa da capa na API (`PropertiesService.list()` sem `media`; corrigido no repositório irmão). Front: `prepareMediaFiles` agora pula arquivo ilegível com aviso em PT e mantém os válidos no lote; `MediaManager` exibe quais foram pulados e só envia quando há algo válido. Typecheck, lint, 21 arquivos/98 testes, build e seo-smoke aprovados. Commit `376219d` na main. Pendente conferir com a API no ar: catálogo com capa, upload misto (válido + corrompido) e redeploy da API no Render.


## 2026-09-13 — Codex: contrato da nova API em acompanhamento
Refatoração integral autorizada no repositório irmão; documentação compartilhada sob responsabilidade do Codex principal. Novo contrato português exige adaptação futura do front antes da publicação conjunta; esta tarefa implementa backend. Alteração preexistente .vscode/ preservada.

## 2026-09-14 — opencode: hamburger fora do desktop (commit `6c99b3c`)
Área assumida: a pedido do dono — botão hamburger aparecia no desktop. Causa: `buttonGhost` do `global.css` empatava com o `hidden` do Tailwind. Fix: botão só com utilities (`hidden` + `max-[650px]:inline-flex`). Typecheck, lint, 24 arquivos/109 testes aprovados. Commit `6c99b3c` na main. Pendente conferir no navegador >650px e ≤650px.

## 2026-09-14 — Codex: documentação do backend integral concluída

Sincronizados corretor-spec.json (histórico preservado), plano de projeto, AGENTS, decisões, tarefas e handoff docs/handoffs/2026-09-14-backend-portugues.md. API nova validada: typecheck/lint/build, 169 testes locais e 4 PostgreSQL/HTTP reais aprovados. Nenhum código frontend alterado, nenhum deploy/commit/push; pasta .vscode/ preexistente preservada.

A aplicação atual continua usando o contrato antigo. Próximo passo é API-PT-002: adaptar serviços, autenticação, classificações, clientes, contratos/Drive e financeiro/SSR antes da publicação conjunta. Homologação real de Drive/R2 e corte do banco ainda pendentes. Nenhum teste de UI executado por esta entrega documental.

## 14/09/2026 — frontend do modelo português em execução
Codex concluiu API-PT-002: painel, serviços, SSR, classificações dinâmicas, mídia, clientes, contratos e comissões integrados ao contrato português. Drive externo será configurado pelo dono. Plano: docs/plans/2026-09-14-frontend-portugues.md. Typecheck, lint, build e smoke SSR passaram; suíte completa teve 120 testes passando e dois erros transitórios de worker/jsdom no Windows na última execução.


## 2026-09-14 — Codex: contraste em execução
Área assumida: estilos compartilhados, textos e botões nos temas claro/escuro. Sem alteração de contrato ou publicação.


## 2026-09-14 — Codex: contraste concluído
Corrigida a cascata entre estilos globais e Tailwind, com tokens de ação para botões, textos adaptáveis ao tema e contraste em superfícies navy e cartões sem foto. Margens do container preservadas. Typecheck, lint, 125 testes, build e smoke SSR/Vercel aprovados. Catálogo/login/detalhe conferidos nos dois temas; mobile 390px sem overflow. Painel autenticado pendente de conferência visual; estilos compartilhados aplicados. Sem commit/deploy.

## 2026-09-14 — Codex: posição do alternador em execução
Cabeçalho público: agrupar navegação e tema à direita, preservando menu mobile e correções de contraste.


## 2026-09-14 — Codex: alternador público reposicionado
Concluído: navegação e tema agrupados à direita; 16px após Área do corretor no desktop, 8px entre tema/menu mobile. Cabeçalho compacto em telas intermediárias. Typecheck, lint e 125 testes aprovados. Navegador: 390/768/1280px nos dois temas, sem overflow; botão 44x44, menu/Escape e alternância por teclado confirmados. Sem commit/deploy.


## 2026-09-14 — Codex: publicação Git autorizada
Dono solicitou commit e push das correções de contraste e cabeçalho na main. Revisão preserva texto navy no CTA dourado do detalhe (PropertyDetail sem diff final) e corrige formatação histórica em DECISIONS. .vscode fora do commit. Validação final aprovada: typecheck, lint, 27 arquivos/125 testes e build; diff --check limpo. Commit/push autorizados na main; sem deploy manual.

## 2026-09-14 — Codex: estratégia de testes E2E em execução
Área assumida: Playwright Test no front + lacunas Vitest (contrato PT, sessão, comissões). Base: 27 arquivos/125 testes Vitest; API 26 suítes/169 + 4 integração homologacao_pt. Decisões do dono: HTTPS local autoassinado (cookie Secure), banco homologacao_pt existente, Playwright só em corretor-web. Sem commit/push/deploy sem autorização; .vscode/ preservada; sem dados reais.

## 2026-09-14 — Codex: estratégia de testes E2E concluída (sem commit)
Infra (`playwright.config.ts`, `tests/e2e/` com 11 specs, README, scripts `test:e2e*`) + Vitest (28 arquivos/136 testes). Validação: typecheck, lint, build, seo-smoke (portas alternativas) e Playwright 2x — 19 aprovados, 17 não executados (sem E2E_ADMIN_*/E2E_CORRETOR_*), 0 falhas. Servidores da sessão parados; estado de chegada restaurado. Bloqueio exato: credenciais de teste + confirmação do banco da API para os fluxos autenticados; HTTPS local para sessão pós-reload; homologação real do Drive. Detalhes em CHANGELOG_AI.md e DECISIONS.md. Sem commit/push/deploy.

## 2026-09-15 — Codex: rigor do E2E após revisão do dono (sem commit)
Corrigidos os 6 pontos: falso positivo do `http.test.ts`, SSR comprovado no HTML bruto + sem JS, imagem com carga real + persistência via API, tema comparado após reload + teclado só Tab/Enter, TLS autoassinado no fetch Node, trava anti-produção + `E2E_STACK=teste` + limpeza completa com status. Achado: `.env` local aponta à API de produção (só leituras atingiram produção; nenhuma escrita). Suíte: 37 testes/11 arquivos — 15 aprovados, 22 não executados (stack de teste + credenciais pendentes), 0 falhas. Servidores parados. Sem commit/push/deploy.

## 2026-09-15 — Codex: limpeza parcial + allowlist (sem commit)
Seed movido para dentro do `try` com IDs opcionais (comissão, contrato, lead, mídia, CRUD, catálogo): falha no meio do seed limpa o parcial, sem dado abandonado. Bypass `E2E_ALLOW_REMOTE`/`E2E_ALLOW_EXTERNAL` removido e unificado em `E2E_DOMINIOS_PERMITIDOS` (config importa a trava de `helpers/env`): remoto não listado aborta no carregamento (comprovado), domínio listado carrega. Validação: typecheck, lint, Vitest 136, Playwright 15/22/0. Preview parado. Sem commit.

## 2026-09-15 — Muse Spark: página /devs em execução
Área assumida: rota pública `/devs` com Eduardo Gobatto (@e.gobatto) e Fernando Riad (@_riad777), fotos dos avatares GitHub, links Instagram em nova aba, papel "Front-end e back-end" para os dois. Escopo: `src/config/devs.ts` + `src/pages/public/Devs.tsx`, rota cliente + SSR + metadados + sitemap + `llms.txt`, link só no rodapé, indexável. Sem commit/push sem confirmação do dono.

## 2026-09-15 — Muse Spark: página /devs concluída (sem commit)
Implementado e validado: typecheck, lint, 29 arquivos/139 testes, build e seo-smoke aprovados. Bundle SSR contém `/devs` (rota, título, sitemap, llms). Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador: `/devs` mobile/desktop nos dois temas + cliques nos Instagrams.

## 2026-09-15 — Muse Spark: header público fixo concluído (sem commit)
Link "Desenvolvedores" já existia no rodapé (confirmado no HTML servido); adicionada cobertura de teste para ele. Header do site público agora `sticky top-0 z-40`, sempre visível, só CSS, sem JS; painel admin inalterado. Validado: typecheck, lint, 29 arquivos/140 testes, build; preview em `127.0.0.1:4173` servindo o HTML com o header fixo. Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador com rolagem: menu mobile, CTA do detalhe e ambos os temas.

## 2026-09-15 — Muse Spark: commit e push `14aa53a` (página /devs + header fixo)
Commit e push direto na `main` a pedido do dono: 15 arquivos (`/devs` completa + header sticky + cobertura + `seo-smoke` + contexto). Push `15b6071..14aa53a main -> main`, `.vscode/` fora do commit. Pendente conferir no navegador com rolagem: `/devs`, menu mobile, CTA do detalhe, ambos os temas.

## 2026-09-15 — Muse Spark: refinamentos do /devs + header concluídos (sem commit)
Pacote 1–5 aplicado e validado: avatares locais em `public/assets`, links GitHub nos cards, `h1` com `clamp(32px,8vw,44px)`, logo/controles com `z-[6]` acima do backdrop e `container` + `div` interno `max-w-[800px]`. Typecheck, lint, 29 arquivos/141 testes, build e seo-smoke aprovados; `/devs` 200 conferido no HTML servido (avatares locais, GitHub, sem hotlink, sticky, clamp, imagem 200). Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador `/devs` 320–390px e desktop nos dois temas.

## 2026-09-15 — Muse Spark: privacidade + 403 do renovar concluídos (sem commit)
`/privacidade` com `container` + `div` interno `max-w-[800px]` e `h1` com clamp (mesmo padrão do `/devs`, pendência anterior eliminada). 403 do renovar diagnosticado: preview contra a API de produção + origem fora do `ALLOWED_ORIGINS` (`OrigemGuard`, comprovado via proxy); front agora relata a causa com verdade em vez de "sessão expirou" (limpeza mantida). Typecheck, lint, 29 arquivos/142 testes, build e seo-smoke aprovados; `/privacidade` 200 conferido no HTML servido. Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador `/privacidade` 320–390px e desktop nos dois temas; sessão no preview contra produção segue 403 por desenho.

## 2026-09-15 — Muse Spark: 404 de assets no preview diagnosticado e resolvido
Sintoma do dono: `GET /assets/index-DI-c97Mf.js 404` (+ css) na porta 4173, "dev não acha nada". Causa: preview antigo órfão (PID 85268, de sessão anterior de agente) servindo `index.html` antigo da memória com hashes de build anterior; cada `npm run build` apaga os hashes antigos do `dist`, daí o 404. O `dev` escuta na 5173 — aba presa na 4173 nunca veria o dev. Correção: processo antigo morto; preview novo na 4173 (`/` 200, js/css atuais 200) e `dev` na 5173 (`/` 200 com `<h1>`) conferidos e parados. Ação do dono: hard refresh (Ctrl+Shift+R) na aba da 4173 e usar a porta certa (dev 5173, preview 4173).

## 2026-09-15 — Muse Spark: hidratação do tema corrigida (sem commit)
Área assumida: `Hydration failed` + `Expected server HTML to contain a matching <circle> in <svg>` no `dev` (porta 5173). Causa no `useTheme`: o SSR sempre renderiza `light` (sem `window`), mas o primeiro render do cliente lia `localStorage`/`prefers-color-scheme` no `useState` e pintava `Sun` (com `<circle>`) contra a `Moon` do servidor — mesma divergência no `aria-label`. O React descartava o HTML do SSR e caía para renderização só no cliente. Fix: estado inicial sempre `light` (igual ao servidor), preferência salva aplicada em efeito único que não remove a classe `.dark` do script anti-flash no primeiro mount; persistência e `localStorage "theme"` + `.dark` inalterados. Teste de regressão em `useTheme.test.ts` (primeiro render `light` com `dark` salvo). Validado: typecheck, lint, 29 arquivos/143 testes, build e seo-smoke aprovados. Sem commit/push (aguardando confirmação do dono). Pendente conferir no navegador com `theme=dark` salvo: sem erro de hidratação no console, ícone Sol após carregar, alternância e persistência nos dois temas.
## 2026-09-15 — Documentação, SEO comercial e guarda de ambiente

Implementada a correção documental do README/AGENTS: scripts e variáveis refletem o runtime atual, com endereços
127.0.0.1 e sem modo demonstração. `/devs` permanece acessível, mas sempre usa `noindex,follow` e foi removido de
`sitemap.xml` e `llms.txt`. `dev` e `preview` agora recusam `API_ORIGIN` remoto por padrão por meio de
`scripts/safe-origin.mjs`, sem imprimir credenciais. UX-001 cold start foi marcada como adiada pelo proprietário.

Pendente nesta entrega: a remoção completa de `.buttonGhost` não foi feita porque ainda existem consumidores no
painel administrativo; a migração deve ser uma tarefa visual isolada para evitar regressões.
## 2026-09-16 — Codex: retomada do pacote completo

Área assumida nesta retomada: Codex integra catálogo/rodapé/SEO e documentação; agentes independentes
atuam em Dashboard, contatos/CSV, detalhe/lead e duplicação/guarda de navegação. Estado inicial: alterações
parciais da execução anterior preservadas; main. Sem escrita em banco nem publicação. Validação final em andamento.

## 2026-09-16 — Codex: pacote de melhorias públicas e painel em execução

Implementadas melhorias de formatação de preço, total mensal de locação, preço/m², selos de status,
relacionados por finalidade/cidade com fallback, mapa embed lazy, máscara/honeypot de leads, OG dimensions,
filtros de período/ imóvel e CSV de contatos, KPIs administrativos baseados nos endpoints existentes e
dirty guard do formulário de imóvel. Ordenação de catálogo, logo oficial, dados reais de privacidade, datalist
e duplicação completa ainda dependem de ajustes/insumos pendentes.

Validação desta etapa: typecheck aprovado; lint aprovado após correção; Vitest 31 arquivos/155 testes aprovado;
build aprovado; seo-smoke aprovado. Ainda pendente conferência manual e validação E2E autenticada com stack/credenciais.


## 2026-09-16 — Codex: pacote público/painel concluído em código

Concluídos os pendentes da execução anterior: datalist, rodapé configurável, duplicação/preview, guarda SPA/histórico,
mensagem expansível e 404. Corrigidos KPIs paginados, CSV seguro, datas inclusivas, dimensões OG de imagens desconhecidas,
telefone internacional e detalhes visuais nos dois temas. Plano/checklist: docs/plans/2026-09-16-melhorias-publico-painel.md.
Dados reais de marca/privacidade e contato recebidos do proprietário e registrados em `src/config/brand.ts`; logo oficial copiado para `public/assets/brand-logo.jpg`.
Homologação autenticada real aguarda stack/credenciais de teste. Nenhuma alteração de backend ou de dados reais.
## 2026-09-17 — Regressão de XSS no JSON-LD coberta

Confirmada a proteção existente em `src/seo/metadata.ts`: `serialize()` escapa caracteres de controle do contexto HTML antes de renderizar o JSON-LD. Adicionado teste com `<svg/onload>`, `<script>` e `</script><script>` verificando parse válido, preservação do texto e impossibilidade de fechar a tag SSR. Meta tags continuam cobertas por `escapeHtml()`.

Validação desta tarefa: teste direcionado aprovado; validação completa registrada no `CHANGELOG_AI.md`. Sem alteração de dados, API, banco, migrations, uploads ou rate limiting.
# 2026-10-03 — Codex: dev SSR acessível pela rede local

O servidor `npm run dev` agora escuta em `0.0.0.0` por padrão, permitindo conferir o frontend em celular na mesma rede Wi-Fi. O host pode ser sobrescrito por `HOST`.
Servidor local iniciado nesta sessão em `http://0.0.0.0:5173`; endereço de acesso no Wi-Fi: `http://192.168.0.20:5173`.

## 2026-10-03 — Codex: refinamento do frontend concluído localmente


## 2026-10-05 — Codex: refinamento da Área do Corretor em andamento

Plano autorizado em conversa: seções abertas, ícones/tooltips por foco e mouse, inputs numéricos, fichas de consulta em modal, contratos clicáveis e atalhos com menu de comandos. Esc trata uma sobreposição por vez; edição pendente no modal exige dois Esc consecutivos. Codex integra base/layout/QA; agentes fichas e numeros trabalham em arquivos distintos, QA prepara verificação efêmera. Somente frontend na main, sem novos testes fonte, dependências, API/dados, commit, push ou deploy.


## 2026-10-05 — Codex: Área do Corretor concluída localmente

Implementado o plano autorizado: seções abertas, ícones/tooltips em foco e hover, inputs refinados/numéricos, fichas de consulta em modal, contratos clicáveis e atalhos com menu Ctrl/Command+K. Modal alterado exige dois Esc consecutivos após tratar tooltip/seleção; outra interação desarma, ocupado bloqueia. Guarda de edição de imóvel preservada e perfil/senha protegidos.

Typecheck/lint/build/smoke SSR/diff-check aprovados; 21/21 testes da suíte mínima atual. QA final Chrome com API simulada: 28/28 checks, 72 capturas, 390/768/1440 claro/escuro. Revisão independente realizada e achados corrigidos; sem erros JS, overflow ou falhas de alvos/fonte observados. Ver CHANGELOG_AI para comandos/cobertura. QA próprio encerrado.

Pendentes somente homologação em serviços reais e Safari/iOS/dispositivo físico. Sem dependências novas, API/dados/migration ou publicação; histórico dos documentos preservado e trabalho preexistente da API intocado.

## 2026-10-06 — Área do Corretor: clareza, conforto e elegância concluídos localmente

Sidebar com nomes e bases douradas, textos 18/16/20px, ações arredondadas com ícone/texto, campos outlined e contatos em blocos suaves. Cabeçalhos e Responder contatos alinhados; tabelas com espaçamento e limiar mobile antecipado. Funcionalidades anteriores preservadas.

Validação desta revisão: npm run typecheck, npm run lint, 21/21 testes existentes (3 arquivos), npm run build, node scripts/seo-smoke.mjs e git diff --check aprovados. Build com avisos conhecidos de annotations da dependência Zod; sem falha. Chrome com API simulada: 28 cenários aprovados no resultado consolidado; primeira execução final 27/28 e um timeout de estabilidade ao clicar em Editar, repetido isoladamente e aprovado. Seis matrizes de layout e 72 capturas das dez telas e dois modais em 390/768/1440 nos temas claro/escuro, sem overflow, campos abaixo de 18px ou alvos de AcaoIcone abaixo de 48px. Conferidos título 20px, token dourado e sidebar 260px. Evidências ignoradas em artifacts/refino-conforto/resultados-consolidados.json; nenhum teste fonte ampliado.

Inspeção de capturas de Contatos, Visão geral, Imóveis, Contratos e formulários/modais verificou legibilidade, alinhamento, quebra, foco e aparência. Regressão cobre tooltips/aria/Tab/ShiftTab/hover/Esc, modais intactos/alterados/valores restaurados/desarme/ocupado/sobreposição, fichas/retry/404/foco, contratos e controles internos, campos numéricos, atalhos e ADMIN/CORRETOR. As primeiras medições intermediárias de cor foram corrigidas para ler o token durante animação de hover; uma execução intermediária com preview anterior ao rebuild foi descartada após reiniciar o preview. Resultados finais acima são do build atualizado.

Validação simulada não homologa API/banco/Drive/R2 reais, Safari/iOS ou dispositivo físico. Site público preservado pelo escopo de CSS; smoke SSR público aprovado. Sem novas dependências, API/dados/migrations, commit/push/deploy. Os cinco documentos foram atualizados por acréscimo, mantendo o histórico. Preview QA próprio encerrado ao finalizar; desenvolvimento existente em localhost:5173 permanece disponível ao dono.

## 2026-10-06 — Refatoração da Área do Corretor revertida pelo dono

Pedido explícito: “reverta tudo, e me dê um plano e um resumo do que foi pedido”. Revertidas integralmente as duas etapas desta conversa: mudanças visuais, sidebar, fontes, botões/inputs, tooltips centralizados, entradas numéricas, fichas em modal, contratos clicáveis, atalhos e fechamento com dois Esc. Arquivos fonte rastreados restaurados ao estado anterior da refatoração; cinco componentes/hooks novos retirados do código ativo. API, banco, dependências e trabalho anterior preservados. Nenhum commit, push ou deploy.

Os registros de implementação/validação de 05 e 06/10 acima são históricos e NÃO descrevem o produto atual. As orientações específicas dessa refatoração ficam canceladas como instruções de implementação vigente. O novo documento PLANO-AREA-CORRETOR.md contém apenas o pedido consolidado e a proposta de execução futura; não autoriza reimplementar. Preservar o restante das orientações do repositório. Backup local ignorado em artifacts/reversao-area-corretor-2026-10-06.

Verificação da reversão: todos os arquivos rastreados de src comparados por hash ao HEAD, sem diferenças; componentes novos ausentes e referências removidas. npm run build e node scripts/seo-smoke.mjs aprovados após a reversão, assim como git diff --check. A suíte de testes não foi repetida nesta reversão. Plano entregue em docs/PLANO-AREA-CORRETOR.md.

## 2026-10-06 — Codex: retomada da Área do Corretor, primeiro checkpoint

Pedido atual do dono: implementar o plano proposto a partir do commit a2a9f81 do parceiro.
Área assumida por Codex: base compartilhada e Contatos; revisão visual de Contatos é o primeiro
marco antes de propagar às telas restantes, conforme a especificação de 06/10. Pessoas e a base
visual do parceiro permanecem como referência. Histórico e alterações locais preservados.
Somente frontend na main, sem novas dependências, API/dados reais/migration ou publicação.
Validação prevista: verificações efêmeras com API simulada, typecheck, lint, 21 testes existentes,
build e smoke SSR. O restante do plano inclui fichas próprias, padronização, números e teclado.

## 2026-10-09 — Codex: contorno de foco após Esc

Implementado o plano autorizado: `data-foco-navegacao` no main do painel e no h1 de Desenvolvedores; `[data-foco-navegacao]:focus { outline: none; }` em global.css. Preservados tabIndex, foco programático, Pular para o conteúdo, retorno do foco e regras de Esc. A marcação é exclusiva de destinos não interativos; não aplicar a todos os elementos com tabindex=-1 nem remover o foco visível de controles.

Validação: typecheck, lint, build e testes existentes aprovados (3 arquivos, 23 testes). QA efêmero Chrome com API simulada: 19 verificações aprovadas, incluindo reprodução da borda de 3px com a nova regra removida via CSSOM, Visão geral/Imóveis/Contratos/Devs nos dois temas, Tab em link/botão/input, filtro, menu mobile, diálogo intacto com retorno do foco e diálogo alterado com dois Esc. Capturas e resultados ignorados em artifacts/esc-foco-2026-10-09. Sem erros JavaScript nos cenários concluídos. Primeiro QA usou rótulo inexistente Abrir menu; corrigido para Menu. Reinícios do navegador foram necessários antes da rodada final completa.

O smoke original scripts/seo-smoke.mjs falhou na expectativa antiga do h1 Imóveis comerciais; a tela atual usa Imóveis para alugar e comprar. Cópia efêmera com apenas essa expectativa e caminhos de import ajustados passou: SSR, metadados, paginação, 404, discovery, proxy/cookies, função Vercel gerada e indisponibilidade/recuperação 503. O script original foi preservado; sua expectativa continua pendente de atualização fora deste escopo. Build emitiu avisos de anotação PURE do Zod e chunk maior que 500 kB, sem impedir conclusão.

Entrega local concluída; alterações preexistentes preservadas. Sem novas suítes, dependências, API, banco, commit, push ou deploy por esta tarefa. QA simulado não equivale a homologação real nem validação em Safari/iOS.

2026-10-09 — Atualização: dono autorizou commit e push da correção de foco e destes registros na main. Validações da entrega acima permanecem aplicáveis; publicação no Git não confirma deploy.


---

## Arquivo original: README.md

# Corretor Comercial

> **Integração portuguesa — 14/09/2026:** serviços, autenticação, SSR, classificações, clientes, mídia, contratos no Drive e comissões já usam o contrato novo da API irmã. A configuração externa do Drive e a migração do banco real continuam operacionais antes da publicação conjunta. Consulte a [entrega e migração](docs/handoffs/2026-09-14-backend-portugues.md).

Interface editorial para imóveis comerciais, com catálogo público, detalhe de imóvel, captação de contatos e painel administrativo. O front é um repositório separado da API NestJS em `../Corretor-API`.

## Stack

- **Framework:** React 18 + TypeScript
- **Build tool:** Vite
- **Deploy:** build Node/SSR próprio; a plataforma comercial ainda será decidida

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

# Configure as variáveis de ambiente copiando `.env.example` para `.env` com a ferramenta do seu sistema
# Em desenvolvimento, API_ORIGIN aponta para http://localhost:3000

# Inicie em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://127.0.0.1:5173`.

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
```

O servidor SSR encaminha `/api/*` em streaming para `API_ORIGIN`, removendo `/api` e preservando métodos, corpo e cookies. A API NestJS não possui prefixo `/api`. Use `VITE_API_URL=/api` no navegador; consultas SSR usam um cliente separado, sem cookies, tokens ou renovação de sessão. Em desenvolvimento e preview, `API_ORIGIN` deve apontar para localhost ou loopback; origens remotas são recusadas para proteger dados reais.

> Nunca suba o `.env` para o repositório. Ele já está no `.gitignore`.

## Scripts disponíveis

```bash
npm run dev       # Desenvolvimento com hot reload
npm run build     # Compila para produção
npm run preview   # Visualiza o build de produção localmente
npm run lint      # Verifica o código
npm run typecheck # Verifica os tipos
npm test          # Executa os testes unitários
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
- `/sitemap.xml`: consulta todas as páginas da API pública, em lotes de 100 com até seis consultas simultâneas, sem anúncios administrativos. Inclui home, privacidade e imóveis disponíveis; `/devs` permanece fora do sitemap comercial.
- `/robots.txt`: aponta para o sitemap e bloqueia `/api` quando a indexação está habilitada. O painel não é bloqueado por robots para que o robô consiga ler seu `noindex`; autenticação continua sendo a proteção de acesso.
- `/llms.txt`: resumo público e links úteis, sem expor a rota discreta `/devs`. É complementar e não garante posicionamento ou presença em respostas de IA.
- Catálogo paginado sem filtros: canonical próprio e links navegáveis. Filtros: `noindex,follow`, canonical normalizado e exclusão do sitemap. Parâmetros de rastreamento não entram no canonical.
- Imóvel inexistente ou rota desconhecida: HTTP 404. API indisponível: HTTP 503. Erros e painel não recebem cache. Respostas públicas indexáveis usam cache de CDN por 300 segundos, sem cache no navegador.

Não há pesquisa de volume de buscas nem meta keywords: o foco é conteúdo útil por tipo, finalidade e localização real de cada imóvel. O desenho do site é preservado com ajustes de texto e breadcrumbs.

## Publicação

O build gera `dist/client`, `dist/server` e `.vercel/output` para o runtime SSR. A plataforma comercial ainda precisa ser escolhida antes do lançamento; o plano Hobby da Vercel não é considerado suficiente para um produto vendido a corretores.

1. Configure Node.js **24.x**, instalação `npm ci` e build `npm run build`.
2. Defina `API_ORIGIN` no build e no runtime com a origem HTTPS da API (sem `/api` ou outros caminhos) e mantenha `VITE_API_URL=/api`. Configure no backend o domínio do front como origem permitida e cookies compatíveis com o proxy. O proxy não reescreve o atributo `Domain` de cookies. Na Vercel, os uploads seguem diretamente para o backend por rewrite, sem passar pela função SSR. Alterar `API_ORIGIN` exige novo build.
3. Defina `SITE_URL` com o domínio HTTPS oficial, sem caminho. Enquanto o domínio não estiver definido, deixe `SEO_INDEXABLE=false`.
4. Quando domínio e API estiverem prontos, defina `SEO_INDEXABLE=true` **somente em Production** e publique. A ativação exige origens HTTPS válidas. Preview e desenvolvimento permanecem sem indexação.
5. Confira `/`, um anúncio, `/robots.txt`, `/sitemap.xml`, `/llms.txt` e `/admin/login` no domínio publicado. O HTML deve conter conteúdo e metadados antes de executar JavaScript.
6. Verifique a propriedade do domínio no Google Search Console, envie `sitemap.xml` e inspecione a home e um anúncio. Acompanhe indexação, erros 404/503 e Core Web Vitals; a implementação não garante indexação ou ranking.

Com indexação desativada, as páginas entregam `noindex`, robots bloqueia o rastreamento e o sitemap fica vazio. `/devs` sempre entrega `noindex,follow`, mesmo em Production.

### Saídas e comandos

```bash
npm run dev          # SSR e HMR em http://127.0.0.1:5173
npm run build       # dist/client, dist/server e .vercel/output
npm run preview     # Servidor do build em http://127.0.0.1:4173
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

## Refinamentos locais de 06/10/2026

Contatos usa abas; perfil aceita upload e URL; filtros existentes atualizam automaticamente. Leia
[o registro do refinamento](2026-10-06-refinamentos-sistema.md) e [o System Design](2026-10-06-system-design.docx).
Para executar: `npm ci`, `npm run dev` no frontend e `npm run start:dev` na API irmã configurada.
Acesse http://127.0.0.1:5173; entre com conta real já cadastrada, sem conta/senha de demonstração criada
por esta entrega. O backend atualizado é necessário para o upload e a leitura de fotos gerenciadas.
As evidências simuladas não homologam gravação de perfil no banco real.

## Navegação por teclado

- **Esc volta**: em qualquer tela pública fora do catálogo (detalhe do imóvel, Privacidade, Devs, 404) e
  no login, Esc leva à tela inicial. No painel, Esc volta à página anterior (sem histórico: lista da seção,
  depois Visão geral).
- Esc fecha antes diálogos, menu, dicas e filtros abertos, e é ignorado enquanto o foco está num campo
  de texto. Regras em `src/hooks/useEscVoltar.ts`; detalhes em [DECISIONS.md](DECISIONS.md).
- O retorno visual é sempre o `BotaoVoltar` (seta em círculo no topo da tela).


---

## Arquivo original: revisor-design.md

---
name: revisor-design
description: Revisa telas do corretor-web (site público e painel) com prints reais em várias larguras e nos dois temas, contra as regras de marca, acessibilidade e SSR do projeto. Use depois de qualquer mudança visual ou quando o dono apontar uma tela com problema. Não edita código.
tools: Bash, Read, Grep, Glob
---

Você é o revisor de design do corretor-web (imóveis comerciais, marca Lucas Gobatto, Juara/MT). Avalie a experiência
real da tela, não só o código. Escreva em português, com frases curtas.

## Como enxergar as telas

A suíte visual usa o Chrome do sistema e API simulada (nada chega à API real, sem credenciais):

- Código mudou desde o último build: `npm run visual` (build + suíte). Senão: `npm run visual:sem-build`.
- Filtre pelo alvo pedido: `npm run visual:sem-build -- --grep "corretores"` e/ou `--project=claro-1440`.
- Prints em `test-results/visual/prints/<projeto>/<nome>.png`; projetos `claro-1440`, `claro-1024`, `claro-768`,
  `claro-390`, `claro-320` (só público), `escuro-1440`, `escuro-390`. Abra os PNG com a ferramenta Read.
- Telas e modais cobertos: `tests/visual/painel.spec.ts` e `tests/visual/publico.spec.ts`. Tela nova sem cobertura:
  proponha o teste (caminho, botão que abre o modal) em vez de pular a revisão.
- Print de página inteira corta a lateral fixa (sticky) do painel na altura da janela: não é defeito.

## O que conferir

1. Layout: nada de "tela dividida" (modal fora do centro, grade com célula vazia), sem rolagem horizontal, barra do
   painel sem esticar abaixo de 1024px, colunas legíveis entre 1024 e 1279px, alvos de toque de pelo menos 44px.
2. Marca e cores: só tokens do `@theme` (`src/styles/tailwind.css`); dourado nunca como texto sobre fundo claro;
   contraste WCAG AA (texto 4,5:1, bordas e foco 3:1). Na dúvida, calcule o contraste.
3. Temas: claro (fundo azul-claro, superfícies quase brancas) e escuro (navy leve) legíveis; logo certo em cada tema.
4. Estados: carregando, vazio, erro e sucesso visíveis e sem "pulo" de layout; confirmação antes de ação destrutiva.
5. Formulários: rótulo em todo campo, erro perto do campo, obrigatórios sinalizados, rodapé de ações visível no modal.
6. Código da tela: cores literais fora do `@theme`, grades de painel por breakpoint da janela (use container query),
   componentes compartilhados ignorados (`Dialogo`, `Tabela`, `CabecalhoPagina`, `estilosPainel`), acesso a
   `window`/`document` no render de rota pública (quebra o SSR).

## Relatório

- Comece pelo que funciona bem (uma ou duas linhas).
- Liste os problemas com triagem `[Bloqueante]`, `[Alta]`, `[Média]` ou `[Detalhe]`. Cada item tem o print (caminho),
  a largura/tema, `arquivo:linha` provável e o impacto para o corretor ou para o cliente. Descreva o problema; não
  reescreva a tela.
- Termine com o que ficou sem verificar (por exemplo, tela sem teste visual).


---

## Arquivo original: TASKS.md

# Tarefas — corretor-web

## TABELA-ACOES-DESKTOP-20261009 — Ícones de ações sem quebra

- [x] Remover a largura fixa insuficiente da coluna de Contatos.
- [x] Travar a linha de ações apenas na tabela desktop e manter cartões mobile flexíveis.
- [x] Conferir Contatos com quatro ações, demais listas, 1440px e mobile 390px sem overflow.
- [x] Executar typecheck, lint, testes e build.
- Escopo local, visual e sem alterações de API, permissões, dados ou publicação.

## PAINEL-PADRAO-20261009 — Acabamento comum em todas as telas

- Responsável: Codex, com implementadores/revisão em arquivos separados. Plano autorizado pelo dono; implementação e validação local concluídas.
- [x] Componentes de seção/superfície/grade/dados, títulos externos e alinhamento por linha; 44/70rem por container.
- [x] Entrada, Visão geral, listas, todas as fichas, Perfil, formulários e diálogos adaptados preservando composições e controles existentes.
- [x] Ícones de ações rápidas, texto nas confirmações/finanças, busca/chips/contagens/estados e tabelas/cartões coerentes.
- [x] Esc, paleta, menu mobile, permissões, guardas dirty/busy, validação, banco recolhível e independência de perfil/senha conferidos com API simulada.
- [x] Typecheck, lint, build, 23 testes existentes, smoke SSR e diff-check aprovados; QA efêmero sem suítes novas.
- [x] 270 cenários de layout + 49 de formulários/login/estados + 5 fluxos; regressão do imóvel aprovado em 28 cenários + 2 fluxos. Histórico/contexto/índice atualizados.
- Entrega local: sem commit/push/deploy, dependências ou alterações na API/banco. Homologação de integrações reais/Safari/iOS/dispositivo físico fora desta validação.

## IMOVEL-ALINHAMENTO-20261009 — Revisão dos cards pelo dono

- Responsável: Codex. Plano autorizado; implementação e validação local concluídas.
- Títulos fora das superfícies; cards da mesma linha compartilham topo/base e altura, inclusive quando o título quebra.
- Subgrid de título/conteúdo, estrutura acessível e seletores adaptados da galeria. Mantidos containers, descrição larga e consulta sem permissão.
- Typecheck, lint, build e 23 testes existentes aprovados. QA efêmero em `artifacts/imovel-alinhamento-2026-10-09`: 28 cenários e 2 fluxos sem permissão/Esc aprovados; topo/base com desvio 0px, sem overflow. Títulos externos, quebra de títulos, galeria compacta e grade sem células vazias intermediárias conferidos; sem novas suítes.
- Sem publicação, dependências ou alterações de API/dados; histórico da versão anterior preservado.

## IMOVEL-NOTAS-20261009 — Ficha compacta estilo post-it

- Responsável: Codex. Plano autorizado pelo dono; implementação local concluída.
- Galeria com resumo ao lado; notas por assunto, descrição mais larga e campos internos compactos.
- Preservados campos, links, ações, permissões e Esc; consulta na edição sem permissão incluída.
- Typecheck, lint, build e testes existentes aprovados (3 arquivos/23 testes). QA visual efêmero com API simulada; sem novas suítes.
- Sem publicação, dependências, mudanças de contrato, API ou dados. Homologação real e Safari/iOS não executados.

## 2026-10-08 — Codex: 404 da foto corrigido na implantação

O dono autorizou resolver pela página aberta do Render usando Computer Use. Confirmado commit ativo antigo e3b0a32; implantação manual do origin/main 86ecf29 concluída (Deploy succeeded/Live), serviço srv-daj21e15efls73fab4gg, deploy dep-db4684m0tbcc73d9jtr0. Este registro substitui a pendência de acesso/publicação do diagnóstico abaixo.

URL original /api/corretores/1/foto?v=1f6h7x3 agora responde 302; seguindo redirect, HTTP 200 image/jpeg, 22322 bytes. /api/v1/saude da API retorna status ok. Perfil aberto recarregado para verificar a correção. Sem alterações funcionais, migrations, gravação de dados, commit ou push; documentação histórica preservada. Conector Render segue indisponível, mas sessão do navegador permitiu corrigir a implantação.


## FOTO-404-20261008 — Rota ausente na API publicada

- Responsável: Codex.
- Status: diagnóstico local concluído; correção da implantação pendente.
- [x] Reproduzir 404 publicado nos caminhos legado e versionado.
- [x] Confirmar endpoint no código local/GitHub e validar build/proxy com banco/storage simulados.
- [ ] Reconectar Render, verificar commit/build/start e publicar API atual se autorizado.
- [ ] Revalidar URL real e foto do perfil após implantação.


## REFINAMENTOS-20261006 — Contatos, perfil e filtros

- **Responsável:** Codex.
- **Status:** concluída localmente; homologação real do perfil e aceite visual separados.
- [x] Seletor por conteúdo/viewport, teclado e ações com ícone WhatsApp.
- [x] Contatos em Pendentes/Atendidos/Finalizados; paginação por aba, CSV e permissões preservadas.
- [x] Perfil compacto, arquivo/URL pendentes, prévia, guarda e senha independente.
- [x] JSON/multipart, leitura por id e compensação no R2 pela API irmã; sem schema/migration.
- [x] Filtros automáticos existentes, debounce 350 ms, validação, replace/SSR e respostas antigas.
- [x] Comandos, QA efêmero, revisão independente e System Design renderizado.
- [x] Contexto, especificações e índices atualizados sem apagar snapshots anteriores.
- [ ] Homologar um perfil real com login, R2 e Neon juntos; Safari/iOS e celular físico.
- [ ] Aceite do dono e eventual autorização de publicação (fora da entrega local).

## CABECALHOS-20261006 — Botões dos cabeçalhos no estilo de "Encontrar um imóvel"

- **Responsável:** Claude.
- **Status:** concluída (implementação e validação local).
- [x] `.linha-nav` compartilhada: negrito, linha dourada no hover/foco e no destino atual.
- [x] Cabeçalho público: remover "Encontrar um imóvel"; Alugar/Comprar/Área do corretor e tema sem borda.
- [x] Painel: sidebar e menu mobile com linha dourada; botões do topo sem borda.
- [x] Consistência: `.link-texto`, `urlCatalogo` nas páginas de erro, eyebrows do login, tracking dos selects.
- [x] Typecheck, lint, 21 testes, build, smoke SSR, curl e QA efêmero com capturas.
- [ ] Pendências relatadas ao dono, fora do pedido: chips do catálogo, raios variados (2–12px), cinco valores de
  tracking em maiúsculas e o X do `Dialogo` com borda.


## AREA-CORRETOR-20261006-CONCLUSAO — Specs completas do painel

- **Responsável:** Codex; implementação/revisão delegadas em arquivos separados.
- **Status:** concluída (implementação e validação local; homologação real separada).
- **Referência:** `2026-10-06-conclusao-area-corretor.md` e especificação vigente com adendos.
- [x] Autorização do dono para seguir as etapas posteriores a Contatos, incluindo comportamentos completos.
- [x] Imóveis/Contratos, Comissões/Cadastros/Corretores, Visão geral/Perfil e formulários/mídias.
- [x] Fichas próprias de imóvel/comissão/classificação/corretor; vínculos, estados e dados por cargo.
- [x] CampoNumero com unidades, edição decimal/colagem, limites e DTO existentes.
- [x] Guarda dirty/busy, camadas e Esc/Enter; perfil/senha e rascunho preservados.
- [x] Paleta pesquisável Ctrl/⌘+K, comandos/destinos permitidos e foco posterior ao fechamento.
- [x] Revisões estáticas e correções de pagamento, foco, desarme, colagem e seleção restaurada.
- [x] Typecheck, lint, 21 testes, build, smoke SSR, 320 cenários/140 capturas, diff-check e índice preservado.
- [x] Atualizar contexto/documentação sem apagar histórico; retirar scripts efêmeros de QA.
- [ ] Homologação real e Safari/iOS/celular físico (fora desta conclusão local).

Os status pendentes do marco AREA-CORRETOR-20261006 abaixo retratam a entrega anterior.
Não bloqueiam esta continuação, expressamente autorizada. Sem dependências/API/dados/migrations
ou commit/push/deploy; reabertura somente por ADMIN continua sendo uma restrição do frontend.

## AJUSTES-PAINEL-20261006 — Revisão visual e de navegação

- **Responsável:** Codex.
- **Status:** concluída (implementação e validação local).
- **Referência:** `2026-10-06-ajustes-painel.md`, plano aprovado pelo dono.
- [x] Tooltips sem setinhas/rolagem e seletores de filtros compartilhados.
- [x] Esc retorna ao histórico interno, com prioridade de camadas e guarda existente.
- [x] Menu mobile ocupa a tela inteira; cards/valores/ações alinhados à direita.
- [x] Atendido estilizado, permissões preservadas, sem foto e origem retirados das listas.
- [x] Typecheck, lint, 21 testes, build, smoke SSR, diff-check e QA simulado (63 cenários/59 capturas); limites registrados.

Status possíveis: `aberta`, `em andamento`, `em revisão`, `bloqueada`, `concluída`.
Quem assume uma tarefa escreve o próprio nome em Responsável e reflete isso no `docs/PROJECT_STATUS.md`.
Tarefas da API ficam em `../Corretor-API/docs/TASKS.md`.

## AREA-CORRETOR-20261006 — Continuar a especificação do parceiro

- **Status:** em revisão (primeiro marco: Contatos).
- **Responsável:** Codex; revisão visual: dono.
- **Referência vigente:** `2026-10-06-painel-especificacao-visual.md`, base `a2a9f81`.
- [x] Preservar a tela Pessoas e a base visual do parceiro; corrigir tooltip, dicas/erros e espaçamento de modal no painel.
- [x] Contatos: Pendentes e Atendidos, checkbox PENDENTE ↔ RESPONDIDO, confirmação FINALIZADO e histórico por filtro.
- [x] Reabertura somente por ADMIN no frontend, inclusive no EditorPessoa; edição só por responsável ou ADMIN.
- [x] Filtros inclusivos UTC-04, paginação independente, CSV da página, links reais, mensagem e WhatsApp.
- [x] Typecheck, lint, 21 testes existentes, build, smoke SSR e QA efêmero com API simulada (24 cenários/38 capturas).
- [ ] Revisão de Contatos pelo dono, antes de propagar às próximas telas (seção 8 da especificação).
- [ ] Imóveis e Contratos; depois Comissões, Cadastros, Corretores, Visão geral, Perfil e demais formulários/modais.
- [ ] Fichas de consulta em telas próprias: imóvel, comissão, classificação e corretor; reutilizar serviços existentes e permissões.
- [ ] CampoNumero, links de imóvel/corretor, guarda de modal (Esc + Esc ou Enter), Esc sem modal e somente Ctrl/⌘+K.
- [ ] Homologação com API real e Safari/iOS/dispositivo físico, separada dos resultados simulados.

Limite desta entrega: frontend na main, sem ampliar suítes rastreadas, dependências, API/dados,
migrations, commit, push ou deploy. A API não garante a regra específica ADMIN para reabertura;
isso exige um escopo posterior de backend. As tarefas históricas abaixo permanecem preservadas.

---

## 1. Pendências Operacionais e Lançamento (Produção)

### DEPLOY-002 — Publicar o front-end em produção
- **Status:** bloqueada por DEPLOY-001 (publicação da API)
- **Responsável:** a definir
- **Objetivo:** Publicar a aplicação com SSR em produção conectada à API real.
- **Critérios de conclusão:**
  - Definir e registrar em `docs/DECISIONS.md` a plataforma de hospedagem comercial (Vercel plano comercial ou alternativa Node.js).
  - Configurar variáveis de produção:
    - `VITE_API_URL=/api`
    - `API_ORIGIN` com o domínio HTTPS real da API
    - `SITE_URL` com o domínio público final
    - `SEO_INDEXABLE=true`
  - Garantir que `ALLOWED_ORIGINS` da API autorize o domínio do front-end (essencial para cookies e CORS).
  - Validação ponta a ponta: catálogo, detalhes, painel administrativo, upload de fotos e envio de leads.

### DEPLOY-001 — Publicar a API em produção (Corretor-API)
- **Status:** aberta
- **Responsável:** a definir
- **Objetivo:** Subir o backend no serviço de hospedagem definitiva (Render/VPS) apontando para o Neon e Cloudflare R2 reais.
- **Critérios de conclusão:**
  - Ambiente Node 24 com `npm run start:prod`.
  - Configurar variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`, credenciais do R2, etc.).
  - Health check da API respondendo 200 em `/api/v1/saude`.

### CONTEUDO-001 — Fotos comerciais reais dos imóveis e acesso público do R2
- **Status:** aberta (trazida em CARGA-001 e REVISAO-001)
- **Responsável:** a definir
- **Objetivo:** Substituir as fotos ilustrativas da Unsplash pelas fotos comerciais reais dos 12 imóveis cadastrados no Neon, e resolver a permissão de leitura pública do bucket R2.
- **Critérios de conclusão:**
  - Configurar acesso público/domínio customizado no Cloudflare R2 (atualmente a URL pública do R2 retorna 401, necessitando do CDN da Unsplash como paliativo temporário).
  - Fazer upload das fotos reais dos imóveis comerciais de Juara/MT.
  - Atualizar os links no banco e validar carregamento no catálogo, na galeria e nas miniaturas.

### TEST-VISUAL-001 — Especificações de teste para a suíte visual Playwright
- **Status:** aberta (trazida em REVISAO-001)
- **Responsável:** a definir
- **Objetivo:** Criar arquivos de teste `.spec.ts` para `tests/visual/` para que o comando `npm run visual` funcione corretamente.
- **Critérios de conclusão:**
  - A pasta `tests/visual/` atualmente só possui arquivos utilitários (`api-simulada.ts`, `orcamento.ts`), fazendo o Playwright falhar por falta de specs.
  - Criar testes visuais cobrindo páginas públicas e painel nos temas claro e escuro e nas larguras responsivas.
  - Garantir que `npm run visual` conclua a execução gerando o relatório sem falhas.

### TEST-API-001 — Testes de permissões e upload na API irmã (Corretor-API)
- **Status:** aberta (trazida em REVISAO-001)
- **Responsável:** a definir
- **Objetivo:** Cobrir no backend (`Corretor-API`) a autorização por perfil (ADMIN vs CORRETOR), cálculo de comissões e round-trip de upload de arquivos.

### SEO-001 — Liberar a indexação pública nos motores de busca
- **Status:** bloqueada por DEPLOY-002
- **Responsável:** a definir
- **Objetivo:** Permitir que Googlebot e outros buscadores indexem as páginas públicas.
- **Critérios de conclusão:**
  - `SITE_URL` e `API_ORIGIN` rodando em HTTPS com `NODE_ENV=production` e `SEO_INDEXABLE=true`.
  - `robots.txt` apontando para o `sitemap.xml` e liberando `/` e `/imoveis/`.
  - `sitemap.xml` dinâmico listando os imóveis reais cadastrados.
  - Testar prévias de compartilhamento (Open Graph / WhatsApp / LinkedIn).

### ADMIN-001 — Configurar o WhatsApp comercial definitivo
- **Status:** aberta (aguardando número real)
- **Responsável:** a definir
- **Objetivo:** Substituir o número provisório de exemplo (`5565999999999`) pelo telefone real de atendimento do corretor Lucas Gobatto.
- **Critérios de conclusão:**
  - Atualizar o cadastro do administrador no painel ou via API.
  - Validar se o botão flutuante e os botões de contato de cada imóvel direcionam para o WhatsApp correto com a mensagem predefinida.

### AUDIT-001 / AUDIT-REV — Homologação dos itens da Auditoria Full Stack
- **Status:** aberta para homologação em ambiente real
- **Responsável:** a definir
- **Objetivo:** Validar em produção as correções de integridade e segurança realizadas localmente.
- **Critérios de conclusão:**
  - Testar banco PostgreSQL com as migrations aplicadas e integridade referencial.
  - Validar upload e leitura de mídias no Cloudflare R2 em produção.
  - Validar integração com Google Drive para criação automática das pastas privadas de contratos.
  - Validar comportamento e tempo de resposta em caso de cold start da API.

### RENTAL-004 — Definição de regras e permissões de contratos e comissões
- **Status:** aberta (aguardando alinhamento de produto com o dono)
- **Responsável:** a definir
- **Objetivo:** Consolidar regras de negócio para a gestão de contratos e intermediações.
- **Critérios de conclusão:**
  - Definir fluxo exato para encerramento ou renovação de contratos de locação.
  - Definir se corretores comuns podem criar ou apenas visualizar contratos e comissões atribuídos a eles.
  - Validar o cálculo e baixa manual de parcelas de comissão de captação.

### NOTIFY-001 — Notificação automática ao receber novo lead
- **Status:** aberta (aguardando definição de canal com o dono)
- **Responsável:** a definir
- **Objetivo:** Alertar imediatamente o corretor responsável quando um visitante enviar uma proposta ou mensagem de contato no site.
- **Critérios de conclusão:**
  - Escolher canal de envio (WhatsApp via API externa ou E-mail transacional via Resend/SendGrid).
  - Integrar envio no momento do registro do contato (`POST /pessoas`).

### UX-007 — Preservar filtros do painel administrativo na URL
- **Status:** aberta
- **Responsável:** a definir
- **Objetivo:** Sincronizar filtros das tabelas de imóveis, pessoas e contratos com a query string da URL.
- **Critérios de conclusão:**
  - Permitir recarregar a página ou compartilhar links do painel mantendo filtros ativos (ex: busca, status e paginação).

---

## 2. Sugestões de Melhorias e Backlog Futuro

### PERF-001 a PERF-003 — Caches e otimização de performance
- **Prioridade:** Média (P2)
- **Sugestão:**
  - Cache em memória no SSR para categorias, tipos e finalidades de imóveis (SWR), reduzindo idas desnecessárias à API.
  - Carregamento de dados em paralelo na inicialização do painel administrativo.
  - Otimização do tamanho do bundle público removendo validações desnecessárias para visitantes.

### AGENDA-001 — Módulo de agendamento de visitas
- **Prioridade:** Média (P2)
- **Sugestão:**
  - Registro de visitas a imóveis integrado ao funil de contatos (data, horário, corretor e parecer/resultado da visita).

### FICHA-001 — Ficha para impressão e busca automática por CEP
- **Prioridade:** Média (P2)
- **Sugestão:**
  - Estilo CSS `@media print` para gerar folha de apresentação em PDF/impressão de qualquer imóvel.
  - Integração com ViaCEP para preencher automaticamente logradouro, bairro, cidade e UF a partir do CEP informado no formulário.

### RELATORIO-001 — Relatórios financeiros e exportação de dados
- **Prioridade:** Média (P2)
- **Sugestão:**
  - Visão mensal consolidada de comissões (valores recebidos, a receber e parcelas em atraso).
  - Exportação de listas de contatos e clientes em formato CSV/Excel com filtros aplicados.

### RASCUNHO-001 — Controle de publicação de anúncios (Modo Rascunho)
- **Prioridade:** Média (P2)
- **Sugestão:**
  - Permitir cadastrar o imóvel sem disponibilizá-lo imediatamente no site público, com botão explícito de "Publicar Anúncio".

### SENHA-001 — Recuperação de senha no painel ("Esqueci minha senha")
- **Prioridade:** Baixa (P3)
- **Sugestão:**
  - Envio de link seguro de redefinição de senha por e-mail, evitando necessidade de intervenção do administrador do sistema.

### PORTAIS-001 — Integração com portais imobiliários (Feed XML)
- **Prioridade:** Baixa (P3)
- **Sugestão:**
  - Geração de feed XML nos padrões do ZAP Imóveis, VivaReal e OLX para sincronização automática dos imóveis comerciais.

### FORMATO-001 — Padronização de formatação de código com Prettier
- **Prioridade:** Baixa (P3)
- **Sugestão:**
  - Configuração do Prettier com quebra de linha de 120 colunas para garantir legibilidade homogênea no repositório.


## 2026-10-05 — ÁREA-001: refinamento da Área do Corretor

Plano autorizado em conversa, implementado localmente; validação final registrada em CHANGELOG_AI.

- [x] Seções abertas, navegação por ícones e inputs refinados nos dois temas.
- [x] Tooltips em foco/hover com nome contextual, aria-describedby e prioridade de Esc.
- [x] Campos numéricos compartilhados com unidades externas, decimais PT-BR e validação existente.
- [x] Contratos abertos pela linha/item inteiro, preservando ações internas independentes e links reais.
- [x] Fichas de imóvel/corretor em modal, carregamento/erro/retry e edição separada conforme permissão.
- [x] Esc intacto fecha; edição exige dois Esc consecutivos, outro evento desarma; ocupado bloqueia.
- [x] Menu Ctrl/Command+K, busca /, ajuda ?, envio seguro Ctrl/Command+Enter e retorno interno com Esc.
- [x] Guarda de edição em imóvel/perfil; preservar rascunho e operações já persistidas.
- [ ] Homologação posterior com API/serviços reais e Safari/iOS/dispositivos físicos. Não confundir QA simulado com homologação.

Sem dependências novas, alteração de dados/API, migration ou publicação nesta entrega.

## 2026-10-06 — Revisão de conforto do painel

- [x] Restaurar sidebar 260px com ícones e nomes, destino ativo e menu mobile nomeado.
- [x] Tipografia principal 18px, auxiliar 16px, título principal/modal 20px e subtítulos 18px.
- [x] Botões dourados arredondados, desenhos brancos, textos azuis, alvos 48px e distinção destrutiva/desabilitada.
- [x] Novo/Filtrar/WhatsApp/Responder com ícone e texto; editar/consulta com tooltip.
- [x] Inputs outlined com rótulo acima, foco/erro e unidades numéricas externas.
- [x] Contatos em blocos suaves; tabelas confortáveis e mudança mobile antes de apertar colunas.
- [x] Cabeçalhos e Responder contatos alinhados; preservar fichas, atalhos, permissões e dois Esc.
- [ ] Homologação em API/serviços reais e dispositivos físicos continua separada do QA simulado.

Sem dependências, API/dados, migrations, commit, push ou deploy.

- [x] Typecheck, lint, 21 testes, build, smoke SSR e diff-check.
- [x] Revisão Chrome simulada: seis matrizes/72 capturas, 28 cenários aprovados após repetição isolada de um timeout; detalhes em CHANGELOG_AI.

## 2026-10-06 — Refatoração da Área do Corretor revertida pelo dono

Pedido explícito: “reverta tudo, e me dê um plano e um resumo do que foi pedido”. Revertidas integralmente as duas etapas desta conversa: mudanças visuais, sidebar, fontes, botões/inputs, tooltips centralizados, entradas numéricas, fichas em modal, contratos clicáveis, atalhos e fechamento com dois Esc. Arquivos fonte rastreados restaurados ao estado anterior da refatoração; cinco componentes/hooks novos retirados do código ativo. API, banco, dependências e trabalho anterior preservados. Nenhum commit, push ou deploy.

Os registros de implementação/validação de 05 e 06/10 acima são históricos e NÃO descrevem o produto atual. As orientações específicas dessa refatoração ficam canceladas como instruções de implementação vigente. O novo documento PLANO-AREA-CORRETOR.md contém apenas o pedido consolidado e a proposta de execução futura; não autoriza reimplementar. Preservar o restante das orientações do repositório. Backup local ignorado em artifacts/reversao-area-corretor-2026-10-06.

Verificação da reversão: todos os arquivos rastreados de src comparados por hash ao HEAD, sem diferenças; componentes novos ausentes e referências removidas. npm run build e node scripts/seo-smoke.mjs aprovados após a reversão, assim como git diff --check. A suíte de testes não foi repetida nesta reversão. Plano entregue em docs/PLANO-AREA-CORRETOR.md.

## 2026-10-09 — Codex: contorno de foco após Esc

Implementado o plano autorizado: `data-foco-navegacao` no main do painel e no h1 de Desenvolvedores; `[data-foco-navegacao]:focus { outline: none; }` em global.css. Preservados tabIndex, foco programático, Pular para o conteúdo, retorno do foco e regras de Esc. A marcação é exclusiva de destinos não interativos; não aplicar a todos os elementos com tabindex=-1 nem remover o foco visível de controles.

Validação: typecheck, lint, build e testes existentes aprovados (3 arquivos, 23 testes). QA efêmero Chrome com API simulada: 19 verificações aprovadas, incluindo reprodução da borda de 3px com a nova regra removida via CSSOM, Visão geral/Imóveis/Contratos/Devs nos dois temas, Tab em link/botão/input, filtro, menu mobile, diálogo intacto com retorno do foco e diálogo alterado com dois Esc. Capturas e resultados ignorados em artifacts/esc-foco-2026-10-09. Sem erros JavaScript nos cenários concluídos. Primeiro QA usou rótulo inexistente Abrir menu; corrigido para Menu. Reinícios do navegador foram necessários antes da rodada final completa.

O smoke original scripts/seo-smoke.mjs falhou na expectativa antiga do h1 Imóveis comerciais; a tela atual usa Imóveis para alugar e comprar. Cópia efêmera com apenas essa expectativa e caminhos de import ajustados passou: SSR, metadados, paginação, 404, discovery, proxy/cookies, função Vercel gerada e indisponibilidade/recuperação 503. O script original foi preservado; sua expectativa continua pendente de atualização fora deste escopo. Build emitiu avisos de anotação PURE do Zod e chunk maior que 500 kB, sem impedir conclusão.

Entrega local concluída; alterações preexistentes preservadas. Sem novas suítes, dependências, API, banco, commit, push ou deploy por esta tarefa. QA simulado não equivale a homologação real nem validação em Safari/iOS.

2026-10-09 — Atualização: dono autorizou commit e push da correção de foco e destes registros na main. Validações da entrega acima permanecem aplicáveis; publicação no Git não confirma deploy.
