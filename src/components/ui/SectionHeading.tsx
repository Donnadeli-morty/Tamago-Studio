import type { ReactNode } from 'react'

type Props = {
  id: string
  eyebrow: string
  title: string
  intro?: ReactNode
  align?: 'left' | 'center'
}

/** Cabeçalho padrão das seções: sobretítulo + h2 + texto de apoio. */
export function SectionHeading({ id, eyebrow, title, intro, align = 'left' }: Props) {
  const centro = align === 'center'
  return (
    <div className={`mb-10 max-w-2xl md:mb-14 ${centro ? 'mx-auto text-center' : ''}`} data-revelar>
      {/* Sobretítulo manuscrito, como os rótulos "Visão geral" / "Detalhes" das folhas de modelo */}
      <p className={`giz mb-2 flex items-center gap-2.5 text-2xl text-brasa md:text-[1.7rem] ${centro ? 'justify-center' : ''}`}>
        <span className="runa text-sm text-acento" aria-hidden />
        {eyebrow}
      </p>
      <h2 id={id} className="text-[1.75rem] leading-[1.12] font-semibold md:text-[2.6rem]">
        {title}
      </h2>
      {intro && <p className="mt-4 text-base leading-relaxed text-texto-suave md:text-lg">{intro}</p>}
    </div>
  )
}
