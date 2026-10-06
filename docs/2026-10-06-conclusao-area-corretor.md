# Conclusão local da especificação da Área do Corretor — 06/10/2026

O dono aprovou a continuação integral após Contatos: aplicar as specs completas ao restante
do painel, incluindo fichas próprias, CampoNumero, descarte de alterações e Ctrl/⌘+K.
Fontes vigentes: `2026-10-06-painel-especificacao-visual.md` e seu adendo 12,
`2026-10-06-ajustes-painel.md`. Este registro substitui o estado pendente das etapas anteriores,
preservadas como histórico. Implementação e validação local concluídas; sem publicação.

## Entrega

| Frente | Resultado |
|---|---|
| Imóveis e formulário | Lista com link real/linha clicável, consulta separada da edição, ações por permissão, responsável/proprietário vinculados; rascunho, duplicação, mídias e DTO preservados |
| Contratos e detalhe | Listagem compartilhada, vínculos para fichas, edição/arquivamento existentes, operações financeiras e Drive com texto e fluxos atuais |
| Comissões | Lista e ficha própria, referências com estados independentes, editor e recebimento; valores/parcelamento em centavos e confirmações preservados |
| Cadastros e Corretores | Listas, editores e fichas próprias, ações discretas à direita e consultas conforme cargo |
| Visão geral e Perfil | Resumos com Tabela, vínculos e tipografia vigentes; guarda conjunta para perfil/senha e reset apenas da edição salva |
| Pessoas | Ficha e vínculos consistentes, edição protegida, seleção original restaurável e origem/consentimento somente na ficha |
| CampoNumero | Unidade externa, vírgula/ponto e colagem agrupada, sem letras/sinais/exponente; esquemas/limites/DTO existentes |
| Dialogo | Dirty/busy opt-in, Esc + Esc/Enter, desarme, X/Cancelar/clique externo com confirmação, prioridade da camada superior e bloqueio durante envio |
| Comandos | Ctrl/⌘+K pesquisável, destinos/ações permitidos, setas/Enter/Esc; botão de busca disponível no mobile |

As novas consultas são rotas próprias: `/admin/imoveis/:id`, `/admin/comissoes/:id`,
`/admin/cadastros/:categoria/:id` e `/admin/corretores/:id`. O próprio corretor abre
`/admin/perfil`. ADMIN usa os GETs existentes de corretores/classificações. CORRETOR consulta
somente dados públicos de outro corretor já disponíveis nas fichas autorizadas de imóveis,
sem pedir CPF, e-mail ou endpoints de corretores restritos. Não encontrar dados vira
indisponível; 500/conexão mantém erro e retry. Id/categoria inválidos não geram consulta inválida.

Os ajustes anteriores continuam: menu mobile inteiro; seletores dos filtros estilizados;
Esc retorna ao histórico interno com fallback e guarda; cards mantêm identificação à esquerda
e valores/ações à direita; checkbox Atendido; tooltip sem setas/rolagem; filtro sem foto removido.
A regra de reabertura de atendimento somente por ADMIN permanece uma restrição do frontend.

## Decisões de implementação

- `CampoNumero` mantém texto durante edição. Ao receber `1.234,56`, remove apenas os pontos
  de milhar, ficando `1234,56`, para permitir apagar/editar os decimais sem travar. A conversão
  fica nos adaptadores das telas; dinheiro de contrato/comissão continua string decimal exata.
- `Dialogo` recebe `alterado`/`ocupado` opcionais; consumidores públicos conservam os defaults.
  A pilha controla fechamento/foco e trava do corpo quando há modais aninhados. Teclas rejeitadas
  pelos controles também desarmam o aviso; repetição de Esc não confirma descarte.
- Cancelar dos editores usa `data-fechar-dialogo`. Descarte de formulário nunca desfaz mídia,
  pagamento ou outra operação já persistida. Pagamento de comissão também participa da guarda.
- A paleta executa depois da desmontagem do diálogo, para comandos de foco não serem
  sobrescritos pela restauração de foco. Não há `/`, `?` ou Ctrl/⌘+Enter.
