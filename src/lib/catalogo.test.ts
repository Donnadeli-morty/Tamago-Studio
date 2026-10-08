import { describe, expect, it } from 'vitest'
import { caminhosEstaticos, metadados, resolverRota, urlProduto } from '../app/rotas'
import {
  contarAtivos,
  escreverFiltros,
  FILTROS_PADRAO,
  filtrar,
  lerFiltros,
  ordenar,
  relacionadas,
  tamanhoDe,
} from './catalogo'
import { figures, site } from './data'

describe('filtros na URL', () => {
  it('sem query = padrão, e o padrão não escreve query', () => {
    expect(lerFiltros('')).toEqual(FILTROS_PADRAO)
    expect(escreverFiltros(FILTROS_PADRAO)).toBe('')
  })

  it('ida e volta preserva os filtros', () => {
    const f = { ...FILTROS_PADRAO, universo: 'anime' as const, tamanho: 'p' as const, precoMax: 700, ordem: 'menor' as const, q: 'raposa', esgotadas: false }
    expect(lerFiltros(escreverFiltros(f))).toEqual(f)
  })

  it('valor estranho na URL volta ao padrão (link adulterado não quebra a página)', () => {
    const f = lerFiltros('?universo=<script>&tamanho=xg&preco=-5&ordem=hack')
    expect(f).toEqual(FILTROS_PADRAO)
  })

  it('conta filtros ativos sem contar a ordenação', () => {
    expect(contarAtivos({ ...FILTROS_PADRAO, ordem: 'maior' })).toBe(0)
    expect(contarAtivos({ ...FILTROS_PADRAO, universo: 'games', q: 'x' })).toBe(2)
  })
})

describe('filtrar e ordenar', () => {
  it('pronta entrega = disponível + últimas', () => {
    const r = filtrar(figures, { ...FILTROS_PADRAO, disponibilidade: 'pronta' })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((f) => f.status === 'disponivel' || f.status === 'ultimas')).toBe(true)
  })

  it('busca ignora acento e caixa, e acha pelo nome do universo', () => {
    expect(filtrar(figures, { ...FILTROS_PADRAO, q: 'DRAGAO' }).map((f) => f.slug)).toContain('dragao-ancestral')
    const anime = filtrar(figures, { ...FILTROS_PADRAO, q: 'anime' }, site.universes)
    expect(anime.every((f) => f.universe === 'anime')).toBe(true)
  })

  it('esconde esgotadas quando pedido', () => {
    expect(filtrar(figures, { ...FILTROS_PADRAO, esgotadas: false }).some((f) => f.status === 'esgotado')).toBe(false)
  })

  it('tamanho e preço máximo', () => {
    expect(tamanhoDe(16)).toBe('p')
    expect(tamanhoDe(24)).toBe('m')
    expect(tamanhoDe(32)).toBe('g')
    expect(filtrar(figures, { ...FILTROS_PADRAO, precoMax: 600 }).every((f) => f.price <= 600)).toBe(true)
  })

  it('menor preço ordena por preço, com esgotada sempre por último', () => {
    const r = ordenar(figures, 'menor')
    expect(r.at(-1)!.status).toBe('esgotado')
    const vendaveis = r.filter((f) => f.status !== 'esgotado').map((f) => f.price)
    expect(vendaveis).toEqual([...vendaveis].sort((a, b) => a - b))
  })

  it('destaques: pronta entrega antes de encomenda', () => {
    const r = ordenar(figures, 'destaques')
    const primeiraEncomenda = r.findIndex((f) => f.status === 'encomenda')
    expect(r.slice(0, primeiraEncomenda).every((f) => f.status === 'disponivel' || f.status === 'ultimas')).toBe(true)
  })

  it('relacionadas não incluem a própria figure', () => {
    const atual = figures[0]
    const { figuras } = relacionadas(figures, atual)
    expect(figuras.some((f) => f.slug === atual.slug)).toBe(false)
    expect(figuras.length).toBeLessThanOrEqual(4)
  })
})

describe('rotas e SEO', () => {
  it('resolve home, catálogo, produto e 404', () => {
    expect(resolverRota('/').tipo).toBe('home')
    expect(resolverRota('/figures/').tipo).toBe('catalogo')
    expect(resolverRota('/figures').tipo).toBe('catalogo')
    const r = resolverRota(urlProduto(figures[0].slug))
    expect(r.tipo === 'produto' && r.figure.slug).toBe(figures[0].slug)
    expect(resolverRota('/figures/nao-existe/').tipo).toBe('nao-encontrada')
    expect(resolverRota('/qualquer').tipo).toBe('nao-encontrada')
  })

  it('gera home, catálogo, processo e uma página por figure', () => {
    expect(caminhosEstaticos()).toHaveLength(3 + figures.length)
  })

  it('produto leva dados estruturados com preço e disponibilidade', () => {
    const r = resolverRota(urlProduto(figures[0].slug))
    const m = metadados(r) as { jsonLd: { offers: { price: number; availability: string } } }
    expect(m.jsonLd.offers.price).toBe(figures[0].price)
    expect(m.jsonLd.offers.availability).toMatch(/^https:\/\/schema\.org\//)
    expect(metadados(resolverRota('/x')).indexar).toBe(false)
  })
})
