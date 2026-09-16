# Diagnóstico de produto — 16/09/2026 (Claude)

Varredura do front (`corretor-web`) e da API (`../Corretor-API`) com o olhar de um corretor
usando o sistema no dia a dia. Fonte: o código, não os READMEs. Nada foi alterado além deste
documento e dos registros de status.

Estado da base no momento da varredura: `main` limpa em `30be2bb`; typecheck e lint sem erro;
31 arquivos e 153 testes aprovados no front; ~130 casos na API (relato do agente de mapeamento).

## 1. Veredito

O que existe é sólido tecnicamente: SSR com SEO e JSON-LD, sessão com token só em memória e
refresh de uso único, upload com compressão no navegador e validação de assinatura no servidor,
consentimento LGPD gravado com IP e versão, mobile bem resolvido, suíte de testes real.

O que falta é o **fluxo de trabalho do corretor**. Hoje o produto é uma vitrine com cadastro;
ainda não é uma ferramenta de trabalho. Os buracos estão em cinco lugares: publicação do anúncio,
chegada e acompanhamento do contato, cadastro de pessoas, ficha do imóvel e busca.

## 2. Pontos críticos (impedem vender ou usar todo dia)

| # | Problema | Onde | Efeito para o corretor |
|---|---|---|---|
| 1 | Imóvel vai ao ar sem foto e sem revisão. O formulário obriga salvar antes de enviar mídia e a API cria com `ativo=true` + `DISPONIVEL`. | `src/pages/admin/PropertyForm.tsx:197`; API `imoveis.service.ts:41` | O anúncio aparece no site com "Foto em breve" enquanto ele ainda está preenchendo. Não existe rascunho. |
| 2 | Contato chega e ninguém é avisado. `POST /clientes` só grava e responde `{id}`. | API `clientes.service.ts:30` | Se o visitante fechar o WhatsApp sem enviar, o lead fica parado até alguém abrir o painel. |
| 3 | Não há acompanhamento de contato: sem status, sem anotação, sem próximo passo. | API `cliente.entity.ts:10-24`; `src/pages/admin/LeadsList.tsx` | A tela "Contatos" é uma lista; não diz quem foi atendido, quem visitou, quem sumiu. |
| 4 | Pessoa cadastrada em três lugares: cliente (lead), parte de locação (locador/locatário) e nada no imóvel. | API `cliente.entity.ts`, `parte-locacao.entity.ts`; `imovel.entity.ts` sem `proprietario_id` | O lead que fecha precisa ser redigitado como inquilino; o imóvel não sabe quem é o dono até existir contrato. |
| 5 | Ficha do imóvel incompleta para o mercado: sem código curto, sem proprietário, um único valor (a finalidade "Locação e Venda" existe no seed), sem exclusividade/validade, sem "vendido" vs "alugado", sem motivo de baixa. | API `imovel.entity.ts:15-43`, enum `StatusImovel` | Referência no WhatsApp é um UUID de 36 caracteres (`src/services/lead.ts:13`, `src/pages/public/PropertyDetail.tsx:133`). |
| 6 | Busca pública fraca: filtros só por tipo, finalidade, cidade e preço; `busca` casa só o título; ordenação fixa por data. | API `imoveis.dto.ts:42-51`, `imoveis.service.ts:77-79` | Em Juara o filtro "cidade" quase não separa nada; falta bairro, área e "menor preço". |
| 7 | Bloqueios de lançamento já conhecidos: política de privacidade com campos vazios (aviso amarelo aparece em produção), API não publicada, plano Hobby da Vercel. | `src/config/brand.ts:13`, `src/pages/public/PrivacyPolicy.tsx:6`; `TASKS.md` DEPLOY-002 | Sem controlador e e-mail de privacidade, o site não pode ir ao ar. |

## 3. Melhorias no que já existe

Painel:

