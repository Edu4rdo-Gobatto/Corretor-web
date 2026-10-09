# Carga persistente do catálogo — 03/10/2026

Resumo atualizado em 09/10/2026.

- **Pedido:** preencher de verdade o banco da API com conteúdo ilustrativo, sem modo demonstração no site.
- **Resultado:** 12 imóveis de Juara/MT (3 salas, 3 lojas, 3 galpões, 2 terrenos e 1 prédio), 36 fotos, 9
  características e um ADMIN Codice responsável pelos anúncios. As 114 linhas anteriores foram preservadas.
- **Fotos:** cópias no R2, mas `R2_PUBLIC_URL` respondeu 401. O banco aponta para as URLs originais da Unsplash
  (36/36 com HTTP 200 em 03/10). Fontes e licenças:
  [2026-10-03-fontes-catalogo.md da API](../../Corretor-API/docs/2026-10-03-fontes-catalogo.md).
- **Como:** comando `npm run seed:catalogo:simular` / `:executar` da API, com backup antes da escrita e reexecução
  que ignora o que já foi feito. Sem migration. A senha do Codice ficou fora do Git.
- **Conteúdo:** preços, áreas e endereços são sintéticos; as descrições avisam que as imagens são ilustrativas.
- **Pendente:** fotos reais e domínio público do R2 (CONTEUDO-001 em [TASKS.md](TASKS.md)).
- **Validação na época:** typecheck, lint e build; catálogo, detalhe, galeria, robots, sitemap e 404 conferidos no
  navegador local. Na época não havia suítes de teste; a suíte mínima voltou em 04/10.
