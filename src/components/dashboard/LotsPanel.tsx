import { Badge } from '@/components/ui/Badge'
import type { TirageType } from '@/types/session'

// ─────────────────────────────────────────
// Types locaux
// ─────────────────────────────────────────

interface LotRow {
  id: string
  name: string
  value?: number
  tirageType: TirageType
  /** pending = En cours, drawn = Gagné, cancelled = Annulé */
  status: 'pending' | 'drawn' | 'cancelled'
}

interface LotsPanelProps {
  lots: LotRow[]
}

// ─────────────────────────────────────────
// Labels tirageType
// ─────────────────────────────────────────

const TYPE_LABELS: Record<TirageType, string> = {
  quine:        'Quine',
  double_quine: 'Double Quine',
  carton_plein: 'Carton Plein',
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function LotsPanel({ lots }: LotsPanelProps) {
  if (lots.length === 0) {
    return (
      <p style={{ fontSize: 11, color: 'var(--color-text-hint)', padding: '8px 0' }}>
        Aucun lot dans cette session.
      </p>
    )
  }

  return (
    <ul className="list-none m-0 p-0">
      {lots.map((lot, i) => (
        <li
          key={lot.id}
          className="flex items-center gap-[10px] py-[7px]"
          style={{ borderTop: i === 0 ? 'none' : '.5px solid var(--color-sep)' }}
        >
          {/* Thumb placeholder */}
          <div
            aria-hidden="true"
            className="flex-shrink-0 rounded-[5px] flex items-center justify-center"
            style={{
              width: 32, height: 32,
              background: 'var(--color-bg)',
              border: '.5px solid var(--color-border)',
            }}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
              <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="var(--color-amber)" strokeWidth="1.3" />
              <circle cx="8" cy="8" r="2.5" stroke="var(--color-amber)" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div
              className="font-bold truncate"
              style={{ fontSize: 12, color: 'var(--color-text-primary)' }}
            >
              {lot.name}
            </div>
            <span
              className="inline-block font-bold uppercase tracking-[.08em] rounded-[3px] px-[6px] py-[1px] mt-[2px]"
              style={{ fontSize: 9, background: 'var(--color-qblue-bg)', color: 'var(--color-qblue-text)' }}
            >
              {TYPE_LABELS[lot.tirageType]}
            </span>
          </div>

          {/* Prix */}
          {lot.value !== undefined && (
            <span
              className="font-display flex-shrink-0"
              style={{ fontSize: 17, color: 'var(--color-amber)' }}
            >
              {lot.value} €
            </span>
          )}

          {/* Statut */}
          <Badge
            variant={lot.status === 'drawn' ? 'won' : lot.status === 'pending' ? 'pending' : 'cancelled'}
          />
        </li>
      ))}
    </ul>
  )
}
