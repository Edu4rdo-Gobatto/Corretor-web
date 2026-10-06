import type { ReactNode } from 'react';
import { IconeVer } from '../../componentes/Icones';
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
import AcaoIcone from '../../componentes/AcaoIcone';
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
    <section aria-label={rotulo} className="rounded border border-line bg-paper p-5">
      <span className="text-sm text-muted">{rotulo}</span>
      <EstadoCarregamento compacto carregando={carregando} erro={erro} tentarNovamente={recarregar} />
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
    <section className={`${estilos.painel} border-t-4 border-t-gold`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><h2 className="mb-1 text-[22px]">Contatos aguardando resposta</h2><p className="m-0 text-sm text-muted">Comece por quem ainda espera seu retorno.</p></div><Link className="buttonSecondary" to={rotas.contatos}>Responder contatos →</Link></div>
      <EstadoCarregamento compacto carregando={pendentes.carregando} erro={pendentes.erro} tentarNovamente={pendentes.recarregar} />
      {!pendentes.carregando && !pendentes.erro && pendentes.dados && <>
        <p className="mb-5 mt-0 text-muted"><strong className="mr-2 font-sans text-[32px] text-ink">{pendentes.dados.total}</strong>{pendentes.dados.total === 1 ? 'contato pendente' : 'contatos pendentes'}{pendentes.dados.total > 5 ? ' · exibindo os primeiros 5' : ''}</p>
        <Tabela itens={pendentes.dados.itens} chave={(pessoa) => pessoa.id} vazio="Nenhum contato pendente. Bom trabalho." colunas={[
          { titulo: 'Contato', celula: (pessoa) => <><strong>{pessoa.nome}</strong><small className="mt-1 block text-muted">{pessoa.email}</small></> },
          { titulo: 'Telefone', celula: (pessoa) => pessoa.telefone },
          { titulo: 'Recebido em', celula: (pessoa) => data(pessoa.criado_em) },
          { titulo: 'Ações', celula: (pessoa) => <AcaoIcone icone={IconeVer} rotulo={`Abrir ficha de ${pessoa.nome}`} to={`/admin/pessoas/${pessoa.id}`} /> },
        ]} />
      </>}
    </section>
    <section aria-labelledby="titulo-portfolio" className="mb-8"><h2 id="titulo-portfolio" className={estilos.tituloPainel}>Seu portfólio</h2><div className="grid grid-cols-1 gap-3 @min-[32rem]/principal:grid-cols-2 @min-[60rem]/principal:grid-cols-3">
      <Indicador rotulo="Imóveis no portfólio" carregar={carregadores.imoveis}>{(dados) => <>{numeroGrande(dados.total)}<Link to={rotas.imoveis}>Gerenciar imóveis →</Link></>}</Indicador>
      {STATUS.map((status) => <Indicador key={status} rotulo={rotulosStatusImovelPlural[status]} carregar={carregadores.porStatus[status]}>{(dados) => numeroGrande(dados.total)}</Indicador>)}
      <Indicador rotulo="Contatos recebidos nos últimos 30 dias" carregar={carregadores.recentes}>{(dados) => <>{numeroGrande(dados.total)}<Link to={rotas.pessoas}>Ver pessoas →</Link></>}</Indicador>
    </div></section>
    <section aria-labelledby="titulo-financeiro"><h2 id="titulo-financeiro" className={estilos.tituloPainel}>Contratos e comissões</h2><div className="grid grid-cols-1 gap-3 @min-[38rem]/principal:grid-cols-2">
      <Indicador rotulo="Contratos ativos" carregar={carregadores.contratos}>{(dados) => <>{numeroGrande(dados.total)}<Link to="/admin/contratos">Ver contratos →</Link></>}</Indicador>
      <Indicador rotulo="Comissões" carregar={carregarComissoes}>{(dados) => <><p className="mb-1 text-sm text-muted">Valor pendente</p>{numeroGrande(moeda(dados.pendente))}<p className="text-sm text-muted">Valor recebido: <strong className="text-ink">{moeda(dados.recebido)}</strong></p><Link to="/admin/comissoes">Ver financeiro →</Link></>}</Indicador>
    </div></section>
  </>;
}
