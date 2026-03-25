import type { TirageType } from '@/types/session'

interface LotPanelProps {
  name: string
  value?: number
  order: number
  total: number
  tirageType: TirageType
  imageUrl?: string
}

const TYPE_LABELS: Record<TirageType, string> = {
  quine:        'QUINE',
  double_quine: 'DOUBLE QUINE',
  carton_plein: 'CARTON PLEIN',
}

export function LotPanel({ name, value, order, total, tirageType, imageUrl }: LotPanelProps) {
  return (
    <div
      className="flex flex-col gap-[7px] flex-shrink-0"
      style={{ width: '21%' }}
      aria-label={`Lot en cours : ${name}`}
    >
      {/* Photo du lot */}
      <div
        className="flex-1 min-h-0 rounded-[8px] flex flex-col items-center justify-center gap-[5px] transition-colors duration-[300ms]"
        style={{
          background: 'var(--tirage-bg3)',
          border: '1px solid var(--color-border)',
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain rounded-[8px] p-2"
          />
        ) : (
          <>
            <svg
              viewBox="0 0 40 36" width="38" height="34" fill="none"
              aria-hidden="true"
              style={{ opacity: 'var(--tirage-icon-op)' as string }}
            >
              <rect x="3" y="8" width="34" height="24" rx="3" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="20" cy="20" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M14 8l2-5h8l2 5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
              <circle cx="32" cy="13" r="2" fill="currentColor" />
            </svg>
            <span
              className="uppercase tracking-[.1em]"
              style={{ fontSize: 9, color: 'var(--color-text-hint)' }}
            >
              Photo du lot
            </span>
          </>
        )}
      </div>

      {/* Infos lot */}
      <div
        className="rounded-[7px] px-[9px] py-[7px] transition-colors duration-[300ms]"
        style={{ background: 'var(--tirage-bg3)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="font-bold leading-[1.25] mb-[3px] transition-colors duration-[300ms]"
          style={{ fontSize: 12, color: 'var(--color-text-primary)' }}
        >
          {name}
        </div>
        {value !== undefined && (
          <div
            className="font-display leading-none"
            style={{ fontSize: 20, color: 'var(--color-amber)', letterSpacing: '.04em' }}
          >
            {value} €
          </div>
        )}
        <div
          className="mt-[2px] transition-colors duration-[300ms]"
          style={{ fontSize: 11, color: 'var(--color-text-muted)' }}
        >
          Lot n° {order} / {total}
        </div>
      </div>

      {/* Badge type */}
      <div
        className="font-bold uppercase tracking-[.14em] rounded-[4px] px-[12px] py-[2px] text-center"
        style={{
          fontSize: 11,
          background: '#1a2e4a',
          color: '#85B7EB',
          border: '1.5px solid #378ADD',
        }}
      >
        {TYPE_LABELS[tirageType]}
      </div>
    </div>
  )
}
