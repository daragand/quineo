import { cn } from '@/lib/cn'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  hint?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  id,
  className,
  style,
  ...rest
}: SelectProps) {
  const selectId  = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const errorId   = error ? `${selectId}-error` : undefined
  const describedBy = errorId ?? undefined

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="font-bold"
          style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
        >
          {label}
        </label>
      )}

      {/* Wrapper pour l'icône chevron */}
      <div className="relative">
        <select
          {...rest}
          id={selectId}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : undefined}
          style={{
            fontSize: 12,
            padding: '8px 32px 8px 11px',
            border: `.5px solid ${error ? 'var(--color-qred)' : 'var(--color-border)'}`,
            borderRadius: 7,
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-primary)',
            background: 'var(--color-card)',
            outline: 'none',
            width: '100%',
            appearance: 'none',
            cursor: 'pointer',
            transition: 'border-color var(--transition-fast)',
            ...style,
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDownIcon
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 12,
            height: 12,
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }}
        />
      </div>

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
