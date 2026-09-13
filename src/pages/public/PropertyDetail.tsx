import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, MapPin, Maximize2, Building2, ShieldCheck, Share2, MapPinned } from 'lucide-react';
import { api } from '../../services/api';
import { useResource } from '../../hooks/useResource';
import { area, featureLabel, featureValue, money, propertyType } from '../../services/format';
import type { Property } from '../../types';
import AsyncState from '../../components/AsyncState';
import MediaGallery from '../../components/MediaGallery';
import PropertyCard from '../../components/PropertyCard';
import LeadFormModal from '../../components/LeadFormModal';
import styles from './PropertyDetail.module.css';
import { Seo, useInitialData } from '../../seo/context';
function RelatedProperties({ current }: { current: Property }) {
  const [items, setItems] = useState<Property[]>([]);
  useEffect(() => {
    let cancelled = false;
    api.listProperties({ page: 1, limit: 4, type: current.type }).then(page => {
      if (!cancelled) setItems(page.items.filter(item => item.id !== current.id).slice(0, 3));
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [current.id, current.type]);
  if (!items.length) return null;
  return <section className={styles.section} aria-labelledby="similares"><h2 id="similares">Você também pode gostar</h2><div className={styles.related}>{items.map(item => <PropertyCard key={item.id} property={item}/>)}</div></section>;
}
export default function PropertyDetail() {
  const { slug = '' } = useParams();
  const load = useCallback(() => api.getProperty(slug), [slug]);
  const initial = useInitialData();
  const { value: property, loading, error, errorStatus, retry } = useResource(load, initial?.data.property);
  const [contactOpen, setContactOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  async function share() {
    if (!property) return;
    const url = typeof window === 'undefined' ? '' : window.location.href;
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
  return <div className={`container ${styles.page}`}><Seo data={{ property }} status={errorStatus || 200}/><Link className={styles.back} to="/"><ArrowLeft size={16}/> Voltar aos imóveis</Link><AsyncState loading={loading} error={error} retry={retry} skeleton="detail"/>{!loading && !error && property && <><nav aria-label="Navegação estrutural" className={styles.breadcrumb}><Link to="/">Imóveis comerciais</Link> / <span aria-current="page">{property.title}</span></nav><div className={styles.heading}><p className="eyebrow">{propertyType[property.type]} · {property.purpose === 'LOCACAO' ? 'Para alugar' : 'À venda'}</p><h1>{property.title}</h1><p className={styles.location}><MapPin size={17}/>{property.neighborhood}, {property.addressCity} — {property.addressState}</p><div className={styles.headingActions}><button type="button" className="buttonSecondary" onClick={share}><Share2 size={16}/> Compartilhar</button><a className="buttonSecondary" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener noreferrer"><MapPinned size={16}/> Ver no mapa</a></div>{linkCopied && <p className={styles.copied} role="status">Link copiado.</p>}</div><div className={styles.layout}><div><MediaGallery key={property.id} media={property.media} title={property.title}/><div className={styles.facts}><span><Maximize2 size={20}/><strong>{area(property.usableArea)}</strong> de área útil</span><span><Building2 size={20}/><strong>{area(property.totalArea)}</strong> de área total</span></div><section className={styles.section}><h2>Um espaço, muitas possibilidades.</h2><p className={styles.description}>{property.description}</p></section>{Object.keys(property.features).length > 0 && <section className={styles.section}><h2>Características</h2><dl className={styles.features}>{Object.entries(property.features).map(([name, value]) => <div key={name}><dt>{featureLabel(name)}</dt><dd>{featureValue(value)}</dd></div>)}</dl></section>}<section className={styles.section}><h2>Localização</h2><p>{property.addressStreet}, {property.addressNumber}<br/>{property.neighborhood} · {property.addressCity}/{property.addressState}</p></section><RelatedProperties current={property}/></div><aside className={styles.aside}><div className={styles.contactCard}><p className="eyebrow">{property.purpose === 'LOCACAO' ? 'Valor de locação' : 'Valor de venda'}</p><p className={styles.price}>{money(property.price)}{property.purpose === 'LOCACAO' && <span>/mês</span>}</p><dl className={styles.costs}>{property.condoFee !== null && <div><dt>Condomínio</dt><dd>{money(property.condoFee)}</dd></div>}{property.iptuFee !== null && <div><dt>IPTU informado</dt><dd>{money(property.iptuFee)}</dd></div>}</dl><button className="button" onClick={() => setContactOpen(true)}>Tenho interesse <ArrowUpRight size={18}/></button><p className={styles.contactHint}>Converse diretamente com o corretor.</p><div className={styles.agent}><div className={styles.avatar}>{property.agent.avatarUrl ? <img src={property.agent.avatarUrl} alt=""/> : property.agent.name.charAt(0)}</div><div><strong>{property.agent.name}</strong><span>{property.agent.creci ? `CRECI ${property.agent.creci}` : 'Corretor responsável'}</span></div></div><p className={styles.assurance}><ShieldCheck size={16}/> Seus dados são usados apenas para o atendimento.</p></div><p className={styles.reference}>Referência: {property.id}</p></aside></div><div className={styles.mobileCta}><div><span>{property.purpose === 'LOCACAO' ? 'Locação' : 'Venda'}</span><strong>{money(property.price)}{property.purpose === 'LOCACAO' && ' /mês'}</strong></div><button className="button" onClick={() => setContactOpen(true)}>Tenho interesse</button></div>{contactOpen && <LeadFormModal property={property} onClose={() => setContactOpen(false)}/>}</>}</div>;
}
