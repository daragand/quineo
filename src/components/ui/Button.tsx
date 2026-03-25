import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize    = 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

// Styles par variante (pas de couleur hardcodée → CSS vars / tokens)
const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-amber)',
    color:      'var(--color-amber-dark)',
    border:     'none',
    fontWeight: 700,
  },
  secondary: {
    background: 'transparent',
    color:      'var(--color-text-secondary)',
    border:     '.5px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color:      'var(--color-text-muted)',
    border:     'none',
  },
  danger: {
    background: 'var(--color-qred)',
    color:      'white',
    border:     'none',
    fontWeight: 700,
  },
}

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { fontSize: 11, padding: '5px 12px', borderRadius: 6 },
  md: { fontSize: 12, padding: '8px 16px', borderRadius: 8 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'cursor-pointer transition-[opacity,background] duration-[150ms]',
        'font-body select-none',
        fullWidth && 'w-full',
        isDisabled && 'opacity-35 cursor-not-allowed',
        className
      )}
      style={{
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        ...style,
      }}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="inline-block rounded-full flex-shrink-0 animate-spin"
          style={{
            width: 12, height: 12,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
          }}
        />
      )}
      {loading ? 'Chargement…' : children}
    </button>
  )
}
