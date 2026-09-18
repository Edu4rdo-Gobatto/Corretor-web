import { LoaderCircle, CircleAlert } from 'lucide-react';

// O brilho usa tokens do tema: um cinza fixo virava uma faixa clara demais no tema escuro.
const brilho = 'block rounded-lg bg-[linear-gradient(100deg,var(--color-soft)_40%,var(--color-line)_50%,var(--color-soft)_60%)] bg-[length:200%_100%] animate-shimmer motion-reduce:animate-none';

/** Carregamento (com esqueleto opcional) e erro com nova tentativa. */
export default function EstadoCarregamento({ carregando, erro, tentarNovamente, esqueleto }: { carregando: boolean; erro?: string; tentarNovamente?: () => void; esqueleto?: 'cartoes' | 'detalhe' }) {
  if (carregando) {
    if (esqueleto === 'cartoes') {
      return (
        <div className="grid grid-cols-3 gap-x-[30px] gap-y-[54px] max-[800px]:grid-cols-2 max-[560px]:grid-cols-1" role="status" aria-label="Carregando imóveis">
          {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="grid gap-3"><span className={`${brilho} aspect-[1.47/1]`} /><span className={`${brilho} h-[72px]`} /></div>)}
        </div>
      );
    }
    if (esqueleto === 'detalhe') {
      return (
        <div className="grid gap-4 py-5" role="status" aria-label="Carregando imóvel">
          <span className={`${brilho} h-[475px] max-[560px]:h-[320px]`} /><span className={`${brilho} h-7`} /><span className={`${brilho} h-7`} />
        </div>
      );
    }
    return <div className="px-6 py-16 text-center text-muted [&_svg]:mx-auto [&_svg]:mb-3" role="status"><LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /><p>Carregando…</p></div>;
  }
  if (erro) {
    return (
      <div className="px-6 py-16 text-center text-muted [&_svg]:mx-auto [&_svg]:mb-3" role="alert">
        <CircleAlert aria-hidden="true" /><p>{erro}</p>
        {tentarNovamente && <button className="buttonSecondary" onClick={tentarNovamente}>Tentar novamente</button>}
      </div>
    );
  }
  return null;
}
