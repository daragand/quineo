'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Tab = 'association' | 'notifications' | 'paiements' | 'avance'

export interface AssociationData {
  id: string
  name: string | null
  siret: string | null
  email: string | null
  phone: string | null
  address: string | null
}

export interface ProviderData {
  id: string
  name: string
  type: string
  active: boolean
}

// ─────────────────────────────────────────
// Sous-composants UI
// ─────────────────────────────────────────

function TabButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="font-bold cursor-pointer transition-all duration-[150ms]"
      style={{
        fontSize: 12, padding: '7px 14px', borderRadius: 7, border: 'none',
        background: active ? 'var(--color-card)' : 'transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,.07)' : undefined,
        fontFamily: 'var(--font-body)',
      }}
    >
      {children}
    </button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-bold uppercase tracking-[.1em] mb-[12px]"
      style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>
      {children}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] px-[20px] py-[18px] mb-[14px]"
      style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
      {children}
    </div>
  )
}

function FieldRow({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-[24px] py-[10px]"
      style={{ borderBottom: '.5px solid var(--color-sep)' }}>
      <div style={{ minWidth: 180 }}>
        <div className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{hint}</div>}
      </div>
      <div style={{ flex: 1, maxWidth: 320 }}>{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────
// Onglet Association
// ─────────────────────────────────────────

function TabAssociation({ initial }: { initial: AssociationData | null }) {
  const [name,  setName]  = useState(initial?.name    ?? '')
  const [siret, setSiret] = useState(initial?.siret   ?? '')
  const [email, setEmail] = useState(initial?.email   ?? '')
  const [phone, setPhone] = useState(initial?.phone   ?? '')
  const [addr,  setAddr]  = useState(initial?.address ?? '')
  const [saved,  setSaved]  = useState(false)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    const res = await fetch('/api/association', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, siret: siret || undefined, email: email || undefined, phone: phone || undefined, address: addr || undefined }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la sauvegarde')
    }
  }

  return (
    <>
      <SectionTitle>Identité de l&apos;association</SectionTitle>
      <Card>
        <FieldRow label="Nom de l'association">
          <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Nom de l'association" />
        </FieldRow>
        <FieldRow label="N° SIRET" hint="14 chiffres sans espaces">
          <Input value={siret} onChange={(e) => setSiret(e.target.value)} aria-label="SIRET" />
        </FieldRow>
        <FieldRow label="Email de contact">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email de contact" />
        </FieldRow>
        <FieldRow label="Téléphone">
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Téléphone" />
        </FieldRow>
        <FieldRow label="Adresse">
          <Input value={addr} onChange={(e) => setAddr(e.target.value)} aria-label="Adresse" />
        </FieldRow>
      </Card>

      {error && <p style={{ fontSize: 12, color: 'var(--color-qred)', marginBottom: 8 }}>{error}</p>}
      <div className="flex items-center gap-[10px]">
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : 'Enregistrer les modifications'}
        </Button>
        {saved && <span style={{ fontSize: 12, color: 'var(--color-qgreen-text)' }}>Paramètres sauvegardés</span>}
      </div>
    </>
  )
}

// ─────────────────────────────────────────
// Onglet Notifications
// ─────────────────────────────────────────

function TabNotifications() {
  const [emailConfirm,  setEmailConfirm]  = useState(true)
  const [emailReminder, setEmailReminder] = useState(true)
  const [emailRecap,    setEmailRecap]    = useState(true)
  const [emailWinner,   setEmailWinner]   = useState(false)

  return (
    <>
      <SectionTitle>Emails automatiques</SectionTitle>
      <Card>
        {[
          { label: 'Confirmation d\'achat',     hint: 'Envoyé au participant après paiement', value: emailConfirm,  set: setEmailConfirm },
          { label: 'Rappel avant session',      hint: 'J-1 avant le loto',                   value: emailReminder, set: setEmailReminder },
          { label: 'Récapitulatif post-session', hint: 'Bilan envoyé à l\'admin après clôture', value: emailRecap, set: setEmailRecap },
          { label: 'Annonce du gagnant',        hint: 'Email au gagnant de chaque tirage',    value: emailWinner,  set: setEmailWinner },
        ].map(({ label, hint, value, set }) => (
          <FieldRow key={label} label={label} hint={hint}>
            <Toggle checked={value} onChange={set} label={label} />
          </FieldRow>
        ))}
      </Card>
      <Button variant="primary" size="sm">Enregistrer</Button>
    </>
  )
}

// ─────────────────────────────────────────
// Onglet Paiements
// ─────────────────────────────────────────

