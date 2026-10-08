import { rotuloPreco, urlProduto } from '../../app/rotas'
import { site } from '../../lib/data'
import type { Figure } from '../../lib/schema'
import { linkDaPeca } from '../../lib/whatsapp'
import { Button } from './Button'
import { Picture } from './Picture'
import { StatusBadge } from './StatusBadge'

type Props = {
  figure: Figure
  /** Card 2×2 da vitrine (primeira peça-destaque) */
  grande?: boolean
  /** Largura que a foto ocupa (atributo sizes) */
  sizes?: string
}

/**
 * Card de figure da loja: a foto e o nome levam à página da figure; o botão de
 * WhatsApp já abre a conversa com a mensagem pronta (nome, preço, status), sem
 * passar pela página. Os dois são links irmãos, nunca um dentro do outro.
 */
export function ProductCard({ figure, grande = false, sizes }: Props) {
  const esgotado = figure.status === 'esgotado'
  const preco = rotuloPreco(figure)
  const href = urlProduto(figure.slug)

  return (
    <article className="group flex h-full flex-col">
      <a
        href={href}
        className="block rounded-(--radius-cartao) transition-transform duration-300 ease-(--ease-saida) md:group-hover:-translate-y-1.5"
        aria-label={`${figure.name}, ${site.universes[figure.universe]}, ${figure.heightCm} cm, ${preco.prefixo ? `${preco.prefixo} ` : ''}${preco.valor}`}
      >
        <div className="relative overflow-hidden rounded-(--radius-cartao) border border-linha/60 shadow-[0_24px_50px_-30px_rgb(43_20_39/0.45)] transition-shadow duration-300 md:group-hover:border-brasa/50 md:group-hover:shadow-[0_30px_70px_-28px_rgb(184_50_26/0.35)]">
          <Picture
            image={figure.images[0]}
            sizes={sizes ?? (grande ? '(min-width: 768px) 50vw, 92vw' : '(min-width: 1024px) 23vw, (min-width: 768px) 30vw, 46vw')}
            imgClassName={`transition-transform duration-500 ease-(--ease-saida) md:group-hover:scale-[1.03] ${
              esgotado ? 'grayscale-[0.7] opacity-60' : ''
            }`}
          />
          <StatusBadge status={figure.status} stock={figure.stock} compacto className="absolute top-3 left-3 bg-fundo/80" />
        </div>
      </a>

      <div className="mt-3 flex flex-1 flex-col px-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className={`font-display font-medium ${grande ? 'text-2xl' : 'text-lg leading-tight'}`}>
            <a href={href} className="hover:text-brasa">
              {figure.name}
            </a>
          </h3>
          <span className="shrink-0 text-xs text-texto-suave tabular-nums">{figure.heightCm} cm</span>
        </div>
        <p className="mt-0.5 text-sm text-texto-suave">{site.universes[figure.universe]}</p>

        {/* Preço + compra direta. mt-auto: os botões ficam alinhados na base em toda a linha da grade */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-3">
          <p className={`leading-tight ${esgotado ? 'text-texto-suave' : ''}`}>
            {preco.prefixo && <span className="block text-xs text-texto-suave">{preco.prefixo}</span>}
            <span className="font-display text-lg font-semibold tabular-nums">{preco.valor}</span>
          </p>
          <Button
            href={linkDaPeca(site, figure)}
            size="sm"
            variant={esgotado ? 'secondary' : 'primary'}
            icone="whatsapp"
            aria-label={`${site.status[figure.status].cta}: ${figure.name} pelo WhatsApp`}
            track={{ evento: 'cta_whatsapp_click', params: { source: 'card', figure: figure.slug, status: figure.status } }}
          >
            {esgotado ? site.status.esgotado.cta.split(' ')[0] : site.catalog.quickBuy}
          </Button>
        </div>
      </div>
    </article>
  )
}
