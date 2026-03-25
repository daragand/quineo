interface Grid90Props {
  drawn: number[]
  current: number | null
}

export function Grid90({ drawn, current }: Grid90Props) {
  return (
    <div>
      {/* Légende */}
      <div className="flex items-center gap-[8px] mb-[5px]">
        <span
          className="font-bold uppercase tracking-[.12em] whitespace-nowrap"
          style={{ fontSize: 11, color: 'var(--color-text-hint)' }}
        >
          Tableau 1–90
        </span>
        <div className="flex items-center gap-[5px] ml-[8px]">
          {[
            { bg: '#EF9F27',                        label: 'Tiré',     border: 'none' },
            { bg: 'var(--tirage-cell-curr-bg)',      label: 'Dernier',  border: 'none' },
            { bg: 'var(--tirage-cell-empty-bg)',     label: 'Non tiré', border: '1px solid var(--tirage-cell-empty-border)' },
          ].map(({ bg, label, border }) => (
            <div key={label} className="flex items-center gap-[4px] ml-[8px]">
              <div
                aria-hidden="true"
                className="flex-shrink-0"
                style={{ width: 12, height: 12, borderRadius: 2, background: bg, border }}
              />
              <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div
        role="grid"
        aria-label="Grille 90 numéros"
        className="flex flex-wrap"
        style={{ gap: 2 }}
      >
        {Array.from({ length: 90 }, (_, i) => i + 1).map((n) => {
          const isDrawn   = drawn.includes(n)
          const isCurrent = n === current

          const bg    = isCurrent ? 'var(--tirage-cell-curr-bg)'  : isDrawn ? 'var(--tirage-cell-drawn-bg)'  : 'var(--tirage-cell-empty-bg)'
          const color = isCurrent ? 'var(--tirage-cell-curr-txt)' : isDrawn ? 'var(--tirage-cell-drawn-txt)' : 'var(--tirage-cell-empty-txt)'
          const border = (!isCurrent && !isDrawn) ? '1px solid var(--tirage-cell-empty-border)' : 'none'

          return (
            <div
              key={n}
              role="gridcell"
              aria-label={`${n}${isDrawn ? ' — tiré' : ''}`}
              className="inline-flex items-center justify-center transition-colors duration-[200ms]"
              style={{
                width: 26, height: 20,
                borderRadius: 3,
                background: bg,
                color,
                border,
                fontSize: 11,
                fontWeight: isDrawn || isCurrent ? 700 : 400,
                fontFamily: 'var(--font-body)',
              }}
            >
              {n}
            </div>
          )
        })}
      </div>
    </div>
  )
}
