import { useEffect, useRef, useState } from 'react'
import { site } from '../../lib/data'
import type { Imagem } from '../../lib/schema'
import { Icon } from './Icon'

/** Larguras geradas por `pnpm imagens` (scripts/imagens.mjs). */
const LARGURAS = [480, 800, 1200] as const

const srcset = (base: string, ext: 'avif' | 'webp') => LARGURAS.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ')

type Props = {
  image: Imagem
  /** Atributo sizes do srcset: quanto da tela a imagem ocupa. */
  sizes: string
  /** Imagem do LCP: sem lazy, fetchpriority alta (spec §6.1). */
  priority?: boolean
  className?: string
  imgClassName?: string
  /** Proporção da caixa; padrão = a da própria imagem (zero CLS). */
  ratio?: string
}

export function Picture({ image, sizes, priority = false, className = '', imgClassName = '', ratio }: Props) {
  const [estado, setEstado] = useState<'carregando' | 'pronta' | 'erro'>('carregando')
  const ref = useRef<HTMLImageElement>(null)

  // Imagem que veio do cache pode terminar antes do React ligar o onLoad
  useEffect(() => {
    const img = ref.current
    if (img?.complete && img.naturalWidth > 0) setEstado('pronta')
  }, [])

  return (
    <div
      className={`relative overflow-hidden ${estado === 'carregando' ? 'skeleton' : 'bg-superficie'} ${className}`}
      style={{ aspectRatio: ratio ?? `${image.w} / ${image.h}` }}
    >
      {estado === 'erro' ? (
        <div role="img" aria-label={image.alt} className="absolute inset-0 grid place-content-center justify-items-center gap-2 p-4 text-center text-xs text-texto-suave">
          <Icon nome="imagem" className="size-6" />
          <span>{site.ui.imageError}</span>
        </div>
      ) : (
        <picture>
          <source type="image/avif" srcSet={srcset(image.src, 'avif')} sizes={sizes} />
          <source type="image/webp" srcSet={srcset(image.src, 'webp')} sizes={sizes} />
          <img
            ref={ref}
            src={`${image.src}-800.webp`}
            alt={image.alt}
            width={image.w}
            height={image.h}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={() => setEstado('pronta')}
            onError={() => setEstado('erro')}
            draggable={false}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
              // Imagem do LCP não faz fade: pinta assim que chega
              estado === 'pronta' || priority ? 'opacity-100' : 'opacity-0'
            } ${imgClassName}`}
          />
        </picture>
      )}
      {image.src.startsWith('/img/geradas/') && (
        <span className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-md bg-fundo/85 px-2 py-1 text-[0.6rem] leading-tight text-texto-suave">
          Imagem ilustrativa · IA
        </span>
      )}
    </div>
  )
}
