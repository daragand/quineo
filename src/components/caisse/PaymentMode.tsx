'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type PayMode = 'cash' | 'cb' | 'free'

interface PaymentModeProps {
  mode: PayMode
  totalDue: number
  onModeChange: (m: PayMode) => void
  onCashChange?: (amount: number) => void
}

// ─────────────────────────────────────────
// Config des modes
// ─────────────────────────────────────────

const MODES: Array<{
  id: PayMode
  label: string
  sub: string
  iconBg: string
  icon: React.ReactNode
}> = [
  {
    id: 'cash',
    label: 'Espèces',
    sub: 'Calcul de monnaie automatique',
    iconBg: '#065F46',
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="4" width="14" height="9" rx="1.5" stroke="white" strokeWidth="1.3" />
        <circle cx="8" cy="8.5" r="2" stroke="white" strokeWidth="1.2" />
        <path d="M1 7h14" stroke="white" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: 'cb',
    label: 'Terminal CB',
    sub: 'Confirmer après paiement sur terminal',
    iconBg: 'var(--color-qblue)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="4" width="14" height="9" rx="1.5" stroke="white" strokeWidth="1.3" />
        <path d="M1 7h14" stroke="white" strokeWidth="1.2" />
        <circle cx="5" cy="10" r="1" fill="white" />
      </svg>
    ),
  },
  {
    id: 'free',
    label: 'Carton offert',
    sub: 'Motif obligatoire · Admin / Animateur uniquement',
    iconBg: '#7C3AED',
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2l1.4 3.8H13l-3.1 2.3 1.2 3.4L8 9.2l-3.1 2.3 1.2-3.4L3 5.8h3.6z" fill="white" />
      </svg>
    ),
  },
]

const FREE_MOTIFS = [
  'Invité organisateur',
  'Lot de consolation',
  'Action promotionnelle',
  'Bénévole',
]

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function PaymentMode({ mode, totalDue, onModeChange, onCashChange }: PaymentModeProps) {
  const [cashAmount, setCashAmount] = useState('')
  const [txRef, setTxRef]           = useState('')
  const [motif, setMotif]           = useState('')

  const change = cashAmount ? parseFloat(cashAmount) - totalDue : null
  const changeColor = change === null
    ? 'var(--color-text-primary)'
    : change >= 0
    ? 'var(--color-qgreen-text)'
    : 'var(--color-qred)'

  function handleCashChange(val: string) {
    setCashAmount(val)
    onCashChange?.(parseFloat(val) || 0)
  }

  return (
    <div>
      {/* Sélection du mode */}
      <div role="radiogroup" aria-label="Mode de paiement">
        {MODES.map((m) => {
          const isSel = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={isSel}
              onClick={() => onModeChange(m.id)}
              className={cn(
                'w-full flex items-center gap-[9px] rounded-[8px] px-[10px] py-[8px] mb-[5px] text-left cursor-pointer transition-all duration-[150ms]'
              )}
              style={{
                background: isSel ? 'var(--color-qblue-bg)' : 'var(--color-card)',
                border: `.5px solid ${isSel ? 'var(--color-qblue)' : 'var(--color-border)'}`,
              }}
            >
              {/* Icône */}
              <div
                aria-hidden="true"
                className="rounded-[6px] flex items-center justify-center flex-shrink-0"
                style={{ width: 28, height: 28, background: m.iconBg }}
              >
                {m.icon}
              </div>

              {/* Texte */}
              <div className="flex-1">
                <div className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                  {m.sub}
                </div>
              </div>

              {/* Radio dot */}
              <div
                aria-hidden="true"
                className="rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  width: 14, height: 14,
                  background: isSel ? 'var(--color-qblue)' : 'var(--color-bg)',
                  border: `.5px solid ${isSel ? 'var(--color-qblue)' : 'var(--color-border)'}`,
                }}
              >
                {isSel && (
                  <svg width="7" height="7" viewBox="0 0 10 10" aria-hidden="true">
                    <circle cx="5" cy="5" r="3" fill="white" />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Zone espèces */}
      {mode === 'cash' && (
        <div className="mt-[8px]">
          <div
            className="font-bold uppercase tracking-[.1em] mb-[5px]"
            style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
          >
            Montant encaissé
          </div>
          <div
            className="rounded-[7px] px-[11px] py-[9px]"
            style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)' }}
          >
            <div className="flex justify-between items-baseline mb-[2px]">
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Total à payer</span>
              <span className="font-display" style={{ fontSize: 16, color: 'var(--color-text-primary)' }}>
                {totalDue.toFixed(2).replace('.', ',')} €
              </span>
            </div>
            <input
              type="number"
              min={0}
              step={0.5}
              placeholder="0,00"
              value={cashAmount}
              onChange={(e) => handleCashChange(e.target.value)}
              aria-label="Montant encaissé en espèces"
              className="w-full rounded-[6px] text-right mt-[5px]"
              style={{
                padding: '7px 10px',
                border: '.5px solid var(--color-border)',
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                color: 'var(--color-text-primary)',
                background: 'var(--color-card)',
                outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-qblue)' }}
              onBlur={(e)  => { e.target.style.borderColor = 'var(--color-border)' }}
            />
            <div
              className="flex justify-between items-baseline pt-[7px] mt-[7px]"
              style={{ borderTop: '.5px solid var(--color-sep)' }}
            >
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Monnaie à rendre</span>
              <span
                className="font-display"
                style={{ fontSize: 20, color: changeColor }}
              >
                {change === null
                  ? '—'
                  : `${change >= 0 ? '' : '−'}${Math.abs(change).toFixed(2).replace('.', ',')} €`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Zone CB */}
      {mode === 'cb' && (
        <div className="mt-[8px]">
          <div
            className="rounded-[7px] px-[11px] py-[9px] mb-[8px]"
            style={{ background: 'var(--color-qblue-bg)', border: '.5px solid var(--color-qblue)' }}
          >
            <div className="font-bold" style={{ fontSize: 12, color: 'var(--color-qblue-text)' }}>
              Faites payer sur le terminal
            </div>
            <div style={{ fontSize: 11, color: '#78AED0', marginTop: 2 }}>
              Présentez le terminal au participant, puis confirmez ici après acceptation.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              N° transaction (optionnel)
            </div>
            <input
              type="text"
              placeholder="ex : TXN-8492"
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              aria-label="Numéro de transaction"
              className="w-full rounded-[6px]"
              style={{
                padding: '7px 9px',
                border: '.5px solid var(--color-border)',
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: 'var(--color-text-primary)',
                background: 'var(--color-card)',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Zone offert */}
      {mode === 'free' && (
        <div className="mt-[8px]">
          <div
            className="rounded-[7px] px-[11px] py-[9px] mb-[8px]"
            style={{ background: '#EEEDFE', border: '.5px solid #7F77DD' }}
          >
            <div className="font-bold" style={{ fontSize: 12, color: '#3C3489' }}>
              Attribution gratuite
            </div>
            <div style={{ fontSize: 11, color: '#534AB7', marginTop: 2 }}>
              Tracé séparément dans les rapports financiers.
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            Motif obligatoire
          </div>
          <select
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            aria-label="Motif d'attribution gratuite"
            className="w-full rounded-[6px] cursor-pointer"
            style={{
              padding: '7px 9px',
              border: '.5px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: motif ? 'var(--color-text-primary)' : 'var(--color-text-hint)',
              background: 'var(--color-card)',
              outline: 'none',
              appearance: 'none',
            }}
          >
            <option value="">— Sélectionner un motif</option>
            {FREE_MOTIFS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
