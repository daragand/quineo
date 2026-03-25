'use client'

import { useState, useEffect } from 'react'
import { SessionFinder }    from '@/components/public/SessionFinder'
import { PackGrid }         from '@/components/public/PackGrid'
import type { PublicPack }  from '@/components/public/PackGrid'
import { CheckoutSummary }  from '@/components/public/CheckoutSummary'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type View = 'finder' | 'session' | 'checkout' | 'confirm'

type OnlinePayMode = 'stripe' | 'sumup' | 'helloasso'

interface ConfirmInfo {
  name:    string
  email:   string
  payMode: OnlinePayMode
}

interface SessionData {
  slug:        string
  code:        string
  name:        string
  association: string
  lieu:        string
  date:        string
  quotaMax:    number
  packs:       PublicPack[]
}

// ─────────────────────────────────────────
// Données de démo
// ─────────────────────────────────────────

const DEMO_SESSION: SessionData = {
  slug:        'grand-loto-printemps-2025',
  code:        'LPRI25',
  name:        'Grand Loto de Printemps 2025',
  association: 'Amis du Quartier',
  lieu:        'Lyon 3e',
  date:        '22 mars 2025',
  quotaMax:    30,
  packs: [
    { id: 1, qty: 1,  label: '1 carton',   price: 3,  unitPrice: 3,    maxPer: null },
    { id: 2, qty: 3,  label: '3 cartons',  price: 8,  unitPrice: 2.67, maxPer: null, featured: true },
    { id: 3, qty: 6,  label: '6 cartons',  price: 15, unitPrice: 2.50, maxPer: null, eco: '-17%' },
    { id: 4, qty: 10, label: '10 cartons', price: 24, unitPrice: 2.40, maxPer: 1 },
  ],
}

function resolveSession(slug: string): SessionData | null {
  if (slug === DEMO_SESSION.slug) return DEMO_SESSION
  return null
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function buildCartonList(start: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `C${String(start + i).padStart(3, '0')}`)
}

const PAY_LABELS: Record<OnlinePayMode, string> = {
  stripe:    'Carte bancaire (Stripe)',
  sumup:     'SumUp',
  helloasso: 'HelloAsso',
}

// ─────────────────────────────────────────
// Composants internes
// ─────────────────────────────────────────

function QuineoLogo() {
  return (
    <div className="flex items-center gap-[8px]">
      <div
        aria-hidden="true"
        className="rounded-[5px] flex items-center justify-center font-display"
        style={{ width: 28, height: 28, background: 'var(--color-amber)', fontSize: 17, color: '#412402' }}
      >
        Q
      </div>
      <span
        className="font-bold uppercase tracking-[.06em]"
        style={{ fontSize: 13, color: 'var(--color-text-primary)' }}
      >
        Quineo
      </span>
    </div>
  )
}

function TopBar({ session }: { session: SessionData | null }) {
  return (
    <div
      className="flex items-center justify-between px-[20px] py-[10px] sticky top-0 z-10"
      style={{ background: 'var(--color-card)', borderBottom: '.5px solid var(--color-sep)' }}
    >
      <QuineoLogo />
      {session && (
        <div className="flex items-center gap-[8px]">
          <span
            className="font-bold rounded-[4px] px-[8px] py-[2px]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-bg)' }}
          >
            {session.code}
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {session.name}
          </span>
        </div>
      )}
      <div style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
        Paiement sécurisé
      </div>
    </div>
  )
}

