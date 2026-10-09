import type { ReactNode } from 'react';
import { IconeSucesso, IconeErro, IconeInfo, IconeAtencao } from './Icones';

type Tom = 'informacao' | 'sucesso' | 'atencao' | 'erro';
const aparencias = {
  informacao: { icone: IconeInfo, classe: 'border-line bg-soft text-ink' },
  sucesso: { icone: IconeSucesso, classe: 'border-sucesso/30 bg-sucesso-suave text-sucesso' },
  atencao: { icone: IconeAtencao, classe: 'border-atencao/30 bg-atencao-suave text-atencao' },
  erro: { icone: IconeErro, classe: 'border-error/30 bg-error/10 text-error' },
};

export default function Aviso({ tom = 'informacao', children, classe = '' }: { tom?: Tom; children: ReactNode; classe?: string }) {
  const { icone: Icone, classe: aparencia } = aparencias[tom];
  return <div role={tom === 'erro' ? 'alert' : 'status'} className={`aviso-painel my-4 flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${aparencia} ${classe}`}>
    <Icone size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
    <div className="min-w-0 flex-1 wrap-anywhere [&_p]:mb-0">{children}</div>
  </div>;
}
