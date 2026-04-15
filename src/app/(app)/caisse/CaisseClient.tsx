'use client'

import { useState, useCallback, useRef } from 'react'
import { SmartDateInput } from '@/components/ui/SmartDateInput'
import { ParticipantSearch, type Participant } from '@/components/caisse/ParticipantSearch'
import { ForfaitList, type Pack } from '@/components/caisse/ForfaitList'
import { PaymentMode, type PayMode } from '@/components/caisse/PaymentMode'
import { SuccessModal } from '@/components/caisse/SuccessModal'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface Session {
  id: string
  name: string
  status: string
  max_cartons: number | null
}

interface CaisseClientProps {
  session:          Session | null
  packs:            Pack[]
  cartonsAvailable: number
  cartonsTotal:     number
  requireBirthDate: boolean
}

const AVATAR_COLORS = ['#4A90B8', '#2BBFA4', '#534AB7', '#B84000', '#A32D2D', '#0891B2']
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

const METHOD_MAP: Record<PayMode, string> = {
  cash: 'CASH',
  cb:   'EXTERNAL_TERMINAL',
  free: 'FREE',
}

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="font-bold uppercase tracking-[.1em] mb-[7px]"
      style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
      {n} · {label}
    </div>
  )
}

// ─────────────────────────────────────────
// Modal nouveau participant
// ─────────────────────────────────────────

