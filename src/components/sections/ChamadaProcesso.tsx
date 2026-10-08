import { useRef } from 'react'
import { urlProcesso } from '../../app/rotas'
import { site } from '../../lib/data'
import { useRevelar } from '../../lib/useRevelar'
import { Button } from '../ui/Button'
import { Picture } from '../ui/Picture'

/** Cartão da home que leva à página "Como nasce uma figure" (o processo saiu da home). */
export function ChamadaProcesso() {
  const raiz = useRef<HTMLElement>(null)
  useRevelar(raiz)
  const T = site.processTeaser
  const fotos = site.process.steps.map((p) => p.image).filter((i) => i !== undefined)

  return (
    <section ref={raiz} aria-labelledby="chamada-processo" className="mx-auto max-w-7xl px-4 md:px-8">
      <div data-revelar className="runic-panel grid items-center gap-8 overflow-hidden rounded-(--radius-cartao) p-6 md:grid-cols-[1fr_1.2fr] md:p-10">
        <div>
          <p className="giz mb-2 flex items-center gap-2.5 text-2xl text-brasa">
            <span className="runa text-sm text-acento" aria-hidden />
            {T.eyebrow}
          </p>
          <h2 id="chamada-processo" className="text-[1.75rem] leading-[1.12] font-semibold md:text-4xl">
            {T.title}
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-texto-suave">{T.text}</p>
          <div className="mt-6">
            <Button href={urlProcesso} variant="secondary" iconeDepois="seta">
              {T.cta}
            </Button>
          </div>
        </div>
        {/* As três etapas em miniatura: resina, pintura, base assinada */}
        <ol className="grid grid-cols-3 gap-3" aria-label={site.process.title}>
          {fotos.map((img, i) => (
            <li key={img.src} className="relative">
              <Picture image={img} sizes="(min-width: 768px) 16vw, 30vw" ratio="3 / 4" className="rounded-2xl" />
              <span className="absolute top-2 left-2 grid size-8 place-items-center rounded-full bg-brasa font-display text-sm font-semibold text-white">
                {i + 1}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
