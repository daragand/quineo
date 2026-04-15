'use client'

import { useState }         from 'react'
import { PackGrid }         from '@/components/public/PackGrid'
import { CheckoutSummary }  from '@/components/public/CheckoutSummary'
import type { PublicPack }  from '@/components/public/PackGrid'
import type { Provider, OrderResult } from '@/components/public/CheckoutSummary'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface SessionPublicData {
  id:                  string
  display_code:        string
  name:                string
  date?:               string | null
  description?:        string | null
  status:              string
  max_cartons:         number
  available_cartons:   number
  association:         { name: string }
  packs:               PublicPack[]
  providers:           Provider[]
  require_birth_date:  boolean
}

type View = 'packs' | 'checkout' | 'confirm'

interface ConfirmState {
  result:     OrderResult
  firstName:  string
  lastName:   string
  email:      string
  payMode:    string
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function BoutiqueClient({ session }: { session: SessionPublicData }) {
  const [view,       setView]       = useState<View>('packs')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [confirm,    setConfirm]    = useState<ConfirmState | null>(null)

  function handleChangeQty(packId: string, qty: number) {
    setQuantities(prev => ({ ...prev, [packId]: qty }))
  }

  const cartLines = session.packs
    .filter(p => (quantities[p.id] ?? 0) > 0)
    .map(p    => ({ pack: p, qty: quantities[p.id] }))

  const totalCartons = cartLines.reduce((s, l) => s + l.pack.qty * l.qty, 0)

  function handleSuccess(result: OrderResult, firstName: string, lastName: string, email: string, payMode: string) {
    setConfirm({ result, firstName, lastName, email, payMode })
    setView('confirm')
  }

  return (
    <>
      {/* ── Vue 1 : Sélection des forfaits ── */}
      {view === 'packs' && (
        <div>
          <PackGrid
            packs={session.packs}
            quantities={quantities}
            alreadyBought={0}
            quotaMax={session.max_cartons}
            onChange={handleChangeQty}
          />

          <button
            type="button"
            onClick={() => setView('checkout')}
            disabled={cartLines.length === 0}
            className="w-full rounded-[9px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed mt-[16px]"
            style={{
              padding:    '12px 0',
              background: 'var(--color-amber)',
              color:      '#5C3A00',
              border:     'none',
              fontFamily: 'var(--font-body)',
              fontSize:   14,
            }}
          >
            {cartLines.length === 0
              ? 'Sélectionnez un forfait'
              : `Continuer — ${totalCartons} carton${totalCartons > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* ── Vue 2 : Récap + paiement ── */}
      {view === 'checkout' && (
        <CheckoutSummary
          sessionSlug={session.display_code}
          lines={cartLines}
          sessionName={session.name}
          sessionDate={session.date ?? null}
          providers={session.providers}
          requireBirthDate={session.require_birth_date}
          onBack={() => setView('packs')}
          onSuccess={handleSuccess}
        />
      )}

      {/* ── Vue 3 : Confirmation ── */}
      {view === 'confirm' && confirm && (
        <ConfirmView
          session={session}
          confirm={confirm}
          onNewOrder={() => {
            setQuantities({})
            setConfirm(null)
            setView('packs')
          }}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────
// Vue confirmation
// ─────────────────────────────────────────

function ConfirmView({
  session,
  confirm,
  onNewOrder,
}: {
  session:    SessionPublicData
  confirm:    ConfirmState
  onNewOrder: () => void
}) {
  const { result, firstName, lastName, email } = confirm
  const cartons  = result.cartons
  const amount   = result.amount
  const ref      = result.paiement_id.slice(0, 8).toUpperCase()

  return (
    <div>
      {/* Card header */}
      <div
        className="rounded-t-[12px] px-[20px] py-[18px]"
        style={{ background: '#0D1E2C' }}
      >
        <div className="flex items-center gap-[10px] mb-[4px]">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ width: 28, height: 28, background: '#276749' }}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="font-bold" style={{ fontSize: 14, color: 'white' }}>
            Commande confirmée !
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginLeft: 38 }}>
          {session.name} · Réf. {ref}
        </div>
      </div>

      {/* Card body */}
      <div
        className="rounded-b-[12px] px-[20px] py-[18px]"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
      >
        {/* Infos acheteur */}
        <div className="grid gap-[12px] mb-[18px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <div
              className="font-bold uppercase tracking-[.1em] mb-[4px]"
              style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
            >
              Participant
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
              {firstName} {lastName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {email}
            </div>
          </div>
          <div>
            <div
              className="font-bold uppercase tracking-[.1em] mb-[4px]"
              style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
            >
              Paiement
            </div>
            <div className="font-display" style={{ fontSize: 22, color: 'var(--color-amber)' }}>
              {amount === 0 ? 'Gratuit' : `${amount.toFixed(2).replace('.', ',')} €`}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-qgreen-text)', fontWeight: 700 }}>
              Validé ✓
            </div>
          </div>
        </div>

        {/* Cartons */}
        <div
          className="font-bold uppercase tracking-[.1em] mb-[8px]"
          style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
        >
          Vos {cartons.length} carton{cartons.length > 1 ? 's' : ''}
        </div>
        <div className="flex flex-wrap gap-[6px] mb-[18px]">
          {cartons.map((c) => (
            <span
              key={c.id}
              className="font-bold rounded-[5px] px-[9px] py-[3px]"
              style={{ fontSize: 12, background: 'var(--color-qblue-bg)', color: 'var(--color-qblue-text)', fontFamily: 'monospace' }}
            >
              {c.serial_number}
            </span>
          ))}
        </div>

        {/* Email de confirmation */}
        <div
          className="flex items-start gap-[8px] rounded-[7px] px-[12px] py-[9px] mb-[16px]"
          style={{ background: 'var(--color-amber-bg)', border: '.5px solid rgba(239,159,39,.25)' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
            <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="var(--color-amber)" strokeWidth="1.3" />
            <path d="M2 6l6 4 6-4" stroke="var(--color-amber)" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 11, color: 'var(--color-amber-deep)' }}>
            Un email de confirmation avec vos cartons en PDF a été envoyé à <strong>{email}</strong>
          </span>
        </div>

        {/* Lien suivi */}
        <div className="text-center">
          <div
            className="font-bold uppercase tracking-[.1em] mb-[6px]"
            style={{ fontSize: 10, color: 'var(--color-text-hint)' }}
          >
            Le jour du loto
          </div>
          <a
            href="/display"
            className="inline-block rounded-[7px] font-bold transition-opacity duration-[150ms] hover:opacity-80"
            style={{
              padding:    '8px 18px',
              background: '#0D1E2C',
              color:      'var(--color-amber)',
              fontSize:   12,
              textDecoration: 'none',
            }}
          >
            Suivre le tirage en direct →
          </a>
          {session.display_code && (
            <div style={{ fontSize: 11, color: 'var(--color-text-hint)', marginTop: 6 }}>
              Code : <strong style={{ color: 'var(--color-amber)', letterSpacing: '.1em' }}>{session.display_code}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Nouvelle commande */}
      <div className="text-center mt-[14px]">
        <button
          type="button"
          onClick={onNewOrder}
          className="cursor-pointer transition-colors duration-[150ms]"
          style={{ fontSize: 12, color: 'var(--color-text-hint)', background: 'none', border: 'none', fontFamily: 'var(--font-body)' }}
        >
          Acheter d&apos;autres cartons
        </button>
      </div>
    </div>
  )
}
