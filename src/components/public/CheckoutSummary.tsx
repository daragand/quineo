'use client'

import { useState } from 'react'
import type { PublicPack } from './PackGrid'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type OnlinePayMode = 'stripe' | 'sumup' | 'helloasso'

interface CartLine {
  pack: PublicPack
  qty: number
}

interface CheckoutSummaryProps {
  lines: CartLine[]
  sessionName: string
  sessionCode: string
  sessionDate: string
  sessionLieu: string
  onBack: () => void
  onConfirm: (info: { name: string; email: string; payMode: OnlinePayMode }) => void
}

// ─────────────────────────────────────────
// Config modes paiement
// ─────────────────────────────────────────

const PAY_MODES: Array<{
  id: OnlinePayMode
  label: string
  sub: string
  iconBg: string
  icon: React.ReactNode
}> = [
  {
    id: 'stripe',
    label: 'Carte bancaire',
    sub: 'Visa, Mastercard · Stripe',
    iconBg: '#635BFF',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.8" />
        <path d="M2 10h20" stroke="white" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'sumup',
    label: 'SumUp',
    sub: 'Lien de paiement sécurisé',
    iconBg: '#1DBF73',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v18M3 12h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'helloasso',
    label: 'HelloAsso',
    sub: 'Paiement solidaire',
    iconBg: '#E5007D',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21C12 21 4 14 4 9a8 8 0 0116 0c0 5-8 12-8 12z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
]

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function CheckoutSummary({
  lines,
  sessionName,
  sessionCode,
  sessionDate,
  sessionLieu,
  onBack,
  onConfirm,
}: CheckoutSummaryProps) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [payMode, setPayMode] = useState<OnlinePayMode>('stripe')
  const [loading, setLoading] = useState(false)

  const total        = lines.reduce((s, l) => s + l.pack.price * l.qty, 0)
  const totalCartons = lines.reduce((s, l) => s + l.pack.qty * l.qty, 0)
  const canPay       = name.trim() && email.includes('@')

  function handlePay() {
    if (!canPay || loading) return
    setLoading(true)
    // Simuler délai réseau
    setTimeout(() => {
      setLoading(false)
      onConfirm({ name, email, payMode })
    }, 1200)
  }

  return (
    <div>
      {/* Bouton retour */}
      <button
        type="button"
        onClick={onBack}
        className="rounded-[7px] px-[14px] py-[6px] mb-[16px] cursor-pointer transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
        style={{
          background:  'transparent',
          border:      '.5px solid var(--color-border)',
          fontFamily:  'var(--font-body)',
          fontSize:    12,
          color:       'var(--color-text-secondary)',
        }}
      >
        ← Modifier ma commande
      </button>

      <div className="grid gap-[20px]" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* Colonne gauche : récap + infos */}
        <div>
          <div
            className="font-bold uppercase tracking-[.1em] mb-[10px]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
          >
            Récapitulatif
          </div>

          {/* Panier */}
          <div
            className="rounded-[10px] px-[16px] py-[13px] mb-[14px]"
            style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
          >
            {lines.map((l) => (
              <div
                key={l.pack.id}
                className="flex justify-between py-[4px]"
                style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}
              >
                <span>
                  {l.pack.label}
                  <span className="ml-[6px]" style={{ color: 'var(--color-text-hint)' }}>
                    ×{l.qty}
                  </span>
                </span>
                <span>
                  {l.pack.price === 0
                    ? 'Gratuit'
                    : `${(l.pack.price * l.qty).toFixed(2).replace('.', ',')} €`}
                </span>
              </div>
            ))}
            <div
              className="flex justify-between items-baseline pt-[6px] mt-[6px]"
              style={{ borderTop: '.5px solid var(--color-sep)' }}
            >
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Total — {totalCartons} carton{totalCartons > 1 ? 's' : ''}
              </span>
              <span className="font-display" style={{ fontSize: 26, color: 'var(--color-amber)' }}>
                {total.toFixed(2).replace('.', ',')} €
              </span>
            </div>
          </div>

          {/* Infos participant */}
          <div
            className="font-bold uppercase tracking-[.1em] mb-[8px]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
          >
            Vos informations
          </div>

          {[
            { placeholder: 'Prénom Nom',        value: name,  setter: setName,  type: 'text' },
            { placeholder: 'Adresse email',     value: email, setter: setEmail, type: 'email' },
          ].map(({ placeholder, value, setter, type }) => (
            <input
              key={placeholder}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setter(e.target.value)}
              aria-label={placeholder}
              className="w-full rounded-[7px] mb-[8px]"
              style={{
                padding:    '8px 12px',
                border:     '.5px solid var(--color-border)',
                fontFamily: 'var(--font-body)',
                fontSize:   12,
                color:      'var(--color-text-primary)',
                background: 'var(--color-card)',
                outline:    'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-qblue)' }}
              onBlur={(e)  => { e.target.style.borderColor = 'var(--color-border)' }}
            />
          ))}
        </div>

        {/* Colonne droite : mode de paiement */}
        <div>
          <div
            className="font-bold uppercase tracking-[.1em] mb-[10px]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
          >
            Mode de paiement
          </div>

          {PAY_MODES.map((m) => {
            const isSel = payMode === m.id
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={isSel}
                onClick={() => setPayMode(m.id)}
                className="w-full flex items-center gap-[12px] rounded-[9px] px-[14px] py-[11px] mb-[8px] text-left cursor-pointer transition-all duration-[150ms]"
                style={{
                  background: isSel ? 'var(--color-qblue-bg)' : 'var(--color-card)',
                  border:     isSel ? '1.5px solid var(--color-qblue)' : '.5px solid var(--color-sep)',
                }}
              >
                <div
                  aria-hidden="true"
                  className="rounded-[6px] flex items-center justify-center flex-shrink-0"
                  style={{ width: 32, height: 32, background: m.iconBg }}
                >
                  {m.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    {m.sub}
                  </div>
                </div>
                {/* Radio dot */}
                <div
                  aria-hidden="true"
                  className="rounded-full flex items-center justify-center flex-shrink-0 ml-auto"
                  style={{
                    width: 15, height: 15,
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

          {/* Bouton payer */}
          <button
            type="button"
            onClick={handlePay}
            disabled={!canPay || loading}
            className="w-full rounded-[9px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed mt-[4px]"
            style={{
              padding:    '11px 0',
              background: 'var(--color-amber)',
              color:      '#2C1500',
              border:     'none',
              fontFamily: 'var(--font-body)',
              fontSize:   14,
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-[6px]">
                <span
                  aria-hidden="true"
                  className="inline-block rounded-full border-[2px] border-white/30 border-t-white animate-spin"
                  style={{ width: 15, height: 15, borderTopColor: 'white' }}
                />
                Traitement…
              </span>
            ) : (
              `Confirmer et payer ${total.toFixed(2).replace('.', ',')} €`
            )}
          </button>

          {/* Mention sécurité */}
          <div className="flex items-center justify-center gap-[5px] mt-[7px]">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="var(--color-text-hint)" strokeWidth="1.3" />
              <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="var(--color-text-hint)" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>
              Paiement sécurisé · données chiffrées
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
