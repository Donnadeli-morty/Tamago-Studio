import { ehProntaEntrega, figures, formatarPreco, preencher, site } from '../lib/data'
import type { Figure } from '../lib/schema'

/**
 * As páginas da loja. Cada uma vira um HTML próprio no build (scripts/prerender.mjs),
 * com título, descrição e dados estruturados: funciona na hospedagem estática sem
 * regra de servidor e o Google lê tudo sem executar JavaScript.
 *
 *   /                      vitrine (home)
 *   /figures/              catálogo com filtros (os filtros vão na URL: ?universo=anime)
 *   /figures/<slug>/       página da figure
 *   /como-e-feita/         como nasce uma figure (processo, detalhes, clientes)
 */
export type Rota =
  | { tipo: 'home' }
  | { tipo: 'catalogo' }
  | { tipo: 'processo' }
  | { tipo: 'produto'; figure: Figure }
  | { tipo: 'nao-encontrada' }

export const urlHome = '/'
export const urlCatalogo = (busca = '') => `/figures/${busca}`
export const urlProduto = (slug: string) => `/figures/${slug}/`
export const urlProcesso = '/como-e-feita/'

export function resolverRota(caminho: string): Rota {
  const limpo = `/${caminho.replace(/^\/+|\/+$/g, '')}`.replace(/\/index\.html$/, '')
  if (limpo === '/' || limpo === '') return { tipo: 'home' }
  if (limpo === '/figures') return { tipo: 'catalogo' }
  if (limpo === '/como-e-feita') return { tipo: 'processo' }
  const m = limpo.match(/^\/figures\/([a-z0-9-]+)$/)
  if (m) {
    const figure = figures.find((f) => f.slug === m[1])
    if (figure) return { tipo: 'produto', figure }
  }
  return { tipo: 'nao-encontrada' }
}

/** Todos os caminhos que o build gera como HTML (o 404 vai à parte). */
export function caminhosEstaticos(): string[] {
  return [urlHome, urlCatalogo(), urlProcesso, ...figures.map((f) => urlProduto(f.slug))]
}

// schema.org: como a disponibilidade de cada status aparece para o Google
const DISPONIBILIDADE_SCHEMA = {
  disponivel: 'https://schema.org/InStock',
  ultimas: 'https://schema.org/LimitedAvailability',
  encomenda: 'https://schema.org/PreOrder',
  esgotado: 'https://schema.org/SoldOut',
} as const

export type Metadados = {
  titulo: string
  descricao: string
  canonico: string
  imagem: string
  indexar: boolean
  jsonLd?: object
}

export function metadados(rota: Rota): Metadados {
  const base = site.seo.siteUrl.replace(/\/$/, '')
  const imagemPadrao = `${base}/img/marca/lockup-960.webp`
  switch (rota.tipo) {
    case 'home':
      return { titulo: site.seo.homeTitle, descricao: site.seo.homeDescription, canonico: `${base}/`, imagem: imagemPadrao, indexar: true }
    case 'catalogo':
      return {
        titulo: site.seo.catalogTitle,
        descricao: site.seo.catalogDescription,
        canonico: `${base}${urlCatalogo()}`,
        imagem: imagemPadrao,
        indexar: true,
      }
    case 'processo':
      return {
        titulo: site.seo.processTitle,
        descricao: site.seo.processDescription,
        canonico: `${base}${urlProcesso}`,
        imagem: `${base}${site.process.steps[0].image?.src ?? '/img/marca/lockup-960'}-1200.webp`,
        indexar: true,
      }
    case 'produto': {
      const f = rota.figure
      const imagem = `${base}${f.images[0].src}-1200.webp`
      const statusTexto = ehProntaEntrega(f) ? site.status.disponivel.label : site.status[f.status].label
      return {
        titulo: preencher(site.seo.productTitle, { nome: f.name, altura: f.heightCm }),
        descricao: preencher(site.seo.productDescription, { nome: f.name, altura: f.heightCm, status: statusTexto }),
        canonico: `${base}${urlProduto(f.slug)}`,
        imagem,
        indexar: true,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: f.name,
          image: [imagem],
          description: f.description ?? `${f.name}, figure em resina pintada à mão.`,
          brand: { '@type': 'Brand', name: site.brand.name },
          sku: f.id,
          height: { '@type': 'QuantitativeValue', value: f.heightCm, unitCode: 'CMT' },
          offers: {
            '@type': 'Offer',
            url: `${base}${urlProduto(f.slug)}`,
            priceCurrency: 'BRL',
            price: f.price,
            availability: DISPONIBILIDADE_SCHEMA[f.status],
          },
        },
      }
    }
    default:
      return { titulo: site.seo.notFoundTitle, descricao: site.seo.homeDescription, canonico: `${base}/`, imagem: imagemPadrao, indexar: false }
  }
}

/** Preço como aparece no card e na página: "a partir de R$ 890" na encomenda. */
export function rotuloPreco(f: Figure): { prefixo: string | null; valor: string } {
  return { prefixo: f.status === 'encomenda' ? site.catalog.from : null, valor: formatarPreco(f.price) }
}