- Perfil protege as duas edições em conjunto. Se o PATCH salvar mas a atualização da sessão
  falhar, informa explicitamente que a gravação ocorreu; não volta a tratar o perfil como pendente.
- Selecionar novamente o imóvel original de uma pessoa reutiliza sua referência inicial:
  a mudança do título de apresentação não mantém o formulário sujo quando o id é igual.
- Reutilizados serviços, tokens, fontes e ícones. Estilos adicionados ficam em `.painel-ui`.
  Nenhuma dependência, endpoint de backend, migração ou alteração persistente foi introduzida.

## Validação executada

Após as correções finais, todos com exit 0:

- `npm run typecheck`, `npm run lint`, `npm test`: 3 arquivos, 21 testes existentes.
- `npm run build`: cliente, SSR e saída Vercel; avisos conhecidos de annotations do Zod.
- `node scripts/seo-smoke.mjs --serve`, reiniciado após o build final: SSR/metadados/paginação,
  redirecionamento/404/descoberta, proxy e cookies, função Vercel independente, 503/HEAD/recuperação.
- Chrome/API simulada: **320 cenários, 140 capturas**, sem erros JavaScript, requisições API
  inesperadas ou overflow horizontal. 232 cenários de matriz + 36 comportamentos + 52 complementares.
- Matriz de todas as telas/fichas/formulário de imóvel em 320/390/768/1440, claro/escuro,
  ADMIN/CORRETOR, excluindo telas administrativas não permitidas no cargo CORRETOR.
- Menu inteiro e foco; sidebar sem scroll em 1366×657 e 1440×900; linhas, links reais,
  Ctrl+clique e ação interna independente; tooltip/seletores antes do Esc e histórico/fallback.
- Modal limpo/pré-preenchido, dois Esc/Esc+Enter, desarme por tecla/clique/edição, valores
  restaurados, X/Cancelar/clique externo, camada superior, repeat, scroll e envio ocupado/erro/retry.
- Números por teclado/colagem/vírgula/ponto/Backspace, vencimento 1–31, parcelas 1–600,
  prévia com centavos/fim de mês, áreas e vazios opcionais; DTOs decimais preservados.
- Rascunho e guarda do imóvel; perfil/senha com reset independente e falha de sessão após salvar;
  fichas 403/404/500/retry, identidade própria, classificação inválida e consultas por cargo.
- Atendimento: marcar/desmarcar/finalizar/reabrir; pagamento exige confirmação explícita e
  descartar não baixa parcela. Regressão pública de catálogo, detalhe e menu nos dois temas.
- Revisão estática delegada das telas e revisão consolidada. Cinco lacunas de guarda/foco/
  desarme/colagem/valor restaurado corrigidas; revisão posterior não encontrou novo achado acionável.
- `git diff --check`; índice staged idêntico ao snapshot anterior, SHA-256
  `65c8c19c83ff479bbfc0667377c8cb087dd0008d64c9feafcf994f635ef7661c`.

Capturas representativas foram inspecionadas visualmente. Evidência ignorada:
`artifacts/conclusao-area-corretor-2026-10-06/` (JSONs, prints, relatórios e snapshots).
Scripts efêmeros de QA removidos ao terminar; nenhuma suíte rastreada foi criada/ampliada.

## Prévia e limites

Servidor de desenvolvimento mantido em `0.0.0.0:5173`. Wi-Fi atual verificado neste host:
`http://192.168.0.20:5173/admin/entrar` (HEAD 200). Uma sondagem de login com corpo vazio,
sem credenciais, e Origin desse endereço retornou 400 de validação dos campos, sem rejeição
de origem. Isso não homologa um login real nem prova conectividade do dispositivo físico.
O IP/processos de desenvolvimento são temporários; revalidar ao retomá-los.

QA simulado não alcançou banco/API reais. Login autenticado, permissões do backend, upload
R2, Drive, pagamentos reais, Safari/iOS e celular físico continuam sem homologação nesta etapa.
Trabalho local diretamente na main, preservando histórico, alterações anteriores e índice.
Sem commit, push ou deploy.
