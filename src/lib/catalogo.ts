import { UNIVERSOS } from './constantes'
import type { Figure, Status } from './schema'

/**
 * Regras do catálogo, sem React: filtros, ordenação e o "endereço" dos filtros na URL.
 * Ficam separadas para serem testadas direto e para a URL ser a fonte da verdade
 * (um link com filtro aplicado abre igual em qualquer celular).
 */

export type Universo = (typeof UNIVERSOS)[number]
export type Disponibilidade = 'todas' | 'pronta' | 'encomenda'
export type Tamanho = 'todos' | 'p' | 'm' | 'g'
export type Ordem = 'destaques' | 'menor' | 'maior' | 'novidades' | 'altura'

export type Filtros = {
  universo: Universo | 'todos'
  disponibilidade: Disponibilidade
  esgotadas: boolean
  tamanho: Tamanho
  precoMax: number | null
  ordem: Ordem
  q: string
}

export const FILTROS_PADRAO: Filtros = {
  universo: 'todos',
  disponibilidade: 'todas',
  esgotadas: true,
  tamanho: 'todos',
  precoMax: null,
  ordem: 'destaques',
  q: '',
}

const DISPONIBILIDADES: Disponibilidade[] = ['todas', 'pronta', 'encomenda']
const TAMANHOS: Tamanho[] = ['todos', 'p', 'm', 'g']
const ORDENS: Ordem[] = ['destaques', 'menor', 'maior', 'novidades', 'altura']

const um = <T extends string>(lista: readonly T[], valor: string | null, padrao: T): T =>
  valor && (lista as readonly string[]).includes(valor) ? (valor as T) : padrao

/** "?universo=anime&tamanho=p" → filtros. Valor desconhecido na URL volta ao padrão. */
export function lerFiltros(busca: string): Filtros {
  const p = new URLSearchParams(busca)
  const preco = Number(p.get('preco'))
  return {
    universo: um(['todos', ...UNIVERSOS], p.get('universo'), 'todos'),
    disponibilidade: um(DISPONIBILIDADES, p.get('disponibilidade'), 'todas'),
    esgotadas: p.get('esgotadas') !== 'nao',
    tamanho: um(TAMANHOS, p.get('tamanho'), 'todos'),
    precoMax: Number.isFinite(preco) && preco > 0 ? preco : null,
    ordem: um(ORDENS, p.get('ordem'), 'destaques'),
    q: (p.get('q') ?? '').slice(0, 60),
  }
}

/** Filtros → "?universo=anime" (só o que difere do padrão; vazio quando nada mudou). */
export function escreverFiltros(f: Filtros): string {
  const p = new URLSearchParams()
  if (f.universo !== 'todos') p.set('universo', f.universo)
  if (f.disponibilidade !== 'todas') p.set('disponibilidade', f.disponibilidade)
  if (!f.esgotadas) p.set('esgotadas', 'nao')
  if (f.tamanho !== 'todos') p.set('tamanho', f.tamanho)
  if (f.precoMax) p.set('preco', String(f.precoMax))
  if (f.ordem !== 'destaques') p.set('ordem', f.ordem)
  if (f.q.trim()) p.set('q', f.q.trim())
  const texto = p.toString()
  return texto ? `?${texto}` : ''
}

/** Quantos filtros (fora a ordenação) estão ativos: vai no botão "Filtrar (2)" do celular. */
export function contarAtivos(f: Filtros): number {
  return [
    f.universo !== 'todos',
    f.disponibilidade !== 'todas',
    !f.esgotadas,
    f.tamanho !== 'todos',
    f.precoMax !== null,
    f.q.trim() !== '',
  ].filter(Boolean).length
}

export function tamanhoDe(alturaCm: number): Exclude<Tamanho, 'todos'> {
  return alturaCm <= 18 ? 'p' : alturaCm <= 25 ? 'm' : 'g'
}

const semAcento = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const PRONTA: Status[] = ['disponivel', 'ultimas']

export function filtrar(lista: Figure[], f: Filtros, nomesUniverso: Record<string, string> = {}): Figure[] {
  const q = semAcento(f.q.trim())
  return lista.filter(
    (fig) =>
      (f.universo === 'todos' || fig.universe === f.universo) &&
      (f.disponibilidade === 'todas' ||
        (f.disponibilidade === 'pronta' ? PRONTA.includes(fig.status) : fig.status === 'encomenda')) &&
      (f.esgotadas || fig.status !== 'esgotado') &&
      (f.tamanho === 'todos' || tamanhoDe(fig.heightCm) === f.tamanho) &&
      (f.precoMax === null || fig.price <= f.precoMax) &&
      (!q || semAcento(`${fig.name} ${nomesUniverso[fig.universe] ?? fig.universe}`).includes(q)),
  )
}

// Na ordem "Destaques": quem dá pra comprar agora vem antes, esgotada sempre por último
const PESO_STATUS: Record<Status, number> = { disponivel: 0, ultimas: 0, encomenda: 1, esgotado: 2 }

export function ordenar(lista: Figure[], ordem: Ordem): Figure[] {
  const copia = [...lista]
  const esgotadaPorUltimo = (a: Figure, b: Figure) =>
    Number(a.status === 'esgotado') - Number(b.status === 'esgotado')
  const novidade = (a: Figure, b: Figure) => b.addedAt.localeCompare(a.addedAt)
  switch (ordem) {
    case 'menor':
      return copia.sort((a, b) => esgotadaPorUltimo(a, b) || a.price - b.price)
    case 'maior':
      return copia.sort((a, b) => esgotadaPorUltimo(a, b) || b.price - a.price)
    case 'novidades':
      return copia.sort((a, b) => esgotadaPorUltimo(a, b) || novidade(a, b))
    case 'altura':
      return copia.sort((a, b) => esgotadaPorUltimo(a, b) || b.heightCm - a.heightCm)
    default:
      return copia.sort(
        (a, b) =>
          PESO_STATUS[a.status] - PESO_STATUS[b.status] ||
          Number(b.featured) - Number(a.featured) ||
          novidade(a, b),
      )
  }
}

/** Relacionadas: mesmo universo; se não houver outra, as demais da estante. Até 4. */
export function relacionadas(lista: Figure[], atual: Figure, limite = 4): { mesmoUniverso: boolean; figuras: Figure[] } {
  const outras = ordenar(
    lista.filter((f) => f.slug !== atual.slug),
    'destaques',
  )
  const mesmas = outras.filter((f) => f.universe === atual.universe)
  return mesmas.length
    ? { mesmoUniverso: true, figuras: mesmas.slice(0, limite) }
    : { mesmoUniverso: false, figuras: outras.slice(0, limite) }
}
