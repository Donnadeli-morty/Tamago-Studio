// Aplica apenas os resultados registrados no manifesto deste projeto.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const manifest = JSON.parse(readFileSync(join(root, 'media/manifesto-geradas.json'), 'utf8'))
const figuresPath = join(root, 'src/data/figures.json')
const sitePath = join(root, 'src/data/site.json')
const figures = JSON.parse(readFileSync(figuresPath, 'utf8'))
const site = JSON.parse(readFileSync(sitePath, 'utf8'))
const backup = join(root, 'media/antes-image-2.5')
mkdirSync(backup, { recursive: true })
for (const path of [figuresPath, sitePath]) {
  const dest = join(backup, path.endsWith('figures.json') ? 'figures.json' : 'site.json')
  if (!existsSync(dest)) copyFileSync(path, dest)
}

for (const item of manifest.images) {
  const original = join(root, 'media/originais', item.file)
  mkdirSync(dirname(original), { recursive: true })
  if (!existsSync(original)) {
    const response = await fetch(item.result_url)
    if (!response.ok) throw new Error(`Falha ao baixar ${item.slug}: ${response.status}`)
    writeFileSync(original, Buffer.from(await response.arrayBuffer()))
  }
  const meta = await sharp(original).metadata()
  item.width = meta.width
  item.height = meta.height
  item.variants = []
  for (const width of [480, 800, 1200]) {
    for (const format of ['avif', 'webp']) {
      const path = join(root, 'public', `${item.src}-${width}.${format}`)
      mkdirSync(dirname(path), { recursive: true })
      const output = await sharp(original).rotate().resize({ width }).toFormat(format, { quality: format === 'avif' ? 52 : 76, effort: 4 }).toBuffer()
      writeFileSync(path, output)
      item.variants.push({ path: `${item.src}-${width}.${format}`, bytes: output.length })
    }
  }
  const image = { src: item.src, alt: item.alt, w: meta.width, h: meta.height }
  if (item.slug === 'hero') {
    if (!site.mascot) site.hero.media = { type: 'image', image }
  }
  else {
    const figure = figures.find((f) => f.slug === item.slug)
    if (!figure) throw new Error(`Figure desconhecida: ${item.slug}`)
    // As outras vistas anteriores estão no backup; não representam a nova escultura.
    figure.images = [image]
  }
  console.log(`${item.slug}: ${meta.width}×${meta.height}`)
}

writeFileSync(figuresPath, JSON.stringify(figures, null, 2) + '\n')
writeFileSync(sitePath, JSON.stringify(site, null, 2) + '\n')
writeFileSync(join(root, 'media/manifesto-geradas.json'), JSON.stringify(manifest, null, 2) + '\n')
// O empacotador deve preservar os novos originais, que não podem ser recriados pelo script de placeholders.
rmSync(join(root, 'media/originais/.provisorio'), { force: true })

const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const cards = manifest.images.map((i) => {
  const img = readFileSync(join(root, 'public', `${i.src}-480.webp`)).toString('base64')
  const bytes = i.variants.find((v) => v.path.endsWith('-800.webp')).bytes
  return `<article><img src="data:image/webp;base64,${img}" alt="${escape(i.alt)}" width="${i.width}" height="${i.height}"><div><h2>${escape(i.name)}</h2><p>${escape(i.role)} · ${i.width} × ${i.height} · WebP 800: ${(bytes / 1024).toFixed(1)} KB</p><p>Modelo: ${escape(manifest.model)} · imagem ilustrativa gerada</p><code>${escape(i.src)}</code><details><summary>Prompt e rastreabilidade</summary><p>Job: ${escape(i.job_id)}</p><p>${escape(i.prompt)}</p></details></div></article>`
}).join('')
writeFileSync(join(root, 'media/inventario.html'), `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TAMAGO · Inventário de imagens</title><style>*{box-sizing:border-box}body{margin:0;padding:32px;background:#0b0c1f;color:#ece8fa;font:16px/1.6 system-ui}main{max-width:1300px;margin:auto}h1{font-size:32px}header p{color:#a9a6d6}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px}article{overflow:hidden;border:1px solid #2e3272;border-radius:20px;background:#13153a}img{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:contain}article div{padding:20px}h2{font-size:19px;margin:0}article p{font-size:13px;color:#a9a6d6}code{font-size:11px;overflow-wrap:anywhere}details{margin-top:14px;font-size:13px}summary{cursor:pointer;color:#63e2df}</style><main><header><h1>TAMAGO · Imagens aplicadas</h1><p>Nove imagens ilustrativas geradas com Image 2.5. Oito figures fictícias e a abertura baseada no Ronin. Mascote aguardando referência.</p></header><section class="grid">${cards}</section></main></html>`)
