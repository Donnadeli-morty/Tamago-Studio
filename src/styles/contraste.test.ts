/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Lido do disco (e não via import ?raw): o plugin do Tailwind transformaria o @theme
const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8')

// Dois temas: o @theme é o DIA; o bloco .tema-noite redefine parte das cores.
// A noite herda do dia o que não redefine (como no navegador).
const bloco = (abertura: string) => {
  const ini = css.indexOf(abertura)
  if (ini < 0) throw new Error(`bloco ${abertura} não encontrado`)
  return css.slice(ini, css.indexOf('}', ini))
}
const ler = (trecho: string) =>
  Object.fromEntries([...trecho.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]))
const dia = ler(bloco('@theme'))
const temas = { dia, noite: { ...dia, ...ler(bloco('.tema-noite')) } }

const luminancia = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contraste = (a: string, b: string) => {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

// [texto, fundo, mínimo]  4.5 = texto comum · 3 = texto grande (24px+) ou componente de UI
const pares: [string, string, number][] = [
  ['texto', 'fundo', 4.5],
  ['texto', 'superficie-2', 4.5],
  ['texto-suave', 'fundo', 4.5],
  ['texto-suave', 'superficie', 4.5],
  ['sobre-acento', 'acento', 4.5],
  ['acento', 'fundo', 4.5],
  ['acento', 'superficie', 4.5],
  ['lavanda', 'fundo', 4.5],
  ['lilas', 'fundo', 3], // só na nota a giz, sempre 24px+
  ['brasa', 'fundo', 4.5],
  ['tinta', 'papel', 4.5],
  ['tinta-suave', 'papel', 4.5],
  ['status-disponivel', 'superficie', 4.5],
  ['status-ultimas', 'superficie', 4.5],
  ['status-encomenda', 'superficie', 4.5],
  ['status-esgotado', 'superficie', 4.5],
  ['linha', 'fundo', 1.4], // borda decorativa: só precisa ser percebida
]

describe.each(Object.entries(temas))('contraste dos tokens no tema %s (WCAG AA)', (_nome, cores) => {
  it.each(pares)('%s sobre %s ≥ %s', (a, b, minimo) => {
    expect(cores[a], `token --color-${a}`).toBeDefined()
    expect(cores[b], `token --color-${b}`).toBeDefined()
    expect(contraste(cores[a], cores[b])).toBeGreaterThanOrEqual(minimo)
  })
})
