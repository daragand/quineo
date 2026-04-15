'use client'

import { ProgressBar } from '@/components/ui/ProgressBar'
import { Stepper }     from '@/components/ui/Stepper'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface PublicPack {
  id:        string
  qty:       number
  label:     string
  price:     number
  unitPrice: number
  eco?:      string
  maxPer:    number | null
  /** true = carton déjà utilisé/épuisé pour ce participant */
  sold?:     boolean
  featured?: boolean
}

interface PackGridProps {
  packs:         PublicPack[]
  quantities:    Record<string, number>
  alreadyBought: number
  quotaMax:      number
  onChange:      (packId: string, qty: number) => void
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function packMaxQty(pack: PublicPack, alreadyBought: number, quotaMax: number): number {
  let m = Math.floor((quotaMax - alreadyBought) / pack.qty)
  if (pack.maxPer !== null) m = Math.min(m, pack.maxPer)
  return Math.max(0, m)
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function PackGrid({ packs, quantities, alreadyBought, quotaMax, onChange }: PackGridProps) {
  const totalInCart = packs.reduce((s, p) => s + p.qty * (quantities[p.id] ?? 0), 0)
  const used = alreadyBought + totalInCart

  return (
    <div>
      {/* Quota bar */}
      <ProgressBar
        used={used}
        max={quotaMax}
        showDetails
        className="mb-[16px]"
      />

      {/* Notice légale */}
      <div
        className="flex items-start gap-[9px] rounded-[8px] px-[14px] py-[10px] mb-[16px]"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
      >
        <div
          aria-hidden="true"
          className="rounded-full flex items-center justify-center flex-shrink-0 mt-[1px]"
          style={{ width: 22, height: 22, background: 'var(--color-qblue-bg)' }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2l6 11H2L8 2z" stroke="var(--color-qblue)" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
            <path d="M8 7v3M8 11.5v.5" stroke="var(--color-qblue)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="font-bold" style={{ fontSize: 11, color: 'var(--color-qblue-text)' }}>
            Limites d&apos;achat — Loto associatif
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Conformément à la réglementation française (art. L.322-4 CSI), cette session est
            limitée à <strong style={{ color: 'var(--color-text-primary)' }}>{quotaMax} cartons par personne</strong>.
            Les bénéfices sont intégralement reversés à l&apos;association.
          </p>
        </div>
      </div>

      {/* Label */}
      <div
        className="font-bold uppercase tracking-[.1em] mb-[10px]"
        style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
      >
        Choisissez votre forfait et la quantité
      </div>

      {/* Cartes forfaits */}
      <div className="flex flex-col gap-[8px]">
        {packs.map((pack) => {
          const qty        = quantities[pack.id] ?? 0
          const maxQty     = packMaxQty(pack, alreadyBought, quotaMax)
          const isDisabled = maxQty === 0 || !!pack.sold
          const isMaxed    = qty >= maxQty && qty > 0
          const lineTotal  = pack.price * qty

          return (
            <div
              key={pack.id}
              className="relative rounded-[10px] px-[14px] py-[12px] flex items-center gap-[12px] transition-colors duration-[150ms]"
              style={{
                background:    'var(--color-card)',
                border:        `.5px solid ${pack.featured ? 'var(--color-amber)' : 'var(--color-sep)'}`,
                opacity:       isDisabled ? 0.45 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto',
              }}
              aria-disabled={isDisabled}
            >
              {/* Badge "Populaire" */}
              {pack.featured && (
                <div
                  className="absolute font-bold"
                  style={{
                    top: -1, right: 14,
                    background: 'var(--color-amber)', color: '#5C3A00',
                    fontSize: 9, padding: '2px 9px',
                    borderRadius: '0 0 5px 5px', letterSpacing: '.07em',
                  }}
                >
                  Populaire
                </div>
              )}

              {/* Badge limite */}
              {(pack.sold || isMaxed) && (
                <div
                  className="absolute font-bold"
                  style={{
                    top: -1, left: 14,
                    background: 'var(--color-qred-bg)', color: 'var(--color-qred)',
                    fontSize: 9, padding: '2px 8px',
                    borderRadius: '0 0 5px 5px', letterSpacing: '.05em',
                  }}
                >
                  {pack.sold ? 'Déjà utilisé' : 'Limite atteinte'}
                </div>
              )}

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="font-bold flex items-center gap-[6px] flex-wrap" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                  {pack.label}
                  {pack.eco && (
                    <span
                      className="font-bold rounded-[4px] px-[6px] py-[1px]"
                      style={{ fontSize: 9, background: 'var(--color-qgreen-bg)', color: 'var(--color-qgreen-text)' }}
                    >
                      {pack.eco}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                  {pack.price === 0
                    ? 'Gratuit'
                    : `${pack.unitPrice.toFixed(2).replace('.', ',')} € / carton`}
                </div>
                {pack.maxPer !== null && !pack.sold && (
                  <div className="font-bold mt-[2px]" style={{ fontSize: 10, color: 'var(--color-orange)' }}>
                    Max {pack.maxPer} fois par personne
                    {qty > 0 ? ` · ${qty} utilisé${qty > 1 ? 's' : ''}` : ''}
                  </div>
                )}
              </div>

              {/* Prix */}
              <div className="text-right flex-shrink-0" style={{ minWidth: 56 }}>
                <div className="font-display" style={{ fontSize: 20, color: 'var(--color-amber)' }}>
                  {pack.price === 0 ? 'Gratuit' : `${pack.price} €`}
                </div>
                {qty > 0 && pack.price > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    = {lineTotal.toFixed(2).replace('.', ',')} €
                  </div>
                )}
              </div>

              {/* Stepper */}
              <Stepper
                label={pack.label}
                value={qty}
                min={0}
                max={maxQty}
                onChange={(v) => onChange(pack.id, v)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
