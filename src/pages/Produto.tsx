import { useEffect, useId, useState } from 'react'
import { rotuloPreco, urlCatalogo, urlHome } from '../app/rotas'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ImageCarousel } from '../components/ui/ImageCarousel'
import { ProductCard } from '../components/ui/ProductCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { track } from '../lib/analytics'
import { relacionadas } from '../lib/catalogo'
import { ehProntaEntrega, figures, preencher, site } from '../lib/data'
import type { Figure } from '../lib/schema'
import { linkDaPeca } from '../lib/whatsapp'

const P = site.product

export function Produto({ figure }: { figure: Figure }) {
  const [nomeBase, setNomeBase] = useState('')
  const idNome = useId()
  const idDica = useId()
  const preco = rotuloPreco(figure)
  const status = site.status[figure.status]
  const esgotado = figure.status === 'esgotado'
  const link = linkDaPeca(site, figure, { nomeBase: esgotado ? '' : nomeBase })
  const { mesmoUniverso, figuras: outras } = relacionadas(figures, figure)

  useEffect(() => {
    track('figure_open', { figure: figure.slug, status: figure.status })
  }, [figure])

  const prazo =
    ehProntaEntrega(figure) && figure.shipDays
      ? preencher(site.ui.shipping, { dias: figure.shipDays })
      : figure.status === 'encomenda' && figure.leadTimeDays
        ? preencher(site.ui.production, { dias: figure.leadTimeDays })
        : null

  const ficha: [string, string][] = [
    [P.specUniverse, site.universes[figure.universe]],
    [P.specHeight, `${figure.heightCm} cm`],
    [P.specMaterial, figure.material ?? site.defaults.material],
    [P.specPainting, P.specPaintingValue],
    [P.specBase, P.specBaseValue],
  ]
  if (figure.editionSize) ficha.push([P.specEdition, preencher(P.specEditionValue, { n: figure.editionSize })])

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-32 md:px-8 md:pt-28 md:pb-28">
      <nav aria-label="Você está em" className="mb-6 text-sm text-texto-suave">
        <a href={urlHome} className="hover:text-texto">
          {P.breadcrumbHome}
        </a>
        <span aria-hidden className="mx-2">/</span>
        <a href={urlCatalogo()} className="hover:text-texto">
          {P.breadcrumbCatalog}
        </a>
        <span aria-hidden className="mx-2">/</span>
        <a href={urlCatalogo(`?universo=${figure.universe}`)} className="hover:text-texto">
          {site.universes[figure.universe]}
        </a>
        <span aria-hidden className="mx-2">/</span>
        <span aria-current="page" className="text-texto">
          {figure.name}
        </span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-12">
        <div className="overflow-hidden rounded-(--radius-cartao) border border-linha/60 md:sticky md:top-24 md:self-start">
          <ImageCarousel images={figure.images} model3d={figure.model3d} nome={figure.name} />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <StatusBadge status={figure.status} stock={figure.stock} editionSize={figure.editionSize} detalhado />
            <h1 className="mt-4 text-[2rem] leading-[1.1] font-semibold md:text-5xl">{figure.name}</h1>
            <p className="mt-2 text-texto-suave">
              {site.universes[figure.universe]} · {figure.heightCm} cm
            </p>
          </div>

          <div>
            {preco.prefixo && <p className="text-sm text-texto-suave">{preco.prefixo}</p>}
            <p className={`font-display text-4xl font-semibold tabular-nums ${esgotado ? 'text-texto-suave' : ''}`}>{preco.valor}</p>
            {site.catalog.pricesPlaceholder && <span className="provisorio mt-2 inline-block">{site.catalog.pricesNote}</span>}
            {prazo && (
              <p className="mt-3 flex items-center gap-2.5 text-sm font-medium">
                <Icon nome={figure.status === 'encomenda' ? 'pincel' : 'caixa'} className="size-5 text-brasa" />
                {prazo}
              </p>
            )}
          </div>

          {figure.description && <p className="leading-relaxed text-texto-suave">{figure.description}</p>}

          {/* Nome na base: aparece na prévia e vai junto na mensagem do WhatsApp */}
          {!esgotado && (
            <div className="rounded-(--radius-cartao) border border-linha/70 bg-superficie p-5">
              <label htmlFor={idNome} className="block text-sm font-semibold">
                {P.nameOnBaseLabel}
              </label>
              <input
                id={idNome}
                value={nomeBase}
                onChange={(e) => setNomeBase(e.target.value)}
                maxLength={24}
                autoComplete="off"
                aria-describedby={idDica}
                placeholder={site.detail.baseDefaultName}
                className="mt-2 min-h-12 w-full rounded-xl border border-linha bg-fundo px-4 text-base focus:border-acento focus:outline-none"
              />
              <p id={idDica} className="mt-2 text-xs text-texto-suave">
                {P.nameOnBaseHint}
              </p>
              <p aria-live="polite" className="giz mt-3 text-2xl text-brasa">
                {site.detail.baseThanks}, {nomeBase.trim() || site.detail.baseDefaultName}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              href={link}
              size="lg"
              icone="whatsapp"
              variant={esgotado ? 'secondary' : 'primary'}
              className="sm:flex-1"
              track={{ evento: 'cta_whatsapp_click', params: { source: 'produto', figure: figure.slug, status: figure.status } }}
            >
              {status.cta}
            </Button>
            <Button href={urlCatalogo()} size="lg" variant="ghost" iconeDepois="seta">
              {P.seeAll}
            </Button>
          </div>

          <ul className="grid gap-3 text-sm">
            {P.reassurance.map((r) => (
              <li key={r.text} className="flex items-center gap-3">
                <Icon nome={r.icon} className="size-5 shrink-0 text-brasa" />
                {r.text}
              </li>
            ))}
          </ul>

          <section aria-labelledby="ficha-tecnica">
            <h2 id="ficha-tecnica" className="mb-3 text-xl font-semibold">
              {P.specsTitle}
            </h2>
            <dl className="divide-y divide-linha/70 overflow-hidden rounded-(--radius-cartao) border border-linha/70 bg-superficie text-sm">
              {ficha.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 px-5 py-3">
                  <dt className="text-texto-suave">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      {outras.length > 0 && (
        <section aria-labelledby="relacionadas" className="mt-20 md:mt-28">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 id="relacionadas" className="text-[1.75rem] leading-tight font-semibold md:text-4xl">
              {mesmoUniverso ? preencher(P.relatedTitle, { universo: site.universes[figure.universe] }) : P.relatedFallback}
            </h2>
            <a href={urlCatalogo()} className="inline-flex min-h-11 items-center gap-2 font-semibold text-brasa hover:underline">
              {P.seeAll} <Icon nome="seta" className="size-4" />
            </a>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {outras.map((f) => (
              <li key={f.slug}>
                <ProductCard figure={f} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Barra fixa no celular: preço e compra sempre a um polegar de distância */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-linha/70 bg-fundo/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        <p className="leading-tight">
          {preco.prefixo && <span className="block text-xs text-texto-suave">{preco.prefixo}</span>}
          <span className="font-display text-xl font-semibold tabular-nums">{preco.valor}</span>
        </p>
        <Button
          href={link}
          icone="whatsapp"
          variant={esgotado ? 'secondary' : 'primary'}
          className="flex-1"
          track={{ evento: 'cta_whatsapp_click', params: { source: 'produto-barra', figure: figure.slug, status: figure.status } }}
        >
          {status.cta}
        </Button>
      </div>
    </div>
  )
}
