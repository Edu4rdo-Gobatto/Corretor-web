// Ruína da mesma família visual da obra, mas com silhueta e movimentos próprios.
export default function CasaQuebrada({ animada, rotulo }: { animada: boolean; rotulo: string }) {
  const animacao = (classe: string) => animada ? classe : '';
  return (
    <svg role="img" aria-label={rotulo} viewBox="0 0 600 420" className={`cena-cartoon mx-auto h-auto w-full ${animada ? 'cena-ruina-animada' : ''}`}>
      <title>Casa quebrada</title>
      <path d="M61 239C33 150 111 64 222 66c62-43 179-24 213 37 103 4 140 126 87 199-92 112-407 74-461-63" fill="var(--color-soft)" />
      <g fill="var(--color-paper)" opacity=".8">
        <path d="M72 114c-3-14 18-21 27-11 10-23 40-15 41 4 23-5 30 15 20 21H76z" />
        <path d="M407 98c-5-15 18-26 31-14 14-19 40-9 41 9 23-2 25 15 18 21h-88z" />
      </g>
      <ellipse cx="300" cy="347" rx="237" ry="24" fill="var(--color-brand)" opacity=".12" />
      <path d="m82 331 231-58 214 62-233 56z" fill="var(--color-line)" />
      <path d="m173 304 132-26 143 30-142 35z" fill="var(--color-muted)" opacity=".25" />
      <g stroke="var(--color-brand)" strokeWidth="3.5" strokeLinejoin="round">
        <path d="m174 302 135-28 124 27-135 35z" fill="var(--color-paper)" />
        <path d="m174 302 0 14 124 35v-15zm124 34 135-35v14l-135 36z" fill="var(--color-line)" />
        <path d="m194 167 104 32v134l-104-30z" fill="var(--color-paper)" />
        <path d="m298 199 126-26-8 41-23 6-11 22-23-12-21 13-3 44 24-3 6 20 55-12v21l-122 20z" fill="var(--color-gold-soft)" />
      </g>
      <g fill="none" stroke="var(--color-muted)" strokeWidth="2" opacity=".5">
        <path d="m194 202 104 30m-104 7 104 30m-104 6 104 30m-74-94v34m39-23v33m35-23 107-24m-77-16v25m-5 102 66-15" />
      </g>
      <path d="m306 206 16 16-6 15 12 13m-120-64 10 11-8 11 13 12" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" />
      {/* Estrutura rompida: o telhado inclina e uma parte está faltando. */}
      <g stroke="var(--color-brand)" strokeWidth="4" strokeLinejoin="round">
        <path d="m179 170 62-82 86 98-16 25z" fill="var(--color-paper)" />
        <path d="m241 88 135 30 30 42-25 2-11 30-42-7-17 26z" fill="var(--color-gold)" />
        <path d="m389 167 43 42-26 8-37-25" fill="var(--color-gold)" />
        <path d="m258 114 126 24m-106 1 104 24" opacity=".35" fill="none" />
        <path d="m372 121 4-40 25 5-6 45" fill="var(--color-paper)" />
        <path d="m372 80 32 7-2 12-34-7z" fill="var(--color-gold)" />
        <circle cx="244" cy="157" r="13" fill="var(--color-soft)" />
      </g>
      <path d="m236 145 9 12-7 12m7-12 10-4" fill="none" stroke="var(--color-brand)" strokeWidth="2" />
      <path d="m218 239 41 12v70l-41-12z" fill="var(--color-navy-deep)" />
      <g className={animacao('ruina-porta')}>
        <path d="m218 239 34 2-6 66-32 2z" fill="var(--color-navy)" stroke="var(--color-gold)" strokeWidth="3" />
        <circle cx="240" cy="276" r="3.5" fill="var(--color-gold)" />
      </g>
      <path d="m362 206 38-8-3 20-18 10-17-5z" fill="var(--color-soft)" stroke="var(--color-brand)" strokeWidth="3" />
      <path d="m380 203-6 10 10 6m-11-2-8 5" fill="none" stroke="var(--color-brand)" strokeWidth="2" />
      <g fill="var(--color-gold)" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinejoin="round">
        <path d="m141 310 31-9 17 12-31 9z" /><path d="m141 310v11l17 11v-10zm17 12 31-9v10l-31 9z" />
        <path d="m384 328 28-6 17 10-28 8z" /><path d="m384 328v11l17 9v-8zm17 12 28-8v11l-28 8z" />
        <path d="m359 309 23-7 15 9-23 7z" />
      </g>
      <path d="m431 290 28 8-14 22-29-9z" fill="var(--color-paper)" stroke="var(--color-brand)" strokeWidth="3" />
      <g className={animacao('ruina-placa')}>
        <path d="m463 268-9 64m-20-79-8 65" stroke="var(--color-brand)" strokeWidth="6" strokeLinecap="round" />
        <g transform="rotate(12 447 260)">
          <rect x="406" y="228" width="90" height="57" rx="7" fill="var(--color-navy)" stroke="var(--color-gold)" strokeWidth="3" />
          <text x="451" y="269" textAnchor="middle" fill="var(--color-cena-legenda)" fontSize="35" fontWeight="700" fontFamily="var(--font-sans)">404</text>
          <circle cx="413" cy="236" r="2" fill="var(--color-gold)" /><circle cx="489" cy="236" r="2" fill="var(--color-gold)" />
        </g>
      </g>
      <g stroke="var(--color-muted)" strokeWidth="2.5" strokeLinecap="round" fill="none" aria-hidden="true">
        <path d="m94 327-5-19m5 19 11-15m-11 15-14-7m379 32 7-18m-7 18-8-12m52-30 5-16m-5 16 11-5" />
      </g>
      <g fill="var(--color-muted)" opacity=".5" aria-hidden="true">
        <circle cx="298" cy="299" r="6" className={animacao('animate-poeira')} />
        <circle cx="379" cy="285" r="4" className={animacao('animate-poeira')} style={{ animationDelay: '1.2s' }} />
      </g>
      <g className={animacao('animate-feno')} aria-hidden="true">
        <ellipse cx="82" cy="356" rx="32" ry="7" fill="var(--color-brand)" opacity=".16" />
        <g className={animacao('animate-feno-girar')} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle cx="82" cy="327" r="27" fill="var(--color-gold-soft)" stroke="var(--color-gold)" strokeWidth="3" />
          <g fill="none" stroke="var(--color-muted)" strokeWidth="2" opacity=".8">
            <ellipse cx="82" cy="327" rx="25" ry="11" transform="rotate(25 82 327)" />
            <ellipse cx="82" cy="327" rx="12" ry="26" transform="rotate(-20 82 327)" />
            <path d="M60 315q25 6 41 30m-43-11q30-28 47-14M65 347q-3-31 27-44m-31 23 42 6" />
          </g>
          <path d="m56 314-6-3m27-12 1-6m30 26 7-1m-25 33 3 6m-34-14-6 3" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
