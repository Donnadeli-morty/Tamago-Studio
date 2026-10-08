import { urlCatalogo } from '../app/rotas'
import { Button } from '../components/ui/Button'
import { site } from '../lib/data'

/** 404: figure que saiu do catálogo ou link errado. A página não é indexada (metadados). */
export function NaoEncontrada() {
  return (
    <div className="mx-auto grid min-h-[70svh] max-w-2xl place-content-center gap-5 px-4 pt-28 pb-20 text-center">
      <p className="giz text-3xl text-brasa">404</p>
      <h1 className="text-[2rem] leading-tight font-semibold md:text-5xl">{site.product.notFoundTitle}</h1>
      <p className="text-lg text-texto-suave">{site.product.notFoundText}</p>
      <div>
        <Button href={urlCatalogo()} size="lg" iconeDepois="seta">
          {site.product.notFoundCta}
        </Button>
      </div>
    </div>
  )
}
