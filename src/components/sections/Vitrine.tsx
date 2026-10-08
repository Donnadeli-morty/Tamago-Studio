import { useRef } from 'react'
import { urlCatalogo } from '../../app/rotas'
import { ordenar } from '../../lib/catalogo'
import { UNIVERSOS } from '../../lib/constantes'
import { figures, preencher, site } from '../../lib/data'
import { useRevelar } from '../../lib/useRevelar'
import { Button } from '../ui/Button'
import { Picture } from '../ui/Picture'
import { ProductCard } from '../ui/ProductCard'
import { SectionHeading } from '../ui/SectionHeading'

const LIMITE = 4

/**
 * Vitrine da home: as figures em destaque (o que dá pra comprar agora vem antes),
 * o caminho para o catálogo completo e atalhos por universo. Mantém o id "obras",
 * o destino do botão "Ver as figures" do hero.
 */
export function Vitrine() {
  const raiz = useRef<HTMLElement>(null)
  useRevelar(raiz)
  const destaques = ordenar(figures, 'destaques').filter((f) => f.status !== 'esgotado').slice(0, LIMITE)
  const universos = UNIVERSOS.map((u) => {
    const lista = ordenar(
      figures.filter((f) => f.universe === u),
      'destaques',
    )
    return { id: u, total: lista.length, capa: lista[0] }
  }).filter((u) => u.total > 0)

  return (
    <section ref={raiz} id="obras" aria-labelledby="vitrine-titulo" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading id="vitrine-titulo" eyebrow={site.showcase.eyebrow} title={site.showcase.title} intro={site.showcase.intro} />
        <div className="mb-10 md:mb-14" data-revelar>
          <Button href={urlCatalogo()} variant="secondary" iconeDepois="seta">
            {site.showcase.cta}
          </Button>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {destaques.map((f) => (
          <li key={f.slug} data-revelar>
            <ProductCard figure={f} />
          </li>
        ))}
      </ul>

      {/* Atalhos por universo: cada um abre o catálogo já filtrado */}
      <div className="mt-20 md:mt-24">
        <SectionHeading id="universos-titulo" eyebrow={site.showcase.universesEyebrow} title={site.showcase.universesTitle} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-labelledby="universos-titulo">
          {universos.map((u) => (
            <li key={u.id} data-revelar>
              <a
                href={urlCatalogo(`?universo=${u.id}`)}
                className="group relative flex h-36 items-end overflow-hidden rounded-(--radius-cartao) border border-linha/60 p-5 md:h-44"
              >
                {u.capa && (
                  <Picture
                    image={u.capa.images[0]}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                    ratio="auto"
                    className="absolute inset-0 h-full"
                    imgClassName="object-[50%_30%] transition-transform duration-500 ease-(--ease-saida) group-hover:scale-105"
                  />
                )}
                {/* Véu ameixa: o nome do universo fica legível sobre qualquer foto */}
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-texto/90 via-texto/40 to-transparent" />
                <span className="relative flex w-full items-end justify-between gap-3 text-white">
                  <span className="font-display text-2xl font-semibold tracking-wide">{site.universes[u.id]}</span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    {u.total === 1 ? site.showcase.universeCountOne : preencher(site.showcase.universeCount, { n: u.total })}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
