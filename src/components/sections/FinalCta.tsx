import { useRef } from 'react'
import { site } from '../../lib/data'
import { useRevelar } from '../../lib/useRevelar'
import { linkDaPeca } from '../../lib/whatsapp'
import { Button } from '../ui/Button'
import { Lockup } from '../ui/Marca'
import { NotifyForm } from '../ui/NotifyForm'
import { RunicDivider, RunicSky } from '../ui/Runic'

export function FinalCta() {
  const raiz = useRef<HTMLDivElement>(null)
  useRevelar(raiz)
  const f = site.finalCta

  return (
      <section id="cta-final" aria-labelledby="cta-final-titulo" className="relative overflow-hidden border-t border-linha/60">
        <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(240_74_28/0.08),rgb(47_50_145/0.06)_55%,transparent)]" />
        <div ref={raiz} className="relative mx-auto max-w-4xl px-4 py-24 text-center md:px-8 md:py-32">
          <RunicSky />
          {/* A logo completa fecha a página: ovo, TAMAGO e "Pequenas ideias, grandes mundos" */}
          <div data-revelar className="mb-10 flex justify-center">
            <Lockup className="w-56 md:w-72" />
          </div>
          <h2 id="cta-final-titulo" data-revelar className="text-[1.9rem] leading-[1.12] font-semibold md:text-5xl">
            {f.title}
          </h2>
          <p data-revelar className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-texto-suave">
            {f.text}
          </p>
          <div data-revelar className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              href={linkDaPeca(site)}
              size="lg"
              icone="whatsapp"
              track={{ evento: 'cta_whatsapp_click', params: { source: 'final' } }}
            >
              {f.cta}
            </Button>
            <Button
              href={site.brand.instagramUrl}
              size="lg"
              variant="secondary"
              icone="instagram"
              track={{ evento: 'instagram_click', params: { source: 'final' } }}
            >
              {f.instagramCta}
            </Button>
          </div>

          <RunicDivider />
          <div data-revelar className="runic-panel mx-auto mt-12 max-w-xl rounded-(--radius-cartao) p-6 text-left md:p-8">
            <h3 className="text-2xl font-medium">{site.notify.title}</h3>
            <p className="mt-2 mb-6 text-texto-suave">{site.notify.text}</p>
            <NotifyForm />
          </div>
        </div>
        <div aria-hidden className="montanhas mx-auto max-w-4xl text-brasa/30" />
      </section>
  )
}
