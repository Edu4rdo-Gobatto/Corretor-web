import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, MapPin, Maximize2, Building2, ShieldCheck, Share2, MapPinned } from 'lucide-react';
import { api } from '../../servicos/api';
import { useRecurso } from '../../hooks/useRecurso';
import { urlImovel } from '../../servicos/urls';
import { area, codigoImovel, dinheiro, precoPorMetro, rotuloCaracteristica, somaMensal, valorCaracteristica, valorPrincipal } from '../../servicos/formato';
import type { Imovel } from '../../tipos';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import GaleriaMidia from '../../componentes/GaleriaMidia';
import CartaoImovel from '../../componentes/CartaoImovel';
import FormularioContato from '../../componentes/FormularioContato';
import { Seo, useDadosIniciais } from '../../seo/context';

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
      api.listarImoveis({ pagina: 1, limite: 4, tipo })
        .then((reserva) => { if (!cancelado) setItens([...proximos, ...semAtual(reserva.itens).filter((item) => !proximos.some((existente) => existente.id === item.id))].slice(0, 3)); })
        .catch(() => { if (!cancelado) setItens(proximos.slice(0, 3)); });
    }).catch(() => undefined);
    return () => { cancelado = true; };
  }, [atual.id, atual.cidade, finalidade, tipo]);
  if (!itens.length) return null;
  return (
    <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:text-[26px]" aria-labelledby="similares">
      <h2 id="similares">Você também pode gostar</h2>
      <div className="mt-5 grid grid-cols-3 gap-6 max-[1000px]:grid-cols-2 max-[760px]:grid-cols-1">{itens.map((item) => <CartaoImovel key={item.id} imovel={item} />)}</div>
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
  const [mapaCarregado, setMapaCarregado] = useState('');

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
  const enderecoCompleto = imovel && [imovel.logradouro, imovel.numero, imovel.cidade, imovel.estado].every((valor) => String(valor ?? '').trim().length > 0);
  const preco = imovel ? valorPrincipal(imovel) : null;
  const precoMetro = imovel && preco ? precoPorMetro(preco.valor, Number(imovel.area_util)) : null;
  const condominio = imovel?.valor_condominio === null || imovel?.valor_condominio === undefined ? null : Number(imovel.valor_condominio);
  const iptu = imovel?.valor_iptu === null || imovel?.valor_iptu === undefined ? null : Number(imovel.valor_iptu);

  return (
    <div className="container pb-6 pt-[30px]">
      <Seo dados={{ imovel }} status={statusErro || 200} />
      <Link className="inline-flex items-center gap-2 text-sm text-muted no-underline transition duration-150 hover:-translate-x-[3px] hover:text-brand" to="/"><ArrowLeft size={16} /> Voltar aos imóveis</Link>
      <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={tentarNovamente} esqueleto="detalhe" />
      {!carregando && !erro && imovel && <>
        <nav aria-label="Navegação estrutural" className="my-5 text-sm text-muted"><Link to="/">Imóveis comerciais</Link> / <span aria-current="page">{imovel.titulo}</span></nav>
        <div className="py-[30px] max-[760px]:pt-6">
          <p className="eyebrow mb-[14px]">{imovel.tipo?.nome || 'Imóvel'} · {imovel.finalidade?.nome || 'Imóvel comercial'} · Ref. {codigoImovel(imovel.id)}</p>
          <h1 className="mb-[15px] max-w-[950px] text-[clamp(30px,3.3vw,46px)] max-[760px]:text-[32px]">{imovel.titulo}</h1>
          <p className="mb-0 flex items-center gap-[7px] text-muted"><MapPin size={17} />{imovel.bairro}, {imovel.cidade} — {imovel.estado}</p>
          <div className="mt-[18px] flex flex-wrap gap-2.5 [&_a]:min-h-11 [&_button]:min-h-11">
            <button type="button" className="buttonSecondary" onClick={compartilhar}><Share2 size={16} /> Compartilhar</button>
            <a className="buttonSecondary" href={`https://www.google.com/maps/search/?api=1&query=${consultaMapa}`} target="_blank" rel="noopener noreferrer"><MapPinned size={16} /> Ver no mapa</a>
          </div>
          {linkCopiado && <p className="mb-0 mt-2 text-[13px] text-brand" role="status">Link copiado.</p>}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-[52px] max-[1000px]:grid-cols-[minmax(0,1fr)_300px] max-[1000px]:gap-6 max-[760px]:grid-cols-1 max-[760px]:gap-5">
          <div className="min-w-0">
            <GaleriaMidia key={imovel.id} midias={imovel.midias} titulo={imovel.titulo} />
            <div className="grid grid-cols-2 gap-[14px] border-b border-line py-[26px] max-[1000px]:gap-3 max-[480px]:grid-cols-1 [&_span]:flex [&_span]:items-center [&_span]:gap-2 [&_span]:rounded-[3px] [&_span]:bg-soft [&_span]:px-4 [&_span]:py-[14px] [&_span]:text-sm [&_svg]:shrink-0 [&_svg]:text-brand">
              <span><Maximize2 size={20} /><strong>{area(imovel.area_util)}</strong> de área útil</span>
              <span><Building2 size={20} /><strong>{area(imovel.area_total)}</strong> de área total</span>
            </div>
            <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:text-[26px]"><h2>Um espaço, muitas possibilidades.</h2><p className="whitespace-pre-wrap leading-[1.8] text-muted">{imovel.descricao}</p></section>
            {imovel.caracteristicas.length > 0 && (
              <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:text-[26px]">
                <h2>Características</h2>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-[14px] max-[760px]:grid-cols-1 [&_dd]:m-0 [&_dd]:text-right [&_dd]:[overflow-wrap:anywhere] [&_div]:flex [&_div]:justify-between [&_div]:gap-5 [&_div]:border-b [&_div]:border-line [&_div]:pb-[10px] [&_div]:text-sm [&_dt]:[overflow-wrap:anywhere]">
                  {imovel.caracteristicas.map((item) => <div key={item.caracteristica_id}><dt>{rotuloCaracteristica(item.nome)}</dt><dd>{valorCaracteristica(item.valor)}</dd></div>)}
                </dl>
              </section>
            )}
            <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:text-[26px]">
              <h2>Localização</h2>
              <p>{imovel.logradouro}, {imovel.numero}<br />{imovel.bairro} · {imovel.cidade}/{imovel.estado}</p>
              {enderecoCompleto && (mapaCarregado === consultaMapa
                ? <iframe className="mt-4 min-h-[260px] w-full rounded border-0" loading="lazy" title={`Mapa de ${imovel.titulo}`} referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${consultaMapa}&output=embed`} />
                : <button type="button" className="buttonSecondary" onClick={() => setMapaCarregado(consultaMapa)}>Carregar mapa</button>)}
            </section>
            <Semelhantes key={`semelhantes-${imovel.id}`} atual={imovel} />
          </div>
          <aside className="sticky top-32 min-w-0 max-[760px]:static">
            <div className="rounded-[5px] border border-line border-t-4 border-t-gold bg-paper p-[30px] shadow-[0_18px_38px_rgb(10_32_66/0.10)] max-[1000px]:p-[22px] max-[480px]:px-5 max-[480px]:py-6">
              {imovel.valor_venda !== null && <><p className="eyebrow">Valor de venda</p><p className="mb-[14px] text-[34px] font-semibold leading-[1.3] tracking-[-0.03em] text-brand max-[1000px]:text-[29px]">{dinheiro(imovel.valor_venda)}</p></>}
              {imovel.valor_locacao !== null && <><p className="eyebrow">Valor de locação</p><p className="mb-[14px] text-[34px] font-semibold leading-[1.3] tracking-[-0.03em] text-brand max-[1000px]:text-[29px]">{dinheiro(imovel.valor_locacao)}<span className="ml-[6px] text-[15px] font-normal text-muted">/mês</span></p></>}
              {!preco && <><p className="eyebrow">Valor</p><p className="mb-[14px] text-[26px] font-semibold text-brand">Sob consulta</p></>}
              {precoMetro !== null && <p className="mb-3 text-sm text-muted">{dinheiro(precoMetro)} / m² ({preco?.tipo === 'locacao' ? 'locação' : 'venda'})</p>}
              {imovel.valor_locacao !== null && <><p className="mb-3 text-sm font-semibold text-ink">Soma dos valores informados{condominio === null || iptu === null ? ' (parcial)' : ''}: {dinheiro(somaMensal(Number(imovel.valor_locacao), condominio, iptu))}</p><p className="text-xs text-muted">Confirme os encargos e a periodicidade do IPTU com o corretor. Esta soma não representa necessariamente o custo mensal.</p></>}
              <dl className="pb-3 text-sm [&_dd]:m-0 [&_div]:flex [&_div]:justify-between [&_div]:gap-[15px] [&_div]:py-[5px] [&_dt]:text-muted">
                {condominio !== null && <div><dt>Condomínio</dt><dd>{dinheiro(condominio)}</dd></div>}
                {iptu !== null && <div><dt>IPTU informado</dt><dd>{dinheiro(iptu)}</dd></div>}
              </dl>
              <button className="button w-full max-[760px]:hidden" onClick={() => setContatoAberto(true)}>Falar com corretor <ArrowUpRight size={18} /></button>
              <p className="mb-[25px] mt-[10px] text-center text-xs text-muted max-[760px]:hidden">Converse diretamente com o corretor.</p>
              {imovel.corretor && <div className="flex items-center gap-3 border-t border-line pt-[22px]">
                <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-soft text-[20px] text-brand [&_img]:h-full [&_img]:w-full [&_img]:object-cover">{imovel.corretor.url_foto ? <img src={imovel.corretor.url_foto} alt="" /> : imovel.corretor.nome.charAt(0)}</div>
                <div><strong className="block text-[15px]">{imovel.corretor.nome}</strong><span className="block text-xs text-muted">{imovel.corretor.creci ? `CRECI ${imovel.corretor.creci}` : 'Corretor responsável'}</span></div>
              </div>}
              <p className="mb-0 mt-5 flex items-start gap-[7px] text-[11px] text-muted [&_svg]:shrink-0"><ShieldCheck size={16} /> Seus dados são usados apenas para o atendimento.</p>
            </div>
            <p className="px-2 py-[14px] text-[11px] text-muted max-[760px]:hidden">Referência: {codigoImovel(imovel.id)}</p>
          </aside>
        </div>
        <div className="hidden max-[760px]:sticky max-[760px]:bottom-0 max-[760px]:z-[5] max-[760px]:mt-6 max-[760px]:flex max-[760px]:items-center max-[760px]:justify-between max-[760px]:gap-4 max-[760px]:rounded-[5px] max-[760px]:border max-[760px]:border-navy max-[760px]:bg-navy max-[760px]:p-3 max-[760px]:pb-[calc(12px+env(safe-area-inset-bottom))] max-[760px]:shadow-[0_-8px_24px_rgb(10_32_66/0.10)]">
          <div><span className="block text-xs text-[#C6CEDD]">{imovel.finalidade?.nome || 'Imóvel comercial'}</span><strong className="font-display text-[19px] text-white">{preco ? <>{dinheiro(preco.valor)}{preco.tipo === 'locacao' && ' /mês'}</> : 'Sob consulta'}</strong></div>
          <button className="button min-h-12 border-b-gold bg-gold text-navy hover:bg-[#b38935]" onClick={() => setContatoAberto(true)}>Falar com corretor</button>
        </div>
        {contatoAberto && <FormularioContato imovel={imovel} aoFechar={() => setContatoAberto(false)} />}
      </>}
    </div>
  );
}
