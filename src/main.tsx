import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './app/App'
import { resolverRota } from './app/rotas'
import { gsap, prefereMenosMovimento } from './lib/motion'
import './styles/global.css'

// Marca antes do primeiro render: os elementos que o GSAP revela já nascem
// escondidos (sem "piscar"). Com reduced motion, tudo nasce visível.
document.documentElement.classList.toggle('js-movimento', !prefereMenosMovimento())

// Só em dev: permite inspecionar/avançar as timelines pelo console
if (import.meta.env.DEV) Object.assign(window, { gsap })

// Cada página da loja (home, catálogo, figure) é um HTML pré-renderizado; o caminho diz qual
// e o navegador baixa só o código dela (a home não carrega o catálogo, e vice-versa)
const rota = resolverRota(window.location.pathname)
let pagina
switch (rota.tipo) {
  case 'home': {
    const { Home } = await import('./pages/Home')
    pagina = <Home />
    break
  }
  case 'catalogo': {
    const { Catalogo } = await import('./pages/Catalogo')
    pagina = <Catalogo />
    break
  }
  case 'processo': {
    const { ComoEFeita } = await import('./pages/ComoEFeita')
    pagina = <ComoEFeita />
    break
  }
  case 'produto': {
    const { Produto } = await import('./pages/Produto')
    pagina = <Produto figure={rota.figure} />
    break
  }
  default: {
    const { NaoEncontrada } = await import('./pages/NaoEncontrada')
    pagina = <NaoEncontrada />
  }
}
const raiz = document.getElementById('root')!
const app = (
  <StrictMode>
    <App rota={rota}>{pagina}</App>
  </StrictMode>
)
// No build, o HTML já vem pré-renderizado (scripts/prerender.mjs): o React só "hidrata".
// No dev, a raiz está vazia e o React renderiza do zero.
if (raiz.hasChildNodes()) hydrateRoot(raiz, app)
else createRoot(raiz).render(app)
