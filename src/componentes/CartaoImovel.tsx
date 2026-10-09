import { useState } from 'react';
import { IconeSetaExterna, IconeLocal, IconeArea } from './Icones';
import { Link } from 'react-router-dom';
import type { Imovel } from '../tipos';
import { urlImovel } from '../servicos/urls';
import { area, dinheiro, rotulosStatusImovel, valorPrincipal } from '../servicos/formato';

export default function CartaoImovel({ imovel }: { imovel: Imovel }) {
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const capa = imovel.midias.find((midia) => midia.capa && midia.tipo === 'IMAGEM') || imovel.midias.find((midia) => midia.tipo === 'IMAGEM');
  const preco = valorPrincipal(imovel);
  const finalidade = imovel.finalidade?.nome || (preco?.tipo === 'locacao' ? 'Para alugar' : 'À venda');
  return (
    <article className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-paper shadow-sm transition-[transform,box-shadow] duration-1000 ease-in-out [@media(hover:hover)]:hover:z-10 [@media(hover:hover)]:hover:scale-[1.05] [@media(hover:hover)]:hover:shadow-2xl motion-reduce:transform-none motion-reduce:transition-none">
      <Link to={urlImovel(imovel.slug)} className="group relative block aspect-[1.47/1] overflow-hidden border-b-[3px] border-b-gold bg-soft max-[560px]:aspect-[4/3]" aria-label={`Ver ${imovel.titulo}`}>
        {capa && !imagemFalhou
          ? <img src={capa.url} alt={imovel.titulo} loading="lazy" decoding="async" onError={() => setImagemFalhou(true)} className="h-full w-full object-cover" />
          : <div className="grid h-full place-items-center text-muted">Foto em breve</div>}
        <span className="absolute left-[17px] top-[17px] rounded-sm border-b-2 border-gold bg-navy px-[11px] py-[6px] text-[11px] font-semibold uppercase tracking-[0.065em] text-white">{finalidade}</span>
        {imovel.destaque && <span className="absolute right-[14px] top-[17px] rounded-sm bg-gold px-[10px] py-[5px] text-[11px] font-semibold uppercase tracking-[0.065em] text-navy">Destaque</span>}
        <span className="absolute bottom-[14px] right-[14px] z-[1] grid h-11 w-11 place-items-center rounded-full bg-paper transition group-hover:translate-x-[2px] group-hover:-translate-y-[2px] group-hover:bg-gold-soft"><IconeSetaExterna size={19} /></span>
      </Link>
      <div className="flex flex-1 flex-col px-5 pb-4 pt-5 max-[560px]:px-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">{imovel.tipo?.nome || 'Imóvel'}</p>
          <span className="rounded-full border border-line px-2 py-[2px] text-[11px] font-semibold text-muted">{rotulosStatusImovel[imovel.status]}</span>
        </div>
        <h3 className="mb-2 min-h-[2.8em] text-[21px] leading-[1.4] max-[560px]:min-h-0 max-[560px]:text-[19px]"><Link to={urlImovel(imovel.slug)} title={imovel.titulo} className="line-clamp-2 no-underline hover:no-underline max-[560px]:line-clamp-none">{imovel.titulo}</Link></h3>
        <p className="mb-[17px] flex items-start gap-[5px] text-sm text-muted"><IconeLocal size={14} className="mt-1 shrink-0" /><span>{imovel.bairro}, {imovel.cidade}</span></p>
        <div className="mt-auto flex min-h-[62px] flex-wrap items-center justify-between gap-2.5 border-t border-line pt-[15px]">
          <span className="flex items-center gap-2 text-sm"><IconeArea size={15} />{area(imovel.area_util)}</span>
          <p className="m-0 text-right font-display whitespace-normal [overflow-wrap:anywhere]">
            {preco ? <><strong className="text-[20px] font-semibold text-brand">{dinheiro(preco.valor)}</strong>{preco.tipo === 'locacao' && <span className="font-sans text-xs text-muted"> /mês</span>}</> : <strong className="text-[16px] font-semibold text-brand">Sob consulta</strong>}
          </p>
        </div>
      </div>
    </article>
  );
}
