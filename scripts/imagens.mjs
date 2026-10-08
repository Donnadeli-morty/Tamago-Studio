// Converte as fotos de media/originais/ em AVIF + WebP nas larguras do site
// (480, 800, 1200), espelhando as pastas em public/img/ (spec §6.1).
//
//   media/originais/obras/ronin-do-crepusculo-frente.jpg
//   → public/img/obras/ronin-do-crepusculo-frente-480.avif / -800.avif / -1200.avif (+ .webp)
//
// No JSON, o "src" fica sem largura e sem extensão: "/img/obras/ronin-do-crepusculo-frente".
// Só reprocessa o que mudou. Use --force para refazer tudo.
import { mkdirSync, readdirSync, statSync, existsSync } from 'node:fs'
import { dirname, join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const ORIGEM = join(raiz, 'media/originais')
const DESTINO = join(raiz, 'public/img')
const LARGURAS = [480, 800, 1200]
const forcar = process.argv.includes('--force')

function listar(pasta) {
  if (!existsSync(pasta)) return []
  return readdirSync(pasta).flatMap((nome) => {
    const p = join(pasta, nome)
    return statSync(p).isDirectory() ? listar(p) : /\.(jpe?g|png|webp|tiff?)$/i.test(nome) ? [p] : []
  })
}

const arquivos = listar(ORIGEM)
if (!arquivos.length) {
  console.log('Nada em media/originais/. Coloque as fotos lá (ou rode `pnpm placeholders`).')
  process.exit(0)
}

let total = 0
for (const arquivo of arquivos) {
  const rel = relative(ORIGEM, arquivo).replace(/\\/g, '/')
  const base = join(DESTINO, rel.slice(0, -extname(rel).length))
  const modOrigem = statSync(arquivo).mtimeMs
  const meta = await sharp(arquivo).metadata()

  for (const w of LARGURAS) {
    for (const [ext, opcoes] of [
      ['avif', { quality: 52, effort: 5 }],
      ['webp', { quality: 74, effort: 5 }],
    ]) {
      const saida = `${base}-${w}.${ext}`
      if (!forcar && existsSync(saida) && statSync(saida).mtimeMs > modOrigem) continue
      mkdirSync(dirname(saida), { recursive: true })
      await sharp(arquivo).rotate().resize({ width: w }).toFormat(ext, opcoes).toFile(saida)
      total++
    }
  }
  // Ajuda a preencher w/h no JSON quando a foto real chegar
  console.log(`${rel.padEnd(52)} ${meta.width}×${meta.height}`)
}
console.log(`\nimagens: ${total} arquivos gerados em public/img/`)
