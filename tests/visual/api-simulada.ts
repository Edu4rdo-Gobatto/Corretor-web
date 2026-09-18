import type { Page, Route } from '@playwright/test';
import { classificacoesExemplo, imovelExemplo } from '../../src/seo/fixture';
import type { Cargo, Classificacao, Corretor, FichaImovel, Pagina, Pessoa, StatusContato, StatusImovel } from '../../src/tipos';
import type { Comissao, Contrato } from '../../src/servicos/locacoes';

// API do painel simulada no navegador, só para a suíte visual. Nenhum dado daqui é usado pelo produto
// e nenhuma requisição chega a uma API real: rota não prevista responde 404 e é registrada como inesperada.

const agora = '2026-09-18T12:00:00.000Z';

function base64url(texto: string): string {
  return Buffer.from(texto).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** Token com formato de JWT e validade longa; a assinatura é irrelevante porque nada o verifica. */
export function tokenFalso(): string {
  const emitidoEm = Math.floor(Date.now() / 1000);
  return [base64url('{"alg":"HS256","typ":"JWT"}'), base64url(JSON.stringify({ sub: 1, iat: emitidoEm, exp: emitidoEm + 86_400 })), 'assinatura-de-teste'].join('.');
}

function corretor(id: number, nome: string, cargo: Cargo): Corretor {
  return { id, nome, email: `corretor${id}@exemplo.test`, cpf: '00000000000', whatsapp: '5566999990000', creci: 'CRECI 00000', cargo, url_foto: null, ativo: true, criado_em: agora };
}

function pagina<T>(itens: T[], url: URL): Pagina<T> {
  const numero = Number(url.searchParams.get('pagina') ?? 1);
  const limite = Number(url.searchParams.get('limite') ?? 15);
  return { itens: itens.slice((numero - 1) * limite, numero * limite), total: itens.length, pagina: numero, limite, total_paginas: Math.max(1, Math.ceil(itens.length / limite)) };
}

const statusImovel: StatusImovel[] = ['DISPONIVEL', 'DISPONIVEL', 'RESERVADO', 'ALUGADO', 'VENDIDO', 'RETIRADO'];
const fichas: FichaImovel[] = statusImovel.map((status, indice) => ({
  ...imovelExemplo,
  id: 42 + indice,
  slug: `sala-comercial-no-centro-${42 + indice}`,
  titulo: indice === 0 ? imovelExemplo.titulo : `${imovelExemplo.titulo} ${indice + 1}`,
  status,
  destaque: indice === 1,
  // O imóvel 43 é da corretora de teste (id 2): serve para o cenário do cargo CORRETOR editando o próprio imóvel.
  corretor_id: indice === 1 ? 2 : 1,
  corretor: indice === 1 ? { id: 2, nome: 'Corretora de Teste', whatsapp: '5566999990000', creci: null, url_foto: null } : imovelExemplo.corretor,
  proprietario_id: 7,
  proprietario: { id: 7, nome: 'Maria Proprietária' },
  exclusividade: indice % 2 === 0,
  exclusividade_ate: null,
  data_captacao: '2026-09-01',
  chaves: 'Na imobiliária',
  matricula: null,
  inscricao_municipal: null,
  observacoes_internas: null,
  motivo_baixa: status === 'VENDIDO' || status === 'ALUGADO' || status === 'RETIRADO' ? 'Negócio concluído.' : null,
}));

const statusContato: StatusContato[] = ['PENDENTE', 'PENDENTE', 'PENDENTE', 'RESPONDIDO', 'RESPONDIDO', 'FINALIZADO'];
const pessoas: Pessoa[] = statusContato.map((status, indice) => ({
  id: 7 + indice,
  nome: ['Maria Proprietária', 'João da Silva Comerciante', 'Ana Paula Ferreira', 'Carlos Eduardo Lima', 'Empresa Exemplo Ltda', 'Beatriz Santos'][indice],
  telefone: '(66) 99999-0000',
  email: `pessoa.com.email.bem.comprido.${indice}@provedor-de-exemplo.test`,
  tipo_pessoa: indice === 4 ? 'PJ' : 'PF',
  cpf_cnpj: null,
  data_nascimento: null,
  endereco: 'Rua de teste, 100 — Juara/MT',
  banco_nome: null,
  banco_agencia: null,
  banco_conta: null,
  chave_pix: null,
  observacoes: null,
  mensagem: indice < 3 ? 'Tenho interesse na sala comercial. Podemos agendar uma visita nesta semana?' : null,
  imovel_id: 42,
  corretor_id: 1,
  origem: indice < 3 ? 'SITE' : 'MANUAL',
  status_contato: status,
  consentimento: indice < 3,
  consentimento_em: indice < 3 ? agora : null,
  versao_termos: indice < 3 ? '2026-09' : null,
  ativo: true,
  criado_em: agora,
  alterado_em: agora,
}));

const corretores: Corretor[] = [corretor(1, 'Lucas Gobatto', 'ADMIN'), corretor(2, 'Corretora de Teste', 'CORRETOR')];

const contratos: Contrato[] = [5, 6].map((id) => ({
  id,
  numero_contrato: `LOC-2026-00${id}`,
  imovel_id: 42,
  locador_id: 7,
  locatario_id: 8,
  corretor_id: 1,
  data_inicio: '2026-01-01',
  data_fim: '2027-12-31',
  valor_aluguel: '2500.00',
  dia_vencimento: 10,
  taxa_administracao: '10.00',
  garantia_locaticia: 'Caução',
  indice_reajuste: 'IGP-M',
  cobranca_iptu_condominio: 'Locatário',
  url_pasta_drive: null,
  status_pasta_drive: 'PENDENTE',
  status: 'ATIVO',
  observacoes: null,
  ativo: true,
  imovel_titulo: imovelExemplo.titulo,
  locador_nome: 'Maria Proprietária',
  locatario_nome: 'João da Silva Comerciante',
}));

const comissoes: Comissao[] = [
  {
    id: 3, tipo_operacao: 'LOCACAO', contrato_id: 5, imovel_id: 42, pessoa_id: 7, valor_total: '2500.00', quantidade_parcelas: 2, observacoes: null, ativo: true, valor_pago: '1250.00', saldo_pendente: '1250.00',
    parcelas: [
      { id: 31, numero_parcela: 1, data_vencimento: '2026-08-10', valor: '1250.00', status: 'PAGO', pago_em: '2026-08-10', observacao_pagamento: null, ativo: true },
      { id: 32, numero_parcela: 2, data_vencimento: '2026-10-10', valor: '1250.00', status: 'PENDENTE', pago_em: null, observacao_pagamento: null, ativo: true },
    ],
  },
];

const classificacoesPorCategoria: Record<string, Classificacao[]> = {
  'tipos-imovel': classificacoesExemplo.tipos,
  'finalidades-imovel': classificacoesExemplo.finalidades,
  caracteristicas: classificacoesExemplo.caracteristicas,
};

export interface ApiSimulada {
  /** Requisições `/api` que a simulação não conhece; a suíte exige lista vazia. */
  inesperadas: string[];
}

function responder(rota: Route, status: number, corpo?: unknown): Promise<void> {
  return corpo === undefined ? rota.fulfill({ status }) : rota.fulfill({ status, contentType: 'application/json', body: JSON.stringify(corpo) });
}

/** Intercepta `/api/**` e responde como a API v2 responderia a um usuário do papel informado. */
export async function simularApiPainel(page: Page, cargo: Cargo = 'ADMIN'): Promise<ApiSimulada> {
  const estado: ApiSimulada = { inesperadas: [] };
  const usuario = cargo === 'ADMIN' ? corretores[0] : corretores[1];
  await page.route('**/api/**', async (rota) => {
    const pedido = rota.request();
    const url = new URL(pedido.url());
    const caminho = url.pathname.replace(/^\/api/, '');
    const metodo = pedido.method();
    const adminApenas = cargo !== 'ADMIN' && /^\/admin\/(tipos-imovel|finalidades-imovel|caracteristicas|corretores)/.test(caminho);
    if (adminApenas) return responder(rota, 403, { message: 'Você não tem permissão para esta ação.' });

    if (caminho === '/autenticacao/renovar' && metodo === 'POST') return responder(rota, 200, { token_acesso: tokenFalso(), tipo_token: 'Bearer', corretor: usuario });
    if (caminho === '/autenticacao/sair') return responder(rota, 204);
    if (caminho === '/autenticacao/eu') return responder(rota, 200, usuario);

    const classificacao = caminho.match(/^(?:\/admin)?\/(tipos-imovel|finalidades-imovel|caracteristicas)$/);
    if (classificacao && metodo === 'GET') return responder(rota, 200, pagina(classificacoesPorCategoria[classificacao[1]], url));

    if (caminho === '/admin/imoveis' && metodo === 'GET') return responder(rota, 200, pagina(fichas, url));
    const ficha = caminho.match(/^\/admin\/imoveis\/(\d+)$/);
    if (ficha && metodo === 'GET') {
      const encontrada = fichas.find((item) => item.id === Number(ficha[1]));
      return encontrada ? responder(rota, 200, encontrada) : responder(rota, 404, { message: 'Registro não encontrado.' });
    }

    if (caminho === '/admin/pessoas' && metodo === 'GET') {
      const status = url.searchParams.get('status_contato');
      return responder(rota, 200, pagina(status ? pessoas.filter((pessoa) => pessoa.status_contato === status) : pessoas, url));
    }
    const pessoa = caminho.match(/^\/admin\/pessoas\/(\d+)$/);
    if (pessoa && metodo === 'GET') {
      const encontrada = pessoas.find((item) => item.id === Number(pessoa[1]));
      return encontrada ? responder(rota, 200, encontrada) : responder(rota, 404, { message: 'Registro não encontrado.' });
    }

    if (caminho === '/admin/corretores' && metodo === 'GET') return responder(rota, 200, pagina(corretores, url));
    if (caminho === '/admin/contratos' && metodo === 'GET') return responder(rota, 200, pagina(contratos, url));
    const contrato = caminho.match(/^\/admin\/contratos\/(\d+)$/);
    if (contrato && metodo === 'GET') {
      const encontrado = contratos.find((item) => item.id === Number(contrato[1]));
      return encontrado ? responder(rota, 200, encontrado) : responder(rota, 404, { message: 'Registro não encontrado.' });
    }
    if (caminho === '/admin/comissoes' && metodo === 'GET') return responder(rota, 200, pagina(comissoes, url));
    const comissao = caminho.match(/^\/admin\/comissoes\/(\d+)$/);
    if (comissao && metodo === 'GET') return responder(rota, 200, comissoes[0]);

    estado.inesperadas.push(`${metodo} ${caminho}${url.search}`);
    return responder(rota, 404, { message: 'Rota não simulada na suíte visual.' });
  });
  return estado;
}
