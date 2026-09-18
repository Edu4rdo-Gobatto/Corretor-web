---
description: Revisa o visual de uma tela (ou das telas alteradas) com prints reais e devolve problemas priorizados
argument-hint: "[tela ou trecho do nome do teste: corretores, modal, catalogo...]"
---

Use o subagente `revisor-design` para revisar: $ARGUMENTS

Sem argumento, revise as telas afetadas pelo `git diff` atual; se não houver diff, revise todas. Traga o relatório com
a triagem e os caminhos dos prints, e não altere código.
