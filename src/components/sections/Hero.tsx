import { useLayoutEffect, useRef, useState } from 'react'
import { urlCatalogo } from '../../app/rotas'
import { contarProntas, figures, preencher, site } from '../../lib/data'
import { ScrollTrigger, useMenosMovimento } from '../../lib/motion'
import { linkDaPeca } from '../../lib/whatsapp'
import { Button } from '../ui/Button'
import { Picture } from '../ui/Picture'
import { HeroLoop } from '../ui/HeroLoop'
import { HeroAtmosphere, RunicSky } from '../ui/Runic'

const SIZES_HERO = '(min-width: 768px) 40vw, 64vw'

/** Slot de mídia do hero: imagem, vídeo curto ou sequência de quadros (spec §4). */
function MidiaHero() {
  const media = site.hero.media
  const menosMovimento = useMenosMovimento()
  const [quadro, setQuadro] = useState(0)

  // Sequência de quadros: o scroll escolhe qual foto do giro 360° aparece
  useLayoutEffect(() => {
    if (media.type !== 'frames' || menosMovimento) return
    const st = ScrollTrigger.create({
      trigger: '#topo',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => setQuadro(Math.round(self.progress * (media.frames.length - 1))),
    })
    return () => st.kill()
  }, [media, menosMovimento])

  const classe = 'h-full w-full'
  if (media.type === 'image')
    return <Picture image={media.image} sizes={SIZES_HERO} priority ratio="auto" className={classe} />

  if (media.type === 'video')
    return <HeroLoop media={media} sizes={SIZES_HERO} />

  return (
    <div className={`relative ${classe}`}>
      {media.frames.map((f, i) => (
        <div key={f.src} className="absolute inset-0" style={{ visibility: i === quadro ? 'visible' : 'hidden' }}>
          <Picture image={f} sizes={SIZES_HERO} priority={i === 0} ratio="auto" className="h-full" />
        </div>
      ))}
    </div>
  )
}

