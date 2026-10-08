import { useLayoutEffect, useRef } from 'react'
import { site } from '../../lib/data'
import { gsap, prefereMenosMovimento } from '../../lib/motion'
import { useRevelar } from '../../lib/useRevelar'
import { Picture } from '../ui/Picture'
import { SectionHeading } from '../ui/SectionHeading'

/** ProcessStep: número + foto + texto; a linha do tempo "enche" com o scroll. */
function ProcessStep({ index, title, text, image }: (typeof site.process.steps)[number] & { index: number }) {
  return (
    <li data-revelar className="relative grid gap-5 md:grid-cols-2 md:items-center md:gap-12">
      <div className={index % 2 === 1 ? 'md:order-2' : ''}>
        {image && (
          <Picture image={image} sizes="(min-width: 768px) 44vw, 92vw" className="rounded-(--radius-cartao) border border-linha/60" />
        )}
      </div>
      <div className="md:px-6">
        <span className="texto-brasa font-display text-6xl leading-none font-semibold tabular-nums md:text-8xl">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="mt-3 text-2xl font-medium md:text-4xl">{title}</h3>
        <p className="mt-3 max-w-md leading-relaxed text-texto-suave md:text-lg">{text}</p>
      </div>
    </li>
  )
}

export function Process() {
  const raiz = useRef<HTMLElement>(null)
  useRevelar(raiz)

  useLayoutEffect(() => {
    if (!raiz.current || prefereMenosMovimento()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-linha-progresso]',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '[data-linha-trilho]', start: 'top 70%', end: 'bottom 60%', scrub: 1 },
        },
      )
    }, raiz)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={raiz} id="processo" aria-labelledby="processo-titulo" className="border-y border-linha/60 bg-superficie/40">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <SectionHeading id="processo-titulo" eyebrow={site.process.eyebrow} title={site.process.title} intro={site.process.intro} />
        <div data-linha-trilho className="relative">
          {/* Linha do tempo (decorativa) */}
          <div aria-hidden className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 bg-linha md:block">
            <div data-linha-progresso className="size-full origin-top bg-gradient-to-b from-chama via-brasa to-acento" />
          </div>
          <ol className="grid gap-16 md:gap-24">
            {site.process.steps.map((passo, i) => (
              <ProcessStep key={passo.title} index={i} {...passo} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
