'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { TirageData } from '@/app/(app)/tirage/TirageClient'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanLot {
  id:     string
  name:   string
  value:  string | null
  status: string
}

interface PlannedTirage {
  id:     string
  type:   'quine' | 'double_quine' | 'carton_plein' | 'pause'
  order:  number
  status: 'draft' | 'ready'
  lots:   PlanLot[]
}

interface SessionLot {
  id:     string
  name:   string
  value:  string | null
  status: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TBadge = 'quine' | 'dquine' | 'carton' | 'draft'
const TYPE_BADGE: Record<string, TBadge> = {
  quine: 'quine', double_quine: 'dquine', carton_plein: 'carton', pause: 'draft',
}
const TYPE_LABEL: Record<string, string> = {
  quine: 'Quine', double_quine: 'Double Quine', carton_plein: 'Carton Plein', pause: 'Pause',
}

// ─── SortableCard ─────────────────────────────────────────────────────────────

function SortableCard({
  tirage,
  index,
  onDelete,
  onEdit,
}: {
  tirage:   PlannedTirage
  index:    number
  onDelete: (id: string) => void
  onEdit:   (t: PlannedTirage) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tirage.id })

  const isPause = tirage.type === 'pause'

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
    >
      {isPause ? (
        <div
          className="flex items-center gap-[10px] px-[14px] py-[9px] rounded-[8px]"
          style={{ border: '.5px dashed var(--color-sep)', background: 'var(--color-bg)' }}
        >
          <button
            {...attributes} {...listeners}
            aria-label="Déplacer"
            style={{ cursor: 'grab', color: 'var(--color-text-hint)', background: 'none', border: 'none', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}
          >⠿</button>
          <div className="flex-1 flex items-center gap-[8px]">
            <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>· · ·</span>
            <Badge variant="draft">Pause</Badge>
          </div>
          <button
            onClick={() => onDelete(tirage.id)}
            aria-label="Supprimer"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-hint)', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}
          >×</button>
        </div>
      ) : (
        <div
          className="rounded-[8px] overflow-hidden"
          style={{ border: '.5px solid var(--color-sep)', background: 'var(--color-card)' }}
        >
          {/* En-tête */}
          <div
            className="flex items-center gap-[10px] px-[14px] py-[10px]"
            style={{ borderBottom: tirage.lots.length > 0 ? '.5px solid var(--color-sep)' : 'none' }}
          >
            <button
              {...attributes} {...listeners}
              aria-label="Déplacer"
              style={{ cursor: 'grab', color: 'var(--color-text-hint)', background: 'none', border: 'none', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}
            >⠿</button>
            <span
              className="font-bold font-display"
              style={{ fontSize: 13, color: 'var(--color-text-hint)', minWidth: 22 }}
            >#{index + 1}</span>
            <Badge variant={TYPE_BADGE[tirage.type]}>{TYPE_LABEL[tirage.type]}</Badge>
            <div className="flex-1" />
            <Badge variant={tirage.status === 'ready' ? 'pending' : 'draft'}>
              {tirage.status === 'ready' ? 'Prêt' : 'Brouillon'}
            </Badge>
            <button
              onClick={() => onEdit(tirage)}
              className="rounded-[5px] px-[8px] py-[4px] cursor-pointer transition-opacity hover:opacity-80"
              style={{
                background: 'var(--color-bg)',
                border: '.5px solid var(--color-border)',
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                color: 'var(--color-text-secondary)',
              }}
            >Modifier</button>
            <button
              onClick={() => onDelete(tirage.id)}
              aria-label="Supprimer"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-hint)', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}
            >×</button>
          </div>

          {/* Lots */}
          {tirage.lots.length > 0 && (
            <div className="px-[14px] py-[9px] flex flex-wrap gap-[6px]">
              {tirage.lots.map(lot => (
                <span
                  key={lot.id}
                  className="rounded-[5px] px-[8px] py-[3px]"
                  style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)', fontSize: 11, color: 'var(--color-text-primary)' }}
                >
                  {lot.name}
                  {lot.value != null && (
                    <span style={{ color: 'var(--color-text-hint)', marginLeft: 4 }}>
                      {parseFloat(lot.value).toLocaleString('fr-FR')} €
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Modal ajouter / modifier tirage ─────────────────────────────────────────

function EditTirageModal({
  sessionId,
  tirage,
  sessionLots,
  usedLotIds,
  onClose,
  onSaved,
}: {
  sessionId:   string
  tirage:      PlannedTirage | null
  sessionLots: SessionLot[]
  usedLotIds:  Set<string>
  onClose:     () => void
  onSaved:     () => void
}) {
  const [type, setType] = useState<'quine' | 'double_quine' | 'carton_plein'>(
    tirage?.type !== 'pause' ? (tirage?.type ?? 'quine') : 'quine'
  )
  const [selectedLots, setSelectedLots] = useState<Set<string>>(
    new Set(tirage?.lots.map(l => l.id) ?? [])
  )
  const [status,  setStatus]  = useState<'draft' | 'ready'>(tirage?.status ?? 'draft')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const TYPES = [
    { value: 'quine',        label: 'Quine' },
    { value: 'double_quine', label: 'Double Quine' },
    { value: 'carton_plein', label: 'Carton Plein' },
  ] as const

  function toggleLot(id: string) {
    setSelectedLots(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function save() {
    setLoading(true)
    setError('')
    const lot_ids = Array.from(selectedLots)
    try {
      let res: Response
      if (tirage) {
        res = await fetch(`/api/sessions/${sessionId}/tirages/${tirage.id}`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ type, lot_ids, status }),
        })
      } else {
        res = await fetch(`/api/sessions/${sessionId}/tirages`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ type, lot_ids }),
        })
      }
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erreur')
        return
      }
      onSaved()
    } finally {
      setLoading(false)
    }
  }

  // Lots déjà utilisés par d'autres tirages (pas celui qu'on édite)
  const otherUsed = new Set(
    [...usedLotIds].filter(id => !tirage?.lots.map(l => l.id).includes(id))
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-[14px] w-full overflow-hidden flex flex-col"
        style={{ maxWidth: 500, maxHeight: '90vh', background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-[18px] py-[13px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}
        >
          <span className="font-bold" style={{ fontSize: 15 }}>
            {tirage ? 'Modifier le tirage' : 'Ajouter un tirage'}
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1 }}
          >×</button>
        </div>

        {/* Corps (scrollable) */}
        <div className="overflow-y-auto px-[18px] py-[16px] flex flex-col gap-[16px]">

          {/* Type */}
          <div>
            <div className="font-bold uppercase tracking-[.1em] mb-[8px]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Type</div>
            <div className="flex gap-[8px] flex-wrap">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className="rounded-[8px] px-[14px] py-[8px] font-bold cursor-pointer transition-colors"
                  style={{
                    background: type === t.value ? 'var(--color-qblue-bg)' : 'var(--color-bg)',
                    border:     `.5px solid ${type === t.value ? 'var(--color-qblue)' : 'var(--color-sep)'}`,
                    color:      type === t.value ? 'var(--color-qblue)' : 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize:   12,
                  }}
                >{t.label}</button>
              ))}
            </div>
          </div>

          {/* Statut (modification uniquement) */}
          {tirage && (
            <div>
              <div className="font-bold uppercase tracking-[.1em] mb-[8px]"
                style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Statut</div>
              <div className="flex gap-[8px]">
                {(['draft', 'ready'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className="rounded-[8px] px-[14px] py-[8px] font-bold cursor-pointer transition-colors"
                    style={{
                      background: status === s ? 'var(--color-qblue-bg)' : 'var(--color-bg)',
                      border:     `.5px solid ${status === s ? 'var(--color-qblue)' : 'var(--color-sep)'}`,
                      color:      status === s ? 'var(--color-qblue)' : 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                      fontSize:   12,
                    }}
                  >{s === 'draft' ? 'Brouillon' : 'Prêt'}</button>
                ))}
              </div>
            </div>
          )}

          {/* Lots */}
          <div>
            <div className="font-bold uppercase tracking-[.1em] mb-[8px]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>
              Lots ({selectedLots.size} sélectionné{selectedLots.size !== 1 ? 's' : ''})
            </div>
            {sessionLots.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>
                Aucun lot dans cette session.
              </p>
            ) : (
              <div className="flex flex-col gap-[4px]">
                {sessionLots.map(lot => {
                  const checked = selectedLots.has(lot.id)
                  const blocked = !checked && otherUsed.has(lot.id)
                  return (
                    <button
                      key={lot.id}
                      type="button"
                      onClick={() => !blocked && toggleLot(lot.id)}
                      className="flex items-center gap-[10px] rounded-[7px] px-[12px] py-[8px] text-left transition-colors"
                      style={{
                        background:  checked ? 'var(--color-qblue-bg)' : 'var(--color-bg)',
                        border:      `.5px solid ${checked ? 'var(--color-qblue)' : 'var(--color-sep)'}`,
                        opacity:     blocked ? 0.45 : 1,
                        cursor:      blocked ? 'not-allowed' : 'pointer',
                        fontFamily:  'var(--font-body)',
                      }}
                    >
                      <span
                        className="flex-1 font-bold"
                        style={{ fontSize: 12, color: checked ? 'var(--color-qblue)' : 'var(--color-text-primary)' }}
                      >{lot.name}</span>
                      {lot.value != null && (
                        <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
                          {parseFloat(lot.value).toLocaleString('fr-FR')} €
                        </span>
                      )}
                      {blocked && (
                        <span style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Déjà planifié</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {error && <p style={{ fontSize: 12, color: 'var(--color-qred)' }}>{error}</p>}
        </div>

        {/* Pied */}
        <div
          className="flex justify-end gap-[8px] px-[18px] py-[13px]"
          style={{ borderTop: '.5px solid var(--color-sep)' }}
        >
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button variant="primary" size="sm" onClick={save} disabled={loading}>
            {loading ? '…' : tirage ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal auto-générer ────────────────────────────────────────────────────────

function GenerateModal({
  sessionId,
  onClose,
  onGenerated,
}: {
  sessionId:   string
  onClose:     () => void
  onGenerated: () => void
}) {
  const [count,         setCount]         = useState(10)
  const [distMode,      setDistMode]      = useState<'auto' | 'manual'>('auto')
  const [quine,         setQuine]         = useState(5)
  const [doubleQuine,   setDoubleQuine]   = useState(3)
  const [cartonPlein,   setCartonPlein]   = useState(2)
  const [strategy,      setStrategy]      = useState<'value_desc' | 'even'>('value_desc')
  const [replaceDrafts, setReplaceDrafts] = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    const body: Record<string, unknown> = {
      count,
      lot_strategy:   strategy,
      replace_drafts: replaceDrafts,
    }
    if (distMode === 'manual') {
      body.distribution = { quine, double_quine: doubleQuine, carton_plein: cartonPlein }
    }
    try {
      const res = await fetch(`/api/sessions/${sessionId}/tirages/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erreur')
        return
      }
      onGenerated()
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    border: '.5px solid var(--color-border)',
    background: 'var(--color-bg)',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: 'var(--color-text-primary)',
    outline: 'none',
    borderRadius: 7,
    padding: '7px 10px',
    width: '100%',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-[14px] w-full"
        style={{ maxWidth: 460, background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-[18px] py-[13px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}
        >
          <span className="font-bold" style={{ fontSize: 15 }}>Auto-générer les tirages</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1 }}
          >×</button>
        </div>

        <div className="px-[18px] py-[16px] flex flex-col gap-[16px]">

          {/* Nombre */}
          <div>
            <div className="font-bold uppercase tracking-[.1em] mb-[8px]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Nombre de tirages</div>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              style={inputStyle}
            />
          </div>

          {/* Distribution */}
          <div>
            <div className="font-bold uppercase tracking-[.1em] mb-[8px]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Répartition des types</div>
            <div className="flex gap-[8px] mb-[10px]">
              {(['auto', 'manual'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDistMode(m)}
                  className="rounded-[8px] px-[14px] py-[7px] font-bold cursor-pointer"
                  style={{
                    background: distMode === m ? 'var(--color-qblue-bg)' : 'var(--color-bg)',
                    border:     `.5px solid ${distMode === m ? 'var(--color-qblue)' : 'var(--color-sep)'}`,
                    color:      distMode === m ? 'var(--color-qblue)' : 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize:   12,
                  }}
                >{m === 'auto' ? 'Automatique' : 'Manuelle'}</button>
              ))}
            </div>
            {distMode === 'auto' ? (
              <p style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>
                ~20 % carton plein · ~30 % double quine · reste en quine
              </p>
            ) : (
              <div className="flex gap-[10px]">
                {[
                  { label: 'Quine',        value: quine,       set: setQuine },
                  { label: 'Double Quine', value: doubleQuine, set: setDoubleQuine },
                  { label: 'Carton Plein', value: cartonPlein, set: setCartonPlein },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex-1">
                    <div style={{ fontSize: 10, color: 'var(--color-text-hint)', marginBottom: 4 }}>{label}</div>
                    <input
                      type="number"
                      min={0}
                      value={value}
                      onChange={e => set(Math.max(0, parseInt(e.target.value) || 0))}
                      style={{ ...inputStyle, textAlign: 'center', padding: '7px 6px' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stratégie lots */}
          <div>
            <div className="font-bold uppercase tracking-[.1em] mb-[8px]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Répartition des lots</div>
            <div className="flex gap-[8px]">
              {([
                { value: 'value_desc' as const, label: 'Par valeur',  desc: 'Lots chers → carton plein' },
                { value: 'even'       as const, label: 'Équitable',   desc: 'Lots dans l\'ordre' },
              ]).map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStrategy(s.value)}
                  className="flex-1 rounded-[8px] px-[10px] py-[8px] text-left cursor-pointer"
                  style={{
                    background: strategy === s.value ? 'var(--color-qblue-bg)' : 'var(--color-bg)',
                    border:     `.5px solid ${strategy === s.value ? 'var(--color-qblue)' : 'var(--color-sep)'}`,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <div className="font-bold" style={{ fontSize: 11, color: strategy === s.value ? 'var(--color-qblue)' : 'var(--color-text-primary)' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-hint)', marginTop: 2 }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Remplacer brouillons */}
          <label className="flex items-center gap-[8px] cursor-pointer">
            <input
              type="checkbox"
              checked={replaceDrafts}
              onChange={e => setReplaceDrafts(e.target.checked)}
            />
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Remplacer les tirages en brouillon existants
            </span>
          </label>

          {error && <p style={{ fontSize: 12, color: 'var(--color-qred)' }}>{error}</p>}
        </div>

        {/* Pied */}
        <div
          className="flex justify-end gap-[8px] px-[18px] py-[13px]"
          style={{ borderTop: '.5px solid var(--color-sep)' }}
        >
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button variant="primary" size="sm" onClick={generate} disabled={loading}>
            {loading ? '…' : 'Générer'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Composant principal ───────────────────────────────────────────────────────

interface Props {
  activeTirage: TirageData | null
  allSessions:  Array<{ id: string; name: string }>
}

export function TiragesClient({ activeTirage, allSessions }: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(allSessions[0]?.id ?? '')
  const [tirages,  setTirages]  = useState<PlannedTirage[]>([])
  const [lots,     setLots]     = useState<SessionLot[]>([])
  const [loading,  setLoading]  = useState(false)
  const [fetchErr, setFetchErr] = useState('')

  const [showEdit,    setShowEdit]    = useState(false)
  const [editTarget,  setEditTarget]  = useState<PlannedTirage | null>(null)
  const [showGenerate, setShowGenerate] = useState(false)

  // ── Chargement du plan ──────────────────────────────────────────────────────

  const fetchPlan = useCallback(async (sessionId: string) => {
    if (!sessionId) return
    setLoading(true)
    setFetchErr('')
    try {
      const [planRes, lotsRes] = await Promise.all([
        fetch(`/api/sessions/${sessionId}/tirages`),
        fetch(`/api/sessions/${sessionId}/lots`),
      ])
      if (!planRes.ok) {
        const data = await planRes.json()
        setFetchErr(data.error ?? `Erreur ${planRes.status}`)
        setTirages([])
        setLots([])
        return
      }
      const planData = await planRes.json()
      const lotsData = lotsRes.ok ? await lotsRes.json() : { lots: [] }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sorted = (planData.tirages ?? []).sort((a: any, b: any) => a.order - b.order)
      setTirages(sorted)
      setLots(lotsData.lots ?? [])
    } catch (e) {
      setFetchErr('Erreur réseau')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlan(selectedSessionId)
  }, [selectedSessionId, fetchPlan])

  // ── DnD ────────────────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = tirages.findIndex(t => t.id === active.id)
    const newIdx = tirages.findIndex(t => t.id === over.id)
    const reordered = arrayMove(tirages, oldIdx, newIdx)
    setTirages(reordered) // optimiste
    await fetch(`/api/sessions/${selectedSessionId}/tirages/reorder`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ids: reordered.map(t => t.id) }),
    })
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function handleAddPause() {
    const res = await fetch(`/api/sessions/${selectedSessionId}/tirages`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: 'pause', lot_ids: [] }),
    })
    if (res.ok) fetchPlan(selectedSessionId)
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/sessions/${selectedSessionId}/tirages/${id}`, { method: 'DELETE' })
    if (res.ok) setTirages(prev => prev.filter(t => t.id !== id))
  }

  // ── Lots utilisés par d'autres tirages ────────────────────────────────────

  const usedLotIds = new Set(
    tirages
      .filter(t => t.id !== editTarget?.id)
      .flatMap(t => t.lots.map(l => l.id))
  )

  // ── Rendu ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-[16px]">

      {/* ── Barre d'outils ── */}
      <div className="flex items-center justify-between gap-[10px] flex-wrap">
        <div className="flex items-center gap-[10px] flex-wrap">
          <select
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(e.target.value)}
            className="rounded-[7px] font-bold cursor-pointer"
            style={{
              padding:    '7px 10px',
              border:     '.5px solid var(--color-border)',
              background: 'var(--color-bg)',
              color:      'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize:   12,
              outline:    'none',
            }}
          >
            {allSessions.length === 0
              ? <option value="">Aucune session</option>
              : allSessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
            }
          </select>
          {selectedSessionId && !loading && (
            <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
              {tirages.length} tirage{tirages.length !== 1 ? 's' : ''} planifié{tirages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-[8px] flex-wrap">
          {activeTirage && (
            <Link href="/tirage">
              <Button variant="secondary" size="sm">● Tirage en cours →</Button>
            </Link>
          )}
          {selectedSessionId && (
            <>
              <Button variant="secondary" size="sm" onClick={handleAddPause}>+ Pause</Button>
              <Button variant="secondary" size="sm" onClick={() => { setEditTarget(null); setShowEdit(true) }}>
                + Tirage
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowGenerate(true)}>
                ⚡ Auto-générer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Erreur de chargement ── */}
      {fetchErr && (
        <div className="rounded-[8px] px-[14px] py-[10px]"
          style={{ background: '#FCEBEB', border: '.5px solid #f5c6c6', fontSize: 13, color: '#501313' }}>
          {fetchErr}
          {fetchErr.toLowerCase().includes('expiré') && (
            <span> — <a href="/login" style={{ fontWeight: 700, textDecoration: 'underline' }}>Se reconnecter</a></span>
          )}
        </div>
      )}

      {/* ── Plan ── */}
      {!selectedSessionId ? (
        <div
          className="rounded-[10px] flex items-center justify-center"
          style={{ border: '.5px solid var(--color-sep)', background: 'var(--color-card)', minHeight: 200 }}
        >
          <p style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>
            Sélectionnez une session pour voir ou créer le plan.
          </p>
        </div>

      ) : loading ? (
        <div
          className="rounded-[10px] flex items-center justify-center"
          style={{ border: '.5px solid var(--color-sep)', background: 'var(--color-card)', minHeight: 200 }}
        >
          <p style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>Chargement…</p>
        </div>

      ) : tirages.length === 0 ? (
        <div
          className="rounded-[10px] flex flex-col items-center justify-center gap-[12px]"
          style={{ border: '.5px solid var(--color-sep)', background: 'var(--color-card)', minHeight: 200 }}
        >
          <p style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>
            Aucun tirage planifié pour cette session.
          </p>
          <div className="flex gap-[8px]">
            <Button variant="secondary" size="sm" onClick={() => { setEditTarget(null); setShowEdit(true) }}>
              + Ajouter un tirage
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowGenerate(true)}>
              ⚡ Auto-générer
            </Button>
          </div>
        </div>

      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tirages.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-[6px]">
              {tirages.map((tirage, i) => (
                <SortableCard
                  key={tirage.id}
                  tirage={tirage}
                  index={i}
                  onDelete={handleDelete}
                  onEdit={t => { setEditTarget(t); setShowEdit(true) }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* ── Modals ── */}
      {showEdit && (
        <EditTirageModal
          sessionId={selectedSessionId}
          tirage={editTarget}
          sessionLots={lots}
          usedLotIds={usedLotIds}
          onClose={() => { setShowEdit(false); setEditTarget(null) }}
          onSaved={() => { setShowEdit(false); setEditTarget(null); fetchPlan(selectedSessionId) }}
        />
      )}
      {showGenerate && (
        <GenerateModal
          sessionId={selectedSessionId}
          onClose={() => setShowGenerate(false)}
          onGenerated={() => { setShowGenerate(false); fetchPlan(selectedSessionId) }}
        />
      )}
    </div>
  )
}
