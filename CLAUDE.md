@AGENTS.md

# Instruções específicas do Claude

Antes de responder ou modificar arquivos:

- Leia `PROJECT_STATUS.md`, `TASKS.md` e `DECISIONS.md`.
- Leia o último registro de `CHANGELOG_AI.md`.
- Confira o estado do Git e se a branch está sincronizada com o remoto.
- Em dúvida sobre regra de produto, consulte `corretor-spec.json`.

Durante o trabalho:

- Não confie no `README.md`, no `PLANO-PROJETO-CORRETOR.md` nem no `AUDITORIA-FRONTEND.md` para afirmar o que existe:
  eles estão desatualizados em pontos conhecidos. A fonte de verdade é o código.
- Os arquivos `.ts`/`.tsx` deste repositório têm linhas muito longas; ao ler, use `fold -w 400 -s <arquivo>` para
  não perder conteúdo truncado.
- Mudança em SSR, SEO, contrato com a API ou variável de ambiente exige registro em `DECISIONS.md`.
- Prefira revisar e planejar a implementar em paralelo com o outro agente na mesma área.

Quando terminar:

- Atualize o status da tarefa em `PROJECT_STATUS.md` e `TASKS.md`.
- Registre decisões arquiteturais em `DECISIONS.md`.
- Liste em `CHANGELOG_AI.md` os testes executados e o resultado real, incluindo falhas.
- Para mudanças em página pública, confira também no navegador ou por `curl`: catálogo, detalhe de imóvel,
  `robots.txt`, `sitemap.xml` e uma rota inexistente.
- Não considere uma tarefa concluída só porque o código compila.