function SessionHeader({ session }: { session: SessionData }) {
  return (
    <div
      className="rounded-[10px] px-[16px] py-[12px] mb-[20px]"
      style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
    >
      <div className="font-bold" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
        {session.name}
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
        {session.association} · {session.lieu} · {session.date}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function PublicSessionPage({
  params,
}: {
  params: { slug: string }
}) {
  const [view, setView]             = useState<View>('finder')
  const [session, setSession]       = useState<SessionData | null>(null)
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [confirm, setConfirm]       = useState<ConfirmInfo | null>(null)

  // Si on arrive directement sur /s/[slug], charger la session
  useEffect(() => {
    const data = resolveSession(params.slug)
    if (data) {
      setSession(data)
      setView('session')
    }
  }, [params.slug])

  function handleNavigate(slug: string) {
    const data = resolveSession(slug)
    if (data) {
      setSession(data)
      setQuantities({})
      setView('session')
    } else {
      // Slug inconnu — on reste sur finder (l'erreur est gérée dans SessionFinder)
    }
  }

  function handleChangeQty(packId: number, qty: number) {
    setQuantities((prev) => ({ ...prev, [packId]: qty }))
  }

  const cartLines = session
    ? session.packs
        .filter((p) => (quantities[p.id] ?? 0) > 0)
        .map((p) => ({ pack: p, qty: quantities[p.id] }))
    : []

  const totalCartons = cartLines.reduce((s, l) => s + l.pack.qty * l.qty, 0)

  function handleProceedToCheckout() {
    setView('checkout')
  }

  function handleConfirm(info: ConfirmInfo) {
    setConfirm(info)
    setView('confirm')
  }

  // Liste de cartons attribués (démo : part de 101)
  const cartons = confirm ? buildCartonList(101, totalCartons) : []

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <TopBar session={session} />

      <div
        className="mx-auto px-[16px] py-[24px]"
        style={{ maxWidth: 680 }}
      >

        {/* ── Vue 1 : Finder ── */}
        {view === 'finder' && (
          <SessionFinder onNavigate={handleNavigate} />
        )}

        {/* ── Vue 2 : Sélection des forfaits ── */}
        {view === 'session' && session && (
          <div>
            <SessionHeader session={session} />

            <PackGrid
              packs={session.packs}
              quantities={quantities}
              alreadyBought={0}
              quotaMax={session.quotaMax}
              onChange={handleChangeQty}
            />

            {/* Bouton suivant */}
            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={cartLines.length === 0}
              className="w-full rounded-[9px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed mt-[16px]"
              style={{
                padding:    '12px 0',
                background: 'var(--color-amber)',
                color:      '#2C1500',
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

        {/* ── Vue 3 : Récap + paiement ── */}
        {view === 'checkout' && session && (
          <CheckoutSummary
            lines={cartLines}
            sessionName={session.name}
            sessionCode={session.code}
            sessionDate={session.date}
            sessionLieu={session.lieu}
            onBack={() => setView('session')}
            onConfirm={handleConfirm}
          />
        )}

        {/* ── Vue 4 : Confirmation ── */}
        {view === 'confirm' && session && confirm && (
          <div>
            {/* Card header */}
            <div
              className="rounded-t-[12px] px-[20px] py-[18px]"
              style={{ background: '#0b1220' }}
            >
              <div className="flex items-center gap-[10px] mb-[4px]">
                {/* Check */}
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
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginLeft: 38 }}>
                {session.name} · {session.code}
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
                    {confirm.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    {confirm.email}
                  </div>
                </div>
                <div>
                  <div
                    className="font-bold uppercase tracking-[.1em] mb-[4px]"
                    style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
                  >
                    Paiement
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                    {PAY_LABELS[confirm.payMode]}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-qgreen-text)', fontWeight: 700 }}>
                    Validé
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
                    key={c}
                    className="font-bold rounded-[5px] px-[9px] py-[3px]"
                    style={{ fontSize: 12, background: 'var(--color-qblue-bg)', color: 'var(--color-qblue-text)' }}
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Confirmation email */}
              <div
                className="flex items-start gap-[8px] rounded-[7px] px-[12px] py-[9px] mb-[16px]"
                style={{ background: 'var(--color-amber-bg)', border: '.5px solid rgba(239,159,39,.25)' }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                  <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="var(--color-amber)" strokeWidth="1.3" />
                  <path d="M2 6l6 4 6-4" stroke="var(--color-amber)" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 11, color: 'var(--color-amber-deep)' }}>
                  Un email de confirmation a été envoyé à <strong>{confirm.email}</strong>
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
                <button
                  type="button"
                  onClick={() => setView('session')}
                  className="rounded-[7px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-80"
                  style={{
                    padding:    '8px 18px',
                    background: '#0b1220',
                    color:      'var(--color-amber)',
                    border:     'none',
                    fontFamily: 'var(--font-body)',
                    fontSize:   12,
                  }}
                >
                  Suivre le tirage en direct →
                </button>
              </div>
            </div>

            {/* Nouvelle commande */}
            <div className="text-center mt-[14px]">
              <button
                type="button"
                onClick={() => {
                  setQuantities({})
                  setConfirm(null)
                  setView('session')
                }}
                className="cursor-pointer transition-colors duration-[150ms]"
                style={{ fontSize: 12, color: 'var(--color-text-hint)', background: 'none', border: 'none', fontFamily: 'var(--font-body)' }}
              >
                Acheter d&apos;autres cartons
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
