import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const manifestPath = join(root, 'media/manifesto-mascote.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const sitePath = join(root, 'src/data/site.json')
const site = JSON.parse(readFileSync(sitePath, 'utf8'))

for (const item of manifest.images) {
  const original = join(root, 'media/originais', item.file)
  mkdirSync(dirname(original), { recursive: true })
  if (!existsSync(original)) {
    const response = await fetch(item.result_url)
    if (!response.ok) throw new Error(`Download ${item.slug}: HTTP ${response.status}`)
    writeFileSync(original, Buffer.from(await response.arrayBuffer()))
  }
  const meta = await sharp(original).metadata()
  item.width = meta.width
  item.height = meta.height
  item.hasAlpha = meta.hasAlpha ?? false
  item.variants = []
  for (const width of [480, 800, 1200]) {
    for (const format of ['avif', 'webp']) {
      const path = join(root, 'public', `${item.src}-${width}.${format}`)
      mkdirSync(dirname(path), { recursive: true })
      const bytes = await sharp(original).rotate().resize({ width }).toFormat(format, { quality: format === 'avif' ? 55 : 80, effort: 4 }).toBuffer()
      writeFileSync(path, bytes)
      item.variants.push({ path: `${item.src}-${width}.${format}`, bytes: bytes.length })
    }
  }
  console.log(`${item.slug}: ${meta.width}×${meta.height}, alpha=${item.hasAlpha}`)
}

const image = (slug) => {
  const i = manifest.images.find((x) => x.slug === slug)
  return { src: i.src, alt: i.alt, w: i.width, h: i.height }
}
site.mascot = { atelier: image('atelier'), welcome: image('boas-vindas'), note: 'Um pouco de magia. Muito trabalho no pincel.' }
// A abertura e os metadados usam a mesma cena; não baixar uma segunda imagem para o hero.
if (site.hero.media.type !== 'video') site.hero.media = { type: 'image', image: site.mascot.atelier }
writeFileSync(sitePath, JSON.stringify(site, null, 2) + '\n')
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const cards = manifest.images.map((i) => {
  const b64 = readFileSync(join(root, 'public', `${i.src}-480.webp`)).toString('base64')
  return `<article><img src="data:image/webp;base64,${b64}" alt="${escape(i.alt)}" width="${i.width}" height="${i.height}"><div><h2>${escape(i.name)}</h2><p>${escape(i.role)} · ${i.width} × ${i.height} · ${i.hasAlpha ? 'Transparência preservada' : 'Fundo opaco'}</p><p>Image 2.5 Sunburst · ilustração da marca</p><details><summary>Prompt e geração</summary><p>${escape(i.job_id)}</p><p>${escape(i.prompt)}</p></details></div></article>`
}).join('')
writeFileSync(join(root, 'media/inventario-mascote.html'), `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TAMAGO · Mascote e runas</title><style>*{box-sizing:border-box}body{margin:0;padding:32px;background:#0b0c1f;color:#ece8fa;font:16px/1.6 system-ui}main{max-width:1200px;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}article{background:#13153a;border:1px solid #2e3272;border-radius:24px;overflow:hidden}img{width:100%;height:380px;object-fit:contain;background:radial-gradient(ellipse,#262a6b,transparent)}article div{padding:24px}h2{font-size:22px}p{color:#a9a6d6}details{font-size:13px}summary{color:#63e2df;cursor:pointer}</style><main><h1>O dragão da TAMAGO</h1><p>Identidade derivada das duas referências enviadas. Cena do ateliê na abertura; pose de boas-vindas em Como pedir e no convite final. Runas implementadas em HTML e CSS.</p><section class="grid">${cards}</section></main></html>`)
