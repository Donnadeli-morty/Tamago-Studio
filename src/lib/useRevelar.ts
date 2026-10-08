import { useLayoutEffect, type RefObject } from 'react'
import { gsap, prefereMenosMovimento } from './motion'

const marcarRevelado = (el: HTMLElement) => el.setAttribute('data-revelado', '')

/**
 * Revela os elementos [data-revelar] dentro do escopo quando entram na tela,
 * em lote e com stagger (spec §8: 0.6s · stagger 0.08).
 *
 * Usa IntersectionObserver, e não ScrollTrigger: ele também dispara quando a
 * página salta (link #, rolagem rápida, viewport que muda de tamanho). Com o
 * ScrollTrigger o CTA final chegava a ficar invisível. O que já ficou para
 * trás quando é observado aparece na hora, sem animação.
 * Reduced motion: o CSS já deixa tudo visível e nada é animado.
 */
export function useRevelar(escopo: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const raiz = escopo.current
    if (!raiz || prefereMenosMovimento() || typeof IntersectionObserver === 'undefined') return

    const alvos = Array.from(raiz.querySelectorAll<HTMLElement>('[data-revelar]:not([data-revelado])'))
    let fila: HTMLElement[] = []
    let agendado = 0

    const animarFila = () => {
      agendado = 0
      const lote = fila
      fila = []
      gsap.fromTo(
        lote,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: true,
          // Marca como revelado: o CSS para de esconder o elemento
          onComplete: () => lote.forEach(marcarRevelado),
        },
      )
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          const el = entrada.target as HTMLElement
          if (entrada.isIntersecting) fila.push(el)
          else if (entrada.boundingClientRect.bottom < 0) marcarRevelado(el)
          else continue
          observador.unobserve(el)
        }
        if (fila.length && !agendado) agendado = requestAnimationFrame(animarFila)
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    alvos.forEach((el) => observador.observe(el))

    return () => {
      observador.disconnect()
      cancelAnimationFrame(agendado)
      gsap.killTweensOf(alvos)
      // Quem não chegou a ser revelado volta ao estado do CSS (escondido, à espera)
      alvos.forEach((el) => {
        if (!el.hasAttribute('data-revelado')) gsap.set(el, { clearProps: 'opacity,transform' })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
