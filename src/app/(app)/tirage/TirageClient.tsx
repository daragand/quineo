'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { HeroBall }      from '@/components/tirage/HeroBall'
import { Grid90 }        from '@/components/tirage/Grid90'
import { HistoryBalls }  from '@/components/tirage/HistoryBalls'
import { LotPanel }      from '@/components/tirage/LotPanel'
import { WinnerOverlay } from '@/components/tirage/WinnerOverlay'
import { useTirage }     from '@/hooks/useTirage'
import type {
  TirageData,
  AvailableSession,
  TirageSequenceItem,
  TirageType,
} from '@/lib/services/tirage'

export type { TirageData, AvailableSession }

// ─────────────────────────────────────────
// Config par type de tirage
// ─────────────────────────────────────────

const TYPE_CONFIG: Record<TirageType, {
  label: string; short: string
  bg: string; color: string; border: string
  sideBg: string; sideColor: string
}> = {
  quine:        { label: 'QUINE',        short: 'Q',  bg: '#1a2e4a', color: '#85B7EB', border: '#378ADD', sideBg: 'rgba(246,185,82,.12)',  sideColor: '#F6B952' },
  double_quine: { label: 'DOUBLE QUINE', short: 'DQ', bg: '#2d1b6e', color: '#b8a6f5', border: '#7C3AED', sideBg: 'rgba(156,107,245,.15)', sideColor: '#9C6BF5' },
  carton_plein: { label: 'CARTON PLEIN', short: 'CP', bg: '#0b2211', color: '#7BC77A', border: '#3a9e49', sideBg: 'rgba(133,235,158,.12)', sideColor: '#7BC77A' },
  pause:        { label: 'PAUSE',        short: '⏸',  bg: '#1e2733', color: '#8a95a3', border: '#4a5568', sideBg: 'rgba(138,149,163,.1)',  sideColor: '#8a95a3' },
}

// ─────────────────────────────────────────
// ThemeToggle
// ─────────────────────────────────────────

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={dark} aria-label="Basculer jour / nuit"
      onClick={onToggle}
      className="flex items-center gap-[6px] rounded-[20px] px-[10px] py-[3px] pl-[6px] cursor-pointer transition-colors duration-[200ms]"
      style={{ background: 'var(--tirage-bg3)', border: '1px solid var(--color-border)' }}>
      <div className="relative" style={{ width: 28, height: 15, borderRadius: 20, background: 'var(--tirage-bg4)', border: '1px solid var(--color-border)' }} aria-hidden="true">
        <div className="absolute top-[1px] left-[1px] rounded-full transition-transform duration-[250ms]"
          style={{ width: 11, height: 11, background: 'var(--color-amber)', transform: dark ? 'translateX(0)' : 'translateX(13px)' }} />
      </div>
      <span className="font-bold uppercase tracking-[.1em]" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
        {dark ? 'Nuit' : 'Jour'}
      </span>
    </button>
  )
}

// ─────────────────────────────────────────
// Sidebar séquence
// ─────────────────────────────────────────

