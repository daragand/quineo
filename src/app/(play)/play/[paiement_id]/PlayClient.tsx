'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { io, type Socket } from 'socket.io-client'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface CartonData {
  id:            string
  serial_number: string
  grid:          number[][]
}

interface TirageData {
  id:           string
  type:         string
  status:       string
  lotName:      string | null
  drawnNumbers: number[]
}

interface SessionData {
  id:              string
  name:            string
  date:            string | null
  status:          string
  associationName: string
}

interface Props {
  paiementId:     string
  session:        SessionData
  cartons:        CartonData[]
  initialTirage:  TirageData | null
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const TIRAGE_LABELS: Record<string, string> = {
  quine:        'Quine',
  double_quine: 'Double quine',
  carton_plein: 'Carton plein',
  pause:        'Pause',
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Lignes complètes pour un carton donné */
function getCompleteRows(grid: number[][], drawn: Set<number>): number[] {
  return grid
    .map((row, i) => ({ i, ok: row.filter(n => n > 0).every(n => drawn.has(n)) }))
    .filter(r => r.ok)
    .map(r => r.i)
}

/** Détection locale (visuelle) d'une condition gagnante */
function hasLocalWin(completeRows: number[], type: string): boolean {
  if (type === 'quine')        return completeRows.length >= 1
  if (type === 'double_quine') return completeRows.length >= 2
  if (type === 'carton_plein') return completeRows.length >= 3
  return false
}

// ─────────────────────────────────────────
// Grille carton (3 × 9)
// ─────────────────────────────────────────

function CartonGrid({
  carton,
  drawn,
  lastCalled,
  animKey,
  completeRows,
  isWinner,
}: {
  carton:       CartonData
  drawn:        Set<number>
  lastCalled:   number | null
  animKey:      number
  completeRows: number[]
  isWinner:     boolean
}) {
  return (
    <div
      style={{
        borderRadius:  12,
        overflow:      'hidden',
        border:        isWinner
          ? '1.5px solid rgba(72,187,120,.7)'
          : '1px solid rgba(255,255,255,.08)',
        boxShadow:     isWinner
          ? '0 0 24px rgba(72,187,120,.25)'
          : '0 2px 12px rgba(0,0,0,.4)',
        background:    '#1A3045',
      }}
    >
      {/* Header carton */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '8px 12px',
          background:     isWinner ? 'rgba(72,187,120,.12)' : 'rgba(255,255,255,.04)',
          borderBottom:   '1px solid rgba(255,255,255,.06)',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Carton
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: isWinner ? '#48BB78' : 'rgba(255,255,255,.7)', letterSpacing: '.06em', fontFamily: 'monospace' }}>
          {carton.serial_number}
        </span>
      </div>

      {/* Grille */}
      <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {carton.grid.map((row, ri) => {
          const rowComplete = completeRows.includes(ri)
          return (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 3 }}>
              {row.map((num, ci) => {
                const isEmpty  = num === 0
                const isCalled = !isEmpty && drawn.has(num)
                const isNew    = num === lastCalled && !isEmpty

                return (
                  <div
                    key={ci}
                    data-new={isNew ? animKey : undefined}
                    style={{
                      height:         32,
                      borderRadius:   5,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       12,
                      fontWeight:     700,
                      transition:     'background 0.25s, color 0.25s',
                      background: isEmpty
                        ? 'rgba(255,255,255,.03)'
                        : isCalled
                          ? rowComplete
                            ? 'rgba(72,187,120,.25)'
                            : 'rgba(255,216,77,.22)'
                          : 'rgba(255,255,255,.07)',
                      color: isEmpty
                        ? 'transparent'
                        : isCalled
                          ? rowComplete ? '#48BB78' : '#FFD84D'
                          : 'rgba(255,255,255,.55)',
                      boxShadow: isNew
                        ? '0 0 0 1.5px #FFD84D, 0 0 10px rgba(255,216,77,.5)'
                        : isCalled && !isEmpty
                          ? rowComplete
                            ? '0 0 0 1px rgba(72,187,120,.4)'
                            : '0 0 0 1px rgba(255,216,77,.3)'
                          : 'none',
                      // Animation bounce sur le nouveau numéro
                      animation: isNew ? `cell-pop 0.4s ease-out` : undefined,
                    }}
                  >
                    {num > 0 ? num : ''}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Overlay gagnant
// ─────────────────────────────────────────

function WinnerOverlay({
  cartonSerial,
  lotName,
  onDismiss,
}: {
  cartonSerial: string
  lotName:      string | null
  onDismiss:    () => void
}) {
  return (
    <div
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         100,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'rgba(11,18,32,.92)',
        backdropFilter: 'blur(8px)',
        animation:      'fade-in 0.3s ease',
      }}
    >
      {/* Confetti CSS */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              position:  'absolute',
              top:       `-${10 + Math.random() * 20}px`,
              left:      `${(i / 30) * 100 + (Math.random() * 3 - 1.5)}%`,
              width:     `${6 + Math.random() * 8}px`,
              height:    `${6 + Math.random() * 8}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              background: ['#FFD84D', '#48BB78', '#78AED0', '#E879F9', '#F97316', '#FBBF24'][i % 6],
              animation: `confetti-fall ${1.5 + Math.random() * 2}s ${Math.random() * 0.8}s ease-in forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Carte centrale */}
      <div
        style={{
          position:     'relative',
          background:   '#1A3045',
          border:       '1px solid rgba(72,187,120,.5)',
          borderRadius: 20,
          padding:      '40px 32px',
          textAlign:    'center',
          maxWidth:     340,
          width:        '90%',
          boxShadow:    '0 0 60px rgba(72,187,120,.2)',
          animation:    'winner-card 0.5s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 12, animation: 'trophy-bounce 0.6s 0.4s ease both' }}>
          🏆
        </div>
        <h2
          style={{
            fontSize:   28,
            fontWeight: 900,
            color:      '#48BB78',
            margin:     '0 0 6px',
            fontFamily: 'var(--font-display)',
            letterSpacing: '.05em',
          }}
        >
          VOUS AVEZ GAGNÉ !
        </h2>
        {lotName && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', margin: '0 0 16px' }}>
            Lot : <strong style={{ color: 'rgba(255,255,255,.8)' }}>{lotName}</strong>
          </p>
        )}
        <div
          style={{
            display:       'inline-block',
            background:    'rgba(72,187,120,.12)',
            border:        '1px solid rgba(72,187,120,.3)',
            borderRadius:  8,
            padding:       '6px 14px',
            fontSize:      13,
            color:         '#48BB78',
            fontFamily:    'monospace',
            letterSpacing: '.06em',
            marginBottom:  24,
          }}
        >
          Carton {cartonSerial}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', margin: '0 0 24px' }}>
          Présentez ce carton à l&apos;organisateur pour récupérer votre lot.
        </p>
        <button
          onClick={onDismiss}
          style={{
            background:   'rgba(255,255,255,.1)',
            border:       '1px solid rgba(255,255,255,.15)',
            borderRadius: 8,
            color:        'rgba(255,255,255,.6)',
            fontSize:     12,
            padding:      '8px 20px',
            cursor:       'pointer',
            fontFamily:   'var(--font-body)',
          }}
        >
          Fermer
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────

export default function PlayClient({ paiementId, session, cartons, initialTirage }: Props) {
  const [tirageId,   setTirageId]   = useState<string | null>(initialTirage?.id ?? null)
  const [tirageType, setTirageType] = useState(initialTirage?.type ?? 'quine')
  const [lotName,    setLotName]    = useState<string | null>(initialTirage?.lotName ?? null)
  const [drawn,      setDrawn]      = useState<number[]>(initialTirage?.drawnNumbers ?? [])
  const [lastCalled, setLastCalled] = useState<number | null>(
    initialTirage?.drawnNumbers.at(-1) ?? null
  )
  const [animKey,    setAnimKey]    = useState(0)
  const [winner,     setWinner]     = useState<{ cartonSerial: string; lotName: string | null } | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const mySerials = useMemo(() => new Set(cartons.map(c => c.serial_number)), [cartons])
  const drawnSet  = useMemo(() => new Set(drawn), [drawn])

  // ── Fetch tirage courant ──────────────────

  const fetchTirage = useCallback(async () => {
    try {
      const res  = await fetch(`/api/public/play/${paiementId}`)
      if (!res.ok) return
      const data = await res.json()
      const t    = data.activeTirage

      if (!t) {
        setTirageId(null)
        setDrawn([])
        setLastCalled(null)
        return
      }

      setTirageId(t.id)
      setTirageType(t.type)
      setLotName(t.lotName)
      setDrawn(t.drawnNumbers ?? [])
      setLastCalled(t.drawnNumbers?.at(-1) ?? null)

      socketRef.current?.emit('join:tirage', t.id)
    } catch { /* réseau */ }
  }, [paiementId])

  // ── Socket ────────────────────────────────

  useEffect(() => {
    const socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.emit('join:session', session.id)
    if (initialTirage?.id) socket.emit('join:tirage', initialTirage.id)

    // Nouveau tirage démarré → reset + rejoindre la nouvelle room
    socket.on('tirage:start', ({ tirageId: newId }: { tirageId: string }) => {
      socket.emit('join:tirage', newId)
      setTirageId(newId)
      setDrawn([])
      setLastCalled(null)
      setWinner(null)
      // Fetch pour récupérer type/lot du nouveau tirage
      fetchTirage()
    })

    // Numéro tiré
    socket.on('draw', ({ number }: { number: number }) => {
      setDrawn(prev => [...prev, number])
      setLastCalled(number)
      setAnimKey(k => k + 1)
    })

    // Gagnant déclaré par l'animateur
    socket.on('winner', ({ cartonRef, participantName }: { cartonRef: string; participantName: string }) => {
      if (mySerials.has(cartonRef)) {
        setWinner({ cartonSerial: cartonRef, lotName })
      }
    })

    return () => { socket.disconnect(); socketRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id])

  // ── État de la session ────────────────────

  const sessionNotStarted = session.status === 'draft' || session.status === 'open'
  const sessionEnded      = session.status === 'closed' || session.status === 'completed'

  // ── Calcul état de chaque carton ──────────

  const cartonStates = useMemo(() =>
    cartons.map(c => {
      const completeRows = getCompleteRows(c.grid, drawnSet)
      const localWin     = hasLocalWin(completeRows, tirageType)
      return { ...c, completeRows, localWin }
    }),
  [cartons, drawnSet, tirageType])

  const isWinnerCarton = (serial: string) => winner?.cartonSerial === serial

  return (
    <>
      {/* ── CSS animations ── */}
      <style>{`
        @keyframes cell-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.35); }
          70%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes winner-card {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes trophy-bounce {
          0%   { transform: scale(0) rotate(-15deg); }
          60%  { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes confetti-fall {
          0%   { transform: translateY(0)    rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0   rgba(239,159,39,.6); }
          100% { box-shadow: 0 0 0 12px rgba(239,159,39,0); }
        }
      `}</style>

      <div
        style={{
          minHeight:   '100vh',
          background:  '#0D1E2C',
          display:     'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <header
          style={{
            background:     '#1A3045',
            borderBottom:   '1px solid rgba(255,255,255,.06)',
            padding:        '12px 16px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            flexShrink:     0,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  width:          22, height: 22,
                  background:     '#FFD84D',
                  borderRadius:   5,
                  fontWeight:     900,
                  fontSize:       12,
                  color:          '#5C3A00',
                }}
              >Q</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>quineo</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
              {session.associationName}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{session.name}</div>
            {session.date && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>
                {formatDate(session.date)}
              </div>
            )}
          </div>
        </header>

        {/* ── Contenu ── */}
        <main style={{ flex: 1, padding: '16px', maxWidth: 480, width: '100%', margin: '0 auto' }}>

          {/* Session pas encore démarrée */}
          {sessionNotStarted && (
            <div
              style={{
                marginBottom:   16,
                background:     'rgba(255,216,77,.08)',
                border:         '1px solid rgba(255,216,77,.2)',
                borderRadius:   10,
                padding:        '14px 16px',
                display:        'flex',
                alignItems:     'flex-start',
                gap:            10,
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>⏳</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFD84D', marginBottom: 3 }}>
                  Partie pas encore commencée
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>
                  Le loto débutera bientôt. Cette page se mettra à jour automatiquement dès que le tirage commence — restez sur cet écran.
                </div>
              </div>
            </div>
          )}

          {/* Session terminée */}
          {sessionEnded && (
            <div
              style={{
                marginBottom:   16,
                background:     'rgba(255,255,255,.04)',
                border:         '1px solid rgba(255,255,255,.08)',
                borderRadius:   10,
                padding:        '14px 16px',
                textAlign:      'center',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>🎉</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>
                Partie terminée
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 4 }}>
                Merci d&apos;avoir participé !
              </div>
            </div>
          )}

          {/* Bandeau tirage actif */}
          {tirageId && !sessionEnded && (
            <div
              style={{
                marginBottom:   14,
                background:     'rgba(255,255,255,.04)',
                border:         '1px solid rgba(255,255,255,.08)',
                borderRadius:   10,
                padding:        '10px 14px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                gap:            12,
              }}
            >
              {/* Type de tirage */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>
                  Objectif
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#FFD84D' }}>
                  {TIRAGE_LABELS[tirageType] ?? tirageType}
                </div>
                {lotName && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>
                    {lotName}
                  </div>
                )}
              </div>

              {/* Dernier numéro */}
              {lastCalled !== null && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
                    Dernier n°
                  </div>
                  <div
                    key={animKey}
                    style={{
                      width:          44, height: 44,
                      borderRadius:   '50%',
                      background:     '#FFD84D',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       18,
                      fontWeight:     900,
                      color:          '#5C3A00',
                      animation:      'pulse-ring 0.6s ease-out',
                    }}
                  >
                    {lastCalled}
                  </div>
                </div>
              )}

              {/* Compteur */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>
                  Tirés
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
                  {drawn.length}
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', fontWeight: 400 }}> /90</span>
                </div>
              </div>
            </div>
          )}

          {/* Cartons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cartonStates.map(c => (
              <CartonGrid
                key={c.id}
                carton={c}
                drawn={drawnSet}
                lastCalled={lastCalled}
                animKey={animKey}
                completeRows={c.completeRows}
                isWinner={isWinnerCarton(c.serial_number)}
              />
            ))}
          </div>

          {/* Légende */}
          <div
            style={{
              marginTop: 16,
              display:   'flex',
              gap:       16,
              flexWrap:  'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              { color: 'rgba(255,255,255,.07)', border: 'none',                     label: 'Non tiré' },
              { color: 'rgba(255,216,77,.22)',  border: '1px solid rgba(255,216,77,.3)', label: 'Tiré' },
              { color: 'rgba(72,187,120,.25)',  border: '1px solid rgba(72,187,120,.4)', label: 'Ligne complète' },
            ].map(({ color, border, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: color, border, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{label}</span>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* ── Overlay gagnant ── */}
      {winner && (
        <WinnerOverlay
          cartonSerial={winner.cartonSerial}
          lotName={winner.lotName}
          onDismiss={() => setWinner(null)}
        />
      )}
    </>
  )
}
