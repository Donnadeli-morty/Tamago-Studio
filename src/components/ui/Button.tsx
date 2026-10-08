import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { track, type Eventos } from '../../lib/analytics'
import { Icon, type NomeIcone } from './Icon'

type Variante = 'primary' | 'secondary' | 'ghost'
type Tamanho = 'sm' | 'md' | 'lg'

/** Evento disparado no clique (spec §4: prop trackId). */
type Rastreio = { [E in keyof Eventos]: { evento: E; params?: Eventos[E] } }[keyof Eventos]

type Comum = {
  variant?: Variante
  size?: Tamanho
  icone?: NomeIcone
  iconeDepois?: NomeIcone
  loading?: boolean
  track?: Rastreio
  children: ReactNode
  className?: string
}

type ComoLink = Comum & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'>
type ComoBotao = Comum & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

const variantes: Record<Variante, string> = {
  primary:
    // Botão principal = o cristal: turquesa com halo de luz
    'bg-acento text-sobre-acento hover:bg-acento-forte active:scale-[0.98] shadow-[0_8px_32px_-8px] shadow-brilho/55',
  secondary: 'border border-brasa/30 bg-superficie/60 text-texto hover:border-brasa/70 hover:bg-superficie-2 active:scale-[0.98]',
  ghost: 'text-texto hover:bg-superficie-2 active:scale-[0.98]',
}

// Alvos de toque ≥ 44px em todos os tamanhos (spec §7)
const tamanhos: Record<Tamanho, string> = {
  sm: 'min-h-11 px-4 text-sm gap-2',
  md: 'min-h-12 px-6 text-[0.95rem] gap-2.5',
  lg: 'min-h-14 px-7 text-base gap-3',
}

export function Button(props: ComoLink | ComoBotao) {
  const {
    variant = 'primary',
    size = 'md',
    icone,
    iconeDepois,
    loading = false,
    track: rastreio,
    children,
    className = '',
    ...resto
  } = props

  const classes = [
    'inline-flex select-none items-center justify-center rounded-full font-semibold tracking-tight',
    'transition-[background-color,border-color,transform,opacity] duration-200 ease-(--ease-saida)',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    variantes[variant],
    tamanhos[size],
    className,
  ].join(' ')

  const conteudo = (
    <>
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      ) : (
        icone && <Icon nome={icone} className="size-[1.2em] shrink-0" />
      )}
      <span>{children}</span>
      {iconeDepois && <Icon nome={iconeDepois} className="size-[1.1em] shrink-0" />}
    </>
  )

  const aoClicar = () => rastreio && track(rastreio.evento, rastreio.params as never)

  if (resto.href !== undefined) {
    const { onClick, ...link } = resto as ComoLink
    const externo = /^https?:/.test(link.href)
    return (
      <a
        {...link}
        className={classes}
        aria-busy={loading || undefined}
        {...(externo && { target: '_blank', rel: 'noopener noreferrer' })}
        onClick={(e) => {
          aoClicar()
          onClick?.(e)
        }}
      >
        {conteudo}
      </a>
    )
  }

  const { onClick, type = 'button', disabled, ...botao } = resto as ComoBotao
  return (
    <button
      {...botao}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      onClick={(e) => {
        aoClicar()
        onClick?.(e)
      }}
    >
      {conteudo}
    </button>
  )
}
