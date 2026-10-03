// Casa quebrada da página 404 em SVG puro: ruína divertida com parede faltando,
// telhado caído de um lado, porta torta e bola de feno atravessando a cena.
// Presentacional: sem window, sem áudio, seguro para SSR. A animação
// liga/desliga via prop `animada` (o `prefers-reduced-motion` global desliga o CSS).
export default function CasaQuebrada({ animada, rotulo }: { animada: boolean; rotulo: string }) {
  const animacao = (classe: string) => (animada ? classe : '');
  return (
    <svg role="img" aria-label={rotulo} viewBox="0 0 520 320" className="mx-auto h-auto w-full max-w-[520px]">
      <title>Casa quebrada</title>
      {/* chão */}
      <rect x="0" y="284" width="520" height="36" fill="var(--color-line)" opacity="0.5" />
      <rect x="0" y="282" width="520" height="4" fill="var(--color-gold)" />
      {/* alicerce */}
      <rect x="150" y="262" width="230" height="22" rx="3" fill="var(--color-muted)" opacity="0.55" />
      {/* parede esquerda inteira */}
      <rect x="150" y="190" width="110" height="74" fill="var(--color-paper)" stroke="var(--color-brand)" strokeWidth="3" />
      <line x1="150" y1="214" x2="260" y2="214" stroke="var(--color-line)" strokeWidth="2" />
      <line x1="150" y1="238" x2="260" y2="238" stroke="var(--color-line)" strokeWidth="2" />
      <line x1="185" y1="190" x2="185" y2="264" stroke="var(--color-line)" strokeWidth="2" />
      <line x1="222" y1="190" x2="222" y2="264" stroke="var(--color-line)" strokeWidth="2" />
      {/* parede direita com buraco (faixa do meio faltando) */}
      <rect x="260" y="190" width="120" height="26" fill="var(--color-paper)" stroke="var(--color-brand)" strokeWidth="3" />
      <rect x="260" y="242" width="120" height="22" fill="var(--color-paper)" stroke="var(--color-brand)" strokeWidth="3" />
      {/* borda irregular do buraco */}
      <polyline
        points="260,216 278,222 296,215 314,223 332,216 350,222 366,216 380,222"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <polyline
        points="260,242 280,236 300,243 322,235 344,243 364,236 380,242"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* tijolos à mostra dentro do buraco */}
      <g fill="var(--color-gold)" opacity="0.9">
        <rect x="282" y="222" width="22" height="10" rx="2" />
        <rect x="308" y="226" width="22" height="10" rx="2" />
        <rect x="334" y="222" width="22" height="10" rx="2" />
      </g>
      {/* viga esquerda do telhado (de pé) */}
      <line x1="140" y1="190" x2="265" y2="110" stroke="var(--color-gold)" strokeWidth="7" strokeLinecap="round" />
      {/* viga direita caída (deslocada para baixo e torta) */}
      <line x1="265" y1="110" x2="352" y2="206" stroke="var(--color-gold)" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
      <line x1="300" y1="150" x2="282" y2="188" stroke="var(--color-gold)" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      {/* telha caída no chão */}
      <g fill="var(--color-gold)" opacity="0.9">
        <rect x="96" y="268" width="34" height="14" rx="2" transform="rotate(-14 113 275)" />
        <rect x="118" y="256" width="34" height="14" rx="2" transform="rotate(9 135 263)" />
      </g>
      {/* pedaço de parede caído */}
      <rect x="384" y="268" width="66" height="16" rx="3" fill="var(--color-paper)" stroke="var(--color-brand)" strokeWidth="3" transform="rotate(-12 417 276)" />
      {/* porta torta */}
      <g style={{ transformOrigin: '212px 242px' }} transform="rotate(11 212 242)">
        <rect x="190" y="220" width="44" height="44" fill="var(--color-navy)" opacity="0.9" />
        <circle cx="226" cy="243" r="3" fill="var(--color-gold)" />
      </g>
      {/* janela com vidro quebrado */}
      <g>
        <rect x="292" y="192" width="46" height="20" fill="none" stroke="var(--color-brand)" strokeWidth="3" />
        <line x1="292" y1="192" x2="338" y2="212" stroke="var(--color-brand)" strokeWidth="2" />
        <line x1="338" y1="192" x2="292" y2="212" stroke="var(--color-brand)" strokeWidth="2" />
      </g>
      {/* poeira da ruína */}
      <g fill="var(--color-muted)" aria-hidden="true">
        <circle cx="250" cy="200" r="7" opacity="0.6" className={animacao('animate-poeira')} />
        <circle cx="330" cy="190" r="5" opacity="0.5" className={animacao('animate-poeira')} style={{ animationDelay: '0.9s' }} />
        <circle cx="180" cy="180" r="6" opacity="0.5" className={animacao('animate-poeira')} style={{ animationDelay: '1.7s' }} />
      </g>
      {/* bola de feno atravessando a frente da cena */}
      <g className={animacao('animate-feno')} aria-hidden="true">
        <g
          className={animacao('animate-feno-girar')}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle cx="260" cy="256" r="24" fill="none" stroke="var(--color-muted)" strokeWidth="2.5" />
          <ellipse cx="260" cy="256" rx="24" ry="10" fill="none" stroke="var(--color-muted)" strokeWidth="2" />
          <ellipse cx="260" cy="256" rx="10" ry="24" fill="none" stroke="var(--color-muted)" strokeWidth="2" />
          <path d="M240 244 Q260 256 280 268" fill="none" stroke="var(--color-muted)" strokeWidth="2" />
          <path d="M240 268 Q260 256 280 244" fill="none" stroke="var(--color-muted)" strokeWidth="2" />
        </g>
      </g>
      {/* placa 404 caída */}
      <g transform="rotate(-14 434 150)">
        <rect x="386" y="120" width="96" height="58" rx="6" fill="var(--color-navy)" />
        <rect x="386" y="120" width="96" height="12" rx="6" fill="var(--color-gold)" />
        <text x="434" y="156" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#fff">404</text>
        <line x1="434" y1="178" x2="434" y2="210" stroke="var(--color-brand)" strokeWidth="5" />
      </g>
    </svg>
  );
}
