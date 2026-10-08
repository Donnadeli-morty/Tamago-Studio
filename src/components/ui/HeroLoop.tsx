import { useEffect, useRef, useState } from 'react'
import { useMenosMovimento } from '../../lib/motion'
import type { Site } from '../../lib/schema'
import { Picture } from './Picture'

type VideoMedia = Extract<Site['hero']['media'], { type: 'video' }>

/** Loop solicitado para o portal; pausa fora da tela e mantém a imagem de reserva. */
export function HeroLoop({ media, sizes }: { media: VideoMedia; sizes: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const menosMovimento = useMenosMovimento()
  const [pausado, setPausado] = useState(false)
  const [pronto, setPronto] = useState(false)
  const [falhou, setFalhou] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || menosMovimento || falhou) return
    let visivel = false
    const atualizar = () => {
      if (visivel && !document.hidden && !pausado) void video.play().catch(() => {})
      else video.pause()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visivel = entry.isIntersecting
      atualizar()
    }, { threshold: 0.1 })
    observer.observe(video)
    document.addEventListener('visibilitychange', atualizar)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', atualizar)
      video.pause()
    }
  }, [menosMovimento, pausado, falhou])

  return (
    <div className="relative size-full overflow-hidden">
      <Picture image={media.poster} sizes={sizes} priority ratio="auto" className="absolute inset-0 h-full" />
      {!menosMovimento && !falhou && (
        <>
          <video
            ref={videoRef}
            muted
            playsInline
            loop
            preload="metadata"
            aria-hidden="true"
            className={`absolute inset-0 size-full object-cover ${pronto ? 'opacity-100' : 'opacity-0'}`}
            onPlaying={() => setPronto(true)}
            onError={() => setFalhou(true)}
          >
            {media.sources.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
          </video>
          <button
            type="button"
            onClick={() => setPausado((p) => !p)}
            aria-label={pausado ? 'Retomar animação do dragão' : 'Pausar animação do dragão'}
            className="absolute bottom-4 left-1/2 z-10 min-h-11 -translate-x-1/2 rounded-full border border-lilas/30 bg-fundo/85 px-3 text-xs text-texto backdrop-blur-sm hover:border-acento focus-visible:outline-2 focus-visible:outline-acento"
          >
            {pausado ? 'Reproduzir' : 'Pausar'}
          </button>
        </>
      )}
    </div>
  )
}
