import { site } from '../../lib/data'

/** A arte recortada mantém o dragão inteiro, sem moldura ou corte da cabeça. */
export function Mascot({ className = '', priority = false }: { className?: string; priority?: boolean }) {
  const image = site.mascot?.welcome
  const companion = site.mascot?.companion
  if (!image) return null
  return (
    <div className={`flex items-end gap-1 ${className}`}>
    <picture className="mascot-art block min-w-0 flex-1">
      <source type="image/webp" srcSet={`${image.src}-480.webp 480w, ${image.src}-800.webp 800w`} sizes="(min-width: 768px) 260px, 160px" />
      <img
        src={`${image.src}-480.webp`}
        alt={image.alt}
        width={image.w}
        height={image.h}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="h-auto w-full object-contain"
      />
    </picture>
    {companion && (
      <div className="relative aspect-[6/7] min-w-0 flex-1 overflow-hidden mix-blend-multiply">
        <img
          src={companion.src}
          alt={companion.alt}
          width={companion.w}
          height={companion.h}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute top-[-4%] left-[-32%] h-auto w-[457%] max-w-none brightness-[1.12]"
        />
      </div>
    )}
    </div>
  )
}
