---
description: Mede requisições por tela, bundle e cache HTTP e compara com o orçamento do projeto
argument-hint: "[tela ou trecho do nome do teste: catalogo, visao-geral, perfil...]"
---

> **Nota (09/10/2026):** modelo de prompt guardado como referência. Não é carregado automaticamente desde a
> remoção de `.claude/` em 04/10. Depende de specs visuais em `tests/visual/` que hoje não existem
> (`npm run visual` não tem o que rodar).

Use o subagente `auditor-desempenho` para medir: $ARGUMENTS

Sem argumento, meça todas as telas. Traga a tabela medido × orçamento, as regressões e as oportunidades separadas em
front, API e infraestrutura, sem alterar código.
