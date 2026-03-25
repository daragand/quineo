'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge }   from '@/components/ui/Badge'
import { Button }  from '@/components/ui/Button'
import { Select }  from '@/components/ui/Select'
import { Input }   from '@/components/ui/Input'
import type { SessionStatus } from '@/types/session'

// ─────────────────────────────────────────
// Types & données de démo
// ─────────────────────────────────────────

interface SessionRow {
  id:           string
  name:         string
  slug:         string
  lieu:         string
  date:         string
  status:       SessionStatus
  cartonsVendus: number
  cartonsMax:   number
  recettes:     number
}

const DEMO: SessionRow[] = [
  {
    id: '1', name: 'Grand Loto de Printemps 2025', slug: 'grand-loto-printemps-2025',
    lieu: 'Lyon 3e', date: '2025-03-22', status: 'running',
    cartonsVendus: 847, cartonsMax: 1200, recettes: 2541,
  },
  {
    id: '2', name: 'Loto de Noël 2024', slug: 'loto-noel-2024',
    lieu: 'Lyon 6e', date: '2024-12-14', status: 'closed',
    cartonsVendus: 1200, cartonsMax: 1200, recettes: 3600,
  },
  {
    id: '3', name: 'Loto d\'été 2024', slug: 'loto-ete-2024',
    lieu: 'Villeurbanne', date: '2024-07-06', status: 'closed',
    cartonsVendus: 980, cartonsMax: 1000, recettes: 2940,
  },
  {
    id: '4', name: 'Tournoi Automne 2024', slug: 'tournoi-automne-2024',
    lieu: 'Lyon 7e', date: '2024-10-19', status: 'closed',
    cartonsVendus: 640, cartonsMax: 800, recettes: 1920,
  },
  {
    id: '5', name: 'Loto Été 2025', slug: 'loto-ete-2025',
    lieu: 'Bron', date: '2025-07-12', status: 'draft',
    cartonsVendus: 0, cartonsMax: 900, recettes: 0,
  },
]

