// A casa completa é o estado base: reduced-motion e a prop animada=false preservam a ilustração.
export default function CenaObra({ animada, rotulo }: { animada: boolean; rotulo: string }) {
  return (
    <svg role="img" aria-label={rotulo} viewBox="0 0 600 370" className={`cena-cartoon mx-auto h-auto w-full ${animada ? 'cena-obra-animada' : ''}`}>
      <title>Casa em construção</title>
      <ellipse cx="310" cy="185" rx="238" ry="155" fill="var(--color-soft)" />
      <g fill="var(--color-paper)" opacity=".8">
        <path d="M70 96c-4-14 16-23 24-12 7-22 39-19 43 3 21-5 30 13 22 20H76z" />
        <path d="M428 74c-2-13 14-19 23-10 12-20 35-12 36 4 18-1 25 13 16 18h-73z" />
      </g>
      <ellipse cx="301" cy="318" rx="248" ry="23" fill="var(--color-brand)" opacity=".10" />
      <path d="M80 298l244-50 197 48-242 50z" fill="var(--color-line)" />
      <path d="M169 282l166-31 115 27-168 36z" fill="var(--color-muted)" opacity=".3" />
      <path d="M176 271l155-28 116 27-159 33z" fill="var(--color-paper)" stroke="var(--color-brand)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M176 271v13l112 32v-13zm112 32 159-33v13l-159 33z" fill="var(--color-line)" stroke="var(--color-brand)" strokeWidth="3" strokeLinejoin="round" />
      <g className="obra-paredes">
        <path d="M288 162l144-30v133l-144 31z" fill="var(--color-gold-soft)" stroke="var(--color-brand)" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M190 140l98 22v134l-98-28z" fill="var(--color-paper)" stroke="var(--color-brand)" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="m190 172 98 24m-98 9 98 25m-98 8 98 26m0-68 144-31m-144 65 144-31m-144 65 144-31" fill="none" stroke="var(--color-muted)" strokeWidth="2" opacity=".35" />
        <path d="m219 179 0 33m35-25v34m68-32v34m53-45v34m-36 24v32m60-45v33" stroke="var(--color-muted)" strokeWidth="2" opacity=".35" />
        <path d="m212 207 42 11v68l-42-12z" fill="var(--color-navy)" stroke="var(--color-brand)" strokeWidth="3" />
        <circle cx="244" cy="250" r="3.5" fill="var(--color-gold)" />
        <path d="m315 183 40-8v39l-40 8zm58-12 39-8v39l-39 8z" fill="var(--color-soft)" stroke="var(--color-brand)" strokeWidth="3" />
        <path d="m335 179v39m-20-16 40-8m37-27v39m-19-15 39-8" stroke="var(--color-brand)" strokeWidth="2" />
      </g>
      <g className="obra-telhado">
        <path d="m172 144 57-78 132 21 87 51-155 37z" fill="var(--color-gold)" stroke="var(--color-brand)" strokeWidth="4" strokeLinejoin="round" />
        <path d="m172 144 57-78 64 109z" fill="var(--color-paper)" stroke="var(--color-brand)" strokeWidth="4" strokeLinejoin="round" />
        <path d="m229 66 64 109 155-37-87-51z" fill="var(--color-gold)" stroke="var(--color-brand)" strokeWidth="4" strokeLinejoin="round" />
        <path d="m244 90 137 20m-123 3 147 19m-121 5 146-21m-161-35 64 72m-34-65 62 55" stroke="var(--color-navy)" strokeWidth="2" opacity=".28" />
        <path d="m367 84 0-29 25-5v46" fill="var(--color-paper)" stroke="var(--color-brand)" strokeWidth="3" />
        <path d="m363 55 32-7 4 10-34 7z" fill="var(--color-gold)" stroke="var(--color-brand)" strokeWidth="3" />
        <circle cx="231" cy="126" r="12" fill="var(--color-soft)" stroke="var(--color-brand)" strokeWidth="3" />
      </g>
      <g stroke="var(--color-brand)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M115 176v109m41-100v111m-49-71 57 12m-49-54 41 104" fill="none" />
        <path d="m104 176 58 12 0 10-58-12z" fill="var(--color-gold)" />
      </g>
      <g fill="var(--color-gold)" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinejoin="round">
        <path d="m458 270 31-7 22 7-31 8z" /><path d="m458 270v13l22 7 0-12zm22 8 31-8v13l-31 7z" />
        <path d="m464 257 26-5 18 6-26 6z" /><path d="m464 257v11l18 6v-10zm18 7 26-6v11l-26 5z" />
      </g>
      <g className="obra-operario">
        <ellipse cx="130" cy="310" rx="36" ry="8" fill="var(--color-brand)" opacity=".16" />
        <path d="m116 268-5 34m27-34 8 34" stroke="var(--color-navy)" strokeWidth="13" strokeLinecap="round" />
        <path d="m104 302h16m18 1h17" stroke="var(--color-brand)" strokeWidth="10" strokeLinecap="round" />
        <path d="M110 227q19-12 35 1l1 44q-19 9-39-1z" fill="var(--color-gold)" stroke="var(--color-brand)" strokeWidth="3" />
        <path d="m119 225-2 42m20-41 2 42" stroke="var(--color-paper)" strokeWidth="4" />
        <path d="m111 234-12 24 10 8" fill="none" stroke="var(--color-brand)" strokeWidth="10" strokeLinecap="round" />
        <g className="obra-braco">
          <path d="m144 237 17 5 10-18" fill="none" stroke="var(--color-brand)" strokeWidth="10" strokeLinecap="round" />
          <path d="m169 229 8-29" stroke="var(--color-gold)" strokeWidth="7" strokeLinecap="round" />
          <path d="m166 198 22 6" stroke="var(--color-brand)" strokeWidth="11" strokeLinecap="round" />
        </g>
        <circle cx="128" cy="207" r="20" fill="var(--color-gold-soft)" stroke="var(--color-brand)" strokeWidth="3" />
        <path d="M105 202q1-30 26-26 19 3 20 26z" fill="var(--color-gold)" stroke="var(--color-brand)" strokeWidth="3" />
        <path d="M102 202h54m-27-24v17" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="137" cy="210" r="2.5" fill="var(--color-brand)" />
        <path d="m130 219q6 4 10-1" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g className="obra-poeira" fill="var(--color-muted)" aria-hidden="true">
        <circle cx="282" cy="289" r="7" className="animate-poeira" /><circle cx="414" cy="261" r="5" className="animate-poeira" style={{ animationDelay: '.4s' }} />
      </g>
      <g className="obra-pronto">
        <path d="M362 270v52m91-64v47" stroke="var(--color-brand)" strokeWidth="5" strokeLinecap="round" />
        <g transform="rotate(-6 410 284)">
          <rect x="344" y="261" width="126" height="44" rx="8" fill="var(--color-navy)" stroke="var(--color-gold)" strokeWidth="3" />
          <text x="407" y="290" textAnchor="middle" fill="var(--color-cena-legenda)" fontSize="21" fontWeight="700" fontFamily="var(--font-sans)">PRONTO!</text>
        </g>
      </g>
      <g className="obra-brilho" stroke="var(--color-gold)" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M452 94v18m-9-9h18M176 93v12m-6-6h12M483 198v14m-7-7h14" />
      </g>
    </svg>
  );
}
