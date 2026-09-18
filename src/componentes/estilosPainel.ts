/** Classes compartilhadas do painel; páginas compõem estes blocos em vez de repetir utilitários. */
export const estilos = {
  // `@container`: as grades internas seguem a largura do painel/modal, não a da janela.
  painel: '@container mb-6 rounded border border-line bg-paper p-5 lg:p-7',
  tituloPainel: 'mb-6 mt-0 text-[22px] text-ink',
  formulario: '@container [&_input]:w-full [&_label]:grid [&_label]:gap-[7px] [&_label]:font-semibold [&_select]:w-full [&_textarea]:w-full [&_textarea]:min-h-[110px]',
  // Duas colunas só com pelo menos 38rem de container (modal largo ou seção do painel); campo que ficaria sozinho usa col-span-full.
  grade: 'grid grid-cols-1 gap-[22px] @min-[38rem]:grid-cols-2',
  // Ações de formulário dentro do Dialogo: grudadas no fim da área rolável, sempre visíveis. O sticky respeita o padding
  // do corpo do modal (pb-8/pb-6), por isso o bottom negativo igual a ele deixa o rodapé rente à borda.
  rodapeDialogo: 'sticky -bottom-8 z-10 -mx-8 -mb-8 mt-7 max-[520px]:-bottom-6 flex flex-wrap items-center gap-3.5 border-t border-line bg-paper px-8 py-4 max-[520px]:-mx-[22px] max-[520px]:-mb-6 max-[520px]:px-[22px] max-[560px]:[&_.button]:w-full',
  erro: 'm-0 text-[13px] text-error',
  dica: 'text-[13px] font-normal text-muted',
  rodape: 'my-7 flex flex-wrap items-center gap-3.5 max-[560px]:[&_.button]:w-full',
  barraFiltros: 'mb-6 flex flex-wrap items-end gap-3 max-[560px]:grid max-[560px]:grid-cols-1 [&_label]:grid [&_label]:gap-1.5',
  sucesso: 'rounded bg-[#eaf0e8] p-3.5 text-[#174d3b] dark:bg-white/10 dark:text-white',
  acoes: 'flex flex-wrap items-center gap-2.5 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:whitespace-nowrap [&_button]:whitespace-nowrap',
};
