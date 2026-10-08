/**
 * Logo oficial branca e azul fornecida pelo cliente, preservando sua transparência.
 */
type Peca = 'palavra' | 'ovo' | 'lockup'

// Proporções dos recortes (largura / altura), para reservar o espaço e não gerar layout shift
const PROPORCAO: Record<Peca, number> = { palavra: 3, ovo: 560 / 680, lockup: 920 / 989 }

function ArteDaMarca({ peca, alt, larguraCss, className = '', prioridade = false }: {
  peca: Peca
  alt: string
  larguraCss: string
  className?: string
  prioridade?: boolean
}) {
  const base = `/img/marca/${peca === 'palavra' ? 'nova' : peca}`
  const srcset = (ext: string) => `${base}-240.${ext} 240w, ${base}-480.${ext} 480w, ${base}-960.${ext} 960w`
  return (
    <picture className={`block ${className}`}>
      <source type="image/avif" srcSet={srcset('avif')} sizes={larguraCss} />
      <source type="image/webp" srcSet={srcset('webp')} sizes={larguraCss} />
      <img
        src={`${base}-480.webp`}
        alt={alt}
        width={Math.round(480)}
        height={Math.round(480 / PROPORCAO[peca])}
        loading={prioridade ? 'eager' : 'lazy'}
        decoding="async"
        className="h-auto w-full"
      />
    </picture>
  )
}

/** Logo branca e azul: header e rodapé, com suporte índigo para contraste. */
export function Marca({ tamanho = 'md' }: { tamanho?: 'md' | 'lg' }) {
  const largura = tamanho === 'lg' ? '220px' : '180px'
  return <ArteDaMarca peca="palavra" alt="" larguraCss={largura} prioridade className={`rounded-xl bg-[#0b0c1f] ${tamanho === 'lg' ? 'w-[220px]' : 'w-[120px] md:w-[180px]'}`} />
}

/** O ovo com os dois dragões: emblema da marca. */
export function Emblema({ className = 'w-40' }: { className?: string }) {
  return <ArteDaMarca peca="ovo" alt="" larguraCss="200px" className={className} />
}

/** Logo do ovo preservada no CTA final. */
export function Lockup({ className = 'w-64' }: { className?: string }) {
  return (
    <ArteDaMarca
      peca="lockup"
      alt="TAMAGO, Figures & 3D Studio: pequenas ideias, grandes mundos. Logo com dois filhotes de dragão, um azul e um preto, dentro de um ovo de cristal."
      larguraCss="(min-width: 768px) 320px, 240px"
      className={className}
    />
  )
}
