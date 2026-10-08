import { ChamadaProcesso } from '../components/sections/ChamadaProcesso'
import { Faq } from '../components/sections/Faq'
import { FinalCta } from '../components/sections/FinalCta'
import { Hero } from '../components/sections/Hero'
import { Highlights } from '../components/sections/Highlights'
import { HowToOrder } from '../components/sections/HowToOrder'
import { StickyCTA } from '../components/sections/StickyCTA'
import { Vitrine } from '../components/sections/Vitrine'

/**
 * Vitrine (home), só o essencial. O hero fica intacto: é o chamariz. Abaixo dele,
 * a loja (destaques e universos), um atalho para "Como nasce uma figure" (página
 * própria), como pedir, dúvidas e o fechamento.
 */
export function Home() {
  return (
    <>
      <Hero />
      <Highlights />
      <Vitrine />
      <ChamadaProcesso />
      <HowToOrder />
      <Faq />
      <FinalCta />
      <StickyCTA />
    </>
  )
}
