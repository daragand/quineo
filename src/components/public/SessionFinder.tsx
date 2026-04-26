'use client'

import { useState } from 'react'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface OpenSession {
  slug: string
  code: string
  name: string
  association: string
  lieu: string
  date: string
  minPrice: number
}

interface SessionFinderProps {
  openSessions?: OpenSession[]
  onNavigate: (slug: string) => void
}

// ─────────────────────────────────────────
// Données de démo
// ─────────────────────────────────────────

const DEMO_SESSIONS: OpenSession[] = [
  {
    slug:        'grand-loto-printemps-2025',
    code:        'LPRI25',
    name:        'Grand Loto de Printemps 2025',
    association: 'Amis du Quartier',
    lieu:        'Lyon 3e',
    date:        '22 mars',
    minPrice:    3,
  },
]

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function SessionFinder({
  openSessions = DEMO_SESSIONS,
  onNavigate,
}: SessionFinderProps) {
  const [code, setCode]   = useState('')
  const [url, setUrl]     = useState('')
  const [error, setError] = useState('')

  function handleCodeSearch() {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    const found = openSessions.find((s) => s.code === trimmed)
    if (found) {
      setError('')
      onNavigate(found.slug)
    } else {
      setError(`Aucune session trouvée pour le code « ${trimmed} »`)
    }
  }

  function handleUrlSearch() {
    const trimmed = url.trim()
    // Extraire le slug de l'URL
    const match = trimmed.match(/\/s\/([a-z0-9-]+)\/?$/)
    const slug = match?.[1] ?? trimmed
    onNavigate(slug)
  }

  return (
    <div className="text-center px-[20px] py-[32px] pb-[24px]">
      {/* Titre */}
      <div
        className="font-display leading-[1.05] mb-[8px]"
        style={{ fontSize: 40, color: 'var(--color-text-primary)' }}
      >
        Achetez vos cartons en ligne
      </div>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 28 }}>
        Entrez le code de votre session ou l&apos;URL partagée
      </p>

      {/* Carte de recherche */}
      <div
        className="rounded-[12px] mx-auto mb-[20px] px-[24px] py-[22px] text-left"
        style={{
          background: 'var(--color-card)',
          border:     '.5px solid var(--color-sep)',
          maxWidth:   440,
        }}
      >
        {/* Recherche par code */}
        <div
          className="font-bold mb-[8px]"
          style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}
        >
          Code de session
        </div>
        <div className="flex gap-[8px] mb-[8px]">
          <input
            type="text"
            maxLength={8}
            placeholder="ex : LPRI25"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleCodeSearch()}
            aria-label="Code de session"
            className="flex-1 rounded-[8px] text-center font-bold uppercase tracking-[.18em]"
            style={{
              padding:    '10px 14px',
              border:     '.5px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize:   18,
              color:      'var(--color-text-primary)',
              background: 'var(--color-bg)',
              outline:    'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-qblue)' }}
            onBlur={(e)  => { e.target.style.borderColor = 'var(--color-border)' }}
          />
          <button
            type="button"
            onClick={handleCodeSearch}
            className="rounded-[8px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-80 whitespace-nowrap"
            style={{
              padding:    '10px 18px',
              background: '#0D1E2C',
              color:      'var(--color-amber)',
              border:     'none',
              fontFamily: 'var(--font-body)',
              fontSize:   13,
            }}
          >
            Accéder →
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div
            className="rounded-[6px] px-[11px] py-[7px] font-bold mb-[8px]"
            role="alert"
            style={{ background: 'var(--color-qred-bg)', color: 'var(--color-qred)', fontSize: 12 }}
          >
            {error}
          </div>
        )}

        {/* Séparateur */}
        <div className="flex items-center gap-[10px] my-[14px]" style={{ color: 'var(--color-text-hint)', fontSize: 11 }}>
          <div style={{ flex: 1, height: .5, background: 'var(--color-sep)' }} aria-hidden="true" />
          ou via l&apos;URL directe
          <div style={{ flex: 1, height: .5, background: 'var(--color-sep)' }} aria-hidden="true" />
        </div>

        {/* Recherche par URL */}
        <div className="flex gap-[8px]">
          <input
            type="text"
            placeholder="quinova.fr/s/amis-quartier-mars25"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSearch()}
            aria-label="URL de la session"
            className="flex-1 rounded-[7px]"
            style={{
              padding:    '8px 12px',
              border:     '.5px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize:   12,
              color:      'var(--color-text-primary)',
              background: 'var(--color-bg)',
              outline:    'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-qblue)' }}
            onBlur={(e)  => { e.target.style.borderColor = 'var(--color-border)' }}
          />
          <button
            type="button"
            onClick={handleUrlSearch}
            className="rounded-[7px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-80"
            style={{
              padding:    '8px 14px',
              background: 'var(--color-qblue)',
              color:      'white',
              border:     'none',
              fontFamily: 'var(--font-body)',
              fontSize:   12,
            }}
          >
            OK
          </button>
        </div>
      </div>

      {/* Sessions ouvertes */}
      {openSessions.length > 0 && (
        <div className="mx-auto text-left" style={{ maxWidth: 440 }}>
          <div
            className="font-bold uppercase tracking-[.1em] mb-[10px]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
          >
            Sessions ouvertes
          </div>

          {openSessions.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => onNavigate(s.slug)}
              className="w-full flex items-center gap-[10px] rounded-[8px] px-[14px] py-[10px] mb-[6px] text-left cursor-pointer transition-all duration-[150ms] hover:border-[rgba(0,0,0,.16)]"
              style={{
                background: 'var(--color-card)',
                border:     '.5px solid var(--color-sep)',
              }}
            >
              {/* Point live */}
              <span
                aria-hidden="true"
                className="rounded-full flex-shrink-0"
                style={{ width: 8, height: 8, background: '#48BB78', display: 'block' }}
              />

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                  {s.name}
                </div>
                <div className="truncate" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {s.association} · {s.lieu} · {s.date}
                </div>
              </div>

              {/* Code */}
              <span
                className="font-bold rounded-[4px] px-[8px] py-[2px] flex-shrink-0"
                style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-bg)' }}
              >
                {s.code}
              </span>

              {/* Prix */}
              <span
                className="flex-shrink-0"
                style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}
              >
                dès {s.minPrice} €
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
