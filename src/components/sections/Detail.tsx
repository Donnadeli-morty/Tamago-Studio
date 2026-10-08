import { useId, useRef, useState } from 'react'
import { preencher, site } from '../../lib/data'
import { useRevelar } from '../../lib/useRevelar'
import { Icon } from '../ui/Icon'
import { Picture } from '../ui/Picture'
import { SectionHeading } from '../ui/SectionHeading'

const D = site.detail
const REGUA_MAX_CM = 30

/** Régua de escala: a peça ao lado de um objeto conhecido. */
function Escala() {
  const altura = Math.min(D.scaleHeightCm, REGUA_MAX_CM)
  return (
    <figure className="runic-panel flex h-full flex-col rounded-(--radius-cartao) border border-linha/60 bg-superficie p-5" data-revelar>
      <p className="font-display text-xs tracking-[0.16em] text-brasa uppercase">Tamanho na estante</p>
      <div className="scale-scene" role="img" aria-label={`Comparação ilustrativa: figure de ${D.scaleHeightCm} cm e garrafa de 600 ml com aproximadamente 23 cm.`}>
        <div className="scale-axis" aria-hidden="true">
          <span className="scale-unit">cm</span>
          {Array.from({ length: REGUA_MAX_CM + 1 }, (_, cm) => (
            <span key={cm} className={`scale-tick ${cm % 5 === 0 ? 'scale-tick--major' : ''}`} style={{ bottom: `${cm / REGUA_MAX_CM * 100}%` }}>
              {cm % 5 === 0 && <span>{cm}</span>}
            </span>
          ))}
        </div>
        <div className="scale-guide" style={{ bottom: `calc(2.5rem + ${altura / REGUA_MAX_CM * 15}rem)` }} aria-hidden="true" />
        <div className="scale-objects" aria-hidden="true">
          <div className="scale-object scale-object--figure" style={{ height: `${altura / REGUA_MAX_CM * 15}rem`, width: D.scaleImage ? `${altura / REGUA_MAX_CM * 15 * D.scaleImage.w / D.scaleImage.h}rem` : undefined }}>
            <span className="scale-height">{D.scaleHeightCm} cm</span>
            {D.scaleImage ? (
              <img src={`${D.scaleImage.src}-480.webp`} alt="" width={D.scaleImage.w} height={D.scaleImage.h} loading="lazy" className="size-full object-contain" />
            ) : <div className="size-full rounded-t-[45%] bg-gradient-to-t from-lavanda to-acento-forte" />}
            <span className="scale-label">Figure</span>
          </div>
          <div className="scale-object scale-object--bottle" style={{ height: `${23 / REGUA_MAX_CM * 15}rem` }}>
            <div className="scale-bottle"><span className="scale-bottle__label">600 ml</span></div>
            <span className="scale-label">≈ 23 cm</span>
          </div>
        </div>
      </div>
      <figcaption className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-texto-suave">
        <Icon nome="regua" className="mt-0.5 size-5 shrink-0 text-brasa" />
        {preencher(D.scaleCaption, { cm: D.scaleHeightCm })}
      </figcaption>
    </figure>
  )
}

/** Prévia da base assinada: a pessoa digita o nome e vê na plaqueta. */
function BaseAssinada() {
  const [nome, setNome] = useState('')
  const idCampo = useId()
  return (
    <div className="grid gap-6 rounded-(--radius-cartao) border border-linha/60 bg-superficie p-4 md:grid-cols-[1fr_1.1fr] md:items-center md:p-6" data-revelar>
      <div className="relative overflow-hidden rounded-2xl">
        <Picture image={D.base} sizes="(min-width: 768px) 26vw, 88vw" />
        <p
          aria-live="polite"
          className="absolute inset-x-0 -translate-y-1/2 px-6 text-center font-display text-lilas [text-shadow:0_0_12px_rgb(79_216_255/0.75),0_1px_0_rgb(0_0_0/0.6)]"
          style={{ top: `${D.baseTextTop}%` }}
        >
          <span className="block text-xl md:text-2xl">{D.baseThanks},</span>
          <span className="block truncate text-base md:text-lg">{nome.trim() || D.baseDefaultName}</span>
        </p>
      </div>
      <div className="md:pr-4">
        <h3 className="text-2xl font-medium md:text-3xl">{D.baseTitle}</h3>
        <p className="mt-3 leading-relaxed text-texto-suave">{D.baseText}</p>
        <label htmlFor={idCampo} className="mt-6 block text-sm font-semibold">
          {D.baseInputLabel}
        </label>
        <input
          id={idCampo}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={24}
          autoComplete="given-name"
          placeholder={D.baseDefaultName}
          className="mt-2 min-h-12 w-full rounded-xl border border-linha bg-fundo px-4 text-base placeholder:text-texto-suave/60 focus:border-acento focus:outline-none"
        />
      </div>
    </div>
  )
}

export function Detail() {
  const raiz = useRef<HTMLElement>(null)
  useRevelar(raiz)
  return (
    <section ref={raiz} id="detalhe" aria-labelledby="detalhe-titulo" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <SectionHeading id="detalhe-titulo" eyebrow={D.eyebrow} title={D.title} intro={D.intro} />

      <figure data-revelar className="mb-6">
        <Picture image={D.macro} sizes="(min-width: 1280px) 1200px, 100vw" className="rounded-(--radius-cartao) border border-linha/60" />
        <figcaption className="mt-3 text-sm text-texto-suave">{D.macroCaption}</figcaption>
      </figure>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Escala />
        <BaseAssinada />
      </div>
    </section>
  )
}
