# Conclusão da especificação da Área do Corretor — 06/10/2026

Resumo atualizado em 09/10/2026. O dono autorizou aplicar a especificação ao painel inteiro. Publicado no Git em
`ea94f84`.

## Entrega

| Frente | Resultado |
|---|---|
| Imóveis e formulário | Linha clicável com link real, consulta separada da edição, rascunho e duplicação preservados |
| Contratos | Listagem padrão, vínculos para fichas, ações financeiras e Drive com texto |
| Comissões | Lista e ficha própria; valores em centavos; recebimento com confirmação |
| Cadastros e Corretores | Listas, editores e fichas próprias; consultas conforme o cargo |
| Visão geral e Perfil | Resumos com `Tabela`; guarda conjunta de perfil e senha |
| `CampoNumero` | Unidade fora do campo; aceita vírgula, ponto e colagem `1.234,56`; recusa letras e notação científica |
| `Dialogo` | `alterado`/`ocupado`; Esc + Esc ou Enter descarta; fecha só o modal de cima; bloqueia durante o envio |
| Comandos | Só Ctrl/⌘+K, com destinos e ações permitidos ao cargo |

Rotas de consulta: `/admin/imoveis/:id`, `/admin/comissoes/:id`, `/admin/cadastros/:categoria/:id` e
`/admin/corretores/:id`. O próprio corretor abre `/admin/perfil`. CORRETOR não chama endpoints administrativos de
corretores e classificações. Descartar um formulário não desfaz mídia nem pagamento já salvos.

## Validação na época

Typecheck, lint, testes e build aprovados em 06/10. QA no Chrome com API simulada: 320 cenários e 140
capturas, ADMIN e CORRETOR, 320/390/768/1440, nos dois temas. Sem homologação com API real, Safari/iOS ou celular
físico. O padrão visual vigente está em [2026-10-06-painel-especificacao-visual.md](2026-10-06-painel-especificacao-visual.md)
e foi refinado em [2026-10-09-padronizacao-painel.md](2026-10-09-padronizacao-painel.md).
