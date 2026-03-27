'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card }     from '@/components/ui/Card'
import { Badge }    from '@/components/ui/Badge'
import { Button }   from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select }   from '@/components/ui/Select'
import { cn }       from '@/lib/cn'
import type { LotStatus } from '@/types/session'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface LotRow {
  id:           string
  name:         string
  description?: string
  order:        number
  value?:       number
  status:       LotStatus
}

// ─────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { value: 'all',       label: 'Tous les lots' },
  { value: 'pending',   label: 'En attente' },
  { value: 'drawn',     label: 'Tirés' },
  { value: 'cancelled', label: 'Annulés' },
]

// ─────────────────────────────────────────
// Formulaire ajout / édition
// ─────────────────────────────────────────

interface LotFormState { name: string; description: string; value: string }
const EMPTY_FORM: LotFormState = { name: '', description: '', value: '' }

function LotForm({
  initial, loading, onSave, onCancel,
}: { initial?: LotFormState; loading?: boolean; onSave: (f: LotFormState) => void; onCancel: () => void }) {
  const [form, setForm] = useState<LotFormState>(initial ?? EMPTY_FORM)
  function set<K extends keyof LotFormState>(k: K, v: LotFormState[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }
  return (
    <div className="flex flex-col gap-[12px]">
      <Input
        label="Nom du lot" hint="obligatoire"
        placeholder='ex : TV 55″ 4K OLED'
        value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus
      />
      <Input
        label="Valeur estimée (€)" type="number" placeholder="0"
        value={form.value} onChange={(e) => set('value', e.target.value)}
      />
      <Textarea
        label="Description" hint="optionnelle" placeholder="Détails du lot…"
        value={form.description} onChange={(e) => set('description', e.target.value)}
      />
      <div className="flex justify-end gap-[8px] mt-[4px]">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>Annuler</Button>
        <Button variant="primary" disabled={!form.name.trim() || loading} onClick={() => onSave(form)}>
          {loading ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Ligne de lot
// ─────────────────────────────────────────

function LotItem({
  lot, index, isEditing, isFirst, isLast, saving,
  onEdit, onCancelEdit, onSaveEdit, onDelete, onMoveUp, onMoveDown,
}: {
  lot: LotRow; index: number; isEditing: boolean; isFirst: boolean; isLast: boolean; saving?: boolean
  onEdit: () => void; onCancelEdit: () => void
  onSaveEdit: (f: LotFormState) => void
  onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void
}) {
  return (
    <li>
      {isEditing ? (
        <div
          className="rounded-[9px] px-[16px] py-[14px] mb-[8px]"
          style={{ background: 'var(--color-qblue-bg)', border: '.5px solid var(--color-qblue)' }}
        >
          <div className="font-bold mb-[12px]" style={{ fontSize: 11, color: 'var(--color-qblue-text)' }}>
            Modifier — {lot.name}
          </div>
          <LotForm
            initial={{ name: lot.name, description: lot.description ?? '', value: lot.value ? String(lot.value) : '' }}
            loading={saving}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center gap-[12px] rounded-[9px] px-[14px] py-[11px] mb-[6px] group transition-colors duration-[100ms]',
            lot.status === 'drawn' && 'opacity-60'
          )}
          style={{ background: 'var(--color-card)', border: '.5px solid var(--color-border)' }}
        >
          <span
            className="font-display flex-shrink-0 text-center"
            style={{ fontSize: 18, color: 'var(--color-text-hint)', minWidth: 24 }}
            aria-label={`Lot n°${lot.order}`}
          >
            {lot.order}
          </span>

          <div
            aria-hidden="true"
            className="flex-shrink-0 rounded-[6px] flex items-center justify-center"
            style={{ width: 36, height: 36, background: 'var(--color-bg)', border: '.5px solid var(--color-border)' }}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
              <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="var(--color-amber)" strokeWidth="1.3" />
              <circle cx="8" cy="8" r="2.5" stroke="var(--color-amber)" strokeWidth="1.2" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-bold truncate" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
              {lot.name}
            </div>
            {lot.description && (
              <div className="truncate mt-[1px]" style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                {lot.description}
              </div>
            )}
          </div>

          {lot.value !== undefined && (
            <span className="font-display flex-shrink-0" style={{ fontSize: 18, color: 'var(--color-amber)' }}>
              {lot.value} €
            </span>
          )}

          <Badge variant={lot.status === 'drawn' ? 'won' : lot.status === 'pending' ? 'pending' : 'cancelled'} />

          <div className="flex items-center gap-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-[150ms] flex-shrink-0">
            <button
              type="button" onClick={onMoveUp}
              disabled={isFirst || lot.status === 'drawn'} aria-label="Monter"
              className="rounded p-[4px] cursor-pointer hover:bg-black/[.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ border: 'none', background: 'transparent' }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 8l4-4 4 4" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button" onClick={onMoveDown}
              disabled={isLast || lot.status === 'drawn'} aria-label="Descendre"
              className="rounded p-[4px] cursor-pointer hover:bg-black/[.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ border: 'none', background: 'transparent' }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button" onClick={onEdit}
              disabled={lot.status === 'drawn'} aria-label={`Modifier ${lot.name}`}
              className="rounded px-[8px] py-[3px] font-bold cursor-pointer transition-colors duration-[100ms] disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontSize: 11, color: 'var(--color-qblue)', background: 'transparent', border: 'none' }}
            >
              Modifier
            </button>
            <button
              type="button" onClick={onDelete}
              disabled={lot.status === 'drawn'} aria-label={`Supprimer ${lot.name}`}
              className="rounded px-[8px] py-[3px] font-bold cursor-pointer transition-colors duration-[100ms] disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontSize: 11, color: 'var(--color-qred)', background: 'transparent', border: 'none' }}
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

// ─────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────

export function LotsClient({
  initialLots,
  sessionId,
  sessionName,
}: {
  initialLots: LotRow[]
  sessionId:   string | null
  sessionName: string
}) {
  const router = useRouter()
  const [lots, setLots]           = useState<LotRow[]>(initialLots)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId]   = useState<string | null>(null)
  const [isAdding, setIsAdding]   = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [filter, setFilter]       = useState<'all' | LotStatus>('all')
  const [error, setError]         = useState('')

  const filtered = filter === 'all' ? lots : lots.filter((l) => l.status === filter)

  const drawnCount   = lots.filter((l) => l.status === 'drawn').length
  const pendingCount = lots.filter((l) => l.status === 'pending').length
  const totalValue   = lots.reduce((sum, l) => sum + (l.value ?? 0), 0)

  async function addLot(f: LotFormState) {
    if (!sessionId) return
    setAddLoading(true)
    setError('')
    const res = await fetch(`/api/sessions/${sessionId}/lots`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name:        f.name.trim(),
        description: f.description || undefined,
        value:       f.value ? Number(f.value) : undefined,
        order:       lots.length + 1,
      }),
    })
    setAddLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la création')
      return
    }
    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const l = data.lot as any
    setLots((prev) => [...prev, {
      id:          l.id,
      name:        l.name,
      description: l.description ?? undefined,
      value:       l.value != null ? Number(l.value) : undefined,
      order:       l.order,
      status:      l.status as LotStatus,
    }])
    setIsAdding(false)
  }

  async function saveEdit(id: string, f: LotFormState) {
    if (!sessionId) return
    setSavingId(id)
    setError('')
    const res = await fetch(`/api/sessions/${sessionId}/lots/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name:        f.name.trim(),
        description: f.description || undefined,
        value:       f.value ? Number(f.value) : undefined,
      }),
    })
    setSavingId(null)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la mise à jour')
      return
    }
    setLots((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, name: f.name, description: f.description || undefined, value: f.value ? Number(f.value) : undefined }
          : l
      )
    )
    setEditingId(null)
  }

  async function deleteLot(id: string) {
    if (!sessionId) return
    setError('')
    const res = await fetch(`/api/sessions/${sessionId}/lots/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Impossible de supprimer ce lot')
      return
    }
    setLots((prev) => prev.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i + 1 })))
  }

  async function move(index: number, direction: -1 | 1) {
    if (!sessionId) return
    const target = index + direction
    if (target < 0 || target >= lots.length) return
    const a = lots[index]
    const b = lots[target]
    // Mise à jour optimiste
    setLots((prev) => {
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next.map((l, i) => ({ ...l, order: i + 1 }))
    })
    // Persistance en parallèle
    await Promise.all([
      fetch(`/api/sessions/${sessionId}/lots/${a.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/sessions/${sessionId}/lots/${b.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: a.order }),
      }),
    ])
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-[14px]">

      {/* Métriques */}
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Lots total',    value: String(lots.length)   },
          { label: 'Tirés',         value: String(drawnCount)    },
          { label: 'En attente',    value: String(pendingCount)  },
          { label: 'Valeur totale', value: `${totalValue.toLocaleString('fr-FR')} €` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-[9px] px-[15px] py-[13px]"
            style={{ background: 'var(--color-card)', border: '.5px solid var(--color-border)' }}
          >
            <div className="font-bold" style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
              {label}
            </div>
            <div className="font-display leading-none" style={{ fontSize: 28, color: 'var(--color-text-primary)' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-[7px] px-[12px] py-[9px]"
          style={{ background: 'var(--color-qred-bg, #FEF2F2)', border: '.5px solid var(--color-qred)', fontSize: 12, color: 'var(--color-qred)' }}>
          {error}
        </div>
      )}

      {/* Liste */}
      <Card
        title={`Lots — ${sessionName}`}
        headerRight={
          <div className="flex items-center gap-[8px]">
            <Select
              options={STATUS_FILTER_OPTIONS}
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | LotStatus)}
              style={{ fontSize: 11, padding: '4px 28px 4px 9px' }}
            />
            <Button
              variant="primary" size="sm"
              disabled={!sessionId}
              onClick={() => { setIsAdding(true); setEditingId(null) }}
            >
              + Ajouter un lot
            </Button>
          </div>
        }
      >
        {isAdding && (
          <div
            className="rounded-[9px] px-[16px] py-[14px] mb-[12px]"
            style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-border)' }}
          >
            <div className="font-bold mb-[12px]" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Nouveau lot
            </div>
            <LotForm loading={addLoading} onSave={addLot} onCancel={() => setIsAdding(false)} />
          </div>
        )}

        {!sessionId ? (
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '8px 0' }}>
            Aucune session active. Créez une session pour ajouter des lots.
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '8px 0' }}>
            Aucun lot{filter !== 'all' ? ' dans ce statut' : ''}. Ajoutez-en un ci-dessus.
          </p>
        ) : (
          <ul className="list-none m-0 p-0">
            {filtered.map((lot) => {
              const realIndex = lots.findIndex((l) => l.id === lot.id)
              return (
                <LotItem
                  key={lot.id}
                  lot={lot}
                  index={realIndex}
                  isEditing={editingId === lot.id}
                  isFirst={realIndex === 0}
                  isLast={realIndex === lots.length - 1}
                  saving={savingId === lot.id}
                  onEdit={() => { setEditingId(lot.id); setIsAdding(false) }}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={(f) => saveEdit(lot.id, f)}
                  onDelete={() => deleteLot(lot.id)}
                  onMoveUp={() => move(realIndex, -1)}
                  onMoveDown={() => move(realIndex, 1)}
                />
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
