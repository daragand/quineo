import type { ProviderId } from './ProviderGrid'
import type { RulesState } from './RulesTable'
import type { MultiRule, TirageType } from '@/types/session'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface SessionDraftSummary {
  name: string
  date: string
  lieu: string
  maxCartons: number
  slug: string
  providers: Record<ProviderId, boolean>
  maxCartonsPerPerson: number
  maxFreeCartons: number
  rules: RulesState
}

interface SessionSummaryPanelProps {
  draft: SessionDraftSummary
}

// ─────────────────────────────────────────
// Labels
// ─────────────────────────────────────────

const PROVIDER_LABELS: Record<ProviderId, string> = {
  cash:      'Espèces',
  cb:        'Terminal CB',
  stripe:    'Stripe',
  sumup:     'SumUp',
  helloasso: 'HelloAsso',
  free:      'Cartons offerts',
}

const PROVIDER_COLORS: Record<ProviderId, string> = {
  cash:      '#065F46',
  cb:        'var(--color-qblue)',
  stripe:    '#635BFF',
  sumup:     '#1DBF73',
  helloasso: '#E5007D',
  free:      '#7C3AED',
}

const RULE_LABELS: Record<MultiRule, string> = {
  sudden_death: 'Mort subite',
  share_lot:    'Partage',
  each_wins:    'Chacun gagne',
  redraw:       'Re-tirage',
}

const TYPE_LABELS: Record<TirageType, string> = {
  quine:        'Quine',
  double_quine: 'D. Quine',
  carton_plein: 'Carton plein',
}

// ─────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-[6px] mb-[4px]">
      <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', flexShrink: 0 }}>
        {label}
      </span>
      <span
        className="font-bold text-right"
        style={{ fontSize: 11, color: 'var(--color-text-primary)', wordBreak: 'break-word' }}
      >
        {value || '—'}
      </span>
    </div>
  )
}

function Sep() {
  return <div style={{ borderTop: '.5px solid var(--color-sep)', margin: '10px 0' }} />
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-bold uppercase tracking-[.08em] mb-[7px]"
      style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function SessionSummaryPanel({ draft }: SessionSummaryPanelProps) {
  const activeProviders = (Object.keys(draft.providers) as ProviderId[]).filter(
    (id) => draft.providers[id]
  )

  const formattedDate = draft.date
    ? new Date(draft.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : undefined

  return (
    <aside
      aria-label="Récapitulatif de la session"
      className="overflow-y-auto px-[14px] py-[14px]"
      style={{
        width: 220,
        flexShrink: 0,
        borderLeft: '.5px solid var(--color-sep)',
        background: 'var(--color-card)',
      }}
    >
      <div
        className="font-bold uppercase tracking-[.1em] mb-[10px]"
        style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
      >
        Récapitulatif
      </div>

      {/* Infos générales */}
      <Row label="Nom"          value={draft.name} />
      <Row label="Date"         value={formattedDate} />
      <Row label="Lieu"         value={draft.lieu} />
      <Row label="Cartons max"  value={draft.maxCartons ? String(draft.maxCartons) : undefined} />
      {draft.slug && (
        <div
          className="mt-[2px] mb-[4px] font-bold"
          style={{ fontSize: 10, color: 'var(--color-qblue)', wordBreak: 'break-all' }}
        >
          quineo.fr/s/{draft.slug}
        </div>
      )}

      <Sep />

      {/* Modes de vente */}
      <SectionTitle>Modes de vente</SectionTitle>
      {activeProviders.length === 0 ? (
        <div style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Aucun sélectionné</div>
      ) : (
        <div className="flex flex-col gap-[3px]">
          {activeProviders.map((id) => (
            <div
              key={id}
              className="flex items-center gap-[4px] font-bold rounded-[4px] px-[7px] py-[2px] w-fit"
              style={{
                fontSize: 10,
                background: `${PROVIDER_COLORS[id]}18`,
                color: PROVIDER_COLORS[id],
              }}
            >
              <span
                aria-hidden="true"
                className="rounded-full"
                style={{ width: 5, height: 5, background: PROVIDER_COLORS[id], display: 'block' }}
              />
              {PROVIDER_LABELS[id]}
            </div>
          ))}
        </div>
      )}

      <Sep />

      {/* Limite d'achat */}
      <SectionTitle>Limite achat</SectionTitle>
      <Row label="Max/personne" value={String(draft.maxCartonsPerPerson)} />
      <Row label="Offerts max"  value={String(draft.maxFreeCartons)} />

      <Sep />

      {/* Règles ex-aequo */}
      <SectionTitle>Règles ex-aequo</SectionTitle>
      <div className="flex flex-col">
        {(Object.keys(draft.rules) as TirageType[]).map((type, i) => (
          <div
            key={type}
            className="flex items-center justify-between py-[3px]"
            style={{
              borderBottom: i < 2 ? '.5px solid var(--color-sep)' : 'none',
            }}
          >
            <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
              {TYPE_LABELS[type]}
            </span>
            <span className="font-bold" style={{ fontSize: 10, color: 'var(--color-text-primary)' }}>
              {RULE_LABELS[draft.rules[type]]}
            </span>
          </div>
        ))}
      </div>
    </aside>
  )
}
