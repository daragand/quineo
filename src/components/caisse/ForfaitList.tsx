'use client'

import { ProgressBar } from '@/components/ui/ProgressBar'
import { Stepper } from '@/components/ui/Stepper'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface Pack {
  id: number
  qty: number
  label: string
  price: number
  unitPrice: number
  /** Ex: "-17 %" */
  eco?: string
  /** null = pas de limite par personne */
  maxPer: number | null
  color: string
  featured?: boolean
}

interface ForfaitListProps {
  packs: Pack[]
  quantities: Record<number, number>
  /** Cartons déjà achetés par le participant sélectionné */
  alreadyBought: number
  quotaMax: number
  onChangeQty: (packId: number, qty: number) => void
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function packMaxAllowed(pack: Pack, alreadyBought: number, quotaMax: number): number {
  const globalLeft = quotaMax - alreadyBought
  let m = Math.floor(globalLeft / pack.qty)
  if (pack.maxPer !== null) m = Math.min(m, pack.maxPer)
  return Math.max(0, m)
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function ForfaitList({
  packs,
  quantities,
  alreadyBought,
  quotaMax,
  onChangeQty,
}: ForfaitListProps) {
  const cartonsInCart = packs.reduce((s, p) => s + p.qty * (quantities[p.id] ?? 0), 0)
  const totalUsed     = alreadyBought + cartonsInCart

  return (
    <div>
      {/* Quota bar */}
      <ProgressBar
        used={totalUsed}
        max={quotaMax}
        className="mb-[10px]"
      />

      {/* Forfaits */}
      <ul className="list-none m-0 p-0">
        {packs.map((pack) => {
          const qty        = quantities[pack.id] ?? 0
          const maxAllowed = packMaxAllowed(pack, alreadyBought, quotaMax)
          const isDisabled = maxAllowed === 0

          const lineTotal  = pack.price * qty
          const ecoText    = pack.eco

          // Texte limite
          let limitText: string | null = null
          if (pack.maxPer !== null) {
            if (isDisabled && alreadyBought >= pack.maxPer * pack.qty) {
              limitText = 'Forfait épuisé pour ce participant'
            } else {
              limitText = `Max ${pack.maxPer}× par personne${qty > 0 ? ` · ${qty} utilisé${qty > 1 ? 's' : ''}` : ''}`
            }
          }

          return (
            <li
              key={pack.id}
              className="flex items-center gap-[9px] rounded-[8px] px-[10px] py-[8px] mb-[5px] transition-opacity duration-[150ms]"
              style={{
                background: 'var(--color-card)',
                border: `.5px solid ${pack.featured ? 'var(--color-amber)' : 'var(--color-border)'}`,
                opacity: isDisabled ? 0.38 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto',
              }}
              aria-disabled={isDisabled}
            >
              {/* Badge quantité du forfait */}
              <div
                aria-hidden="true"
                className="rounded-[6px] flex items-center justify-center font-display flex-shrink-0"
                style={{ width: 30, height: 30, background: pack.color, fontSize: 18, color: 'white' }}
              >
                {pack.qty}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="font-bold flex items-center gap-[5px]" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                  {pack.label}
                  {ecoText && (
                    <span
                      className="font-bold rounded-[3px] px-[5px] py-[1px]"
                      style={{ fontSize: 9, background: 'var(--color-qgreen-bg)', color: 'var(--color-qgreen-text)' }}
                    >
                      {ecoText}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                  {pack.price === 0
                    ? 'Gratuit'
                    : `${pack.unitPrice.toFixed(2).replace('.', ',')} € / carton`}
                </div>
                {limitText && (
                  <div className="font-bold" style={{ fontSize: 10, color: 'var(--color-orange)' }}>
                    {limitText}
                  </div>
                )}
              </div>

              {/* Prix ligne */}
              <div className="flex-shrink-0 text-right" style={{ minWidth: 44 }}>
                <div className="font-display" style={{ fontSize: 16, color: 'var(--color-amber)' }}>
                  {lineTotal > 0 ? `${lineTotal} €` : pack.price === 0 ? '0 €' : '—'}
                </div>
                {qty > 0 && pack.price > 0 && (
                  <div style={{ fontSize: 9, color: 'var(--color-text-hint)' }}>
                    {qty}×{pack.price} €
                  </div>
                )}
              </div>

              {/* Stepper */}
              <Stepper
                label={pack.label}
                value={qty}
                min={0}
                max={maxAllowed}
                onChange={(v) => onChangeQty(pack.id, v)}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
