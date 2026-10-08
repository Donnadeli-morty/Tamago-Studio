import { useRef } from 'react'
import { site } from '../../lib/data'
import { useRevelar } from '../../lib/useRevelar'
import { linkDaPeca } from '../../lib/whatsapp'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { SectionHeading } from '../ui/SectionHeading'
import { Mascot } from '../ui/Mascot'
import { RunicDivider } from '../ui/Runic'

export function HowToOrder() {
  const raiz = useRef<HTMLElement>(null)
  useRevelar(raiz)
  const h = site.howTo

  return (
    <section ref={raiz} id="como-pedir" aria-labelledby="como-pedir-titulo" className="border-y border-linha/60 bg-superficie/40">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <SectionHeading id="como-pedir-titulo" eyebrow={h.eyebrow} title={h.title} />
          {site.mascot && <Mascot className="mb-5 w-48 shrink-0 self-center md:mb-3 md:w-72 md:self-auto" />}
        </div>

        {/* Painel claro sobre o fundo escuro, como a "folha de modelo" (frente/lado/costas) do moodboard */}
        <div data-revelar className="rounded-(--radius-cartao) bg-papel p-3 text-tinta shadow-[0_40px_90px_-40px_rgb(79_216_255/0.35)] md:p-4">
          <ol className="grid gap-3 md:grid-cols-3 md:gap-4">
            {h.steps.map((passo, i) => (
              <li key={passo.title} className="relative rounded-[1.1rem] bg-white/55 p-6 md:p-8">
                <span className="grid size-11 place-items-center rounded-full bg-brasa font-display text-lg font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-xl font-semibold">{passo.title}</h3>
                <p className="mt-2 leading-relaxed text-tinta-suave">{passo.text}</p>
                {i < 2 && (
                  <Icon nome="seta" aria-hidden className="absolute top-1/2 -right-4 z-10 hidden size-5 -translate-y-1/2 text-tinta-suave md:block" />
                )}
              </li>
            ))}
          </ol>

          {/* Pronta entrega x encomenda: inconfundíveis a olho (spec §3.1, item 5) */}
          <div className="mt-3 grid gap-3 md:mt-4 md:grid-cols-2 md:gap-4">
            <p className="flex items-start gap-3 rounded-[1.1rem] border border-tinta/10 bg-white/40 p-5 text-sm leading-relaxed">
              <Icon nome="check" className="mt-0.5 size-5 shrink-0 text-tinta-ok" />
              {h.readyNote}
            </p>
            <p className="flex items-start gap-3 rounded-[1.1rem] border border-tinta/10 bg-white/40 p-5 text-sm leading-relaxed">
              <Icon nome="pincel" className="mt-0.5 size-5 shrink-0 text-tinta-lavanda" />
              {h.orderNote}
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center" data-revelar>
          <Button
            href={linkDaPeca(site)}
            size="lg"
            icone="whatsapp"
            track={{ evento: 'cta_whatsapp_click', params: { source: 'como-pedir' } }}
          >
            {site.hero.ctaPrimary}
          </Button>
        </div>
        <RunicDivider />
      </div>
    </section>
  )
}
