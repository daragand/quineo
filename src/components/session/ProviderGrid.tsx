'use client'

import { cn } from '@/lib/cn'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type ProviderId = 'cash' | 'cb' | 'stripe' | 'sumup' | 'helloasso' | 'free'

interface ProviderDef {
  id: ProviderId
  name: string
  sub: string
  /** null = non configuré, 'cfg' = configuré, 'nocfg' = manquant */
  badge: 'cfg' | 'nocfg' | null
}

interface ProviderGridProps {
  enabled: Record<ProviderId, boolean>
  onChange: (id: ProviderId, value: boolean) => void
}

// ─────────────────────────────────────────
// Config statique des providers
// ─────────────────────────────────────────

const PROVIDERS: ProviderDef[] = [
  { id: 'cash',      name: 'Espèces',          sub: 'Vente sur place · confirmation manuelle', badge: 'cfg'   },
  { id: 'cb',        name: 'Terminal CB',       sub: 'SumUp Air, Zettle, Square…',              badge: 'cfg'   },
  { id: 'stripe',    name: 'Stripe en ligne',   sub: 'Carte bancaire · webhook auto',           badge: 'cfg'   },
  { id: 'sumup',     name: 'SumUp en ligne',    sub: 'Lien de paiement SumUp',                  badge: 'cfg'   },
  { id: 'helloasso', name: 'HelloAsso',         sub: 'Remb. manuel · back-office HelloAsso',    badge: 'nocfg' },
  { id: 'free',      name: 'Cartons offerts',   sub: 'Attribution gratuite · motif requis',     badge: 'nocfg' },
]

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function ProviderGrid({ enabled, onChange }: ProviderGridProps) {
  return (
    <div
      className="grid gap-[7px]"
      style={{ gridTemplateColumns: '1fr 1fr' }}
      role="group"
      aria-label="Modes de vente autorisés"
    >
      {PROVIDERS.map((p) => {
        const isOn = enabled[p.id]
        const isConfigured = p.badge === 'cfg'

        return (
          <button
            key={p.id}
            type="button"
            role="switch"
            aria-checked={isOn}
            aria-label={`${p.name} — ${p.sub}`}
            onClick={() => onChange(p.id, !isOn)}
            className={cn(
              'text-left rounded-[8px] px-[10px] py-[8px] cursor-pointer transition-all duration-[150ms]',
              !isConfigured && isOn && 'opacity-70'
            )}
            style={{
              background: isOn ? 'var(--color-qblue-bg)' : 'var(--color-card)',
              border: `.5px solid ${isOn ? 'var(--color-qblue)' : 'var(--color-border)'}`,
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-[7px] mb-[3px]">
              <span
                aria-hidden="true"
                className="rounded-full flex-shrink-0"
                style={{
                  width: 8, height: 8,
                  background: isOn ? 'var(--color-qblue)' : 'var(--color-text-hint)',
                  display: 'block',
                }}
              />
              <span
                className="font-bold flex-1"
                style={{ fontSize: 11, color: 'var(--color-text-primary)' }}
              >
                {p.name}
              </span>
              {/* Badge */}
              {p.badge && (
                <span
                  className="font-bold rounded-[3px] px-[6px] py-[1px]"
                  style={{
                    fontSize: 9,
                    background: isConfigured ? 'var(--color-qgreen-bg)'  : 'var(--color-bg)',
                    color:      isConfigured ? 'var(--color-qgreen-text)' : 'var(--color-text-hint)',
                  }}
                >
                  {isConfigured ? 'Configuré' : 'Non configuré'}
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
              {p.sub}
            </div>
          </button>
        )
      })}
    </div>
  )
}
