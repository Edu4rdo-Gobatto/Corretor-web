# Área do Corretor — especificação visual e de comportamento (06/10/2026)

Especificação combinada com o dono em 06/10 e aplicada ao painel inteiro. Este arquivo foi enxugado em 09/10/2026
e guarda só os tokens e as regras vigentes, conferidos no código. A fonte de verdade é o código: se divergirem,
corrija este arquivo.

## Situação

Tudo o que a especificação previa está concluído: base visual, sidebar, ícones, listagem padrão, Pessoas, Contatos,
Imóveis, Contratos, Comissões, Cadastros, Corretores, Visão geral, Perfil, formulários e modais, `CampoNumero`, links
para fichas, guarda de modal, Esc sem modal e Ctrl/⌘+K. O espaçamento mobile do cabeçalho do `Dialogo`
(`max-[520px]:`) já está correto. Em 09/10 o acabamento foi refinado em
[2026-10-09-padronizacao-painel.md](2026-10-09-padronizacao-painel.md).

## Princípios

1. Texto confortável, menos caixas decorativas e ações claras.
2. Um padrão só: listas, botões e campos usam os mesmos componentes. Nada de correção isolada por tela.
3. Identidade azul e dourado. O painel usa um dourado mais fechado que o do site.
4. Site público intacto: tudo do painel fica dentro de `.painel-ui` (raiz do `LayoutPainel`).

## Tokens (`src/styles/tailwind.css`)

Use só tokens nos componentes, nunca cores literais.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--color-background` | `#dce5f0` | `#182d50` | Fundo da página |
| `--color-paper` | `#eaf0f7` | `#1f3761` | Superfícies |
| `--color-soft` | `#cfdceb` | `#28416d` | Áreas suaves, fundo do `BotaoVoltar` |
| `--color-muted` | `#4b5a70` | `#b3bdd0` | Texto secundário |
| `--color-line` | `#b6c5d8` | `#38557f` | Divisórias |
| `--color-control-line` | `#63758e` | `#8a9bb7` | Borda de campos e botões de contorno |
| `--color-campo` | `#e2eaf4` | `#1a2f55` | Fundo dos campos |
| `--color-linha-a` / `--color-linha-b` | `#e4ebf4` / `#d8e2ef` | `#192d52` / `#213a64` | Linhas alternadas |
| `--color-linha-foco` | `#c7d7ea` | `#2a4470` | Linha sob o mouse |
| `--color-cabecalho-tabela` | `#ccd8e7` | `#142748` | Cabeçalho das colunas |
| `--color-texto-cabecalho-tabela` | `#2c3a52` | `#dce4f0` | Títulos das colunas |
| `--color-acao-painel` | `#b3892d` | igual | Fundo das ações do painel; base do ícone ativo na sidebar |
| `--color-acao-painel-hover` | `#a37d29` | igual | Hover das ações |
| `--color-sobre-acao` | `#ffffff` | igual | Ícone e texto sobre o dourado |

Não use o dourado `#c99b3f` do site em botões do painel. Contraste conferido em 09/10: textos com pelo menos 4,73:1 no
pior fundo claro; borda de controle com pelo menos 3,21:1.

## Tipografia

Fontes: Source Sans 3 (texto) e Libre Baskerville (títulos).

| Papel | Tamanho |
|---|---|
| Título de página (`CabecalhoPagina`) | 28px |
| Título de seção e de modal | 22px |
| Texto principal (base de `.painel-ui`, campos, células, botões) | 18px |
| Auxiliar (rótulos, dicas, erros, metadados) | 16px |
| `Etiqueta` de situação | 14px |

Sem eyebrow em caixa alta acima dos títulos.

## Componentes

- **Botões:** `.button` com fundo `acao-painel`, raio 12px e altura mínima 48px. `.buttonSecondary`/`.buttonGhost`
  com contorno de 1,5px. `.buttonPerigo` em vermelho. Confirmações e ações financeiras sempre com texto.
- **`AcaoIcone`:** fora de lista, quadrado dourado de 48px; dentro de `.acoes-linha`, sem fundo, 44px, na cor do
  texto. `rotulo` vai na dica; `contexto` só no nome acessível. Nunca o nome do registro na dica visível.
- **Campos:** `Campo` liga rótulo, dica e erro ao controle. Altura mínima 48px, contorno de 1,5px, raio 10px, fundo
  `campo`, texto 18px.
- **`Tabela`:** linhas alternadas, linha inteira clicável (`linkLinha`) com `<Link>` real na primeira coluna,
  Ctrl/⌘/Shift ou botão do meio abrem nova guia. Coluna `acoes` por último, à direita, numa linha só no desktop.
  Abaixo de 40rem de container vira cartões. Lista vazia orienta a próxima ação.
- **Superfícies (`BlocosPainel`):** título externo, borda superior dourada de 3px, raio 5px, sombra leve.
- **`CabecalhoPagina`:** título à esquerda, ações na borda direita, descrição abaixo; `BotaoVoltar` quando há retorno.
- **`Dialogo`:** título de 22px, fechar de 48px, rodapé fixo com ação principal e Cancelar.
- **Ícones:** Material Symbols Outlined preenchido, inline em `Icones.tsx`. Sem fonte do Google e sem ícones de contorno.
- **Sidebar (`LayoutPainel`):** 260px a partir de `lg`, logo para fundo escuro, ícone e nome em cada destino, item
  ativo com linha dourada sob o nome e base dourada no ícone. Cartão do perfil leva a Meu perfil. No celular, barra
  superior com "Menu", que abre o menu em tela inteira.

## Telas

- **Pessoas:** referência original. `+` só com ícone no cabeçalho; filtros com chips removíveis; linha abre a ficha.
- **Contatos:** uma lista com três abas (Pendentes, Atendidos, Finalizados), páginas independentes e CSV da página.
  Checkbox alterna PENDENTE e RESPONDIDO; Finalizar (`task_alt`) pede confirmação. Só ADMIN reabre um finalizado, e
  essa regra existe só no front.
- **WhatsApp:** só ícone nas listas (desde 09/10). Nas fichas e no site público conserva texto.
- **Imóveis, Contratos, Comissões, Cadastros, Corretores:** linha abre a ficha em tela própria; ações à direita.
- **Visão geral:** listas resumidas com o mesmo padrão. Nome ou avatar do corretor abre o perfil dele.

## Comportamentos

- **`CampoNumero`:** unidade fora do campo; aceita vírgula, ponto e colagem `1.234,56`; recusa letras, sinais e
  notação científica. A conversão fica nos adaptadores e esquemas de cada tela.
- **Modal com alterações:** sem alterações, um Esc fecha. Com alterações, o primeiro Esc avisa e o segundo Esc (ou
  Enter) descarta. Outra tecla, clique ou edição desarma. X ou clique fora pedem confirmação. Durante o envio, não
  fecha. Com modais sobrepostos, fecha só o de cima. Descartar não desfaz o que já foi salvo.
- **Esc sem modal:** volta à página anterior do painel; sem histórico, à lista e depois à Visão geral. Respeita a
  guarda de formulário e é ignorado com o foco em campo de texto.
- **Atalho:** só Ctrl/⌘+K, que abre a paleta de comandos. `/`, `?` e Ctrl+Enter foram descartados pelo dono.

## Não fazer

- Cor literal em componente ou dourado `#c99b3f` em botão do painel.
- Botão dourado com fundo dentro de lista.
- Nome do registro na dica visível.
- Regras do painel fora de `.painel-ui`.
- Correção isolada numa tela quando o problema é do componente compartilhado.
- Suítes de teste novas sem pedido do dono.
