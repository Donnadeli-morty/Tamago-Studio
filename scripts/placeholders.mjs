// Gera FOTOS PROVISÓRIAS para todos os caminhos de imagem citados nos JSONs.
// Cada uma é uma cena de estúdio em SVG (silhueta de figure sobre base),
// rotulada "FOTO PROVISÓRIA", salva em media/originais/ como PNG.
// Depois rode `pnpm imagens` para gerar os AVIF/WebP em public/img/.
//
// Uso: pnpm placeholders            (só cria o que falta)
//      pnpm placeholders --force    (recria tudo)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = fileURLToPath(new URL('..', import.meta.url))
if (existsSync(join(raiz, 'media/manifesto-geradas.json')) && process.argv.includes('--force')) {
  throw new Error('Há imagens geradas por IA neste projeto. --force sobrescreveria os originais; remova essa opção.')
}
const ler = (p) => JSON.parse(readFileSync(join(raiz, p), 'utf8'))
const figures = ler('src/data/figures.json')
const site = ler('src/data/site.json')
const forcar = process.argv.includes('--force')

// Coleta toda imagem {src, w, h} dentro de um objeto qualquer
function coletar(obj, lista = []) {
  if (Array.isArray(obj)) obj.forEach((x) => coletar(x, lista))
  else if (obj && typeof obj === 'object') {
    if (typeof obj.src === 'string' && obj.w && obj.h && obj.src.startsWith('/img/')) lista.push(obj)
    else Object.values(obj).forEach((x) => coletar(x, lista))
  }
  return lista
}

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

/** Desenha a figure no "mundo" 1000×1250. */
function figura({ matiz, acessorio, cinza = false, meio = false, gravar = false }) {
  const c = (h, s, l) => (cinza ? `hsl(30 3% ${Math.min(l + 18, 70)}%)` : `hsl(${h} ${s}% ${l}%)`)
  const h2 = (matiz + 40) % 360
  const h3 = (matiz + 180) % 360

  const acessorios = [
    // espada
    `<g filter="url(#brilho)"><path d="M612 590 L790 238 L806 246 L630 598Z" fill="${c(210, 15, 82)}"/></g>
     <rect x="596" y="584" width="58" height="14" rx="6" transform="rotate(-27 625 591)" fill="${c(h2, 60, 45)}"/>`,
    // cajado com orbe
    `<path d="M352 960 L338 300" stroke="${c(28, 40, 30)}" stroke-width="16" stroke-linecap="round"/>
     <circle cx="338" cy="276" r="38" fill="${c(h3, 85, 62)}" filter="url(#brilho)"/>`,
    // asas
    `<path d="M440 520 C300 380 180 420 120 300 C200 520 260 640 420 650Z" fill="${c(matiz, 30, 26)}" opacity=".95"/>
     <path d="M560 520 C700 380 820 420 880 300 C800 520 740 640 580 650Z" fill="${c(matiz, 30, 26)}" opacity=".95"/>`,
    // cauda de raposa
    `<path d="M610 930 C760 900 860 760 800 560 C780 700 700 800 600 840Z" fill="${c(24, 80, 55)}"/>
     <path d="M800 560 C820 620 815 660 790 700 C770 640 780 600 800 560Z" fill="${c(40, 30, 92)}"/>`,
  ][acessorio]

  const cabelo = [
    `<path d="M420 380 L500 300 L580 380 L560 350 L500 320 L440 350Z" fill="${c(matiz, 20, 18)}"/><path d="M380 372 L620 372 L500 318Z" fill="${c(35, 35, 40)}"/>`,
    `<path d="M430 400 C420 300 580 300 570 400 C600 470 590 520 575 560 L560 420 C540 380 460 380 440 420 L425 560 C410 520 400 470 430 400Z" fill="${c(h3, 55, 70)}"/>`,
    `<path d="M440 360 L470 300 L500 345 L530 300 L560 360Z" fill="${c(h2, 40, 50)}"/><rect x="432" y="360" width="136" height="22" rx="8" fill="${c(matiz, 15, 30)}"/>`,
    `<path d="M440 360 L455 290 L490 345Z M560 360 L545 290 L510 345Z" fill="${c(24, 80, 55)}"/>`,
  ][acessorio]

  const corpo = `
    ${acessorio === 2 ? acessorios : ''}
    <path d="M430 470 C380 520 350 700 318 992 L682 992 C650 700 620 520 570 470Z" fill="url(#manto)"/>
    <path d="M430 470 C380 520 350 700 318 992" stroke="#fff" stroke-opacity=".22" stroke-width="5" fill="none"/>
    <rect x="398" y="650" width="204" height="24" rx="6" fill="${c(h2, 55, 48)}"/>
    <ellipse cx="500" cy="482" rx="98" ry="32" fill="${c(matiz, 35, 30)}"/>
    <path d="M410 500 C370 560 360 640 380 700" stroke="${c(matiz, 35, 30)}" stroke-width="34" stroke-linecap="round" fill="none"/>
    <path d="M590 500 C630 540 640 580 625 600" stroke="${c(matiz, 35, 30)}" stroke-width="34" stroke-linecap="round" fill="none"/>
    <circle cx="500" cy="398" r="68" fill="${c(28, 45, 76)}"/>
    <ellipse cx="476" cy="404" rx="8" ry="11" fill="${c(matiz, 30, 14)}"/><ellipse cx="524" cy="404" rx="8" ry="11" fill="${c(matiz, 30, 14)}"/>
    <circle cx="479" cy="400" r="2.6" fill="#fff" opacity=".85"/><circle cx="527" cy="400" r="2.6" fill="#fff" opacity=".85"/>
    ${cabelo}
    ${acessorio !== 2 ? acessorios : ''}`

  return `
    <ellipse cx="500" cy="1090" rx="320" ry="44" fill="#000" opacity=".55" filter="url(#borrar)"/>
    <rect x="270" y="1000" width="460" height="78" fill="url(#pedestal)"/>
    <ellipse cx="500" cy="1078" rx="230" ry="40" fill="#0b0a09"/>
    <ellipse cx="500" cy="1000" rx="230" ry="42" fill="#2b2824"/>
    <ellipse cx="500" cy="1000" rx="230" ry="42" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
    ${
      gravar
        ? `<text x="500" y="1040" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="22" fill="#d9bd85">Obrigado,</text>
           <text x="500" y="1064" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="15" fill="#d9bd85" opacity=".85">seu nome aqui</text>`
        : ''
    }
    ${
      meio
        ? `<g clip-path="url(#metadeEsq)">${corpo}</g><g clip-path="url(#metadeDir)" filter="url(#cinza)">${corpo}</g>
           <path d="M690 560 L760 470" stroke="#c9a46a" stroke-width="10" stroke-linecap="round"/><path d="M760 470 L790 430" stroke="#2a2a2a" stroke-width="14" stroke-linecap="round"/>`
        : `<g filter="url(#textura)">${corpo}</g>`
    }`
}

