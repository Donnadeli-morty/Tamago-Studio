import figuresJson from '../data/figures.json'
import siteJson from '../data/site.json'
import type { Figure, Site, Status } from './schema'

// Os JSONs são validados pelo schema (Zod) no `pnpm dev`, no `pnpm build` e nos
// testes: um JSON editado errado derruba o build com o caminho exato do erro.
// Por isso o navegador recebe os dados já confiáveis, sem carregar o Zod inteiro.
export const figures = figuresJson as unknown as Figure[]
export const site = siteJson as unknown as Site

/** Troca {chave} por valores: preencher('Restam {n}', { n: 2 }) → "Restam 2" */
export function preencher(modelo: string, valores: Record<string, string | number>): string {
  return modelo.replace(/\{(\w+)\}/g, (trecho, chave: string) =>
    chave in valores ? String(valores[chave]) : trecho,
  )
}

const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

/** 690 → "R$ 690" (sem centavos: preço de figure é sempre redondo) */
export function formatarPreco(valor: number): string {
  // O Intl usa espaço inquebrável entre "R$" e o número; trocamos por espaço comum
  // para o texto ser igual no servidor, no navegador e na mensagem do WhatsApp.
  return reais.format(valor).replace(/\u00a0/g, ' ')
}

export const PRONTA_ENTREGA: readonly Status[] = ['disponivel', 'ultimas']

export function ehProntaEntrega(f: Figure): boolean {
  return PRONTA_ENTREGA.includes(f.status)
}

/** Unidades prontas para envio, para o contador do hero ("escassez real"). */
export function contarProntas(lista: Figure[]): number {
  return lista.filter(ehProntaEntrega).reduce((total, f) => total + (f.stock ?? 1), 0)
}
