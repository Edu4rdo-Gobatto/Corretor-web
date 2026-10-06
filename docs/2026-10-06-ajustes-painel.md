# Ajustes de usabilidade e layout do painel — 06/10/2026

Pedido do dono após a revisão de Contatos: corrigir tooltips, Esc, seletores, atendimento,
cards/alinhamento, menu mobile e informações desnecessárias nas listagens. O plano foi
aprovado expressamente com “Implement the proposed plan.”

## Decisões e entrega

- Somente frontend; preservar alterações locais e índice Git. Sem API/banco/migrations,
  dependências novas, commit, push ou deploy.
- Esc sem camada aberta volta à entrada anterior do histórico interno do painel, incluindo
  query/hash. Sem histórico disponível, detalhes/edições voltam à lista; telas principais
  voltam à Visão geral. A Visão geral sem histórico não navega. Não abre a página externa
  anterior. O histórico é por permanência no painel, não persiste após recarregar/sair.
- Tooltip, seleção e modal consomem Esc antes do retorno. Campo de texto, composição e
  repetição da tecla não disparam navegação. A guarda de edição existente segue válida.
- `SeletorFiltro` controlado padroniza as listas dos filtros de Pessoas, Contatos, Imóveis,
  Contratos, Comissões e Cadastros. Não substitui selects dos formulários de edição.
  Usa tokens existentes, listbox na camada popover, direção conforme espaço, foco no
  combobox, setas/Home/End, Enter/Espaço, busca por prefixo, Tab, Esc e clique fora.
- O menu mobile usa a variante `telaInteira` de Dialogo, com áreas seguras, cabeçalho fixo,
  rolagem interna e restauração de foco. Outros diálogos conservam o formato existente.
- Cards da Tabela têm separação entre registros, nome/identificação à esquerda e demais
  valores à direita. Ações ocupam uma faixa à direita. Grupos de ícones nas tabelas ficam
  horizontais, com alvo mínimo de 44px; faixas maiores podem quebrar para caber.
- Cabeçalhos e grupos buscar/limpar alinham ações à direita, sem impor botões de largura
  total no mobile. Não altera o padrão dos rodapés de edição.
- Atendido continua checkbox, com contorno e estados marcado, foco, ocupado e desabilitado.
  Preserva as transições, confirmações e permissões existentes. Reabertura exclusiva de ADMIN
  continua sendo uma restrição do frontend, não uma garantia homologada da API.
- Removido o filtro local “Só sem foto”, incluindo resumo e contagem especiais; o placeholder
  de imagem ausente continua disponível. Origem Manual/Site e consentimento saem das listas
  de Pessoas/Contatos e permanecem na ficha da pessoa.
- Tooltip conserva nome acessível/dica curta, sem barra/setinhas de rolagem. O reset de
  overflow e do pseudo-elemento é restrito ao painel.

## Progresso e evidência

Implementação e validação local concluídas. Evidência efêmera e capturas:
`artifacts/ajustes-painel-2026-10-06/`, ignorado pelo Git.

A verificação anterior à implementação reproduziu origem na lista, menu parcial, Esc sem
retorno e filtro sem foto presente. A revisão visual/independente encontrou ações da
tabela comprimidas em coluna; o grupo de ícones foi corrigido para não quebrar internamente.

**Validação final:** typecheck, lint, 3 arquivos/21 testes existentes, build e smoke SSR
aprovados. Chrome/API simulada: 63 cenários, 59 capturas, sem erros JavaScript,
requisições API inesperadas ou overflow horizontal. Matriz 320/390/768/1440 claro/escuro
para Pessoas, Contatos, Corretores, Imóveis, ficha, seletor e menu. Inclui teclado,
tooltip sem rolagem, histórico/POP/entrada direta, guarda de edição, seletores das demais
listagens, atendimento erro/retry/transições e permissões ADMIN/CORRETOR; regressão pública
de catálogo, detalhe e menu. Capturas representativas inspecionadas visualmente.
`git diff --check` aprovado; diff staged antes/depois com SHA-256 idêntico.
Evidência ignorada: `artifacts/ajustes-painel-2026-10-06/`.

API/banco/serviços reais, Safari/iOS e dispositivo físico continuam sem homologação.
QA simulado não altera dados reais. Nenhuma suíte rastreada foi criada ou ampliada.
