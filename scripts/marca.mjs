// Gera os arquivos da logo a partir de media/marca/logo-original.webp (arte enviada pelo cliente).
// "Cor para alpha": o fundo de linho quase branco vira transparência e cada pixel mantém a cor
// que teria sobre o branco, então a logo assenta em qualquer fundo claro sem caixa em volta.
// Saída em public/img/marca/: ovo (emblema), palavra (TAMAGO + chama), lockup e favicon.
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const origem = join(raiz, 'media/marca/logo-original.webp')
const destino = join(raiz, 'public/img/marca')
mkdirSync(destino, { recursive: true })

const { data, info } = await sharp(origem).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const rgba = Buffer.alloc(W * H * 4)
const BRANCO = 247 // tom do linho nos cantos da arte
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const c = [data[i], data[i + 1], data[i + 2]]
  // alfa = quanto o pixel se afasta do branco do papel (textura fina do linho fica transparente)
  let a = Math.max(...c.map((v) => Math.max(0, BRANCO - v) / BRANCO))
  a = Math.min(1, Math.max(0, (a - 0.035) / 0.965))
  for (let k = 0; k < 3; k++) rgba[j + k] = a > 0 ? Math.round(Math.min(255, Math.max(0, (c[k] - (1 - a) * 255) / a))) : 0
  rgba[j + 3] = Math.round(a * 255)
}
const base = () => sharp(rgba, { raw: { width: W, height: H, channels: 4 } })

// Caixas medidas na arte de 2000 × 1116
const cortes = {
  ovo: { left: 740, top: 40, width: 560, height: 680 },
  palavra: { left: 555, top: 742, width: 890, height: 170 },
  lockup: { left: 540, top: 40, width: 920, height: 990 },
}
for (const [nome, caixa] of Object.entries(cortes)) {
  const recorte = await base().extract(caixa).png().toBuffer()
  const aparado = await sharp(recorte).trim({ threshold: 1 }).png().toBuffer()
  for (const w of [240, 480, 960]) {
    const img = sharp(aparado).resize({ width: w, withoutEnlargement: true })
    await img.clone().webp({ quality: 88, alphaQuality: 90 }).toFile(join(destino, `${nome}-${w}.webp`))
    await img.clone().avif({ quality: 60 }).toFile(join(destino, `${nome}-${w}.avif`))
  }
  const m = await sharp(aparado).metadata()
  console.log(nome.padEnd(8), m.width, '×', m.height)
}
// Favicon: o ovo num quadrado de linho (fica legível nas abas claras e escuras)
const ovo = await base().extract(cortes.ovo).png().toBuffer()
const ovoAparado = await sharp(ovo).trim({ threshold: 1 }).resize({ height: 54 }).png().toBuffer()
await sharp({ create: { width: 64, height: 64, channels: 4, background: '#f7eef1' } })
  .composite([{ input: ovoAparado, gravity: 'center' }])
  .png()
  .toFile(join(raiz, 'public/favicon.png'))
console.log('favicon.png ok')
