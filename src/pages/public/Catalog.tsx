import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Building2, Layers, Search, SlidersHorizontal, Store, Trees, Warehouse } from 'lucide-react';
import { api } from '../../services/api';
import { readCatalogQuery } from '../../services/catalog';
import { propertyTypes } from '../../services/format';
import { useResource } from '../../hooks/useResource';
import PropertyCard from '../../components/PropertyCard';
import AsyncState from '../../components/AsyncState';
import Pagination from '../../components/Pagination';
import styles from './Catalog.module.css';
import { Seo, useInitialData } from '../../seo/context';
import { brand } from '../../config/brand';

const icons = { GALPAO: Warehouse, SALA: Building2, PREDIO: Layers, LOJA: Store, TERRENO: Trees };
export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const serialized = params.toString();
  const query = readCatalogQuery(params);
  const fetchProperties = useCallback(() => api.listProperties(readCatalogQuery(new URLSearchParams(serialized))), [serialized]);
  const initial = useInitialData();
  const { value: properties, loading, error, errorStatus, retry } = useResource(fetchProperties, initial?.data.catalog);
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
    <Seo data={{ catalog: properties }} status={errorStatus || 200}/>
    <section className={`container ${styles.hero}`}>
      <div className={styles.heroCopy}><p className="eyebrow"><span className={styles.smallLine}/> Imóveis comerciais</p><h1>Imóveis comerciais para alugar e comprar <em>em {brand.region.name}.</em></h1><p className={styles.intro}>Encontre salas comerciais, lojas, galpões, prédios e terrenos.<br className={styles.desktopBreak}/> Consulte as opções para o seu negócio em {brand.region.name}.</p><a className={styles.explore} href="#catalogo">Explore os imóveis <ArrowDown size={17}/></a><div className={styles.heroNote}><span>01 —</span> Um lugar para o que vem a seguir.</div></div>
      <div className={styles.heroVisual}><img src="/assets/commercial-space-1200.webp" srcSet="/assets/commercial-space-640.webp 640w, /assets/commercial-space-960.webp 960w, /assets/commercial-space-1200.webp 1200w" sizes="(max-width: 560px) calc(100vw - 36px), (max-width: 800px) 50vw, 600px" width="1200" height="900" alt="Ambiente comercial iluminado, com mesas, vegetação e janelas amplas" {...{ fetchpriority: "high" }}/><div className={styles.imageCaption}><span>ESPAÇOS QUE INSPIRAM</span><ArrowUpRight size={19}/></div><div className={styles.verticalText}>TRABALHAR. CRIAR. CRESCER.</div></div>
    </section>
    <div className={`container ${styles.searchArea}`}><form ref={formRef} onSubmit={search} className={styles.searchForm} aria-label="Buscar imóveis">
      <div className={styles.searchMain}><label>O que você procura?<select name="purpose" defaultValue={query.purpose || ''}><option value="">Alugar ou comprar</option><option value="LOCACAO">Quero alugar</option><option value="VENDA">Quero comprar</option></select></label><label>Tipo de imóvel<select name="type" defaultValue={query.type || ''}><option value="">Todos os tipos</option>{Object.entries(propertyTypes).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><label>Onde?<input name="city" placeholder="Cidade" defaultValue={query.city || ''} maxLength={100}/></label><button className="button" type="submit"><Search size={17}/> Encontrar imóvel</button></div>
      <div className={styles.filterBottom}><button type="button" className={styles.moreFilters} aria-expanded={priceOpen} onClick={() => setPriceOpen(!priceOpen)}><SlidersHorizontal size={15}/> Faixa de preço</button>{serialized && <button type="button" className={styles.clear} onClick={() => { setParams({}); setFilterError(''); }}>Limpar filtros</button>}<span>O endereço certo faz a diferença.</span></div>
      <div className={styles.priceFields} hidden={!priceOpen}><label>Preço mínimo (R$)<input name="minPrice" type="number" min="0" step="0.01" max="9999999999.99" placeholder="Sem mínimo" defaultValue={query.minPrice}/></label><label>Preço máximo (R$)<input name="maxPrice" type="number" min="0" step="0.01" max="9999999999.99" placeholder="Sem máximo" defaultValue={query.maxPrice}/></label></div>{filterError && <p className="error" role="alert">{filterError}</p>}
    </form></div>
    <section id="catalogo" className={`container ${styles.catalog}`} aria-labelledby="catalog-title"><div className={styles.sectionHeading}><div><p className="eyebrow">Encontre seu espaço</p><h2 id="catalog-title">Novas possibilidades, <em>bons endereços.</em></h2></div><p className="muted" aria-live="polite">{!loading && !error && `${properties?.total || 0} imóveis encontrados`}</p></div>
      <div className={styles.categories} role="group" aria-label="Filtrar por tipo"><button className={!query.type ? styles.selected : ''} onClick={() => selectType('')} aria-pressed={!query.type}>Todos os imóveis</button>{Object.entries(propertyTypes).map(([type,label]) => { const Icon = icons[type as keyof typeof icons]; return <button key={type} className={query.type === type ? styles.selected : ''} aria-pressed={query.type === type} onClick={() => selectType(type)}><Icon size={17} strokeWidth={1.5}/>{label}</button>; })}</div>
      <AsyncState loading={loading} error={error} retry={retry} skeleton="cards"/>
      {!loading && !error && <>{properties?.items.length ? <div className={styles.grid}>{properties.items.map(property => <PropertyCard key={property.id} property={property}/>)}</div> : <div className={styles.empty}><Search size={30}/><h3>Nenhum imóvel com esses filtros</h3><p>Experimente outra cidade, tipo de imóvel ou faixa de preço.</p><button className="buttonSecondary" onClick={() => setParams({})}>Ver todos os imóveis</button></div>}<Pagination href={page => { const next = new URLSearchParams(params); if (page === 1) next.delete('page'); else next.set('page', String(page)); return next.size ? `/?${next}` : '/'; }} page={query.page} totalPages={properties?.totalPages || 0} onChange={page => { const next = new URLSearchParams(params); next.set('page', String(page)); setParams(next); document.getElementById('catalogo')?.scrollIntoView(); }}/></>}
    </section>
    <section className={`container ${styles.closing}`}><div><p className="eyebrow">Do espaço à oportunidade</p><h2>Seu negócio merece<br/>o endereço certo.</h2></div><div><p>Explore cada detalhe e converse diretamente com o corretor responsável pelo imóvel que faz sentido para você.</p><Link to="/?purpose=LOCACAO" className="buttonSecondary">Encontrar meu espaço <ArrowUpRight size={18}/></Link></div></section>
  </>;
}
