'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'
import { HeroBall }      from '@/components/tirage/HeroBall'
import { Grid90 }        from '@/components/tirage/Grid90'
import { HistoryBalls }  from '@/components/tirage/HistoryBalls'
import { LotPanel }      from '@/components/tirage/LotPanel'
import type { TirageType } from '@/types/session'

type TirageTypeExt = TirageType | 'pause'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface Lot {
  id:        string
  name:      string
  value:     number | null
  order:     number
  image_url: string | null
}

interface TirageState {
  id:          string
  type:        TirageTypeExt
  lot:         Lot | null
  drawEvents:  Array<{ number: number; sequence: number }>
  sessionName: string
  totalLots:   number
}

// ─────────────────────────────────────────
// Props
// ─────────────────────────────────────────

interface DisplayClientProps {
  sessionId:    string
  sessionName:  string
  initialState: TirageState | null
  totalLots:    number
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export default function DisplayClient({
  sessionId,
  sessionName,
  initialState,
  totalLots,
}: DisplayClientProps) {
  const [tirage,  setTirage]  = useState<TirageState | null>(initialState)
  const [drawn,   setDrawn]   = useState<number[]>(
    initialState?.drawEvents.sort((a, b) => a.sequence - b.sequence).map(e => e.number) ?? [],
  )
  const [current, setCurrent] = useState<number | null>(
    initialState?.drawEvents.sort((a, b) => b.sequence - a.sequence)[0]?.number ?? null,
  )
  const [animKey, setAnimKey] = useState(0)
  const [theme,   setTheme]   = useState<'light' | 'dark'>('light')
  const socketRef = useRef<Socket | null>(null)

  const fetchAndUpdate = useCallback(async () => {
    try {
      const res  = await fetch(`/api/public/display/sessions/${sessionId}`)
      if (!res.ok) return
      const data = await res.json()
      if (!data.tirage) { setTirage(null); return }

      const t = data.tirage
      const events: Array<{ number: number; sequence: number }> = (t.draw_events ?? [])
        .sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence)

      const state: TirageState = {
        id:          t.id,
        type:        t.type as TirageTypeExt,
        lot:         t.lot,
        drawEvents:  events,
        sessionName: t.session?.name ?? sessionName,
        totalLots,
      }
      setTirage(state)
      setDrawn(events.map(e => e.number))
      setCurrent(events[events.length - 1]?.number ?? null)

      // Rejoindre la room du nouveau tirage
      socketRef.current?.emit('join:tirage', t.id)
    } catch { /* réseau indisponible */ }
  }, [sessionId, sessionName, totalLots])

  useEffect(() => {
    const socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] })
    socketRef.current = socket

    // Room de session : reçoit tirage:start quand un nouveau tirage démarre
    socket.emit('join:session', sessionId)

    socket.on('tirage:start', () => { fetchAndUpdate() })

    // Nouveaux numéros tirés
    socket.on('draw', ({ number }: { number: number; sequence: number }) => {
      setDrawn(prev => [...prev, number])
      setCurrent(number)
      setAnimKey(k => k + 1)
    })

    // Rejoindre la room du tirage initial si déjà en cours
    if (initialState?.id) {
      socket.emit('join:tirage', initialState.id)
    }

    return () => { socket.disconnect(); socketRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const lot       = tirage?.lot
  const tirageType: TirageType = (tirage?.type && tirage.type !== 'pause') ? (tirage.type as TirageType) : 'quine'

  return (
    <div
      data-theme={theme}
      style={{
        display:        'flex',
        flexDirection:  'column',
        height:         '100vh',
        overflow:       'hidden',
        background:     'var(--color-bg)',
        fontFamily:     'var(--font-body)',
      }}
    >
      {/* ── En-tête ── */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '10px 28px',
          flexShrink:     0,
          borderBottom:   '1px solid var(--color-border)',
          background:     'var(--color-navy)',
        }}
      >
        <div
          className="font-display"
          style={{ fontSize: 22, color: '#fff', letterSpacing: '.04em' }}
        >
          {sessionName}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {lot && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span
                className="font-bold uppercase tracking-[.14em]"
                style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}
              >
                {drawn.length} / 90 numéros
              </span>
              <span
                aria-hidden="true"
                style={{
                  display:      'inline-block',
                  width:        7, height: 7,
                  borderRadius: '50%',
                  background:   '#48BB78',
                  flexShrink:   0,
                }}
              />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>En direct</span>
            </div>
          )}

          {/* Toggle thème */}
          <button
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
            style={{
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              width:           32,
              height:          32,
              borderRadius:    8,
              background:      'rgba(255,255,255,.08)',
              border:          '1px solid rgba(255,255,255,.12)',
              cursor:          'pointer',
              flexShrink:      0,
            }}
          >
            {theme === 'light' ? (
              /* Moon icon */
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              /* Sun icon */
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="5" stroke="rgba(255,255,255,.7)" strokeWidth="2"/>
                <line x1="12" y1="1" x2="12" y2="3" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="1" y1="12" x2="3" y2="12" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Contenu ── */}
      {tirage && lot ? (
        <div
          style={{
            flex:     1,
            display:  'flex',
            minHeight: 0,
            padding:  '20px 28px',
            gap:      24,
          }}
        >
          {/* Panneau lot */}
          <LotPanel
            name={lot.name}
            value={lot.value ?? undefined}
            order={lot.order}
            total={tirage.totalLots}
            tirageType={tirageType}
            imageUrl={lot.image_url ?? undefined}
          />

          {/* Zone centrale */}
          <div
            style={{
              flex:          1,
              display:       'flex',
              flexDirection: 'column',
              gap:           16,
              minWidth:      0,
            }}
          >
            {/* Annonce screen reader */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {current !== null ? `Numéro ${current} tiré` : ''}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <HeroBall number={current} rank={drawn.length} animate={animKey > 0} />
            </div>

            <HistoryBalls drawn={drawn} limit={20} />

            <Grid90 drawn={drawn} current={current} />
          </div>
        </div>
      ) : (
        // Écran d'attente
        <div
          style={{
            flex:           1,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            14,
          }}
        >
          <div
            className="font-display"
            style={{ fontSize: 60, color: 'var(--color-amber)', letterSpacing: '.04em', lineHeight: 1 }}
          >
            {sessionName}
          </div>
          <div style={{ fontSize: 16, color: 'var(--color-text-hint)' }}>
            Le tirage va bientôt commencer…
          </div>
        </div>
      )}
    </div>
  )
}
