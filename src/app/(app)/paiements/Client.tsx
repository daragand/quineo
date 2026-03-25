'use client'

import { useState } from 'react'
import { Badge }  from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input }  from '@/components/ui/Input'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type PayStatus = 'completed' | 'pending' | 'refunded' | 'failed'
export type PayMethod = 'CASH' | 'EXTERNAL_TERMINAL' | 'ONLINE' | 'FREE'

export interface PaiementRow {
  id:          string
  ref:         string
  participant: string
  session:     string
  cartons:     number
  amount:      number
  method:      PayMethod
  status:      PayStatus
  date:        string
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const METHOD_LABELS: Record<PayMethod, string> = {
  CASH:              'Espèces',
  EXTERNAL_TERMINAL: 'Carte (TPE)',
  ONLINE:            'En ligne',
  FREE:              'Gratuit',
}

const METHOD_COLORS: Record<PayMethod, { bg: string; color: string }> = {
  CASH:              { bg: '#EAF3DE', color: '#27500A' },
  EXTERNAL_TERMINAL: { bg: '#EEF4FC', color: '#0C447C' },
  ONLINE:            { bg: '#EEEDFE', color: '#26215C' },
  FREE:              { bg: '#f0f2f5', color: '#8a95a3' },
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function PaiementsClient({ initialPaiements }: { initialPaiements: PaiementRow[] }) {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [methodFilter, setMethod] = useState('all')

  const filtered = initialPaiements.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchMethod = methodFilter === 'all' || p.method === methodFilter
    const matchSearch =
      p.ref.toLowerCase().includes(search.toLowerCase()) ||
      p.participant.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchMethod && matchSearch
  })

  const totalCollected = initialPaiements.filter((p) => p.status === 'completed' && p.amount > 0)
    .reduce((s, p) => s + p.amount, 0)
  const totalPending = initialPaiements.filter((p) => p.status === 'pending')
    .reduce((s, p) => s + p.amount, 0)
  const totalRefunded = initialPaiements.filter((p) => p.status === 'refunded')
    .reduce((s, p) => s + p.amount, 0)
  const freeCount = initialPaiements.filter((p) => p.method === 'FREE').length

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-[20px]">
        <div>
          <h1 className="font-display leading-none" style={{ fontSize: 28, color: 'var(--color-text-primary)' }}>
            Paiements
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            {initialPaiements.length} transaction{initialPaiements.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="secondary" size="sm">Exporter CSV</Button>
      </div>

      {/* ── Métriques ── */}
      <div className="grid gap-[10px] mb-[20px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Encaissé',   value: `${totalCollected.toLocaleString('fr-FR')} €`, color: 'var(--color-amber)',  sub: `${initialPaiements.filter(p => p.status === 'completed').length} transactions` },
          { label: 'En attente', value: `${totalPending.toLocaleString('fr-FR')} €`,   color: 'var(--color-qblue)',  sub: `${initialPaiements.filter(p => p.status === 'pending').length} à valider` },
          { label: 'Remboursé',  value: `${totalRefunded.toLocaleString('fr-FR')} €`,  color: 'var(--color-orange)', sub: `${initialPaiements.filter(p => p.status === 'refunded').length} transactions` },
          { label: 'Gratuits',   value: String(freeCount), color: 'var(--color-text-secondary)', sub: 'cartons offerts' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="rounded-[8px] px-[14px] py-[10px]"
            style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
            <div className="font-bold uppercase tracking-[.1em] mb-[4px]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>{label}</div>
            <div className="font-display leading-none" style={{ fontSize: 24, color }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex gap-[8px] mb-[14px]">
        <div style={{ flex: 1, maxWidth: 260 }}>
          <Input type="text" placeholder="Réf. ou participant…" value={search}
            onChange={(e) => setSearch(e.target.value)} aria-label="Rechercher" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatus(e.target.value)}
          aria-label="Statut" style={{ width: 150 }}
          options={[
            { value: 'all', label: 'Tous les statuts' },
            { value: 'completed', label: 'Validé' },
            { value: 'pending', label: 'En attente' },
            { value: 'refunded', label: 'Remboursé' },
            { value: 'failed', label: 'Échoué' },
          ]} />
        <Select value={methodFilter} onChange={(e) => setMethod(e.target.value)}
          aria-label="Méthode" style={{ width: 150 }}
          options={[
            { value: 'all', label: 'Tous les modes' },
            { value: 'CASH', label: 'Espèces' },
            { value: 'EXTERNAL_TERMINAL', label: 'Carte (TPE)' },
            { value: 'ONLINE', label: 'En ligne' },
            { value: 'FREE', label: 'Gratuit' },
          ]} />
      </div>

      {/* ── Tableau ── */}
      <div className="rounded-[10px] overflow-hidden"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>

        <div className="grid font-bold uppercase tracking-[.09em] px-[16px] py-[8px]"
          style={{
            gridTemplateColumns: '110px 1fr 130px 70px 90px 90px 90px',
            fontSize: 10, color: 'var(--color-text-hint)',
            borderBottom: '.5px solid var(--color-sep)',
          }}>
          <span>Référence</span>
          <span>Participant</span>
          <span>Session</span>
          <span>Cartons</span>
          <span>Montant</span>
          <span>Mode</span>
          <span>Statut</span>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-[32px]" style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>
            Aucune transaction trouvée
          </div>
        )}

        {filtered.map((p, i) => {
          const methodStyle = METHOD_COLORS[p.method]
          return (
            <div key={p.id}
              className="grid items-center px-[16px] py-[10px] transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
              style={{
                gridTemplateColumns: '110px 1fr 130px 70px 90px 90px 90px',
                borderBottom: i < filtered.length - 1 ? '.5px solid var(--color-sep)' : undefined,
              }}>
              <div>
                <div className="font-bold" style={{ fontSize: 11, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                  {p.ref}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>
                  {formatDateTime(p.date)}
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{p.participant}</span>
              <span className="truncate" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{p.session}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {p.cartons} carton{p.cartons > 1 ? 's' : ''}
              </span>
              <span className="font-bold font-display"
                style={{ fontSize: 16, color: p.amount === 0 ? 'var(--color-text-hint)' : 'var(--color-amber)' }}>
                {p.amount === 0 ? '—' : `${p.amount} €`}
              </span>
              <span className="font-bold rounded-[4px] px-[7px] py-[2px] inline-block"
                style={{ fontSize: 10, ...methodStyle }}>
                {METHOD_LABELS[p.method]}
              </span>
              <div>
                <Badge variant={
                  p.status === 'completed' ? 'sold'
                  : p.status === 'pending'  ? 'pending'
                  : p.status === 'refunded' ? 'won'
                  : 'cancelled'
                }>
                  {p.status === 'completed' ? 'Validé'
                  : p.status === 'pending'  ? 'En attente'
                  : p.status === 'refunded' ? 'Remboursé'
                  : 'Échoué'}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-[12px]"
        style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
        <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
        <div className="flex gap-[6px]">
          <Button variant="secondary" size="sm">← Précédent</Button>
          <Button variant="secondary" size="sm">Suivant →</Button>
        </div>
      </div>
    </div>
  )
}
