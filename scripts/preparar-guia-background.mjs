import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const manifestPath = join(root, 'media/manifesto-background.json')
const m = JSON.parse(readFileSync(manifestPath, 'utf8'))
if (!m.result_url) throw new Error('Aguardar o resultado da geração antes de executar.')
const original = join(root, m.file)
mkdirSync(dirname(original), { recursive: true })
if (!existsSync(original)) {
  const r = await fetch(m.result_url)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  writeFileSync(original, Buffer.from(await r.arrayBuffer()))
}
const meta = await sharp(original).metadata()
m.width = meta.width
m.height = meta.height
const webp = await sharp(original).webp({ quality: 85 }).toBuffer()
writeFileSync(join(root, 'media/background-guia.webp'), webp)
m.preview = 'media/background-guia.webp'
m.bytes = webp.length
writeFileSync(manifestPath, JSON.stringify(m, null, 2) + '\n')
const preview = await sharp(original).resize({ width: 1200 }).webp({ quality: 80 }).toBuffer()
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
writeFileSync(join(root, 'media/inventario-background.html'), `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TAMAGO · Guia do background</title><style>body{margin:0;padding:32px;background:#0b0c1f;color:#ece8fa;font:16px/1.6 system-ui}main{max-width:1200px;margin:auto}img{width:100%;height:auto;border-radius:20px}p,li{color:#a9a6d6}details{border:1px solid #2e3272;padding:20px;border-radius:20px;overflow-wrap:anywhere}h2,summary{color:#63e2df}</style><main><h1>Guia visual do background TAMAGO</h1><p>Imagem de direção de arte para um fundo animado. Image 2.5 Sunburst · ${m.width} × ${m.height} · WebP ${Math.round(webp.length / 1024)} KB · custo aprovado: 0,5 crédito.</p><img src="data:image/webp;base64,${preview.toString('base64')}" width="${m.width}" height="${m.height}" alt="Céu de fantasia índigo com nebulosas azul e lavanda, estrelas, cristais e runas nas bordas."><h2>Camadas para a animação</h2><ul><li>Céu distante fixo, escuro e com baixo contraste.</li><li>Nebulosas com deriva muito lenta e brilho suave.</li><li>Estrelas cintilando em ritmos variados.</li><li>Runas e órbitas com pulsação discreta ao redor do portal.</li><li>Cristais flutuando suavemente nas bordas.</li><li>Montanhas em profundidade, com transição para o fundo da página.</li></ul><p>Preservar as áreas de leitura e a preferência por menos movimento. A imagem é um guia; a animação será construída em camadas.</p><details><summary>Prompt e origem</summary><p>${esc(m.params.prompt)}</p><p>Job: ${m.job_id}</p><p>${esc(m.result_url)}</p></details></main></html>`)
console.log(`Guia salvo: ${m.width}×${m.height}; WebP ${webp.length} bytes.`)
