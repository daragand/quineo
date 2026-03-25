'use client'

import { cn } from '@/lib/cn'
import type { TirageType, MultiRule } from '@/types/session'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type RulesState = Record<TirageType, MultiRule>

interface RulesTableProps {
  rules: RulesState
  onChange: (type: TirageType, rule: MultiRule) => void
}

// ─────────────────────────────────────────
// Données statiques
// ─────────────────────────────────────────

const TIRAGE_TYPES: Array<{ id: TirageType; label: string; style: { bg: string; color: string } }> = [
  { id: 'quine',        label: 'Quine',        style: { bg: 'var(--color-qblue-bg)',  color: 'var(--color-qblue-text)' } },
  { id: 'double_quine', label: 'Double Quine', style: { bg: 'var(--color-orange-bg)', color: '#633806' } },
  { id: 'carton_plein', label: 'Carton Plein', style: { bg: 'var(--color-qgreen-bg)', color: 'var(--color-qgreen-text)' } },
]

const RULE_OPTIONS: Array<{ id: MultiRule; label: string; description: string }> = [
  {
    id: 'sudden_death',
    label: 'Mort subite',
    description: 'Un numéro supplémentaire est tiré. Le premier carton validant la condition gagne. Compétitif et rapide.',
  },
  {
    id: 'share_lot',
    label: 'Partage',
    description: 'La valeur du lot est divisée entre tous les gagnants ex-aequo. Convivial, idéal pour les petits lots.',
  },
  {
    id: 'each_wins',
    label: 'Chacun gagne',
    description: 'Chaque gagnant reçoit un exemplaire du lot. Nécessite un stock > 1. Recommandé pour le carton plein.',
  },
  {
    id: 'redraw',
    label: 'Re-tirage',
    description: 'Le tirage repart de zéro pour ce lot uniquement. Rare — réservé aux cas litigieux avec validation arbitre.',
  },
]

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function RulesTable({ rules, onChange }: RulesTableProps) {
  return (
    <div className="flex flex-col gap-[12px]">

      {/* Table des règles */}
      <div
        className="rounded-[8px] overflow-hidden"
        style={{ border: '.5px solid var(--color-sep)' }}
      >
        {/* En-tête */}
        <div
          className="grid px-[12px] py-[7px]"
          style={{
            gridTemplateColumns: '120px 1fr',
            background: 'var(--color-bg)',
            borderBottom: '.5px solid var(--color-sep)',
          }}
        >
          {['Type de tirage', 'Règle en cas d\'ex-aequo'].map((h) => (
            <span
              key={h}
              className="font-bold uppercase tracking-[.08em]"
              style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Lignes */}
        {TIRAGE_TYPES.map((tt, i) => (
          <div
            key={tt.id}
            className="grid items-center px-[12px] py-[8px]"
            style={{
              gridTemplateColumns: '120px 1fr',
              borderBottom: i < TIRAGE_TYPES.length - 1 ? '.5px solid var(--color-sep)' : 'none',
            }}
          >
            {/* Badge type */}
            <span
              className="inline-block font-bold uppercase tracking-[.06em] rounded-[4px] px-[7px] py-[2px] w-fit"
              style={{ fontSize: 9, background: tt.style.bg, color: tt.style.color }}
            >
              {tt.label}
            </span>

            {/* Boutons règle */}
            <div className="flex gap-[4px] flex-wrap" role="group" aria-label={`Règle pour ${tt.label}`}>
              {RULE_OPTIONS.map((opt) => {
                const isOn = rules[tt.id] === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange(tt.id, opt.id)}
                    aria-pressed={isOn}
                    className={cn(
                      'rounded-[5px] px-[9px] py-[4px] font-bold cursor-pointer transition-all duration-[150ms]',
                    )}
                    style={{
                      fontSize: 10,
                      background: isOn ? '#0b1220' : 'var(--color-bg)',
                      color: isOn ? 'var(--color-amber)' : 'var(--color-text-secondary)',
                      border: isOn ? '.5px solid transparent' : '.5px solid var(--color-border)',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Explications */}
      <div className="grid gap-[8px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {RULE_OPTIONS.map((opt) => (
          <div
            key={opt.id}
            className="rounded-[7px] px-[11px] py-[9px]"
            style={{
              background: 'var(--color-bg)',
              border: '.5px solid var(--color-sep)',
            }}
          >
            <div
              className="font-bold mb-[4px]"
              style={{ fontSize: 11, color: 'var(--color-text-primary)' }}
            >
              {opt.label}
            </div>
            <div
              className="leading-[1.5]"
              style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
            >
              {opt.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
