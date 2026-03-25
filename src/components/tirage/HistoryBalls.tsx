interface HistoryBallsProps {
  /** Numéros tirés, du plus ancien au plus récent */
  drawn: number[]
  /** Nb max à afficher */
  limit?: number
}

export function HistoryBalls({ drawn, limit = 15 }: HistoryBallsProps) {
  // Prendre les N derniers, du plus récent au plus ancien
  const recent = [...drawn].slice(-limit).reverse()

  return (
    <div className="flex-1 min-w-0 flex flex-col justify-center gap-[8px] overflow-hidden">
      <div className="flex items-center gap-[8px]">
        <span
          className="font-bold uppercase tracking-[.14em] whitespace-nowrap"
          style={{ fontSize: 11, color: 'var(--tirage-hero-num)', opacity: 0.25 }}
        >
          Derniers numéros
        </span>
        <div
          aria-hidden="true"
          className="flex-1"
          style={{ height: 1, background: 'var(--tirage-hist-rule)' }}
        />
      </div>

      <div
        className="flex flex-wrap gap-[5px]"
        aria-label="Historique des numéros tirés"
        aria-live="polite"
        aria-atomic="false"
      >
        {recent.map((n, i) => {
          const isNewest = i === 0
          return (
            <div
              key={`${n}-${i}`}
              aria-label={`${n}${isNewest ? ' — dernier tiré' : ''}`}
              className="inline-flex items-center justify-center font-bold flex-shrink-0 rounded-full transition-all duration-[300ms]"
              style={{
                width:      isNewest ? 34 : 27,
                height:     isNewest ? 34 : 27,
                fontSize:   isNewest ? 14 : 11,
                background: isNewest ? 'var(--tirage-ball-curr-bg)'   : 'var(--tirage-ball-drawn-bg)',
                color:      isNewest ? 'var(--tirage-ball-curr-txt)'   : 'var(--tirage-ball-drawn-txt)',
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