const STATUS_LABELS: Record<SessionStatus, string> = {
  draft:     'Brouillon',
  open:      'Ventes ouvertes',
  running:   'En cours',
  closed:    'Terminée',
  cancelled: 'Annulée',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function sessionAction(status: SessionStatus, slug: string) {
  if (status === 'running' || status === 'open') return { label: 'Gérer',   href: `/sessions/${slug}` }
  if (status === 'draft')                        return { label: 'Éditer',  href: `/sessions/${slug}/edit` }
  return                                                { label: 'Rapport', href: `/sessions/${slug}/rapport` }
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function SessionsPage() {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState<string>('all')

  const filtered = DEMO.filter((s) => {
    const matchStatus = statusFilter === 'all' || s.status === (statusFilter as SessionStatus)
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.lieu.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const totals = {
    active: DEMO.filter((s) => s.status === 'running' || s.status === 'open').length,
    draft:  DEMO.filter((s) => s.status === 'draft').length,
    closed: DEMO.filter((s) => s.status === 'closed').length,
  }

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-[20px]">
        <div>
          <h1
            className="font-display leading-none"
            style={{ fontSize: 28, color: 'var(--color-text-primary)' }}
          >
            Sessions
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            {DEMO.length} session{DEMO.length > 1 ? 's' : ''} · {totals.active} active{totals.active > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/sessions/new">
          <Button variant="primary" size="sm">
            + Nouvelle session
          </Button>
        </Link>
      </div>

      {/* ── Compteurs rapides ── */}
      <div className="grid gap-[10px] mb-[20px]" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { label: 'En cours',  count: totals.active, color: 'var(--color-qgreen-text)', bg: 'var(--color-qgreen-bg)' },
          { label: 'Brouillon', count: totals.draft,  color: 'var(--color-text-secondary)', bg: 'var(--color-bg)' },
          { label: 'Terminées', count: totals.closed, color: 'var(--color-text-secondary)', bg: 'var(--color-bg)' },
        ].map(({ label, count, color, bg }) => (
          <div
            key={label}
            className="rounded-[8px] px-[14px] py-[10px]"
            style={{ background: bg, border: '.5px solid var(--color-sep)' }}
          >
            <div className="font-display" style={{ fontSize: 26, color: 'var(--color-amber)' }}>
              {count}
            </div>
            <div style={{ fontSize: 11, color }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex gap-[8px] mb-[14px]">
        <div style={{ flex: 1, maxWidth: 280 }}>
          <Input
            type="text"
            placeholder="Rechercher une session…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher une session"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filtrer par statut"
          style={{ width: 160 }}
          options={[
            { value: 'all',     label: 'Tous les statuts' },
            { value: 'running', label: 'En cours' },
            { value: 'open',    label: 'Ventes ouvertes' },
            { value: 'draft',   label: 'Brouillon' },
            { value: 'closed',  label: 'Terminée' },
          ]}
        />
      </div>

      {/* ── Tableau ── */}
      <div
        className="rounded-[10px] overflow-hidden"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
      >
        {/* Header */}
        <div
          className="grid font-bold uppercase tracking-[.09em] px-[16px] py-[8px]"
          style={{
            gridTemplateColumns: '1fr 100px 90px 120px 100px 90px',
            fontSize: 10,
            color: 'var(--color-text-hint)',
            borderBottom: '.5px solid var(--color-sep)',
          }}
        >
          <span>Session</span>
          <span>Date</span>
          <span>Statut</span>
          <span>Cartons vendus</span>
          <span>Recettes</span>
          <span></span>
        </div>

        {filtered.length === 0 && (
          <div
            className="text-center py-[32px]"
            style={{ fontSize: 13, color: 'var(--color-text-hint)' }}
          >
            Aucune session trouvée
          </div>
        )}

        {filtered.map((s, i) => {
          const action = sessionAction(s.status, s.slug)
          const pct = s.cartonsMax > 0 ? (s.cartonsVendus / s.cartonsMax) * 100 : 0
          return (
            <div
              key={s.id}
              className="grid items-center px-[16px] py-[11px] transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
              style={{
                gridTemplateColumns: '1fr 100px 90px 120px 100px 90px',
                borderBottom: i < filtered.length - 1 ? '.5px solid var(--color-sep)' : undefined,
              }}
            >
              {/* Nom + lieu */}
              <div>
                <div className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {s.lieu}
                </div>
              </div>

              {/* Date */}
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {formatDate(s.date)}
              </span>

              {/* Statut */}
              <div>
                <Badge
                  variant={
                    s.status === 'running' || s.status === 'open' ? 'active'
                    : s.status === 'draft' ? 'draft'
                    : 'closed'
                  }
                >
                  {STATUS_LABELS[s.status]}
                </Badge>
              </div>

              {/* Cartons */}
              <div>
                <div className="flex items-baseline gap-[4px] mb-[3px]">
                  <span className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                    {s.cartonsVendus}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    / {s.cartonsMax}
                  </span>
                </div>
                {/* Mini progress */}
                <div
                  className="rounded-full overflow-hidden"
                  style={{ height: 3, background: 'var(--color-sep)' }}
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full transition-all duration-[300ms]"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 95
                        ? 'var(--color-qred)'
                        : pct >= 70
                          ? 'var(--color-amber)'
                          : 'var(--color-qblue)',
                    }}
                  />
                </div>
              </div>

              {/* Recettes */}
              <span className="font-bold font-display" style={{ fontSize: 16, color: 'var(--color-amber)' }}>
                {s.recettes > 0 ? `${s.recettes.toLocaleString('fr-FR')} €` : '—'}
              </span>

              {/* Action */}
              <div className="text-right">
                <Link href={action.href}>
                  <Button variant="secondary" size="sm">
                    {action.label}
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
