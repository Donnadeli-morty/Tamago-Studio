import { useEffect, useRef, useState } from 'react'
import { site } from '../../lib/data'
import { useMenosMovimento } from '../../lib/motion'

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src: string
        alt: string
        poster?: string
        'camera-controls'?: boolean | ''
        'auto-rotate'?: boolean | ''
        'touch-action'?: string
        'shadow-intensity'?: string
        exposure?: string
        ar?: boolean | ''
        'ar-modes'?: string
        loading?: 'auto' | 'lazy' | 'eager'
        'interaction-prompt'?: string
      }
    }
  }
}

type Props = { src: string; alt: string; ativo: boolean }

/**
 * Visualizador 3D (spec §5 e §6.1): o pacote <model-viewer> (three.js) só é
 * baixado quando o slide 3D fica ativo. Peças sem .glb nunca pagam esse custo.
 */
export function Model3D({ src, alt, ativo }: Props) {
  const [pronto, setPronto] = useState(false)
  const iniciou = useRef(false)
  const menosMovimento = useMenosMovimento()

  useEffect(() => {
    if (!ativo || iniciou.current) return
    iniciou.current = true
    import('@google/model-viewer').then(() => setPronto(true))
  }, [ativo])

  return (
    <div className="relative size-full bg-[radial-gradient(circle_at_50%_40%,var(--color-superficie-2),var(--color-fundo))]">
      {pronto ? (
        <model-viewer
          src={src}
          alt={alt}
          camera-controls=""
          touch-action="pan-y"
          shadow-intensity="1"
          exposure="1.05"
          ar=""
          ar-modes="webxr scene-viewer quick-look"
          interaction-prompt="auto"
          {...(!menosMovimento && { 'auto-rotate': '' })}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
        />
      ) : (
        <div className="skeleton grid size-full place-items-center text-sm text-texto-suave" role="status">
          {site.ui.loading3d}
        </div>
      )}
    </div>
  )
}
