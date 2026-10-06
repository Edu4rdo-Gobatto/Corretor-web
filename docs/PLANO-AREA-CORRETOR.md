# Área do Corretor — pedido consolidado e plano futuro

Data: 06/10/2026. Estado: refatoração anterior revertida; este documento é somente planejamento, sem autorização para nova implementação.

## Resumo do pedido

Deixar o painel agradável para trabalhar, elegante, simples e fácil de entender. Reduzir caixas decorativas sem eliminar organização, identificação das telas ou destaque das ações. Preservar fontes, identidade azul/dourado, site público, dados, permissões e contratos da API.

A tentativa com ícones sem nomes e textos pequenos foi rejeitada. A direção final solicitada é sidebar com nomes visíveis, ícones destacados, botões arredondados, campos outlined e textos confortáveis. A reversão solicitada abrange as mudanças visuais e funcionais desta conversa.

## Requisitos visuais

- Textos principais 18px, auxiliares 16px e títulos principais 20px; subtítulos 18px com peso maior, inclusive nos formulários e modais.
- Sidebar aproximadamente 260px, ícone e nome em cada destino, indicação clara da tela ativa; mobile com menu nomeado.
- Desenhos brancos sobre bases amarelas/douradas arredondadas na sidebar, acompanhados dos nomes.
- Ações principais Novo, Filtrar, WhatsApp e Responder com ícone e texto. Editar e ver ficha com ícone e tooltip contextual.
- Botão de ação inteiro dourado #b3892d, hover #b18424, desenho branco e texto azul-escuro; preservar distinção destrutiva e desabilitada.
- Botões com cantos de 12px, altura mínima 48px e ícones de 22–24px. Confirmações e ações financeiras mantêm texto.
- Inputs/selects/textarea com rótulo acima, contorno nítido, fundo discreto, cantos arredondados e texto 18px; foco, erro e dicas visíveis.
- Contatos em blocos suaves, com fundo discretamente diferente e espaço interno. Imóveis e Contratos continuam em tabelas confortáveis, mudando para mobile antes de comprimir colunas.
- Cabeçalhos com ações próximas ao título; corrigir alinhamento de Responder contatos e evitar símbolos soltos/espaços excessivos.
- Usar componentes e tokens compartilhados somente no painel, sem espalhar correções isoladas ou alterar o site público.

## Requisitos funcionais

1. Tooltips em cada botão ao receber foco ou hover, com nome acessível e aria-describedby. Permanecem enquanto houver foco/hover, sem interceptar clique ou cortar nas bordas. Esc fecha primeiro a dica e consome esse evento.
2. Contratos abrem ao clicar na linha/item inteiro; manter link acessível e abertura em outra aba. Controles/referências internos executam somente a própria ação.
3. Clique no imóvel abre ficha de consulta; nome/avatar do corretor abre perfil, inclusive a própria conta. Reutilizar Dialogo e ficha existente, separar edição por permissão e mostrar apenas dados disponíveis/autorizados. Incluir loading, erro com retry, indisponível e restauração de foco.
4. Campos numéricos compartilhados para valores, áreas, percentuais e quantidades, com unidade fora da edição. Aceitar vírgula/ponto e colagem 1.234,56; rejeitar letras, sinais e notação científica. Preservar precisão, limites, opcionais e formatos atuais da API.
5. Modal sem mudanças fecha com um Esc após tooltip/seleção. Com mudanças, primeiro Esc avisa: “Há alterações não salvas. Pressione Esc novamente para descartar e sair.” Segundo Esc consecutivo descarta pendências e fecha, sem prazo. Nova edição, clique ou outra tecla desarma.
6. Comparar valores atuais/iniciais: conteúdo pré-preenchido não é alteração e restaurar os valores iniciais permite fechar com um Esc. Bloquear fechamento durante operações; descarte não reverte o que já foi persistido.
7. Fechar apenas a sobreposição superior. Botão fechar e clique externo permitido pedem confirmação explícita se houver alterações. Sem sobreposição, Esc volta dentro do painel respeitando guardas; acesso direto retorna à lista e telas principais à visão geral.
8. Ctrl/⌘+K abre comandos pesquisáveis permitidos, com setas/Enter; / foca busca e ? abre ajuda fora da digitação. Ctrl/⌘+Enter envia edição ativa, priorizando modal, com validação e bloqueio de duplicidade, sem confirmar ações destrutivas/financeiras.

## Plano de execução futura

1. **Revisar o painel atual e conversar ponto a ponto.** Identificar o que já atende ao pedido e apresentar uma lista curta dos ajustes necessários.
2. **Preparar uma tela de referência.** Usar Contatos para demonstrar tipografia, botões, campos, sidebar e blocos. Revisar com o dono antes de propagar a linguagem visual às demais telas.
3. **Consolidar componentes compartilhados.** Aplicar a referência aprovada em Visão geral, Imóveis, Contratos, formulários e modais; conferir público intacto.
4. **Implementar os comportamentos em etapas.** Tooltips e números; contratos e fichas; depois pilha de modais, dois Esc, guardas e atalhos. Preservar serviços e permissões existentes.
5. **Validar a entrega.** Typecheck, lint, os 21 testes existentes, build e smoke SSR, sem ampliar suítes fonte. Conferir teclado, foco, tooltips, seletores, modais sobrepostos, dois Esc/desarme/valores restaurados, ações internas, números e ADMIN/CORRETOR.
6. **Revisar visualmente e registrar.** Contatos, Visão geral, Imóveis, Contratos, formulários e modais em 390/768/1440, claro/escuro; legibilidade, contraste, alinhamento, quebra e ausência de overflow. Atualizar os cinco documentos preservando histórico e separar QA simulado de integração real.

## Limites

Somente frontend. Sem novas dependências, alterações de API ou dados, migrations, commit, push ou deploy. Não reimplementar automaticamente: a solicitação atual é reverter e entregar este plano.

## 06/10/2026 — Adendo: retomada autorizada pelo dono

O texto acima preserva o pedido de reversão e a proposta daquele momento. Depois, o parceiro
publicou a base visual em `a2a9f81` e o dono pediu para continuar e implementar o plano.
A fonte vigente passa a ser `2026-10-06-painel-especificacao-visual.md`, que substitui esta proposta.
Ela define a escala 28/22/18/16/14, Pessoas como referência, duas filas em Contatos, somente
Ctrl/⌘+K e descarte armado também com Enter. No plano aprovado, fichas novas são telas próprias.

Primeiro marco implementado e validado: Contatos; aguarda revisão do dono conforme seção 8 da
especificação antes de propagar às outras telas. Próximas fases e limites em TASKS/PROJECT_STATUS.
Os registros e requisitos anteriores permanecem como histórico, sem autorizar a volta dos padrões rejeitados.

## 06/10/2026 — Adendo: specs completas autorizadas e concluídas localmente

O dono autorizou aplicar a especificação vigente ao restante do painel, incluindo fichas em
telas próprias, CampoNumero, guarda e somente Ctrl/⌘+K. A continuação foi implementada e
validada; registro em `2026-10-06-conclusao-area-corretor.md`. O checkpoint e as pendências
anteriores retratam o primeiro marco. Não retomar os padrões/atalhos rejeitados deste plano
histórico. Integração real e Safari/iOS/celular físico continuam sem homologação; sem publicação.
