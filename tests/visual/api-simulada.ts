import type { BrowserContext, Route } from '@playwright/test';
import { catalogoExemplo, classificacoesExemplo, imovelExemplo } from '../../src/seo/fixture';
import type { Cargo, Classificacao, Corretor, FichaImovel, Pagina, Pessoa, StatusContato, StatusImovel } from '../../src/tipos';
import type { Comissao, Contrato } from '../../src/servicos/locacoes';

// API do painel simulada no navegador, só para a suíte visual. Nenhum dado daqui é usado pelo produto
// e nenhuma requisição chega a uma API real: rota não prevista responde 404 e é registrada como inesperada.

export const agora = '2026-10-15T12:00:00.000Z';

function base64url(texto: string): string {
  return Buffer.from(texto).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** Token com formato de JWT e validade longa; a assinatura é irrelevante porque nada o verifica. */
export function tokenFalso(): string {
  const emitidoEm = Math.floor(new Date(agora).getTime() / 1000);
  return [base64url('{"alg":"HS256","typ":"JWT"}'), base64url(JSON.stringify({ sub: 1, iat: emitidoEm, exp: emitidoEm + 86_400 })), 'assinatura-de-teste'].join('.');
}

function corretor(id: number, nome: string, cargo: Cargo): Corretor {
  return { id, nome, email: `corretor${id}@exemplo.test`, cpf: id === 1 ? '52998224725' : '11144477735', whatsapp: '5566999990000', creci: '12345F', cargo, url_foto: null, ativo: true, criado_em: agora };
}

function pagina<T>(itens: T[], url: URL): Pagina<T> {
  const numero = Number(url.searchParams.get('pagina') ?? 1);
  const limite = Number(url.searchParams.get('limite') ?? 15);
  return { itens: itens.slice((numero - 1) * limite, numero * limite), total: itens.length, pagina: numero, limite, total_paginas: Math.max(1, Math.ceil(itens.length / limite)) };
}

const statusImovel: StatusImovel[] = ['DISPONIVEL', 'DISPONIVEL', 'RESERVADO', 'ALUGADO', 'VENDIDO', 'RETIRADO'];
const modelosFicha = catalogoExemplo();
const fichas: FichaImovel[] = statusImovel.map((status, indice) => ({
  ...modelosFicha[indice],
  id: 42 + indice,
  slug: `${modelosFicha[indice].slug.replace(/-\d+$/, '')}-${42 + indice}`,
  titulo: modelosFicha[indice].titulo,
  status,
  // O imóvel 43 é da corretora de teste (id 2): serve para o cenário do cargo CORRETOR editando o próprio imóvel.
  corretor_id: indice === 1 ? 2 : 1,
  corretor: indice === 1 ? { id: 2, nome: 'Corretora de Teste', whatsapp: '5566999990000', creci: null, url_foto: null } : imovelExemplo.corretor,
  proprietario_id: 7,
  proprietario: { id: 7, nome: 'Maria Proprietária' },
  exclusividade: indice % 2 === 0,
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
  tipo_contrato_id: 1,
  tipo_contrato_nome: 'Comercial',
  indice_reajuste_id: 1,
  indice_reajuste_nome: 'IGP-M',
  indice_reajuste_periodicidade_meses: 12,
  indice_reajuste_regra: null,
  url_pasta_drive: null,
  status_pasta_drive: 'PENDENTE',
  status: 'ATIVO',
  observacoes: null,
  ativo: true, data_fim_contratada: null, motivo_encerramento: null, contrato_anterior_id: null, renovacao_id: null,
  imovel_titulo: imovelExemplo.titulo,
  locador_nome: 'Maria Proprietária',
  locatario_nome: 'João da Silva Comerciante',
}));

const comissoes: Comissao[] = [
  {
    id: 3, tipo_operacao: 'LOCACAO', contrato_id: 5, imovel_id: 42, pessoa_id: 7, valor_total: '2500.00', quantidade_parcelas: 2, observacoes: null, ativo: true, versao_plano: 1, versao_registro: 2, possui_recebimento: true, primeiro_vencimento: '2026-08-10', valor_pago: '1250.00', saldo_pendente: '1250.00',
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
  cidades: classificacoesExemplo.cidades,
};

type Pedido = { metodo: string; caminho: string; busca: string; corpo: unknown };
type Regra = { metodo: string; caminho: string; status?: number; corpo?: unknown; esperar?: Promise<void>; vezes?: number };
export interface ApiSimulada {
  inesperadas: string[];
  pedidos: Pedido[];
  usuario: Corretor;
  autenticado: boolean;
  regras: Regra[];
  fichas: FichaImovel[];
  pessoas: Pessoa[];
  perfilSalvo: unknown;
  /** Foto enviada em multipart ao salvar o perfil: nome, tipo e bytes do arquivo. */
  fotoEnviada: { nome: string; tipo: string; bytes: number } | undefined;
  embedsMockados: string[];
}

function responder(rota: Route, status: number, corpo?: unknown): Promise<void> {
  return corpo === undefined ? rota.fulfill({ status }) : rota.fulfill({ status, contentType: 'application/json', body: JSON.stringify(corpo) });
}

function filtrar<T extends object>(itens: T[], url: URL): T[] {
  const p = url.searchParams;
  return itens.filter(item => {
    const registro = item as Record<string, unknown>;
    if (p.has('busca') && !JSON.stringify(item).toLocaleLowerCase('pt-BR').includes(p.get('busca')!.toLocaleLowerCase('pt-BR'))) return false;
    for (const chave of ['status', 'status_contato', 'ativo', 'corretor_id', 'imovel_id', 'proprietario_id', 'id', 'tipo_operacao', 'contrato_id']) {
      if (p.has(chave) && String(registro[chave]) !== p.get(chave)) return false;
    }
    if (p.has('criado_desde') && String(registro.criado_em) < p.get('criado_desde')!) return false;
    if (p.has('criado_ate') && String(registro.criado_em) > p.get('criado_ate')!) return false;
    if (p.has('tipo_id') && !p.get('tipo_id')!.split(',').includes(String(registro.tipo_id))) return false;
    if (p.has('finalidade_id') && String(registro.finalidade_id) !== p.get('finalidade_id')) return false;
    for (const campo of ['cidade', 'bairro']) if (p.has(campo) && !String(registro[campo]).toLowerCase().includes(p.get(campo)!.toLowerCase())) return false;
    const valor = Number(registro.valor_locacao ?? registro.valor_venda), area = Number(registro.area_util);
    return (!p.has('valor_min') || valor >= Number(p.get('valor_min'))) && (!p.has('valor_max') || valor <= Number(p.get('valor_max'))) && (!p.has('area_min') || area >= Number(p.get('area_min'))) && (!p.has('area_max') || area <= Number(p.get('area_max')));
  }).sort((a, b) => {
    const ordem = p.get('ordenar');
    if (!ordem || ordem === 'recentes') return 0;
    const aa = a as Record<string, unknown>, bb = b as Record<string, unknown>;
    const va = ordem.startsWith('area') ? aa.area_util : aa.valor_locacao ?? aa.valor_venda;
    const vb = ordem.startsWith('area') ? bb.area_util : bb.valor_locacao ?? bb.valor_venda;
    return (Number(va) - Number(vb)) * (ordem.endsWith('desc') ? -1 : 1);
  });
}

/** Um estado novo por BrowserContext, instalado antes da primeira navegação. */
export async function simularApi(context: BrowserContext, cargo: Cargo | 'VISITANTE' = 'ADMIN'): Promise<ApiSimulada> {
  const estado: ApiSimulada = { inesperadas: [], pedidos: [], usuario: structuredClone(corretores[cargo === 'CORRETOR' ? 1 : 0]), autenticado: cargo !== 'VISITANTE', regras: [], fichas: structuredClone(fichas), pessoas: structuredClone(pessoas), perfilSalvo: undefined, fotoEnviada: undefined, embedsMockados: [] };
  await context.route('**/*', async rota => {
    const pedido = rota.request();
    const url = new URL(pedido.url());
    const inesperada = () => { estado.inesperadas.push(`${pedido.method()} ${url.href}`); return rota.abort('blockedbyclient'); };
    const enderecos = catalogoExemplo().map(i => `${i.logradouro}, ${i.numero} — ${i.bairro}, ${i.cidade}/${i.estado}`);
    if (url.origin === 'https://www.google.com' && url.pathname === '/maps' && url.searchParams.get('output') === 'embed' && enderecos.includes(url.searchParams.get('q') ?? '') && pedido.method() === 'GET' && pedido.isNavigationRequest()) {
      estado.embedsMockados.push(url.href);
      return rota.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Mapa simulado</title><body style="margin:0;background:#e6e8e5;color:#44554c;font:16px sans-serif;display:grid;place-items:center;height:100vh">Mapa de teste · Juara/MT</body></html>' });
    }
    if (url.origin !== 'http://127.0.0.1:4180') return inesperada();
    if (!url.pathname.startsWith('/api/')) {
      // Apenas documentos, assets estáticos locais e HEAD de recuperação pública.
      if (pedido.isNavigationRequest() || pedido.method() === 'HEAD' || /^\/(?:assets\/|vite\.svg|favicon\.)/.test(url.pathname)) return rota.continue();
      return inesperada();
    }
    const caminho = url.pathname.replace(/^\/api/, '');
    const metodo = pedido.method();
    let corpo: unknown;
    try { corpo = pedido.postDataJSON() as unknown; } catch { corpo = pedido.postData(); }
    estado.pedidos.push({ metodo, caminho, busca: url.search, corpo });
    if (cargo === 'CORRETOR' && /^\/admin\/(?:corretores|tipos-imovel|finalidades-imovel|caracteristicas|cidades)/.test(caminho)) return inesperada();
    if (caminho.startsWith('/admin/') && !estado.autenticado) return responder(rota, 401, { message: 'Sessão ausente.' });
    const regra = estado.regras.find(r => r.metodo === metodo && r.caminho === caminho && r.vezes !== 0);
    if (regra) {
      if (regra.vezes !== undefined) regra.vezes--;
      if (regra.esperar) await regra.esperar;
      if (regra.status !== undefined) return responder(rota, regra.status, regra.corpo ?? { message: 'Falha simulada. Tente novamente.' });
    }
    if (caminho === '/autenticacao/renovar' && metodo === 'POST') return estado.autenticado ? responder(rota, 200, { token_acesso: tokenFalso(), tipo_token: 'Bearer', corretor: estado.usuario }) : responder(rota, 401, { message: 'Sessão ausente.' });
    if (caminho === '/autenticacao/entrar' && metodo === 'POST') {
      const dados = corpo as Record<string, unknown>;
      if (!dados || Object.keys(dados).sort().join(',') !== 'email,senha') return inesperada();
      if (dados.email === 'limite@exemplo.test') return responder(rota, 429, { message: 'Muitas tentativas. Aguarde antes de tentar novamente.' });
      if (dados.email !== estado.usuario.email || dados.senha !== 'SenhaVisual123!') return responder(rota, 401, { message: 'E-mail ou senha inválidos.' });
      estado.autenticado = true;
      return responder(rota, 200, { token_acesso: tokenFalso(), tipo_token: 'Bearer', corretor: estado.usuario });
    }
    if (caminho === '/autenticacao/sair' && metodo === 'POST') { estado.autenticado = false; return responder(rota, 204); }
    if (caminho === '/autenticacao/eu' && metodo === 'GET') return responder(rota, 200, estado.usuario);
    if (caminho === '/autenticacao/eu' && metodo === 'PATCH' && (pedido.headers()['content-type'] ?? '').startsWith('multipart/form-data')) {
      const bruto = pedido.postDataBuffer()?.toString('latin1') ?? '';
      const arquivo = bruto.match(/name="foto"; filename="([^"]+)"\r\nContent-Type: ([^\r]+)\r\n\r\n/);
      if (!arquivo || !/name="nome"/.test(bruto)) return inesperada();
      const inicio = (arquivo.index ?? 0) + arquivo[0].length;
      estado.fotoEnviada = { nome: arquivo[1], tipo: arquivo[2], bytes: bruto.lastIndexOf('\r\n--') - inicio };
      return responder(rota, 200, estado.usuario);
    }
    if (caminho === '/autenticacao/eu' && metodo === 'PATCH') {
      const dados = corpo as Record<string, unknown>;
      if (!dados || Object.keys(dados).some(c => !['nome', 'whatsapp', 'creci', 'url_foto'].includes(c)) || typeof dados.nome !== 'string' || typeof dados.whatsapp !== 'string') return inesperada();
      estado.perfilSalvo = structuredClone(dados);
      Object.assign(estado.usuario, dados);
      return responder(rota, 200, estado.usuario);
    }
    const classificacao = caminho.match(/^(?:\/admin)?\/(tipos-imovel|finalidades-imovel|caracteristicas|cidades)(?:\/(\d+))?$/);
    if (classificacao && metodo === 'GET') {
      const itens = classificacoesPorCategoria[classificacao[1]];
      return classificacao[2] ? responder(rota, 200, itens.find(i => i.id === Number(classificacao[2]))) : responder(rota, 200, pagina(itens, url));
    }
    const cadastro = caminho.match(/^\/(?:admin|cadastros)\/(tipos-contrato|indices-reajuste)(?:\/(\d+))?$/);
    if (cadastro && metodo === 'GET') {
      const itens = [{ id: 1, nome: cadastro[1] === 'tipos-contrato' ? 'Comercial' : 'IGP-M', descricao: 'Cadastro sintético da suíte', periodicidade_meses: 12, regra: null, ativo: true, criado_em: agora, alterado_em: agora }];
      return cadastro[2] ? responder(rota, 200, itens[0]) : responder(rota, 200, pagina(itens, url));
    }
    if (caminho === '/imoveis' && metodo === 'GET') return responder(rota, 200, pagina(filtrar(catalogoExemplo(), url), url));
    const publico = caminho.match(/^\/imoveis\/[^/]+-(\d+)$/);
    if (publico && metodo === 'GET') { const item = catalogoExemplo().find(i => i.id === Number(publico[1])); return responder(rota, item ? 200 : 404, item ?? { message: 'Registro não encontrado.' }); }
    const listas: Record<string, object[]> = { '/admin/imoveis': estado.fichas, '/admin/pessoas': estado.pessoas, '/admin/corretores': corretores, '/admin/contratos': contratos, '/admin/comissoes': comissoes };
    if (listas[caminho] && metodo === 'GET') return responder(rota, 200, pagina(filtrar(listas[caminho], url), url));
    const revisoes = caminho.match(/^\/admin\/comissoes\/(\d+)\/revisoes$/);
    if (revisoes && metodo === 'GET') return responder(rota, 200, { itens: [] });
    const registro = caminho.match(/^(\/admin\/(?:imoveis|pessoas|corretores|contratos|comissoes))\/(\d+)$/);
    if (registro && metodo === 'GET') {
      const item = listas[registro[1]].find(i => (i as { id: number }).id === Number(registro[2]));
      return responder(rota, item ? 200 : 404, item ?? { message: 'Registro não encontrado.' });
    }
    return inesperada();
  });
  return estado;
}

