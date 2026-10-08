import { useEffect, useState } from 'react'
import { site } from '../../lib/data'
import { linkDaPeca } from '../../lib/whatsapp'
import { Button } from '../ui/Button'

type Props = {
  /** Esconde enquanto o ProductSheet está aberto (ele tem o próprio CTA). */
  oculto?: boolean
}

/**
 * Barra fixa inferior no mobile: CTA "a um polegar de distância" (spec §3.3).
 * Fica escondida enquanto os botões do hero estão na tela e reaparece depois.
 * No desktop o papel é do pill no header.
 */
export function StickyCTA({ oculto = false }: Props) {
  const [heroVisivel, setHeroVisivel] = useState(true)
  const [noFinal, setNoFinal] = useState(false)

  useEffect(() => {
    const ctasHero = document.getElementById('hero-ctas')
    const ctaFinal = document.getElementById('cta-final')
    const obs = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.target === ctasHero) setHeroVisivel(e.isIntersecting || e.boundingClientRect.top > 0)
        if (e.target === ctaFinal) setNoFinal(e.isIntersecting)
      }
    })
    if (ctasHero) obs.observe(ctasHero)
    if (ctaFinal) obs.observe(ctaFinal)
    return () => obs.disconnect()
  }, [])

  // Também some no CTA final, para não repetir dois botões iguais empilhados
  const visivel = !heroVisivel && !noFinal && !oculto

  return (
    <div
      aria-hidden={!visivel}
      inert={!visivel}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-linha/70 bg-fundo/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 ease-(--ease-saida) md:hidden ${
        visivel ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <Button
        href={linkDaPeca(site)}
        icone="whatsapp"
        className="w-full"
        track={{ evento: 'cta_whatsapp_click', params: { source: 'sticky' } }}
      >
        {site.whatsapp.stickyLabel}
      </Button>
    </div>
  )
}
