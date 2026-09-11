import { ArrowUpRight, MapPin, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Property } from '../types';
import { area, money, propertyType } from '../services/format';
import styles from './PropertyCard.module.css';
export default function PropertyCard({ property }: { property: Property }) {
  const cover = property.media.find(media => media.isCover && media.type === 'IMAGE') || property.media.find(media => media.type === 'IMAGE');
  return <article className={styles.card}>
    <Link to={`/imoveis/${property.slug}`} className={styles.imageLink} aria-label={`Ver ${property.title}`}>
      {cover ? <img src={cover.url} alt={property.title} loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }}/>: <div className={styles.noPhoto}>Foto em breve</div>}
      <span className={styles.purpose}>{property.purpose === 'LOCACAO' ? 'Para alugar' : 'À venda'}</span><span className={styles.arrow}><ArrowUpRight size={19}/></span>
    </Link>
    <div className={styles.content}><p className={styles.category}>{propertyType[property.type]}</p><h3><Link to={`/imoveis/${property.slug}`}>{property.title}</Link></h3><p className={styles.location}><MapPin size={14}/>{property.neighborhood}, {property.addressCity}</p><div className={styles.bottom}><span className={styles.area}><Maximize2 size={15}/>{area(property.usableArea)}</span><p><strong>{money(property.price)}</strong>{property.purpose === 'LOCACAO' && <span> /mês</span>}</p></div></div>
  </article>;
}
