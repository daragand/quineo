'use client'

import { useState } from 'react'
import { Badge }  from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input }  from '@/components/ui/Input'

// ─────────────────────────────────────────
// Types & données de démo
// ─────────────────────────────────────────

type CartonStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD'

interface CartonRow {
  id:          string
  ref:         string
  session:     string
  participant: string | null
  status:      CartonStatus
  price:       number
  soldAt:      string | null
}

const DEMO_CARTONS: CartonRow[] = [
  { id: '1',  ref: 'C001', session: 'Grand Loto Printemps 2025', participant: 'Marie Dupont',    status: 'SOLD',      price: 3,  soldAt: '2025-03-15' },
  { id: '2',  ref: 'C002', session: 'Grand Loto Printemps 2025', participant: 'Paul Martin',     status: 'SOLD',      price: 3,  soldAt: '2025-03-15' },
  { id: '3',  ref: 'C003', session: 'Grand Loto Printemps 2025', participant: 'Sophie Bernard',  status: 'SOLD',      price: 3,  soldAt: '2025-03-16' },
  { id: '4',  ref: 'C004', session: 'Grand Loto Printemps 2025', participant: 'Jean Lefèvre',    status: 'RESERVED',  price: 3,  soldAt: null },
  { id: '5',  ref: 'C005', session: 'Grand Loto Printemps 2025', participant: null,              status: 'AVAILABLE', price: 3,  soldAt: null },
  { id: '6',  ref: 'C006', session: 'Grand Loto Printemps 2025', participant: null,              status: 'AVAILABLE', price: 3,  soldAt: null },
  { id: '7',  ref: 'C007', session: 'Grand Loto Printemps 2025', participant: 'Marie Dupont',    status: 'SOLD',      price: 3,  soldAt: '2025-03-15' },
  { id: '8',  ref: 'C008', session: 'Grand Loto Printemps 2025', participant: 'Claire Petit',    status: 'SOLD',      price: 0,  soldAt: '2025-03-17' },
  { id: '9',  ref: 'C009', session: 'Grand Loto Printemps 2025', participant: null,              status: 'AVAILABLE', price: 3,  soldAt: null },
  { id: '10', ref: 'C010', session: 'Grand Loto Printemps 2025', participant: 'Luc Moreau',      status: 'SOLD',      price: 8,  soldAt: '2025-03-18' },
  { id: '11', ref: 'C011', session: 'Grand Loto Printemps 2025', participant: 'Luc Moreau',      status: 'SOLD',      price: 8,  soldAt: '2025-03-18' },
  { id: '12', ref: 'C012', session: 'Grand Loto Printemps 2025', participant: 'Luc Moreau',      status: 'SOLD',      price: 8,  soldAt: '2025-03-18' },
]

