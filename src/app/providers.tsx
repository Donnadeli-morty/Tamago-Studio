import Lenis from 'lenis'
import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, useMenosMovimento } from '../lib/motion'
import { RolagemContexto } from './rolagem'

export function Providers({ children }: { children: ReactNode }) {
  const menosMovimento = useMenosMovimento()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('js-movimento', !menosMovimento)
    // Reduced motion: rolagem nativa, sem suavização (spec §7)
    if (menosMovimento) return

    const lenis = new Lenis({ lerp: 0.12, anchors: false })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tique = (tempo: number) => lenis.raf(tempo * 1000)
    gsap.ticker.add(tique)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tique)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [menosMovimento])

  const rolarPara = useCallback(
    (alvo: string) => {
      const el = document.querySelector<HTMLElement>(alvo)
      if (!el) return
      if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -72, duration: 1.1 })
      else el.scrollIntoView({ behavior: menosMovimento ? 'auto' : 'smooth' })
      // Move o foco para a seção, para quem navega por teclado/leitor de tela
      el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
    },
    [menosMovimento],
  )

  const travar = useCallback((travado: boolean) => {
    if (travado) lenisRef.current?.stop()
    else lenisRef.current?.start()
    document.documentElement.style.overflow = travado ? 'hidden' : ''
  }, [])

  return <RolagemContexto.Provider value={{ rolarPara, travar }}>{children}</RolagemContexto.Provider>
}
