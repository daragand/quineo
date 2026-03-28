'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()

  const [assocName,    setAssocName]    = useState('')
  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [cguAccepted,  setCguAccepted]  = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [fieldError,   setFieldError]   = useState<Record<string, string>>({})
  const [loading,      setLoading]      = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldError({})

    if (!cguAccepted) {
      setError("Vous devez accepter les conditions générales d'utilisation pour continuer.")
      return
    }
    if (password !== confirm) {
      setFieldError({ confirm: 'Les mots de passe ne correspondent pas' })
      return
    }
    if (password.length < 8) {
      setFieldError({ password: 'Au moins 8 caractères requis' })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          assoc_name: assocName,
          first_name: firstName,
          last_name:  lastName,
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la création du compte')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-1">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="7" fill="var(--color-amber)" />
            <text x="14" y="20" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--color-amber-dark)">Q</text>
          </svg>
          <span className="font-bold tracking-tight" style={{ fontSize: 22, color: 'var(--color-text-primary)' }}>
            quineo
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Créez votre espace association
        </p>
      </div>

      <div
        className="rounded-xl"
        style={{
          background: 'var(--color-card)',
          border:     '.5px solid var(--color-border)',
          padding:    '28px 24px',
        }}
      >
        <h1 className="font-bold mb-5" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
          Créer un compte
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Section association */}
          <div className="flex flex-col gap-3">
            <p className="font-bold uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
              Votre association
            </p>
            <Input
              label="Nom de l'association"
              type="text"
              autoComplete="organization"
              placeholder="Amicale des Pêcheurs de Saintes"
              value={assocName}
              onChange={e => setAssocName(e.target.value)}
              required
            />
          </div>

          {/* Séparateur */}
          <div style={{ borderTop: '.5px solid var(--color-sep)' }} />

          {/* Section compte admin */}
          <div className="flex flex-col gap-3">
            <p className="font-bold uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
              Compte administrateur
            </p>

            <div className="flex gap-3">
              <Input
                label="Prénom"
                type="text"
                autoComplete="given-name"
                placeholder="Jean"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                className="flex-1"
              />
              <Input
                label="Nom"
                type="text"
                autoComplete="family-name"
                placeholder="Dupont"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                className="flex-1"
              />
            </div>

            <Input
              label="Adresse e-mail"
              type="email"
              autoComplete="email"
              placeholder="jean.dupont@association.fr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              error={fieldError.password}
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              error={fieldError.confirm}
            />
          </div>

          {/* Acceptation CGU */}
          <label
            className="flex items-start gap-2 cursor-pointer"
            style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}
          >
            <input
              type="checkbox"
              checked={cguAccepted}
              onChange={e => setCguAccepted(e.target.checked)}
              style={{ marginTop: 2, flexShrink: 0, accentColor: 'var(--color-amber)' }}
            />
            <span>
              J&apos;ai lu et j&apos;accepte les{' '}
              <a
                href="/cgu"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-amber-deep)', fontWeight: 600, textDecoration: 'underline' }}
              >
                conditions générales d&apos;utilisation
              </a>{' '}
              et la{' '}
              <a
                href="/confidentialite"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-amber-deep)', fontWeight: 600, textDecoration: 'underline' }}
              >
                politique de confidentialité
              </a>
              .
            </span>
          </label>

          {error && (
            <p
              role="alert"
              className="font-bold"
              style={{ fontSize: 11, color: 'var(--color-qred)' }}
            >
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading} disabled={!cguAccepted}>
            Créer mon compte
          </Button>
        </form>
      </div>

      <p className="text-center mt-5" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        Déjà un compte ?{' '}
        <a href="/login" style={{ color: 'var(--color-amber-dark)', fontWeight: 600 }}>
          Se connecter
        </a>
      </p>
    </div>
  )
}
