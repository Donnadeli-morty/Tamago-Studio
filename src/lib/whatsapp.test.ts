import { describe, expect, it } from 'vitest'
import { contarProntas, figures, formatarPreco, preencher, site } from './data'
import { Figures, Site, type Figure } from './schema'
import { linkDaPeca, linkWhatsApp, mensagemWhatsApp } from './whatsapp'

const peca = (status: Figure['status']) => ({ name: 'Ronin & Cia #1', status, price: 690 })

describe('dados (JSON)', () => {
  it('figures.json e site.json passam no schema', () => {
    expect(() => Figures.parse(figures)).not.toThrow()
    expect(() => Site.parse(site)).not.toThrow()
  })

  it('"ultimas" sem stock é rejeitado', () => {
    const ruim = [{ ...figures[0], status: 'ultimas', stock: undefined }]
    expect(Figures.safeParse(ruim).success).toBe(false)
  })

  it('slug repetido é rejeitado', () => {
    expect(Figures.safeParse([figures[0], figures[0]]).success).toBe(false)
  })

  it('conta unidades prontas para envio (disponível + últimas)', () => {
    const esperado = figures
      .filter((f) => f.status === 'disponivel' || f.status === 'ultimas')
      .reduce((t, f) => t + (f.stock ?? 1), 0)
    expect(contarProntas(figures)).toBe(esperado)
  })

  it('preencher troca só as chaves conhecidas', () => {
    expect(preencher('{n} de {total} · {x}', { n: 3, total: 5 })).toBe('3 de 5 · {x}')
  })
})

describe('WhatsApp (spec §2.3)', () => {
  it('mensagem muda conforme o status', () => {
    expect(mensagemWhatsApp(site, peca('disponivel'))).toBe('Oi! Quero comprar a figure *Ronin & Cia #1* (R$ 690, pronta entrega).')
    expect(mensagemWhatsApp(site, peca('ultimas'))).toContain('últimas unidades')
    expect(mensagemWhatsApp(site, peca('encomenda'))).toBe('Oi! Quero encomendar a figure *Ronin & Cia #1* (a partir de R$ 690).')
    expect(mensagemWhatsApp(site, peca('esgotado'))).toBe('Oi! Quero ser avisado quando a figure *Ronin & Cia #1* voltar.')
  })

  it('o nome na base entra numa segunda linha, só se preenchido', () => {
    expect(mensagemWhatsApp(site, peca('disponivel'), { nomeBase: '  Ana ' })).toBe(
      'Oi! Quero comprar a figure *Ronin & Cia #1* (R$ 690, pronta entrega).\nNome na base: Ana',
    )
    expect(mensagemWhatsApp(site, peca('disponivel'), { nomeBase: '   ' })).not.toContain('Nome na base')
  })

  it('formata preço em reais, sem centavos', () => {
    expect(formatarPreco(1190)).toBe('R$ 1.190')
  })

  it('sem peça, usa a mensagem genérica', () => {
    expect(mensagemWhatsApp(site)).toBe(site.whatsapp.generic)
  })

  it('codifica o texto com encodeURIComponent (spec §5.1)', () => {
    const url = linkDaPeca(site, peca('disponivel'))
    expect(url.startsWith(`https://wa.me/${site.whatsapp.phone}?text=`)).toBe(true)
    // & e # cruos quebrariam a query string
    expect(url).not.toMatch(/text=.*[&#\s]/)
    expect(decodeURIComponent(url.split('?text=')[1])).toBe(mensagemWhatsApp(site, peca('disponivel')))
  })

  it('limpa o telefone para só dígitos', () => {
    expect(linkWhatsApp('+55 (11) 99999-9999', 'oi')).toBe('https://wa.me/5511999999999?text=oi')
  })
})