function TabPaiements({ providers }: { providers: ProviderData[] }) {
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(
    Object.fromEntries(providers.map(p => [p.id, p.active]))
  )

  const KNOWN: Record<string, { iconBg: string; sub: string }> = {
    stripe:    { iconBg: '#635BFF', sub: 'Visa, Mastercard, CB' },
    sumup:     { iconBg: '#1DBF73', sub: 'Lien de paiement sécurisé' },
    paypal:    { iconBg: '#003087', sub: 'PayPal' },
    helloasso: { iconBg: '#E5007D', sub: 'Paiement solidaire' },
    other:     { iconBg: '#718096', sub: 'Prestataire personnalisé' },
  }

  return (
    <>
      <SectionTitle>Prestataires de paiement en ligne</SectionTitle>
      {providers.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--color-text-hint)', marginBottom: 14 }}>
          Aucun prestataire configuré.
        </p>
      ) : (
        <div className="flex flex-col gap-[8px] mb-[14px]">
          {providers.map((p) => {
            const meta = KNOWN[p.type] ?? KNOWN.other
            return (
              <div key={p.id}
                className="rounded-[10px] px-[16px] py-[12px] flex items-center gap-[14px]"
                style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
                <div className="rounded-[7px] flex items-center justify-center flex-shrink-0"
                  style={{ width: 36, height: 36, background: meta.iconBg }}>
                  <span className="font-display text-white" style={{ fontSize: 16 }}>{p.name[0]}</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-[7px]"
                    style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                    {p.name}
                    <span className="font-bold rounded-[3px] px-[6px] py-[1px]"
                      style={{ fontSize: 9, background: 'var(--color-qgreen-bg)', color: 'var(--color-qgreen-text)' }}>
                      Configuré
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{meta.sub}</div>
                </div>
                <Toggle
                  checked={activeMap[p.id] ?? false}
                  onChange={(v) => setActiveMap(prev => ({ ...prev, [p.id]: v }))}
                  label={`Activer ${p.name}`}
                />
              </div>
            )
          })}
        </div>
      )}

      <SectionTitle>Paiements sur place</SectionTitle>
      <Card>
        <FieldRow label="Espèces" hint="Toujours disponible à la caisse">
          <span className="font-bold rounded-[4px] px-[8px] py-[2px]"
            style={{ fontSize: 11, background: 'var(--color-qgreen-bg)', color: 'var(--color-qgreen-text)' }}>
            Activé
          </span>
        </FieldRow>
        <FieldRow label="Terminal de paiement (TPE)" hint="Carte bancaire via terminal externe">
          <Toggle checked={true} onChange={() => {}} label="Activer le TPE" />
        </FieldRow>
      </Card>
    </>
  )
}

// ─────────────────────────────────────────
// Onglet Avancé
// ─────────────────────────────────────────

function TabAvance() {
  return (
    <>
      <SectionTitle>Danger zone</SectionTitle>
      <div className="rounded-[10px] px-[20px] py-[18px]"
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-qred)' }}>
        {[
          { label: 'Réinitialiser les données de démo', hint: 'Supprime toutes les sessions, cartons et participants de démo.', action: 'Réinitialiser' },
          { label: 'Supprimer l\'association', hint: 'Action irréversible. Toutes les données seront effacées définitivement.', action: 'Supprimer le compte' },
        ].map(({ label, hint, action }, i) => (
          <div key={label} className="flex items-center justify-between py-[12px]"
            style={{ borderBottom: i === 0 ? '.5px solid var(--color-sep)' : undefined }}>
            <div>
              <div className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{hint}</div>
            </div>
            <Button variant="danger" size="sm">{action}</Button>
          </div>
        ))}
      </div>
    </>
  )
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function ParametresClient({
  initialAssociation,
  initialProviders,
}: {
  initialAssociation: AssociationData | null
  initialProviders: ProviderData[]
}) {
  const [tab, setTab] = useState<Tab>('association')

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'association',   label: 'Association' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'paiements',     label: 'Paiements' },
    { id: 'avance',        label: 'Avancé' },
  ]

  return (
    <div>
      <div className="mb-[20px]">
        <h1 className="font-display leading-none" style={{ fontSize: 28, color: 'var(--color-text-primary)' }}>
          Paramètres
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
          Configuration de votre espace Quineo
        </p>
      </div>

      <div className="flex gap-[4px] p-[4px] rounded-[10px] mb-[20px] inline-flex"
        role="tablist" aria-label="Sections des paramètres"
        style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)' }}>
        {TABS.map((t) => (
          <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </TabButton>
        ))}
      </div>

      <div style={{ maxWidth: 640 }}>
        {tab === 'association'   && <TabAssociation initial={initialAssociation} />}
        {tab === 'notifications' && <TabNotifications />}
        {tab === 'paiements'     && <TabPaiements providers={initialProviders} />}
        {tab === 'avance'        && <TabAvance />}
      </div>
    </div>
  )
}
