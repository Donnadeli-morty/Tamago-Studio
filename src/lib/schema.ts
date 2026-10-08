import { z } from 'zod'
import { STATUS, UNIVERSOS } from './constantes.ts'

/**
 * Contrato dos dados (spec §4.1). Tudo que é conteúdo vive em src/data/*.json
 * e passa por aqui antes de chegar na tela: JSON mal editado falha cedo, nos
 * testes e no carregamento, em vez de virar uma tela quebrada.
 */

// `src` é o caminho-base SEM extensão nem largura: "/img/obras/ronin-1".
// O componente <Picture> monta os arquivos -480/-800/-1200 em .avif e .webp.
export const Imagem = z.object({
  src: z.string().startsWith('/'),
  alt: z.string().min(3),
  w: z.number().positive(),
  h: z.number().positive(),
})
export type Imagem = z.infer<typeof Imagem>

export const Status = z.enum(STATUS)
export type Status = z.infer<typeof Status>


export const Figure = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  universe: z.enum(UNIVERSOS),
  heightCm: z.number().positive(),
  status: Status,
  // Preço em reais (inteiro). Encomenda: valor "a partir de".
  price: z.number().int().positive(),
  // Entrada no catálogo (AAAA-MM-DD): ordena "Novidades"
  addedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stock: z.number().int().nonnegative().optional(), // só p/ pronta entrega
  shipDays: z.number().int().optional(), // despacho (pronta entrega)
  leadTimeDays: z.number().int().optional(), // produção (encomenda)
  featured: z.boolean().default(false),
  model3d: z.string().optional(), // .glb (peças-destaque)
  images: z.array(Imagem).min(1),
  // Extensões opcionais à spec: tiragem total ("3 de 5"), material específico e texto curto.
  editionSize: z.number().int().positive().optional(),
  material: z.string().optional(),
  description: z.string().optional(),
})
export type Figure = z.infer<typeof Figure>

export const Figures = z
  .array(Figure)
  .min(1)
  .superRefine((lista, ctx) => {
    const vistos = new Set<string>()
    lista.forEach((f, i) => {
      if (vistos.has(f.slug)) ctx.addIssue({ code: 'custom', message: `slug repetido: ${f.slug}`, path: [i] })
      vistos.add(f.slug)
      if (f.status === 'ultimas' && f.stock === undefined)
        ctx.addIssue({ code: 'custom', message: `${f.slug}: "ultimas" precisa de stock`, path: [i] })
    })
  })

const Link = z.object({ label: z.string(), href: z.string() })
const Passo = z.object({ title: z.string(), text: z.string(), image: Imagem.optional() })

const HeroMidia = z.discriminatedUnion('type', [
  z.object({ type: z.literal('image'), image: Imagem }),
  z.object({
    type: z.literal('video'),
    poster: Imagem,
    sources: z.array(z.object({ src: z.string(), type: z.string() })).min(1),
  }),
  // Sequência de quadros (ex.: giro 360° fotografado) controlada pelo scroll
  z.object({ type: z.literal('frames'), frames: z.array(Imagem).min(2) }),
])

const TextoStatus = z.object({ label: z.string(), cta: z.string(), message: z.string() })

