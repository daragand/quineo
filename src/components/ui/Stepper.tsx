'use client'

import { cn } from '@/lib/cn'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label: string
  /** Affiché sous le stepper */
  hint?: string
  disabled?: boolean
  className?: string
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max,
  label,
  hint,
  disabled = false,
  className,
}: StepperProps) {
  const canDecrement = !disabled && value > min
  const canIncrement = !disabled && (max === undefined || value < max)

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className="flex items-center overflow-hidden"
        style={{
          background: 'var(--color-bg)',
          border: '.5px solid var(--color-border)',
          borderRadius: 8,
        }}
        role="group"
        aria-label={label}
      >
        {/* Bouton décrémenter */}
        <button
          type="button"
          onClick={() => canDecrement && onChange(value - 1)}
          disabled={!canDecrement}
          aria-label={`Diminuer ${label}`}
          className={cn(
            'flex items-center justify-center transition-colors duration-[100ms]',
            canDecrement ? 'cursor-pointer hover:bg-black/[.06]' : 'cursor-not-allowed opacity-40'
          )}
          style={{ width: 34, height: 34, border: 'none', background: 'transparent' }}
        >
          <MinusIcon style={{ width: 12, height: 12, color: 'var(--color-text-secondary)' }} aria-hidden="true" />
        </button>

        {/* Valeur */}
        <output
          aria-live="polite"
          aria-label={`${label} : ${value}`}
          className="font-display text-center select-none"
          style={{
            minWidth: 32,
            fontSize: 15,
            color: 'var(--color-text-primary)',
            letterSpacing: '.03em',
          }}
        >
          {value}
        </output>

        {/* Bouton incrémenter */}
        <button
          type="button"
          onClick={() => canIncrement && onChange(value + 1)}
          disabled={!canIncrement}
          aria-label={`Augmenter ${label}`}
          className={cn(
            'flex items-center justify-center transition-colors duration-[100ms]',
            canIncrement ? 'cursor-pointer hover:bg-black/[.06]' : 'cursor-not-allowed opacity-40'
          )}
          style={{ width: 34, height: 34, border: 'none', background: 'transparent' }}
        >
          <PlusIcon style={{ width: 12, height: 12, color: 'var(--color-text-secondary)' }} aria-hidden="true" />
        </button>
      </div>

      {hint && (
        <span
          className="text-center"
          style={{ fontSize: 9, color: 'var(--color-text-hint)' }}
        >
          {hint}
        </span>
      )}
    </div>
  )
}
