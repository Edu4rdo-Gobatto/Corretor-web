/** Classes compartilhadas do painel; páginas compõem estes blocos em vez de repetir utilitários. */
export const estilos = {
  // `@container`: as grades internas seguem a largura do painel/modal, não a da janela.
  painel: '@container superficie-painel mb-4',
  tituloPainel: 'mb-4 mt-0 text-[22px] text-ink',
  formulario: '@container [&_input:not([type=checkbox])]:w-full [&_label]:grid [&_label]:gap-[7px] [&_label]:font-semibold [&_select]:w-full [&_textarea]:w-full [&_textarea]:min-h-[110px]',
  // Duas colunas só com pelo menos 38rem de container (modal largo ou seção do painel); campo que ficaria sozinho usa col-span-full.
  grade: 'grid grid-cols-1 gap-4 @min-[38rem]:grid-cols-2',
  // Ações de formulário dentro do Dialogo: grudadas no fim da área rolável, sempre visíveis. O sticky respeita o padding
  // do corpo do modal (pb-8/pb-6), por isso o bottom negativo igual a ele deixa o rodapé rente à borda.
  rodapeDialogo: 'sticky -bottom-8 z-10 -mx-8 -mb-8 mt-7 max-[520px]:-bottom-6 flex flex-wrap items-center justify-end gap-3.5 border-t border-line bg-paper px-8 py-4 max-[520px]:-mx-[22px] max-[520px]:-mb-6 max-[520px]:px-[22px]',
  erro: 'campo-erro m-0',
  dica: 'campo-dica font-normal',
  rodape: 'my-7 flex flex-wrap items-center gap-3.5 max-[560px]:[&_.button]:w-full',
  barraFiltros: 'barra-filtros mb-4 flex flex-wrap items-end gap-4 @max-[35rem]/principal:grid @max-[35rem]/principal:grid-cols-1 [&_label]:grid [&_label]:gap-1.5',
  acoesFiltros: 'acoes-filtros ml-auto flex flex-wrap items-center justify-end gap-3',
  sucesso: 'rounded-md bg-sucesso-suave p-3.5 text-sucesso',
  acoes: 'flex flex-nowrap items-center gap-1 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:whitespace-nowrap [&_button]:whitespace-nowrap',
};