- Lista de imóveis (`src/pages/admin/PropertyList.tsx`): sem busca, sem filtro por status/tipo/corretor,
  sem miniatura, sem aviso "sem foto"; "Editar" e "Ver detalhes" levam ao mesmo lugar (linha 83).
  A API já aceita `busca`, `status` e `ativo`.
- Contatos (`src/pages/admin/LeadsList.tsx`): sem filtro por imóvel nem período (a API já tem
  `imovel_id`, `criado_desde`, `criado_ate`); busca só por nome (API `clientes.service.ts:57`, precisa
  buscar por telefone); link interno com `<a href>` recarrega a página (linha 78).
- Visão geral (`src/pages/admin/Dashboard.tsx`): dois números. Precisa mostrar pendências: contatos
  novos sem atendimento, imóveis sem foto, reservados há muito tempo, parcelas de comissão do mês,
  contratos vencendo. O perfil faz 7 chamadas para montar métricas (`src/pages/admin/Profile.tsx:52`);
  um endpoint `/admin/resumo` resolve painel e perfil de uma vez.
- Seletores de imóvel/pessoa/contrato (`RentalSelector` em `src/pages/admin/Rentals.tsx`,
  `src/pages/admin/ClientEditor.tsx`): busca + select + paginação é desajeitado. Um único combobox
  (campo com sugestões) substitui todos.
- Formulário do imóvel: CEP sem preenchimento automático; características como "select + valor" por
  linha (checklist com valor opcional é mais natural); sem preço por m².
- Cadastros de tipo: ícones e URLs bonitas só para os 5 tipos originais (`src/pages/public/Catalog.tsx:15`,
  `src/services/urls.ts:4`). Tipo novo cadastrado no painel funciona, mas sem ícone e com `?tipo=`.

Site público:

- Detalhe: mapa só como link (um `iframe` do Google Maps sem chave resolve), sem preço por m², sem
  telefone clicável, sem "imprimir ficha", referência em UUID.
- Início: sem seção de destaques, sem "Sobre o corretor" (confiança + SEO local), sem
  "Anuncie seu imóvel" para captar proprietários. Para corretor, captação vale tanto quanto lead.
- Similares só por tipo (`RelatedProperties`); tipo + finalidade + cidade é melhor.

## 4. Novas funcionalidades, por prioridade

P1 — antes de vender:

1. **Rascunho e publicação.** Campo `publicado` (ou status `RASCUNHO`) no imóvel; catálogo só mostra
   publicado com capa; botão "Publicar no site" no formulário. `ativo` fica só para arquivar.
2. **Código curto do imóvel** (`LG-0042`) exibido na ficha, no WhatsApp e no site; slug a partir do
   título + código, sem UUID.
3. **Aviso de novo contato** ao corretor responsável (e-mail transacional; o mesmo serviço serve
   depois para "esqueci minha senha").
4. **Funil de contatos**: status (novo, em atendimento, visita, proposta, fechado, perdido),
   anotações com data e "próximo contato em". Painel destaca os atrasados.
5. **Proprietário no imóvel** e status final `VENDIDO`/`ALUGADO`/`RETIRADO` com motivo.
6. **Filtros e ordenação**: bairro, área, ordenar por preço/área/recente, busca por bairro e descrição.
7. **Textos obrigatórios**: controlador, endereço e e-mail de privacidade; página "Sobre";
   formulário "Anuncie seu imóvel" (lead com origem `PROPRIETARIO`).

P2 — ferramenta de trabalho:

8. **Cadastro único de pessoas** com papéis (cliente, proprietário, inquilino), CPF/CNPJ opcional,
   substituindo `clientes` + `partes_locacao`. Muda a especificação de 13/09; é mais barato agora,
   antes de publicar e migrar o banco principal. Decisão do dono.
