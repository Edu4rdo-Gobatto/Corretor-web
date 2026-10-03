// A casa fica apagada durante toda a espera; somente o reparo tem movimento.
export default function CenaReparo({ animada, rotulo }: { animada: boolean; rotulo: string }) {
  return (
    <svg
      role="img"
      aria-label={rotulo}
      viewBox="0 0 600 400"
      className={`cena-cartoon cena-reparo mx-auto h-auto w-full ${animada ? 'cena-reparo-animada' : ''}`}
    >
      <title>{rotulo}</title>
      <path d="M63 239C35 151 103 70 213 64c87-38 179-15 224 46 107 14 133 132 83 205-80 80-400 74-457-76" fill="var(--color-soft)" />
      <g fill="var(--color-paper)" opacity=".75" aria-hidden="true">
        <path d="M68 108c-2-14 17-22 27-11 9-22 39-18 43 4 20-5 29 12 22 20H74z" />
        <path d="M444 82c-3-12 14-20 23-10 11-17 34-12 38 7 17-2 27 12 19 20h-78z" />
      </g>
      <ellipse cx="302" cy="342" rx="245" ry="24" fill="var(--color-brand)" opacity=".1" />
      <path d="m80 319 241-55 204 58-241 54z" fill="var(--color-line)" />
      <path d="m171 298 155-32 130 32-159 36z" fill="var(--color-muted)" opacity=".25" />
      <g stroke="var(--color-brand)" strokeWidth="3.5" strokeLinejoin="round">
        <path d="m174 281 153-29 122 29-154 33z" fill="var(--color-paper)" />
        <path d="m174 281v16l121 34v-17zm121 33 154-33v16l-154 34z" fill="var(--color-line)" />
        <path d="m189 145 106 25v136l-106-29z" fill="var(--color-paper)" />
        <path d="m295 170 137-29v136l-137 29z" fill="var(--color-gold-soft)" />
      </g>
      <g fill="none" stroke="var(--color-muted)" strokeWidth="2" opacity=".3" aria-hidden="true">
        <path d="m189 181 106 26m-106 9 106 27m-106 9 106 27m0-72 137-29m-137 65 137-29m-137 65 137-29" />
        <path d="m226 190v35m34-27v35m70-34v34m55-46v35m-35 23v35m52-46v35" />
      </g>
      {/* Janelas sem luz: a cena não promete uma recuperação antes da página. */}
      <g fill="var(--color-navy-deep)" stroke="var(--color-brand)" strokeWidth="3">
        <path d="m315 190 39-8v42l-39 8zm58-12 39-8v42l-39 8z" />
        <path d="m245 218 31 8v75l-31-9z" />
      </g>
      <g stroke="var(--color-gold)" strokeWidth="2" opacity=".65">
        <path d="m334 186v42m-19-17 39-8m38-29v42m-19-17 39-8" />
      </g>
      <circle cx="268" cy="267" r="3" fill="var(--color-gold)" />
      <path d="m241 297 40 11-1 8-42-11z" fill="var(--color-soft)" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinejoin="round" />
      <g stroke="var(--color-brand)" strokeWidth="4" strokeLinejoin="round">
        <path d="m172 150 61-82 131 24 85 56-152 35z" fill="var(--color-gold)" />
        <path d="m172 150 61-82 64 115z" fill="var(--color-paper)" />
        <path d="m233 68 64 115 152-35-85-56z" fill="var(--color-gold)" />
        <path d="m370 91 0-32 23-4v50" fill="var(--color-paper)" strokeWidth="3" />
        <path d="m366 60 31-7 4 10-33 7z" fill="var(--color-gold)" strokeWidth="3" />
        <circle cx="234" cy="130" r="12" fill="var(--color-navy-deep)" strokeWidth="3" />
      </g>
      <g fill="none" stroke="var(--color-navy)" strokeWidth="2" opacity=".28" aria-hidden="true">
        <path d="m248 94 136 22m-123 1 149 21m-117 20 137-29m-175-40 63 75m-30-67 61 54" />
      </g>
      {/* O quadro externo e o cabo pertencem à casa, não ao estado da rede. */}
      <path d="m204 227 0-45-9-7v-25" fill="none" stroke="var(--color-muted)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <g stroke="var(--color-brand)" strokeWidth="2.5" strokeLinejoin="round">
        <path d="m185 224 27 6v40l-27-7z" fill="var(--color-soft)" />
        <path d="m212 230 12-4v39l-12 5z" fill="var(--color-line)" />
        <path d="m187 226-15 4v35l15-3z" fill="var(--color-paper)" />
      </g>
      <path d="m194 240 9 2m-9 8 9 2" stroke="var(--color-navy)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="204" cy="261" r="3" fill="var(--color-muted)" />
      <circle className="reparo-indicador" cx="204" cy="261" r="3" fill="var(--color-gold)" />
      <g>
        <ellipse cx="130" cy="322" rx="37" ry="9" fill="var(--color-brand)" opacity=".16" />
        <path d="m119 276-8 37m27-37 10 37" stroke="var(--color-navy)" strokeWidth="13" strokeLinecap="round" />
        <path d="m102 314h19m18 0h19" stroke="var(--color-brand)" strokeWidth="10" strokeLinecap="round" />
        <path d="M111 234q20-12 37 3l-3 43q-20 8-39-2z" fill="var(--color-gold)" stroke="var(--color-brand)" strokeWidth="3" />
        <path d="m119 233-3 39m23-37-1 38" stroke="var(--color-paper)" strokeWidth="4" />
        <path d="m111 243-12 23 14 9" fill="none" stroke="var(--color-brand)" strokeWidth="10" strokeLinecap="round" />
        <g className="reparo-braco">
          <path d="m148 242 20 14 22-10" fill="none" stroke="var(--color-brand)" strokeWidth="10" strokeLinecap="round" />
          <path d="m189 246 12-4" stroke="var(--color-gold-soft)" strokeWidth="9" strokeLinecap="round" />
          <path d="m194 247 7-17" stroke="var(--color-gold)" strokeWidth="5" strokeLinecap="round" />
          <path d="m201 230 3-8" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="132" cy="214" r="20" fill="var(--color-gold-soft)" stroke="var(--color-brand)" strokeWidth="3" />
        <path d="M109 209q1-29 25-26 20 2 21 26z" fill="var(--color-gold)" stroke="var(--color-brand)" strokeWidth="3" />
        <path d="M105 209h54m-26-25v18" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" />
        <path d="m147 218 6 4-6 2" fill="var(--color-gold-soft)" stroke="var(--color-brand)" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="141" cy="215" r="2.5" fill="var(--color-brand)" />
        <path d="m134 227q6 3 10-1" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g stroke="var(--color-brand)" strokeWidth="2.5" strokeLinejoin="round" aria-hidden="true">
        <path d="m190 319 42-9 24 8-43 10z" fill="var(--color-gold)" />
        <path d="m190 319v17l23 9v-17zm23 9 43-10v17l-43 10z" fill="var(--color-navy)" />
        <path d="m205 316-1-9 17-4 1 10" fill="none" strokeWidth="4" />
        <path d="m230 327-5 6 7-2-4 7" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" />
        <path d="m267 322 13 2-2 17-10-2z" fill="var(--color-paper)" />
        <path d="m279 328q10-2 8 5-1 4-8 2" fill="none" />
        <path d="m265 322 17 3" stroke="var(--color-gold)" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g fill="none" stroke="var(--color-muted)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="m475 324-6-17m6 17 9-13m-9 13-12-5m-6-53 28-6m-18-3 19-4" />
      </g>
    </svg>
  );
}
