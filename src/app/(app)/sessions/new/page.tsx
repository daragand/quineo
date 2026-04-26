'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input, Textarea } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Stepper } from '@/components/ui/Stepper'
import { Button } from '@/components/ui/Button'
import { SessionFormTabs } from '@/components/session/SessionFormTabs'
import { ProviderGrid, type ProviderId } from '@/components/session/ProviderGrid'
import { RulesTable, type RulesState } from '@/components/session/RulesTable'
import { PartnerSlots, type PartnerSlot } from '@/components/session/PartnerSlots'
import { SessionSummaryPanel } from '@/components/session/SessionSummaryPanel'

// ─────────────────────────────────────────
// État du formulaire
// ─────────────────────────────────────────

interface FormState {
  name: string
  lieu: string
  description: string
  slug: string
  slugManual: boolean
  date: string
  time: string
  maxCartons: number
  status: 'draft' | 'open'
  // Identité
  colorPrimary: string
  colorSecondary: string
  // Ventes
  providers: Record<ProviderId, boolean>
  saleDeadlineOnlineDate: string
  saleDeadlineOnlineTime: string
  saleDeadlinePlaceDate:  string
  saleDeadlinePlaceTime:  string
  maxCartonsPerPerson: number
  maxFreeCartons: number
  // Règles
  rules: RulesState
  drawInterval: number
  // Partenaires
  partners: PartnerSlot[]
}

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

const INITIAL: FormState = {
  name: '', lieu: '', description: '', slug: '', slugManual: false,
  date: '', time: '14:00', maxCartons: 500, status: 'draft',
  colorPrimary: '#0D1E2C', colorSecondary: '#FFD84D',
  providers: { cash: true, cb: true, stripe: true, sumup: true, helloasso: false, free: false },
  saleDeadlineOnlineDate: '', saleDeadlineOnlineTime: '23:59',
  saleDeadlinePlaceDate: '',  saleDeadlinePlaceTime:  '16:00',
  maxCartonsPerPerson: 30, maxFreeCartons: 10,
  rules: { quine: 'sudden_death', double_quine: 'sudden_death', carton_plein: 'each_wins' },
  drawInterval: 2.2,
  partners: [
    { id: 'p1', imageUrl: undefined },
    { id: 'p2', imageUrl: undefined },
    { id: 'p3', imageUrl: undefined },
    { id: 'p4', imageUrl: undefined },
  ],
}

const TABS = [
  { id: 'infos',    label: 'Informations' },
  { id: 'visual',   label: 'Identité visuelle' },
  { id: 'ventes',   label: 'Ventes & paiement' },
  { id: 'regles',   label: 'Règles de jeu' },
]

const NEXT_LABELS = [
  'Suivant — Identité visuelle →',
  'Suivant — Ventes & paiement →',
  'Suivant — Règles de jeu →',
  'Créer la session →',
]

// ─────────────────────────────────────────
// Section title helper
// ─────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-bold uppercase tracking-[.1em] mb-[12px] pb-[8px]"
      style={{ fontSize: 11, color: 'var(--color-text-secondary)', borderBottom: '.5px solid var(--color-sep)' }}
    >
      {children}
    </div>
  )
}

