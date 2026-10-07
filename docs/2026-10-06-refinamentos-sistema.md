# Refinamento de contatos, perfil e filtros — plano autorizado

Pedido do dono em 06/10/2026: corrigir quebras de texto, Contatos em abas, WhatsApp com ícone,
perfil em grid compacto, upload real da foto e filtros automáticos no público e painel.
Implementação local nos dois repositórios, preservando trabalho anterior, sem publicação/migration.

## Execução

- [x] Seletores e Contatos: largura por conteúdo, abas, paginação independente e ações compactas.
- [x] Filtros: seleções imediatas, digitação 350 ms, validação e sincronização de URL/SSR.
- [x] Perfil: grid compacto, prévia, arquivo/URL, guarda e formulários independentes.
- [x] API: PATCH JSON/multipart, R2 compartilhado, compensação e leitura pública controlada.
- [x] Validar comandos, cenários HTTP/browser e render do documento System Design.
- [x] Atualizar contexto e índice dos dois repositórios sem apagar histórico.

## Decisões de execução

- O plano da conversa é a especificação vinculante. Execução direta na main foi autorizada;
  instruções do projeto e pedido atual prevalecem sobre worktree/commits da skill.
- Não recriar suítes rastreadas: cenários novos ficam em artifacts ignorados. API sem suíte fonte;
  frontend conserva os três arquivos atuais. Não usar resultados históricos como prova desta entrega.
- Manter url_foto HTTPS no banco; exibição usa rota da API por id/revisão, inclusive para URLs externas.
  Evita migration, URLs temporárias e mudança na política do bucket privado.

## Validação

Concluída localmente em 06/10/2026. Homologação de uma conta real e aceite visual do dono
permanecem como etapas posteriores, sem impedir a entrega local autorizada.

| Verificação executada | Resultado e alcance |
| --- | --- |
| `npm run typecheck`, `npm run lint`, `npm run build` nos dois repositórios | Aprovados. Build do frontend mantém os avisos já existentes de anotações do Zod/Rollup. |
| `npm test -- --maxWorkers=1 --reporter=dot` no frontend | 3 arquivos existentes, 21 testes aprovados; nenhuma suíte fonte nova. |
| `npm test -- --runInBand --passWithNoTests` na API | Saída 0, sem testes encontrados; não representa cobertura por suíte da API. |
| `node scripts/seo-smoke.mjs` no frontend | SSR, metadados, paginação, 404, descoberta, proxy com cookies, função Vercel em Node isolado e recuperação de indisponibilidade aprovados. |
| HTTP efêmero, controllers/DTO/interceptors/serviços reais | 22 cenários aprovados com R2 e repositório simulados. Guard de sessão sintético; OrigemGuard real. |
| Reprodução de foto concorrente | URL gerenciada obsoleta recebe 409; foto atual permanece registrada e armazenada. |
| Navegador Chrome, frontend de produção e API isolada | 22 cenários funcionais e uma matriz visual aprovados (23 registros), sem erros inesperados. |
| Matriz visual | 32 capturas: Contatos, Perfil, Pessoas e Catálogo × 320/390/768/1440px × claro/escuro; sem overflow horizontal. |
| R2 real, objeto temporário isolado | Envio, leitura byte a byte e exclusão confirmados; leitura posterior retornou ausência do objeto. Sem gravação de avatar no banco. |
| System Design | 6 páginas renderizadas e todas inspecionadas visualmente; template original preservado, estilos/geometria mantidos. |
| Integridade dos repositórios | `git diff --check` aprovado; patch do índice preexistente da API preservado byte a byte. |

### Comportamentos conferidos

- Seletores: rótulos extensos, largura pelo conteúdo, posicionamento acima/abaixo, teclado e Esc.
  Contatos: abas com páginas independentes, CSV da página, edição/atendimento/finalização,
  reabertura por ADMIN no frontend e falha com nova tentativa.
- Filtros: espera de 350 ms, seleção durante espera, Enter sem duplicata, limpeza e chips,
  intervalos inválidos conservando resultados, URL direta, voltar/avançar, foco e scroll preservados,
  respostas antigas descartadas. Imóveis, Pessoas, Contatos e Contratos usam a lógica compartilhada.
  Comissões e Cadastros conservam a filtragem automática existente.
- Perfil: prévia local, troca entre arquivo/URL, substituição, remoção somente ao salvar, guarda de
  alterações e bloqueio durante envio. Salvar dados/foto preserva a senha digitada no formulário
  independente. Sessão e exibição da foto são atualizadas após sucesso.
- API: JSON compatível, multipart exclusivo com um arquivo, origem, tipos/assinatura, arquivo vazio,
  limite de 10 MiB e arquivo adicional; falhas de R2/banco, compensação, ordem Put → banco → Delete,
  URL externa preservada, corretor inativo sem foto pública e chaves arbitrárias ignoradas.

### Ajustes encontrados durante a revisão

As reproduções iniciais expuseram perda de foco ao mudar a URL do catálogo, limpeza ineficaz
quando somente a página estava alterada, validação numérica dependente do DOM anterior ao commit
e risco de restaurar uma foto antiga de outra aba. As correções foram verificadas novamente:
catálogo permanece montado, limpeza reinicia a URL, validação usa o rascunho e o estado de entrada,
frontend omite `url_foto` quando não foi editada e API rejeita referência gerenciada obsoleta.
Na conferência visual, os campos do perfil foram alinhados e as ações de Contatos reunidas em
uma linha em containers amplos. Falhas iniciais do roteiro/fixture foram corrigidas no próprio
roteiro e não usadas como evidência de defeito do produto.

### Limites da homologação

O armazenamento foi verificado no R2 real com objeto temporário, posteriormente removido.
Fluxos HTTP/browser usaram banco e autenticação isolados; não houve login real, gravação de avatar
no Neon ou homologação conjunta login → upload → persistência → proxy. Também não houve teste
em aparelho físico ou Safari/iOS. Esses limites estão registrados no status e no System Design.
Falha de exclusão de um objeto gera log para tratamento operacional; não desfaz perfil confirmado.

## Entrega e referências

Alterações permanecem locais, sem commit, push, deploy ou migrations. Os arquivos de catálogo e
o índice preexistentes da API foram conservados; mudanças de documentação são aditivas.
Roteiros e capturas de QA ficam somente em `artifacts/refinamentos-2026-10-06/`, ignorados pelo Git,
e os servidores temporários foram encerrados.

- [Especificação visual atualizada](2026-10-06-painel-especificacao-visual.md)
- [System Design — documento editável](2026-10-06-system-design.docx)
- [Contrato da foto na API](../../Corretor-API/docs/2026-10-06-foto-perfil.md)
- [Índice da documentação](INDICE.md)
