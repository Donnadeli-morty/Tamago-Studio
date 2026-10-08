import { useRef } from 'react'
import { site } from '../../lib/data'
import { track } from '../../lib/analytics'
import { useRevelar } from '../../lib/useRevelar'
import { Icon } from '../ui/Icon'
import { Picture } from '../ui/Picture'
import { SectionHeading } from '../ui/SectionHeading'

type Depoimento = (typeof site.socialProof.testimonials)[number]

/** Testimonial: texto + autor; foto opcional. */
function Testimonial({ author, handle, text, photo, placeholder }: Depoimento) {
  return (
    <figure data-revelar className="flex h-full flex-col rounded-(--radius-cartao) border border-linha/60 bg-superficie p-6">
      {placeholder && <span className="provisorio mb-4 self-start">provisório</span>}
      <blockquote className="flex-1 text-lg leading-relaxed italic">“{text}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 text-sm">
        {photo && <Picture image={photo} sizes="48px" className="size-12 shrink-0 rounded-full" />}
        <span>
          <span className="block font-semibold">{author}</span>
          {handle && <span className="text-texto-suave">{handle}</span>}
        </span>
      </figcaption>
    </figure>
  )
}

export function SocialProof() {
  const raiz = useRef<HTMLElement>(null)
  useRevelar(raiz)
  const s = site.socialProof

  return (
    <section ref={raiz} id="clientes" aria-labelledby="clientes-titulo" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <SectionHeading id="clientes-titulo" eyebrow={s.eyebrow} title={s.title} />

      {/* UGC primeiro: foto de cliente convence mais que texto (spec §3.3) */}
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {s.ugc.map((u) => (
          <li key={u.image.src} data-revelar>
            <figure className="relative overflow-hidden rounded-(--radius-cartao)">
              <Picture image={u.image} sizes="(min-width: 768px) 25vw, 46vw" ratio="1 / 1" imgClassName="object-contain!" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-fundo/90 to-transparent p-3 pt-10 text-xs">
                <span className="block font-semibold">{u.handle}</span>
                {u.figure && <span className="text-texto-suave">{u.figure}</span>}
              </figcaption>
              {u.placeholder && <span className="provisorio absolute top-2 left-2 bg-fundo/70">provisório</span>}
            </figure>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-3 md:gap-6">
        {s.testimonials.map((t, i) => (
          <Testimonial key={i} {...t} />
        ))}
      </div>

      <p className="mt-10 text-center" data-revelar>
        <a
          href={site.brand.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('instagram_click', { source: 'prova-social' })}
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-brasa underline-offset-4 hover:underline"
        >
          <Icon nome="instagram" className="size-5" />
          Mais fotos em {site.brand.instagram}
        </a>
      </p>
    </section>
  )
}
