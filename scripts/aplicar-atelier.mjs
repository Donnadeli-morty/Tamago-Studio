import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const manifestPath = join(root, 'media/manifesto-atelier.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const sitePath = join(root, 'src/data/site.json')
const site = JSON.parse(readFileSync(sitePath, 'utf8'))

async function download(item) {
  const path = join(root, 'media/originais', item.file)
  mkdirSync(dirname(path), { recursive: true })
  if (!existsSync(path)) {
    const response = await fetch(item.result_url)
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${item.slug ?? 'video'}`)
    writeFileSync(path, Buffer.from(await response.arrayBuffer()))
  }
  return path
}

for (const item of manifest.images) {
  const original = await download(item)
  // A régua mede o objeto, removendo só a margem transparente da imagem gerada.
  const normalized = item.role === 'scale' ? await sharp(original).trim({ threshold: 5 }).png().toBuffer() : readFileSync(original)
  const meta = await sharp(normalized).metadata()
  item.width = meta.width
  item.height = meta.height
  item.variants = []
  for (const width of [480, 800, 1200]) {
    for (const format of ['avif', 'webp']) {
      const dest = join(root, 'public', `${item.src}-${width}.${format}`)
      mkdirSync(dirname(dest), { recursive: true })
      const bytes = await sharp(normalized).resize({ width }).toFormat(format, { quality: format === 'avif' ? 50 : 78, effort: 4 }).toBuffer()
      writeFileSync(dest, bytes)
      item.variants.push({ path: `${item.src}-${width}.${format}`, bytes: bytes.length })
    }
  }
  const image = { src: item.src, alt: item.alt, w: item.width, h: item.height }
  if (item.role.startsWith('process')) site.process.steps[Number(item.role.slice(-1))].image = image
  if (item.role === 'macro') site.detail.macro = image
  if (item.role === 'base') site.detail.base = image
  if (item.role === 'scale') site.detail.scaleImage = image
  console.log(`${item.slug}: ${item.width}×${item.height}`)
}
await download(manifest.video)
if (existsSync(join(root, 'public', manifest.video.src))) {
  site.hero.media = { type: 'video', poster: site.mascot.atelier, sources: [{ src: manifest.video.src, type: 'video/mp4' }] }
  manifest.video.bytes = statSync(join(root, 'public', manifest.video.src)).size
}
site.detail.intro = 'Pintura, textura e acabamento, vistos de perto.'
site.detail.macroCaption = 'Detalhes de pintura e textura em uma figure fictícia.'
site.detail.scaleCaption = 'Comparação ilustrativa: {cm} cm de altura. A garrafa de 600 ml é uma referência aproximada.'
site.detail.baseTextTop = 73
writeFileSync(sitePath, JSON.stringify(site, null, 2) + '\n')
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const cards = manifest.images.map((i) => `<article><img src="data:image/webp;base64,${readFileSync(join(root, 'public', `${i.src}-480.webp`)).toString('base64')}" width="${i.width}" height="${i.height}" alt="${esc(i.alt)}"><h2>${esc(i.name)}</h2><p>${i.width} × ${i.height} · Sunburst · ${i.variants.find(v => v.path.endsWith('480.webp')).bytes} bytes</p><details><summary>Prompt e geração</summary><p>${esc(i.prompt)}</p><p>${i.job_id}</p></details></article>`).join('')
const videoPath = join(root, 'public', manifest.video.src)
const video = existsSync(videoPath) ? `<article><video muted playsinline loop controls src="data:video/mp4;base64,${readFileSync(videoPath).toString('base64')}"></video><h2>Dragão pintando — portal da hero</h2><p>${esc(manifest.video.model)} · ${manifest.video.params.duration} segundos · ${manifest.video.bytes} bytes</p><details><summary>Prompt</summary><p>${esc(manifest.video.params.prompt)}</p></details></article>` : ''
writeFileSync(join(root, 'media/inventario-atelier.html'), `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TAMAGO · Ateliê e portal</title><style>body{margin:0;padding:32px;background:#0b0c1f;color:#ece8fa;font:16px/1.6 system-ui}main{max-width:1200px;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}article{padding:20px;background:#13153a;border:1px solid #2e3272;border-radius:24px}img,video{width:100%;height:320px;object-fit:contain}p{color:#a9a6d6}details{font-size:13px;overflow-wrap:anywhere}</style><main><h1>Do ateliê à estante</h1><p>1 vídeo e 6 imagens fictícias. Lote inicial aprovado: 9 créditos. Segunda versão expressiva: 42 créditos adicionais, autorizados. As imagens ilustram o processo e não documentam uma produção real. O vídeo reproduz em loop por solicitação do usuário, com pausa e redução de movimento no site.</p><section class="grid">${video}${cards}</section></main></html>`)
