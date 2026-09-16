import { propertyUrl } from '../services/urls';
import { useState } from 'react';
import { ArrowUpRight, MapPin, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Property } from '../types';
import { area, money, propertyStatuses, propertyType } from '../services/format';
export default function PropertyCard({ property }: { property: Property }) {
  const [imageFailed, setImageFailed] = useState(false);
  const cover = property.media.find(media => media.isCover && media.type === 'IMAGE') || property.media.find(media => media.type === 'IMAGE');
  const showCover = cover && !imageFailed;
  return <article className="min-w-0">
    <Link to={propertyUrl(property.slug)} className="group relative block aspect-[1.47/1] overflow-hidden rounded-lg border-b-[3px] border-b-gold bg-soft max-[560px]:aspect-[4/3]" aria-label={`Ver ${property.title}`}>
      {showCover ? <img src={cover.url} alt={property.title} loading="lazy" decoding="async" onError={() => setImageFailed(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.045]"/> : <div className="grid h-full place-items-center text-muted">Foto em breve</div>}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(20_43_32/0.22))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
      <span className="absolute left-[17px] top-[17px] rounded-sm border-b-2 border-gold bg-navy px-[11px] py-[6px] text-[11px] font-semibold uppercase tracking-[0.065em] text-white">{property.purposeName || (property.purpose === 'LOCACAO' ? 'Para alugar' : 'À venda')}</span><span className="absolute bottom-[14px] right-[14px] z-[1] grid h-11 w-11 place-items-center rounded-full bg-paper transition group-hover:translate-x-[2px] group-hover:-translate-y-[2px] group-hover:bg-gold-soft"><ArrowUpRight size={19}/></span>
    </Link>
    <div className="pt-5"><div className="mb-2 flex flex-wrap items-center gap-2"><p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">{property.typeName || propertyType[property.type] || 'Imóvel'}</p>{property.status !== 'DISPONIVEL' && <span className="rounded-full border border-gold px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">{propertyStatuses[property.status]}</span>}</div><h3 className="mb-2 text-[21px] max-[560px]:text-[19px]"><Link to={propertyUrl(property.slug)} className="no-underline hover:underline">{property.title}</Link></h3><p className="mb-[17px] flex items-center gap-[5px] text-sm text-muted"><MapPin size={14}/>{property.neighborhood}, {property.addressCity}</p><div className="flex items-center justify-between gap-2.5 border-t border-line pt-[15px]"><span className="flex items-center gap-2 text-sm"><Maximize2 size={15}/>{area(property.usableArea)}</span><p className="m-0 text-right font-display whitespace-normal [overflow-wrap:anywhere]"><strong className="text-[20px] font-semibold text-brand">{money(property.price)}</strong>{property.purpose === 'LOCACAO' && <span className="font-sans text-xs text-muted"> /mês</span>}</p></div></div>
  </article>;
}
