import { urlCatalogo, urlHome } from '../app/rotas'
import { Detail } from '../components/sections/Detail'
import { Process } from '../components/sections/Process'
import { SocialProof } from '../components/sections/SocialProof'
import { Button } from '../components/ui/Button'
import { site } from '../lib/data'
import { linkDaPeca } from '../lib/whatsapp'

const P = site.processPage

/** Como nasce uma figure: o processo, o detalhe de perto e quem já tem uma na estante. */
export function ComoEFeita() {
  return (
    <>
      <header className="mx-auto max-w-7xl px-4 pt-24 md:px-8 md:pt-28">
        <nav aria-label="Você está em" className="mb-6 text-sm text-texto-suave">
          <a href={urlHome} className="hover:text-texto">
            {site.product.breadcrumbHome}
          </a>
          <span aria-hidden className="mx-2">/</span>
          <span aria-current="page" className="text-texto">
            {P.title}
          </span>
        </nav>
        <div className="max-w-2xl">
          <p className="giz mb-2 flex items-center gap-2.5 text-2xl text-brasa md:text-[1.7rem]">
            <span className="runa text-sm text-acento" aria-hidden />
            {P.eyebrow}
          </p>
          <h1 className="text-[2rem] leading-[1.1] font-semibold md:text-5xl">{P.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-texto-suave md:text-lg">{P.intro}</p>
        </div>
      </header>

      <div className="mt-12">
        <Process />
      </div>
      <Detail />
      <SocialProof />

      <section aria-label={P.ctaCatalog} className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="runic-panel flex flex-col items-center gap-5 rounded-(--radius-cartao) px-6 py-12 text-center">
          <p className="max-w-xl font-display text-2xl font-semibold md:text-3xl">{site.finalCta.title}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={urlCatalogo()} size="lg" iconeDepois="seta">
              {P.ctaCatalog}
            </Button>
            <Button
              href={linkDaPeca(site)}
              size="lg"
              variant="secondary"
              icone="whatsapp"
              track={{ evento: 'cta_whatsapp_click', params: { source: 'final' } }}
            >
              {P.ctaWhatsapp}
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
