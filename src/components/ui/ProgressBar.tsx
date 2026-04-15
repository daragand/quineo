import { cn } from '@/lib/cn'

type ProgressState = 'ok' | 'warn' | 'block'

interface ProgressBarProps {
  used: number
  max: number
  /** Surcharge la détection automatique de l'état */
  state?: ProgressState
  /** Affiche le titre et le sous-titre (mode "quota bar" complet) */
  showDetails?: boolean
  className?: string
}

// ─────────────────────────────────────────
// Seuils et styles par état
// ─────────────────────────────────────────

function computeState(used: number, max: number): ProgressState {
  const pct = max > 0 ? used / max : 0
  if (pct >= 1)    return 'block'
  if (pct >= 0.88) return 'warn'
  return 'ok'
}

const STATE_STYLES: Record<ProgressState, {
  dot:    string
  fill:   string
  label:  string
  nums:   string
  bg:     string
  border: string
  title:  string
  sub:    string
}> = {
  ok: {
    dot:    '#48BB78',
    fill:   '#2BBFA4',
    label:  'var(--color-qgreen-text)',
    nums:   'var(--color-qgreen-text)',
    bg:     'var(--color-qgreen-bg)',
    border: '#97C459',
    title:  'Cartons disponibles',
    sub:    (used: number, max: number) => `${max - used} carton${max - used > 1 ? 's' : ''} restant${max - used > 1 ? 's' : ''}`,
  } as never,
  warn: {
    dot:    'var(--color-amber)',
    fill:   'var(--color-amber)',
    label:  'var(--color-orange)',
    nums:   'var(--color-orange)',
    bg:     'var(--color-orange-bg)',
    border: 'var(--color-amber)',
    title:  'Approche de la limite',
    sub:    (used: number, max: number) => `Plus que ${max - used} carton${max - used > 1 ? 's' : ''} disponible${max - used > 1 ? 's' : ''}`,
  } as never,
  block: {
    dot:    '#E24B4A',
    fill:   '#E24B4A',
    label:  'var(--color-qred)',
    nums:   'var(--color-qred)',
    bg:     'var(--color-qred-bg)',
    border: '#F09595',
    title:  'Quota atteint',
    sub:    () => 'Aucun carton disponible',
  } as never,
}

const STATE_LABELS: Record<ProgressState, string> = {
  ok:    'Quota disponible',
  warn:  'Limite bientôt atteinte',
  block: 'Quota atteint',
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function ProgressBar({
  used,
  max,
  state: stateProp,
  showDetails = false,
  className,
}: ProgressBarProps) {
  const state   = stateProp ?? computeState(used, max)
  const pct     = max > 0 ? Math.min((used / max) * 100, 100) : 0
  const styles  = STATE_STYLES[state]
  const remaining = Math.max(max - used, 0)

  // ── Mode compact (inline) ──
  if (!showDetails) {
    return (
      <div
        className={cn('flex items-center gap-2 rounded-[7px] px-[10px] py-[8px]', className)}
        style={{
          background: styles.bg,
          border: `.5px solid ${styles.border}`,
        }}
        role="status"
        aria-label={`${STATE_LABELS[state]} : ${used} sur ${max} cartons`}
      >
        {/* Dot statut */}
        <span
          aria-hidden="true"
          className="flex-shrink-0 rounded-full"
          style={{ width: 7, height: 7, background: styles.dot }}
        />

        {/* Label textuel (jamais seulement la couleur) */}
        <span
          className="flex-1 font-bold"
          style={{ fontSize: 11, color: styles.label }}
        >
          {STATE_LABELS[state]}
        </span>

        {/* Barre */}
        <div
          aria-hidden="true"
          className="flex-1 rounded-[10px] overflow-hidden"
          style={{ height: 5, background: 'rgba(0,0,0,.08)', maxWidth: 80 }}
        >
          <div
            className="h-full rounded-[10px] transition-[width] duration-[400ms]"
            style={{ width: `${pct}%`, background: styles.fill }}
          />
        </div>

        {/* Chiffres */}
        <span
          className="font-display flex-shrink-0"
          style={{ fontSize: 15, color: styles.nums }}
          aria-hidden="true"
        >
          {used} / {max}
        </span>
      </div>
    )
  }

  // ── Mode détaillé (quota bar complète) ──
  const subFn = (styles as unknown as { sub: (u: number, m: number) => string }).sub
  const subLabel = typeof subFn === 'function'
    ? subFn(used, max)
    : `${remaining} restants`

  return (
    <div
      className={cn('flex items-center gap-3 rounded-[8px] px-[14px] py-[10px]', className)}
      style={{
        background: styles.bg,
        border: `.5px solid ${styles.border}`,
      }}
      role="status"
      aria-label={`${STATE_LABELS[state]} : ${used} sur ${max} cartons, ${remaining} restants`}
    >
      {/* Icône circulaire */}
      <div
        aria-hidden="true"
        className="flex-shrink-0 rounded-full flex items-center justify-center"
        style={{
          width: 28, height: 28,
          background: `${styles.dot}26`,
        }}
      >
        <span className="rounded-full" style={{ width: 8, height: 8, background: styles.dot, display: 'block' }} />
      </div>

      {/* Texte + barre */}
      <div className="flex-1 min-w-0">
        <div className="font-bold" style={{ fontSize: 12, color: styles.label }}>
          {styles.title}
        </div>
        <div style={{ fontSize: 11, color: styles.label, marginTop: 1, opacity: .8 }}>
          {subLabel}
        </div>
        <div
          aria-hidden="true"
          className="rounded-[10px] overflow-hidden mt-[5px]"
          style={{ height: 6, background: 'rgba(0,0,0,.06)' }}
        >
          <div
            className="h-full rounded-[10px] transition-[width] duration-[400ms]"
            style={{ width: `${pct}%`, background: styles.fill }}
          />
        </div>
      </div>

      {/* Chiffres */}
      <div
        className="font-display flex-shrink-0"
        style={{ fontSize: 16, color: styles.nums }}
        aria-hidden="true"
      >
        {used} / {max}
      </div>
    </div>
  )
}
