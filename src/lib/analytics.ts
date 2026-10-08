import type { Site } from './schema'

/** Eventos da spec §9. O tipo impede evento com nome ou parâmetro errado. */
export type Eventos = {
  cta_whatsapp_click: {
    source: 'hero' | 'sticky' | 'header' | 'final' | 'como-pedir' | 'card' | 'produto' | 'produto-barra' | 'catalogo-vazio' | 'sob-medida'
    figure?: string
    status?: string
  }
  figure_open: { figure: string; status: string } // página da figure aberta
  filter_used: { filter: string }
  notify_submit: Record<string, never>
  instagram_click: { source: 'header' | 'final' | 'footer' | 'prova-social' | 'menu' }
  scroll_75: Record<string, never>
}

type Plausible = (evento: string, opcoes?: { props?: Record<string, string> }) => void
type Gtag = (comando: 'event', evento: string, params?: Record<string, string>) => void

declare global {
  interface Window {
    plausible?: Plausible & { q?: unknown[] }
    gtag?: Gtag
    dataLayer?: unknown[]
  }
}

export function track<E extends keyof Eventos>(evento: E, params?: Eventos[E]): void {
  const props = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined),
  ) as Record<string, string>
  try {
    window.plausible?.(evento, { props })
    window.gtag?.('event', evento, props)
  } catch {
    // Analytics nunca pode atrapalhar o clique no CTA
  }
  if (import.meta.env.DEV) console.debug('[analytics]', evento, props)
}

/**
 * Carrega o script do provedor só se estiver configurado em site.json.
 * Fica fora do bundle e depois do primeiro render (não pesa no LCP).
 */
export function iniciarAnalytics(config: Site['analytics']): void {
  if (import.meta.env.DEV || config.provider === 'none') return
  const script = document.createElement('script')
  script.defer = true
  if (config.provider === 'plausible' && config.plausibleDomain) {
    script.dataset.domain = config.plausibleDomain
    script.src = 'https://plausible.io/js/script.js'
    window.plausible =
      window.plausible ??
      Object.assign((...args: unknown[]) => (window.plausible!.q = window.plausible!.q ?? []).push(args), {})
  } else if (config.provider === 'ga4' && config.ga4Id) {
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4Id)}`
    window.dataLayer = window.dataLayer ?? []
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    } as Gtag
    ;(window.gtag as unknown as (...a: unknown[]) => void)('js', new Date())
    ;(window.gtag as unknown as (...a: unknown[]) => void)('config', config.ga4Id)
  } else return
  document.head.appendChild(script)
}
