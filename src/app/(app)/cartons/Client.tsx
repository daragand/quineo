'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Badge }  from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input }  from '@/components/ui/Input'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type CartonStatus = 'available' | 'sold' | 'cancelled'

export interface CartonRow {
  id:          string
  serial:      string
  sessionName: string
  participant: string | null
  status:      CartonStatus
  grid?:       number[][]
}

interface SessionOption {
  id:          string
  name:        string
  status:      string
  max_cartons: number | null
}

interface CartonsClientProps {
  initialCartons:     CartonRow[]
  initialTotal:       number
  initialCounts:      { available: number; sold: number; cancelled: number }
  sessionId:          string | null
  sessionName:        string
  sessionStatus:      string | null
  sessionMaxCartons:  number | null
  sessions:           SessionOption[]
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const STATUS_LABELS: Record<CartonStatus, string> = {
  available: 'Disponible',
  sold:      'Vendu',
  cancelled: 'Annulé',
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#185FA5', '#3B6D11', '#534AB7', '#854F0B', '#A32D2D']
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

const PAGE_SIZE = 50

const COL_RANGES = ['1–9','10–19','20–29','30–39','40–49','50–59','60–69','70–79','80–90']

// ─────────────────────────────────────────
// Modal vue carton
// ─────────────────────────────────────────

function CartonGridModal({ carton, onClose }: { carton: CartonRow; onClose: () => void }) {
  const grid = carton.grid ?? [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]]

  return (
    <div
      role="dialog" aria-modal="true" aria-label={`Carton ${carton.serial}`}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-[14px] overflow-hidden w-full"
        style={{ maxWidth: 560, background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[14px]"
          style={{ borderBottom: '.5px solid var(--color-sep)', background: 'var(--color-navy)' }}>
          <div className="flex items-center gap-[12px]">
            <span
              className="font-bold rounded-[5px] px-[10px] py-[3px]"
              style={{ fontSize: 14, background: 'var(--color-amber)', color: 'var(--color-amber-dark)', fontFamily: 'monospace' }}
            >
              {carton.serial}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{carton.sessionName}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer"
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'rgba(255,255,255,.6)', lineHeight: 1 }}>
            ×
          </button>
        </div>

        {/* Grille */}
        <div className="px-[20px] py-[16px]">
          {/* Headers colonnes */}
          <div className="grid mb-[2px]" style={{ gridTemplateColumns: 'repeat(9, 1fr)', gap: 3 }}>
            {COL_RANGES.map((h) => (
              <div key={h} style={{ textAlign: 'center', fontSize: 9, color: 'var(--color-text-hint)', fontWeight: 600 }}>{h}</div>
            ))}
          </div>

          {/* Lignes */}
          <div className="flex flex-col" style={{ gap: 3 }}>
            {grid.map((row, r) => (
              <div key={r} className="grid" style={{ gridTemplateColumns: 'repeat(9, 1fr)', gap: 3 }}>
                {row.map((cell, c) => (
                  <div
                    key={c}
                    className="flex items-center justify-center rounded-[5px] font-bold"
                    style={{
                      height:     38,
                      fontSize:   14,
                      background: cell > 0 ? 'white' : '#111827',
                      color:      cell > 0 ? '#111827' : 'transparent',
                      border:     'none',
                    }}
                  >
                    {cell > 0 ? cell : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Infos + actions */}
        <div className="flex items-center justify-between px-[20px] py-[14px]"
          style={{ borderTop: '.5px solid var(--color-sep)' }}>
          <div className="flex items-center gap-[12px]">
            <Badge variant={carton.status === 'sold' ? 'active' : carton.status === 'cancelled' ? 'cancelled' : 'draft'}>
              {STATUS_LABELS[carton.status]}
            </Badge>
            {carton.participant && (
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {carton.participant}
              </span>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Modal génération
// ─────────────────────────────────────────

function GenerateModal({
  sessionId,
  sessionName,
  currentTotal,
  maxCartons,
  onSuccess,
  onClose,
}: {
  sessionId:    string
  sessionName:  string
  currentTotal: number
  maxCartons:   number | null
  onSuccess:    (generated: number) => void
  onClose:      () => void
}) {
  const maxAllowed = maxCartons ? maxCartons - currentTotal : 5000
  const [count,   setCount]   = useState(Math.min(100, maxAllowed))
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)
  const [result,  setResult]  = useState(0)

  const countNum = Math.max(1, Math.min(count, Math.max(maxAllowed, 1)))
  const wouldExceed = maxCartons !== null && currentTotal + countNum > maxCartons

  async function generate() {
    if (countNum < 1 || wouldExceed) return
    setLoading(true)
    setError('')

    const res = await fetch(`/api/sessions/${sessionId}/cartons/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ count: countNum }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la génération')
      return
    }
    const data = await res.json()
    setResult(data.generated)
    setDone(true)
    onSuccess(data.generated)
  }

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Générer des cartons"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-[14px] overflow-hidden w-full"
        style={{ maxWidth: 440, background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[14px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}>
          <div>
            <div className="font-bold" style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
              Générer des cartons
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {sessionName}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer"
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1 }}>
            ×
          </button>
        </div>

        {/* Corps */}
        <div className="px-[20px] py-[18px]">
          {done ? (
            /* ── Succès ── */
            <div className="text-center py-[10px]">
              <div className="font-display leading-none mb-[8px]"
                style={{ fontSize: 48, color: 'var(--color-amber)' }}>
                {result}
              </div>
              <div className="font-bold mb-[4px]"
                style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
                Cartons générés avec succès
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
                Stock total : {currentTotal + result} carton{currentTotal + result > 1 ? 's' : ''}
                {maxCartons ? ` / ${maxCartons} max` : ''}
              </div>
              <Button variant="primary" size="sm" onClick={onClose}>
                Fermer
              </Button>
            </div>
          ) : (
            /* ── Formulaire ── */
            <>
              {/* Stock actuel */}
              <div className="rounded-[8px] px-[14px] py-[10px] mb-[18px]"
                style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)' }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    Cartons déjà générés
                  </span>
                  <span className="font-display" style={{ fontSize: 20, color: 'var(--color-text-primary)' }}>
                    {currentTotal}
                  </span>
                </div>
                {maxCartons && (
                  <div className="flex justify-between items-center mt-[4px]">
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Maximum autorisé
                    </span>
                    <span className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {maxCartons}
                    </span>
                  </div>
                )}
                {maxCartons && maxAllowed <= 0 && (
                  <div className="mt-[8px] rounded-[5px] px-[9px] py-[5px]"
                    style={{ background: 'var(--color-qred-bg)', fontSize: 11, color: 'var(--color-qred)' }}>
                    Quota atteint — impossible de générer davantage
                  </div>
                )}
              </div>

              {/* Saisie quantité */}
              <div className="mb-[14px]">
                <label
                  htmlFor="generate-count"
                  className="font-bold uppercase tracking-[.1em] block mb-[8px]"
                  style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>
                  Nombre de cartons à générer
                </label>
                <div className="flex items-center gap-[10px]">
                  <input
                    id="generate-count"
                    type="number"
                    min={1}
                    max={maxAllowed > 0 ? maxAllowed : 1}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
                    aria-describedby="generate-count-hint"
                    className="flex-1 rounded-[8px] text-center font-display"
                    style={{
                      padding: '10px 14px',
                      border: '.5px solid var(--color-border)',
                      fontSize: 28,
                      color: wouldExceed ? 'var(--color-qred)' : 'var(--color-text-primary)',
                      background: 'var(--color-bg)',
                      outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--color-qblue)' }}
                    onBlur={(e)  => { e.target.style.borderColor = 'var(--color-border)' }}
                  />
                  {/* Raccourcis rapides */}
                  <div className="flex flex-col gap-[4px]">
                    {[50, 100, 200, 500].filter(n => n <= Math.max(maxAllowed, 5000)).map(n => (
                      <button key={n} type="button" onClick={() => setCount(n)}
                        className="rounded-[5px] font-bold cursor-pointer transition-colors duration-[150ms]"
                        style={{
                          padding: '3px 9px',
                          fontSize: 11,
                          background: count === n ? 'var(--color-qblue-bg)' : 'var(--color-bg)',
                          color: count === n ? 'var(--color-qblue-text)' : 'var(--color-text-secondary)',
                          border: `.5px solid ${count === n ? 'var(--color-qblue)' : 'var(--color-sep)'}`,
                          fontFamily: 'var(--font-body)',
                        }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div id="generate-count-hint" style={{ fontSize: 11, color: 'var(--color-text-hint)', marginTop: 6 }}>
                  {wouldExceed
                    ? `⚠ Dépasse le maximum — ${maxAllowed} carton${maxAllowed > 1 ? 's' : ''} disponible${maxAllowed > 1 ? 's' : ''}`
                    : maxAllowed < 5000
                      ? `Maximum disponible : ${maxAllowed} carton${maxAllowed > 1 ? 's' : ''}`
                      : 'Maximum : 5 000 cartons par génération'}
                </div>
              </div>

              {/* Aperçu */}
              {!wouldExceed && countNum > 0 && (
                <div className="rounded-[8px] px-[14px] py-[10px] mb-[16px]"
                  style={{ background: 'var(--color-qblue-bg)', border: '.5px solid var(--color-qblue)' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-qblue-text)' }}>
                    Après génération : <strong>{currentTotal + countNum}</strong> carton{currentTotal + countNum > 1 ? 's' : ''}
                    {maxCartons ? ` / ${maxCartons} max (${Math.round(((currentTotal + countNum) / maxCartons) * 100)} %)` : ''}
                  </div>
                </div>
              )}

              {error && (
                <p style={{ fontSize: 12, color: 'var(--color-qred)', marginBottom: 12 }}>
                  {error}
                </p>
              )}

              <div className="flex gap-[8px]">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={generate}
                  disabled={loading || wouldExceed || maxAllowed <= 0 || countNum < 1}
                >
                  {loading ? 'Génération en cours…' : `Générer ${countNum} carton${countNum > 1 ? 's' : ''}`}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Annuler
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────

export function CartonsClient({
  initialCartons,
  initialTotal,
  initialCounts,
  sessionId,
  sessionName,
  sessionStatus,
  sessionMaxCartons,
  sessions,
}: CartonsClientProps) {
  const router = useRouter()

  // ── État ────────────────────────────────
  const [cartons,      setCartons]      = useState<CartonRow[]>(initialCartons)
  const [total,        setTotal]        = useState(initialTotal)
  const [counts,       setCounts]       = useState(initialCounts)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatus]       = useState<string>('all')
  const [page,         setPage]         = useState(1)
  const [pages,        setPages]        = useState(Math.ceil(initialTotal / PAGE_SIZE))
  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const [showGenerate, setShowGenerate] = useState(false)
  const [viewCarton,   setViewCarton]   = useState<CartonRow | null>(null)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState(sessionId)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch cartons via API ──────────────

  const fetchCartons = useCallback(async (
    sid: string,
    opts: { page?: number; status?: string; serial?: string } = {}
  ) => {
    setFetchLoading(true)
    const params = new URLSearchParams({
      page:  String(opts.page  ?? 1),
      limit: String(PAGE_SIZE),
    })
    if (opts.status && opts.status !== 'all') params.set('status', opts.status)
    if (opts.serial)  params.set('serial', opts.serial)

    const res = await fetch(`/api/sessions/${sid}/cartons?${params}`)
    setFetchLoading(false)
    if (!res.ok) return

    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: CartonRow[] = data.cartons.map((c: any) => {
      const p = c.participant
      return {
        id:          c.id,
        serial:      c.serial_number,
        sessionName: sessions.find(s => s.id === sid)?.name ?? '',
        participant: p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || null : null,
        status:      c.status as CartonStatus,
        grid:        c.grid,
      }
    })
    setCartons(rows)
    setTotal(data.total)
    setPages(data.pages)
    setPage(data.page)
    setSelected(new Set())
  }, [sessions])

  // ── Recherche avec debounce ────────────

  function handleSearch(q: string) {
    setSearch(q)
    if (!activeSessionId) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchCartons(activeSessionId, { page: 1, status: statusFilter, serial: q || undefined })
    }, 300)
  }

  function handleStatusChange(s: string) {
    setStatus(s)
    if (!activeSessionId) return
    fetchCartons(activeSessionId, { page: 1, status: s, serial: search || undefined })
  }

  function handlePageChange(p: number) {
    if (!activeSessionId) return
    fetchCartons(activeSessionId, { page: p, status: statusFilter, serial: search || undefined })
  }

  function handleSessionChange(sid: string) {
    setActiveSessionId(sid)
    setSearch('')
    setStatus('all')
    setPage(1)
    fetchCartons(sid, { page: 1 })
    const s = sessions.find(x => x.id === sid)
    if (s) setCounts({ available: 0, sold: 0, cancelled: 0 }) // reset pendant le fetch
  }

  // ── Sélection ────────────────────────

  function toggleSelect(id: string) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }
  function toggleAll() {
    setSelected(selected.size === cartons.length ? new Set() : new Set(cartons.map(c => c.id)))
  }

  // ── Après génération ─────────────────

  function handleGenerated(n: number) {
    setTotal(t => t + n)
    setCounts(c => ({ ...c, available: c.available + n }))
    if (activeSessionId) {
      fetchCartons(activeSessionId, { page: 1, status: statusFilter, serial: search || undefined })
    }
  }

  // ── Session active ────────────────────
  const activeSession = sessions.find(s => s.id === activeSessionId)
  const canGenerate   = activeSession && ['draft', 'open'].includes(activeSession.status)

  // ── Export / impression ───────────────
  function handleExportCsv(ids: string[]) {
    if (!activeSessionId) return
    const idsParam = ids.length > 0 ? `?ids=${ids.join(',')}` : ''
    window.location.href = `/api/sessions/${activeSessionId}/cartons/export${idsParam}`
  }

  function handlePrint(ids: string[]) {
    if (!activeSessionId) return
    const idsParam = ids.length > 0 ? `?ids=${ids.join(',')}` : ''
    window.open(`/api/sessions/${activeSessionId}/cartons/pdf${idsParam}`, '_blank')
  }

  // ─────────────────────────────────────
  // Rendu
  // ─────────────────────────────────────

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-[20px]">
        <div>
          <h1 className="font-display leading-none"
            style={{ fontSize: 28, color: 'var(--color-text-primary)' }}>
            Cartons
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            {activeSession?.name ?? sessionName}
          </p>
        </div>
        <div className="flex gap-[8px]">
          {selected.size > 0 && (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleExportCsv(Array.from(selected))}>
                Exporter sélection ({selected.size})
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handlePrint(Array.from(selected))}>
                🖨 Imprimer ({selected.size})
              </Button>
            </>
          )}
          {canGenerate ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowGenerate(true)}
            >
              + Générer des cartons
            </Button>
          ) : activeSessionId && (
            <span className="rounded-[6px] px-[10px] py-[6px] font-bold"
              style={{ fontSize: 11, background: 'var(--color-bg)', color: 'var(--color-text-hint)', border: '.5px solid var(--color-sep)' }}>
              Génération indisponible ({activeSession?.status ?? '—'})
            </span>
          )}
        </div>
      </div>

      {/* ── Sélecteur de session ── */}
      {sessions.length > 1 && (
        <div className="mb-[16px]" style={{ maxWidth: 320 }}>
          <Select
            value={activeSessionId ?? ''}
            onChange={(e) => handleSessionChange(e.target.value)}
            aria-label="Sélectionner une session"
            options={sessions.map(s => ({ value: s.id, label: s.name }))}
          />
        </div>
      )}

      {/* ── Métriques ── */}
      <div className="grid gap-[10px] mb-[20px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Total',        value: total,           color: 'var(--color-text-primary)', sub: 'cartons' },
          { label: 'Vendus',       value: counts.sold,     color: 'var(--color-amber)',        sub: total > 0 ? `${Math.round((counts.sold / total) * 100)} %` : '—' },
          { label: 'Disponibles',  value: counts.available, color: 'var(--color-qblue)',       sub: 'restants' },
          { label: 'Annulés',      value: counts.cancelled, color: 'var(--color-qred)',        sub: '' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="rounded-[8px] px-[14px] py-[10px]"
            style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
            <div className="font-bold uppercase tracking-[.1em] mb-[4px]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>{label}</div>
            <div className="font-display leading-none" style={{ fontSize: 24, color }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex gap-[8px] mb-[14px]">
        <div style={{ flex: 1, maxWidth: 260 }}>
          <Input
            type="text"
            placeholder="Numéro de série…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Rechercher un carton par numéro de série"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          aria-label="Filtrer par statut"
          style={{ width: 160 }}
          options={[
            { value: 'all',       label: 'Tous les statuts' },
            { value: 'sold',      label: 'Vendus' },
            { value: 'available', label: 'Disponibles' },
            { value: 'cancelled', label: 'Annulés' },
          ]}
        />
        <Button variant="ghost" size="sm" onClick={() => handleExportCsv([])}>Exporter CSV</Button>
        <Button variant="ghost" size="sm" onClick={() => handlePrint([])}>🖨 Imprimer tout</Button>
      </div>

      {/* ── Tableau ── */}
      <div className="rounded-[10px] overflow-hidden"
        style={{
          background: 'var(--color-card)',
          border: '.5px solid var(--color-sep)',
          opacity: fetchLoading ? 0.6 : 1,
          transition: 'opacity 150ms ease',
        }}>

        {/* Header */}
        <div className="grid items-center px-[16px] py-[8px]"
          style={{
            gridTemplateColumns: '32px 80px 1fr 200px 100px 80px',
            borderBottom: '.5px solid var(--color-sep)',
          }}>
          <input
            type="checkbox"
            aria-label="Tout sélectionner"
            checked={selected.size === cartons.length && cartons.length > 0}
            onChange={toggleAll}
            style={{ cursor: 'pointer', accentColor: 'var(--color-qblue)', width: 13, height: 13 }}
          />
          {['Réf.', 'Session', 'Participant', 'Statut', 'Actions'].map((h) => (
            <span key={h} className="font-bold uppercase tracking-[.09em]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>{h}</span>
          ))}
        </div>

        {/* Vide */}
        {!fetchLoading && cartons.length === 0 && (
          <div className="text-center py-[40px]">
            <div style={{ fontSize: 13, color: 'var(--color-text-hint)', marginBottom: 8 }}>
              {!activeSessionId
                ? 'Aucune session disponible'
                : total === 0
                  ? 'Aucun carton généré pour cette session'
                  : 'Aucun carton correspondant'}
            </div>
            {canGenerate && total === 0 && (
              <Button variant="secondary" size="sm" onClick={() => setShowGenerate(true)}>
                Générer les premiers cartons
              </Button>
            )}
          </div>
        )}

        {/* Lignes */}
        {cartons.map((c, i) => (
          <div
            key={c.id}
            className="grid items-center px-[16px] py-[9px] transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
            style={{
              gridTemplateColumns: '32px 80px 1fr 200px 100px 80px',
              borderBottom: i < cartons.length - 1 ? '.5px solid var(--color-sep)' : undefined,
              background: selected.has(c.id) ? 'var(--color-qblue-bg)' : undefined,
            }}
          >
            <input
              type="checkbox"
              aria-label={`Sélectionner carton ${c.serial}`}
              checked={selected.has(c.id)}
              onChange={() => toggleSelect(c.id)}
              style={{ cursor: 'pointer', accentColor: 'var(--color-qblue)', width: 13, height: 13 }}
            />

            <span
              className="font-bold rounded-[4px] px-[7px] py-[2px] inline-block"
              style={{
                fontSize: 11,
                background: 'var(--color-qblue-bg)',
                color: 'var(--color-qblue-text)',
                fontFamily: 'monospace',
              }}
            >
              {c.serial}
            </span>

            <span className="truncate" style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {c.sessionName}
            </span>

            <div className="flex items-center gap-[7px]">
              {c.participant ? (
                <>
                  <div
                    className="rounded-full flex items-center justify-center flex-shrink-0 font-bold"
                    style={{ width: 22, height: 22, background: avatarColor(c.participant), fontSize: 9, color: 'white' }}
                    aria-hidden="true"
                  >
                    {initials(c.participant)}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{c.participant}</span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>—</span>
              )}
            </div>

            <div>
              <Badge variant={c.status === 'sold' ? 'active' : c.status === 'cancelled' ? 'cancelled' : 'draft'}>
                {STATUS_LABELS[c.status]}
              </Badge>
            </div>

            <div className="flex gap-[4px]">
              <Button variant="ghost" size="sm" onClick={() => setViewCarton(c)}>Voir</Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between mt-[12px]"
        style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
        <span>
          {total > 0
            ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} sur ${total} carton${total > 1 ? 's' : ''}`
            : '0 carton'}
        </span>
        <div className="flex gap-[6px]">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1 || fetchLoading}
            onClick={() => handlePageChange(page - 1)}
          >
            ← Précédent
          </Button>
          <span className="px-[10px] flex items-center font-bold"
            style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>
            {page} / {pages || 1}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pages || fetchLoading}
            onClick={() => handlePageChange(page + 1)}
          >
            Suivant →
          </Button>
        </div>
      </div>

      {/* ── Modal génération ── */}
      {showGenerate && activeSessionId && (
        <GenerateModal
          sessionId={activeSessionId}
          sessionName={activeSession?.name ?? ''}
          currentTotal={total}
          maxCartons={activeSession?.max_cartons ?? null}
          onSuccess={handleGenerated}
          onClose={() => setShowGenerate(false)}
        />
      )}

      {/* ── Modal vue carton ── */}
      {viewCarton && (
        <CartonGridModal
          carton={viewCarton}
          onClose={() => setViewCarton(null)}
        />
      )}
    </div>
  )
}
