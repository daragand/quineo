'use client'

import { useState } from 'react'
import { ParticipantSearch, type Participant } from '@/components/caisse/ParticipantSearch'
import { ForfaitList, type Pack } from '@/components/caisse/ForfaitList'
import { PaymentMode, type PayMode } from '@/components/caisse/PaymentMode'
import { SuccessModal } from '@/components/caisse/SuccessModal'

// ─────────────────────────────────────────
// Données de démo
// ─────────────────────────────────────────

const QUOTA_MAX = 30
const TOTAL_CARTONS = 500

const DEMO_PARTICIPANTS: Participant[] = [
  { id: 1, name: 'Sophie Martin',      email: 's.martin@email.fr',   color: '#185FA5', cartonsBought: 4  },
  { id: 2, name: 'Jean-Pierre Durand', email: 'jp.durand@email.fr',  color: '#3B6D11', cartonsBought: 0  },
  { id: 3, name: 'Marie Lefebvre',     email: 'm.lefebvre@email.fr', color: '#A32D2D', cartonsBought: 28 },
  { id: 4, name: 'Thomas Bernard',     email: 't.bernard@email.fr',  color: '#7C3AED', cartonsBought: 1  },
  { id: 5, name: 'Isabelle Moreau',    email: 'i.moreau@email.fr',   color: '#0891B2', cartonsBought: 0  },
]

const DEMO_PACKS: Pack[] = [
  { id: 1, qty: 1,  label: 'Carton solo',      price: 3,  unitPrice: 3,   eco: undefined,  maxPer: null, color: '#185FA5'              },
  { id: 2, qty: 4,  label: 'Lot de 4 cartons', price: 10, unitPrice: 2.5, eco: '-17 %',    maxPer: null, color: '#3B6D11', featured: true },
  { id: 3, qty: 10, label: 'Lot de 10 cartons',price: 20, unitPrice: 2,   eco: '-33 %',    maxPer: 2,    color: '#BA7517'               },
  { id: 4, qty: 1,  label: 'Carton découverte', price: 0,  unitPrice: 0,   eco: undefined,  maxPer: 1,    color: '#7C3AED'               },
]

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function cartonsInCart(qtys: Record<number, number>): number {
  return DEMO_PACKS.reduce((s, p) => s + p.qty * (qtys[p.id] ?? 0), 0)
}

function totalPrice(qtys: Record<number, number>): number {
  return DEMO_PACKS.reduce((s, p) => s + p.price * (qtys[p.id] ?? 0), 0)
}

function buildRanges(from: number, count: number) {
  return [{ from, to: from + count - 1 }]
}

