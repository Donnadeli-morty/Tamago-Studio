import { lazy, Suspense, useRef, useState, type PointerEvent } from 'react'
import { site } from '../../lib/data'
import type { Imagem } from '../../lib/schema'
import { Icon } from './Icon'
import { Picture } from './Picture'

const Model3D = lazy(() => import('./Model3D').then((m) => ({ default: m.Model3D })))

type Props = {
  images: Imagem[]
  /** .glb opcional: vira o último slide ("Girar em 3D"). */
  model3d?: string
  nome: string
}

/**
 * Carrossel por scroll-snap: swipe nativo no celular, setas e teclado no desktop.
 * Sem autoplay (spec §7). Toque/clique na foto alterna o zoom 2x.
 */
export function ImageCarousel({ images, model3d, nome }: Props) {
  const trilho = useRef<HTMLDivElement>(null)
  const [atual, setAtual] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  // Ponto onde o toque começou: se o dedo andou, foi swipe, não toque de zoom
  const inicio = useRef({ x: 0, y: 0 })
  const total = images.length + (model3d ? 1 : 0)
  const indice3d = model3d ? images.length : -1

  const irPara = (i: number) => {
    const el = trilho.current
    if (!el) return
    const alvo = Math.max(0, Math.min(total - 1, i))
    el.scrollTo({ left: alvo * el.clientWidth, behavior: 'smooth' })
  }

  const aoRolar = () => {
    const el = trilho.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== atual) {
      setAtual(i)
      setZoom(null)
    }
  }

  const alternarZoom = (e: PointerEvent<HTMLButtonElement>) => {
    if (Math.hypot(e.clientX - inicio.current.x, e.clientY - inicio.current.y) > 8) return
    if (zoom) return setZoom(null)
    const r = e.currentTarget.getBoundingClientRect()
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  // Com zoom ativo, o ponto ampliado acompanha o ponteiro
  const moverZoom = (e: PointerEvent<HTMLButtonElement>) => {
    if (!zoom || e.pointerType === 'touch') return
    const r = e.currentTarget.getBoundingClientRect()
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label={`Fotos de ${nome}`}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') irPara(atual + 1)
        if (e.key === 'ArrowLeft') irPara(atual - 1)
      }}
    >
      <div
        ref={trilho}
        onScroll={aoRolar}
        data-lenis-prevent
        className={`sem-scrollbar flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto overscroll-x-contain bg-superficie ${
          zoom ? 'overflow-x-hidden' : ''
        }`}
      >
        {images.map((img, i) => (
          <div
            key={img.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${total}`}
            aria-hidden={i !== atual}
            className="relative w-full shrink-0 snap-center"
          >
            <button
              type="button"
              tabIndex={i === atual ? 0 : -1}
              aria-label={zoom && i === atual ? 'Reduzir foto' : 'Ampliar foto'}
              onPointerDown={(e) => (inicio.current = { x: e.clientX, y: e.clientY })}
              onPointerUp={alternarZoom}
              onPointerMove={moverZoom}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setZoom(zoom ? null : { x: 50, y: 40 })
                }
              }}
              className={`block size-full overflow-hidden ${zoom && i === atual ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            >
              <Picture
                image={img}
                sizes="(min-width: 768px) 48vw, 100vw"
                priority={i === 0}
                ratio="auto"
                className="h-full"
                imgClassName="transition-transform duration-300 ease-(--ease-saida)"
              />
              {zoom && i === atual && (
                // Camada ampliada separada: não mexe no layout nem no srcset da original
                <span
                  aria-hidden
                  className="absolute inset-0 bg-no-repeat"
                  style={{
                    backgroundImage: `url(${img.src}-1200.webp)`,
                    backgroundSize: '220%',
                    backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                  }}
                />
              )}
            </button>
          </div>
        ))}

        {model3d && (
          <div
            role="group"
            aria-roledescription="slide"
            aria-label={`${total} de ${total}: modelo 3D`}
            aria-hidden={atual !== indice3d}
            className="relative w-full shrink-0 snap-center"
            data-lenis-prevent
          >
            <Suspense fallback={<div className="skeleton size-full" />}>
              <Model3D src={model3d} alt={`Modelo 3D de ${nome}`} ativo={atual === indice3d} />
            </Suspense>
          </div>
        )}
      </div>

      {/* Setas: desktop. No celular o gesto de arrastar já resolve. */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => irPara(atual - 1)}
            disabled={atual === 0}
            aria-label={site.ui.prev}
            className="absolute top-1/2 left-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-fundo/70 text-xl backdrop-blur transition-opacity disabled:opacity-0 md:grid"
          >
            <Icon nome="anterior" />
          </button>
          <button
            type="button"
            onClick={() => irPara(atual + 1)}
            disabled={atual === total - 1}
            aria-label={site.ui.next}
            className="absolute top-1/2 right-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-fundo/70 text-xl backdrop-blur transition-opacity disabled:opacity-0 md:grid"
          >
            <Icon nome="proxima" />
          </button>
        </>
      )}

      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => irPara(i)}
            aria-label={i === indice3d ? site.ui.view3d : `Foto ${i + 1}`}
            aria-current={i === atual}
            // Área de toque de 44px com o ponto visual pequeno dentro
            className="group grid h-11 min-w-6 place-items-center"
          >
            {i === indice3d ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur ${
                  i === atual ? 'bg-texto text-fundo' : 'bg-fundo/70 text-texto'
                }`}
              >
                <Icon nome="cubo" /> 3D
              </span>
            ) : (
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === atual ? 'w-6 bg-texto' : 'w-1.5 bg-texto/45 group-hover:bg-texto/70'
                }`}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
