'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Tab = 'association' | 'notifications' | 'paiements' | 'compte' | 'avance'

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
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-[8px] md:gap-[24px] py-[10px]"
      style={{ borderBottom: '.5px solid var(--color-sep)' }}>
      <div style={{ minWidth: 0 }} className="md:min-w-[180px] md:flex-shrink-0">
        <div className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{hint}</div>}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
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
// ─────────────────────────────────────────
// HelpTip — icône ? avec tooltip au survol
// ─────────────────────────────────────────

function HelpTip({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle', marginLeft: 5 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={`Aide : ${title}`}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 14, height: 14, borderRadius: '50%',
          border: '.5px solid var(--color-qblue)', background: open ? 'var(--color-qblue)' : 'var(--color-qblue-bg)',
          color: open ? '#fff' : 'var(--color-qblue)', fontSize: 9, fontWeight: 700,
          cursor: 'pointer', flexShrink: 0, lineHeight: 1, padding: 0,
        }}
      >?</button>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
          background: 'var(--color-card)', border: '.5px solid var(--color-qblue)',
          borderRadius: 8, padding: '10px 12px', minWidth: 220, maxWidth: 290,
          zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,.14)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-qblue)', marginBottom: 5 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>{children}</div>
        </div>
      )}
    </div>
  )
}

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
  fieldHelp?:  string
}

