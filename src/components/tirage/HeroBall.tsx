'use client'

import { useEffect, useRef } from 'react'

interface HeroBallProps {
  number: number | null
  rank: number
  /** true → déclenche l'animation pop + pulse */
  animate: boolean
}

export function HeroBall({ number, rank, animate }: HeroBallProps) {
  const ballRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!animate || !ballRef.current) return
    const el = ballRef.current

    // Pulse ring
    el.style.boxShadow = '0 0 0 0 rgba(239,159,39,.55)'
    el.animate(
      [
        { boxShadow: '0 0 0 0 rgba(239,159,39,.55)' },
        { boxShadow: '0 0 0 14px rgba(239,159,39,0)' },
        { boxShadow: '0 0 0 0 rgba(239,159,39,0)' },
      ],
      { duration: 1400, easing: 'ease-out' }
    )

    // Scale pop
    el.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.18)', offset: 0.4 },
        { transform: 'scale(1)' },
      ],
      { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' }
    )
  }, [animate, number])

  const ordinal = rank === 1 ? '1er' : `${rank}e`

  return (
    <div className="flex flex-col items-center justify-center gap-[5px]" style={{ width: '27%', flexShrink: 0 }}>
      <span
        className="font-bold uppercase tracking-[.18em]"
        style={{ fontSize: 11, color: 'var(--tirage-hero-bg)', opacity: 0.5 }}
      >
        Numéro tiré
      </span>

      <div
        ref={ballRef}
        aria-live="assertive"
        aria-atomic="true"
        aria-label={number !== null ? `Numéro ${number}, ${ordinal} tiré` : 'En attente'}
        className="rounded-full flex items-center justify-center transition-colors duration-[300ms]"
        style={{
          width: 90, height: 90,
          background: 'var(--tirage-hero-bg)',
        }}
      >
        <span
          className="font-display leading-none"
          style={{ fontSize: 54, color: 'var(--tirage-hero-num)' }}
        >
          {number ?? '—'}
        </span>
      </div>

      <span
        style={{ fontSize: 11, color: 'var(--tirage-hero-num)', opacity: 0.22 }}
      >
        {number !== null ? `${ordinal} numéro tiré` : ''}
      </span>
    </div>
  )
}
