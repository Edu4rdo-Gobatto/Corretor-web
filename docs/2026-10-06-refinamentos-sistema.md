# Refinamento de contatos, perfil e filtros — 06/10/2026

Resumo atualizado em 09/10/2026. Pedido do dono, com mudanças no front e na API. Publicado no Git em `157c21f`
(front) e `86ecf29` (API). A API com a foto foi implantada no Render em 08/10.

## O que vale

- **Contatos:** uma lista com três abas (Pendentes, Atendidos e Finalizados), páginas independentes, CSV da página e
  ações compactas. Desde 09/10 as ações da lista são só ícones.
- **Seletores:** largura pelo conteúdo, limitada à janela, sem partir palavras.
- **Perfil:** dois blocos (dados e foto; segurança) e faixa de métricas. Foto por arquivo ou URL; prévia, troca e
  remoção só valem ao salvar. Formulário de senha independente.
- **Foto na API:** `PATCH /autenticacao/eu` aceita JSON ou multipart (campo `foto`, até 10 MiB). Leitura pública por
  `GET /corretores/:id/foto`, com bucket privado. Contrato em
  [2026-10-06-foto-perfil.md da API](../../Corretor-API/docs/2026-10-06-foto-perfil.md).
- **Filtros automáticos:** `useFiltrosAutomaticos` aplica seleções na hora e texto após 350 ms. No catálogo, a URL
  muda com `replace`; a paginação entra no histórico.

## Validação na época

Typecheck, lint e build nos dois repositórios; testes do front aprovados. QA HTTP com R2 e banco simulados; R2 real
conferido com objeto temporário. QA no Chrome: 23 cenários e 32 capturas. Sem login real com gravação de foto no
Neon, Safari/iOS ou celular físico (HOMOLOGACAO-001 em [TASKS.md](TASKS.md)).

O [System Design](2026-10-06-system-design.docx) de 06/10 descreve a arquitetura dessa entrega.
