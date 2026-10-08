// Pré-renderiza a loja no build: um HTML por página, com o conteúdo do React já dentro.
//
//   dist/index.html                    vitrine (home)
//   dist/figures/index.html            catálogo
//   dist/figures/<slug>/index.html     uma página por figure
//   dist/404.html                      figure/link inexistente (a Hostinger serve via .htaccess)
//   dist/sitemap.xml                   todas as páginas indexáveis
//
// Cada página ganha título, descrição, canonical e Open Graph próprios, e a figure leva
// dados estruturados de produto (preço e disponibilidade) para o Google. Funciona em
// hospedagem estática sem nenhuma regra de reescrita: cada endereço é um arquivo.
// Roda depois do `vite build` (ver "build" no package.json).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const dist = join(raiz, 'dist')
const saidaSsr = join(raiz, 'node_modules/.prerender')

await build({
  root: raiz,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: saidaSsr, emptyOutDir: true, copyPublicDir: false },
})
const { render, caminhosEstaticos } = await import(pathToFileURL(join(saidaSsr, 'entry-server.js')).href)

const modelo = readFileSync(join(dist, 'index.html'), 'utf8')
const marcador = '<div id="root"></div>'
if (!modelo.includes(marcador)) throw new Error('dist/index.html sem <div id="root"></div>: build já pré-renderizado?')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
// JSON-LD dentro de <script>: "<" escapado para nenhum texto do catálogo fechar a tag
const jsonSeguro = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c')

function pagina(caminho, ehHome) {
  const { html, meta } = render(caminho)
  let doc = modelo.replace(marcador, `<div id="root">${html}</div>`)
  // Preload da imagem do hero: só a home precisa
  if (!ehHome) doc = doc.replace(/\s*<link\s+data-so-home[\s\S]*?\/>/g, '')
  else doc = doc.replace(/\sdata-so-home/g, '')
  doc = doc
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.titulo)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(meta.descricao)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(meta.titulo)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(meta.descricao)}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${esc(meta.imagem)}$2`)
  const extras = [
    `<link rel="canonical" href="${esc(meta.canonico)}" />`,
    `<meta property="og:url" content="${esc(meta.canonico)}" />`,
    meta.indexar ? '' : '<meta name="robots" content="noindex" />',
    meta.jsonLd ? `<script type="application/ld+json">${jsonSeguro(meta.jsonLd)}</script>` : '',
  ].filter(Boolean)
  return { doc: doc.replace('</head>', `    ${extras.join('\n    ')}\n  </head>`), meta, tamanho: html.length }
}

const urls = []
for (const caminho of caminhosEstaticos()) {
  const { doc, meta, tamanho } = pagina(caminho, caminho === '/')
  const arquivo = join(dist, caminho, 'index.html')
  mkdirSync(dirname(arquivo), { recursive: true })
  writeFileSync(arquivo, doc)
  if (meta.indexar) urls.push(meta.canonico)
  console.log(`prerender: ${caminho.padEnd(34)} ${(tamanho / 1024).toFixed(1)} KB`)
}

writeFileSync(join(dist, '404.html'), pagina('/404/', false).doc)

const hoje = new Date().toISOString().slice(0, 10)
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${esc(u)}</loc><lastmod>${hoje}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
)
rmSync(saidaSsr, { recursive: true, force: true })
console.log(`prerender: ${urls.length} páginas no sitemap + 404.html`)
