export type OpcaoFiltro = { id: string; label: string; total: number }

type Props = {
  options: OpcaoFiltro[]
  active: string
  onChange: (id: string) => void
  rotulo: string
}

/** Chips de filtro: botões com aria-pressed; rolagem horizontal no mobile. */
export function FilterChips({ options, active, onChange, rotulo }: Props) {
  return (
    <div
      role="group"
      aria-label={rotulo}
      // Sangra até a borda no mobile para indicar que dá para arrastar
      className="sem-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0"
    >
      {options.map((op) => {
        const ativo = op.id === active
        return (
          <button
            key={op.id}
            type="button"
            aria-pressed={ativo}
            onClick={() => onChange(op.id)}
            className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${
              ativo
                ? 'border-texto bg-texto text-fundo'
                : 'border-linha text-texto-suave hover:border-texto-suave hover:text-texto'
            }`}
          >
            {op.label}
            <span className={`text-xs tabular-nums ${ativo ? 'text-fundo/60' : 'text-texto-suave/70'}`}>{op.total}</span>
          </button>
        )
      })}
    </div>
  )
}
