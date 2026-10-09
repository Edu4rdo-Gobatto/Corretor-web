import { urlFotoCorretor } from '../../servicos/fotos';
import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { IconeSetaExterna, IconeLocal, IconeArea, IconeEdificio, IconeProtegido, IconeCompartilhar, IconeCama, IconeGota, IconeSofa, IconeAndares, IconeCarro, IconePiscina, IconeModoClaro, IconeTerreno, type Icone } from '../../componentes/Icones';
import { api } from '../../servicos/api';
import { useRecurso } from '../../hooks/useRecurso';
import { urlImovel } from '../../servicos/urls';
import { area, dinheiro, rotuloCaracteristica, somaMensal, valorCaracteristica, valorPrincipal, destaquesImovel, type ChaveDestaque } from '../../servicos/formato';
import type { Imovel } from '../../tipos';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import BotaoVoltar from '../../componentes/BotaoVoltar';
import GaleriaMidia from '../../componentes/GaleriaMidia';
import CartaoImovel from '../../componentes/CartaoImovel';
import FormularioContato from '../../componentes/FormularioContato';
import AcaoIcone from '../../componentes/AcaoIcone';
import { Seo, useDadosIniciais } from '../../seo/context';

const classeCard = 'rounded-[5px] border border-line bg-paper p-6 max-[480px]:p-5';
const iconesDestaque: Record<ChaveDestaque, Icone> = { quartos: IconeCama, banheiros: IconeGota, salas: IconeSofa, pisos: IconeAndares, vagas: IconeCarro, piscina: IconePiscina, solar: IconeModoClaro, lazer: IconeTerreno };

