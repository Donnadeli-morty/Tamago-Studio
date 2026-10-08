import { useEffect, useId, useRef, useState } from 'react'
import { useRolagem } from '../../app/rolagem'
import { site } from '../../lib/data'
import { linkDaPeca } from '../../lib/whatsapp'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Marca } from '../ui/Marca'

export function Header({ paginaInicial = true }: { paginaInicial?: boolean }) {
  const [solido, setSolido] = useState(false)
  const [aberto, setAberto] = useState(false)
  const { rolarPara } = useRolagem()
  const idMenu = useId()
  const botaoMenu = useRef<HTMLButtonElement>(null)
  const painel = useRef<HTMLDivElement>(null)

  // Transparente sobre o hero, sólido depois de rolar (spec §4)
  useEffect(() => {
    const aoRolar = () => setSolido(window.scrollY > 24)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  // Menu mobile: Esc fecha e devolve o foco ao botão
  useEffect(() => {
    if (!aberto) return
    painel.current?.querySelector('a')?.focus()
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setAberto(false)
      botaoMenu.current?.focus()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto])

  // Na home, links de seção ("/#como-pedir") rolam suave até a seção; nas outras
  // páginas (catálogo, figure) o link navega normalmente.
  const navegar = (href: string) => (e: React.MouseEvent) => {
    setAberto(false)
    const ancora = href.startsWith('/#') ? href.slice(1) : href.startsWith('#') ? href : null
    if (!ancora || !paginaInicial) return
    e.preventDefault()
    rolarPara(ancora)
  }

  return (
    <header
      className={`tema-noite fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solido || aberto ? 'border-b border-linha/70 bg-fundo backdrop-blur-md' : 'border-b border-transparent bg-fundo backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:h-[4.5rem] md:px-8">
        <button
          ref={botaoMenu}
          type="button"
          className="-ml-2 grid size-11 place-items-center rounded-full text-xl md:hidden"
          aria-expanded={aberto}
          aria-controls={idMenu}
          aria-label={site.ui.menu}
          onClick={() => setAberto((v) => !v)}
        >
          <Icon nome={aberto ? 'fechar' : 'menu'} />
        </button>

        {/* Logo branca e azul sobre a navegação índigo. */}
        <a
          href="/"
          onClick={navegar('/#topo')}
          className="rounded-lg"
          aria-label={`${site.brand.name}, início`}
        >
          <Marca />
        </a>

        <nav aria-label="Seções" className="ml-8 hidden md:block">
          <ul className="flex items-center gap-1">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={navegar(item.href)}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-texto-suave transition-colors hover:text-texto"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={site.brand.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram ${site.brand.instagram}`}
            className="hidden size-11 place-items-center rounded-full text-xl text-texto-suave transition-colors hover:text-texto md:grid"
          >
            <Icon nome="instagram" />
          </a>
          {/* CTA primário persistente no desktop (pill); no mobile vira botão compacto */}
          <Button
            href={linkDaPeca(site)}
            size="sm"
            icone="whatsapp"
            track={{ evento: 'cta_whatsapp_click', params: { source: 'header' } }}
          >
            <span className="md:hidden">WhatsApp</span>
            <span className="hidden md:inline">{site.whatsapp.stickyLabel}</span>
          </Button>
        </div>
      </div>

      <div
        ref={painel}
        id={idMenu}
        hidden={!aberto}
        className="border-t border-linha/70 bg-fundo/95 px-4 pt-2 pb-6 backdrop-blur-md md:hidden"
      >
        <nav aria-label="Seções">
          <ul>
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={navegar(item.href)}
                  className="flex min-h-13 items-center gap-3 border-b border-linha/50 font-display text-xl tracking-wide"
                >
                  <span className="runa text-xs text-brasa" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={site.brand.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-11 items-center gap-2 text-texto-suave"
        >
          <Icon nome="instagram" /> {site.brand.instagram}
        </a>
      </div>
    </header>
  )
}
