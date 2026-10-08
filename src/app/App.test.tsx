import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { figures, site } from '../lib/data'
import { EmailDrop } from '../lib/formulario'
import { mensagemWhatsApp } from '../lib/whatsapp'
import { App } from './App'
import { PaginaDaRota } from './paginas'
import { resolverRota, urlProcesso, urlProduto } from './rotas'

const hrefTexto = (a: Element) => decodeURIComponent(a.getAttribute('href')!.split('?text=')[1])
// O catálogo lê os filtros da URL: cada teste começa do endereço da página que renderiza
const abrir = (caminho: string) => {
  window.history.replaceState(null, '', caminho)
  const rota = resolverRota(caminho.split('?')[0])
  return render(
    <App rota={rota}>
      <PaginaDaRota rota={rota} />
    </App>,
  )
}

afterEach(() => window.history.replaceState(null, '', '/'))

describe('estrutura da loja', () => {
  it.each(['/', '/figures/', urlProcesso, urlProduto(figures[0].slug), '/nada-aqui/'])('%s tem um único h1', (caminho) => {
    abrir(caminho)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('a home mantém o hero e ganha a vitrine logo abaixo', () => {
    abrir('/')
    expect(screen.getByRole('heading', { level: 1, name: site.hero.title })).toBeInTheDocument()
    expect(document.getElementById('obras')).toHaveTextContent(site.showcase.title)
  })

  it("o botão ao lado do WhatsApp no hero leva direto ao catálogo", () => {
    abrir("/")
    const hero = document.getElementById("topo")!
    expect(within(hero).getByRole("link", { name: site.hero.ctaSecondary })).toHaveAttribute("href", "/figures/")
  })

  it('o processo saiu da home: virou página própria, com atalho na home', () => {
    abrir('/')
    expect(document.getElementById('processo')).toBeNull()
    expect(screen.getByRole('link', { name: site.processTeaser.cta })).toHaveAttribute('href', urlProcesso)
    cleanup()
    abrir(urlProcesso)
    expect(document.getElementById('processo')).not.toBeNull()
  })
})

describe('compra pelo WhatsApp', () => {
  it('o card leva à página da figure e o botão do card já abre o WhatsApp com nome e preço', () => {
    abrir('/figures/')
    const fig = figures.find((f) => f.status === 'disponivel')!
    const card = screen.getByRole('link', { name: new RegExp(`^${fig.name},`) }).closest('article')!
    expect(within(card).getAllByRole('link')[0]).toHaveAttribute('href', urlProduto(fig.slug))
    const zap = within(card).getByRole('link', { name: new RegExp(`${site.status[fig.status].cta}: ${fig.name}`) })
    expect(hrefTexto(zap)).toBe(mensagemWhatsApp(site, fig))
    expect(hrefTexto(zap)).toContain('R$')
    expect(zap).toHaveAttribute('target', '_blank')
  })

  it('na página da figure, o nome na base entra na mensagem', async () => {
    const user = userEvent.setup()
    const fig = figures.find((f) => f.status === 'encomenda')!
    abrir(urlProduto(fig.slug))
    await user.type(screen.getByLabelText(site.product.nameOnBaseLabel), 'Ana')
    const ctas = screen.getAllByRole('link', { name: site.status[fig.status].cta })
    expect(ctas.length).toBeGreaterThanOrEqual(1)
    for (const cta of ctas) expect(hrefTexto(cta)).toBe(mensagemWhatsApp(site, fig, { nomeBase: 'Ana' }))
  })

  it('figure esgotada oferece "Avise-me" e não pede nome na base', () => {
    const fig = figures.find((f) => f.status === 'esgotado')!
    abrir(urlProduto(fig.slug))
    expect(screen.queryByLabelText(site.product.nameOnBaseLabel)).not.toBeInTheDocument()
    expect(hrefTexto(screen.getAllByRole('link', { name: site.status.esgotado.cta })[0])).toBe(mensagemWhatsApp(site, fig))
  })
})

describe('catálogo', () => {
  it('filtro de disponibilidade muda a lista e vai para a URL', async () => {
    const user = userEvent.setup()
    abrir('/figures/')
    const lateral = screen.getAllByRole('search')[0]
    await user.click(within(lateral).getByRole('button', { name: site.catalog.availability.encomenda }))
    expect(window.location.search).toBe('?disponibilidade=encomenda')
    const encomendas = figures.filter((f) => f.status === 'encomenda')
    expect(screen.getAllByRole('article')).toHaveLength(encomendas.length)
  })

  it('abre já filtrado a partir de um link compartilhado', () => {
    abrir('/figures/?universo=anime')
    const anime = figures.filter((f) => f.universe === 'anime')
    expect(screen.getAllByRole('article')).toHaveLength(anime.length)
  })

  it('busca sem resultado oferece pedir pelo WhatsApp', async () => {
    const user = userEvent.setup()
    abrir('/figures/')
    await user.type(within(screen.getAllByRole('search')[0]).getByLabelText(site.catalog.searchLabel), 'xyzxyz')
    expect(screen.getByText(site.catalog.emptyTitle)).toBeInTheDocument()
    expect(hrefTexto(screen.getByRole('link', { name: site.catalog.emptyCta }))).toContain('xyzxyz')
  })

  it('abaixo da grade: encomenda sob medida no WhatsApp e atalho para o processo', () => {
    abrir('/figures/')
    const bloco = screen.getByRole('heading', { name: site.catalog.customTitle }).closest('section')!
    expect(hrefTexto(within(bloco).getByRole('link', { name: site.catalog.customCta }))).toBe(site.catalog.customMessage)
    expect(within(bloco).getByRole('link', { name: site.catalog.processLink })).toHaveAttribute('href', urlProcesso)
  })

  it('status nunca só por cor: todo card tem o nome do status', () => {
    abrir('/figures/')
    for (const f of figures) {
      const card = screen.getByRole('link', { name: new RegExp(`^${f.name},`) }).closest('article')!
      expect(card).toHaveTextContent(site.status[f.status].label)
    }
  })
})

describe('home', () => {
  it('FAQ usa aria-expanded/aria-controls', async () => {
    const user = userEvent.setup()
    abrir('/')
    const pergunta = screen.getByRole('button', { name: site.faq.items[1].q })
    expect(pergunta).toHaveAttribute('aria-expanded', 'false')
    await user.click(pergunta)
    expect(pergunta).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById(pergunta.getAttribute('aria-controls')!)).toHaveTextContent(site.faq.items[1].a)
  })

  it('formulário de drop valida e-mail com Zod', async () => {
    expect(EmailDrop.safeParse({ email: 'fulano@' }).success).toBe(false)
    const user = userEvent.setup()
    abrir('/')
    await user.type(screen.getByLabelText(site.notify.emailLabel), 'fulano@')
    await user.click(screen.getByRole('button', { name: site.notify.submit }))
    expect(screen.getByText(site.notify.invalid)).toBeInTheDocument()
  })
})