// ─────────────────────────────────────────
// Sections labels
// ─────────────────────────────────────────

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div
      className="font-bold uppercase tracking-[.1em] mb-[7px]"
      style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
    >
      {n} · {label}
    </div>
  )
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function CaissePage() {
  const [participants, setParticipants] = useState<Participant[]>(DEMO_PARTICIPANTS)
  const [selected, setSelected]         = useState<Participant | null>(null)
  const [quantities, setQuantities]     = useState<Record<number, number>>({})
  const [payMode, setPayMode]           = useState<PayMode>('cash')
  const [totalSold, setTotalSold]       = useState(347)
  const [successData, setSuccessData]   = useState<Parameters<typeof SuccessModal>[0]['data'] | null>(null)

  const cartsTotal   = cartonsInCart(quantities)
  const amountDue    = totalPrice(quantities)
  const hasSelection = !!selected && cartsTotal > 0
  const canValidate  = hasSelection

  // ── Sélectionner un participant ──────────

  function selectParticipant(p: Participant) {
    setSelected(p)
    setQuantities({})
  }

  function selectNew() {
    setSelected({ id: 0, name: 'Nouveau participant', email: '(sans compte)', color: '#8a95a3', cartonsBought: 0 })
    setQuantities({})
  }

  // ── Changer une quantité ─────────────────

  function handleQtyChange(packId: number, qty: number) {
    setQuantities((prev) => ({ ...prev, [packId]: qty }))
  }

  // ── Valider la vente ─────────────────────

  function validate() {
    if (!selected || cartsTotal === 0) return

    const nextSold = totalSold + cartsTotal

    setSuccessData({
      participantName:  selected.name,
      participantEmail: selected.email,
      cartonsCount:     cartsTotal,
      totalPaid:        amountDue,
      payMode,
      ranges:           buildRanges(totalSold + 1, cartsTotal),
    })

    // Mettre à jour le participant
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? { ...p, cartonsBought: p.cartonsBought + cartsTotal }
          : p
      )
    )
    setTotalSold(nextSold)
  }

  // ── Fermer le modal succès ────────────────

  function closeSuccess() {
    setSuccessData(null)
    setSelected(null)
    setQuantities({})
    setPayMode('cash')
  }

  // ── Annuler ──────────────────────────────

  function reset() {
    setSelected(null)
    setQuantities({})
    setPayMode('cash')
  }

  const remaining = TOTAL_CARTONS - totalSold

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden" style={{ margin: '-16px -20px' }}>

      {/* ── Panneau gauche ── */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: '55%', borderRight: '.5px solid var(--color-sep)' }}
      >
        {/* Recherche participant */}
        <div
          className="flex-shrink-0 px-[12px] py-[10px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}
        >
          <StepLabel n={1} label="Participant" />
          <ParticipantSearch
            participants={participants}
            selected={selected}
            quotaMax={QUOTA_MAX}
            onSelect={selectParticipant}
            onNewParticipant={selectNew}
          />
        </div>

        {/* Forfaits */}
        <div className="flex-1 overflow-y-auto px-[12px] py-[10px]">
          <StepLabel n={2} label="Forfait & quantité" />

          {selected ? (
            <ForfaitList
              packs={DEMO_PACKS}
              quantities={quantities}
              alreadyBought={selected.cartonsBought}
              quotaMax={QUOTA_MAX}
              onChangeQty={handleQtyChange}
            />
          ) : (
            <p
              className="text-center"
              style={{ padding: '28px 10px', fontSize: 12, color: 'var(--color-text-hint)', lineHeight: 1.8 }}
            >
              Sélectionnez d&apos;abord un participant
            </p>
          )}
        </div>
      </div>

      {/* ── Panneau droit ── */}
      <div
        className="flex flex-col overflow-hidden flex-1"
        style={{ background: 'var(--color-card)' }}
      >
        {/* En-tête */}
        <div
          className="flex-shrink-0 px-[12px] py-[10px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}
        >
          <StepLabel n={3} label="Paiement & validation" />
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-[12px] py-[10px]">
          {!hasSelection ? (
            <p
              className="text-center"
              style={{ padding: '28px 10px', fontSize: 12, color: 'var(--color-text-hint)', lineHeight: 1.8 }}
            >
              Sélectionnez un participant<br />et au moins un forfait
            </p>
          ) : (
            <div>
              {/* Récapitulatif */}
              <div
                className="rounded-[8px] px-[11px] py-[9px] mb-[10px]"
                style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)' }}
                aria-label="Récapitulatif de la vente"
              >
                <div className="flex justify-between items-baseline mb-[4px]">
                  <span className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                    {selected!.name}
                  </span>
                  <span className="font-display" style={{ fontSize: 18, color: 'var(--color-amber)' }}>
                    {amountDue.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
                {DEMO_PACKS.filter((p) => (quantities[p.id] ?? 0) > 0).map((p) => {
                  const qty = quantities[p.id]
                  return (
                    <div key={p.id} className="flex justify-between" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      <span>{p.label} ×{qty}</span>
                      <span>{(p.price * qty).toFixed(2).replace('.', ',')} €</span>
                    </div>
                  )
                })}
                <div
                  className="flex justify-between font-bold mt-[5px] pt-[5px]"
                  style={{ fontSize: 11, color: 'var(--color-text-secondary)', borderTop: '.5px solid var(--color-sep)' }}
                >
                  <span>{cartsTotal} carton{cartsTotal > 1 ? 's' : ''}</span>
                  <span>{selected!.cartonsBought + cartsTotal} / {QUOTA_MAX} pour ce participant</span>
                </div>
              </div>

              {/* Mode paiement */}
              <div
                className="font-bold uppercase tracking-[.1em] mb-[5px]"
                style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
              >
                Mode de paiement
              </div>
              <PaymentMode
                mode={payMode}
                totalDue={amountDue}
                onModeChange={setPayMode}
              />
            </div>
          )}
        </div>

        {/* Footer validation */}
        {hasSelection && (
          <div
            className="flex-shrink-0 px-[12px] py-[9px]"
            style={{ borderTop: '.5px solid var(--color-sep)', background: 'var(--color-bg)' }}
          >
            <div className="flex gap-[7px]">
              <button
                type="button"
                onClick={reset}
                className="rounded-[8px] px-[14px] py-[9px] cursor-pointer transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
                style={{
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  border: '.5px solid var(--color-border)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={validate}
                disabled={!canValidate}
                className="flex-1 rounded-[8px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
                style={{
                  padding: '9px 0',
                  background: 'var(--color-amber)',
                  color: '#2C1500',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                }}
              >
                Valider la vente
              </button>
            </div>
            <p
              className="text-center mt-[5px]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}
            >
              Les cartons sont attribués immédiatement après validation
            </p>
          </div>
        )}
      </div>

      {/* ── Modal succès ── */}
      {successData && (
        <SuccessModal data={successData} onClose={closeSuccess} />
      )}
    </div>
  )
}