function NewParticipantModal({
  onCreated,
  onClose,
  requireBirthDate,
}: {
  onCreated:        (p: Participant) => void
  onClose:          () => void
  requireBirthDate: boolean
}) {
  const [firstName,  setFirstName]  = useState('')
  const [lastName,   setLastName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [birthDate,  setBirthDate]  = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  async function handleCreate() {
    if (!firstName && !lastName && !email) {
      setError('Au moins un nom ou un email est requis')
      return
    }
    if (requireBirthDate && !birthDate) {
      setError('La date de naissance est obligatoire')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name:  firstName  || undefined,
        last_name:   lastName   || undefined,
        email:       email      || undefined,
        phone:       phone      || undefined,
        birth_date:  birthDate  || undefined,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la création')
      return
    }
    const data = await res.json()
    const p = data.participant
    const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'Participant'
    onCreated({
      id:            p.id,
      name,
      email:         p.email ?? '(sans compte)',
      birthDate:     p.birth_date ?? undefined,
      color:         avatarColor(name),
      cartonsBought: 0,
    })
  }

  const inputCls = 'w-full rounded-[6px]'
  const inputStyle = { padding: '7px 9px', border: '.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 12, background: 'var(--color-bg)', color: 'var(--color-text-primary)', outline: 'none' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rounded-[14px] w-full overflow-hidden"
        style={{ maxWidth: 400, background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
        <div className="flex items-center justify-between px-[18px] py-[13px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}>
          <span className="font-bold" style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
            Nouveau participant
          </span>
          <button type="button" onClick={onClose} aria-label="Fermer"
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            ×
          </button>
        </div>
        <div className="px-[18px] py-[16px] flex flex-col gap-[10px]">
          <div className="grid gap-[8px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Prénom</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean"
                className="w-full rounded-[6px] mt-[4px]" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Nom</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont"
                className="w-full rounded-[6px] mt-[4px]" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Date de naissance{requireBirthDate ? <span style={{ color: 'var(--color-qred)' }}> *</span> : ' (optionnelle)'}
            </label>
            <div className="mt-[4px]">
              <SmartDateInput
                value={birthDate}
                onChange={setBirthDate}
                required={requireBirthDate}
                className={inputCls}
                inputStyle={inputStyle}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Email (optionnel)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean@exemple.fr"
              className="w-full rounded-[6px] mt-[4px]" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Téléphone (optionnel)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 00 00 00 00"
              className="w-full rounded-[6px] mt-[4px]" style={inputStyle} />
          </div>
          {error && <p style={{ fontSize: 11, color: 'var(--color-qred)' }}>{error}</p>}
          <div className="flex gap-[8px] mt-[4px]">
            <button type="button" onClick={handleCreate} disabled={loading}
              className="flex-1 rounded-[8px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-90 disabled:opacity-50"
              style={{ padding: '9px 0', background: 'var(--color-amber)', color: '#5C3A00', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13 }}>
              {loading ? 'Création…' : 'Créer le participant'}
            </button>
            <button type="button" onClick={onClose}
              className="rounded-[8px] px-[14px] cursor-pointer"
              style={{ background: 'transparent', border: '.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Page caisse
// ─────────────────────────────────────────

export default function CaisseClient({ session, packs, cartonsAvailable, requireBirthDate }: CaisseClientProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selected,     setSelected]     = useState<Participant | null>(null)
  const [quantities,   setQuantities]   = useState<Record<string, number>>({})
  const [payMode,      setPayMode]      = useState<PayMode>('cash')
  const [successData,  setSuccessData]  = useState<Parameters<typeof SuccessModal>[0]['data'] | null>(null)
  const [showNewPart,  setShowNewPart]  = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const quotaMax = session?.max_cartons ?? 0

  // ── Helpers ──────────────────────────────

  function cartonsInCart() {
    return packs.reduce((s, p) => s + p.qty * (quantities[p.id] ?? 0), 0)
  }

  function totalPrice() {
    return packs.reduce((s, p) => s + p.price * (quantities[p.id] ?? 0), 0)
  }

  const cartsTotal   = cartonsInCart()
  const amountDue    = totalPrice()
  const hasSelection = !!selected && cartsTotal > 0

  // ── Recherche participants ────────────────

  const searchParticipants = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!q.trim()) { setParticipants([]); return }
      const url = `/api/participants?q=${encodeURIComponent(q)}${session ? `&session_id=${session.id}` : ''}`
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setParticipants(data.participants.map((p: any) => {
        const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'Participant'
        const soldCartons = (p.cartons ?? []).filter((c: { status: string }) => c.status === 'sold').length
        return {
          id:            p.id,
          name,
          email:         p.email ?? '(sans compte)',
          birthDate:     p.birth_date ?? undefined,
          color:         avatarColor(name),
          cartonsBought: soldCartons,
        }
      }))
    }, 250)
  }, [session])

  // ── Actions ──────────────────────────────

  function selectParticipant(p: Participant) {
    setSelected(p)
    setQuantities({})
    setError('')
  }

  function handleQtyChange(packId: string, qty: number) {
    setQuantities(prev => ({ ...prev, [packId]: qty }))
  }

  async function validate() {
    if (!selected || !session || cartsTotal === 0) return
    setLoading(true)
    setError('')

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([packId, qty]) => ({ carton_pack_id: packId, quantity: qty }))

    const totalAmount = payMode === 'free'
      ? 0
      : packs.reduce((s, p) => s + p.price * (quantities[p.id] ?? 0), 0)

    const res = await fetch('/api/vente', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        session_id:     session.id,
        participant_id: selected.id,
        items,
        method:    METHOD_MAP[payMode],
        amount:    totalAmount,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la vente')
      return
    }

    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allSerials = data.cartons.map((c: any) => c.serial_number as string)

    setSuccessData({
      participantName:  selected.name,
      participantEmail: selected.email,
      cartonsCount:     allSerials.length,
      totalPaid:        totalAmount,
      payMode,
      serials:          allSerials,
      emailSent:        data.email_sent as boolean,
    })
  }

  function closeSuccess() {
    setSuccessData(null)
    setSelected(null)
    setQuantities({})
    setPayMode('cash')
    setParticipants([])
    setError('')
  }

  function reset() {
    setSelected(null)
    setQuantities({})
    setPayMode('cash')
    setError('')
  }

  // ── Rendu ────────────────────────────────

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center" style={{ padding: '40px 20px' }}>
          <div className="font-bold mb-[8px]" style={{ fontSize: 16, color: 'var(--color-text-primary)' }}>
            Aucune session ouverte
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Ouvrez ou démarrez une session pour accéder à la caisse.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row md:flex-1 md:min-h-0 md:overflow-hidden md:-mx-[20px] md:-my-[16px]">

      {/* ── Panneau gauche ── */}
      <div className="caisse-panel-left flex flex-col md:overflow-hidden md:w-[55%]">

        {/* En-tête session */}
        <div className="flex items-center justify-between flex-shrink-0 px-[12px] py-[8px]"
          style={{ borderBottom: '.5px solid var(--color-sep)', background: 'var(--color-card)' }}>
          <span className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
            {session.name}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
            {cartonsAvailable} carton{cartonsAvailable !== 1 ? 's' : ''} disponible{cartonsAvailable !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Recherche participant */}
        <div className="flex-shrink-0 px-[12px] py-[10px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}>
          <StepLabel n={1} label="Participant" />
          <ParticipantSearch
            participants={participants}
            selected={selected}
            quotaMax={quotaMax}
            onSelect={selectParticipant}
            onNewParticipant={() => setShowNewPart(true)}
            onQueryChange={searchParticipants}
          />
        </div>

        {/* Forfaits */}
        <div className="px-[12px] py-[10px] md:flex-1 md:overflow-y-auto">
          <StepLabel n={2} label="Forfait & quantité" />
          {selected ? (
            <ForfaitList
              packs={packs}
              quantities={quantities}
              alreadyBought={selected.cartonsBought}
              quotaMax={quotaMax}
              onChangeQty={handleQtyChange}
            />
          ) : (
            <p className="text-center"
              style={{ padding: '28px 10px', fontSize: 12, color: 'var(--color-text-hint)', lineHeight: 1.8 }}>
              Sélectionnez d&apos;abord un participant
            </p>
          )}
        </div>

      </div>

      {/* ── Panneau droit ── */}
      <div className="flex flex-col md:overflow-hidden md:flex-1" style={{ background: 'var(--color-card)' }}>
        <div className="flex-shrink-0 px-[12px] py-[10px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}>
          <StepLabel n={3} label="Paiement & validation" />
        </div>

        <div className="px-[12px] py-[10px] md:flex-1 md:overflow-y-auto">
          {!hasSelection ? (
            <p className="text-center"
              style={{ padding: '28px 10px', fontSize: 12, color: 'var(--color-text-hint)', lineHeight: 1.8 }}>
              Sélectionnez un participant<br />et au moins un forfait
            </p>
          ) : (
            <div>
              {/* Récapitulatif */}
              <div className="rounded-[8px] px-[11px] py-[9px] mb-[10px]"
                style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)' }}
                aria-label="Récapitulatif de la vente">
                <div className="flex justify-between items-baseline mb-[4px]">
                  <span className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                    {selected!.name}
                  </span>
                  <span className="font-display" style={{ fontSize: 18, color: 'var(--color-amber)' }}>
                    {amountDue.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
                {packs.filter(p => (quantities[p.id] ?? 0) > 0).map(p => {
                  const qty = quantities[p.id]
                  return (
                    <div key={p.id} className="flex justify-between"
                      style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      <span>{p.label} ×{qty}</span>
                      <span>{(p.price * qty).toFixed(2).replace('.', ',')} €</span>
                    </div>
                  )
                })}
                <div className="flex justify-between font-bold mt-[5px] pt-[5px]"
                  style={{ fontSize: 11, color: 'var(--color-text-secondary)', borderTop: '.5px solid var(--color-sep)' }}>
                  <span>{cartsTotal} carton{cartsTotal > 1 ? 's' : ''}</span>
                  <span>{selected!.cartonsBought + cartsTotal} / {quotaMax} pour ce participant</span>
                </div>
              </div>

              <div className="font-bold uppercase tracking-[.1em] mb-[5px]"
                style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                Mode de paiement
              </div>
              <PaymentMode mode={payMode} totalDue={amountDue} onModeChange={setPayMode} />
            </div>
          )}
        </div>

        {hasSelection && (
          <div className="flex-shrink-0 px-[12px] py-[9px]"
            style={{ borderTop: '.5px solid var(--color-sep)', background: 'var(--color-bg)' }}>
            {error && (
              <p style={{ fontSize: 11, color: 'var(--color-qred)', marginBottom: 6 }}>{error}</p>
            )}
            <div className="flex gap-[7px]">
              <button type="button" onClick={reset} disabled={loading}
                className="rounded-[8px] px-[14px] py-[9px] cursor-pointer transition-colors duration-[150ms]"
                style={{ background: 'transparent', color: 'var(--color-text-secondary)', border: '.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 12 }}>
                Annuler
              </button>
              <button type="button" onClick={validate} disabled={!hasSelection || loading}
                className="flex-1 rounded-[8px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
                style={{ padding: '9px 0', background: 'var(--color-amber)', color: '#5C3A00', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                {loading ? 'Traitement…' : 'Valider la vente'}
              </button>
            </div>
            <p className="text-center mt-[5px]" style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>
              Les cartons sont attribués immédiatement après validation
            </p>
          </div>
        )}
      </div>

      {showNewPart && (
        <NewParticipantModal
          onCreated={(p) => { setShowNewPart(false); selectParticipant(p) }}
          onClose={() => setShowNewPart(false)}
          requireBirthDate={requireBirthDate}
        />
      )}

      {successData && <SuccessModal data={successData} onClose={closeSuccess} />}
    </div>
  )
}
