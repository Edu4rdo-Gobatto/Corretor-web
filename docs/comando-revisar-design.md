---
description: Revisa o visual de uma tela (ou das telas alteradas) com prints reais e devolve problemas priorizados
argument-hint: "[tela ou trecho do nome do teste: corretores, modal, catalogo...]"
---

> **Nota (09/10/2026):** modelo de prompt guardado como referência. Não é carregado automaticamente desde a
> remoção de `.claude/` em 04/10. Depende de specs visuais em `tests/visual/` que hoje não existem
> (`npm run visual` não tem o que rodar).

Use o subagente `revisor-design` para revisar: $ARGUMENTS

Sem argumento, revise as telas afetadas pelo `git diff` atual; se não houver diff, revise todas. Traga o relatório com
a triagem e os caminhos dos prints, e não altere código.