const PROVIDER_SPECS: Record<string, { helpUrl: string; helpText: string; tutorial: string[]; fields: FieldSpec[] }> = {
  helloasso: {
    helpUrl:  'https://dev.helloasso.com',
    helpText: 'Espace partenaires → Mes applications → Créer une application',
    tutorial: [
      'Connectez-vous sur helloasso.com avec votre compte association.',
      'Dans le menu, cliquez sur Espace partenaires → Mes applications.',
      'Cliquez sur « Créer une application » et donnez-lui un nom (ex : Quinova).',
      "Copiez le Client ID et le Client Secret affichés — le secret n'est visible qu'une seule fois à la création.",
      "Le Slug organisation est l'identifiant de votre page HelloAsso, visible dans l'URL : helloasso.com/associations/[votre-slug].",
      'Dans HelloAsso → Notifications, créez une notification et collez l\'URL webhook affichée ci-dessous.',
      'Dans l\'en-tête HTTP de la notification, ajoutez : Authorization: Bearer <secret webhook> (valeur libre que vous choisissez).',
    ],
    fields: [
      { key: 'client_id',         label: 'Client ID',         hint: "Identifiant de votre application HelloAsso",                                                              sensitive: false, required: true,  placeholder: 'helloasso_xxxxxx' },
      { key: 'client_secret',     label: 'Client Secret',     hint: "Secret de l'application — ne jamais partager",                                                             sensitive: true,  required: true,
        fieldHelp: "Le Client Secret est affiché une seule fois lors de la création de l'application. Si vous l'avez perdu, vous devrez recréer l'application dans l'espace partenaires HelloAsso." },
      { key: 'organization_slug', label: 'Slug organisation', hint: "Identifiant dans l'URL HelloAsso (ex: mon-association)",                                                   sensitive: false, required: true,  placeholder: 'mon-association',
        fieldHelp: "Trouvez votre slug dans l'URL de votre page HelloAsso : helloasso.com/associations/[votre-slug]. C'est la partie après /associations/." },
      { key: 'webhook_secret',    label: 'Secret webhook',    hint: "Valeur libre — à renseigner dans HelloAsso → Notifications → En-tête Authorization : Bearer <valeur>",     sensitive: true,  required: true,  placeholder: 'générer une valeur aléatoire',
        fieldHelp: "Inventez une longue chaîne aléatoire (32+ caractères). Vous la saisirez dans HelloAsso en tant qu'en-tête HTTP : Authorization: Bearer <votre-valeur>. Elle authentifie les appels entrants." },
    ],
  },
  sumup: {
    helpUrl:  'https://developer.sumup.com',
    helpText: 'Developer portal → My Applications → Create App',
    tutorial: [
      'Créez un compte développeur sur developer.sumup.com (distinct de votre compte marchand).',
      'Allez dans My Applications → Create App et donnez un nom à votre application.',
      'Activez les scopes payments:read et transactions:history puis enregistrez.',
      'Copiez le Client ID et le Client Secret affichés.',
      'Le Code marchand est visible dans votre compte SumUp → Profil marchand (commence par MC).',
      'Dans SumUp Dashboard → Intégrations → Webhooks, ajoutez l\'URL webhook affichée ci-dessous.',
      'Copiez le Signing secret affiché après création du webhook — c\'est votre Secret webhook.',
    ],
    fields: [
      { key: 'client_id',      label: 'Client ID',      hint: "Identifiant de l'application SumUp",                                                    sensitive: false, required: true  },
      { key: 'client_secret',  label: 'Client Secret',  hint: "Secret de l'application — ne jamais partager",                                           sensitive: true,  required: true  },
      { key: 'merchant_code',  label: 'Code marchand',  hint: "Visible dans Compte SumUp → Profil",                                                     sensitive: false, required: false, placeholder: 'MC001',
        fieldHelp: "Le Code marchand commence par 'MC' suivi de chiffres. Vous le trouvez dans SumUp → Compte → Profil marchand. Il est nécessaire pour identifier votre compte lors des paiements." },
      { key: 'webhook_secret', label: 'Secret webhook', hint: "Clé HMAC — SumUp Dashboard → Intégrations → Webhooks → Signing secret",                  sensitive: true,  required: true,
        fieldHelp: "Le Signing secret est généré par SumUp lors de la création du webhook. Il permet de vérifier que les notifications reçues proviennent bien de SumUp (signature HMAC-SHA256)." },
    ],
  },
  paypal: {
    helpUrl:  'https://developer.paypal.com/dashboard/applications',
    helpText: 'Dashboard → My Apps & Credentials → Create App',
    tutorial: [
      'Connectez-vous sur developer.paypal.com avec votre compte PayPal Business.',
      'Allez dans Dashboard → My Apps & Credentials.',
      'Cliquez sur Create App (onglet Live pour la production, Sandbox pour les tests).',
      'Donnez un nom à l\'application et copiez le Client ID et le Secret.',
      'Choisissez l\'environnement Sandbox pour vos tests, Production quand vous êtes prêt.',
      'Dans la section Webhooks de l\'application, ajoutez l\'URL ci-dessous (avec ?token=votre-token).',
      'Le Token webhook est une valeur libre que vous inventez — il authentifie les appels entrants depuis PayPal.',
    ],
    fields: [
      { key: 'client_id',     label: 'Client ID',      hint: "Clé publique de votre application PayPal",                                                sensitive: false, required: true  },
      { key: 'client_secret', label: 'Client Secret',  hint: "Clé secrète PayPal — ne jamais partager",                                                 sensitive: true,  required: true  },
      { key: 'environment',   label: 'Environnement',  hint: "sandbox = tests sans argent réel, production = paiements réels",                          sensitive: false, required: true,
        type: 'select', options: [{ value: 'sandbox', label: 'Sandbox (test)' }, { value: 'production', label: 'Production (réel)' }],
        fieldHelp: "Sandbox : paiements simulés pour vos tests, aucun argent n'est débité. Production : paiements réels. Commencez toujours par Sandbox et validez l'intégration avant de passer en Production." },
      { key: 'webhook_token', label: 'Token webhook',  hint: "Valeur libre — incluse dans l'URL : …/api/webhooks/paypal?token=<valeur>",                sensitive: true,  required: true,  placeholder: 'générer une valeur aléatoire',
        fieldHelp: "Inventez une chaîne aléatoire longue (ex: 32 caractères). Elle sera ajoutée à l'URL webhook pour permettre à Quinova de vérifier que les appels viennent bien de PayPal." },
    ],
  },
  stripe: {
    helpUrl:  'https://dashboard.stripe.com/apikeys',
    helpText: 'Dashboard → Développeurs → Clés API',
    tutorial: [
      'Connectez-vous sur dashboard.stripe.com avec votre compte Stripe.',
      'En haut du tableau de bord, basculez entre mode Test (pk_test_) et mode Live (pk_live_).',
      'Allez dans Développeurs → Clés API et copiez la Clé publiable et la Clé secrète.',
      'Allez dans Développeurs → Webhooks → Ajouter un endpoint.',
      'Collez l\'URL webhook ci-dessous et sélectionnez les événements : payment_intent.succeeded et payment_intent.payment_failed.',
      'Copiez le Signing secret (whsec_…) affiché après la création du webhook.',
      'Testez votre webhook avec le bouton "Tester" dans le Dashboard Stripe avant de passer en production.',
    ],
    fields: [
      { key: 'publishable_key', label: 'Clé publiable',  hint: "Commence par pk_live_ ou pk_test_ (non secrète)",                                      sensitive: false, required: true,  placeholder: 'pk_live_...',
        fieldHelp: "La clé publiable peut être exposée côté client (JavaScript) — elle ne donne accès à rien de sensible. Utilisez pk_test_ pour les tests et pk_live_ en production." },
      { key: 'secret_key',      label: 'Clé secrète',    hint: "Commence par sk_live_ — ne jamais exposer côté client",                                 sensitive: true,  required: true,  placeholder: 'sk_live_...',
        fieldHelp: "La clé secrète donne un accès complet à votre compte Stripe. Ne la partagez jamais et ne l'incluez jamais dans du code côté client (navigateur)." },
      { key: 'webhook_secret',  label: 'Secret webhook', hint: "Commence par whsec_ — Développeurs → Webhooks → Signing secret",                        sensitive: true,  required: true,  placeholder: 'whsec_...',
        fieldHelp: "Le Signing secret permet de vérifier que les webhooks reçus proviennent bien de Stripe (signature HMAC). Disponible dans Développeurs → Webhooks → votre endpoint → Signing secret." },
    ],
  },
  other: {
    helpUrl:  '',
    helpText: '',
    tutorial: [],
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
  const [showTutorial,   setShowTutorial]   = useState(false)

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
    setShowTutorial(false)
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
              <div style={{ minWidth: 0 }}>
                <div className="font-bold" style={{ fontSize: 11, color: 'var(--color-qred)', marginBottom: 3 }}>
                  Webhook à configurer chez {PROVIDER_META[form.type]?.label ?? form.type}
                </div>
                {form.type === 'helloasso' && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Dans HelloAsso → Notifications, ajoutez cette URL et l&apos;en-tête HTTP{' '}
                    <code style={{ fontSize: 10, background: 'rgba(0,0,0,.1)', padding: '1px 4px', borderRadius: 3 }}>Authorization: Bearer &lt;secret webhook&gt;</code>
                  </div>
                )}
                {form.type === 'paypal' && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Dans PayPal → Webhooks, configurez l&apos;URL ci-dessous (remplacez{' '}
                    <code style={{ fontSize: 10 }}>&lt;token&gt;</code> par votre valeur) :
                  </div>
                )}
                {form.type === 'sumup' && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Dans SumUp Dashboard → Intégrations → Webhooks, ajoutez cette URL :
                  </div>
                )}
                {form.type === 'stripe' && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Dans Stripe Dashboard → Développeurs → Webhooks, ajoutez cette URL :
                  </div>
                )}
                <code
                  className="block rounded-[4px] px-[8px] py-[4px] select-all"
                  style={{ fontSize: 11, background: 'rgba(0,0,0,.15)', color: 'var(--color-text-primary)', wordBreak: 'break-all' }}
                >
                  {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/{form.type}
                  {form.type === 'paypal' && (
                    form.config.webhook_token
                      ? `?token=${form.config.webhook_token}`
                      : '?token=<votre_token_webhook>'
                  )}
                </code>
              </div>
            </div>
          )}

          {/* ── Guide pas à pas ── */}
          {spec.tutorial.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowTutorial(t => !t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 11, fontWeight: 700, color: '#059669',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" stroke="#059669" strokeWidth="1.3"/>
                  <path d="M5.5 8h5M8 5.5v5" stroke="#059669" strokeWidth="1.3" strokeLinecap="round"
                    style={{ display: showTutorial ? 'none' : undefined }}/>
                  <path d="M5.5 8h5" stroke="#059669" strokeWidth="1.3" strokeLinecap="round"
                    style={{ display: showTutorial ? undefined : 'none' }}/>
                </svg>
                {showTutorial ? 'Masquer le guide' : 'Guide de configuration pas à pas'}
              </button>
              {showTutorial && (
                <div
                  className="rounded-[8px] px-[14px] py-[12px] mt-[8px] flex flex-col gap-[8px]"
                  style={{ background: 'rgba(16,185,129,.05)', border: '.5px solid rgba(16,185,129,.2)' }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 2 }}>
                    Configuration {PROVIDER_META[form.type]?.label ?? form.type} — étapes
                  </div>
                  {spec.tutorial.map((step, i) => (
                    <div key={i} className="flex gap-[10px] items-start">
                      <div
                        className="flex items-center justify-center flex-shrink-0 rounded-full font-bold"
                        style={{ width: 20, height: 20, background: 'rgba(16,185,129,.15)', color: '#059669', fontSize: 10, marginTop: 1 }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>{step}</div>
                    </div>
                  ))}
                </div>
              )}
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
                    <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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
                      {field.fieldHelp && (
                        <HelpTip title={field.label}>{field.fieldHelp}</HelpTip>
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
                              style={{ fontSize: 11, background: 'var(--color-amber)', color: '#5C3A00', border: 'none', cursor: unlockLoading ? 'wait' : 'pointer', flexShrink: 0 }}
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
              style={{ fontSize: 12, background: 'var(--color-amber)', color: '#5C3A00', border: 'none', cursor: saving ? 'wait' : 'pointer' }}
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
// Onglet Compte
// ─────────────────────────────────────────

function TabCompte() {
  const [current,  setCurrent]  = useState('')
  const [next,     setNext]     = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setFieldErr({})
    setSuccess(false)

    if (next !== confirm) {
      setFieldErr({ confirm: 'Les mots de passe ne correspondent pas' })
      return
    }
    if (next.length < 8) {
      setFieldErr({ next: 'Au moins 8 caractères requis' })
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        current_password: current,
        new_password:     next,
        confirm_password: confirm,
      }),
    })
    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors du changement de mot de passe')
      return
    }

    setSuccess(true)
    setCurrent('')
    setNext('')
    setConfirm('')
  }

  return (
    <>
      <SectionTitle>Sécurité du compte</SectionTitle>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
          <Input
            label="Mot de passe actuel"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            required
          />

          <div style={{ borderTop: '.5px solid var(--color-sep)', margin: '2px 0' }} />

          <Input
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            placeholder="8 caractères minimum"
            value={next}
            onChange={e => setNext(e.target.value)}
            required
            error={fieldErr.next}
          />
          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            error={fieldErr.confirm}
          />

          {error && (
            <p role="alert" className="font-bold" style={{ fontSize: 11, color: 'var(--color-qred)', margin: 0 }}>
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="font-bold" style={{ fontSize: 11, color: 'var(--color-qgreen-text)', margin: 0 }}>
              ✓ Mot de passe mis à jour avec succès
            </p>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              disabled={!current || !next || !confirm}
            >
              Changer le mot de passe
            </Button>
          </div>
        </form>
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
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab | null) ?? 'association'
  const [tab,      setTab]      = useState<Tab>(initialTab)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'association',   label: 'Association' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'paiements',     label: 'Paiements' },
    { id: 'compte',        label: 'Compte' },
    { id: 'avance',        label: 'Avancé' },
  ]

  const activeLabel = TABS.find(t => t.id === tab)?.label ?? ''

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  function switchTab(id: Tab) {
    setTab(id)
    setMenuOpen(false)
  }

  return (
    <div>
      <div className="mb-[20px]">
        <h1 className="font-display leading-none" style={{ fontSize: 28, color: 'var(--color-text-primary)' }}>
          Paramètres
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
          Configuration de votre espace Quinova
        </p>
      </div>

      {/* ── Navigation onglets ── */}

      {/* Mobile : dropdown (md:hidden) */}
      <div ref={menuRef} className="md:hidden relative z-50 mb-[20px]">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
          className="w-full flex items-center justify-between rounded-[10px] px-[14px] py-[10px] font-bold transition-colors duration-[150ms]"
          style={{
            background: 'var(--color-bg)',
            border: '.5px solid var(--color-sep)',
            fontSize: 13,
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          <span>{activeLabel}</span>
          {/* Chevron */}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            aria-hidden="true"
            style={{
              flexShrink: 0,
              transform: menuOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 150ms ease',
              color: 'var(--color-text-secondary)',
            }}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {menuOpen && (
          <div
            role="listbox"
            aria-label="Sections des paramètres"
            className="absolute left-0 right-0 z-50 rounded-[10px] overflow-hidden"
            style={{
              top: 'calc(100% + 6px)',
              background: 'var(--color-card)',
              border: '.5px solid var(--color-sep)',
              boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            }}
          >
            {TABS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={tab === t.id}
                onClick={() => switchTab(t.id)}
                className="w-full flex items-center justify-between px-[14px] py-[11px] font-bold transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
                style={{
                  fontSize: 13,
                  color: tab === t.id ? 'var(--color-amber)' : 'var(--color-text-primary)',
                  background: tab === t.id ? 'var(--color-amber-bg)' : undefined,
                  borderBottom: i < TABS.length - 1 ? '.5px solid var(--color-sep)' : undefined,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  border: 'none',
                  textAlign: 'left',
                }}
              >
                {t.label}
                {tab === t.id && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12l5 5L20 7" stroke="var(--color-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop : barre d'onglets (hidden md:flex) */}
      <div
        className="hidden md:flex gap-[4px] p-[4px] rounded-[10px] mb-[20px]"
        role="tablist"
        aria-label="Sections des paramètres"
        style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)' }}
      >
        {TABS.map((t) => (
          <TabButton key={t.id} active={tab === t.id} onClick={() => switchTab(t.id)}>
            {t.label}
          </TabButton>
        ))}
      </div>

      <div className="w-full md:max-w-[640px]">
        {tab === 'association'   && <TabAssociation initial={initialAssociation} />}
        {tab === 'notifications' && <TabNotifications />}
        {tab === 'paiements'     && <TabPaiements providers={initialProviders} />}
        {tab === 'compte'        && <TabCompte />}
        {tab === 'avance'        && <TabAvance />}
      </div>
    </div>
  )
}
