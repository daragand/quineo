'use client'

import { useState, FormEvent } from 'react'
import { Input }  from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      // Toujours afficher le message de succès (anti-énumération)
      setSent(true)
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 380 }}>
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-1" style={{ color: 'var(--color-amber)' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="7" fill="var(--color-amber)" />
            <text x="14" y="20" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--color-amber-dark)">Q</text>
          </svg>
          <span className="font-bold tracking-tight" style={{ fontSize: 22, color: 'var(--color-text-primary)' }}>
            quineo
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Gestion de loto pour associations
        </p>
      </div>

      {/* Carte */}
      <div
        className="rounded-xl"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-border)', padding: '28px 24px' }}
      >
        {sent ? (
          <>
            <div
              className="flex items-center justify-center rounded-full mx-auto mb-4"
              style={{ width: 44, height: 44, background: 'rgba(72,187,120,.15)' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10l4 4 8-8" stroke="#48BB78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="font-bold text-center mb-3" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
              Email envoyé
            </h1>
            <p className="text-center" style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation valable <strong>1 heure</strong>.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-bold mb-2" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
              Mot de passe oublié
            </h1>
            <p className="mb-5" style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Renseignez votre adresse e-mail et nous vous enverrons un lien pour créer un nouveau mot de passe.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Adresse e-mail"
                type="email"
                autoComplete="email"
                placeholder="vous@association.fr"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                error={error ?? undefined}
              />
              <Button type="submit" fullWidth loading={loading}>
                Envoyer le lien
              </Button>
            </form>
          </>
        )}
      </div>

      <p className="text-center mt-5" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        <a href="/login" style={{ color: 'var(--color-amber-dark)', fontWeight: 600 }}>
          ← Retour à la connexion
        </a>
      </p>
    </div>
  )
}
