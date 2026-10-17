import { useState, type ImgHTMLAttributes, type ReactNode } from 'react';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> & {
  src: string;
  alt: string;
  /** Tamanho intrínseco (evita CLS). Use 'caixa-do-pai' quando a caixa já reserva o espaço (aspect-ratio ou altura fixa) e a API não informa dimensões. */
  dimensoes: { width: number; height: number } | 'caixa-do-pai';
  /** Acima da dobra (candidata a LCP): carrega já e com prioridade alta. */
  prioridade?: boolean;
  /** Exibida no lugar da imagem quando ela falha ao carregar. */
  reserva?: ReactNode;
};

/** Único `<img>` do app: abaixo da dobra é lazy/async por padrão; acima da dobra, `prioridade`. Renderiza só o `<img>`, sem wrapper. */
export default function ImgOtimizada({ src, alt, dimensoes, prioridade = false, reserva, loading, decoding = 'async', onError, ...resto }: Props) {
  const [srcComFalha, setSrcComFalha] = useState<string>();
  if (reserva !== undefined && srcComFalha === src) return <>{reserva}</>;
  return <img
    {...resto}
    {...(dimensoes === 'caixa-do-pai' ? {} : dimensoes)}
    // React 18.3 avisa com `fetchPriority`; em minúsculas o atributo vai ao DOM e ao HTML do SSR.
    {...(prioridade ? { fetchpriority: 'high' } : {})}
    src={src}
    alt={alt}
    loading={loading ?? (prioridade ? 'eager' : 'lazy')}
    decoding={decoding}
    onError={(evento) => { if (reserva !== undefined) setSrcComFalha(src); onError?.(evento); }}
  />;
}
