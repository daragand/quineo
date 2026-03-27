'use client'

import { useEffect } from 'react'
import type { PayMode } from './PaymentMode'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface SuccessData {
  participantName: string
  participantEmail: string
  cartonsCount: number
  totalPaid: number
  payMode: PayMode
  serials: string[]
}

interface SuccessModalProps {
  data: SuccessData
  onClose: () => void
}

const PAY_MODE_LABELS: Record<PayMode, string> = {
  cash: 'Espèces',
  cb:   'Terminal CB',
  free: 'Carton offert',
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function SuccessModal({ data, onClose }: SuccessModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vente confirmée"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(10,16,30,.8)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-[12px] overflow-hidden w-[380px] animate-[fadeUp_.25s_ease_both]"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête foncé */}
        <div className="px-[18px] py-[15px]" style={{ background: '#0b1220' }}>
          <div className="flex items-center gap-[7px] mb-[5px]">
            <div
              aria-hidden="true"
              className="rounded-full flex items-center justify-center"
              style={{ width: 24, height: 24, background: 'var(--color-qgreen-bg)' }}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8l4 4 6-6" stroke="var(--color-qgreen)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold" style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>
              Vente confirmée
            </span>
          </div>
          <div className="font-display leading-none" style={{ fontSize: 20, color: 'white' }}>
            {data.participantName}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
            {data.cartonsCount} carton{data.cartonsCount > 1 ? 's' : ''} —{' '}
            {data.payMode === 'free'
              ? 'Offert'
              : `${data.totalPaid.toFixed(2).replace('.', ',')} € · ${PAY_MODE_LABELS[data.payMode]}`}
          </div>
        </div>

        {/* Corps */}
        <div className="px-[18px] py-[14px]">
          <div
            className="font-bold uppercase tracking-[.1em] mb-[7px]"
            style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
          >
            Cartons attribués
          </div>

          <div className="flex flex-wrap gap-[5px] mb-[8px]">
            {data.serials.map((serial) => (
              <span
                key={serial}
                className="font-display rounded-[5px] px-[8px] py-[3px]"
                style={{
                  fontSize: 13,
                  background: 'var(--color-bg)',
                  color: 'var(--color-text-primary)',
                  border: '.5px solid var(--color-border)',
                }}
              >
                {serial}
              </span>
            ))}
          </div>

          <div
            className="rounded-[6px] px-[10px] py-[6px] mb-[10px]"
            style={{ background: 'var(--color-qgreen-bg)', fontSize: 11, color: 'var(--color-qgreen-text)' }}
          >
            {data.participantEmail !== '(sans compte)'
              ? `✓ Reçu envoyé à ${data.participantEmail}`
              : 'Participant sans compte — pas d\'envoi email'}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[8px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-90"
            style={{
              padding: '9px 0',
              background: 'var(--color-amber)',
              color: '#2C1500',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
            }}
          >
            Nouvelle vente
          </button>
        </div>
      </div>
    </div>
  )
}
