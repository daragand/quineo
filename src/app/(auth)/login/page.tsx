'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const from         = searchParams.get('from') ?? '/dashboard'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Identifiants incorrects')
        return
      }

      router.push(from.startsWith('/') ? from : '/dashboard')
      router.refresh()
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 380 }}>
      {/* Logo / marque */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 mb-1"
          style={{ color: 'var(--color-amber)' }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="7" fill="var(--color-amber)" />
            <text x="14" y="20" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--color-amber-dark)">Q</text>
          </svg>
          <span
            className="font-bold tracking-tight"
            style={{ fontSize: 22, color: 'var(--color-text-primary)' }}
          >
            quinova
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Gestion de loto pour associations
        </p>
      </div>

      {/* Carte */}
      <div
        className="rounded-xl"
        style={{
          background: 'var(--color-card)',
          border:     '.5px solid var(--color-border)',
          padding:    '28px 24px',
        }}
      >
        <h1
          className="font-bold mb-5"
          style={{ fontSize: 15, color: 'var(--color-text-primary)' }}
        >
          Connexion
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Adresse e-mail"
            type="email"
            autoComplete="email"
            placeholder="vous@association.fr"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <div>
            <Input
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              error={error ?? undefined}
            />
            <div className="text-right mt-1">
              <a
                href="/forgot-password"
                style={{ fontSize: 11, color: 'var(--color-amber-dark)', fontWeight: 600 }}
              >
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <Button type="submit" fullWidth loading={loading} style={{ marginTop: 4 }}>
            Se connecter
          </Button>
        </form>
      </div>

      {/* Lien inscription */}
      <p className="text-center mt-5" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        Pas encore de compte ?{' '}
        <a
          href="/register"
          style={{ color: 'var(--color-amber-dark)', fontWeight: 600 }}
        >
          Créer une association
        </a>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