function SectionDesc({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="leading-[1.5] mb-[10px]"
      style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: -6 }}
    >
      {children}
    </p>
  )
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function NewSessionPage() {
  const router = useRouter()
  const [tab,         setTab]         = useState(0)
  const [form,        setForm]        = useState<FormState>(INITIAL)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Fichiers en attente pour les logos partenaires (slot.id → File)
  const pendingFiles  = useRef(new Map<string, File>())
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const activeSlotIdx = useRef(-1)

  function validateTab(tabIndex: number): Record<string, string> {
    const errors: Record<string, string> = {}
    if (tabIndex === 0) {
      if (!form.name.trim()) errors.name = 'Le nom de la session est obligatoire'
      if (!form.date)        errors.date = 'La date de l\'événement est obligatoire'
    }
    return errors
  }

  async function handleSubmit() {
    const errors = validateTab(0)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setTab(0)
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/sessions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name:        form.name.trim(),
        date:        form.date || undefined,
        description: form.description || undefined,
        max_cartons: form.maxCartons || undefined,
        status:      form.status,
      }),
    })
    if (!res.ok) {
      setLoading(false)
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la création')
      return
    }

    const { session } = await res.json()

    // Uploader les logos partenaires en attente
    const partnersWithFile = form.partners.filter((p) => p.imageUrl?.startsWith('blob:'))
    for (let i = 0; i < partnersWithFile.length; i++) {
      const slot = partnersWithFile[i]
      const file = pendingFiles.current.get(slot.id)
      if (!file) continue

      // Créer l'enregistrement partenaire
      const pRes = await fetch(`/api/sessions/${session.id}/partners`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:  slot.name || `Partenaire ${i + 1}`,
          order: form.partners.indexOf(slot),
        }),
      })
      if (!pRes.ok) continue
      const { partner } = await pRes.json()

      // Uploader le logo
      const fd = new FormData()
      fd.append('file', file)
      await fetch(`/api/sessions/${session.id}/partners/${partner.id}/logo`, {
        method: 'POST',
        body:   fd,
      })
    }

    setLoading(false)
    router.push('/sessions')
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function clearFieldError(key: string) {
    if (fieldErrors[key]) setFieldErrors((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  function handleAddPartner(i: number) {
    activeSlotIdx.current = i
    fileInputRef.current?.click()
  }

  function handlePartnerFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const i    = activeSlotIdx.current
    if (!file || i < 0) return

    const slot = form.partners[i]
    if (!slot) return

    // Révoquer le blob précédent si existant
    if (slot.imageUrl?.startsWith('blob:')) URL.revokeObjectURL(slot.imageUrl)

    const blobUrl = URL.createObjectURL(file)
    pendingFiles.current.set(slot.id, file)

    const next = [...form.partners]
    next[i] = { ...next[i], imageUrl: blobUrl, name: file.name.replace(/\.[^.]+$/, '') }
    set('partners', next)

    // Réinitialiser pour permettre de re-sélectionner le même fichier
    e.target.value = ''
    activeSlotIdx.current = -1
  }

  function handleNameChange(name: string) {
    set('name', name)
    if (!form.slugManual) set('slug', toSlug(name))
    clearFieldError('name')
  }

  // ── Pane 0 : Informations ──────────────────────────────────

  const pane0 = (
    <div>
      <div className="mb-[24px]">
        <SectionTitle>Informations générales</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mb-[12px]">
          <Input
            label="Nom de la session"
            hint={fieldErrors.name ? undefined : 'obligatoire'}
            error={fieldErrors.name}
            placeholder="Grand Loto de Printemps 2025"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <Input
            label="Lieu"
            placeholder="Salle des fêtes, Lyon 3e"
            value={form.lieu}
            onChange={(e) => set('lieu', e.target.value)}
          />
        </div>

        <Textarea
          label="Description"
          hint="affichée sur la page publique"
          placeholder="Décrivez votre session loto pour les participants…"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="mb-[12px]"
        />

        <Input
          label="URL publique"
          hint="slug unique — généré automatiquement"
          prefix="quinova.fr/s/"
          placeholder="grand-loto-printemps-2025"
          value={form.slug}
          onChange={(e) => { set('slugManual', true); set('slug', e.target.value) }}
        />
        {form.slug && (
          <div
            className="font-bold mt-[4px]"
            style={{ fontSize: 11, color: 'var(--color-qblue)' }}
          >
            quinova.fr/s/{form.slug}
          </div>
        )}
      </div>

      <div className="mb-[24px]">
        <SectionTitle>Date &amp; capacité</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-[12px]">
          <Input
            label="Date de l'événement"
            type="date"
            error={fieldErrors.date}
            value={form.date}
            onChange={(e) => { set('date', e.target.value); clearFieldError('date') }}
          />
          <Input
            label="Heure de début"
            type="time"
            value={form.time}
            onChange={(e) => set('time', e.target.value)}
          />
          <Input
            label="Cartons max"
            hint="quota plan Pro : 2 000"
            type="number"
            value={String(form.maxCartons)}
            onChange={(e) => set('maxCartons', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mb-[24px]">
        <SectionTitle>Statut initial</SectionTitle>
        <SectionDesc>
          Une session en <strong>Brouillon</strong> n&apos;est pas visible publiquement.
          Passez en <strong>Active</strong> le jour J.
        </SectionDesc>
        <div className="flex gap-[6px]">
          {(['draft', 'open'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set('status', s)}
              className="cursor-pointer rounded-[6px] px-[14px] py-[6px] font-bold transition-all duration-[150ms]"
              style={{
                fontSize: 11,
                border: s === 'draft'
                  ? (form.status === 'draft' ? '.5px solid rgba(0,0,0,.16)' : '.5px solid var(--color-border)')
                  : (form.status === 'open' ? '.5px solid #97C459' : '.5px solid var(--color-border)'),
                background: s === 'draft'
                  ? (form.status === 'draft' ? 'var(--color-bg)' : 'transparent')
                  : (form.status === 'open' ? 'var(--color-qgreen-bg)' : 'transparent'),
                color: s === 'draft'
                  ? (form.status === 'draft' ? 'var(--color-text-secondary)' : 'var(--color-text-hint)')
                  : (form.status === 'open' ? 'var(--color-qgreen-text)' : 'var(--color-text-hint)'),
              }}
            >
              {s === 'draft' ? 'Brouillon' : 'Active'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-[24px]">
        <SectionTitle>Partenaires</SectionTitle>
        <SectionDesc>
          Logos affichés en bas de l&apos;écran de diffusion. Format PNG ou SVG recommandé.
        </SectionDesc>
        <PartnerSlots
          slots={form.partners}
          onAdd={handleAddPartner}
          onRemove={(i) => {
            const slot = form.partners[i]
            if (slot?.imageUrl?.startsWith('blob:')) URL.revokeObjectURL(slot.imageUrl)
            pendingFiles.current.delete(slot.id)
            const next = [...form.partners]
            next[i] = { ...next[i], imageUrl: undefined, name: undefined }
            set('partners', next)
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handlePartnerFileChange}
        />
      </div>
    </div>
  )

  // ── Pane 1 : Identité visuelle ─────────────────────────────

  const pane1 = (
    <div>
      <div className="mb-[24px]">
        <SectionTitle>Logo &amp; bannière</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
          {[
            { label: 'Logo de l\'association', hint: 'PNG, SVG — max 2 Mo', height: 80 },
            { label: 'Bannière session',       hint: '1200×675 px — 16:9 recommandé', height: 80 },
          ].map(({ label, hint, height }) => (
            <div key={label}>
              <div
                className="font-bold mb-[5px]"
                style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
              >
                {label}
              </div>
              <button
                type="button"
                className="w-full flex flex-col items-center justify-center gap-[4px] rounded-[8px] cursor-pointer transition-all duration-[150ms] hover:border-[var(--color-qblue)] hover:bg-[var(--color-qblue-bg)]"
                style={{
                  height,
                  background: 'var(--color-bg)',
                  border: '.5px dashed var(--color-border)',
                }}
                aria-label={`Téléverser : ${label}`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ opacity: .3 }} aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3 15l5-4 4 3 3-2.5 6 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
                </svg>
                <div className="font-bold" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  Cliquez ou glissez-déposez
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>{hint}</div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-[24px]">
        <SectionTitle>Couleurs de l&apos;association</SectionTitle>
        <SectionDesc>
          Utilisées sur la page publique, l&apos;écran de diffusion et les cartons PDF.
        </SectionDesc>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mb-[10px]">
          {([
            { key: 'colorPrimary',   label: 'Couleur primaire' },
            { key: 'colorSecondary', label: 'Couleur secondaire' },
          ] as Array<{ key: 'colorPrimary' | 'colorSecondary'; label: string }>).map(({ key, label }) => (
            <div key={key}>
              <div
                className="font-bold mb-[5px]"
                style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
              >
                {label}
              </div>
              <div className="flex items-center gap-[8px]">
                <div
                  className="rounded-[6px] overflow-hidden relative flex-shrink-0"
                  style={{ width: 32, height: 32, background: form[key], border: '.5px solid var(--color-border)' }}
                >
                  <input
                    type="color"
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    aria-label={label}
                  />
                </div>
                <span
                  className="font-bold"
                  style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}
                >
                  {form[key]}
                </span>
                <div
                  className="flex-1 rounded-[4px]"
                  style={{ height: 22, background: form[key], border: '.5px solid var(--color-border)' }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mini preview */}
        <div>
          <div className="font-bold mb-[6px]" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            Aperçu
          </div>
          <div
            className="rounded-[8px] px-[16px] py-[14px]"
            style={{ background: form.colorPrimary, maxWidth: 320 }}
          >
            <div
              className="font-display leading-none"
              style={{ fontSize: 20, color: 'white' }}
            >
              {form.name || 'Nom de la session'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>
              {form.lieu || 'Lieu de l\'événement'}
            </div>
            <div
              className="inline-block font-bold rounded-[4px] px-[10px] py-[3px] mt-[8px]"
              style={{ fontSize: 9, background: form.colorSecondary, color: '#5C3A00' }}
            >
              Session {form.status === 'open' ? 'active' : 'brouillon'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Pane 2 : Ventes & paiement ─────────────────────────────

  const pane2 = (
    <div>
      <div className="mb-[24px]">
        <SectionTitle>Modes de vente autorisés</SectionTitle>
        <SectionDesc>
          Les modes non cochés seront désactivés pour cette session.
        </SectionDesc>
        <ProviderGrid
          enabled={form.providers}
          onChange={(id, val) => set('providers', { ...form.providers, [id]: val })}
        />
      </div>

      <div className="mb-[24px]">
        <SectionTitle>Dates de fin des ventes</SectionTitle>
        <SectionDesc>
          Les ventes sont automatiquement bloquées à ces horaires. Une date vide = pas de limite.
        </SectionDesc>

        {[
          {
            label: 'Ventes en ligne', badge: 'ONLINE', badgeBg: 'var(--color-qblue-bg)', badgeColor: 'var(--color-qblue-text)',
            dateKey: 'saleDeadlineOnlineDate' as const, timeKey: 'saleDeadlineOnlineTime' as const,
          },
          {
            label: 'Ventes sur place', badge: 'CASH / CB', badgeBg: 'var(--color-qgreen-bg)', badgeColor: 'var(--color-qgreen-text)',
            dateKey: 'saleDeadlinePlaceDate' as const, timeKey: 'saleDeadlinePlaceTime' as const,
          },
        ].map(({ label, badge, badgeBg, badgeColor, dateKey, timeKey }) => (
          <div
            key={label}
            className="rounded-[8px] px-[12px] py-[10px] mb-[10px]"
            style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)' }}
          >
            <div
              className="flex items-center gap-[6px] font-bold mb-[8px]"
              style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
            >
              {label}
              <span
                className="font-bold rounded-[4px] px-[7px] py-[2px]"
                style={{ fontSize: 9, background: badgeBg, color: badgeColor }}
              >
                {badge}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              <Input label="Date limite" type="date" value={form[dateKey]} onChange={(e) => set(dateKey, e.target.value)} />
              <Input label="Heure limite" type="time" value={form[timeKey]} onChange={(e) => set(timeKey, e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-[24px]">
        <SectionTitle>Limites d&apos;achat</SectionTitle>

        {/* Info légale */}
        <div
          className="flex items-start gap-[8px] rounded-[7px] px-[12px] py-[9px] mb-[10px]"
          style={{ background: 'var(--color-qblue-bg)', border: '.5px solid rgba(24,95,165,.2)' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="var(--color-qblue)" strokeWidth="1.4" />
            <path d="M8 5v3l2 2" stroke="var(--color-qblue)" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <p className="leading-[1.5]" style={{ fontSize: 11, color: 'var(--color-qblue-text)' }}>
            Conformément à la réglementation française (art. L.322-4 CSI), la mise maximale
            par carton est de <strong>20 €</strong>. Le plafond par personne est recommandé
            pour éviter les dérives de jeu excessif.
          </p>
        </div>

        {[
          {
            label: 'Cartons max par personne',
            sub: 'Tous forfaits confondus · s\'applique en ligne et sur place',
            key: 'maxCartonsPerPerson' as const,
          },
          {
            label: 'Cartons offerts max par session',
            sub: 'Limite globale d\'attribution gratuite (FREE) · 0 = désactivé',
            key: 'maxFreeCartons' as const,
          },
        ].map(({ label, sub, key }) => (
          <div
            key={key}
            className="flex items-center gap-[10px] rounded-[7px] px-[11px] py-[8px] mb-[8px]"
            style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)' }}
          >
            <div className="flex-1">
              <div className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                {label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                {sub}
              </div>
            </div>
            <Stepper
              label={label}
              value={form[key]}
              min={0}
              max={key === 'maxCartonsPerPerson' ? 200 : 500}
              onChange={(v) => set(key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  )

  // ── Pane 3 : Règles de jeu ─────────────────────────────────

  const pane3 = (
    <div>
      <div className="mb-[24px]">
        <SectionTitle>Règles ex-aequo par type de tirage</SectionTitle>
        <SectionDesc>
          Règle applicable lorsque plusieurs cartons remplissent la condition gagnante au même numéro.
          Ces règles s&apos;appliquent à toute la session.
        </SectionDesc>
        <RulesTable
          rules={form.rules}
          onChange={(type, rule) => set('rules', { ...form.rules, [type]: rule })}
        />
      </div>

      <div className="mb-[24px]">
        <SectionTitle>Intervalle de tirage automatique</SectionTitle>
        <SectionDesc>
          Temps entre chaque numéro en mode automatique. Modifiable en cours de session.
        </SectionDesc>
        <div
          className="flex items-center gap-[10px] rounded-[7px] px-[11px] py-[8px]"
          style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)' }}
        >
          <div className="flex-1">
            <div className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
              Intervalle (secondes)
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 1 }}>
              Défaut : 2,2 s · Min : 1 s · Max : 10 s
            </div>
          </div>
          <div className="flex items-center gap-[8px]">
            <input
              type="range"
              min={1} max={10} step={0.2}
              value={form.drawInterval}
              onChange={(e) => set('drawInterval', parseFloat(e.target.value))}
              style={{ width: 100 }}
              aria-label="Intervalle de tirage en secondes"
            />
            <span
              className="font-display text-right"
              style={{ fontSize: 20, color: 'var(--color-text-primary)', minWidth: 36 }}
            >
              {form.drawInterval.toFixed(1)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>s</span>
          </div>
        </div>
      </div>

      <div className="mb-[24px]">
        <SectionTitle>Équipe &amp; accès</SectionTitle>
        <SectionDesc>
          Invitez des bénévoles avec des droits temporaires pour cette session uniquement.
        </SectionDesc>
        <div className="flex flex-col gap-[5px]">
          <div
            className="flex items-center gap-[8px] rounded-[7px] px-[10px] py-[7px]"
            style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
          >
            <div
              className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{ width: 26, height: 26, background: '#1A3045', fontSize: 10, color: '#78AED0' }}
              aria-hidden="true"
            >
              AL
            </div>
            <div className="flex-1">
              <div className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                Alex L.
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                alex@amis-quartier.fr
              </div>
            </div>
            <span
              className="font-bold rounded-[4px] px-[8px] py-[2px]"
              style={{ fontSize: 9, background: '#0D1E2C', color: 'var(--color-amber)' }}
            >
              Admin
            </span>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-[6px] w-full mt-[7px] rounded-[7px] px-[10px] py-[7px] cursor-pointer hover:bg-[var(--color-qblue-bg)] transition-colors duration-[150ms]"
          style={{
            background: 'transparent',
            border: '.5px dashed var(--color-border)',
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--color-text-secondary)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Inviter un bénévole (Animateur / Vérificateur)
        </button>
      </div>
    </div>
  )

  const panes = [pane0, pane1, pane2, pane3]

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div className="flex md:flex-1 md:min-h-0 md:overflow-hidden md:-mx-[20px] md:-my-[16px]">

      {/* Zone formulaire */}
      <div className="flex-1 min-w-0 md:overflow-y-auto px-[20px] py-[18px] pb-[32px]">

        <SessionFormTabs
          tabs={TABS}
          activeIndex={tab}
          onChange={setTab}
        />

        {/* Pane actif */}
        <div key={tab}>
          {panes[tab]}
        </div>

        {/* Navigation bas */}
        <div
          className="flex justify-between mt-[8px] pt-[16px]"
          style={{ borderTop: '.5px solid var(--color-sep)' }}
        >
          {tab > 0 ? (
            <Button variant="ghost" onClick={() => setTab(tab - 1)}>
              ← Précédent
            </Button>
          ) : (
            <div />
          )}
          {error && tab === 3 && (
            <div className="mb-[8px] rounded-[7px] px-[12px] py-[8px]"
              style={{ background: '#FEF2F2', fontSize: 12, color: 'var(--color-qred)', border: '.5px solid var(--color-qred)' }}>
              {error}
            </div>
          )}
          <Button
            variant={tab === 3 ? 'primary' : 'secondary'}
            disabled={loading}
            onClick={() => {
              if (tab < 3) {
                const errors = validateTab(tab)
                if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
                setFieldErrors({})
                setTab(tab + 1)
              } else {
                handleSubmit()
              }
            }}
          >
            {tab === 3 && loading ? 'Création en cours…' : NEXT_LABELS[tab]}
          </Button>
        </div>
      </div>

      {/* Panel récapitulatif — masqué sur mobile */}
      <div className="hidden md:block">
        <SessionSummaryPanel
          draft={{
            name: form.name,
            date: form.date,
            lieu: form.lieu,
            maxCartons: form.maxCartons,
            slug: form.slug,
            providers: form.providers,
            maxCartonsPerPerson: form.maxCartonsPerPerson,
            maxFreeCartons: form.maxFreeCartons,
            rules: form.rules,
          }}
        />
      </div>
    </div>
  )
}
