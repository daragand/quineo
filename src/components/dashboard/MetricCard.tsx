import { cn } from '@/lib/cn'

interface MetricCardProps {
  label: string
  value: string
  /** Texte secondaire sous la valeur */
  sub?: string
  /** Badge coloré (ex: "+14 % vs dernière session") */
  badge?: { text: string; variant: 'green' | 'red' | 'amber' | 'blue' }
  /** Barre de progression 0-100 */
  progress?: number
  /** Contenu libre à la place de value (ex: indicateur en cours) */
  children?: React.ReactNode
  className?: string
}

const BADGE_STYLES: Record<NonNullable<MetricCardProps['badge']>['variant'], { bg: string; color: string }> = {
  green: { bg: 'var(--color-qgreen-bg)',   color: 'var(--color-qgreen-text)' },
  red:   { bg: 'var(--color-qred-bg)',     color: 'var(--color-qred)' },
  amber: { bg: 'var(--color-orange-bg)',   color: 'var(--color-orange)' },
  blue:  { bg: 'var(--color-qblue-bg)',    color: 'var(--color-qblue)' },
}

export function MetricCard({
  label,
  value,
  sub,
  badge,
  progress,
  children,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn('rounded-[9px] px-[15px] py-[13px]', className)}
      style={{
        background: 'var(--color-card)',
        border: '.5px solid var(--color-border)',
      }}
    >
      <div
        className="font-bold"
        style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 5 }}
      >
        {label}
      </div>

      {children ?? (
        <div
          className="font-display leading-none"
          style={{ fontSize: 28, color: 'var(--color-text-primary)', letterSpacing: '.02em' }}
        >
          {value}
        </div>
      )}

      {progress !== undefined && (
        <div
          aria-hidden="true"
          className="rounded-[4px] overflow-hidden mt-[5px]"
          style={{ height: 6, background: 'var(--color-bg)' }}
        >
          <div
            className="h-full rounded-[4px] transition-[width] duration-[400ms]"
            style={{ width: `${Math.min(progress, 100)}%`, background: 'var(--color-amber)' }}
          />
        </div>
      )}

      {badge && (
        <span
          className="inline-flex items-center font-bold mt-1 rounded-[4px] px-[7px] py-[2px]"
          style={{
            fontSize: 10,
            background: BADGE_STYLES[badge.variant].bg,
            color: BADGE_STYLES[badge.variant].color,
          }}
        >
          {badge.text}
        </span>
      )}

      {sub && !badge && (
        <div style={{ fontSize: 10, color: 'var(--color-text-hint)', marginTop: 3 }}>
          {sub}
        </div>
      )}
    </div>
  )
}