/** Indicador visual em formato de chave: verde quando disponível, amarelo nos demais casos (igual nos dois temas). */
function IndicadorDisponibilidade({ disponivel }: { disponivel: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${disponivel ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
      <span aria-hidden="true" className={`relative inline-block h-5 w-9 rounded-full ${disponivel ? 'bg-emerald-500' : 'bg-amber-400'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm ${disponivel ? 'right-0.5' : 'left-0.5'}`} />
      </span>
      {disponivel ? 'Disponível' : 'Indisponível'}
    </span>
  );
}

function Semelhantes({ atual }: { atual: Imovel }) {
  const [itens, setItens] = useState<Imovel[]>([]);
  const finalidade = atual.finalidade?.slug;
  const tipo = atual.tipo?.slug;
  useEffect(() => {
    let cancelado = false;
    const semAtual = (lista: Imovel[]) => lista.filter((item) => item.id !== atual.id);
    api.listarImoveis({ pagina: 1, limite: 4, finalidade, cidade: atual.cidade }).then((pagina) => {
      if (cancelado) return;
      const proximos = semAtual(pagina.itens);
      if (proximos.length >= 3) { setItens(proximos.slice(0, 3)); return; }
      api.listarImoveis({ pagina: 1, limite: 4, tipos: tipo ? [tipo] : undefined })
        .then((reserva) => { if (!cancelado) setItens([...proximos, ...semAtual(reserva.itens).filter((item) => !proximos.some((existente) => existente.id === item.id))].slice(0, 3)); })
        .catch(() => { if (!cancelado) setItens(proximos.slice(0, 3)); });
    }).catch(() => undefined);
    return () => { cancelado = true; };
  }, [atual.id, atual.cidade, finalidade, tipo]);
  if (!itens.length) return null;
  return (
    <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:mb-5 [&_h2]:text-[26px]" aria-labelledby="similares">
      <h2 id="similares">Você também pode gostar</h2>
      <div className={`${classeCard} grid grid-cols-3 gap-6 max-[1000px]:grid-cols-2 max-[760px]:grid-cols-1`}>{itens.map((item) => <CartaoImovel key={item.id} imovel={item} />)}</div>
    </section>
  );
}

export default function DetalheImovel() {
  const { slug = '' } = useParams();
  const carregar = useCallback(() => api.obterImovel(slug), [slug]);
  const iniciais = useDadosIniciais();
  const { valor: imovel, carregando, erro, statusErro, tentarNovamente } = useRecurso(carregar, iniciais?.data.imovel);
  const [contatoAberto, setContatoAberto] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  async function compartilhar() {
    if (!imovel) return;
    const url = typeof window === 'undefined' ? '' : new URL(window.location.pathname, window.location.origin).href;
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) { await navigator.share({ title: imovel.titulo, url }); return; }
      throw new Error('share indisponível');
    } catch (falha) {
      if (falha instanceof Error && falha.name === 'AbortError') return;
      try { await navigator.clipboard.writeText(url); setLinkCopiado(true); } catch { setLinkCopiado(false); }
    }
  }

  // O slug muda com o título: um link antigo ainda abre pelo id e é trocado pelo endereço atual.
  if (imovel && imovel.slug !== slug) return <Navigate to={urlImovel(imovel.slug)} replace />;

  const consultaMapa = imovel ? encodeURIComponent(`${imovel.logradouro}, ${imovel.numero} — ${imovel.bairro}, ${imovel.cidade}/${imovel.estado}`) : '';
  const urlMaps = `https://www.google.com/maps/search/?api=1&query=${consultaMapa}`;
  const enderecoCompleto = imovel && [imovel.logradouro, imovel.numero, imovel.cidade, imovel.estado].every((valor) => String(valor ?? '').trim().length > 0);
  const preco = imovel ? valorPrincipal(imovel) : null;
  const destaques = imovel ? destaquesImovel(imovel.caracteristicas) : [];
  const idsDestacados = new Set(destaques.map((item) => item.caracteristica_id));
  const demaisCaracteristicas = imovel ? imovel.caracteristicas.filter((item) => !idsDestacados.has(item.caracteristica_id)) : [];
  const tiles: { chave: string; icone: Icone; valor: string | number | null; rotulo: string }[] = imovel ? [
    { chave: 'area_util', icone: IconeArea, valor: area(imovel.area_util), rotulo: 'de área útil' },
    { chave: 'area_total', icone: IconeEdificio, valor: area(imovel.area_total), rotulo: 'de área total' },
    ...destaques.map(({ chave, quantidade, rotulo }) => ({ chave, icone: iconesDestaque[chave], valor: quantidade, rotulo })),
  ] : [];
  const modalidade = !imovel ? '' : imovel.valor_venda !== null && imovel.valor_locacao !== null ? 'Compra e Locação' : imovel.valor_venda !== null ? 'Compra' : imovel.valor_locacao !== null ? 'Locação' : imovel.finalidade?.nome || 'Sob consulta';
  const condominio = imovel?.valor_condominio === null || imovel?.valor_condominio === undefined ? null : Number(imovel.valor_condominio);
  const iptu = imovel?.valor_iptu === null || imovel?.valor_iptu === undefined ? null : Number(imovel.valor_iptu);

  return (
    <div className="container pb-6 pt-[30px]">
      <Seo dados={{ imovel }} status={statusErro || 200} />
      {!(imovel && !carregando && !erro) && <BotaoVoltar to="/" rotulo="Voltar aos imóveis" />}
      <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={tentarNovamente} esqueleto="detalhe" />
      {!carregando && !erro && imovel && <>
        <div className="flex items-start gap-5 pb-[30px] max-[760px]:gap-3">
          <div className="mt-[3px] max-[760px]:mt-0"><BotaoVoltar to="/" rotulo="Voltar aos imóveis" /></div>
          <div className="min-w-0 flex-1">
            <h1 className="mb-[15px] text-[clamp(30px,3.3vw,46px)] max-[760px]:text-[32px]">{imovel.titulo}</h1>
            <p className="mb-0 flex items-start gap-[7px] text-muted"><IconeLocal size={17} className="mt-1 shrink-0" /><span>{imovel.bairro}, {imovel.cidade} — {imovel.estado}</span></p>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-[52px] max-[1000px]:grid-cols-[minmax(0,1fr)_300px] max-[1000px]:gap-6 max-[760px]:grid-cols-1 max-[760px]:gap-5">
            <div className="order-1 min-w-0 min-[761px]:col-start-1 min-[761px]:row-start-1"><GaleriaMidia key={imovel.id} midias={imovel.midias} titulo={imovel.titulo} /></div>
          <aside className="order-2 sticky top-[120px] min-w-0 min-[761px]:col-start-2 min-[761px]:row-start-1 min-[761px]:row-span-2 max-[760px]:static">
            <div className="rounded-[5px] border border-line border-t-4 border-t-gold bg-paper p-[30px] shadow-sm max-[1000px]:p-[22px] max-[480px]:px-5 max-[480px]:py-6">
              {imovel.valor_venda !== null && <><p className="eyebrow">Valor de venda</p><p className="mb-[14px] text-[34px] font-semibold leading-[1.3] tracking-[-0.03em] text-brand max-[1000px]:text-[29px]">{dinheiro(imovel.valor_venda)}</p></>}
              {imovel.valor_locacao !== null && <><p className="eyebrow">Valor de locação</p><p className="mb-[14px] text-[34px] font-semibold leading-[1.3] tracking-[-0.03em] text-brand max-[1000px]:text-[29px]">{dinheiro(imovel.valor_locacao)}<span className="ml-[6px] text-[15px] font-normal text-muted">/mês</span></p></>}
              {!preco && <><p className="eyebrow">Valor</p><p className="mb-[14px] text-[26px] font-semibold text-brand">Sob consulta</p></>}
              <dl className="mb-4 border-y border-line text-sm [&_dd]:m-0 [&_div]:flex [&_div]:items-center [&_div]:justify-between [&_div]:gap-4 [&_div]:py-3 [&_div+div]:border-t [&_div+div]:border-line [&_dt]:text-muted">
                <div><dt className="sr-only">Metragem</dt><dd className="text-[17px] font-semibold text-brand">{area(imovel.area_util)}</dd><dd><IndicadorDisponibilidade disponivel={imovel.status === 'DISPONIVEL'} /></dd></div>
                <div><dt>Modalidade</dt><dd className="font-semibold text-brand">{modalidade}</dd></div>
                <div><dt>Cidade</dt><dd className="text-right font-semibold [overflow-wrap:anywhere]">{imovel.cidade}/{imovel.estado}</dd></div>
              </dl>
              {imovel.valor_locacao !== null && <><p className="mb-1 text-sm text-muted">Soma dos valores informados{condominio === null || iptu === null ? ' (parcial)' : ''}: {dinheiro(somaMensal(Number(imovel.valor_locacao), condominio, iptu))}</p><p className="mb-3 text-xs text-muted">Confirme os encargos e a periodicidade do IPTU com o corretor. Esta soma não representa necessariamente o custo mensal.</p></>}
              <dl className="pb-3 text-sm [&_dd]:m-0 [&_div]:flex [&_div]:justify-between [&_div]:gap-[15px] [&_div]:py-[5px] [&_dt]:text-muted">
                {condominio !== null && <div><dt>Condomínio</dt><dd>{dinheiro(condominio)}</dd></div>}
                {iptu !== null && <div><dt>IPTU informado</dt><dd>{dinheiro(iptu)}</dd></div>}
              </dl>
              <button className="button w-full" onClick={() => setContatoAberto(true)}>Falar com corretor <IconeSetaExterna size={18} /></button>
              <p className="mb-[22px] mt-[10px] text-center text-xs text-muted">Converse diretamente com o corretor.</p>
              <div className="flex items-center gap-3 border-t border-line pt-[22px] [&_button]:min-h-11">
                {imovel.corretor && <>
                <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-soft text-[20px] text-brand [&_img]:h-full [&_img]:w-full [&_img]:object-cover">{imovel.corretor.url_foto ? <img src={urlFotoCorretor(imovel.corretor)} alt="" /> : imovel.corretor.nome.charAt(0)}</div>
                <div><strong className="block text-[15px]">{imovel.corretor.nome}</strong><span className="block text-xs text-muted">{imovel.corretor.creci ? `CRECI ${imovel.corretor.creci}` : 'Corretor responsável'}</span></div>
                </>}
                <div className="ml-auto shrink-0"><AcaoIcone icone={IconeCompartilhar} rotulo="Compartilhar imóvel" aoClicar={compartilhar} /></div>
              </div>
              {linkCopiado && <p className="mb-0 mt-2 text-right text-[13px] text-brand" role="status">Link copiado.</p>}
              <p className="mb-0 mt-5 flex items-start gap-[7px] text-[11px] text-muted [&_svg]:shrink-0"><IconeProtegido size={16} /> Seus dados são usados apenas para o atendimento.</p>
            </div>
          </aside>
            <div className="order-3 min-w-0 min-[761px]:col-start-1 min-[761px]:row-start-2">
            <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:mb-5 [&_h2]:text-[26px]" aria-labelledby="caracteristicas">
              <h2 id="caracteristicas">Características</h2>
              <div className={classeCard}>
                <ul className="m-0 grid list-none grid-cols-4 gap-3 p-0 max-[1000px]:grid-cols-3 max-[760px]:grid-cols-2">
                  {tiles.map(({ chave, icone: IconeTile, valor, rotulo }) => (
                    <li key={chave} className="flex flex-col gap-2 rounded-[3px] bg-soft px-4 py-[14px]">
                      <IconeTile size={22} className="text-brand" />
                      <span className="text-sm leading-tight">{valor !== null && <strong className="mr-1 font-display text-[22px] text-brand">{valor}</strong>}{rotulo}</span>
                    </li>
                  ))}
                </ul>
                {demaisCaracteristicas.length > 0 && (
                  <dl className="mb-0 mt-6 grid grid-cols-2 gap-x-8 gap-y-[14px] border-t border-line pt-6 max-[760px]:grid-cols-1 [&_dd]:m-0 [&_dd]:text-right [&_dd]:[overflow-wrap:anywhere] [&_div]:flex [&_div]:justify-between [&_div]:gap-5 [&_div]:border-b [&_div]:border-line [&_div]:pb-[10px] [&_div]:text-sm [&_dt]:[overflow-wrap:anywhere]">
                    {demaisCaracteristicas.map((item) => <div key={item.caracteristica_id}><dt>{rotuloCaracteristica(item.nome)}</dt><dd>{valorCaracteristica(item.valor)}</dd></div>)}
                  </dl>
                )}
              </div>
            </section>
            <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:mb-5 [&_h2]:text-[26px]"><h2>Sobre o imóvel</h2><div className={classeCard}><p className="mb-0 whitespace-pre-wrap leading-[1.8] text-muted">{imovel.descricao}</p></div></section>
            <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:mb-5 [&_h2]:text-[26px]">
              <h2>Localização</h2>
              <div className={`${classeCard} grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] items-start gap-6 max-[760px]:grid-cols-1 max-[760px]:gap-4`}>
                <p className="mb-0">{imovel.logradouro}, {imovel.numero}<br />{imovel.bairro} · {imovel.cidade}/{imovel.estado}</p>
                {enderecoCompleto && <div>
                  {/* O iframe é de outro domínio e captura o clique; o link transparente por cima abre o Maps em nova guia. */}
                  <div className="relative h-[180px] overflow-hidden rounded-[3px] border border-line max-[760px]:h-auto max-[760px]:aspect-[4/3]">
                    <iframe className="absolute inset-0 h-full w-full border-0" loading="lazy" tabIndex={-1} aria-hidden="true" title={`Mapa de ${imovel.titulo}`} referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${consultaMapa}&output=embed`} />
                    <a className="absolute inset-0 transition-colors duration-150 hover:bg-navy/5" href={urlMaps} target="_blank" rel="noopener noreferrer" aria-label="Abrir localização no Google Maps em nova guia" />
                  </div>
                  <a className="buttonSecondary mt-4 hidden w-full max-[760px]:flex" href={urlMaps} target="_blank" rel="noopener noreferrer">Abrir no Google Maps <IconeSetaExterna size={18} /></a>
                </div>}
              </div>
            </section>
          </div>
        </div>
        <Semelhantes key={`semelhantes-${imovel.id}`} atual={imovel} />
        <div className="hidden max-[760px]:fixed max-[760px]:inset-x-0 max-[760px]:bottom-0 max-[760px]:z-30 max-[760px]:flex max-[760px]:items-center max-[760px]:justify-between max-[760px]:gap-3 max-[760px]:border-t max-[760px]:border-gold max-[760px]:bg-navy max-[760px]:px-4 max-[760px]:pt-3 max-[760px]:pb-[calc(12px+env(safe-area-inset-bottom))] max-[760px]:shadow-lg">
          <div className="min-w-0"><span className="block text-xs text-white/80">{imovel.finalidade?.nome || 'Imóvel comercial'}</span><strong className="block font-display text-[19px] text-white [overflow-wrap:anywhere] max-[360px]:text-base">{preco ? <>{dinheiro(preco.valor)}{preco.tipo === 'locacao' && ' /mês'}</> : 'Sob consulta'}</strong></div>
          <button className="button min-h-12 shrink-0 px-3 text-sm border-b-gold bg-gold text-navy hover:bg-gold/90" onClick={() => setContatoAberto(true)}>Falar com corretor</button>
        </div>
        {contatoAberto && <FormularioContato imovel={imovel} aoFechar={() => setContatoAberto(false)} />}
      </>}
    </div>
  );
}