export function Hero() {
  const raiz = useRef<HTMLElement>(null)
  const prontas = contarProntas(figures)

  useLayoutEffect(() => {
    const hero = raiz.current
    const card = hero?.querySelector<HTMLElement>('[data-hero-peca]')
    if (!hero || !card) return
    // Centro medido na arte 2688 × 1520: círculo em 76% / 43,5%.
    // A mesma geometria posiciona o cenário e o vídeo, inclusive ao redimensionar.
    const atualizar = () => {
      const { width, height } = hero.getBoundingClientRect()
      const mobile = window.matchMedia('(max-width: 767px)').matches
      const imageRatio = 2688 / 1520
      const cardRect = card.getBoundingClientRect()
      const heroRect = hero.getBoundingClientRect()
      const portalX = cardRect.left - heroRect.left + cardRect.width / 2
      const portalY = cardRect.top - heroRect.top + cardRect.height / 2
      // Cobrir o cenário sem esticá-lo, mantendo o círculo no centro da segunda coluna.
      let sceneHeight = Math.max(
        height, width / imageRatio,
        portalY / 0.435, (height - portalY) / 0.565,
        portalX / (0.76 * imageRatio), (width - portalX) / (0.24 * imageRatio),
      )
      let sceneWidth = sceneHeight * imageRatio
      let sceneLeft = portalX - sceneWidth * 0.76
      let sceneTop = portalY - sceneHeight * 0.435
      if (mobile) {
        sceneHeight = cardRect.height + 180
        sceneWidth = sceneHeight * imageRatio
        sceneLeft = width / 2 - sceneWidth * 0.76
        sceneTop = cardRect.top - heroRect.top + cardRect.height / 2 - sceneHeight * 0.435
      }
      const values = {
        '--scene-width': sceneWidth,
        '--scene-height': sceneHeight,
        '--scene-left': sceneLeft,
        '--scene-top': sceneTop,
        '--portal-x': sceneLeft + sceneWidth * 0.76,
        '--portal-y': sceneTop + sceneHeight * 0.435,
      }
      Object.entries(values).forEach(([key, value]) => hero.style.setProperty(key, `${value}px`))
      // Libera o fade do cenário só agora, já na posição final
      hero.setAttribute('data-cena-pronta', '')
    }
    if (typeof ResizeObserver === 'undefined') {
      atualizar()
      window.addEventListener('resize', atualizar)
      return () => window.removeEventListener('resize', atualizar)
    }
    const observer = new ResizeObserver(atualizar)
    observer.observe(hero)
    observer.observe(card)
    atualizar()
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={raiz}
      id="topo"
      aria-labelledby="hero-titulo"
      /* Janela noturna sobre o linho: o ateliê (tema-noite) arredondado, com respiro, como o ovo sobre o papel da logo */
      className="hero-scene tema-noite relative mx-2 mt-16 overflow-hidden rounded-[1.75rem] pt-10 pb-14 shadow-[0_40px_90px_-50px_rgb(38_42_107/0.6)] md:mx-4 md:mt-[4.5rem] md:flex md:min-h-[min(calc(100svh-5.5rem),900px)] md:items-center md:rounded-[2.5rem] md:pt-16 md:pb-20"
    >
      <HeroAtmosphere />

      <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-12 md:px-8">
        {/* Cenário e portal compartilham o centro; só os anéis giram. */}
        <div
          data-hero-peca
          className="hero-portal relative mx-auto aspect-[4/5] h-[38svh] max-h-[520px] min-h-[260px] md:order-2 md:h-[min(76svh,720px)]"
        >
          <div aria-hidden="true" className="portal-aura" />
          <div aria-hidden="true" className="portal-ring portal-ring--outer" />
          <div aria-hidden="true" className="portal-ring portal-ring--inner" />
          <div className={`entrada-peca ${site.mascot ? 'atelier-window' : 'janela size-full'}`}>
            <div className="size-full">
              <MidiaHero />
            </div>
          </div>
          <RunicSky />
          {site.mascot && (
            <div className="portal-speech">
              <p className="giz">{site.mascot.note}</p>
            </div>
          )}
          {/* Anotação a giz, como as notas do caderno de ideias */}
          <p
            aria-hidden
            className={`giz pointer-events-none absolute bottom-[12%] -left-40 hidden w-44 -rotate-6 text-[1.65rem] text-lilas/90 ${site.mascot ? '' : 'lg:block'}`}
          >
            {site.hero.note} <span className="text-acento">♡</span>
          </p>
        </div>

        <div data-hero-texto className="entrada-texto md:order-1">
          <p className="mb-4 flex items-center gap-2.5 font-display text-xs font-semibold tracking-[0.24em] text-acento uppercase">
            <span className="runa" aria-hidden />
            {site.hero.eyebrow}
          </p>
          <h1 id="hero-titulo" className="text-[1.95rem] leading-[1.12] font-semibold md:text-[3.6rem] md:leading-[1.06]">
            {site.hero.title}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-texto-suave md:text-xl">{site.hero.subtitle}</p>

          <div id="hero-ctas" className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              href={linkDaPeca(site)}
              size="lg"
              icone="whatsapp"
              track={{ evento: 'cta_whatsapp_click', params: { source: 'hero' } }}
            >
              {site.hero.ctaPrimary}
            </Button>
            <Button
              href={urlCatalogo()}
              size="lg"
              variant="secondary"
              iconeDepois="seta"
            >
              {site.hero.ctaSecondary}
            </Button>
          </div>

          {prontas > 0 && (
            <p className="mt-6 flex items-center gap-2.5 text-sm font-medium text-texto-suave">
              <span className="relative flex size-2.5" aria-hidden>
                <span className="absolute inset-0 animate-ping rounded-full bg-status-disponivel/60 motion-reduce:hidden" />
                <span className="relative size-2.5 rounded-full bg-status-disponivel" />
              </span>
              {preencher(site.hero.readyLabel, { n: prontas })}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
