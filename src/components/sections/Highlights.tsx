import { useRef } from 'react'
import { site } from '../../lib/data'
import { useRevelar } from '../../lib/useRevelar'
import { RuneSeal, RunicDivider } from '../ui/Runic'

/**
 * Três diferenciais com ícone de runa, separados por linhas finas, e a linha de
 * montanhas fechando a faixa: o painel de "Figures personalizadas / Pintura
 * artesanal / Criatividade" do moodboard, adaptado para o que a TAMAGO entrega.
 */
export function Highlights() {
  const raiz = useRef<HTMLElement>(null)
  useRevelar(raiz)

  return (
    <section ref={raiz} aria-label="Diferenciais" className="mx-auto mt-6 max-w-7xl px-4 md:mt-10 md:px-8">
      <div className="runic-panel overflow-hidden rounded-(--radius-cartao)">
        <ul className="grid divide-y divide-linha/70 md:grid-cols-3 md:divide-x md:divide-y-0">
          {site.highlights.map((h) => (
            <li key={h.title} data-revelar className="flex items-start gap-5 p-6 md:p-8">
              <RuneSeal compact className="mt-0.5 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold tracking-wide">{h.title}</h2>
                <p className="mt-1.5 leading-relaxed text-texto-suave">{h.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <div aria-hidden className="montanhas text-brasa/30" />
      </div>
      <RunicDivider />
    </section>
  )
}