const STATUS_LABELS: Record<CartonStatus, string> = {
  AVAILABLE: 'Disponible',
  RESERVED:  'Réservé',
  SOLD:      'Vendu',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#185FA5', '#3B6D11', '#534AB7', '#854F0B', '#A32D2D']
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function CartonsPage() {
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatus] = useState<string>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = DEMO_CARTONS.filter((c) => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchSearch =
      c.ref.toLowerCase().includes(search.toLowerCase()) ||
      (c.participant ?? '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    total:     DEMO_CARTONS.length,
    sold:      DEMO_CARTONS.filter((c) => c.status === 'SOLD').length,
    available: DEMO_CARTONS.filter((c) => c.status === 'AVAILABLE').length,
    reserved:  DEMO_CARTONS.filter((c) => c.status === 'RESERVED').length,
    free:      DEMO_CARTONS.filter((c) => c.status === 'SOLD' && c.price === 0).length,
    recettes:  DEMO_CARTONS.filter((c) => c.status === 'SOLD').reduce((s, c) => s + c.price, 0),
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((c) => c.id)))
    }
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
            Cartons
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            Grand Loto de Printemps 2025
          </p>
        </div>
        <div className="flex gap-[8px]">
          {selected.size > 0 && (
            <Button variant="ghost" size="sm">
              Exporter la sélection ({selected.size})
            </Button>
          )}
          <Button variant="secondary" size="sm">
            Générer un lot
          </Button>
          <Button variant="primary" size="sm">
            + Ajouter des cartons
          </Button>
        </div>
      </div>

      {/* ── Métriques ── */}
      <div className="grid gap-[10px] mb-[20px]" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'Total',      value: counts.total,     color: 'var(--color-text-primary)', sub: 'cartons' },
          { label: 'Vendus',     value: counts.sold,      color: 'var(--color-amber)',         sub: `${Math.round((counts.sold / counts.total) * 100)} %` },
          { label: 'Disponibles', value: counts.available, color: 'var(--color-qblue)',        sub: 'restants' },
          { label: 'Réservés',   value: counts.reserved,  color: 'var(--color-orange)',        sub: 'en attente' },
          { label: 'Recettes',   value: `${counts.recettes} €`, color: 'var(--color-amber)', sub: `${counts.free} gratuits` },
        ].map(({ label, value, color, sub }) => (
          <div
            key={label}
            className="rounded-[8px] px-[14px] py-[10px]"
            style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
          >
            <div
              className="font-bold uppercase tracking-[.1em] mb-[4px]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}
            >
              {label}
            </div>
            <div className="font-display leading-none" style={{ fontSize: 24, color }}>
              {value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex gap-[8px] mb-[14px]">
        <div style={{ flex: 1, maxWidth: 260 }}>
          <Input
            type="text"
            placeholder="Réf. ou participant…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher un carton"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filtrer par statut"
          style={{ width: 160 }}
          options={[
            { value: 'all',       label: 'Tous les statuts' },
            { value: 'SOLD',      label: 'Vendus' },
            { value: 'RESERVED',  label: 'Réservés' },
            { value: 'AVAILABLE', label: 'Disponibles' },
          ]}
        />
        <Button variant="ghost" size="sm">
          Exporter CSV
        </Button>
      </div>

      {/* ── Tableau ── */}
      <div
        className="rounded-[10px] overflow-hidden"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
      >
        {/* Header */}
        <div
          className="grid items-center px-[16px] py-[8px]"
          style={{
            gridTemplateColumns: '32px 70px 1fr 160px 80px 90px 80px',
            borderBottom: '.5px solid var(--color-sep)',
          }}
        >
          {/* Select all */}
          <input
            type="checkbox"
            aria-label="Tout sélectionner"
            checked={selected.size === filtered.length && filtered.length > 0}
            onChange={toggleAll}
            style={{ cursor: 'pointer', accentColor: 'var(--color-qblue)', width: 13, height: 13 }}
          />
          {['Réf.', 'Session', 'Participant', 'Statut', 'Prix', 'Actions'].map((h) => (
            <span
              key={h}
              className="font-bold uppercase tracking-[.09em]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}
            >
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            className="text-center py-[32px]"
            style={{ fontSize: 13, color: 'var(--color-text-hint)' }}
          >
            Aucun carton trouvé
          </div>
        )}

        {filtered.map((c, i) => (
          <div
            key={c.id}
            className="grid items-center px-[16px] py-[9px] transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
            style={{
              gridTemplateColumns: '32px 70px 1fr 160px 80px 90px 80px',
              borderBottom: i < filtered.length - 1 ? '.5px solid var(--color-sep)' : undefined,
              background: selected.has(c.id) ? 'var(--color-qblue-bg)' : undefined,
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              aria-label={`Sélectionner carton ${c.ref}`}
              checked={selected.has(c.id)}
              onChange={() => toggleSelect(c.id)}
              style={{ cursor: 'pointer', accentColor: 'var(--color-qblue)', width: 13, height: 13 }}
            />

            {/* Réf */}
            <span
              className="font-bold rounded-[4px] px-[7px] py-[2px] inline-block"
              style={{
                fontSize: 11,
                background: 'var(--color-qblue-bg)',
                color: 'var(--color-qblue-text)',
                fontFamily: 'monospace',
              }}
            >
              {c.ref}
            </span>

            {/* Session */}
            <span
              className="truncate"
              style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}
            >
              {c.session}
            </span>

            {/* Participant */}
            <div className="flex items-center gap-[7px]">
              {c.participant ? (
                <>
                  <div
                    className="rounded-full flex items-center justify-center flex-shrink-0 font-bold"
                    style={{
                      width: 22, height: 22,
                      background: avatarColor(c.participant),
                      fontSize: 9, color: 'white',
                    }}
                    aria-hidden="true"
                  >
                    {initials(c.participant)}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                    {c.participant}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>—</span>
              )}
            </div>

            {/* Statut */}
            <div>
              <Badge
                variant={
                  c.status === 'SOLD'      ? 'active'
                  : c.status === 'RESERVED' ? 'pending'
                  : 'draft'
                }
              >
                {STATUS_LABELS[c.status]}
              </Badge>
            </div>

            {/* Prix */}
            <span
              className="font-bold"
              style={{
                fontSize: 13,
                color: c.price === 0 ? 'var(--color-purple)' : 'var(--color-amber)',
              }}
            >
              {c.price === 0 ? 'Gratuit' : `${c.price} €`}
            </span>

            {/* Actions */}
            <div className="flex gap-[4px]">
              <Button variant="ghost" size="sm">
                Voir
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between mt-[12px]"
        style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
      >
        <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
        <div className="flex gap-[6px]">
          <Button variant="secondary" size="sm">← Précédent</Button>
          <Button variant="secondary" size="sm">Suivant →</Button>
        </div>
      </div>
    </div>
  )
}
