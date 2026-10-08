import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { urlHome, urlProcesso } from '../app/rotas'
import { FilterChips, type OpcaoFiltro } from '../components/ui/FilterChips'
import { Icon } from '../components/ui/Icon'
import { ProductCard } from '../components/ui/ProductCard'
import { Button } from '../components/ui/Button'
import { track } from '../lib/analytics'
import {
  contarAtivos,
  FILTROS_PADRAO,
  filtrar,
  ordenar,
  type Disponibilidade,
  type Filtros,
  type Ordem,
  type Tamanho,
} from '../lib/catalogo'
import { UNIVERSOS } from '../lib/constantes'
import { figures, formatarPreco, preencher, site } from '../lib/data'
import { useFiltrosDaUrl } from '../lib/useFiltrosDaUrl'
import { linkWhatsApp } from '../lib/whatsapp'

const C = site.catalog

/** Formulário de filtros: o mesmo componente na lateral (desktop) e na folha do celular. */
function FormFiltros({ filtros, mudar, idBase }: { filtros: Filtros; mudar: (parcial: Partial<Filtros>) => void; idBase: string }) {
  const campo = 'min-h-12 w-full rounded-xl border border-linha bg-superficie px-4 text-base focus:border-acento focus:outline-none'
  const pilula = (ativo: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors ${
      ativo ? 'border-texto bg-texto text-fundo' : 'border-linha text-texto-suave hover:border-texto-suave hover:text-texto'
    }`

  return (
    <form className="flex flex-col gap-6" role="search" onSubmit={(e) => e.preventDefault()} aria-label={C.filtersTitle}>
      <div>
        <label htmlFor={`${idBase}-q`} className="mb-2 block text-sm font-semibold">
          {C.searchLabel}
        </label>
        <input
          id={`${idBase}-q`}
          type="search"
          value={filtros.q}
          maxLength={60}
          placeholder={C.searchPlaceholder}
          onChange={(e) => mudar({ q: e.target.value })}
          className={campo}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{C.availabilityLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(C.availability) as Disponibilidade[]).map((d) => (
            <button key={d} type="button" aria-pressed={filtros.disponibilidade === d} className={pilula(filtros.disponibilidade === d)} onClick={() => mudar({ disponibilidade: d })}>
              {C.availability[d]}
            </button>
          ))}
        </div>
        <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={filtros.esgotadas}
            onChange={(e) => mudar({ esgotadas: e.target.checked })}
            className="size-5 accent-[var(--color-acento)]"
          />
          {C.showSoldOut}
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{C.sizeLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(C.sizes) as Tamanho[]).map((t) => (
            <button key={t} type="button" aria-pressed={filtros.tamanho === t} className={pilula(filtros.tamanho === t)} onClick={() => mudar({ tamanho: t })}>
              {C.sizes[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${idBase}-preco`} className="mb-2 block text-sm font-semibold">
          {C.priceLabel}
        </label>
        <select
          id={`${idBase}-preco`}
          value={filtros.precoMax ?? ''}
          onChange={(e) => mudar({ precoMax: e.target.value ? Number(e.target.value) : null })}
          className={campo}
        >
          <option value="">{C.priceAny}</option>
          {C.priceSteps.map((p) => (
            <option key={p} value={p}>
              {formatarPreco(p)}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => mudar({ ...FILTROS_PADRAO, ordem: filtros.ordem })}
        disabled={contarAtivos(filtros) === 0}
        className="min-h-11 self-start text-sm font-semibold text-brasa underline-offset-4 hover:underline disabled:cursor-default disabled:text-texto-suave disabled:no-underline"
      >
        {C.clear}
      </button>
    </form>
  )
}

export function Catalogo() {
  const [filtros, definirFiltros] = useFiltrosDaUrl()
  const [painelAberto, setPainelAberto] = useState(false)
  const dialogo = useRef<HTMLDialogElement>(null)
  const botaoFiltrar = useRef<HTMLButtonElement>(null)
  const idOrdem = useId()

  const lista = useMemo(() => ordenar(filtrar(figures, filtros, site.universes), filtros.ordem), [filtros])
  const ativos = contarAtivos(filtros)
  const resultados = lista.length === 1 ? C.resultsOne : preencher(C.results, { n: lista.length })

  // Filtros escolhidos com a folha aberta. Fechar a folha volta uma entrada no histórico
  // (a que existia antes de abrir, ainda sem esses filtros): eles são reaplicados no fechamento.
  const filtrosDaFolha = useRef<Filtros | null>(null)

  const mudar = (parcial: Partial<Filtros>) => {
    const novos = { ...filtros, ...parcial }
    definirFiltros(novos)
    if (painelAberto) filtrosDaFolha.current = novos
    // Busca digitada não vira evento a cada tecla
    if (!('q' in parcial)) track('filter_used', { filter: Object.entries(parcial).map(([k, v]) => `${k}:${v}`).join(',') })
  }

  // Abas de universo: só os que têm figure (contagem considera os outros filtros)
  const abas: OpcaoFiltro[] = useMemo(() => {
    const semUniverso = filtrar(figures, { ...filtros, universo: 'todos' }, site.universes)
    return [
      { id: 'todos', label: C.universeAll, total: semUniverso.length },
      ...UNIVERSOS.filter((u) => figures.some((f) => f.universe === u)).map((u) => ({
        id: u,
        label: site.universes[u],
        total: semUniverso.filter((f) => f.universe === u).length,
      })),
    ]
  }, [filtros])

  // Folha de filtros no celular: <dialog> nativo; o "voltar" do celular fecha em vez de sair da página
  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    if (painelAberto && !d.open) {
      d.showModal()
      window.history.pushState({ filtros: true }, '', window.location.href)
    }
    if (!painelAberto && d.open) d.close()
  }, [painelAberto])

  useEffect(() => {
    const aoVoltar = () => {
      setPainelAberto(false)
      if (filtrosDaFolha.current) {
        definirFiltros(filtrosDaFolha.current)
        filtrosDaFolha.current = null
      }
    }
    window.addEventListener('popstate', aoVoltar)
    return () => window.removeEventListener('popstate', aoVoltar)
  }, [definirFiltros])

  const fecharPainel = () => {
    setPainelAberto(false)
    if (window.history.state?.filtros) window.history.back()
    botaoFiltrar.current?.focus()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-20 md:px-8 md:pt-28 md:pb-28">
      <nav aria-label="Você está em" className="mb-6 text-sm text-texto-suave">
        <a href={urlHome} className="hover:text-texto">
          {site.product.breadcrumbHome}
        </a>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span aria-current="page" className="text-texto">
          {site.product.breadcrumbCatalog}
        </span>
      </nav>

      <header className="mb-8 max-w-2xl">
        <p className="giz mb-2 flex items-center gap-2.5 text-2xl text-brasa md:text-[1.7rem]">
          <span className="runa text-sm text-acento" aria-hidden />
          {C.eyebrow}
        </p>
        <h1 className="text-[2rem] leading-[1.1] font-semibold md:text-5xl">{C.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-texto-suave md:text-lg">{C.intro}</p>
      </header>

      <div className="mb-6">
        <FilterChips options={abas} active={filtros.universo} onChange={(id) => mudar({ universo: id as Filtros['universo'] })} rotulo="Universos" />
      </div>

      <div className="grid gap-8 md:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
        {/* Lateral (desktop) */}
        <aside className="hidden md:block">
          <div className="sticky top-28 rounded-(--radius-cartao) border border-linha/70 bg-superficie/70 p-5">
            <FormFiltros filtros={filtros} mudar={mudar} idBase="lateral" />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm font-semibold">
              {resultados}
              {C.pricesPlaceholder && <span className="provisorio ml-3 align-middle">{C.pricesNote}</span>}
            </p>
            <div className="flex items-center gap-2">
              <button
                ref={botaoFiltrar}
                type="button"
                onClick={() => setPainelAberto(true)}
                aria-haspopup="dialog"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-linha px-4 text-sm font-semibold md:hidden"
              >
                <Icon nome="menu" className="size-4" />
                {ativos ? `${C.filtersButton} (${ativos})` : C.filtersButton}
              </button>
              <label htmlFor={idOrdem} className="sr-only md:not-sr-only md:text-sm md:text-texto-suave">
                {C.sortLabel}
              </label>
              <select
                id={idOrdem}
                value={filtros.ordem}
                onChange={(e) => mudar({ ordem: e.target.value as Ordem })}
                className="min-h-11 rounded-full border border-linha bg-superficie px-4 text-sm font-semibold focus:border-acento focus:outline-none"
              >
                {(Object.keys(C.sorts) as Ordem[]).map((o) => (
                  <option key={o} value={o}>
                    {C.sorts[o]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="sr-only">{C.resultsHeading}</h2>
          {lista.length === 0 ? (
            <div className="grid place-items-center gap-4 rounded-(--radius-cartao) border border-dashed border-linha px-6 py-16 text-center">
              <p className="font-display text-2xl">{C.emptyTitle}</p>
              <p className="max-w-md text-texto-suave">{C.emptyText}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  href={linkWhatsApp(site.whatsapp.phone, `${site.whatsapp.notFound}${filtros.q}`.trim())}
                  icone="whatsapp"
                  track={{ evento: 'cta_whatsapp_click', params: { source: 'catalogo-vazio' } }}
                >
                  {C.emptyCta}
                </Button>
                <Button variant="secondary" onClick={() => mudar({ ...FILTROS_PADRAO, ordem: filtros.ordem })}>
                  {C.clear}
                </Button>
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
              {lista.map((f) => (
                <li key={f.slug}>
                  <ProductCard figure={f} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Encomenda sob medida: para quem não achou a figure que queria */}
      <section aria-labelledby="encomenda-sob-medida" className="mt-20 md:mt-24">
        <div className="tema-noite relative overflow-hidden rounded-[1.75rem] bg-fundo px-6 py-10 text-texto md:rounded-[2.5rem] md:px-12 md:py-14">
          <div aria-hidden className="pointer-events-none absolute -top-24 right-0 size-[28rem] rounded-full bg-[radial-gradient(closest-side,rgb(240_74_28/0.22),rgb(79_216_255/0.08)_60%,transparent)]" />
          <div className="relative grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="giz mb-2 flex items-center gap-2.5 text-2xl text-brasa">
                <span className="runa text-sm text-acento" aria-hidden />
                {C.customEyebrow}
              </p>
              <h2 id="encomenda-sob-medida" className="text-[1.75rem] leading-[1.12] font-semibold md:text-4xl">
                {C.customTitle}
              </h2>
              <p className="mt-3 max-w-lg leading-relaxed text-texto-suave">{C.customText}</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button
                href={linkWhatsApp(site.whatsapp.phone, C.customMessage)}
                size="lg"
                icone="whatsapp"
                track={{ evento: 'cta_whatsapp_click', params: { source: 'sob-medida' } }}
              >
                {C.customCta}
              </Button>
              <Button href={urlProcesso} variant="ghost" iconeDepois="seta">
                {C.processLink}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Folha de filtros (celular) */}
      <dialog
        ref={dialogo}
        aria-labelledby="titulo-filtros"
        onCancel={(e) => {
          e.preventDefault()
          fecharPainel()
        }}
        onClick={(e) => e.target === e.currentTarget && fecharPainel()}
        className="m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-hidden rounded-t-[1.75rem] border border-linha bg-fundo p-0 text-texto md:hidden"
      >
        <div className="flex max-h-[88dvh] flex-col">
          <div className="flex items-center justify-between border-b border-linha/70 px-5 py-3">
            <h2 id="titulo-filtros" className="text-xl font-semibold">
              {C.filtersTitle}
            </h2>
            <button type="button" onClick={fecharPainel} aria-label={site.ui.close} className="grid size-11 place-items-center rounded-full text-xl">
              <Icon nome="fechar" />
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain px-5 py-5" data-lenis-prevent>
            <FormFiltros filtros={filtros} mudar={mudar} idBase="folha" />
          </div>
          <div className="border-t border-linha/70 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button onClick={fecharPainel} className="w-full">
              {preencher(C.showResults, { n: lista.length })}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
