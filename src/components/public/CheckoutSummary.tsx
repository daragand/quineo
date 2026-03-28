'use client'

import { useState } from 'react'
import type { PublicPack } from './PackGrid'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface Provider {
  type: string   // 'stripe' | 'sumup' | 'helloasso' | 'other'
  name: string
}

interface CartLine {
  pack: PublicPack
  qty:  number
}

export interface OrderResult {
  paiement_id: string
  cartons:     Array<{ id: string; serial_number: string }>
  amount:      number
}

interface CheckoutSummaryProps {
  sessionSlug: string
  lines:       CartLine[]
  sessionName: string
  sessionDate: string | null
  providers:   Provider[]
  onBack:      () => void
  onSuccess:   (result: OrderResult, firstName: string, lastName: string, email: string, payMode: string) => void
}

// ─────────────────────────────────────────
// Config modes paiement (fallback si aucun provider configuré)
// ─────────────────────────────────────────

type IconSpec = { bg: string; icon: React.ReactNode }

const PROVIDER_ICONS: Record<string, IconSpec> = {
  stripe: {
    bg:   '#635BFF',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.8" />
        <path d="M2 10h20" stroke="white" strokeWidth="1.8" />
      </svg>
    ),
  },
  sumup: {
    bg:   '#1DBF73',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v18M3 12h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  helloasso: {
    bg:   '#E5007D',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21C12 21 4 14 4 9a8 8 0 0116 0c0 5-8 12-8 12z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  other: {
    bg:   '#475569',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.8" />
        <path d="M6 12h4M14 12h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
}

const DEFAULT_PROVIDER: Provider = { type: 'online', name: 'Paiement en ligne sécurisé' }
const DEFAULT_ICON: IconSpec = {
  bg: '#0b1220',
  icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth="1.8" />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
}

function resolveIcon(type: string): IconSpec {
  return PROVIDER_ICONS[type] ?? DEFAULT_ICON
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function CheckoutSummary({
  sessionSlug,
  lines,
  sessionName,
  sessionDate,
  providers,
  onBack,
  onSuccess,
}: CheckoutSummaryProps) {
  const availableProviders = providers.length > 0 ? providers : [DEFAULT_PROVIDER]

  const [firstName, setFirstName]  = useState('')
  const [lastName,  setLastName]   = useState('')
  const [email,     setEmail]      = useState('')
  const [payMode,   setPayMode]    = useState<string>(availableProviders[0].type)
  const [loading,   setLoading]    = useState(false)
  const [error,     setError]      = useState('')

  const total        = lines.reduce((s, l) => s + l.pack.price * l.qty, 0)
  const totalCartons = lines.reduce((s, l) => s + l.pack.qty * l.qty, 0)

  const canPay = firstName.trim().length > 0
    && lastName.trim().length > 0
    && email.includes('@')
    && email.includes('.')

  async function handlePay() {
    if (!canPay || loading) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/public/sessions/${sessionSlug}/order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          first_name: firstName.trim(),
          last_name:  lastName.trim(),
          email:      email.trim().toLowerCase(),
          items:      lines.map(l => ({
            carton_pack_id: l.pack.id,
            quantity:       l.qty,
          })),
          method: 'ONLINE',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue, veuillez réessayer.')
        return
      }

      onSuccess(data as OrderResult, firstName.trim(), lastName.trim(), email.trim().toLowerCase(), payMode)
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Bouton retour */}
      <button
        type="button"
        onClick={onBack}
        className="rounded-[7px] px-[14px] py-[6px] mb-[16px] cursor-pointer transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
        style={{
          background: 'transparent',
          border:     '.5px solid var(--color-border)',
          fontFamily: 'var(--font-body)',
          fontSize:   12,
          color:      'var(--color-text-secondary)',
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
                {total === 0 ? 'Gratuit' : `${total.toFixed(2).replace('.', ',')} €`}
              </span>
            </div>
          </div>

          {/* Session */}
          {sessionDate && (
            <div
              className="rounded-[8px] px-[12px] py-[9px] mb-[14px] flex items-center gap-[8px]"
              style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)', fontSize: 11, color: 'var(--color-text-secondary)' }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="var(--color-text-hint)" strokeWidth="1.3"/>
                <path d="M5 1v3M11 1v3M2 7h12" stroke="var(--color-text-hint)" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              {sessionName} · {new Date(sessionDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}

          {/* Infos participant */}
          <div
            className="font-bold uppercase tracking-[.1em] mb-[8px]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
          >
            Vos informations
          </div>

          <div className="grid gap-[8px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {[
              { placeholder: 'Prénom',  value: firstName, setter: setFirstName, auto: 'given-name' },
              { placeholder: 'Nom',     value: lastName,  setter: setLastName,  auto: 'family-name' },
            ].map(({ placeholder, value, setter, auto }) => (
              <input
                key={placeholder}
                type="text"
                placeholder={placeholder}
                value={value}
                autoComplete={auto}
                onChange={(e) => setter(e.target.value)}
                aria-label={placeholder}
                className="rounded-[7px]"
                style={{
                  padding:    '8px 12px',
                  border:     '.5px solid var(--color-border)',
                  fontFamily: 'var(--font-body)',
                  fontSize:   12,
                  color:      'var(--color-text-primary)',
                  background: 'var(--color-card)',
                  outline:    'none',
                  width:      '100%',
                  boxSizing:  'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-qblue)' }}
                onBlur={(e)  => { e.target.style.borderColor = 'var(--color-border)' }}
              />
            ))}
          </div>
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Adresse email"
            className="w-full rounded-[7px] mt-[8px]"
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
        </div>

        {/* Colonne droite : mode de paiement */}
        <div>
          <div
            className="font-bold uppercase tracking-[.1em] mb-[10px]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
          >
            Mode de paiement
          </div>

          {availableProviders.map((m) => {
            const isSel   = payMode === m.type
            const iconSpec = resolveIcon(m.type)
            return (
              <button
                key={m.type}
                type="button"
                role="radio"
                aria-checked={isSel}
                onClick={() => setPayMode(m.type)}
                className="w-full flex items-center gap-[12px] rounded-[9px] px-[14px] py-[11px] mb-[8px] text-left cursor-pointer transition-all duration-[150ms]"
                style={{
                  background: isSel ? 'var(--color-qblue-bg)' : 'var(--color-card)',
                  border:     isSel ? '1.5px solid var(--color-qblue)' : '.5px solid var(--color-sep)',
                }}
              >
                <div
                  aria-hidden="true"
                  className="rounded-[6px] flex items-center justify-center flex-shrink-0"
                  style={{ width: 32, height: 32, background: iconSpec.bg }}
                >
                  {iconSpec.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    Paiement sécurisé
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="rounded-full flex items-center justify-center flex-shrink-0 ml-auto"
                  style={{
                    width: 15, height: 15,
                    background: isSel ? 'var(--color-qblue)' : 'var(--color-bg)',
                    border:     `.5px solid ${isSel ? 'var(--color-qblue)' : 'var(--color-border)'}`,
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

          {/* Erreur */}
          {error && (
            <div
              className="rounded-[7px] px-[12px] py-[8px] mb-[8px]"
              role="alert"
              style={{ background: 'var(--color-qred-bg)', fontSize: 12, color: 'var(--color-qred)', border: '.5px solid var(--color-qred)' }}
            >
              {error}
            </div>
          )}

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
              total === 0
                ? 'Confirmer la commande →'
                : `Confirmer et payer ${total.toFixed(2).replace('.', ',')} €`
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
