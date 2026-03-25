'use client'

import { useState, useCallback } from 'react'
import { HeroBall }      from '@/components/tirage/HeroBall'
import { Grid90 }        from '@/components/tirage/Grid90'
import { HistoryBalls }  from '@/components/tirage/HistoryBalls'
import { LotPanel }      from '@/components/tirage/LotPanel'
import { WinnerOverlay } from '@/components/tirage/WinnerOverlay'

// ─────────────────────────────────────────
// Données de démo
// ─────────────────────────────────────────

const INIT_DRAWN = [45, 12, 67, 3, 89, 31, 52, 74, 18, 37, 82, 7, 61, 24, 9]

const DEMO_LOT = {
  name:       'Robot Cuiseur Pro',
  value:      400,
  order:      3,
  total:      8,
  tirageType: 'quine' as const,
}

const DEMO_PARTNERS = [52, 64, 46, 58] // largeurs en px pour les placeholders

// ─────────────────────────────────────────
// Theme toggle
// ─────────────────────────────────────────

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Basculer entre mode jour et mode nuit"
      onClick={onToggle}
      className="flex items-center gap-[6px] rounded-[20px] px-[10px] py-[3px] pl-[6px] cursor-pointer transition-colors duration-[200ms]"
      style={{
        background: 'var(--tirage-bg3)',
        border:     '1px solid var(--color-border)',
      }}
    >
      {/* Track */}
      <div
        className="relative"
        style={{ width: 28, height: 15, borderRadius: 20, background: 'var(--tirage-bg4)', border: '1px solid var(--color-border)' }}
        aria-hidden="true"
      >
        <div
          className="absolute top-[1px] left-[1px] rounded-full transition-transform duration-[250ms]"
          style={{
            width: 11, height: 11,
            background: 'var(--color-amber)',
            transform: dark ? 'translateX(0)' : 'translateX(13px)',
          }}
        />
      </div>
      <span
        className="font-bold uppercase tracking-[.1em]"
        style={{ fontSize: 10, color: 'var(--color-text-muted)' }}
      >
        {dark ? 'Nuit' : 'Jour'}
      </span>
    </button>
  )
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function TiragePage() {
  const [dark, setDark]             = useState(true)
  const [drawn, setDrawn]           = useState<number[]>(INIT_DRAWN)
  const [current, setCurrent]       = useState<number | null>(INIT_DRAWN[INIT_DRAWN.length - 1])
  const [animKey, setAnimKey]       = useState(0)
  const [winner, setWinner]         = useState(false)
  const [winnerTriggered, setWinnerTriggered] = useState(false)
  const [msg, setMsg]               = useState('')

  const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1)

  const drawNumber = useCallback(() => {
    if (winner) {
      setWinner(false)
      return
    }

    const available = allNumbers.filter((n) => !drawn.includes(n))
    if (available.length === 0) {
      setMsg('Tous les 90 numéros ont été tirés.')
      return
    }

    const n = available[Math.floor(Math.random() * available.length)]
    const next = [...drawn, n]
    setDrawn(next)
    setCurrent(n)
    setAnimKey((k) => k + 1)
    setMsg('')

    // Simuler détection gagnant à 20 numéros (démo)
    if (next.length >= 20 && !winnerTriggered) {
      setWinnerTriggered(true)
      setTimeout(() => setWinner(true), 600)
    }
  }, [drawn, winner, winnerTriggered, allNumbers])

  function reset() {
    setDrawn([...INIT_DRAWN])
    setCurrent(INIT_DRAWN[INIT_DRAWN.length - 1])
    setWinner(false)
    setWinnerTriggered(false)
    setMsg('')
    setAnimKey((k) => k + 1)
  }

  return (
    <div
      data-theme={dark ? 'dark' : 'light'}
      className="flex flex-col min-h-0 flex-1 transition-colors duration-[300ms]"
      style={{ margin: '-16px -20px', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
    >

      {/* ── Écran 16/9 ────────────────────────────────────── */}
      <div
        className="relative flex flex-col overflow-hidden flex-1"
        style={{ minHeight: 0 }}
      >

        {/* Header */}
        <div
          className="flex items-center justify-between px-[16px] py-[8px] flex-shrink-0 transition-colors duration-[300ms]"
          style={{ background: 'var(--tirage-bg2)', borderBottom: '1px solid var(--color-border)' }}
        >
          {/* Logo + session */}
          <div className="flex items-center gap-[10px]">
            <div
              aria-hidden="true"
              className="rounded-[5px] flex items-center justify-center font-display"
              style={{ width: 28, height: 28, background: 'var(--color-amber)', fontSize: 17, color: '#412402' }}
            >
              Q
            </div>
            <span
              className="font-bold uppercase tracking-[.06em] transition-colors duration-[300ms]"
              style={{ fontSize: 12, color: 'var(--color-text-primary)' }}
            >
              Grand Loto de Printemps 2025
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>—</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Amis du Quartier</span>
          </div>

          {/* Centre : badge type + toggle */}
          <div className="flex items-center gap-[10px]">
            <div
              className="font-bold tracking-[.14em] rounded-[4px] px-[12px] py-[2px]"
              style={{ fontSize: 11, background: '#1a2e4a', color: '#85B7EB', border: '1.5px solid #378ADD' }}
            >
              QUINE
            </div>
            <ThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
          </div>

          {/* Compteur */}
          <div className="flex items-baseline gap-[3px]">
            <span className="font-display" style={{ fontSize: 24, color: 'var(--color-amber)' }}>
              {drawn.length}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              &nbsp;/ 90 numéros
            </span>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex flex-1 min-h-0 px-[16px] py-[10px] gap-[14px] overflow-hidden">

          {/* Lot */}
          <LotPanel {...DEMO_LOT} />

          {/* Hero ball */}
          <HeroBall
            number={current}
            rank={drawn.length}
            animate={animKey > 0}
            key={animKey}
          />

          {/* Historique */}
          <HistoryBalls drawn={drawn} />
        </div>

        {/* Grille 90 */}
        <div
          className="px-[16px] py-[5px] pb-[8px] flex-shrink-0 transition-colors duration-[300ms]"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <Grid90 drawn={drawn} current={current} />
        </div>

        {/* Partenaires */}
        <div
          className="flex items-center justify-center gap-[18px] px-[16px] py-[5px] flex-shrink-0 transition-colors duration-[300ms]"
          style={{ background: 'var(--tirage-bg4)', borderTop: '1px solid var(--color-border)' }}
        >
          <span
            className="uppercase tracking-[.09em] whitespace-nowrap"
            style={{ fontSize: 11, color: 'var(--color-text-hint)' }}
          >
            Partenaires
          </span>
          <div style={{ width: 1, height: 14, background: 'var(--color-sep)' }} aria-hidden="true" />
          {DEMO_PARTNERS.map((w, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="rounded-[3px] transition-colors duration-[300ms]"
              style={{ width: w, height: 14, background: 'var(--tirage-hist-rule)' }}
            />
          ))}
        </div>

        {/* Overlay gagnant */}
        {winner && (
          <WinnerOverlay
            winnerName="Marie Dupont"
            cartonRef="Carton #C042"
            lineInfo="ligne 2 complétée"
            tirageType={DEMO_LOT.tirageType}
            lotName={DEMO_LOT.name}
            lotValue={DEMO_LOT.value}
            onConfirm={() => setWinner(false)}
          />
        )}
      </div>

      {/* ── Contrôles animateur ──────────────────────────── */}
      <div
        className="flex items-center justify-center gap-[10px] flex-wrap px-[16px] py-[10px] flex-shrink-0 transition-colors duration-[300ms]"
        style={{ background: 'var(--tirage-bg2)', borderTop: '1px solid var(--color-border)' }}
      >
        <button
          type="button"
          onClick={drawNumber}
          className="font-bold rounded-[8px] px-[22px] py-[9px] cursor-pointer transition-opacity duration-[150ms] hover:opacity-90"
          style={{
            background:   'var(--color-amber)',
            color:        '#2C1500',
            border:       'none',
            fontFamily:   'var(--font-body)',
            fontSize:     13,
          }}
        >
          {winner ? 'Confirmer le gagnant' : 'Tirer un numéro'}
        </button>

        <button
          type="button"
          onClick={reset}
          className="rounded-[8px] px-[16px] py-[9px] cursor-pointer transition-colors duration-[150ms]"
          style={{
            background:  'transparent',
            color:       'var(--color-text-secondary)',
            border:      '.5px solid var(--color-border)',
            fontFamily:  'var(--font-body)',
            fontSize:    12,
          }}
        >
          Réinitialiser
        </button>

        {msg && (
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            {msg}
          </span>
        )}
      </div>
    </div>
  )
}
