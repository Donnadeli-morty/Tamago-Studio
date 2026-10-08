import { useId, useRef, useState } from 'react'
import { site } from '../../lib/data'
import { useRevelar } from '../../lib/useRevelar'
import { Icon } from '../ui/Icon'
import { SectionHeading } from '../ui/SectionHeading'

/** FAQItem: acordeão com aria-expanded + aria-controls (spec §7). */
function FAQItem({ q, a, aberto, onToggle }: { q: string; a: string; aberto: boolean; onToggle: () => void }) {
  const id = useId()
  return (
    <li className="border-b border-linha/70" data-revelar>
      <h3 className="font-sans text-base tracking-normal md:text-lg">
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={aberto}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className="flex min-h-16 w-full items-center justify-between gap-6 py-4 text-left font-semibold"
        >
          {q}
          <Icon
            nome="mais"
            className={`size-5 shrink-0 text-brasa transition-transform duration-300 ease-(--ease-saida) ${aberto ? 'rotate-45' : ''}`}
          />
        </button>
      </h3>
      {/* Altura animada com grid 0fr → 1fr, sem medir o conteúdo em JS */}
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        className={`grid transition-[grid-template-rows] duration-300 ease-(--ease-saida) ${aberto ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        inert={!aberto}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-6 leading-relaxed text-texto-suave">{a}</p>
        </div>
      </div>
    </li>
  )
}

export function Faq() {
  const raiz = useRef<HTMLElement>(null)
  const [aberto, setAberto] = useState<number | null>(0)
  useRevelar(raiz)

  return (
    <section ref={raiz} id="duvidas" aria-labelledby="duvidas-titulo" className="border-t border-linha/60">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-20 md:grid-cols-[1fr_1.6fr] md:gap-16 md:px-8 md:py-28">
        <div className="md:sticky md:top-28 md:self-start">
          <SectionHeading id="duvidas-titulo" eyebrow={site.faq.eyebrow} title={site.faq.title} />
        </div>
        <ul className="border-t border-linha/70">
          {site.faq.items.map((item, i) => (
            <FAQItem key={item.q} {...item} aberto={aberto === i} onToggle={() => setAberto(aberto === i ? null : i)} />
          ))}
        </ul>
      </div>
    </section>
  )
}
