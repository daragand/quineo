'use client'

import { useState } from 'react'
import { Badge }  from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input }  from '@/components/ui/Input'

// ─────────────────────────────────────────
// Types & données de démo
// ─────────────────────────────────────────

type PayStatus = 'completed' | 'pending' | 'refunded' | 'failed'
type PayMethod = 'CASH' | 'EXTERNAL_TERMINAL' | 'ONLINE' | 'FREE'

interface PaymentRow {
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

const DEMO: PaymentRow[] = [
  { id: '1',  ref: 'PAY-0041', participant: 'Marie Dupont',   session: 'Grand Loto Printemps 2025', cartons: 3,  amount: 8,    method: 'ONLINE',            status: 'completed', date: '2025-03-15T10:24:00' },
  { id: '2',  ref: 'PAY-0040', participant: 'Paul Martin',    session: 'Grand Loto Printemps 2025', cartons: 1,  amount: 3,    method: 'CASH',              status: 'completed', date: '2025-03-15T09:58:00' },
  { id: '3',  ref: 'PAY-0039', participant: 'Sophie Bernard', session: 'Grand Loto Printemps 2025', cartons: 6,  amount: 15,   method: 'ONLINE',            status: 'completed', date: '2025-03-14T18:32:00' },
  { id: '4',  ref: 'PAY-0038', participant: 'Jean Lefèvre',   session: 'Grand Loto Printemps 2025', cartons: 3,  amount: 8,    method: 'EXTERNAL_TERMINAL', status: 'pending',   date: '2025-03-14T17:05:00' },
  { id: '5',  ref: 'PAY-0037', participant: 'Claire Petit',   session: 'Grand Loto Printemps 2025', cartons: 1,  amount: 0,    method: 'FREE',              status: 'completed', date: '2025-03-14T16:44:00' },
  { id: '6',  ref: 'PAY-0036', participant: 'Luc Moreau',     session: 'Grand Loto Printemps 2025', cartons: 10, amount: 24,   method: 'ONLINE',            status: 'completed', date: '2025-03-14T15:12:00' },
  { id: '7',  ref: 'PAY-0035', participant: 'Alice Renard',   session: 'Grand Loto Printemps 2025', cartons: 3,  amount: 8,    method: 'CASH',              status: 'refunded',  date: '2025-03-13T11:20:00' },
  { id: '8',  ref: 'PAY-0034', participant: 'Marc Girard',    session: 'Grand Loto Printemps 2025', cartons: 6,  amount: 15,   method: 'ONLINE',            status: 'failed',    date: '2025-03-13T10:05:00' },
  { id: '9',  ref: 'PAY-0033', participant: 'Isabelle Roy',   session: 'Grand Loto Printemps 2025', cartons: 1,  amount: 3,    method: 'CASH',              status: 'completed', date: '2025-03-12T14:38:00' },
  { id: '10', ref: 'PAY-0032', participant: 'Thomas Blanc',   session: 'Grand Loto Printemps 2025', cartons: 3,  amount: 8,    method: 'EXTERNAL_TERMINAL', status: 'completed', date: '2025-03-12T13:55:00' },
]

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
// Page
// ─────────────────────────────────────────

export default function PaiementsPage() {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [methodFilter, setMethod] = useState('all')

  const filtered = DEMO.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchMethod = methodFilter === 'all' || p.method === methodFilter
    const matchSearch =
      p.ref.toLowerCase().includes(search.toLowerCase()) ||
      p.participant.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchMethod && matchSearch
  })

  const totalCollected = DEMO.filter((p) => p.status === 'completed' && p.amount > 0)
    .reduce((s, p) => s + p.amount, 0)
  const totalPending = DEMO.filter((p) => p.status === 'pending')
    .reduce((s, p) => s + p.amount, 0)
  const totalRefunded = DEMO.filter((p) => p.status === 'refunded')
    .reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-[20px]">
        <div>
          <h1 className="font-display leading-none" style={{ fontSize: 28, color: 'var(--color-text-primary)' }}>
            Paiements
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            {DEMO.length} transactions · Grand Loto Printemps 2025
          </p>
        </div>
        <Button variant="secondary" size="sm">
          Exporter CSV
        </Button>
      </div>

      {/* ── Métriques ── */}
      <div className="grid gap-[10px] mb-[20px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Encaissé',    value: `${totalCollected} €`,  color: 'var(--color-amber)',        sub: `${DEMO.filter(p => p.status === 'completed').length} transactions` },
          { label: 'En attente',  value: `${totalPending} €`,    color: 'var(--color-qblue)',        sub: `${DEMO.filter(p => p.status === 'pending').length} à valider` },
          { label: 'Remboursé',   value: `${totalRefunded} €`,   color: 'var(--color-orange)',       sub: `${DEMO.filter(p => p.status === 'refunded').length} transactions` },
          { label: 'Gratuits',    value: `${DEMO.filter(p => p.method === 'FREE').length}`,          color: 'var(--color-text-secondary)', sub: 'cartons offerts' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="rounded-[8px] px-[14px] py-[10px]"
            style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
            <div className="font-bold uppercase tracking-[.1em] mb-[4px]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>
              {label}
            </div>
            <div className="font-display leading-none" style={{ fontSize: 24, color }}>
              {value}
            </div>
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
            { value: 'all',       label: 'Tous les statuts' },
            { value: 'completed', label: 'Validé' },
            { value: 'pending',   label: 'En attente' },
            { value: 'refunded',  label: 'Remboursé' },
            { value: 'failed',    label: 'Échoué' },
          ]} />
        <Select value={methodFilter} onChange={(e) => setMethod(e.target.value)}
          aria-label="Méthode" style={{ width: 150 }}
          options={[
            { value: 'all',              label: 'Tous les modes' },
            { value: 'CASH',             label: 'Espèces' },
            { value: 'EXTERNAL_TERMINAL', label: 'Carte (TPE)' },
            { value: 'ONLINE',           label: 'En ligne' },
            { value: 'FREE',             label: 'Gratuit' },
          ]} />
      </div>

      {/* ── Tableau ── */}
      <div className="rounded-[10px] overflow-hidden"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>

        {/* Header */}
        <div className="grid font-bold uppercase tracking-[.09em] px-[16px] py-[8px]"
          style={{
            gridTemplateColumns: '110px 1fr 130px 70px 90px 90px 90px',
            fontSize: 10,
            color: 'var(--color-text-hint)',
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
              {/* Réf + date */}
              <div>
                <div className="font-bold" style={{ fontSize: 11, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                  {p.ref}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>
                  {formatDateTime(p.date)}
                </div>
              </div>

              {/* Participant */}
              <span style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                {p.participant}
              </span>

              {/* Session */}
              <span className="truncate" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                {p.session}
              </span>

              {/* Cartons */}
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {p.cartons} carton{p.cartons > 1 ? 's' : ''}
              </span>

              {/* Montant */}
              <span className="font-bold font-display" style={{ fontSize: 16, color: p.amount === 0 ? 'var(--color-text-hint)' : 'var(--color-amber)' }}>
                {p.amount === 0 ? '—' : `${p.amount} €`}
              </span>

              {/* Mode */}
              <span className="font-bold rounded-[4px] px-[7px] py-[2px] inline-block"
                style={{ fontSize: 10, ...methodStyle }}>
                {METHOD_LABELS[p.method]}
              </span>

              {/* Statut */}
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

      {/* Pagination */}
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
