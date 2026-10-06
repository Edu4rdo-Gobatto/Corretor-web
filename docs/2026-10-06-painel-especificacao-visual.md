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
