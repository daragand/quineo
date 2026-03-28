'use client'

import { useState, FormEvent } from 'react'
import { Metadata } from 'next'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Note: metadata export ne fonctionne pas dans un 'use client' — voir le generateMetadata
// en layout ou via un composant wrapper. Titre géré dans layout.

const SUBJECTS = [
  'Question sur le service',
  'Problème technique',
  'Facturation / abonnement',
  'Demande de démo',
  'Signalement RGPD',
  'Autre',
]

export default function ContactPage() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [sent,    setSent]    = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, subject, message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'envoi du message")
        return
      }
      setSent(true)
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1
        className="font-bold mb-2"
        style={{ fontSize: 26, color: 'var(--color-navy)', fontFamily: 'var(--font-display)' }}
      >
        Nous contacter
      </h1>
      <p className="mb-8" style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        Une question, un problème ou une suggestion ? Remplissez le formulaire ci-dessous,
        notre équipe vous répondra dans les plus brefs délais.
      </p>

      {sent ? (
        <div
          className="rounded-xl"
          style={{
            background: 'var(--color-qgreen-bg)',
            border:     '.5px solid rgba(59,109,17,.25)',
            padding:    '24px',
            textAlign:  'center',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
          <p className="font-bold" style={{ fontSize: 15, color: 'var(--color-qgreen-text)', marginBottom: 6 }}>
            Message envoyé !
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-qgreen-text)' }}>
            Merci pour votre message. Notre équipe vous répondra sous 48 h ouvrées.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl"
          style={{
            background: 'var(--color-card)',
            border:     '.5px solid var(--color-border)',
            padding:    '28px 24px',
            maxWidth:   600,
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-3">
              <Input
                label="Votre nom"
                type="text"
                autoComplete="name"
                placeholder="Jean Dupont"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="flex-1"
              />
              <Input
                label="Votre e-mail"
                type="email"
                autoComplete="email"
                placeholder="jean@association.fr"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1"
              />
            </div>

            {/* Sujet */}
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Sujet
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                style={{
                  padding:      '8px 12px',
                  borderRadius: 8,
                  border:       '.5px solid var(--color-border)',
                  background:   'var(--color-card)',
                  fontSize:     13,
                  color:        'var(--color-text-primary)',
                  outline:      'none',
                  cursor:       'pointer',
                }}
              >
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                minLength={10}
                maxLength={3000}
                rows={6}
                placeholder="Décrivez votre demande en détail…"
                style={{
                  padding:      '10px 12px',
                  borderRadius: 8,
                  border:       '.5px solid var(--color-border)',
                  background:   'var(--color-card)',
                  fontSize:     13,
                  color:        'var(--color-text-primary)',
                  resize:       'vertical',
                  outline:      'none',
                  lineHeight:   1.6,
                  fontFamily:   'var(--font-body)',
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--color-text-hint)', textAlign: 'right' }}>
                {message.length} / 3000
              </span>
            </div>

            {error && (
              <p role="alert" className="font-bold" style={{ fontSize: 11, color: 'var(--color-qred)' }}>
                {error}
              </p>
            )}

            <Button type="submit" fullWidth loading={loading}>
              Envoyer le message
            </Button>
          </form>
        </div>
      )}

      {/* Infos complémentaires */}
      <div
        className="mt-8 rounded-xl flex flex-col gap-4"
        style={{
          background: 'var(--color-card)',
          border:     '.5px solid var(--color-border)',
          padding:    '20px 24px',
          maxWidth:   600,
        }}
      >
        <p className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Autres moyens de nous joindre
        </p>
        <a
          href="mailto:contact@quineo.fr"
          style={{ fontSize: 13, color: 'var(--color-amber-deep)', fontWeight: 600, textDecoration: 'none' }}
        >
          contact@quineo.fr
        </a>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          Pour les questions RGPD : <strong>rgpd@quineo.fr</strong>
        </p>
      </div>
    </div>
  )
}
