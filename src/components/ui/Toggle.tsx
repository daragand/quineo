'use client'

import { cn } from '@/lib/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  /** Description secondaire sous le label */
  description?: string
  disabled?: boolean
  /** Mode "row" — affiche label + description à gauche, toggle à droite */
  row?: boolean
  id?: string
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  row = false,
  id,
}: ToggleProps) {
  const toggleId = id ?? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`

  const handleClick = () => {
    if (!disabled) onChange(!checked)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  const track = (
    <button
      type="button"
      role="switch"
      id={toggleId}
      aria-checked={checked}
      aria-label={row ? undefined : label}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        'relative flex-shrink-0 cursor-pointer transition-colors duration-[200ms]',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
      style={{
        width: 34,
        height: 19,
        borderRadius: 20,
        background: checked ? 'var(--color-qblue)' : 'var(--color-text-hint)',
        border: 'none',
        padding: 0,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute top-[2px] left-[2px] rounded-full bg-white transition-transform duration-[200ms]"
        style={{
          width: 15,
          height: 15,
          transform: checked ? 'translateX(15px)' : 'translateX(0)',
        }}
      />
    </button>
  )

  if (!row) return track

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-[11px] py-[9px] rounded-[7px] transition-colors duration-[150ms]',
        checked
          ? 'border'
          : 'border'
      )}
      style={{
        background: checked ? 'var(--color-qblue-bg)' : 'var(--color-bg)',
        borderColor: checked ? 'rgba(24,95,165,.2)' : 'var(--color-border-light)',
        borderStyle: 'solid',
        borderWidth: '.5px',
      }}
    >
      <label
        htmlFor={toggleId}
        className="flex-1 min-w-0 cursor-pointer select-none"
      >
        <div
          className="font-bold"
          style={{ fontSize: 12, color: 'var(--color-text-primary)' }}
        >
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>
            {description}
          </div>
        )}
      </label>
      {track}
    </div>
  )
}
