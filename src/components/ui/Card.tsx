import { cn } from '@/lib/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  /** Padding interne — défaut 'md' */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Section title optionnel */
  title?: string
  /** Contenu affiché à droite du title */
  headerRight?: React.ReactNode
}

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: 'p-0',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
}

export function Card({
  children,
  className,
  padding = 'md',
  title,
  headerRight,
}: CardProps) {
  return (
    <div
      className={cn('rounded-lg', className)}
      style={{
        background: 'var(--color-card)',
        border: '.5px solid var(--color-border)',
      }}
    >
      {title && (
        <div
          className="flex items-center justify-between px-4 pt-4 pb-3"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}
        >
          <h2
            className="font-bold uppercase tracking-[.1em]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
          >
            {title}
          </h2>
          {headerRight && (
            <div className="flex items-center gap-2">{headerRight}</div>
          )}
        </div>
      )}
      <div className={title ? cn(PADDING[padding]) : cn(PADDING[padding])}>
        {children}
      </div>
    </div>
  )
}
