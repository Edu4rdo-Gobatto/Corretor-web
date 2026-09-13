import { LoaderCircle, CircleAlert } from 'lucide-react';
const shimmer =
  'block rounded-lg bg-[linear-gradient(100deg,var(--color-soft)_40%,#E4E8EF_50%,var(--color-soft)_60%)] bg-[length:200%_100%] animate-shimmer motion-reduce:animate-none';
export default function AsyncState({ loading, error, retry, skeleton }: { loading: boolean; error?: string; retry?: () => void; skeleton?: 'cards' | 'detail' }) {
  if (loading) {
    if (skeleton === 'cards')
      return (
        <div className="grid grid-cols-3 gap-x-[30px] gap-y-[54px] max-[800px]:grid-cols-2 max-[560px]:grid-cols-1" role="status" aria-label="Carregando imóveis">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="grid gap-3">
              <span className={`${shimmer} aspect-[1.47/1]`} />
              <span className={`${shimmer} h-[72px]`} />
            </div>
          ))}
        </div>
      );
    if (skeleton === 'detail')
      return (
        <div className="grid gap-4 py-5" role="status" aria-label="Carregando imóvel">
          <span className={`${shimmer} h-[475px] max-[560px]:h-[320px]`} />
          <span className={`${shimmer} h-7`} />
          <span className={`${shimmer} h-7`} />
        </div>
      );
    return <div className="px-6 py-16 text-center text-muted [&_svg]:mx-auto [&_svg]:mb-3" role="status"><LoaderCircle aria-hidden="true"/><p>Carregando…</p></div>;
  }
  if (error) return <div className="px-6 py-16 text-center text-muted [&_svg]:mx-auto [&_svg]:mb-3" role="alert"><CircleAlert aria-hidden="true"/><p>{error}</p>{retry && <button className="buttonSecondary" onClick={retry}>Tentar novamente</button>}</div>;
  return null;
}
