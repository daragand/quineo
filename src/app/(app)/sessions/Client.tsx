'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge }   from '@/components/ui/Badge'
import { Button }  from '@/components/ui/Button'
import { Select }  from '@/components/ui/Select'
import { Input }   from '@/components/ui/Input'
import type { SessionStatus } from '@/types/session'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface SessionRow {
  id:            string
  name:          string
  description?:  string
  date?:         string
  status:        SessionStatus
  cartonsVendus: number
  cartonsMax:    number
  recettes:      number
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

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

function sessionAction(status: SessionStatus, id: string) {
  if (status === 'running' || status === 'open') return { label: 'Gérer',   href: `/sessions/${id}` }
  if (status === 'draft')                        return { label: 'Éditer',  href: `/sessions/${id}/edit` }
  return                                                { label: 'Rapport', href: `/sessions/${id}/rapport` }
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function SessionsClient({ initialSessions }: { initialSessions: SessionRow[] }) {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState<string>('all')

  const filtered = initialSessions.filter((s) => {
    const matchStatus = statusFilter === 'all' || s.status === (statusFilter as SessionStatus)
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        (s.description ?? '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const totals = {
    active: initialSessions.filter((s) => s.status === 'running' || s.status === 'open').length,
    draft:  initialSessions.filter((s) => s.status === 'draft').length,
    closed: initialSessions.filter((s) => s.status === 'closed').length,
  }

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-[10px] flex-wrap mb-[20px]">
        <div>
          <h1
            className="font-display leading-none"
            style={{ fontSize: 28, color: 'var(--color-text-primary)' }}
          >
            Sessions
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            {initialSessions.length} session{initialSessions.length > 1 ? 's' : ''} · {totals.active} active{totals.active > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/sessions/new">
          <Button variant="primary" size="sm">+ Nouvelle session</Button>
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
      <div className="flex flex-wrap gap-[8px] mb-[14px]">
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
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
        {/* Header — desktop uniquement */}
        <div
          className="hidden md:grid font-bold uppercase tracking-[.09em] px-[16px] py-[8px]"
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
          <div className="text-center py-[32px]" style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>
            Aucune session trouvée
          </div>
        )}

        {filtered.map((s, i) => {
          const action = sessionAction(s.status, s.id)
          const pct = s.cartonsMax > 0 ? (s.cartonsVendus / s.cartonsMax) * 100 : 0
          const badgeVariant = s.status === 'running' || s.status === 'open' ? 'active' as const
            : s.status === 'draft' ? 'draft' as const : 'closed' as const
          const borderBottom = i < filtered.length - 1 ? '.5px solid var(--color-sep)' : undefined
          return (
            <div key={s.id} style={{ borderBottom }}>

              {/* ── Card mobile (md:hidden) ── */}
              <div
                className="md:hidden flex items-start justify-between gap-[10px] px-[14px] py-[12px] transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                    {s.name}
                  </div>
                  {s.description && (
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{s.description}</div>
                  )}
                  <div className="flex items-center gap-[8px] flex-wrap mt-[5px]">
                    <Badge variant={badgeVariant}>{STATUS_LABELS[s.status]}</Badge>
                    {s.date && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{formatDate(s.date)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-[10px] mt-[4px]" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    <span>
                      {s.cartonsVendus}{s.cartonsMax > 0 ? ` / ${s.cartonsMax}` : ''} cartons
                    </span>
                    <span className="font-bold font-display" style={{ fontSize: 14, color: 'var(--color-amber)' }}>
                      {s.recettes > 0 ? `${s.recettes.toLocaleString('fr-FR')} €` : '—'}
                    </span>
                  </div>
                </div>
                <Link href={action.href} className="flex-shrink-0 mt-[2px]">
                  <Button variant="secondary" size="sm">{action.label}</Button>
                </Link>
              </div>

              {/* ── Ligne desktop (hidden md:grid) ── */}
              <div
                className="hidden md:grid items-center px-[16px] py-[11px] transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
                style={{ gridTemplateColumns: '1fr 100px 90px 120px 100px 90px' }}
              >
                <div>
                  <div className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                    {s.name}
                  </div>
                  {s.description && (
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{s.description}</div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {s.date ? formatDate(s.date) : '—'}
                </span>
                <div>
                  <Badge variant={badgeVariant}>{STATUS_LABELS[s.status]}</Badge>
                </div>
                <div>
                  <div className="flex items-baseline gap-[4px] mb-[3px]">
                    <span className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                      {s.cartonsVendus}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      {s.cartonsMax > 0 ? `/ ${s.cartonsMax}` : ''}
                    </span>
                  </div>
                  {s.cartonsMax > 0 && (
                    <div className="rounded-full overflow-hidden" style={{ height: 3, background: 'var(--color-sep)' }} aria-hidden="true">
                      <div
                        className="h-full rounded-full transition-all duration-[300ms]"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 95 ? 'var(--color-qred)' : pct >= 70 ? 'var(--color-amber)' : 'var(--color-qblue)',
                        }}
                      />
                    </div>
                  )}
                </div>
                <span className="font-bold font-display" style={{ fontSize: 16, color: 'var(--color-amber)' }}>
                  {s.recettes > 0 ? `${s.recettes.toLocaleString('fr-FR')} €` : '—'}
                </span>
                <div className="text-right">
                  <Link href={action.href}>
                    <Button variant="secondary" size="sm">{action.label}</Button>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
