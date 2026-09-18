import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../servicos/api';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { data, rotulosStatusImovelPlural } from '../../servicos/formato';
import { rotas } from '../../servicos/urls';
import type { StatusImovel } from '../../tipos';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Tabela from '../../componentes/Tabela';
import { estilos } from '../../componentes/estilosPainel';

const STATUS: StatusImovel[] = ['DISPONIVEL', 'RESERVADO', 'VENDIDO', 'ALUGADO'];
const carregadores = {
  imoveis: () => api.listarFichas({ pagina: 1, limite: 1, ativo: true }),
  porStatus: Object.fromEntries(STATUS.map((status) => [status, () => api.listarFichas({ pagina: 1, limite: 1, ativo: true, status })])) as Record<StatusImovel, () => ReturnType<typeof api.listarFichas>>,
  pendentes: () => api.listarPessoas({ pagina: 1, limite: 5, ativo: true, status_contato: 'PENDENTE' }),
  recentes: () => api.listarPessoas({ pagina: 1, limite: 1, ativo: true, criado_desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }),
  contratos: () => api.listarContratos({ pagina: 1, limite: 1, status: 'ATIVO', ativo: true }),
};
const centavos = (valor: string) => {
  if (!/^\d+(\.\d{1,2})?$/.test(valor)) throw new Error('Valor de comissão inválido.');
  const [inteiro, fracao = ''] = valor.split('.');
  return BigInt(inteiro) * 100n + BigInt(fracao.padEnd(2, '0'));
};
const moeda = (valor: bigint) => `R$ ${(valor / 100n).toLocaleString('pt-BR')},${String(valor % 100n).padStart(2, '0')}`;

/** Soma as parcelas ativas de todas as páginas de comissões acessíveis, em centavos. */
async function carregarComissoes() {
  let pendente = 0n;
  let recebido = 0n;
  let pagina = 1;
  let totalPaginas = 1;
  const vistas = new Set<number>();
  do {
    const resultado = await api.listarComissoes({ pagina, limite: 100, ativo: true });
    totalPaginas = resultado.total_paginas ?? Math.ceil(resultado.total / resultado.limite);
    for (const comissao of resultado.itens) {
      if (!comissao.ativo || vistas.has(comissao.id)) continue;
      vistas.add(comissao.id);
      for (const parcela of comissao.parcelas) {
        if (!parcela.ativo) continue;
        if (parcela.status === 'PAGO') recebido += centavos(parcela.valor); else pendente += centavos(parcela.valor);
      }
    }
    pagina++;
  } while (pagina <= totalPaginas);
  return { pendente, recebido };
}

function Indicador<T>({ rotulo, carregar, children }: { rotulo: string; carregar: () => Promise<T>; children: (dados: T) => ReactNode }) {
  const { dados, carregando, erro, recarregar } = useDadosPainel(carregar);
  return (
    <section aria-label={rotulo} className="rounded border border-line bg-paper p-[18px] lg:p-7">
      <span>{rotulo}</span>
      <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
      {!carregando && !erro && dados !== undefined && children(dados)}
    </section>
  );
}
const numeroGrande = (valor: ReactNode) => <strong className="my-3 block text-[28px] text-ink">{valor}</strong>;

export default function VisaoGeral() {
  const { corretor } = useSessao();
  const pendentes = useDadosPainel(carregadores.pendentes);
  return <>
    <CabecalhoPagina rotulo="VISÃO GERAL" titulo={`Olá, ${corretor?.nome.split(' ')[0]}.`} descricao="Um olhar sobre suas próximas oportunidades." acoes={<Link className="button" to="/admin/imoveis/novo">+ Novo imóvel</Link>} />
    <section className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-3 lg:gap-5">
      <Indicador rotulo="Contatos pendentes" carregar={carregadores.pendentes}>{(dados) => <>{numeroGrande(dados.total)}<Link to={rotas.contatos}>Responder contatos →</Link></>}</Indicador>
      <Indicador rotulo="Contatos recebidos nos últimos 30 dias" carregar={carregadores.recentes}>{(dados) => <>{numeroGrande(dados.total)}<Link to={rotas.pessoas}>Ver pessoas →</Link></>}</Indicador>
      <Indicador rotulo="Imóveis no portfólio" carregar={carregadores.imoveis}>{(dados) => <>{numeroGrande(dados.total)}<Link to={rotas.imoveis}>Gerenciar imóveis →</Link></>}</Indicador>
      {STATUS.map((status) => <Indicador key={status} rotulo={rotulosStatusImovelPlural[status]} carregar={carregadores.porStatus[status]}>{(dados) => numeroGrande(dados.total)}</Indicador>)}
      <Indicador rotulo="Contratos ativos" carregar={carregadores.contratos}>{(dados) => <>{numeroGrande(dados.total)}<Link to="/admin/contratos">Ver contratos →</Link></>}</Indicador>
      <Indicador rotulo="Comissões" carregar={carregarComissoes}>{(dados) => <><p>Valor pendente: {moeda(dados.pendente)}</p><p>Valor recebido: {moeda(dados.recebido)}</p><Link to="/admin/comissoes">Ver financeiro →</Link></>}</Indicador>
    </section>
    {!pendentes.carregando && !pendentes.erro && pendentes.dados && (
      <section className={estilos.painel}>
        <h2 className={estilos.tituloPainel}>Contatos aguardando resposta</h2>
        <Tabela itens={pendentes.dados.itens} chave={(pessoa) => pessoa.id} vazio="Nenhum contato pendente. Bom trabalho." colunas={[
          { titulo: 'Contato', celula: (pessoa) => <><strong>{pessoa.nome}</strong><small className="mt-1 block text-muted">{pessoa.email}</small></> },
          { titulo: 'Telefone', celula: (pessoa) => pessoa.telefone },
          { titulo: 'Recebido em', celula: (pessoa) => data(pessoa.criado_em) },
          { titulo: '', celula: (pessoa) => <Link to={`/admin/pessoas/${pessoa.id}`}>Abrir ficha →</Link> },
        ]} />
      </section>
    )}
  </>;
}