/** Monta a cena completa: fundo, câmera (foco + zoom) e rótulo. */
function cena({ W, H, matiz, acessorio, foco = [500, 700], zoom = 1, espelhar = false, cenario = 'estudio', rotulo, ...op }) {
  const s = (W * zoom) / 1000
  const tx = W / 2 - foco[0] * s
  const ty = H / 2 - foco[1] * s
  const espelho = espelhar ? `translate(${W} 0) scale(-1 1)` : ''
  const fundo =
    cenario === 'estante'
      ? `<rect width="${W}" height="${H}" fill="hsl(${(matiz + 20) % 360} 18% 16%)"/>
         <rect y="${H * 0.78}" width="${W}" height="${H * 0.22}" fill="#3a2a1d"/>
         <rect y="${H * 0.78}" width="${W}" height="8" fill="#5a412b"/>
         ${[0, 1, 2, 3, 4].map((i) => `<rect x="${W * 0.04 + i * 46}" y="${H * 0.36 + (i % 2) * 20}" width="38" height="${H * 0.42 - (i % 2) * 20}" fill="hsl(${(matiz + i * 50) % 360} 30% ${22 + i * 4}%)"/>`).join('')}`
      : `<rect width="${W}" height="${H}" fill="url(#fundo)"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="fundo" cx="55%" cy="38%" r="75%">
      <stop offset="0" stop-color="hsl(${matiz} 22% 22%)"/><stop offset=".55" stop-color="hsl(${matiz} 14% 10%)"/><stop offset="1" stop-color="#0c0b0a"/>
    </radialGradient>
    <linearGradient id="manto" x1="0" x2="1">
      <stop offset="0" stop-color="hsl(${matiz} 45% 22%)"/><stop offset=".55" stop-color="hsl(${matiz} 55% 40%)"/><stop offset="1" stop-color="hsl(${matiz} 45% 18%)"/>
    </linearGradient>
    <linearGradient id="pedestal" x1="0" x2="1">
      <stop offset="0" stop-color="#121110"/><stop offset=".5" stop-color="#2c2925"/><stop offset="1" stop-color="#0f0e0d"/>
    </linearGradient>
    <filter id="borrar"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="brilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="cinza"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".7" intercept=".25"/><feFuncG type="linear" slope=".7" intercept=".25"/><feFuncB type="linear" slope=".7" intercept=".25"/></feComponentTransfer></filter>
    <filter id="textura"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="${matiz}" result="r"/><feColorMatrix in="r" type="saturate" values="0" result="rg"/><feComposite in="rg" in2="SourceGraphic" operator="in" result="tx"/><feBlend in="SourceGraphic" in2="tx" mode="soft-light"/></filter>
    <clipPath id="metadeEsq"><rect x="0" y="0" width="500" height="1250"/></clipPath>
    <clipPath id="metadeDir"><rect x="500" y="0" width="500" height="1250"/></clipPath>
  </defs>
  ${fundo}
  <g transform="${espelho}"><g transform="translate(${tx} ${ty}) scale(${s})">${op.cinza ? `<g filter="url(#cinza)">${figura({ matiz, acessorio, ...op })}</g>` : figura({ matiz, acessorio, ...op })}</g></g>
  <g font-family="Segoe UI, Arial, sans-serif" fill="#f4efe7">
    <rect x="${W * 0.04}" y="${H - H * 0.04 - 46}" rx="18" width="${Math.max(220, rotulo.length * 9 + 40)}" height="40" fill="#000" fill-opacity=".45"/>
    <text x="${W * 0.04 + 18}" y="${H - H * 0.04 - 20}" font-size="15" letter-spacing="2" font-weight="700">FOTO PROVISÓRIA · <tspan font-weight="400" letter-spacing="0">${esc(rotulo)}</tspan></text>
  </g>
</svg>`
}

