import { cn } from '@/lib/cn'

// ─────────────────────────────────────────
// Input texte standardisé
// ─────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  /** Texte affiché à gauche dans un bloc séparé (ex: "quinova.fr/s/") */
  prefix?: string
}

export function Input({
  label,
  hint,
  error,
  prefix,
  id,
  className,
  style,
  ...rest
}: InputProps) {
  const inputId    = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const errorId    = error ? `${inputId}-error` : undefined
  const hintId     = hint  ? `${inputId}-hint`  : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  const inputStyle: React.CSSProperties = {
    fontSize: 12,
    padding: '8px 11px',
    border: '.5px solid var(--color-border)',
    borderRadius: 7,
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text-primary)',
    background: 'var(--color-card)',
    outline: 'none',
    width: '100%',
    transition: 'border-color var(--transition-fast)',
    ...style,
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="font-bold"
          style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
        >
          {label}
        </label>
      )}

      {prefix ? (
        /* Input avec préfixe */
        <div
          className="flex items-center overflow-hidden"
          style={{
            border: `.5px solid ${error ? 'var(--color-qred)' : 'var(--color-border)'}`,
            borderRadius: 7,
            background: 'var(--color-card)',
            transition: 'border-color var(--transition-fast)',
          }}
          // focus-within géré par CSS global si besoin
        >
          <div
            className="flex-shrink-0 flex items-center"
            style={{
              padding: '0 10px',
              height: 36,
              fontSize: 11,
              color: 'var(--color-text-muted)',
              background: 'var(--color-bg)',
              borderRight: '.5px solid var(--color-border)',
              whiteSpace: 'nowrap',
            }}
            aria-hidden="true"
          >
            {prefix}
          </div>
          <input
            {...rest}
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : undefined}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 12,
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              padding: '0 10px',
              height: 36,
            }}
          />
        </div>
      ) : (
        <input
          {...rest}
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : undefined}
          style={{
            ...inputStyle,
            borderColor: error ? 'var(--color-qred)' : undefined,
          }}
        />
      )}

      {hint && !error && (
        <span
          id={hintId}
          style={{ fontSize: 10, color: 'var(--color-text-muted)' }}
        >
          {hint}
        </span>
      )}

      {error && (
        <span
          id={errorId}
          role="alert"
          className="font-bold"
          style={{ fontSize: 10, color: 'var(--color-qred)' }}
        >
          {error}
        </span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Textarea
// ─────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  style,
  ...rest
}: TextareaProps) {
  const inputId    = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const errorId    = error ? `${inputId}-error` : undefined
  const describedBy = errorId ?? undefined

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="font-bold"
          style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
        >
          {label}
        </label>
      )}

      <textarea
        {...rest}
        id={inputId}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : undefined}
        style={{
          fontSize: 12,
          padding: '8px 11px',
          border: `.5px solid ${error ? 'var(--color-qred)' : 'var(--color-border)'}`,
          borderRadius: 7,
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-primary)',
          background: 'var(--color-card)',
          outline: 'none',
          width: '100%',
          minHeight: 68,
          resize: 'vertical',
          lineHeight: 1.5,
          transition: 'border-color var(--transition-fast)',
          ...style,
        }}
      />

      {hint && !error && (
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{hint}</span>
      )}

      {error && (
        <span
          id={errorId}
          role="alert"
          className="font-bold"
          style={{ fontSize: 10, color: 'var(--color-qred)' }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
