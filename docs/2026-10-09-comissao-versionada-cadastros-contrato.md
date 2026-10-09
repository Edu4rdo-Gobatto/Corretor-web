# Comissão editável, cadastros de contrato e slogan (09/10/2026)

O código de `src/`, `scripts/` e `tests/` entrou no commit `40f635b` ("[FIX] Cards", 09/10 16:51), feito pelo dono durante a sessão e já enviado à `origin/main` junto com ajustes visuais dos cards. Esta documentação e o `corretor-spec.json` ficaram sem commit.
Sem deploy registrado. Depende da API com a migration
`1789689600000-comissao-versionada-cadastros-contrato`. Registro completo da API em
[../../Corretor-API/docs/2026-10-09-comissao-versionada-cadastros-contrato.md](../../Corretor-API/docs/2026-10-09-comissao-versionada-cadastros-contrato.md).

## Painel
- **Comissão:** `EdicaoComissao` reaproveita `EditorComissao`. O formulário vem preenchido com o plano vigente e
  mostra a prévia do novo plano.
  - Com recebimento registrado, ou com a comissão arquivada, o diálogo mostra só observações e explica o bloqueio.
  - Toda alteração envia `versao_registro`. Um 409 mostra a mensagem da API e o botão "Recarregar ficha".
- **Ficha da comissão:** a caixa "Comissão ativa" do formulário deu lugar aos botões Arquivar e Reativar, com
  confirmação. A ficha ganhou a seção "Histórico do plano": plano vigente, autor, data, vínculos e receita. O plano
  legado aparece como "Registro anterior ao histórico".
- **Cadastros:** a rota agora é `/admin/cadastros/:categoria`, e `/admin/cadastros` redireciona para `tipos-imovel`.
  - Seletores de Grupo (Imóveis | Contratos) e Categoria.
  - A ficha volta para a lista da sua categoria pelo botão Voltar, pelo Esc (`useVoltarPainel`) e pelo voltar do
    navegador.
  - Formulários próprios para índice de reajuste (nome, periodicidade com sugestão de 12 meses, regra) e tipo de
    contrato (nome, descrição).
  - As categorias novas ficam fora de `classificacoesPublicas` e do SSR.
- **Contrato:** selects de tipo e índice, com as opções ativas. A escolha atual aparece marcada como "(desativado)"
  se o cadastro tiver sido desativado depois.
  - Sem opções disponíveis, o ADMIN vê um link para Cadastros e o CORRETOR vê "peça a um administrador".
  - Contrato legado mostra o texto antigo e exige classificar para salvar.
  - A ficha mostra o tipo, o índice, a periodicidade e a regra do snapshot. Num contrato legado, mostra o texto antigo
    com a marca "Registro anterior aos cadastros de índice".

## Público
- O slogan padrão "Imóveis para alugar e comprar em Juara-MT e região" fica em `brand.slogan` e `brand.tagline`.
  Aparece no h1 do catálogo (com a parte final em destaque), no rodapé e no `<title>` da página inicial.
- `scripts/seo-smoke.mjs` compara o h1 e o `<title>` com o slogan. Isso fecha o SMOKE-001.

## Validação (09/10)
- `typecheck` e `build` aprovados. O `lint` dá 0 erros e 2 avisos que já existiam em `Catalogo.tsx`. `npm test`
  passa 23/23. `node scripts/seo-smoke.mjs` passa.
- Navegador (Chrome headless, API completa com login real e PostgreSQL descartável): 37/37. Cobriu:
  - permissões por cargo, criação e duplicidade nos cadastros;
  - navegação com categoria preservada;
  - contrato novo e legado;
  - edição com novo plano e conflito de versão;
  - arquivar e reativar;
  - só observações após recebimento;
  - tema escuro, 390 e 320 px sem rolagem horizontal;
  - SSR, rodapé e título com o slogan.

O roteiro ficou fora do repositório. `tests/visual/api-simulada.ts` só recebeu os campos novos para continuar
compilando; nenhuma spec foi criada.

## Pendências
- Publicar a API (com a migration aplicada no Neon e backup verificado) antes deste front. O formulário de
  contrato não salva contra a API antiga. **Atenção:** o `40f635b` já está na `origin/main`; se a Vercel publicar a
  `main` automaticamente, o front novo pode sair antes da API.
