# Auditoria técnica full stack — 02/10/2026

Auditoria do front (`94ebcef`) e da API (`e3b0a32`) feita em 02/10, com correções revisadas em 03/10. Este arquivo foi
resumido em 09/10/2026 com o status atual de cada achado, conferido no código. O relatório completo, com evidências e
reproduções, está no Git (versões anteriores deste arquivo).

O veredito original era bloquear a publicação até corrigir A01. A01 foi corrigido em 03/10.

## Achados

| Id | Achado | Área | Status em 09/10 |
|---|---|---|---|
| A01 | Contrato permitia a um corretor ganhar acesso a pessoas de outros responsáveis | API | Resolvido em 03/10. `locacoes.service.ts` recusa vincular pessoa sem autorização (403). Validado com HTTP sintético |
| A02 | Upload acumulava memória antes do limite total | API | Resolvido em 03/10. O limite é aplicado durante a leitura; no máximo 2 uploads simultâneos, cota compartilhada entre mídias e foto |
| A03 | Reset de senha pelo ADMIN não revogava sessões | API | Resolvido. Reset e desativação pelo ADMIN apagam as sessões do corretor (`corretores.service.ts`) |
| A04 | Remontar o painel reaplicava um resultado antigo de sessão | Front | Resolvido em 03/10. `ProvedorSessao` ignora restaurações invalidadas; renovação única em `renovarSessao` |
| A05 | Carga inicial podia apagar o preenchimento de um imóvel novo | Front | Resolvido. O formulário só aparece depois da carga das classificações |
| A06 | Telefone aceito no formulário era rejeitado pela API | Integração | Resolvido. Regra única em `src/servicos/validacao.ts`, igual à da API |
| A07 | Filtros deixavam paginação e CSV fora de sincronia em Contatos | Front | Resolvido. Respostas obsoletas ignoradas; hoje Contatos usa abas com páginas independentes |
| A08 | Resposta antiga podia trocar o imóvel de uma comissão | Front | Resolvido. Busca do contrato por id com sequência; desde 09/10 o cliente é revalidado antes do POST |
| A09 | Editar outro campo podia desativar característica oculta | Integração | Código corrigido em 03/10. Falta homologar no PostgreSQL real |
| A10 | Busca de telefone formatado não achava o cadastro | API | Código corrigido (`regexp_replace` e prefixo 55). Falta conferir com dados legados reais |
| A11 | SSR podia responder 503 enquanto a API inicia | Integração | Mitigado: orçamento de 45s, 503 com `Retry-After: 30` e recuperação automática da página. Falta medir o cold start publicado |
| H01 | Isolamento das pastas do Drive depende de ACLs não verificadas | Infra | Pendente. Hipótese a validar nas ACLs reais |

## Outros pontos

| Ponto | Status em 09/10 |
|---|---|
| Imóveis duplicados por id/slug na API | Resolvido em `f585fed` (20/09), fora dos achados originais |
| Fluxo de sessão descrito na auditoria ("renovação rotativa") | Desatualizado. Desde 06/10 a API usa sessão de 4h por inatividade, sem rotação |
| "Bootstrap 503 sem recuperação automática" | Desatualizado. `PaginaIndisponivel` com `useRecuperacaoPagina` recupera sozinha |
| Controles confirmados: limite de login, troca de senha revogando sessões, token em memória, `ValidationPipe`, JSON-LD serializado, centavos em BigInt, assinatura de upload | Continuam valendo |

## Testes

As evidências de 02 e 03/10 usaram as suítes da época (até 43 arquivos e 231 testes no front). Elas foram removidas
em 03/10. Hoje o front tem 3 arquivos e 23 testes, e a API não tem suítes. As pendências A09, A10, A11 e H01 estão
em [TASKS.md](TASKS.md) (AUDIT-001).
