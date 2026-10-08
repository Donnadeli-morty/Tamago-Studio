import { useEffect, type ReactNode } from 'react'
import { Footer } from '../components/sections/Footer'
import { Header } from '../components/sections/Header'
import { OfflineBanner } from '../components/ui/OfflineBanner'
import { iniciarAnalytics, track } from '../lib/analytics'
import { site } from '../lib/data'
import { Providers } from './providers'
import { urlProduto, type Rota } from './rotas'

// Links antigos da landing (dominio.com/#obra/slug, usados em stories e bio) agora
// levam à página da figure.
const LINK_ANTIGO = '#obra/'

/** Moldura comum (header, rodapé, provedores). A página vem de fora: veja paginas.tsx e main.tsx. */
export function App({ rota, children }: { rota: Rota; children: ReactNode }) {
  useEffect(() => {
    iniciarAnalytics(site.analytics)

    if (rota.tipo === 'home' && window.location.hash.startsWith(LINK_ANTIGO)) {
      window.location.replace(urlProduto(window.location.hash.slice(LINK_ANTIGO.length)))
      return
    }

    let rolou75 = false
    const aoRolar = () => {
      if (rolou75) return
      const fim = window.scrollY + window.innerHeight
      if (fim / document.documentElement.scrollHeight >= 0.75) {
        rolou75 = true
        track('scroll_75')
      }
    }
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [rota.tipo])

  return (
    <Providers>
      <a
        href="#conteudo"
        className="fixed top-2 left-2 z-[60] -translate-y-20 rounded-full bg-acento px-4 py-2 font-semibold text-sobre-acento focus:translate-y-0"
      >
        Pular para o conteúdo
      </a>
      <Header paginaInicial={rota.tipo === 'home'} />
      <OfflineBanner />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
    </Providers>
  )
}
