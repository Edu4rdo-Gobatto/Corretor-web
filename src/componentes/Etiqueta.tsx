import type { ReactNode } from 'react';

const tons = {
  neutro: 'bg-[#eaf0e8] text-[#174d3b] dark:bg-white/10 dark:text-white',
  atencao: 'bg-gold-soft text-[#5c4410] dark:bg-gold/30 dark:text-white',
  alerta: 'bg-[#f6e3e2] text-error dark:bg-error/30 dark:text-white',
};

/** Marcador curto de situação (status, origem, destaque). */
export default function Etiqueta({ tom = 'neutro', children }: { tom?: keyof typeof tons; children: ReactNode }) {
  return <span className={`inline-block rounded px-2.5 py-1 text-[13px] ${tons[tom]}`}>{children}</span>;
}
