'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface Participant {
  id: string
  name: string
  email: string
  color: string
  cartonsBought: number
}

interface ParticipantSearchProps {
  participants: Participant[]
  selected: Participant | null
  quotaMax: number
  onSelect: (p: Participant) => void
  onNewParticipant: () => void
  onQueryChange?: (q: string) => void
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function ParticipantSearch({
  participants,
  selected,
  quotaMax,
  onSelect,
  onNewParticipant,
  onQueryChange,
}: ParticipantSearchProps) {
  const [query, setQuery] = useState('')

  const filtered = onQueryChange
    ? participants
    : query.trim()
      ? participants.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.email.toLowerCase().includes(query.toLowerCase())
        )
      : participants

  return (
    <div>
      {/* Champ de recherche */}
      <div className="relative mb-[8px]">
        <svg
          width="13" height="13" viewBox="0 0 16 16" fill="none"
          aria-hidden="true"
          style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        >
          <circle cx="6.5" cy="6.5" r="4" stroke="var(--color-text-secondary)" strokeWidth="1.4" />
          <path d="M10 10l3 3" stroke="var(--color-text-secondary)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Nom ou email…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onQueryChange?.(e.target.value) }}
          aria-label="Rechercher un participant"
          className="w-full rounded-[6px] transition-colors duration-[150ms]"
          style={{
            padding: '7px 9px 7px 29px',
            border: '.5px solid var(--color-border)',
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--color-text-primary)',
            background: 'var(--color-bg)',
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--color-qblue)'; e.target.style.background = 'var(--color-card)' }}
          onBlur={(e)  => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.background = 'var(--color-bg)' }}
        />
      </div>

      {/* Liste */}
      <ul className="list-none m-0 p-0">
        {filtered.map((p) => {
          const isSel  = selected?.id === p.id
          const isFull = p.cartonsBought >= quotaMax
          const isNear = p.cartonsBought >= quotaMax * 0.85

          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p)}
                disabled={isFull}
                aria-pressed={isSel}
                aria-label={`Sélectionner ${p.name}`}
                className={cn(
                  'w-full flex items-center gap-[8px] rounded-[7px] px-[9px] py-[7px] mb-[4px] text-left cursor-pointer transition-colors duration-[150ms]',
                  isFull && 'opacity-50 cursor-not-allowed'
                )}
                style={{
                  background: isSel ? 'var(--color-qblue-bg)' : 'var(--color-card)',
                  border: `.5px solid ${isSel ? 'var(--color-qblue)' : 'var(--color-border)'}`,
                }}
              >
                {/* Avatar */}
                <div
                  aria-hidden="true"
                  className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
                  style={{ width: 27, height: 27, background: p.color, fontSize: 10, color: 'white' }}
                >
                  {initials(p.name)}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                    {p.name}
                  </div>
                  <div className="truncate" style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                    {p.email}
                  </div>
                </div>

                {/* Quota */}
                <div className="flex-shrink-0 text-right">
                  <div
                    className="font-bold"
                    style={{
                      fontSize: 10,
                      color: isFull ? 'var(--color-qred)' : isNear ? 'var(--color-orange)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {p.cartonsBought} / {quotaMax}
                  </div>
                  {isFull && (
                    <div className="font-bold" style={{ fontSize: 9, color: 'var(--color-qred)' }}>
                      Limite atteinte
                    </div>
                  )}
                  {!isFull && isNear && (
                    <div className="font-bold" style={{ fontSize: 9, color: 'var(--color-orange)' }}>
                      Quasi limite
                    </div>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Nouveau participant */}
      <button
        type="button"
        onClick={onNewParticipant}
        className="w-full flex items-center gap-[7px] rounded-[7px] px-[9px] py-[7px] mt-[4px] cursor-pointer transition-colors duration-[150ms] hover:border-[var(--color-qblue)] hover:text-[var(--color-qblue)]"
        style={{
          background: 'transparent',
          border: '.5px dashed var(--color-border)',
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'var(--color-text-secondary)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Nouveau participant (sans compte)
      </button>
    </div>
  )
}
