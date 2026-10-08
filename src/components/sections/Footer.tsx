import { urlCatalogo } from '../../app/rotas'
import { track } from '../../lib/analytics'
import { UNIVERSOS } from '../../lib/constantes'
import { figures, site } from '../../lib/data'
import { Icon } from '../ui/Icon'
import { Marca } from '../ui/Marca'

/** Rodapé da loja: marca, atalhos do catálogo por universo e os caminhos de ajuda. */
export function Footer() {
  // Só universos que têm figure no catálogo viram link
  const universos = UNIVERSOS.filter((u) => figures.some((f) => f.universe === u))
  const linkClasse = 'inline-flex min-h-11 items-center hover:text-texto md:min-h-9'

  return (
    <footer className="relative pb-28 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-chama before:via-brasa before:to-acento md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 text-sm text-texto-suave md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <span className="text-texto">
            <Marca />
          </span>
          <p className="mt-3 max-w-xs">{site.footer.note}</p>
          <a
            href={site.brand.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('instagram_click', { source: 'footer' })}
            className="mt-3 inline-flex min-h-11 items-center gap-2 hover:text-texto"
          >
            <Icon nome="instagram" className="size-4" /> {site.brand.instagram}
          </a>
        </div>

        <nav aria-label="Catálogo">
          <p className="mb-2 font-display text-xs font-semibold tracking-[0.2em] text-texto uppercase">{site.catalog.eyebrow}</p>
          <ul>
            <li>
              <a className={linkClasse} href={urlCatalogo()}>
                {site.catalog.title}
              </a>
            </li>
            <li>
              <a className={linkClasse} href={urlCatalogo('?disponibilidade=pronta')}>
                {site.catalog.availability.pronta}
              </a>
            </li>
            <li>
              <a className={linkClasse} href={urlCatalogo('?disponibilidade=encomenda')}>
                {site.catalog.availability.encomenda}
              </a>
            </li>
            {universos.map((u) => (
              <li key={u}>
                <a className={linkClasse} href={urlCatalogo(`?universo=${u}`)}>
                  {site.universes[u]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Ajuda">
          <p className="mb-2 font-display text-xs font-semibold tracking-[0.2em] text-texto uppercase">{site.howTo.eyebrow}</p>
          <ul>
            <li>
              <a className={linkClasse} href="/#como-pedir">
                {site.howTo.title}
              </a>
            </li>
            <li>
              <a className={linkClasse} href="/#duvidas">
                {site.faq.title}
              </a>
            </li>
          </ul>
          <p className="mt-6 max-w-sm text-xs">{site.footer.legal}</p>
          <p className="mt-2 text-xs">© {new Date().getFullYear()} {site.brand.name}</p>
        </nav>
      </div>
    </footer>
  )
}
