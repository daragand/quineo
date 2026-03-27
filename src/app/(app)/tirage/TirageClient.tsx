'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HeroBall }      from '@/components/tirage/HeroBall'
import { Grid90 }        from '@/components/tirage/Grid90'
import { HistoryBalls }  from '@/components/tirage/HistoryBalls'
import { LotPanel }      from '@/components/tirage/LotPanel'
import { WinnerOverlay } from '@/components/tirage/WinnerOverlay'
import { useTirage }     from '@/hooks/useTirage'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface TirageData {
  id: string
  session_id: string
  lot: { id: string; name: string; value: number | null; order: number }
  draw_events: Array<{ number: number; sequence: number }>
  session: { id: string; name: string }
  partners: Array<{ id: string; name: string }>
}

export interface PendingLot {
  id: string
  name: string
  value: number | null
  order: number
}

export interface AvailableSession {
  id: string
  name: string
  status: string
  lots: PendingLot[]
}

interface TirageClientProps {
  tirage: TirageData | null
  availableSessions: AvailableSession[]
  associationName: string
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
// Modal déclaration gagnant
// ─────────────────────────────────────────

function WinnerDialog({
  tirageId,
  sessionId,
  onConfirmed,
  onClose,
}: {
  tirageId: string
  sessionId: string
  onConfirmed: (winner: { participantName: string; cartonRef: string }) => void
  onClose: () => void
}) {
  const [serial,  setSerial]  = useState('')
  const [found,   setFound]   = useState<{ id: string; serial_number: string; participant?: { first_name?: string; last_name?: string } } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function search() {
    if (!serial.trim()) return
    setLoading(true)
    setError('')
    setFound(null)
    const res = await fetch(`/api/sessions/${sessionId}/cartons?serial=${encodeURIComponent(serial.trim())}&status=sold&limit=1`)
    setLoading(false)
    if (!res.ok) { setError('Erreur lors de la recherche'); return }
    const data = await res.json()
    if (!data.cartons?.length) { setError('Aucun carton vendu trouvé avec ce numéro'); return }
    setFound(data.cartons[0])
  }

  async function confirm() {
    if (!found) return
    setLoading(true)
    setError('')
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
    const p = found.participant
    const participantName = p ? [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Gagnant' : 'Gagnant'
    onConfirmed({ participantName, cartonRef: found.serial_number })
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
              placeholder="ex: C0042"
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
              <div className="font-bold" style={{ fontSize: 13, color: 'var(--color-qgreen-text)' }}>
                {found.serial_number}
              </div>
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
// Vue "Démarrer un tirage"
// ─────────────────────────────────────────

function StartTirage({ sessions }: { sessions: AvailableSession[] }) {
  const router = useRouter()
  const [selectedSession, setSelectedSession] = useState<AvailableSession | null>(sessions[0] ?? null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function startDraw(lotId: string) {
    if (!selectedSession) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/tirages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: selectedSession.id, lot_id: lotId }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors du démarrage')
      return
    }
    router.refresh()
  }

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center" style={{ padding: '40px 20px' }}>
          <div className="font-bold mb-[8px]" style={{ fontSize: 18, color: 'var(--color-text-primary)' }}>
            Aucune session active
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Ouvrez une session et ajoutez des lots pour démarrer un tirage.
          </p>
        </div>
      </div>
    )
  }

  const pendingLots = selectedSession?.lots.filter(l => l) ?? []

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: '0 20px' }}>
      <h2 className="font-display mb-[20px]" style={{ fontSize: 24, color: 'var(--color-text-primary)' }}>
        Démarrer un tirage
      </h2>

      {sessions.length > 1 && (
        <div className="mb-[20px]">
          <div className="font-bold uppercase tracking-[.1em] mb-[8px]"
            style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Session</div>
          <div className="flex flex-col gap-[6px]">
            {sessions.map(s => (
              <button key={s.id} type="button" onClick={() => setSelectedSession(s)}
                className="rounded-[8px] px-[14px] py-[10px] text-left cursor-pointer transition-colors duration-[150ms]"
                style={{
                  background: selectedSession?.id === s.id ? 'var(--color-qblue-bg)' : 'var(--color-card)',
                  border: `.5px solid ${selectedSession?.id === s.id ? 'var(--color-qblue)' : 'var(--color-sep)'}`,
                  fontFamily: 'var(--font-body)',
                }}>
                <span className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedSession && (
        <div>
          <div className="font-bold uppercase tracking-[.1em] mb-[8px]"
            style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Lots à tirer</div>
          {pendingLots.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>
              Aucun lot en attente pour cette session.
            </p>
          ) : (
            <div className="flex flex-col gap-[6px]">
              {pendingLots.map(lot => (
                <div key={lot.id} className="flex items-center justify-between rounded-[8px] px-[14px] py-[10px]"
                  style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
                  <div>
                    <div className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{lot.name}</div>
                    {lot.value != null && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                        {lot.value.toLocaleString('fr-FR')} €
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => startDraw(lot.id)} disabled={loading}
                    className="rounded-[7px] font-bold px-[14px] py-[7px] cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'var(--color-amber)', color: '#2C1500', border: 'none', fontFamily: 'var(--font-body)', fontSize: 12 }}>
                    {loading ? '…' : 'Démarrer'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p style={{ fontSize: 12, color: 'var(--color-qred)', marginTop: 12 }}>{error}</p>}
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
  // Overlay gagnant déclenché soit via dialog opérateur, soit via socket (écran diffusion)
  const [winnerOverlay, setWinnerOverlay] = useState<{ participantName: string; cartonRef: string } | null>(null)

  const lot = tirage.lot

  // Réception winner depuis socket → déclenche l'overlay sur tous les écrans connectés
  useEffect(() => {
    if (!socketWinner) return
    setWinnerOverlay(socketWinner)
    clearWinner()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketWinner])

  const drawNumber = useCallback(async () => {
    if (drawn.length >= 90) { setMsg('Tous les 90 numéros ont été tirés.'); return }
    setDrawLoading(true)
    setMsg('')
    const res = await fetch(`/api/tirages/${tirage.id}/draw`, { method: 'POST' })
    setDrawLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setMsg(data.error ?? 'Erreur lors du tirage')
    }
    // Le socket `draw` met à jour drawn/current/animKey pour tous les clients
  }, [drawn.length, tirage.id])

  function handleWinnerConfirmed(winner: { participantName: string; cartonRef: string }) {
    setShowWinnerDlg(false)
    setWinnerOverlay(winner)
  }

  function handleWinnerDismiss() {
    setWinnerOverlay(null)
    router.refresh()
  }

  return (
    <div
      data-theme={dark ? 'dark' : 'light'}
      className="flex flex-col min-h-0 flex-1 transition-colors duration-[300ms]"
      style={{ margin: '-16px -20px', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
    >
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
          <div className="font-bold tracking-[.14em] rounded-[4px] px-[12px] py-[2px]"
            style={{ fontSize: 11, background: '#1a2e4a', color: '#85B7EB', border: '1.5px solid #378ADD' }}>
            QUINE
          </div>
          {/* Indicateur connexion Socket.io */}
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
        <LotPanel
          name={lot.name}
          value={lot.value ?? 0}
          order={lot.order}
          total={0}
          tirageType="quine"
        />
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
      <div className="flex items-center justify-center gap-[10px] flex-wrap px-[16px] py-[10px] flex-shrink-0 transition-colors duration-[300ms]"
        style={{ background: 'var(--tirage-bg2)', borderTop: '1px solid var(--color-border)' }}>
        <button type="button" onClick={drawNumber} disabled={drawLoading || drawn.length >= 90}
          className="font-bold rounded-[8px] px-[22px] py-[9px] cursor-pointer transition-opacity duration-[150ms] hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--color-amber)', color: '#2C1500', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13 }}>
          {drawLoading ? 'Tirage…' : 'Tirer un numéro'}
        </button>

        <button type="button" onClick={() => setShowWinnerDlg(true)}
          className="rounded-[8px] px-[16px] py-[9px] cursor-pointer font-bold transition-colors duration-[150ms]"
          style={{ background: 'transparent', color: 'var(--color-qgreen-text)', border: '.5px solid var(--color-qgreen)', fontFamily: 'var(--font-body)', fontSize: 12 }}>
          Déclarer un gagnant
        </button>

        {msg && <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{msg}</span>}
      </div>

      {/* Overlay gagnant */}
      {winnerOverlay && (
        <WinnerOverlay
          winnerName={winnerOverlay.participantName}
          cartonRef={winnerOverlay.cartonRef}
          lineInfo="ligne complétée"
          tirageType="quine"
          lotName={lot.name}
          lotValue={lot.value ?? 0}
          onConfirm={handleWinnerDismiss}
        />
      )}

      {/* Dialog déclaration gagnant */}
      {showWinnerDlg && (
        <WinnerDialog
          tirageId={tirage.id}
          sessionId={tirage.session_id}
          onConfirmed={handleWinnerConfirmed}
          onClose={() => setShowWinnerDlg(false)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────

export default function TirageClient({ tirage, availableSessions, associationName }: TirageClientProps) {
  if (tirage) {
    return <LiveTirage tirage={tirage} associationName={associationName} />
  }
  return <StartTirage sessions={availableSessions} />
}
