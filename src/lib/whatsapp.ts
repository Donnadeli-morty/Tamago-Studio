import { formatarPreco, preencher } from './data'
import type { Figure, Site } from './schema'

/**
 * Monta o link wa.me com a mensagem pronta (spec §2.3 e §3.3).
 * Todo texto passa por encodeURIComponent antes de entrar na URL (spec §5.1).
 */
export function linkWhatsApp(telefone: string, texto: string): string {
  const numero = telefone.replace(/\D/g, '')
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

type PecaNaMensagem = Pick<Figure, 'name' | 'status' | 'price'>

/**
 * Mensagem de acordo com o status da peça, com o preço; sem peça, usa a genérica.
 * Se a pessoa preencheu o nome na base, ele vai numa segunda linha.
 */
export function mensagemWhatsApp(site: Site, figure?: PecaNaMensagem, opcoes: { nomeBase?: string } = {}): string {
  if (!figure) return site.whatsapp.generic
  const texto = preencher(site.status[figure.status].message, { nome: figure.name, preco: formatarPreco(figure.price) })
  const nomeBase = opcoes.nomeBase?.trim()
  return nomeBase ? `${texto}\n${preencher(site.whatsapp.nameOnBase, { nomeBase })}` : texto
}

export function linkDaPeca(site: Site, figure?: PecaNaMensagem, opcoes: { nomeBase?: string } = {}): string {
  return linkWhatsApp(site.whatsapp.phone, mensagemWhatsApp(site, figure, opcoes))
}
