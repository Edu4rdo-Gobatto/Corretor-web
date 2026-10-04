# Carga persistente do catálogo — 03/10/2026

Plano aprovado em conversa e esclarecido: o dono quer preencher de verdade o banco atual da API
com conteúdo ilustrativo e fotos obtidas na internet, sem criar modo demo no site.

- Criar 12 imóveis de Juara/MT: 3 salas, 3 lojas, 3 galpões, 2 terrenos e 1 prédio;
  7 locações, 4 vendas, 1 locação/venda, 3 destaques e 1 terreno sob consulta.
- Fotos de referência licenciadas, 3 por anúncio, capa distinta. Descrição identifica imagens
  ilustrativas e endereços são de conteúdo, sem alegar estoque comercial confirmado.
- Criar ADMIN Codice, codice@demo.invalid, CPF sintético válido/único, WhatsApp da marca.
  Senha aleatória forte gerada e guardada antes do insert fora de Git/OneDrive, ACL privada.
- ADMIN ativo id 1 é autor do novo administrador. Codice assume os anúncios.
- Usar serviços/DTOs e TypeORM existentes, TLS verificado, sem migration/dependências novas.
- Simulação consulta sem escrever; backup completo não vazio antes da escrita.
- Marcador interno por anúncio e manifesto privado por lote. Reexecução ignora registros
  concluídos e nunca altera senha, imóveis/mídias anteriores ou edições posteriores.
- Conexão Neon direta e trava de sessão dedicada. Imóveis começam inativos; upload fora
  de transação PostgreSQL; publicação somente após completar galeria e verificar integridade.
- Retomada reconcilia banco/R2/journal; divergência exige revisão, sem sobrescrita automática.
- QA: typecheck/lint/build, ausência de suítes registrada no npm test; API/R2 reais e navegador
  local, catálogo/detalhes/filtros/galerias/robots/sitemap/404. Nada de commit/push/deploy.
- Atualizar documentação de contexto dos dois repositórios sem apagar histórico.

## Registro de execução

| Etapa | Responsável | Estado |
|---|---|---|
| Comando de carga e proteção de reexecução | Codex | concluído; revisão independente reportou correções já incorporadas antes da quota do agente |
| Manifesto e proveniência das fotos | Codex | concluído; 36 fontes/licenças documentadas |
| Backup, credenciais privadas e execução | Codex | concluído; backup privado, Neon direto e R2 verificados |
| Revisão do comando | Codex | concluído por inspeção final e typecheck/lint/build |
| QA e documentos finais | Codex | concluído localmente; UI SSR, imagem carregada, verificação completa do backup |

Resultado real: foram criados 12 imóveis ativos, 9 características, 1 ADMIN Codice e 36 mídias,
preservando as 114 linhas do snapshot. R2 confirmou os objetos, mas `R2_PUBLIC_URL` retornou HTTP
401. O comando conserva cópias no R2 sem mudar a política do bucket e usa as URLs originais
`images.unsplash.com` nas linhas de mídia; 36/36 responderam HTTP 200 em 03/10/2026. Sem migration,
commit, push, deploy ou alteração dos anúncios anteriores. `npm test` continua sem arquivos e não
foi contado como aprovação.

Decisões: trabalhar direto na main por instrução do dono; não recriar suítes removidas.
O frontend conserva seu contrato de dados e não recebe fallback fictício ou configuração demo.
