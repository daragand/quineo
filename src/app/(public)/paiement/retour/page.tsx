'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams }             from 'next/navigation'
import { Suspense }                    from 'react'

// ─────────────────────────────────────────
// /paiement/retour — Page de retour après paiement
// Interroge l'API de vérification, puis affiche la confirmation ou une erreur.
// ─────────────────────────────────────────

interface PaymentResult {
  status:      'completed' | 'pending' | 'failed'
  paiement_id: string
  amount:      number
  first_name:  string
  last_name:   string
  email:       string
  cartons:     Array<{ id: string; serial_number: string }>
}

function RetourContent() {
  const params     = useSearchParams()
  const [state, setState] = useState<'checking' | 'success' | 'pending' | 'error'>('checking')
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const attempts = useRef(0)
  const MAX_ATTEMPTS = 10

  const paiementId = params.get('paiement_id')
  const provider   = params.get('provider')
  const sessionId  = params.get('session_id')   // Stripe
  const token      = params.get('token')         // PayPal

  useEffect(() => {
    if (!paiementId) {
      setErrorMsg('Paramètre de paiement manquant.')
      setState('error')
      return
    }

    const url = new URL('/api/public/payment/verify', window.location.origin)
    url.searchParams.set('paiement_id', paiementId)
    if (provider)  url.searchParams.set('provider',   provider)
    if (sessionId) url.searchParams.set('session_id', sessionId)
    if (token)     url.searchParams.set('token',      token)

    async function poll() {
      attempts.current += 1
      try {
        const res  = await fetch(url.toString())
        const data = await res.json() as PaymentResult & { error?: string }

        if (!res.ok) {
          if (res.status === 402) {
            setState('error')
            setErrorMsg('Le paiement a échoué ou a été annulé.')
            return
          }
          throw new Error(data.error ?? 'Erreur serveur')
        }

        if (data.status === 'completed') {
          setResult(data)
          setState('success')
          return
        }

        if (attempts.current >= MAX_ATTEMPTS) {
          setState('pending')
          return
        }

        // Réessayer dans 2 secondes
        setTimeout(poll, 2000)

      } catch (err) {
        console.error('[retour] poll error:', err)
        if (attempts.current >= MAX_ATTEMPTS) {
          setState('error')
          setErrorMsg('Impossible de vérifier le paiement. Vérifiez votre email de confirmation.')
        } else {
          setTimeout(poll, 3000)
        }
      }
    }

    // Petite pause pour laisser le provider traiter le paiement
    setTimeout(poll, 1000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Chargement ──────────────────────────────────────────────────────────
  if (state === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div
            className="inline-block rounded-full border-[3px] border-white/20 border-t-amber-400 animate-spin mb-[20px]"
            style={{ width: 44, height: 44, borderTopColor: 'var(--color-amber)' }}
          />
          <div className="font-bold" style={{ fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 6 }}>
            Vérification du paiement…
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Merci de patienter quelques instants
          </div>
        </div>
      </div>
    )
  }

  // ── En attente (timeout) ─────────────────────────────────────────────
  if (state === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center px-[16px]" style={{ background: 'var(--color-bg)' }}>
        <div
          className="rounded-[14px] px-[28px] py-[28px] max-w-[480px] w-full"
          style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
        >
          <div style={{ fontSize: 28, marginBottom: 14 }}>⏳</div>
          <div className="font-bold" style={{ fontSize: 17, color: 'var(--color-text-primary)', marginBottom: 10 }}>
            Paiement en cours de traitement
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            Votre paiement est en cours de vérification. Vous recevrez un email de confirmation
            dès qu&apos;il sera validé.
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>
            Référence : <code style={{ color: 'var(--color-amber)' }}>{paiementId?.slice(0, 8).toUpperCase()}</code>
          </div>
        </div>
      </div>
    )
  }

  // ── Erreur ──────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-[16px]" style={{ background: 'var(--color-bg)' }}>
        <div
          className="rounded-[14px] px-[28px] py-[28px] max-w-[480px] w-full"
          style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
        >
          <div
            className="rounded-full flex items-center justify-center mb-[14px]"
            style={{ width: 44, height: 44, background: 'var(--color-qred-bg)' }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v5M8 11v1" stroke="var(--color-qred)" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="8" cy="8" r="6.5" stroke="var(--color-qred)" strokeWidth="1.3" />
            </svg>
          </div>
          <div className="font-bold" style={{ fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            Paiement non abouti
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            {errorMsg || 'Une erreur est survenue lors du paiement.'}
          </div>
          <a
            href="javascript:history.back()"
            className="inline-block rounded-[8px] font-bold"
            style={{
              padding:    '9px 20px',
              background: 'var(--color-qblue-bg)',
              color:      'var(--color-qblue-text)',
              fontSize:   13,
              textDecoration: 'none',
            }}
          >
            ← Réessayer
          </a>
        </div>
      </div>
    )
  }

  // ── Succès ──────────────────────────────────────────────────────────────
  if (!result) return null
  const ref = result.paiement_id.slice(0, 8).toUpperCase()

  return (
    <div className="min-h-screen flex items-center justify-center px-[16px]" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-[480px] w-full">

        {/* Header succès */}
        <div
          className="rounded-t-[14px] px-[24px] py-[20px]"
          style={{ background: '#0b1220' }}
        >
          <div className="flex items-center gap-[10px] mb-[4px]">
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{ width: 30, height: 30, background: '#276749' }}
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="font-bold" style={{ fontSize: 15, color: 'white' }}>
              Paiement confirmé !
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginLeft: 40 }}>
            Réf. {ref}
          </div>
        </div>

        {/* Corps */}
        <div
          className="rounded-b-[14px] px-[24px] py-[20px]"
          style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
        >
          <div className="grid gap-[12px] mb-[18px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <div className="font-bold uppercase tracking-[.1em] mb-[4px]" style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                Participant
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                {result.first_name} {result.last_name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                {result.email}
              </div>
            </div>
            <div>
              <div className="font-bold uppercase tracking-[.1em] mb-[4px]" style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                Montant payé
              </div>
              <div className="font-display" style={{ fontSize: 24, color: 'var(--color-amber)' }}>
                {result.amount === 0 ? 'Gratuit' : `${result.amount.toFixed(2).replace('.', ',')} €`}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-qgreen-text)', fontWeight: 700 }}>
                Validé ✓
              </div>
            </div>
          </div>

          {/* Cartons */}
          <div className="font-bold uppercase tracking-[.1em] mb-[8px]" style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
            Vos {result.cartons.length} carton{result.cartons.length > 1 ? 's' : ''}
          </div>
          <div className="flex flex-wrap gap-[6px] mb-[18px]">
            {result.cartons.map((c) => (
              <span
                key={c.id}
                className="font-bold rounded-[5px] px-[9px] py-[3px]"
                style={{ fontSize: 12, background: 'var(--color-qblue-bg)', color: 'var(--color-qblue-text)', fontFamily: 'monospace' }}
              >
                {c.serial_number}
              </span>
            ))}
          </div>

          {/* Email */}
          <div
            className="flex items-start gap-[8px] rounded-[7px] px-[12px] py-[9px] mb-[16px]"
            style={{ background: 'var(--color-amber-bg)', border: '.5px solid rgba(239,159,39,.25)' }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
              <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="var(--color-amber)" strokeWidth="1.3" />
              <path d="M2 6l6 4 6-4" stroke="var(--color-amber)" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 11, color: 'var(--color-amber-deep)' }}>
              Un email de confirmation avec vos cartons en PDF a été envoyé à <strong>{result.email}</strong>
            </span>
          </div>

          {/* Lien display */}
          <div className="text-center">
            <div className="font-bold uppercase tracking-[.1em] mb-[6px]" style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>
              Le jour du loto
            </div>
            <a
              href="/display"
              className="inline-block rounded-[7px] font-bold transition-opacity duration-[150ms] hover:opacity-80"
              style={{ padding: '8px 18px', background: '#0b1220', color: 'var(--color-amber)', fontSize: 12, textDecoration: 'none' }}
            >
              Suivre le tirage en direct →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaiementRetourPage() {
  return (
    <Suspense>
      <RetourContent />
    </Suspense>
  )
}