// Cenário para cada caminho de imagem
function receita(img) {
  const { src, w: W, h: H } = img
  const nome = src.split('/').pop()
  const fig = figures.find((f) => nome.startsWith(f.slug))
  const base = { W, H, matiz: hash(fig?.slug ?? nome) % 360, acessorio: hash(fig?.slug ?? nome) % 4 }

  if (fig) {
    const vista = nome.slice(fig.slug.length + 1)
    const r = { ...base, rotulo: `${fig.name} — ${vista}` }
    if (vista === 'perfil') return { ...r, espelhar: true, zoom: 1.08, foco: [470, 680] }
    if (vista === 'detalhe') return { ...r, zoom: 2.6, foco: [500, 470] }
    if (vista === 'base') return { ...r, zoom: 2.3, foco: [500, 980], gravar: true }
    return { ...r, zoom: 1.02, foco: [500, 690] }
  }
  const ronin = { ...base, matiz: hash('ronin-do-crepusculo') % 360, acessorio: hash('ronin-do-crepusculo') % 4 }
  const tabela = {
    hero: { ...ronin, zoom: 1.08, foco: [520, 680], rotulo: 'hero' },
    resina: { ...ronin, cinza: true, zoom: 1.15, foco: [500, 640], rotulo: 'impressão em resina' },
    pintura: { ...ronin, meio: true, zoom: 1.15, foco: [520, 640], rotulo: 'pintura à mão' },
    assinatura: { ...ronin, gravar: true, zoom: 2.4, foco: [500, 1010], rotulo: 'base assinada' },
    macro: { ...ronin, zoom: 3.4, foco: [500, 430], rotulo: 'macro' },
    // Base sem texto: o site sobrepõe "Obrigado, {nome}" ao vivo
    base: { ...ronin, zoom: 2.3, foco: [500, 960], rotulo: 'base' },
  }
  if (tabela[nome]) return { ...tabela[nome], W, H }
  if (nome.startsWith('ugc')) {
    const i = Number(nome.split('-')[1]) || 1
    const slug = figures[(i * 3) % figures.length].slug
    return { W, H, matiz: hash(slug) % 360, acessorio: hash(slug) % 4, cenario: 'estante', zoom: 1.25, foco: [500, 780], rotulo: `foto de cliente ${i}` }
  }
  return { ...base, rotulo: nome }
}

const imagens = coletar([figures, site])
let feitas = 0
for (const img of imagens) {
  const destino = join(raiz, 'media/originais', `${img.src.replace(/^\/img\//, '')}.png`)
  if (existsSync(destino) && !forcar) continue
  mkdirSync(dirname(destino), { recursive: true })
  await sharp(Buffer.from(cena(receita(img)))).png({ compressionLevel: 9 }).toFile(destino)
  feitas++
}
// Marcador: avisa o empacotador que media/ ainda só tem fotos provisórias.
// Apague este arquivo quando colocar as fotos reais em media/originais/.
if (!existsSync(join(raiz, 'media/manifesto-geradas.json'))) {
  writeFileSync(join(raiz, 'media/originais/.provisorio'), 'Fotos provisórias geradas por scripts/placeholders.mjs\n')
}
console.log(`placeholders: ${feitas} criadas, ${imagens.length - feitas} já existiam (media/originais/)`)
