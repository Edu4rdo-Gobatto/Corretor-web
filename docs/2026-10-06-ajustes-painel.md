# Ajustes de usabilidade e layout do painel — 06/10/2026

Resumo atualizado em 09/10/2026. Pedido do dono após a revisão de Contatos, aprovado em conversa. Publicado no Git
depois (`ea94f84`).

## O que vale

- **Esc:** sem camada aberta, volta à página anterior do painel (com query e hash). Sem histórico, detalhe volta à
  lista e tela principal volta à Visão geral. Dica, seleção e modal consomem o Esc antes. Campo de texto não navega.
- **`SeletorFiltro`:** lista estilizada nos filtros de Pessoas, Contatos, Imóveis, Contratos, Comissões e Cadastros,
  com teclado completo. Os selects dos formulários continuam nativos.
- **Menu mobile:** variante `telaInteira` do `Dialogo`.
- **Cards da `Tabela`:** identificação à esquerda, valores e ações à direita, alvos de 44px.
- **Atendido:** continua checkbox. Reabrir finalizado é só para ADMIN, apenas no front.
- **Listas:** saiu o filtro "Só sem foto". Origem e consentimento ficam só na ficha da pessoa.

Depois desta etapa, Contatos passou a usar abas e as ações de lista ficaram só com ícone (ver
[DECISIONS.md](DECISIONS.md)).

## Validação na época

Typecheck, lint, testes e build aprovados em 06/10. QA no Chrome com API simulada: 63 cenários e 59
capturas em 320/390/768/1440, nos dois temas. Sem homologação com API real, Safari/iOS ou celular físico.
