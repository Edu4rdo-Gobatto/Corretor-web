// Cena da casa em construção em SVG puro, compartilhada entre a seção fixa do
// /devs e o overlay de abertura. Componente presentacional: sem window, sem áudio,
// seguro para SSR. A animação liga/desliga via prop `animada`.
export default function CenaObra({ animada, rotulo }: { animada: boolean; rotulo: string }) {
  const animacao = (classe: string) => (animada ? classe : '');
  return (
    <svg role="img" aria-label={rotulo} viewBox="0 0 520 320" className="mx-auto h-auto w-full max-w-[520px]">
      <title>Casa em construção</title>
      {/* chão */}
      <rect x="0" y="284" width="520" height="36" fill="var(--color-line)" opacity="0.5" />
      <rect x="0" y="282" width="520" height="4" fill="var(--color-gold)" />
      {/* alicerce */}
      <rect x="150" y="262" width="230" height="22" rx="3" fill="var(--color-muted)" opacity="0.55" />
      {/* paredes pela metade */}
      <rect x="160" y="190" width="210" height="74" fill="var(--color-paper)" stroke="var(--color-brand)" strokeWidth="3" />
      {[208, 226, 244].map((y) => (
        <line key={y} x1="160" y1={y} x2="370" y2={y} stroke="var(--color-line)" strokeWidth="2" />
      ))}
      {[205, 250, 295, 340].map((x) => (
        <line key={x} x1={x} y1="190" x2={x} y2="264" stroke="var(--color-line)" strokeWidth="2" />
      ))}
      {/* segunda fiada subindo só de um lado (parede inacabada) */}
      <rect x="160" y="162" width="110" height="28" fill="var(--color-paper)" stroke="var(--color-brand)" strokeWidth="3" />
      <line x1="160" y1="176" x2="270" y2="176" stroke="var(--color-line)" strokeWidth="2" />
      <line x1="215" y1="162" x2="215" y2="190" stroke="var(--color-line)" strokeWidth="2" />
      {/* vigas do telhado */}
      <line x1="150" y1="190" x2="265" y2="110" stroke="var(--color-gold)" strokeWidth="7" strokeLinecap="round" />
      <line x1="380" y1="190" x2="265" y2="110" stroke="var(--color-gold)" strokeWidth="7" strokeLinecap="round" />
      <line x1="265" y1="110" x2="265" y2="150" stroke="var(--color-gold)" strokeWidth="5" strokeLinecap="round" />
      {/* andaime à esquerda */}
      <g stroke="var(--color-brand)" strokeWidth="4" strokeLinecap="round" opacity="0.85">
        <line x1="60" y1="120" x2="60" y2="284" />
        <line x1="120" y1="120" x2="120" y2="284" />
        <line x1="52" y1="160" x2="128" y2="160" />
        <line x1="52" y1="220" x2="128" y2="220" />
        <line x1="60" y1="160" x2="120" y2="220" strokeWidth="3" />
      </g>
      {/* pilha de tijolos */}
      <g fill="var(--color-gold)" opacity="0.9">
        <rect x="400" y="252" width="34" height="14" rx="2" />
        <rect x="418" y="238" width="34" height="14" rx="2" />
        <rect x="400" y="224" width="34" height="14" rx="2" />
      </g>
      {/* martelo batendo na parede */}
      <g className={animacao('animate-martelo')} style={{ transformOrigin: '330px 150px' }}>
        <line x1="330" y1="150" x2="300" y2="196" stroke="#8a5a2b" strokeWidth="8" strokeLinecap="round" />
        <rect x="312" y="132" width="36" height="20" rx="4" fill="var(--color-brand)" transform="rotate(24 330 142)" />
      </g>
      {/* furadeira com faíscas */}
      <g className={animacao('animate-furadeira')}>
        <rect x="196" y="236" width="44" height="20" rx="5" fill="var(--color-navy)" />
        <rect x="236" y="241" width="26" height="8" fill="var(--color-muted)" />
      </g>
      <g className={animacao('animate-faisca')} stroke="var(--color-gold)" strokeWidth="3" strokeLinecap="round">
        <line x1="268" y1="236" x2="278" y2="228" />
        <line x1="270" y1="248" x2="282" y2="248" />
        <line x1="268" y1="258" x2="278" y2="266" />
      </g>
      {/* poeira subindo */}
      <g fill="var(--color-muted)" aria-hidden="true">
        <circle cx="250" cy="200" r="7" opacity="0.6" className={animacao('animate-poeira')} />
        <circle cx="320" cy="180" r="5" opacity="0.5" className={animacao('animate-poeira')} style={{ animationDelay: '0.9s' }} />
        <circle cx="200" cy="170" r="6" opacity="0.5" className={animacao('animate-poeira')} style={{ animationDelay: '1.7s' }} />
      </g>
      {/* placa "em obras" */}
      <g>
        <rect x="386" y="120" width="96" height="58" rx="6" fill="var(--color-navy)" />
        <rect x="386" y="120" width="96" height="12" rx="6" fill="var(--color-gold)" />
        <text x="434" y="152" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#fff">EM OBRAS</text>
        <line x1="434" y1="178" x2="434" y2="210" stroke="var(--color-brand)" strokeWidth="5" />
      </g>
    </svg>
  );
}
