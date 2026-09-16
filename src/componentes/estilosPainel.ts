/** Classes compartilhadas do painel; páginas compõem estes blocos em vez de repetir utilitários. */
export const estilos = {
  painel: 'mb-6 rounded border border-line bg-paper p-5 lg:p-7',
  tituloPainel: 'mb-6 mt-0 text-[22px] text-ink',
  formulario: '[&_input]:w-full [&_label]:grid [&_label]:gap-[7px] [&_label]:font-semibold [&_select]:w-full [&_textarea]:w-full [&_textarea]:min-h-[110px]',
  grade: 'grid grid-cols-1 gap-[22px] md:grid-cols-2',
  erro: 'm-0 text-[13px] text-error',
  dica: 'text-[13px] font-normal text-muted',
  rodape: 'my-7 flex flex-wrap items-center gap-3.5 max-[560px]:[&_.button]:w-full',
  barraFiltros: 'mb-6 flex flex-wrap items-end gap-3 max-[560px]:grid max-[560px]:grid-cols-1 [&_label]:grid [&_label]:gap-1.5',
  sucesso: 'rounded bg-[#eaf0e8] p-3.5 text-[#174d3b] dark:bg-white/10 dark:text-white',
  acoes: 'flex flex-wrap items-center gap-2.5 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:whitespace-nowrap [&_button]:whitespace-nowrap',
};