export const Site = z.object({
  brand: z.object({
    name: z.string(),
    instagram: z.string(),
    instagramUrl: z.url(),
    tagline: z.string(), // assinatura curta (emblema, rodapé)
  }),
  mascot: z.object({
    atelier: Imagem,
    welcome: Imagem,
    companion: Imagem.optional(),
    note: z.string(),
  }).optional(),
  whatsapp: z.object({
    phone: z.string().regex(/^\d{12,13}$/, 'DDI+DDD+número, só dígitos'),
    generic: z.string(),
    stickyLabel: z.string(),
    nameOnBase: z.string(), // {nomeBase}: linha extra quando a pessoa preenche o nome na base
    notFound: z.string(), // catálogo vazio: "procuro uma figure que não achei"
  }),
  // {nome} é trocado pelo nome da figure nas mensagens
  status: z.object({
    disponivel: TextoStatus,
    ultimas: TextoStatus,
    encomenda: TextoStatus,
    esgotado: TextoStatus,
  }),
  universes: z.record(z.enum(UNIVERSOS), z.string()),
  defaults: z.object({ material: z.string() }),
  nav: z.array(Link),
  hero: z.object({
    eyebrow: z.string(),
    title: z.string(),
    subtitle: z.string(),
    ctaPrimary: z.string(),
    ctaSecondary: z.string(),
    readyLabel: z.string(), // {n}
    note: z.string(), // anotação "a giz" ao lado da peça (desktop)
    media: HeroMidia,
  }),
  // Vitrine da home: destaques + atalhos por universo
  showcase: z.object({
    eyebrow: z.string(),
    title: z.string(),
    intro: z.string(),
    cta: z.string(),
    universesEyebrow: z.string(),
    universesTitle: z.string(),
    universeCount: z.string(), // {n}
    universeCountOne: z.string(),
  }),
  catalog: z.object({
    eyebrow: z.string(),
    title: z.string(),
    intro: z.string(),
    universeAll: z.string(),
    searchLabel: z.string(),
    searchPlaceholder: z.string(),
    availabilityLabel: z.string(),
    availability: z.object({ todas: z.string(), pronta: z.string(), encomenda: z.string() }),
    showSoldOut: z.string(),
    sizeLabel: z.string(),
    sizes: z.object({ todos: z.string(), p: z.string(), m: z.string(), g: z.string() }),
    priceLabel: z.string(),
    priceAny: z.string(),
    priceSteps: z.array(z.number().int().positive()).min(1),
    sortLabel: z.string(),
    sorts: z.object({ destaques: z.string(), menor: z.string(), maior: z.string(), novidades: z.string(), altura: z.string() }),
    results: z.string(), // {n}
    resultsOne: z.string(),
    filtersButton: z.string(),
    filtersTitle: z.string(),
    showResults: z.string(), // {n}
    clear: z.string(),
    emptyTitle: z.string(),
    emptyText: z.string(),
    emptyCta: z.string(),
    pricesPlaceholder: z.boolean(), // liga o aviso "Preços provisórios"
    pricesNote: z.string(),
    from: z.string(),
    seeDetails: z.string(),
    quickBuy: z.string(),
    // Bloco "Não encontrou sua figure?" abaixo da grade (encomenda sob medida)
    customEyebrow: z.string(),
    customTitle: z.string(),
    customText: z.string(),
    customCta: z.string(),
    customMessage: z.string(),
    processLink: z.string(),
    resultsHeading: z.string(), // h2 só para leitor de tela, antes da grade
  }),
  // Página "Como nasce uma figure" (/como-e-feita/) e o cartão que leva a ela na home
  processPage: z.object({
    eyebrow: z.string(),
    title: z.string(),
    intro: z.string(),
    ctaCatalog: z.string(),
    ctaWhatsapp: z.string(),
  }),
  processTeaser: z.object({ eyebrow: z.string(), title: z.string(), text: z.string(), cta: z.string() }),
  product: z.object({
    breadcrumbHome: z.string(),
    breadcrumbCatalog: z.string(),
    specsTitle: z.string(),
    specUniverse: z.string(),
    specHeight: z.string(),
    specMaterial: z.string(),
    specEdition: z.string(),
    specEditionValue: z.string(), // {n}
    specPainting: z.string(),
    specPaintingValue: z.string(),
    specBase: z.string(),
    specBaseValue: z.string(),
    nameOnBaseLabel: z.string(),
    nameOnBaseHint: z.string(),
    reassurance: z.array(z.object({ icon: z.enum(['caixa', 'pincel', 'whatsapp', 'check']), text: z.string() })).length(3),
    relatedTitle: z.string(), // {universo}
    relatedFallback: z.string(),
    seeAll: z.string(),
    notFoundTitle: z.string(),
    notFoundText: z.string(),
    notFoundCta: z.string(),
  }),
  seo: z.object({
    siteUrl: z.url(),
    homeTitle: z.string(),
    homeDescription: z.string(),
    catalogTitle: z.string(),
    catalogDescription: z.string(),
    processTitle: z.string(),
    processDescription: z.string(),
    productTitle: z.string(), // {nome} {altura}
    productDescription: z.string(), // {nome} {altura} {status}
    notFoundTitle: z.string(),
  }),
  // Faixa logo abaixo do hero: 3 diferenciais com ícone de runa
  highlights: z.array(z.object({ title: z.string(), text: z.string() })).length(3),
  gallery: z.object({
    eyebrow: z.string(),
    title: z.string(),
    intro: z.string(),
    filterAll: z.string(),
    filterReady: z.string(),
    filterOrder: z.string(),
    emptyTitle: z.string(),
    emptyAction: z.string(),
  }),
  process: z.object({ eyebrow: z.string(), title: z.string(), intro: z.string(), steps: z.array(Passo).min(1) }),
  detail: z.object({
    eyebrow: z.string(),
    title: z.string(),
    intro: z.string(),
    macro: Imagem,
    macroCaption: z.string(),
    scaleCaption: z.string(), // {cm}
    scaleHeightCm: z.number().positive(),
    scaleImage: Imagem.optional(),
    base: Imagem,
    baseTitle: z.string(),
    baseText: z.string(),
    baseThanks: z.string(),
    baseInputLabel: z.string(),
    baseDefaultName: z.string(),
    // Altura (em % da foto) onde o texto da plaqueta aparece; ajustar com a foto real
    baseTextTop: z.number().min(0).max(100),
  }),
  howTo: z.object({
    eyebrow: z.string(),
    title: z.string(),
    steps: z.array(Passo).length(3),
    readyNote: z.string(),
    orderNote: z.string(),
  }),
  socialProof: z.object({
    eyebrow: z.string(),
    title: z.string(),
    ugc: z.array(
      z.object({ image: Imagem, handle: z.string(), figure: z.string().optional(), placeholder: z.boolean() }),
    ),
    testimonials: z.array(
      z.object({
        author: z.string(),
        handle: z.string().optional(),
        text: z.string(),
        photo: Imagem.optional(),
        placeholder: z.boolean(),
      }),
    ),
  }),
  faq: z.object({ eyebrow: z.string(), title: z.string(), items: z.array(z.object({ q: z.string(), a: z.string() })) }),
  finalCta: z.object({
    title: z.string(),
    text: z.string(),
    cta: z.string(),
    instagramCta: z.string(),
  }),
  notify: z.object({
    title: z.string(),
    text: z.string(),
    // Formspree/Web3Forms. Vazio → cai para mailto:
    endpoint: z.union([z.url(), z.literal('')]),
    mailto: z.email(),
    emailLabel: z.string(),
    submit: z.string(),
    sending: z.string(),
    success: z.string(),
    error: z.string(),
    invalid: z.string(),
    mailtoNote: z.string(), // quando não há endpoint: avisa que abriu o app de e-mail
  }),
  footer: z.object({ note: z.string(), legal: z.string() }),
  ui: z.object({
    close: z.string(),
    offline: z.string(),
    imageError: z.string(),
    height: z.string(),
    material: z.string(),
    shipping: z.string(), // {dias}
    production: z.string(), // {dias}
    stockLeft: z.string(), // {n}
    stockOf: z.string(), // {n} {total}
    view3d: z.string(),
    loading3d: z.string(),
    prev: z.string(),
    next: z.string(),
    menu: z.string(),
  }),
  analytics: z.object({
    provider: z.enum(['none', 'plausible', 'ga4']),
    plausibleDomain: z.string(),
    ga4Id: z.string(),
  }),
})
export type Site = z.infer<typeof Site>
