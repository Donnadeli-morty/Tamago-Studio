import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSyncExternalStore } from 'react'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

const CONSULTA = '(prefers-reduced-motion: reduce)'

export function prefereMenosMovimento(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(CONSULTA).matches
}

/** Hook reativo: se a pessoa muda a preferência no sistema, a página acompanha. */
export function useMenosMovimento(): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia(CONSULTA)
      mq.addEventListener('change', avisar)
      return () => mq.removeEventListener('change', avisar)
    },
    prefereMenosMovimento,
    () => false,
  )
}

const CONSULTA_DESKTOP = '(min-width: 768px)'

export function useDesktop(): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia(CONSULTA_DESKTOP)
      mq.addEventListener('change', avisar)
      return () => mq.removeEventListener('change', avisar)
    },
    () => window.matchMedia(CONSULTA_DESKTOP).matches,
    () => false,
  )
}
