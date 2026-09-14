import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Building2, Layers, Search, SlidersHorizontal, Store, Trees, Warehouse } from 'lucide-react';
import { api } from '../../services/api';
import { readCatalogQuery, buildCatalogQuery } from '../../services/catalog';
import { catalogUrl, readCatalogUrl } from '../../services/urls';
import { classificationKey } from '../../services/portuguese';
import { useResource } from '../../hooks/useResource';
import PropertyCard from '../../components/PropertyCard';
import AsyncState from '../../components/AsyncState';
import Pagination from '../../components/Pagination';
import { Seo, useInitialData } from '../../seo/context';
import { brand } from '../../config/brand';

const icons = { GALPAO: Warehouse, SALA: Building2, PREDIO: Layers, LOJA: Store, TERRENO: Trees };
const fieldControl = 'mt-2 min-h-12 border-0 p-[2px_26px_2px_0] text-base';
const chipBase = 'inline-flex min-h-[42px] items-center gap-2 rounded-[3px] border border-line bg-transparent px-4 py-[10px] text-[13px] text-muted hover:border-navy max-[560px]:min-h-11 max-[560px]:px-3';
const chipSelected = 'border-navy bg-navy text-white shadow-[inset_0_-2px_0_var(--color-gold)]';

export default function Catalog() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = readCatalogUrl(location.pathname + location.search)!;
  const serialized = buildCatalogQuery(query);
  const params = new URLSearchParams(serialized);
  function setParams(next: URLSearchParams | Record<string, string>) {
    navigate(catalogUrl(readCatalogQuery(new URLSearchParams(next)), new URLSearchParams(location.search)));
  }
  const fetchProperties = useCallback(() => api.listProperties(readCatalogQuery(new URLSearchParams(serialized))), [serialized]);
  const initial = useInitialData();
  const { value: properties, loading, error, errorStatus, retry } = useResource(fetchProperties, initial?.data.catalog);
  const {value: classifications, error: classificationError, retry: retryClassifications} = useResource(useCallback(() => api.classifications(), []), initial?.data.classifications);
  const propertyTypes = Object.fromEntries((classifications?.types ?? []).map(item => [classificationKey(item), item.nome]));
  const [priceOpen, setPriceOpen] = useState(Boolean(query.minPrice || query.maxPrice));
  const [filterError, setFilterError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { formRef.current?.reset(); }, [serialized]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const min = String(form.get('minPrice') || ''); const max = String(form.get('maxPrice') || '');
    if (min && max && Number(min) > Number(max)) { setFilterError('O preço mínimo deve ser menor que o máximo.'); return; }
    setFilterError('');
    const next = new URLSearchParams();
    for (const field of ['purpose', 'type', 'city', 'minPrice', 'maxPrice']) {
      const value = String(form.get(field) || '').trim(); if (value) next.set(field, value);
    }
    setParams(next); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  }
  function selectType(type: string) {
    const next = new URLSearchParams(params); next.delete('page');
    if (type) next.set('type', type); else next.delete('type');
    setParams(next);
  }
  return <>
    <Seo data={{ catalog: properties, classifications }} status={errorStatus || 200}/>
    <section className="hero-anim container grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-16 pt-14 pb-[54px] max-[1100px]:gap-7 max-[800px]:gap-[22px] max-[800px]:pt-[30px] max-[560px]:grid-cols-1 max-[560px]:gap-6 max-[560px]:pb-[25px]">
      <div className="pt-6 max-[800px]:pt-[6px] max-[560px]:pt-0"><p className="eyebrow flex items-center"><span className="mr-3 inline-block h-[2px] w-[26px] bg-gold align-middle"/> Imóveis comerciais</p><h1 className="mt-[25px] mb-6 max-w-[650px] text-balance text-[clamp(35px,4vw,60px)] leading-[1.14] tracking-[-0.055em] max-[1100px]:text-[44px] max-[800px]:text-[36px] max-[560px]:mt-5 max-[560px]:text-[32px] max-[560px]:leading-[1.2] min-[1550px]:text-[64px]">Imóveis comerciais para alugar e comprar <em className="font-normal text-brand">em {brand.region.name}.</em></h1><p className="mb-6 text-[17px] leading-[1.75] text-muted max-[800px]:text-[15px] max-[560px]:text-base max-[560px]:leading-[1.6]">Encontre salas comerciais, lojas, galpões, prédios e terrenos.<br className="max-[800px]:hidden"/> Consulte as opções para o seu negócio em {brand.region.name}.</p><a className="inline-flex items-center gap-7 border-b-2 border-gold pb-2 text-sm font-semibold no-underline" href="#catalogo">Explore os imóveis <ArrowDown size={17}/></a><div className="mt-[38px] text-xs text-muted max-[1100px]:mt-6 max-[560px]:hidden"><span className="mr-[13px]">01 —</span> Um lugar para o que vem a seguir.</div></div>
      <div className="relative isolate mr-6 h-[470px] overflow-hidden rounded-[3px] shadow-[0_22px_48px_rgb(23_77_59/0.16),inset_0_-3px_0_var(--color-gold)] before:absolute before:top-[18px] before:-right-[18px] before:-bottom-[18px] before:left-[18px] before:-z-[1] before:rounded-[3px] before:border before:border-gold before:content-[''] max-[1100px]:h-[430px] max-[800px]:mr-[14px] max-[800px]:h-[400px] max-[560px]:mr-0 max-[560px]:h-[clamp(220px,62vw,300px)] max-[560px]:before:hidden min-[1550px]:h-[510px]"><img src="/assets/commercial-space-1200.webp" srcSet="/assets/commercial-space-640.webp 640w, /assets/commercial-space-960.webp 960w, /assets/commercial-space-1200.webp 1200w" sizes="(max-width: 560px) calc(100vw - 36px), (max-width: 800px) 50vw, 600px" width="1200" height="900" alt="Ambiente comercial iluminado, com mesas, vegetação e janelas amplas" className="h-full w-full rounded-[3px] object-cover" {...{ fetchpriority: "high" }}/><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#0A2042CC] px-[25px] pt-3 pb-3 text-white [text-shadow:0_1px_2px_#000] max-[560px]:px-4"><span className="text-[10px] tracking-[0.18em] max-[560px]:text-xs">ESPAÇOS QUE INSPIRAM</span><ArrowUpRight size={19}/></div><div aria-hidden="true" className="absolute top-0 right-[-27px] text-[9px] tracking-[0.17em] text-muted [writing-mode:vertical-rl] max-[800px]:right-[-20px] max-[560px]:hidden">TRABALHAR. CRIAR. CRESCER.</div></div>
    </section>
    <div className="container relative"><form ref={formRef} onSubmit={search} className="rounded-[5px] border border-line bg-paper px-7 pt-[26px] pb-[15px] shadow-[0_14px_34px_rgb(36_40_36/0.08)] max-[560px]:px-[18px] max-[560px]:pt-5 max-[560px]:pb-[10px]" aria-label="Buscar imóveis">
      <div className="grid grid-cols-[1fr_1fr_1.1fr_auto] items-end gap-[26px] max-[1100px]:gap-[18px] max-[800px]:grid-cols-2 max-[800px]:gap-5 max-[560px]:grid-cols-1 max-[560px]:gap-x-[14px] max-[560px]:gap-y-[18px]"><label className="block border-r border-line pr-5 text-xs font-semibold uppercase tracking-[0.14em] max-[1100px]:pr-[10px] max-[800px]:border-0 max-[800px]:p-0">O que você procura?<select name="purpose" defaultValue={query.purpose || ''} className={fieldControl}><option value="">Alugar ou comprar</option>{classifications?.purposes.map(item=><option key={item.id} value={classificationKey(item)}>{item.nome}</option>)}</select></label><label className="block border-r border-line pr-5 text-xs font-semibold uppercase tracking-[0.14em] max-[1100px]:pr-[10px] max-[800px]:border-0 max-[800px]:p-0">Tipo de imóvel<select name="type" defaultValue={query.type || ''} className={fieldControl}><option value="">Todos os tipos</option>{Object.entries(propertyTypes).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><label className="block text-xs font-semibold uppercase tracking-[0.14em]">Onde?<input name="city" placeholder="Cidade" defaultValue={query.city || ''} maxLength={100} className={fieldControl}/></label><button className="button mb-[3px] min-h-12 w-auto max-[1100px]:px-[15px] max-[1100px]:py-3 max-[560px]:w-full" type="submit"><Search size={17}/> Buscar</button></div>
      <div className="mt-[19px] flex items-center gap-5 border-t border-[#EEEFE8] pt-3"><button type="button" className="inline-flex min-h-11 items-center gap-2 border-0 bg-transparent px-0 py-[6px] text-xs text-muted" aria-expanded={priceOpen} onClick={() => setPriceOpen(!priceOpen)}><SlidersHorizontal size={15}/> Faixa de preço</button>{(query.type || query.purpose || query.city || query.minPrice !== undefined || query.maxPrice !== undefined || query.page > 1) && <button type="button" className="inline-flex min-h-11 items-center gap-2 border-0 bg-transparent px-0 py-[6px] text-xs text-muted underline" onClick={() => { setParams({}); setFilterError(''); }}>Limpar filtros</button>}<span className="ml-auto text-xs text-muted max-[560px]:hidden">O endereço certo faz a diferença.</span></div>
      <div className={priceOpen ? 'flex gap-5 py-3 max-[560px]:flex-col' : 'hidden'}><label className="block max-w-[250px] max-[560px]:max-w-none">Preço mínimo (R$)<input name="minPrice" type="number" min="0" step="0.01" max="9999999999.99" placeholder="Sem mínimo" defaultValue={query.minPrice}/></label><label className="block max-w-[250px] max-[560px]:max-w-none">Preço máximo (R$)<input name="maxPrice" type="number" min="0" step="0.01" max="9999999999.99" placeholder="Sem máximo" defaultValue={query.maxPrice}/></label></div>{filterError && <p className="error" role="alert">{filterError}</p>}
    </form></div>
    <section id="catalogo" className="container scroll-mt-[25px] pt-[82px] max-[560px]:pt-[45px]" aria-labelledby="catalog-title"><div className="flex items-end justify-between gap-6 max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-[10px]"><div><p className="eyebrow mb-3">Encontre seu espaço</p><h2 id="catalog-title" className="mb-0 text-[clamp(26px,2.5vw,35px)]">Novas possibilidades, <em className="text-brand not-italic">bons endereços.</em></h2></div><p className="muted mb-1 text-[13px] whitespace-nowrap max-[560px]:whitespace-normal" aria-live="polite">{!loading && !error && `${properties?.total || 0} imóveis encontrados`}</p></div>
      <div className="my-[30px] flex flex-wrap gap-[10px] max-[560px]:gap-2" role="group" aria-label="Filtrar por tipo"><button className={`${chipBase} ${!query.type ? chipSelected : ''}`} onClick={() => selectType('')} aria-pressed={!query.type}>Todos os imóveis</button>{Object.entries(propertyTypes).map(([type,label]) => { const Icon = icons[type as keyof typeof icons] || Building2; return <button key={type} className={`${chipBase} ${query.type === type ? chipSelected : ''}`} aria-pressed={query.type === type} onClick={() => selectType(type)}><Icon size={17} strokeWidth={1.5}/>{label}</button>; })}</div>
      <AsyncState loading={false} error={classificationError} retry={retryClassifications}/><AsyncState loading={loading} error={error} retry={retry} skeleton="cards"/>
      {!loading && !error && <>{properties?.items.length ? <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-x-[30px] gap-y-[54px] max-[1100px]:gap-x-5 max-[1100px]:gap-y-9 max-[800px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[560px]:grid-cols-1 max-[560px]:gap-7">{properties.items.map(property => <PropertyCard key={property.id} property={property}/>)}</div> : <div className="rounded-[5px] border border-dashed border-line bg-soft px-6 py-[72px] text-center [&_svg]:mx-auto [&_svg]:mb-3 [&_svg]:text-brand"><Search size={30}/><h3>Nenhum ponto com esse filtro</h3><p>Limpe a cidade ou o preço e tente de novo.</p><button className="buttonSecondary min-h-12" onClick={() => setParams({})}>Limpar filtros</button></div>}<Pagination href={page => { const next = new URLSearchParams(params); if (page === 1) next.delete('page'); else next.set('page', String(page)); return catalogUrl(readCatalogQuery(next), new URLSearchParams(location.search)); }} page={query.page} totalPages={properties?.totalPages || 0} onChange={page => { const next = new URLSearchParams(params); next.set('page', String(page)); setParams(next); document.getElementById('catalogo')?.scrollIntoView(); }}/></>}
    </section>
    <section className="container mt-[92px] grid grid-cols-2 gap-12 rounded-[3px] border-l-4 border-gold bg-navy px-14 py-[54px] text-white max-[800px]:gap-[30px] max-[800px]:p-8 max-[560px]:mt-[50px] max-[560px]:grid-cols-1 max-[560px]:gap-6 max-[560px]:px-6 max-[560px]:py-[30px]"><div><p className="eyebrow text-white">Do espaço à oportunidade</p><h2 className="mb-0">Seu negócio merece<br/>o endereço certo.</h2></div><div className="max-w-[400px] self-center"><p className="text-[#C6CEDD]">Explore cada detalhe e converse diretamente com o corretor responsável pelo imóvel que faz sentido para você.</p><Link to={catalogUrl({ purpose: 'LOCACAO' })} className="buttonSecondary border-gold text-white hover:bg-[#ffffff14]">Encontrar meu espaço <ArrowUpRight size={18}/></Link></div></section>
  </>;
}
