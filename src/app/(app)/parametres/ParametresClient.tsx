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
  id:                 string
  name:               string | null
  siret:              string | null
  email:              string | null
  phone:              string | null
  address:            string | null
  require_birth_date: boolean
}

export interface ProviderData {
  id:     string
  name:   string
  type:   string
  active: boolean
  config: Record<string, string>
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
  const [name,             setName]             = useState(initial?.name    ?? '')
  const [siret,            setSiret]            = useState(initial?.siret   ?? '')
  const [email,            setEmail]            = useState(initial?.email   ?? '')
  const [phone,            setPhone]            = useState(initial?.phone   ?? '')
  const [addr,             setAddr]             = useState(initial?.address ?? '')
  const [requireBirthDate, setRequireBirthDate] = useState(initial?.require_birth_date ?? false)
  const [saved,  setSaved]  = useState(false)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    const res = await fetch('/api/association', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        siret:              siret || undefined,
        email:              email || undefined,
        phone:              phone || undefined,
        address:            addr  || undefined,
        require_birth_date: requireBirthDate,
      }),
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

      <SectionTitle>Saisie des participants</SectionTitle>
      <Card>
        <FieldRow
          label="Date de naissance obligatoire"
          hint="Exiger la date de naissance lors de la création d'un participant pour éviter les homonymes"
        >
          <Toggle
            checked={requireBirthDate}
            onChange={setRequireBirthDate}
            label="Date de naissance obligatoire"
          />
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
// Onglet Paiements — config providers
// ─────────────────────────────────────────

const PROVIDER_META: Record<string, { label: string; iconBg: string; sub: string }> = {
  stripe:    { label: 'Stripe',     iconBg: '#635BFF', sub: 'Visa, Mastercard, CB' },
  sumup:     { label: 'SumUp',      iconBg: '#1DBF73', sub: 'Terminal de paiement physique' },
  paypal:    { label: 'PayPal',     iconBg: '#003087', sub: 'Paiement via PayPal' },
  helloasso: { label: 'HelloAsso',  iconBg: '#E5007D', sub: 'Plateforme associative française' },
  other:     { label: 'Autre',      iconBg: '#718096', sub: 'Prestataire personnalisé' },
}

interface FieldSpec {
  key:         string
  label:       string
  hint:        string
  sensitive:   boolean
  placeholder?: string
  required?:   boolean
  type?:       'text' | 'select'
  options?:    Array<{ value: string; label: string }>
}

const PROVIDER_SPECS: Record<string, { helpUrl: string; helpText: string; fields: FieldSpec[] }> = {
  helloasso: {
    helpUrl:  'https://dev.helloasso.com',
    helpText: 'Espace partenaires → Mes applications → Créer une application',
    fields: [
      { key: 'client_id',         label: 'Client ID',        hint: "Identifiant de votre application HelloAsso",              sensitive: false, required: true,  placeholder: 'helloasso_xxxxxx' },
      { key: 'client_secret',     label: 'Client Secret',    hint: "Secret de l'application — ne jamais partager",            sensitive: true,  required: true  },
      { key: 'organization_slug', label: 'Slug organisation', hint: "Identifiant dans l'URL HelloAsso (ex: mon-association)",  sensitive: false, required: true,  placeholder: 'mon-association' },
    ],
  },
  sumup: {
    helpUrl:  'https://developer.sumup.com',
    helpText: 'Developer portal → My Applications → Create App',
    fields: [
      { key: 'client_id',     label: 'Client ID',     hint: "Identifiant de l'application SumUp",           sensitive: false, required: true  },
      { key: 'client_secret', label: 'Client Secret', hint: "Secret de l'application — ne jamais partager", sensitive: true,  required: true  },
      { key: 'merchant_code', label: 'Code marchand', hint: "Visible dans Compte SumUp → Profil",           sensitive: false, required: false, placeholder: 'MC001' },
    ],
  },
  paypal: {
    helpUrl:  'https://developer.paypal.com/dashboard/applications',
    helpText: 'Dashboard → My Apps & Credentials → Create App',
    fields: [
      { key: 'client_id',     label: 'Client ID',     hint: "Clé publique de votre application PayPal",    sensitive: false, required: true  },
      { key: 'client_secret', label: 'Client Secret', hint: "Clé secrète PayPal — ne jamais partager",     sensitive: true,  required: true  },
      { key: 'environment',   label: 'Environnement', hint: "sandbox = tests, production = paiements réels", sensitive: false, required: true,
        type: 'select', options: [{ value: 'sandbox', label: 'Sandbox (test)' }, { value: 'production', label: 'Production (réel)' }] },
    ],
  },
  stripe: {
    helpUrl:  'https://dashboard.stripe.com/apikeys',
    helpText: 'Dashboard → Développeurs → Clés API',
    fields: [
      { key: 'publishable_key', label: 'Clé publiable',  hint: "Commence par pk_live_ ou pk_test_ (non secrète)", sensitive: false, required: true,  placeholder: 'pk_live_...' },
      { key: 'secret_key',      label: 'Clé secrète',    hint: "Commence par sk_live_ — ne jamais partager",      sensitive: true,  required: true,  placeholder: 'sk_live_...' },
      { key: 'webhook_secret',  label: 'Secret webhook', hint: "Commence par whsec_ (optionnel)",                 sensitive: true,  required: false, placeholder: 'whsec_...' },
    ],
  },
  other: {
    helpUrl:  '',
    helpText: '',
    fields: [
      { key: 'description', label: 'Description', hint: 'Informations complémentaires sur ce prestataire', sensitive: false },
    ],
  },
}

