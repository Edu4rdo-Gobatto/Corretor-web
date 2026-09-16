import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, MapPin, Maximize2, Building2, ShieldCheck, Share2, MapPinned } from 'lucide-react';
import { api } from '../../services/api';
import { useResource } from '../../hooks/useResource';
import { area, featureLabel, featureValue, money, monthlyRentTotal, pricePerSquareMeter, propertyType } from '../../services/format';
import type { Property } from '../../types';
import AsyncState from '../../components/AsyncState';
import MediaGallery from '../../components/MediaGallery';
import PropertyCard from '../../components/PropertyCard';
import LeadFormModal from '../../components/LeadFormModal';
import { Seo, useInitialData } from '../../seo/context';

function RelatedProperties({ current }: { current: Property }) {
  const [items, setItems] = useState<Property[]>([]);
  useEffect(() => {
    let cancelled = false;
    api.listProperties({ page: 1, limit: 4, purpose: current.purpose, city: current.addressCity }).then(page => {
      if (cancelled) return;
      const matching = page.items.filter(item => item.id !== current.id);
      if (matching.length >= 3) { setItems(matching.slice(0, 3)); return; }
      api.listProperties({ page: 1, limit: 4, type: current.type }).then(fallback => { if (!cancelled) setItems([...matching, ...fallback.items.filter(item => item.id !== current.id && !matching.some(existing => existing.id === item.id))].slice(0, 3)); }).catch(() => { if (!cancelled) setItems(matching.slice(0, 3)); });
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [current.id, current.type, current.purpose, current.addressCity]);
  if (!items.length) return null;
  return (
    <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:text-[26px]" aria-labelledby="similares">
      <h2 id="similares">Você também pode gostar</h2>
      <div className="mt-5 grid grid-cols-3 gap-6 max-[1000px]:grid-cols-2 max-[760px]:grid-cols-1">
        {items.map(item => <PropertyCard key={item.id} property={item} />)}
      </div>
    </section>
  );
}

export default function PropertyDetail() {
  const { slug = '' } = useParams();
  const load = useCallback(() => api.getProperty(slug), [slug]);
  const initial = useInitialData();
  const { value: property, loading, error, errorStatus, retry } = useResource(load, initial?.data.property);
  const [contactOpen, setContactOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [loadedMap, setLoadedMap] = useState('');

  async function share() {
    if (!property) return;
    const url = typeof window === 'undefined' ? '' : new URL(window.location.pathname, window.location.origin).href;
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share({ title: property.title, url });
        return;
      }
      throw new Error('share indisponível');
    } catch (shareError) {
      if (shareError instanceof Error && shareError.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        setLinkCopied(true);
      } catch {
        setLinkCopied(false);
      }
    }
  }

  const mapQuery = property ? encodeURIComponent(`${property.addressStreet}, ${property.addressNumber} — ${property.neighborhood}, ${property.addressCity}/${property.addressState}`) : '';
  const hasMapAddress = property && [property.addressStreet, property.addressNumber, property.addressCity, property.addressState].every(value => String(value ?? '').trim().length > 0);
  const unitPrice = property ? pricePerSquareMeter(property.price, property.usableArea) : null;

  return (
    <div className="container pb-6 pt-[30px]">
      <Seo data={{ property }} status={errorStatus || 200} />
      <Link className="inline-flex items-center gap-2 text-sm text-muted no-underline transition duration-150 hover:-translate-x-[3px] hover:text-brand" to="/">
        <ArrowLeft size={16} /> Voltar aos imóveis
      </Link>
      <AsyncState loading={loading} error={error} retry={retry} skeleton="detail" />
      {!loading && !error && property && (
        <>
          <nav aria-label="Navegação estrutural" className="my-5 text-sm text-muted">
            <Link to="/">Imóveis comerciais</Link> / <span aria-current="page">{property.title}</span>
          </nav>
          <div className="py-[30px] max-[760px]:pt-6">
            <p className="eyebrow mb-[14px]">{property.typeName || propertyType[property.type] || 'Imóvel'} · {property.purposeName || (property.purpose === 'LOCACAO' ? 'Para alugar' : 'À venda')}</p>
            <h1 className="mb-[15px] max-w-[950px] text-[clamp(30px,3.3vw,46px)] max-[760px]:text-[32px]">{property.title}</h1>
            <p className="mb-0 flex items-center gap-[7px] text-muted">
              <MapPin size={17} />{property.neighborhood}, {property.addressCity} — {property.addressState}
            </p>
            <div className="mt-[18px] flex flex-wrap gap-2.5 [&_a]:min-h-11 [&_button]:min-h-11">
              <button type="button" className="buttonSecondary" onClick={share}><Share2 size={16} /> Compartilhar</button>
              <a className="buttonSecondary" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener noreferrer"><MapPinned size={16} /> Ver no mapa</a>
            </div>
            {linkCopied && <p className="mb-0 mt-2 text-[13px] text-brand" role="status">Link copiado.</p>}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-[52px] max-[1000px]:grid-cols-[minmax(0,1fr)_300px] max-[1000px]:gap-6 max-[760px]:grid-cols-1 max-[760px]:gap-5">
            <div className="min-w-0">
              <MediaGallery key={property.id} media={property.media} title={property.title} />
              <div className="grid grid-cols-2 gap-[14px] border-b border-line py-[26px] max-[1000px]:gap-3 max-[480px]:grid-cols-1 [&_span]:flex [&_span]:items-center [&_span]:gap-2 [&_span]:rounded-[3px] [&_span]:bg-soft [&_span]:px-4 [&_span]:py-[14px] [&_span]:text-sm [&_svg]:shrink-0 [&_svg]:text-brand">
                <span><Maximize2 size={20} /><strong>{area(property.usableArea)}</strong> de área útil</span>
                <span><Building2 size={20} /><strong>{area(property.totalArea)}</strong> de área total</span>
              </div>
              <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:text-[26px]">
                <h2>Um espaço, muitas possibilidades.</h2>
                <p className="whitespace-pre-wrap leading-[1.8] text-muted">{property.description}</p>
              </section>
              {Object.keys(property.features).length > 0 && (
                <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:text-[26px]">
                  <h2>Características</h2>
                  <dl className="grid grid-cols-2 gap-x-8 gap-y-[14px] max-[760px]:grid-cols-1 [&_dd]:m-0 [&_dd]:text-right [&_dd]:[overflow-wrap:anywhere] [&_div]:flex [&_div]:justify-between [&_div]:gap-5 [&_div]:border-b [&_div]:border-line [&_div]:pb-[10px] [&_div]:text-sm [&_dt]:[overflow-wrap:anywhere]">
                    {Object.entries(property.features).map(([name, value]) => <div key={name}><dt>{featureLabel(name)}</dt><dd>{featureValue(value)}</dd></div>)}
                  </dl>
                </section>
              )}
              <section className="pt-[34px] max-[480px]:pt-7 [&_h2]:text-[26px]">
                <h2>Localização</h2>
                <p>{property.addressStreet}, {property.addressNumber}<br />{property.neighborhood} · {property.addressCity}/{property.addressState}</p>
                {hasMapAddress && (loadedMap === mapQuery ? <iframe className="mt-4 min-h-[260px] w-full rounded border-0" loading="lazy" title={`Mapa de ${property.title}`} referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} /> : <button type="button" className="buttonSecondary" onClick={() => setLoadedMap(mapQuery)}>Carregar mapa</button>)}
              </section>
              <RelatedProperties key={`related-${property.id}`} current={property} />
            </div>
            <aside className="sticky top-32 min-w-0 max-[760px]:static">
              <div className="rounded-[5px] border border-line border-t-4 border-t-gold bg-paper p-[30px] shadow-[0_18px_38px_rgb(10_32_66/0.10)] max-[1000px]:p-[22px] max-[480px]:px-5 max-[480px]:py-6">
                <p className="eyebrow">{property.purpose === 'LOCACAO' ? 'Valor de locação' : property.purpose === 'VENDA' ? 'Valor de venda' : 'Valor anunciado'}</p>
                <p className="mb-[22px] text-[34px] font-semibold leading-[1.3] tracking-[-0.03em] text-brand max-[1000px]:text-[29px]">
                  {money(property.price)}{property.purpose === 'LOCACAO' && <span className="ml-[6px] text-[15px] font-normal text-muted">/mês</span>}
                </p>
                {unitPrice !== null && <p className="mb-3 text-sm text-muted">{money(unitPrice)} / m²</p>}
                {property.purpose === 'LOCACAO' && <><p className="mb-3 text-sm font-semibold text-ink">Soma dos valores informados{property.condoFee == null || property.iptuFee == null ? ' (parcial)' : ''}: {money(monthlyRentTotal(property.price, property.condoFee, property.iptuFee))}</p><p className="text-xs text-muted">Confirme os encargos e a periodicidade do IPTU com o corretor. Esta soma não representa necessariamente o custo mensal.</p></>}
                <dl className="pb-3 text-sm [&_dd]:m-0 [&_div]:flex [&_div]:justify-between [&_div]:gap-[15px] [&_div]:py-[5px] [&_dt]:text-muted">
                  {property.condoFee !== null && <div><dt>Condomínio</dt><dd>{money(property.condoFee)}</dd></div>}
                  {property.iptuFee !== null && <div><dt>IPTU informado</dt><dd>{money(property.iptuFee)}</dd></div>}
                </dl>
                <button className="button w-full max-[760px]:hidden" onClick={() => setContactOpen(true)}>Falar com corretor <ArrowUpRight size={18} /></button>
                <p className="mb-[25px] mt-[10px] text-center text-xs text-muted max-[760px]:hidden">Converse diretamente com o corretor.</p>
                <div className="flex items-center gap-3 border-t border-line pt-[22px]">
                  <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-soft text-[20px] text-brand [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                    {property.agent.avatarUrl ? <img src={property.agent.avatarUrl} alt="" /> : property.agent.name.charAt(0)}
                  </div>
                  <div><strong className="block text-[15px]">{property.agent.name}</strong><span className="block text-xs text-muted">{property.agent.creci ? `CRECI ${property.agent.creci}` : 'Corretor responsável'}</span></div>
                </div>
                <p className="mb-0 mt-5 flex items-start gap-[7px] text-[11px] text-muted [&_svg]:shrink-0"><ShieldCheck size={16} /> Seus dados são usados apenas para o atendimento.</p>
              </div>
              <p className="break-words px-2 py-[14px] text-[11px] text-muted max-[760px]:hidden">Referência: {property.id}</p>
            </aside>
          </div>
          <div className="hidden max-[760px]:sticky max-[760px]:bottom-0 max-[760px]:z-[5] max-[760px]:mt-6 max-[760px]:flex max-[760px]:items-center max-[760px]:justify-between max-[760px]:gap-4 max-[760px]:rounded-[5px] max-[760px]:border max-[760px]:border-navy max-[760px]:bg-navy max-[760px]:p-3 max-[760px]:pb-[calc(12px+env(safe-area-inset-bottom))] max-[760px]:shadow-[0_-8px_24px_rgb(10_32_66/0.10)]">
            <div><span className="block text-xs text-[#C6CEDD]">{property.purposeName || (property.purpose === 'LOCACAO' ? 'Locação' : 'Venda')}</span><strong className="font-display text-[19px] text-white">{money(property.price)}{property.purpose === 'LOCACAO' && ' /mês'}</strong></div>
            <button className="button min-h-12 border-b-gold bg-gold text-navy hover:bg-[#b38935]" onClick={() => setContactOpen(true)}>Falar com corretor</button>
          </div>
          {contactOpen && <LeadFormModal property={property} onClose={() => setContactOpen(false)} />}
        </>
      )}
    </div>
  );
}
