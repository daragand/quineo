'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function DisplayLandingPage() {
  const router  = useRouter()
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error,  setError]  = useState('')
  const [loading, setLoading] = useState(false)
  const inputs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  function handleChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = cleaned
    setDigits(next)
    setError('')

    if (cleaned && index < 3) {
      inputs[index + 1].current?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs[index - 1].current?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (!text) return
    const next = ['', '', '', '']
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setDigits(next)
    inputs[Math.min(text.length, 3)].current?.focus()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 4) { setError('Saisissez les 4 chiffres du code.'); return }

    setLoading(true); setError('')
    const res = await fetch(`/api/public/display/find/${code}`)
    setLoading(false)

    if (!res.ok) {
      setError('Code introuvable. Vérifiez le code communiqué par l\'organisateur.')
      inputs[0].current?.focus()
      setDigits(['', '', '', ''])
      return
    }

    const data = await res.json()
    router.push(`/display/${data.sessionId}`)
  }

  const code = digits.join('')

  return (
    <div
      data-theme="dark"
      style={{
        minHeight:      '100vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'var(--color-bg)',
        fontFamily:     'var(--font-body)',
        padding:        '24px',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-[48px]">
        <div
          className="font-display flex items-center justify-center"
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--color-amber)',
            color: '#412402', fontSize: 20,
          }}
          aria-hidden="true"
        >
          Q
        </div>
        <span
          className="font-display"
          style={{ fontSize: 28, color: '#fff', letterSpacing: '.04em' }}
        >
          Quinova
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          width:        '100%',
          maxWidth:     360,
          background:   'var(--color-card)',
          borderRadius: 'var(--radius-xl)',
          border:       '.5px solid var(--color-border)',
          padding:      '32px 28px',
        }}
      >
        <h1
          className="font-display text-center"
          style={{ fontSize: 26, color: 'var(--color-text-primary)', marginBottom: 8, letterSpacing: '.03em' }}
        >
          Suivre le loto
        </h1>
        <p
          className="text-center"
          style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 32 }}
        >
          Saisissez le code à 4 chiffres<br />communiqué par l&apos;organisateur.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Saisie 4 chiffres */}
          <div
            className="flex justify-center gap-[10px]"
            style={{ marginBottom: 24 }}
            role="group"
            aria-label="Code de diffusion à 4 chiffres"
          >
            {digits.map((d, i) => (
              <input
                key={i}
                ref={inputs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                aria-label={`Chiffre ${i + 1} du code`}
                style={{
                  width: 64, height: 72,
                  textAlign:    'center',
                  fontSize:     32,
                  fontFamily:   'var(--font-display)',
                  fontWeight:   700,
                  borderRadius: 'var(--radius-md)',
                  border:       `.5px solid ${d ? 'var(--color-amber)' : 'var(--color-border)'}`,
                  background:   'var(--color-bg)',
                  color:        'var(--color-text-primary)',
                  outline:      'none',
                  caretColor:   'var(--color-amber)',
                  transition:   'border-color var(--transition-fast)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-amber)' }}
                onBlur={(e)  => { e.target.style.borderColor = d ? 'var(--color-amber)' : 'var(--color-border)' }}
              />
            ))}
          </div>

          {/* Erreur */}
          {error && (
            <p
              role="alert"
              style={{
                fontSize:    12,
                color:       'var(--color-qred)',
                textAlign:   'center',
                marginBottom: 16,
              }}
            >
              {error}
            </p>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading || code.length < 4}
            className="w-full font-bold rounded-[10px] py-[13px] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontSize:   14,
              background: 'var(--color-amber)',
              color:      '#5C3A00',
              border:     'none',
              fontFamily: 'var(--font-body)',
              cursor:     code.length < 4 ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Recherche…' : 'Rejoindre le loto →'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
        Quinova — Gestion de loto pour associations
      </p>
    </div>
  )
}