interface ProviderFormState {
  name:   string
  type:   string
  config: Record<string, string>
}

function TabPaiements({ providers: initialProviders }: { providers: ProviderData[] }) {
  const [providers,      setProviders]      = useState<ProviderData[]>(initialProviders)
  const [showForm,       setShowForm]       = useState(false)
  const [editingId,      setEditingId]      = useState<string | null>(null)
  const [form,           setForm]           = useState<ProviderFormState>({ name: '', type: 'helloasso', config: {} })
  const [unmasked,       setUnmasked]       = useState<Record<string, boolean>>({})
  const [saving,         setSaving]         = useState(false)
  const [deleting,       setDeleting]       = useState<string | null>(null)
  const [formError,      setFormError]      = useState('')
  // Vérification mot de passe pour champs sensibles
  const [pendingUnlock,  setPendingUnlock]  = useState<string | null>(null)  // clé du champ à débloquer
  const [unlockPassword, setUnlockPassword] = useState('')
  const [unlockError,    setUnlockError]    = useState('')
  const [unlockLoading,  setUnlockLoading]  = useState(false)

  const spec = PROVIDER_SPECS[form.type] ?? PROVIDER_SPECS.other
  const meta = PROVIDER_META[form.type] ?? PROVIDER_META.other

  function openAdd() {
    setEditingId(null)
    setForm({ name: '', type: 'helloasso', config: {} })
    setUnmasked({})
    setFormError('')
    setShowForm(true)
  }

  function openEdit(p: ProviderData) {
    setEditingId(p.id)
    setForm({ name: p.name, type: p.type, config: { ...p.config } })
    setUnmasked({})
    setPendingUnlock(null)
    setUnlockPassword('')
    setUnlockError('')
    setFormError('')
    setShowForm(true)
  }

  function requestUnlock(fieldKey: string) {
    setPendingUnlock(fieldKey)
    setUnlockPassword('')
    setUnlockError('')
  }

  function cancelUnlock() {
    setPendingUnlock(null)
    setUnlockPassword('')
    setUnlockError('')
  }

  async function confirmUnlock() {
    if (!unlockPassword) { setUnlockError('Mot de passe requis'); return }
    setUnlockLoading(true)
    setUnlockError('')
    const res = await fetch('/api/auth/verify-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ password: unlockPassword }),
    })
    setUnlockLoading(false)
    if (!res.ok) {
      setUnlockError('Mot de passe incorrect')
      return
    }
    // Déverrouiller le champ
    setUnmasked(u => ({ ...u, [pendingUnlock!]: true }))
    setConfigField(pendingUnlock!, '')
    setPendingUnlock(null)
    setUnlockPassword('')
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setFormError('')
  }

  function setConfigField(key: string, value: string) {
    setForm(f => ({ ...f, config: { ...f.config, [key]: value } }))
  }

  function changeType(type: string) {
    setForm({ name: form.name, type, config: {} })
    setUnmasked({})
  }

  async function handleSave() {
    if (!form.name.trim()) { setFormError('Le nom est requis.'); return }
    setSaving(true)
    setFormError('')

    const url    = editingId ? `/api/association/providers/${editingId}` : '/api/association/providers'
    const method = editingId ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: form.name.trim(), type: form.type, config: form.config }),
    })
    setSaving(false)

    if (!res.ok) {
      const data = await res.json()
      setFormError(data.error ?? 'Erreur lors de la sauvegarde.')
      return
    }
    const data = await res.json()
    const saved = data.provider as ProviderData

    setProviders(prev =>
      editingId
        ? prev.map(p => p.id === editingId ? saved : p)
        : [...prev, saved]
    )
    cancelForm()
  }

  async function handleToggle(p: ProviderData) {
    const res = await fetch(`/api/association/providers/${p.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ active: !p.active }),
    })
    if (res.ok) {
      setProviders(prev => prev.map(r => r.id === p.id ? { ...r, active: !r.active } : r))
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch(`/api/association/providers/${id}`, { method: 'DELETE' })
    setDeleting(null)
    setProviders(prev => prev.filter(p => p.id !== id))
  }

  const inputBase: React.CSSProperties = {
    padding:    '7px 10px',
    border:     '.5px solid var(--color-border)',
    borderRadius: 6,
    fontFamily: 'var(--font-body)',
    fontSize:   12,
    color:      'var(--color-text-primary)',
    background: 'var(--color-bg)',
    outline:    'none',
    width:      '100%',
    boxSizing:  'border-box',
  }

  return (
    <>
      {/* ── Liste providers ── */}
      <div className="flex items-center justify-between mb-[10px]">
        <SectionTitle>Prestataires de paiement en ligne</SectionTitle>
        <button
          onClick={openAdd}
          className="font-bold hover:opacity-70 transition-opacity"
          style={{ fontSize: 11, color: 'var(--color-qblue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: -12 }}
        >
          + Ajouter
        </button>
      </div>

      {providers.length === 0 && !showForm && (
        <p style={{ fontSize: 12, color: 'var(--color-text-hint)', marginBottom: 14 }}>
          Aucun prestataire configuré.{' '}
          <button onClick={openAdd} style={{ color: 'var(--color-qblue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, padding: 0 }}>
            Ajouter un prestataire →
          </button>
        </p>
      )}

      <div className="flex flex-col gap-[8px] mb-[14px]">
        {providers.map((p) => {
          const m = PROVIDER_META[p.type] ?? PROVIDER_META.other
          return (
            <div key={p.id}
              className="rounded-[10px] px-[16px] py-[12px] flex items-center gap-[14px]"
              style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)', opacity: p.active ? 1 : 0.6 }}>
              <div className="rounded-[7px] flex items-center justify-center flex-shrink-0"
                style={{ width: 36, height: 36, background: m.iconBg }}>
                <span className="font-display text-white" style={{ fontSize: 16 }}>{p.name[0].toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{m.sub}</div>
              </div>
              <div className="flex items-center gap-[8px]">
                <Toggle checked={p.active} onChange={() => handleToggle(p)} label={`Activer ${p.name}`} />
                <button
                  onClick={() => openEdit(p)}
                  title="Modifier"
                  className="rounded-[5px] px-[8px] py-[4px] transition-opacity hover:opacity-70"
                  style={{ fontSize: 11, background: 'var(--color-bg)', border: '.5px solid var(--color-border)', color: 'var(--color-qblue)', cursor: 'pointer' }}
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  title="Supprimer"
                  className="rounded-[5px] px-[8px] py-[4px] transition-opacity hover:opacity-70 disabled:opacity-30"
                  style={{ fontSize: 11, background: 'var(--color-bg)', border: '.5px solid var(--color-border)', color: 'var(--color-qred)', cursor: deleting === p.id ? 'wait' : 'pointer' }}
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Formulaire ajout / modification ── */}
      {showForm && (
        <div
          className="rounded-[10px] p-[18px] mb-[14px] flex flex-col gap-[14px]"
          style={{ background: 'var(--color-card)', border: '.5px solid var(--color-qblue)' }}
        >
          <div className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
            {editingId ? 'Modifier le prestataire' : 'Nouveau prestataire'}
          </div>

          {/* Sélecteur de type (uniquement en création) */}
          {!editingId && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Type de prestataire</div>
              <div className="flex flex-wrap gap-[6px]">
                {Object.entries(PROVIDER_META).map(([key, m]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => changeType(key)}
                    className="rounded-[7px] px-[10px] py-[5px] font-bold transition-all"
                    style={{
                      fontSize:    11,
                      border:      `.5px solid ${form.type === key ? m.iconBg : 'var(--color-border)'}`,
                      background:  form.type === key ? m.iconBg : 'var(--color-bg)',
                      color:       form.type === key ? '#fff' : 'var(--color-text-secondary)',
                      cursor:      'pointer',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aide contextuelle — identifiants */}
          {spec.helpUrl && (
            <div
              className="rounded-[7px] px-[12px] py-[9px] flex items-start gap-[10px]"
              style={{ background: 'var(--color-qblue-bg)', border: '.5px solid rgba(24,95,165,.15)' }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="8" cy="8" r="6.5" stroke="var(--color-qblue)" strokeWidth="1.3"/>
                <path d="M8 7.5v4" stroke="var(--color-qblue)" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="8" cy="5.5" r="0.9" fill="var(--color-qblue)"/>
              </svg>
              <div>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  Retrouvez vos identifiants sur{' '}
                </span>
                <a
                  href={spec.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: 'var(--color-qblue)', fontWeight: 700 }}
                >
                  {spec.helpUrl.replace('https://', '')}
                </a>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {' '}— {spec.helpText}
                </span>
              </div>
            </div>
          )}

          {/* Aide webhook — URL à configurer chez le prestataire */}
          {['stripe', 'paypal', 'sumup', 'helloasso'].includes(form.type) && (
            <div
              className="rounded-[7px] px-[12px] py-[9px] flex items-start gap-[10px]"
              style={{ background: 'rgba(163,45,45,.06)', border: '.5px solid rgba(163,45,45,.15)' }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M8 1L9.5 6h5L10.25 9.5l1.5 5L8 12l-3.75 2.5 1.5-5L1.5 6h5L8 1z" stroke="var(--color-qred)" strokeWidth="1.2" fill="none"/>
              </svg>
              <div>
                <div className="font-bold" style={{ fontSize: 11, color: 'var(--color-qred)', marginBottom: 3 }}>
                  Webhook à configurer chez {PROVIDER_META[form.type]?.label ?? form.type}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Pour recevoir la confirmation automatique des paiements, ajoutez cette URL dans votre dashboard :
                </div>
                <code
                  className="block rounded-[4px] px-[8px] py-[4px] select-all"
                  style={{ fontSize: 11, background: 'rgba(0,0,0,.15)', color: 'var(--color-text-primary)', wordBreak: 'break-all' }}
                >
                  {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/{form.type}
                </code>
              </div>
            </div>
          )}

          {/* Nom du prestataire */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Nom affiché <span style={{ color: 'var(--color-qred)' }}>*</span>
            </label>
            <input
              type="text"
              placeholder={`${meta.label} — Mon Association`}
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="mt-[4px]"
              style={inputBase}
            />
          </div>

          {/* Champs de config */}
          <div className="flex flex-col gap-[10px]">
            {spec.fields.map((field) => {
              const val       = form.config[field.key] ?? ''
              const isMasked  = val === '__MASKED__'
              const isUnmasked = unmasked[field.key]

              return (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-[4px]">
                    <label style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      {field.label}
                      {field.required && <span style={{ color: 'var(--color-qred)' }}> *</span>}
                      {field.sensitive && (
                        <span
                          className="ml-[6px] rounded-[3px] px-[5px] py-[1px] font-bold uppercase tracking-[.06em]"
                          style={{ fontSize: 9, background: 'rgba(163,45,45,.08)', color: 'var(--color-qred)' }}
                        >
                          Sensible
                        </span>
                      )}
                    </label>
                    {isMasked && !isUnmasked && pendingUnlock !== field.key && (
                      <button
                        type="button"
                        onClick={() => requestUnlock(field.key)}
                        className="font-bold hover:opacity-70 transition-opacity"
                        style={{ fontSize: 10, color: 'var(--color-qblue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        Modifier ✎
                      </button>
                    )}
                    {isUnmasked && (
                      <button
                        type="button"
                        onClick={() => {
                          setUnmasked(u => ({ ...u, [field.key]: false }))
                          setConfigField(field.key, '__MASKED__')
                        }}
                        className="font-bold hover:opacity-70 transition-opacity"
                        style={{ fontSize: 10, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        ↩ Annuler
                      </button>
                    )}
                  </div>

                  {isMasked && !isUnmasked ? (
                    /* Champ masqué — valeur déjà configurée */
                    <>
                      <div
                        className="rounded-[6px] px-[10px] flex items-center"
                        style={{
                          ...inputBase,
                          background:    'var(--color-bg)',
                          color:         'var(--color-text-hint)',
                          letterSpacing: '.08em',
                          height:        32,
                        }}
                      >
                        ••••••••••••••••
                      </div>

                      {/* Mini-formulaire de confirmation mot de passe */}
                      {pendingUnlock === field.key && (
                        <div
                          className="rounded-[8px] p-[12px] mt-[8px] flex flex-col gap-[8px]"
                          style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-qblue)' }}
                        >
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                            Confirmez votre mot de passe pour modifier ce champ sensible
                          </div>
                          <div className="flex gap-[6px]">
                            <input
                              type="password"
                              placeholder="Votre mot de passe"
                              value={unlockPassword}
                              onChange={(e) => { setUnlockPassword(e.target.value); setUnlockError('') }}
                              onKeyDown={(e) => { if (e.key === 'Enter') confirmUnlock() }}
                              autoFocus
                              className="flex-1 rounded-[6px]"
                              style={{ ...inputBase, width: 'auto' }}
                            />
                            <button
                              type="button"
                              onClick={confirmUnlock}
                              disabled={unlockLoading}
                              className="rounded-[6px] px-[10px] font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
                              style={{ fontSize: 11, background: 'var(--color-amber)', color: '#2C1500', border: 'none', cursor: unlockLoading ? 'wait' : 'pointer', flexShrink: 0 }}
                            >
                              {unlockLoading ? '…' : 'Confirmer'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelUnlock}
                              disabled={unlockLoading}
                              className="rounded-[6px] px-[10px] font-bold transition-opacity hover:opacity-70"
                              style={{ fontSize: 11, background: 'var(--color-bg)', border: '.5px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer', flexShrink: 0 }}
                            >
                              Annuler
                            </button>
                          </div>
                          {unlockError && (
                            <p style={{ fontSize: 11, color: 'var(--color-qred)', margin: 0 }}>{unlockError}</p>
                          )}
                        </div>
                      )}
                    </>
                  ) : field.type === 'select' ? (
                    <select
                      value={val}
                      onChange={(e) => setConfigField(field.key, e.target.value)}
                      style={{ ...inputBase, appearance: 'auto' }}
                    >
                      <option value="">Choisir…</option>
                      {field.options?.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder ?? (field.sensitive ? '(saisir la valeur)' : '')}
                      value={isMasked ? '' : val}
                      onChange={(e) => setConfigField(field.key, e.target.value)}
                      style={inputBase}
                    />
                  )}
                  <div style={{ fontSize: 10, color: 'var(--color-text-hint)', marginTop: 3 }}>{field.hint}</div>
                </div>
              )
            })}
          </div>

          {formError && <p style={{ fontSize: 11, color: 'var(--color-qred)', margin: 0 }}>{formError}</p>}

          <div className="flex gap-[8px] justify-end">
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-[7px] px-[12px] py-[6px] font-bold hover:opacity-70 transition-opacity"
              style={{ fontSize: 12, background: 'var(--color-bg)', border: '.5px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-[7px] px-[12px] py-[6px] font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ fontSize: 12, background: 'var(--color-amber)', color: '#2C1500', border: 'none', cursor: saving ? 'wait' : 'pointer' }}
            >
              {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Ajouter le prestataire'}
            </button>
          </div>
        </div>
      )}

      {/* ── Paiements sur place ── */}
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
