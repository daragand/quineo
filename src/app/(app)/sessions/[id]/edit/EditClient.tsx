'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface SessionData {
  id:          string
  name:        string
  date?:       string
  description?: string
  max_cartons?: number
  status:      'draft' | 'open' | 'running' | 'closed' | 'cancelled'
}

interface FormState {
  name:        string
  date:        string
  time:        string
  description: string
  maxCartons:  number
  status:      'draft' | 'open'
}

// ─────────────────────────────────────────
// Helpers
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

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function EditSessionClient({ session }: { session: SessionData }) {
  const router = useRouter()

  const [form, setForm] = useState<FormState>({
    name:        session.name,
    date:        session.date ?? '',
    time:        '14:00',
    description: session.description ?? '',
    maxCartons:  session.max_cartons ?? 500,
    status:      (session.status === 'open' ? 'open' : 'draft') as 'draft' | 'open',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError('Le nom de la session est obligatoire'); return }
    setLoading(true)
    setError('')

    const res = await fetch(`/api/sessions/${session.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name:        form.name.trim(),
        date:        form.date || undefined,
        description: form.description || undefined,
        max_cartons: form.maxCartons || undefined,
        status:      form.status,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la sauvegarde')
      return
    }
    router.push('/sessions')
  }

  return (
    <div className="max-w-[640px]">

      {/* En-tête */}
      <div className="flex items-center gap-[10px] mb-[24px]">
        <Link href="/sessions">
          <Button variant="ghost" size="sm">← Retour</Button>
        </Link>
        <div>
          <h1
            className="font-display leading-none"
            style={{ fontSize: 24, color: 'var(--color-text-primary)' }}
          >
            Éditer la session
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {session.name}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div
        className="rounded-[10px] px-[20px] py-[18px] mb-[16px]"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
      >
        <div className="mb-[24px]">
          <SectionTitle>Informations générales</SectionTitle>
          <div className="grid gap-[12px] mb-[12px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input
                label="Nom de la session"
                hint="obligatoire"
                placeholder="Grand Loto de Printemps 2025"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
          </div>

          <Textarea
            label="Description"
            hint="affichée sur la page publique"
            placeholder="Décrivez votre session loto pour les participants…"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="mb-[12px]"
          />
        </div>

        <div className="mb-[24px]">
          <SectionTitle>Date &amp; capacité</SectionTitle>
          <div className="grid gap-[12px]" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <Input
              label="Date de l'événement"
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
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

        <div className="mb-[8px]">
          <SectionTitle>Statut</SectionTitle>
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
      </div>

      {/* Erreur */}
      {error && (
        <div
          className="rounded-[7px] px-[12px] py-[8px] mb-[12px]"
          style={{ background: '#FEF2F2', fontSize: 12, color: 'var(--color-qred)', border: '.5px solid var(--color-qred)' }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-[8px]">
        <Link href="/sessions">
          <Button variant="secondary">Annuler</Button>
        </Link>
        <Button variant="primary" disabled={loading} onClick={handleSubmit}>
          {loading ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </div>
  )
}
