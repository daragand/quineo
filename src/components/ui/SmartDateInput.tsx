'use client'

import { useState, useRef } from 'react'

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function validate(day: number, month: number, year: number): string | null {
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return null
  const iso = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const dt  = new Date(iso)
  if (isNaN(dt.getTime())) return null
  // Vérifier que la date n'a pas subi de débordement (ex: 31/02)
  if (dt.getFullYear() !== year || dt.getMonth() + 1 !== month || dt.getDate() !== day) return null
  return iso
}

function parseToIso(raw: string): string | null {
  raw = raw.trim()
  if (!raw) return null

  // Format avec slashs : DD/MM/AAAA ou DD/MM/AA
  if (raw.includes('/')) {
    const parts = raw.split('/')
    if (parts.length !== 3) return null
    const day   = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    let   year  = parseInt(parts[2], 10)
    if (parts[2].length === 2) {
      const currentYY = new Date().getFullYear() % 100
      year = year <= currentYY ? 2000 + year : 1900 + year
    }
    return validate(day, month, year)
  }

  // Chiffres uniquement : JJMMAA (6) ou JJMMAAAA (8)
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 6) {
    const day   = parseInt(digits.slice(0, 2), 10)
    const month = parseInt(digits.slice(2, 4), 10)
    const yy    = parseInt(digits.slice(4, 6), 10)
    const currentYY = new Date().getFullYear() % 100
    const year = yy <= currentYY ? 2000 + yy : 1900 + yy
    return validate(day, month, year)
  }
  if (digits.length === 8) {
    const day   = parseInt(digits.slice(0, 2), 10)
    const month = parseInt(digits.slice(2, 4), 10)
    const year  = parseInt(digits.slice(4, 8), 10)
    return validate(day, month, year)
  }

  return null
}

export function isoToDisplay(iso: string): string {
  if (!iso || !iso.includes('-')) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

interface SmartDateInputProps {
  value:        string    // ISO YYYY-MM-DD ou ''
  onChange:     (iso: string) => void
  required?:    boolean
  placeholder?: string
  inputStyle?:  React.CSSProperties
  className?:   string    // classes appliquées à l'input texte
}

export function SmartDateInput({
  value,
  onChange,
  required,
  placeholder = 'JJ/MM/AAAA',
  inputStyle,
  className,
}: SmartDateInputProps) {
  const [display,  setDisplay]  = useState(() => isoToDisplay(value))
  const [invalid,  setInvalid]  = useState(false)
  const [showTip,  setShowTip]  = useState(false)
  const pickerRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplay(e.target.value)
    setInvalid(false)
  }

  function handleBlur() {
    if (!display.trim()) {
      setInvalid(false)
      onChange('')
      return
    }
    const iso = parseToIso(display)
    if (iso) {
      setInvalid(false)
      setDisplay(isoToDisplay(iso))
      onChange(iso)
    } else {
      setInvalid(true)
    }
  }

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const iso = e.target.value
    if (iso) {
      setDisplay(isoToDisplay(iso))
      setInvalid(false)
      onChange(iso)
    }
  }

  const borderColor = invalid ? 'var(--color-qred)' : (inputStyle?.border ? undefined : 'var(--color-border)')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>

      {/* Champ texte */}
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        aria-required={required}
        aria-invalid={invalid}
        className={className}
        style={{
          flex: 1,
          minWidth: 0,
          ...inputStyle,
          ...(invalid ? { border: '.5px solid var(--color-qred)' } : {}),
          ...(borderColor && !invalid ? { border: `.5px solid ${borderColor}` } : {}),
        }}
      />

      {/* Bouton calendrier */}
      <button
        type="button"
        onClick={() => pickerRef.current?.showPicker?.()}
        title="Ouvrir le calendrier"
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          width:          26,
          height:         26,
          background:     'none',
          border:         'none',
          cursor:         'pointer',
          color:          'var(--color-text-secondary)',
          borderRadius:   5,
          padding:        0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M5 1v3M11 1v3M1 7h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Bouton info + tooltip */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          type="button"
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
          onFocus={() => setShowTip(true)}
          onBlur={() => setShowTip(false)}
          aria-label="Aide sur le format de saisie de la date"
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          22,
            height:         22,
            background:     'none',
            border:         'none',
            cursor:         'default',
            color:          'var(--color-text-hint)',
            padding:        0,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M8 7.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="8" cy="5.5" r="0.9" fill="currentColor"/>
          </svg>
        </button>

        {showTip && (
          <div
            role="tooltip"
            style={{
              position:   'absolute',
              bottom:     'calc(100% + 6px)',
              right:      0,
              zIndex:     200,
              background: '#1a2236',
              color:      '#e8edf5',
              fontSize:   11,
              lineHeight: 1.6,
              padding:    '8px 12px',
              borderRadius: 7,
              whiteSpace: 'nowrap',
              boxShadow:  '0 4px 20px rgba(0,0,0,.3)',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: '.06em', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase' }}>
              Formats acceptés
            </span>
            <br/>
            <span style={{ color: '#F6AD55' }}>010180</span>
            {' '}→ 01/01/1980
            <br/>
            <span style={{ color: '#F6AD55' }}>030404</span>
            {' '}→ 03/04/2004
            <br/>
            <span style={{ color: '#F6AD55' }}>01/01/1980</span>
            {' '}ou via le calendrier
          </div>
        )}
      </div>

      {/* Input date natif masqué pour le picker */}
      <input
        ref={pickerRef}
        type="date"
        value={value || ''}
        onChange={handlePickerChange}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position:      'absolute',
          opacity:       0,
          pointerEvents: 'none',
          width:         1,
          height:        1,
          overflow:      'hidden',
        }}
      />
    </div>
  )
}
