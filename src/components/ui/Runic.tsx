/** Ornamentos geométricos inspirados no cartão TAMAGO; desenhados só em CSS. */
export function RuneSeal({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span aria-hidden="true" className={`rune-seal ${compact ? 'rune-seal--compact' : ''} ${className}`}>
      <span className="rune-seal__ring" />
      <span className="rune-seal__inner" />
      <span className="rune-seal__crystal" />
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className={`rune-seal__mark rune-seal__mark--${i}`} />
      ))}
    </span>
  )
}

export function RunicDivider() {
  return (
    <div aria-hidden="true" className="runic-divider">
      <span className="runic-divider__line" />
      <span className="runic-star" />
      <RuneSeal compact />
      <span className="runic-star" />
      <span className="runic-divider__line" />
    </div>
  )
}

export function RunicSky({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`runic-sky ${className}`}>
      <span className="runic-star runic-sky__star--one" />
      <span className="runic-star runic-sky__star--two" />
      <span className="runic-star runic-sky__star--three" />
      <span className="runa runic-sky__rune--one" />
      <span className="runa runic-sky__rune--two" />
    </div>
  )
}

/** Céu mágico da abertura. Coordenadas fixas evitam diferenças na hidratação. */
export function HeroAtmosphere() {
  const stars = [
    [7, 16], [18, 9], [32, 19], [48, 8], [62, 15], [86, 9], [95, 29],
    [4, 54], [24, 77], [43, 86], [58, 68], [77, 84], [93, 73], [14, 91],
  ]
  return (
    <div aria-hidden="true" className="hero-atmosphere">
      <div className="hero-atmosphere__art" />
      <div className="hero-atmosphere__nebula hero-atmosphere__nebula--blue" />
      <div className="hero-atmosphere__nebula hero-atmosphere__nebula--violet" />
      <div className="hero-atmosphere__constellation" />
      {stars.map(([x, y], i) => (
        <span
          key={i}
          className={`runic-star hero-atmosphere__star ${i % 3 === 0 ? 'hero-atmosphere__star--bright' : ''}`}
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * -0.8}s` }}
        />
      ))}
      <span className="hero-atmosphere__crystal hero-atmosphere__crystal--one" />
      <span className="hero-atmosphere__crystal hero-atmosphere__crystal--two" />
      <span className="hero-atmosphere__crystal hero-atmosphere__crystal--three" />
      <div className="montanhas hero-atmosphere__mountains hero-atmosphere__mountains--far" />
      <div className="montanhas hero-atmosphere__mountains hero-atmosphere__mountains--near" />
      <div className="hero-atmosphere__fade" />
    </div>
  )
}
