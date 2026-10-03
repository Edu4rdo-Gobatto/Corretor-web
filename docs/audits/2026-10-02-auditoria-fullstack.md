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
