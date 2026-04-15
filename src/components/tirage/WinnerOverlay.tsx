'use client'

import { useEffect } from 'react'
import type { TirageType } from '@/types/session'

interface WinnerOverlayProps {
  winnerName: string
  cartonRef: string
  lineInfo: string
  tirageType: TirageType
  lotName: string
  lotValue?: number
  onConfirm: () => void
}

const TYPE_LABELS: Record<TirageType, string> = {
  quine:        'QUINE',
  double_quine: 'DOUBLE QUINE',
  carton_plein: 'CARTON PLEIN',
}

export function WinnerOverlay({
  winnerName,
  cartonRef,
  lineInfo,
  tirageType,
  lotName,
  lotValue,
  onConfirm,
}: WinnerOverlayProps) {
  // Fermeture avec Entrée
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onConfirm])

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Gagnant détecté"
      className="absolute inset-0 z-10 flex items-center justify-center"
      style={{ background: 'rgba(10,16,30,.88)' }}
    >
      <div
        className="rounded-[14px] px-[36px] py-[22px] text-center transition-colors duration-[300ms]"
        style={{
          background:  'var(--tirage-winner-bg)',
          border:      `2px solid var(--tirage-winner-border)`,
          maxWidth:    '58%',
          animation:   'winnerIn .4s cubic-bezier(.34,1.36,.64,1) both',
        }}
      >
        {/* Tag */}
        <div
          className="font-bold uppercase tracking-[.22em] mb-[10px] transition-colors duration-[300ms]"
          style={{ fontSize: 11, color: 'var(--tirage-winner-tag)' }}
        >
          Gagnant détecté !
        </div>

        {/* Nom gagnant */}
        <div
          className="font-display leading-none mb-[4px] transition-colors duration-[300ms]"
          style={{ fontSize: 38, color: 'var(--color-text-primary)' }}
        >
          {winnerName}
        </div>

        {/* Détail carton */}
        <div
          className="mb-[16px] transition-colors duration-[300ms]"
          style={{ fontSize: 11, color: 'var(--color-text-muted)' }}
        >
          {cartonRef} · {lineInfo}
        </div>

        {/* Lot */}
        <div
          className="inline-block font-bold rounded-[5px] px-[18px] py-[5px] mb-[14px]"
          style={{ fontSize: 12, background: 'var(--color-amber)', color: '#5C3A00' }}
        >
          {TYPE_LABELS[tirageType]} — {lotName}{lotValue ? ` · ${lotValue} €` : ''}
        </div>

        {/* Attente */}
        <div
          className="mb-[16px] transition-colors duration-[300ms]"
          style={{ fontSize: 11, color: 'var(--color-text-muted)' }}
        >
          En attente de confirmation par l&apos;animateur…
        </div>

        {/* Bouton */}
        <button
          type="button"
          onClick={onConfirm}
          className="font-bold rounded-[8px] px-[24px] py-[9px] cursor-pointer transition-opacity duration-[150ms] hover:opacity-90"
          style={{
            background:  'var(--color-amber)',
            color:       '#5C3A00',
            border:      'none',
            fontFamily:  'var(--font-body)',
            fontSize:    13,
          }}
        >
          Confirmer le gagnant →
        </button>
      </div>
    </div>
  )
}