function SequenceSidebar({
  items,
  currentId,
}: {
  items: TirageSequenceItem[]
  currentId: string
}) {
  const currentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [currentId])

  return (
    <div
      className="flex flex-col flex-shrink-0 overflow-y-auto"
      style={{
        width: 186,
        background: 'var(--tirage-bg2)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      <div
        className="font-bold uppercase tracking-[.1em] px-[12px] py-[8px] flex-shrink-0"
        style={{ fontSize: 9, color: 'var(--color-text-hint)', borderBottom: '1px solid var(--color-border)' }}
      >
        Séquence · {items.length} tirages
      </div>

      {items.map((item) => {
        const cfg = TYPE_CONFIG[item.type]
        const isCurrent   = item.id === currentId
        const isCompleted = item.status === 'completed'
        const isCancelled = item.status === 'cancelled'
        const primaryLot  = item.lots[0]

        return (
          <div
            key={item.id}
            ref={isCurrent ? currentRef : undefined}
            className="flex items-start gap-[6px] px-[10px] py-[8px] transition-colors duration-[150ms]"
            style={{
              borderBottom: '1px solid var(--color-border)',
              background: isCurrent
                ? cfg.sideBg
                : 'transparent',
              opacity: isCancelled ? 0.4 : 1,
            }}
          >
            {/* Indicateur statut */}
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full"
              style={{
                width: 18, height: 18, marginTop: 1,
                background: isCompleted ? 'var(--color-qgreen-bg)' : isCurrent ? cfg.sideBg : 'var(--tirage-bg4)',
                border: `1px solid ${isCurrent ? cfg.sideColor : isCompleted ? 'var(--color-qgreen)' : 'var(--color-border)'}`,
                fontSize: 9,
                color: isCurrent ? cfg.sideColor : isCompleted ? 'var(--color-qgreen)' : 'var(--color-text-hint)',
                fontWeight: 700,
              }}
            >
              {isCompleted ? '✓' : isCancelled ? '×' : isCurrent ? '▶' : String(item.order + 1).padStart(2, '0')}
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              {/* Type badge */}
              <div
                className="font-bold uppercase tracking-[.08em] inline-block rounded-[3px] px-[5px] py-[1px] mb-[3px]"
                style={{
                  fontSize: 8,
                  background: isCurrent ? cfg.bg : 'var(--tirage-bg4)',
                  color: isCurrent ? cfg.color : 'var(--color-text-hint)',
                  border: `1px solid ${isCurrent ? cfg.border : 'var(--color-border)'}`,
                }}
              >
                {item.type === 'pause' ? '⏸ Pause' : cfg.label}
              </div>

              {/* Lot principal */}
              {primaryLot ? (
                <div>
                  <div
                    className="font-bold truncate leading-[1.2]"
                    style={{
                      fontSize: 11,
                      color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {primaryLot.name}
                  </div>
                  {primaryLot.value != null && (
                    <div className="font-display" style={{ fontSize: 13, color: 'var(--color-amber)' }}>
                      {primaryLot.value} €
                    </div>
                  )}
                </div>
              ) : item.type === 'pause' ? (
                <div style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Entracte</div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────
// Modal déclaration gagnant
// ─────────────────────────────────────────

function WinnerDialog({
  tirageId,
  sessionId,
  onConfirmed,
  onClose,
}: {
  tirageId:    string
  sessionId:   string
  onConfirmed: (winner: { participantName: string; cartonRef: string; sessionClosed: boolean }) => void
  onClose:     () => void
}) {
  const [serial,  setSerial]  = useState('')
  const [found,   setFound]   = useState<{ id: string; serial_number: string; participant?: { first_name?: string; last_name?: string } } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function search() {
    if (!serial.trim()) return
    setLoading(true); setError(''); setFound(null)
    const res = await fetch(`/api/sessions/${sessionId}/cartons?serial=${encodeURIComponent(serial.trim())}&status=sold&limit=1`)
    setLoading(false)
    if (!res.ok) { setError('Erreur lors de la recherche'); return }
    const data = await res.json()
    if (!data.cartons?.length) { setError('Aucun carton vendu trouvé avec ce numéro'); return }
    setFound(data.cartons[0])
  }

  async function confirm() {
    if (!found) return
    setLoading(true); setError('')
    const res = await fetch(`/api/tirages/${tirageId}/winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winning_carton_id: found.id }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la déclaration du gagnant')
      return
    }
    const data = await res.json()
    const p = found.participant
    const participantName = p ? [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Gagnant' : 'Gagnant'
    onConfirmed({ participantName, cartonRef: found.serial_number, sessionClosed: data.session_closed ?? false })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rounded-[14px] overflow-hidden w-full"
        style={{ maxWidth: 400, background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
        <div className="flex items-center justify-between px-[18px] py-[13px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}>
          <span className="font-bold" style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
            Déclarer un gagnant
          </span>
          <button type="button" onClick={onClose} aria-label="Fermer"
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>×</button>
        </div>
        <div className="px-[18px] py-[16px]">
          <label style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            Numéro de série du carton gagnant
          </label>
          <div className="flex gap-[8px] mt-[6px]">
            <input value={serial} onChange={(e) => setSerial(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="ex : C0042"
              className="flex-1 rounded-[6px]"
              style={{ padding: '8px 10px', border: '.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 13, background: 'var(--color-bg)', color: 'var(--color-text-primary)', outline: 'none' }} />
            <button type="button" onClick={search} disabled={loading || !serial.trim()}
              className="rounded-[8px] font-bold px-[14px] cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--color-qblue-bg)', color: 'var(--color-qblue-text)', border: '.5px solid var(--color-qblue)', fontFamily: 'var(--font-body)', fontSize: 12 }}>
              {loading ? '…' : 'Chercher'}
            </button>
          </div>

          {found && (
            <div className="rounded-[8px] px-[12px] py-[10px] mt-[10px]"
              style={{ background: 'var(--color-qgreen-bg)', border: '.5px solid var(--color-qgreen)' }}>
              <div className="font-bold" style={{ fontSize: 13, color: 'var(--color-qgreen-text)' }}>{found.serial_number}</div>
              {found.participant && (
                <div style={{ fontSize: 11, color: 'var(--color-qgreen-text)', marginTop: 2 }}>
                  {[found.participant.first_name, found.participant.last_name].filter(Boolean).join(' ')}
                </div>
              )}
            </div>
          )}

          {error && <p style={{ fontSize: 11, color: 'var(--color-qred)', marginTop: 8 }}>{error}</p>}

          <div className="flex gap-[8px] mt-[14px]">
            <button type="button" onClick={confirm} disabled={!found || loading}
              className="flex-1 rounded-[8px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ padding: '9px 0', background: 'var(--color-amber)', color: '#2C1500', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13 }}>
              {loading ? 'Confirmation…' : 'Confirmer le gagnant'}
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
// Filtre séquence (SessionPlanView)
// ─────────────────────────────────────────

type FilterType = 'all' | TirageType

const FILTERS: Array<{ id: FilterType; label: string }> = [
  { id: 'all',          label: 'Tous' },
  { id: 'quine',        label: 'Quine' },
  { id: 'double_quine', label: 'Double Quine' },
  { id: 'carton_plein', label: 'Carton Plein' },
  { id: 'pause',        label: 'Pauses' },
]

// ─────────────────────────────────────────
// Vue préparation : séquence de tirages
// ─────────────────────────────────────────

function SessionPlanView({ sessions }: { sessions: AvailableSession[] }) {
  const router = useRouter()
  const [selectedSession, setSelectedSession] = useState<AvailableSession | null>(sessions[0] ?? null)
  const [filter,  setFilter]  = useState<FilterType>('all')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center" style={{ padding: '40px 20px' }}>
          <div className="font-bold mb-[8px]" style={{ fontSize: 18, color: 'var(--color-text-primary)' }}>
            Aucune session active
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Ouvrez une session et planifiez des tirages pour démarrer.
          </p>
        </div>
      </div>
    )
  }

  const tirages = selectedSession?.tirages ?? []
  const filtered = filter === 'all' ? tirages : tirages.filter(t => t.type === filter)

  // Premier tirage réel non démarré (les pauses ne bloquent pas le lancement)
  const firstPending = tirages.find(t => (t.status === 'draft' || t.status === 'ready') && t.type !== 'pause')
  const hasRunning   = tirages.some(t => t.status === 'running')

  async function handleLaunch() {
    if (!selectedSession || !firstPending) return
    setLoading(true); setError('')
    const res = await fetch(
      `/api/sessions/${selectedSession.id}/tirages/${firstPending.id}/start`,
      { method: 'POST' },
    )
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Erreur lors du démarrage')
      return
    }
    router.refresh()
  }

  const completedCount  = tirages.filter(t => t.status === 'completed').length
  const cancelledCount  = tirages.filter(t => t.status === 'cancelled').length
  const pendingCount    = tirages.filter(t => t.status === 'draft' || t.status === 'ready').length

  return (
    <div style={{ maxWidth: 560, margin: '32px auto', padding: '0 20px' }}>

      {/* En-tête */}
      <div className="mb-[24px]">
        <h2 className="font-display mb-[4px]" style={{ fontSize: 26, color: 'var(--color-text-primary)' }}>
          Tirages
        </h2>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          Séquence planifiée — sélectionnez une session pour démarrer.
        </p>
      </div>

      {/* Sélecteur de session */}
      {sessions.length > 1 && (
        <div className="mb-[20px]">
          <div className="font-bold uppercase tracking-[.1em] mb-[8px]"
            style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Session</div>
          <div className="flex flex-col gap-[5px]">
            {sessions.map(s => {
              const isSelected = selectedSession?.id === s.id
              const isRunning  = s.status === 'running'
              return (
                <button key={s.id} type="button" onClick={() => { setSelectedSession(s); setFilter('all') }}
                  className="rounded-[8px] px-[14px] py-[10px] text-left cursor-pointer transition-colors duration-[150ms]"
                  style={{
                    background: isSelected ? 'var(--color-qblue-bg)' : 'var(--color-card)',
                    border: `.5px solid ${isSelected ? 'var(--color-qblue)' : 'var(--color-sep)'}`,
                    fontFamily: 'var(--font-body)',
                  }}>
                  <div className="flex items-center gap-[8px]">
                    {isRunning && (
                      <span aria-hidden="true" className="inline-block rounded-full flex-shrink-0"
                        style={{ width: 6, height: 6, background: '#48BB78' }} />
                    )}
                    <span className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{s.name}</span>
                    {s.date && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                        {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      {tirages.length > 0 && (
        <div className="flex items-center gap-[12px] mb-[14px]">
          <span className="font-bold" style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>
            {tirages.length} tirage{tirages.length > 1 ? 's' : ''}
          </span>
          {completedCount > 0 && (
            <span style={{ fontSize: 11, color: 'var(--color-qgreen-text)' }}>
              {completedCount} terminé{completedCount > 1 ? 's' : ''}
            </span>
          )}
          {cancelledCount > 0 && (
            <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
              {cancelledCount} annulé{cancelledCount > 1 ? 's' : ''}
            </span>
          )}
          {pendingCount > 0 && (
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {pendingCount} restant{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Filtres */}
      {tirages.length > 0 && (
        <div className="flex flex-wrap gap-[5px] mb-[14px]">
          {FILTERS.map(f => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)}
              className="rounded-[20px] px-[12px] py-[4px] cursor-pointer font-bold transition-all duration-[150ms]"
              style={{
                fontSize: 11,
                background: filter === f.id ? 'var(--color-qblue-bg)' : 'transparent',
                color:      filter === f.id ? 'var(--color-qblue-text)' : 'var(--color-text-secondary)',
                border:     `.5px solid ${filter === f.id ? 'var(--color-qblue)' : 'var(--color-border)'}`,
                fontFamily: 'var(--font-body)',
              }}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Liste des tirages */}
      {filtered.length === 0 ? (
        <div className="rounded-[10px] py-[24px] text-center"
          style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>
            {tirages.length === 0
              ? 'Aucun tirage planifié pour cette session.'
              : 'Aucun tirage pour ce filtre.'}
          </p>
        </div>
      ) : (
        <div className="rounded-[10px] overflow-hidden mb-[20px]"
          style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
          {filtered.map((item, i) => {
            const cfg          = TYPE_CONFIG[item.type]
            const isCompleted  = item.status === 'completed'
            const isCancelled  = item.status === 'cancelled'
            const isRunning    = item.status === 'running'
            const primaryLot   = item.lots[0]

            return (
              <div key={item.id}
                className="flex items-center gap-[12px] px-[14px] py-[11px] transition-colors duration-[100ms]"
                style={{
                  borderBottom: i < filtered.length - 1 ? '.5px solid var(--color-sep)' : undefined,
                  opacity: isCancelled ? 0.45 : 1,
                  background: isRunning ? cfg.sideBg : 'transparent',
                }}>

                {/* Numéro d'ordre */}
                <div className="flex-shrink-0 font-display text-right"
                  style={{ fontSize: 14, color: 'var(--color-text-hint)', minWidth: 22 }}>
                  {String(item.order + 1).padStart(2, '0')}
                </div>

                {/* Badge type */}
                <div className="font-bold uppercase tracking-[.1em] rounded-[4px] px-[8px] py-[3px] flex-shrink-0 text-center"
                  style={{
                    fontSize: 10, minWidth: 76,
                    background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}`,
                  }}>
                  {item.type === 'pause' ? '⏸ Pause' : cfg.label}
                </div>

                {/* Lot(s) */}
                <div className="flex-1 min-w-0">
                  {primaryLot ? (
                    <>
                      <div className="font-bold truncate" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                        {primaryLot.name}
                      </div>
                      {item.lots.length > 1 && (
                        <div style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>
                          +{item.lots.length - 1} lot{item.lots.length > 2 ? 's' : ''} supplémentaire{item.lots.length > 2 ? 's' : ''}
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>
                      {item.type === 'pause' ? 'Entracte' : '—'}
                    </span>
                  )}
                </div>

                {/* Valeur */}
                {primaryLot?.value != null && (
                  <span className="font-display flex-shrink-0" style={{ fontSize: 17, color: 'var(--color-amber)' }}>
                    {primaryLot.value} €
                  </span>
                )}

                {/* Statut */}
                <div className="flex-shrink-0" style={{ minWidth: 24, textAlign: 'center' }}>
                  {isCompleted && <span style={{ fontSize: 14, color: 'var(--color-qgreen)' }}>✓</span>}
                  {isCancelled && <span style={{ fontSize: 14, color: 'var(--color-text-hint)' }}>×</span>}
                  {isRunning   && (
                    <span aria-hidden="true" className="inline-block rounded-full"
                      style={{ width: 7, height: 7, background: '#48BB78', display: 'inline-block' }} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bouton lancer */}
      {selectedSession && !hasRunning && firstPending && (
        <div>
          {error && (
            <p className="mb-[10px] rounded-[7px] px-[12px] py-[8px]"
              style={{ fontSize: 12, color: 'var(--color-qred)', background: '#FEF2F2', border: '.5px solid var(--color-qred)' }}>
              {error}
            </p>
          )}
          <button type="button" onClick={handleLaunch} disabled={loading}
            className="w-full font-bold rounded-[10px] py-[11px] cursor-pointer transition-opacity duration-[150ms] hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--color-amber)', color: '#2C1500', border: 'none', fontFamily: 'var(--font-body)', fontSize: 14 }}>
            {loading ? 'Démarrage…' : 'Lancer le jeu →'}
          </button>
        </div>
      )}

      {hasRunning && (
        <div className="rounded-[8px] px-[14px] py-[10px]"
          style={{ background: 'var(--color-qgreen-bg)', border: '.5px solid var(--color-qgreen)', fontSize: 13, color: 'var(--color-qgreen-text)' }}>
          Un tirage est en cours sur cette session. Rechargez la page pour le reprendre.
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Vue pause
// ─────────────────────────────────────────

function PauseView({ tirage }: { tirage: TirageData }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Prochain tirage réel (non-pause) dans la séquence
  const currentOrder = tirage.sequence.find(s => s.id === tirage.id)?.order ?? -1
  const nextInSeq = tirage.sequence
    .filter(s => s.order > currentOrder && (s.status === 'draft' || s.status === 'ready') && s.type !== 'pause')
    .sort((a, b) => a.order - b.order)[0]

  async function handleResume() {
    setLoading(true); setError('')

    // Terminer la pause en cours
    const skipRes = await fetch(`/api/tirages/${tirage.id}/skip`, { method: 'POST' })
    if (!skipRes.ok) {
      setLoading(false)
      const d = await skipRes.json().catch(() => ({}))
      setError(d.error ?? 'Erreur lors de la reprise')
      return
    }

    // Démarrer le prochain tirage réel
    if (nextInSeq?.id) {
      const startRes = await fetch(
        `/api/sessions/${tirage.session_id}/tirages/${nextInSeq.id}/start`,
        { method: 'POST' },
      )
      if (!startRes.ok) {
        setLoading(false)
        const d = await startRes.json().catch(() => ({}))
        setError(d.error ?? 'Erreur lors du démarrage')
        return
      }
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <div
      className="flex flex-1 min-h-0"
      style={{ margin: '-16px -20px', background: 'var(--color-bg)' }}
    >
      {/* Sidebar */}
      <SequenceSidebar items={tirage.sequence} currentId={tirage.id} />

      {/* Contenu pause */}
      <div className="flex-1 flex flex-col items-center justify-center gap-[20px] px-[40px]">
        <div
          className="font-bold uppercase tracking-[.25em]"
          style={{ fontSize: 10, color: 'var(--color-text-hint)' }}
        >
          {tirage.session.name}
        </div>

        <div className="text-center">
          <div
            className="font-display leading-none mb-[8px]"
            style={{ fontSize: 56, color: 'var(--color-amber)' }}
          >
            ⏸
          </div>
          <div
            className="font-display leading-none mb-[4px]"
            style={{ fontSize: 40, color: 'var(--color-text-primary)' }}
          >
            Pause
          </div>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            La partie reprend dans quelques instants.
          </p>
        </div>

        {nextInSeq && (
          <div
            className="rounded-[10px] px-[20px] py-[14px] text-center"
            style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)', maxWidth: 300, width: '100%' }}
          >
            <div style={{ fontSize: 10, color: 'var(--color-text-hint)', marginBottom: 4 }}>
              PROCHAIN TIRAGE
            </div>
            <div
              className="font-bold uppercase tracking-[.1em] rounded-[4px] px-[10px] py-[2px] inline-block mb-[6px]"
              style={{
                fontSize: 11,
                background: TYPE_CONFIG[nextInSeq.type].bg,
                color: TYPE_CONFIG[nextInSeq.type].color,
                border: `1.5px solid ${TYPE_CONFIG[nextInSeq.type].border}`,
              }}
            >
              {TYPE_CONFIG[nextInSeq.type].label}
            </div>
            {nextInSeq.lots[0] && (
              <>
                <div className="font-bold" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
                  {nextInSeq.lots[0].name}
                </div>
                {nextInSeq.lots[0].value != null && (
                  <div className="font-display" style={{ fontSize: 22, color: 'var(--color-amber)' }}>
                    {nextInSeq.lots[0].value} €
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {error && (
          <p style={{ fontSize: 12, color: 'var(--color-qred)' }}>{error}</p>
        )}

        <button type="button" onClick={handleResume} disabled={loading || !nextInSeq}
          className="font-bold rounded-[10px] px-[32px] py-[12px] cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--color-amber)', color: '#2C1500', border: 'none', fontFamily: 'var(--font-body)', fontSize: 15 }}>
          {loading ? 'Démarrage…' : nextInSeq ? 'Reprendre le jeu →' : 'Fin des tirages'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Vue tirage en cours
// ─────────────────────────────────────────

function LiveTirage({ tirage, associationName }: { tirage: TirageData; associationName: string }) {
  const router = useRouter()
  const initDrawn = tirage.draw_events
    .sort((a, b) => a.sequence - b.sequence)
    .map(e => e.number)

  const { drawn, current, animKey, winner: socketWinner, connected, clearWinner } =
    useTirage(tirage.id, initDrawn)

  const [dark,          setDark]          = useState(true)
  const [msg,           setMsg]           = useState('')
  const [drawLoading,   setDrawLoading]   = useState(false)
  const [showWinnerDlg, setShowWinnerDlg] = useState(false)
  const [skipConfirm,   setSkipConfirm]   = useState(false)
  const [skipLoading,   setSkipLoading]   = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const [winnerOverlay, setWinnerOverlay] = useState<{
    participantName: string; cartonRef: string; sessionClosed: boolean
  } | null>(null)

  const lot     = tirage.lot
  const typeCfg = TYPE_CONFIG[tirage.type] ?? TYPE_CONFIG.quine

  // Prochain tirage dans la séquence (pour auto-avance)
  const currentOrder = tirage.sequence.find(s => s.id === tirage.id)?.order ?? -1
  const nextInSeq = tirage.sequence
    .filter(s => s.order > currentOrder && (s.status === 'draft' || s.status === 'ready'))
    .sort((a, b) => a.order - b.order)[0]

  // Réception winner via socket
  useEffect(() => {
    if (!socketWinner) return
    setWinnerOverlay({ ...socketWinner, sessionClosed: false })
    clearWinner()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketWinner])

  const drawNumber = useCallback(async () => {
    if (drawn.length >= 90) { setMsg('Tous les 90 numéros ont été tirés.'); return }
    setDrawLoading(true); setMsg('')
    const res = await fetch(`/api/tirages/${tirage.id}/draw`, { method: 'POST' })
    setDrawLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setMsg(data.error ?? 'Erreur lors du tirage')
    }
  }, [drawn.length, tirage.id])

  async function handleWinnerDismiss() {
    const isClosed = winnerOverlay?.sessionClosed ?? false
    setWinnerOverlay(null)

    if (!isClosed && nextInSeq) {
      setTransitioning(true)
      await fetch(`/api/sessions/${tirage.session_id}/tirages/${nextInSeq.id}/start`, { method: 'POST' })
      setTransitioning(false)
    }
    router.refresh()
  }

  async function handleSkip() {
    if (!skipConfirm) { setSkipConfirm(true); return }
    setSkipConfirm(false)
    setSkipLoading(true)
    const res = await fetch(`/api/tirages/${tirage.id}/skip`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      if (data.next_tirage?.id) {
        await fetch(
          `/api/sessions/${tirage.session_id}/tirages/${data.next_tirage.id}/start`,
          { method: 'POST' },
        )
      }
    }
    setSkipLoading(false)
    router.refresh()
  }

  const lotName     = lot?.name      ?? 'Lot en cours'
  const lotValue    = lot?.value     ?? null
  const lotOrder    = lot?.order     ?? 0
  const lotImageUrl = lot?.image_url ?? undefined

  return (
    <div
      data-theme={dark ? 'dark' : 'light'}
      className="flex flex-1 min-h-0 transition-colors duration-[300ms]"
      style={{ margin: '-16px -20px', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
    >
      {/* Sidebar séquence */}
      <SequenceSidebar items={tirage.sequence} currentId={tirage.id} />

      {/* Zone principale */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">

        {/* Header */}
        <div className="flex items-center justify-between px-[16px] py-[8px] flex-shrink-0 transition-colors duration-[300ms]"
          style={{ background: 'var(--tirage-bg2)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-[10px]">
            <div aria-hidden="true" className="rounded-[5px] flex items-center justify-center font-display"
              style={{ width: 28, height: 28, background: 'var(--color-amber)', fontSize: 17, color: '#412402' }}>Q</div>
            <span className="font-bold uppercase tracking-[.06em] transition-colors duration-[300ms]"
              style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{tirage.session.name}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>—</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{associationName}</span>
          </div>
          <div className="flex items-center gap-[10px]">
            {/* Badge type dynamique */}
            <div className="font-bold tracking-[.14em] rounded-[4px] px-[12px] py-[2px]"
              style={{ fontSize: 11, background: typeCfg.bg, color: typeCfg.color, border: `1.5px solid ${typeCfg.border}` }}>
              {typeCfg.label}
            </div>
            <div title={connected ? 'Temps réel actif' : 'Connexion en cours…'}
              style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? 'var(--color-qgreen)' : 'var(--color-amber)', flexShrink: 0 }} />
            <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
          </div>
          <div className="flex items-baseline gap-[3px]">
            <span className="font-display" style={{ fontSize: 24, color: 'var(--color-amber)' }}>{drawn.length}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>&nbsp;/ 90 numéros</span>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex flex-1 min-h-0 px-[16px] py-[10px] gap-[14px] overflow-hidden">
          {lot && (
            <LotPanel
              name={lotName}
              value={lotValue ?? undefined}
              order={lotOrder}
              total={tirage.sequence.filter(s => s.type !== 'pause').length}
              tirageType={tirage.type === 'pause' ? 'quine' : tirage.type}
              imageUrl={lotImageUrl}
            />
          )}
          <HeroBall number={current} rank={drawn.length} animate={animKey > 0} key={animKey} />
          <HistoryBalls drawn={drawn} />
        </div>

        {/* Grille 90 */}
        <div className="px-[16px] py-[5px] pb-[8px] flex-shrink-0 transition-colors duration-[300ms]"
          style={{ borderTop: '1px solid var(--color-border)' }}>
          <Grid90 drawn={drawn} current={current} />
        </div>

        {/* Partenaires */}
        {tirage.partners.length > 0 && (
          <div className="flex items-center justify-center gap-[18px] px-[16px] py-[5px] flex-shrink-0 transition-colors duration-[300ms]"
            style={{ background: 'var(--tirage-bg4)', borderTop: '1px solid var(--color-border)' }}>
            <span className="uppercase tracking-[.09em] whitespace-nowrap"
              style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>Partenaires</span>
            <div style={{ width: 1, height: 14, background: 'var(--color-sep)' }} aria-hidden="true" />
            {tirage.partners.map(p => (
              <span key={p.id} className="font-bold"
                style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{p.name}</span>
            ))}
          </div>
        )}

        {/* Contrôles */}
        <div className="flex items-center justify-between gap-[10px] flex-wrap px-[16px] py-[10px] flex-shrink-0 transition-colors duration-[300ms]"
          style={{ background: 'var(--tirage-bg2)', borderTop: '1px solid var(--color-border)' }}>

          {/* Passer ce tirage */}
          <div className="flex items-center gap-[6px]">
            {skipConfirm ? (
              <>
                <button type="button" onClick={handleSkip} disabled={skipLoading}
                  className="rounded-[7px] font-bold px-[12px] py-[7px] cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--color-qred)', color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontSize: 11 }}>
                  {skipLoading ? '…' : 'Confirmer le passage'}
                </button>
                <button type="button" onClick={() => setSkipConfirm(false)}
                  className="rounded-[7px] px-[10px] py-[7px] cursor-pointer"
                  style={{ background: 'transparent', border: '.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  Annuler
                </button>
              </>
            ) : (
              <button type="button" onClick={handleSkip}
                className="rounded-[7px] px-[12px] py-[7px] cursor-pointer transition-colors duration-[150ms]"
                style={{ background: 'transparent', border: '.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                Passer ce tirage →
              </button>
            )}
          </div>

          {/* Actions principales */}
          <div className="flex items-center gap-[8px]">
            {msg && <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{msg}</span>}
            {transitioning && (
              <span style={{ fontSize: 11, color: 'var(--color-amber)' }}>Tirage suivant…</span>
            )}

            <button type="button" onClick={() => setShowWinnerDlg(true)}
              className="rounded-[8px] px-[16px] py-[9px] cursor-pointer font-bold transition-colors duration-[150ms]"
              style={{ background: 'transparent', color: 'var(--color-qgreen-text)', border: '.5px solid var(--color-qgreen)', fontFamily: 'var(--font-body)', fontSize: 12 }}>
              Déclarer un gagnant
            </button>

            <button type="button" onClick={drawNumber} disabled={drawLoading || drawn.length >= 90}
              className="font-bold rounded-[8px] px-[22px] py-[9px] cursor-pointer transition-opacity duration-[150ms] hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-amber)', color: '#2C1500', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13 }}>
              {drawLoading ? 'Tirage…' : 'Tirer un numéro'}
            </button>
          </div>
        </div>

      </div>

      {/* Overlay gagnant */}
      {winnerOverlay && (
        <WinnerOverlay
          winnerName={winnerOverlay.participantName}
          cartonRef={winnerOverlay.cartonRef}
          lineInfo="ligne complétée"
          tirageType={tirage.type === 'pause' ? 'quine' : tirage.type}
          lotName={lotName}
          lotValue={lotValue ?? 0}
          onConfirm={handleWinnerDismiss}
        />
      )}

      {/* Dialog déclaration gagnant */}
      {showWinnerDlg && (
        <WinnerDialog
          tirageId={tirage.id}
          sessionId={tirage.session_id}
          onConfirmed={(w) => {
            setShowWinnerDlg(false)
            setWinnerOverlay(w)
          }}
          onClose={() => setShowWinnerDlg(false)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────

export default function TirageClient({
  tirage,
  availableSessions,
  associationName,
}: {
  tirage:            TirageData | null
  availableSessions: AvailableSession[]
  associationName:   string
}) {
  if (!tirage) return <SessionPlanView sessions={availableSessions} />
  if (tirage.type === 'pause') return <PauseView tirage={tirage} />
  return <LiveTirage tirage={tirage} associationName={associationName} />
}
