'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input }  from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') ?? ''

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Lien invalide ou expiré')
        return
      }

      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
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
        {!token ? (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Lien invalide. Veuillez refaire une demande de réinitialisation.
          </p>
        ) : done ? (
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
              Mot de passe mis à jour
            </h1>
            <p className="text-center" style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Votre mot de passe a été modifié. Vous allez être redirigé vers la page de connexion…
            </p>
          </>
        ) : (
          <>
            <h1 className="font-bold mb-5" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
              Nouveau mot de passe
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Nouveau mot de passe"
                type="password"
                autoComplete="new-password"
                placeholder="8 caractères minimum"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirmer le mot de passe"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                error={error ?? undefined}
              />
              <Button type="submit" fullWidth loading={loading} style={{ marginTop: 4 }}>
                Enregistrer le mot de passe
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