9. Valor de venda e de locação no mesmo imóvel; exclusividade com validade; data de captação.
10. Agenda de visitas simples (imóvel, pessoa, data/hora, resultado) ligada ao funil.
11. Ficha imprimível (CSS de impressão), mapa embutido, CEP automático.
12. Relatório de comissões por mês (a receber, recebido, atrasado) e exportação CSV de contatos.

P3 — diferenciais, só se cliente pedir:

13. Feed XML para portais (ZAP/VivaReal/OLX): "cadastra uma vez, publica em todos" vende bem.
14. Esqueci minha senha por e-mail; múltiplas fotos por arrastar.

Fora de escopo agora: multiempresa, financeiro completo, repasse de aluguel, assinatura digital,
aplicativo. Manter simples.

## 5. Código e manutenção

- **Formatação.** Não há Prettier nem regra de largura; linhas chegam a 2.481 caracteres
  (`PrivacyPolicy.tsx`) e `Rentals.tsx` tem 36 linhas acima de 200 colunas. O `CLAUDE.md` já pede
  `fold -w 400` para ler os arquivos, sintoma do problema. Adotar Prettier (largura 120) e reformatar
  em um commit só, validado pela suíte. Maior ganho de manutenção pelo menor risco.
- **Dois vocabulários.** Domínio em inglês (`Property`, `Lead`) traduzido em `src/services/portuguese.ts`,
  enquanto locações e comissões usam o contrato em português direto. Escolher português (igual à API e ao
  produto) e aposentar o tradutor aos poucos; funcionalidade nova não deve criar um terceiro estilo.
- **Duplicação no painel.** Cabeçalho, tabela e badge repetem as mesmas classes em `PropertyList`,
  `LeadsList`, `AgentsList`, `Dashboard` e `Profile`; só `Rentals` tem o objeto `rentalUi`. Extrair
  `PageHeader`, `DataTable` e `StatusBadge`.
- Sobras: `RentalGuard` (`Rentals.tsx:28`) repete o guarda do `AdminLayout`; fragmento solto na navegação
  (`AdminLayout.tsx:128`); `deleteProperty` sem uso (`api.ts:30`); `features` e `featureValues` são a
  mesma informação em dois formatos (`src/types/index.ts`).
- **Locações e comissões** somam 38 KB, a área mais pesada, para uma função que poucos corretores usam
  todo dia. Manter isolada e não crescer até o fluxo principal (imóvel → anúncio → contato → fechamento)
  estar redondo. A decisão de 12/09 dizia "somente ADMIN"; a API deixa corretor ler e escrever contratos
  e comissões (`locacoes.controller.ts:22`, `comissoes.controller.ts:10`). Alinhar documento ou código.

API (relato do agente, a confirmar com o back):

- Sem OpenAPI; limites de tentativa em memória (ok para uma instância); lead público sem deduplicação
  nem captcha (5/min/IP); `DELETE /admin/clientes` responde 200 com entidade enquanto os demais
  respondem 204; `ativo` como string em clientes e boolean nos demais; listagens de locação sem
  `total_paginas`.
- Documentação divergente: `DECISIONS.md` da API ainda cita rotas em inglês, criptografia AES decidida em
  12/09 e substituída em 14/09 por colunas sem cifra, e diz que troca de senha não revoga sessões
  (o código revoga). Migration `1789084805000-hardening.ts` existe mas não está registrada.
- Nomes de índices divergem entre entidade e migration (`imovel.entity.ts:10-13` vs migration): sem
  efeito hoje, mas qualquer geração automática de migration produzirá diff falso.

## 6. Sequência sugerida

1. Bloco "pronto para vender": itens P1 (1 a 7) + Prettier + componentes compartilhados.
2. Bloco "ferramenta de trabalho": P2 (8 a 12), começando pela decisão sobre pessoas unificadas.
3. Bloco "diferenciais": P3 conforme demanda dos primeiros clientes.

Cada item deve entrar como tarefa própria em `TASKS.md` com critério de conclusão, após o dono escolher
a ordem.
