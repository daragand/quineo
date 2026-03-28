'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface SessionReport {
  id:           string
  name:         string
  date:         string | null
  cartonsMax:   number
  cartonsSold:  number
  recettes:     number
  participants: number
}

export interface MonthlyData {
  month: number   // 1-12
  total: number
}

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function RapportsClient({
  sessions,
  monthly,
  associationName,
  availableYears,
}: {
  sessions:        SessionReport[]
  monthly:         MonthlyData[]
  associationName: string
  availableYears:  string[]
}) {
  const [year, setYear] = useState(availableYears[0] ?? String(new Date().getFullYear()))

  const totalRecettes     = sessions.reduce((s, r) => s + r.recettes, 0)
  const totalCartons      = sessions.reduce((s, r) => s + r.cartonsSold, 0)
  const totalParticipants = sessions.reduce((s, r) => s + r.participants, 0)
  const avgRemplissage    = sessions.length > 0
    ? Math.round(sessions.reduce((s, r) => s + (r.cartonsMax > 0 ? (r.cartonsSold / r.cartonsMax) * 100 : 0), 0) / sessions.length)
    : 0

  // Build 12-month array from monthly data
  const monthlyValues = Array.from({ length: 12 }, (_, i) => {
    const m = monthly.find(d => d.month === i + 1)
    return m?.total ?? 0
  })
  const maxVal = Math.max(...monthlyValues, 1)

  function formatDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-[20px]">
        <div>
          <h1 className="font-display leading-none" style={{ fontSize: 28, color: 'var(--color-text-primary)' }}>
            Rapports
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            Vue d&apos;ensemble financière — {associationName}
          </p>
        </div>
        <div className="flex gap-[8px]">
          <Select value={year} onChange={(e) => setYear(e.target.value)}
            aria-label="Année" style={{ width: 100 }}
            options={availableYears.map(y => ({ value: y, label: y }))} />
          <Button variant="secondary" size="sm"
            onClick={() => window.open(`/api/rapports/export?format=pdf&year=${year}`, '_blank')}>
            Exporter PDF
          </Button>
          <Button variant="primary" size="sm"
            onClick={() => { window.location.href = `/api/rapports/export?format=csv&year=${year}` }}>
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-[10px] mb-[20px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Recettes totales',    value: `${totalRecettes.toLocaleString('fr-FR')} €`, color: 'var(--color-amber)', sub: `${sessions.length} sessions` },
          { label: 'Cartons vendus',      value: totalCartons.toLocaleString('fr-FR'), color: 'var(--color-text-primary)', sub: `${avgRemplissage} % remplissage moyen` },
          { label: 'Participants uniques', value: totalParticipants.toLocaleString('fr-FR'), color: 'var(--color-qblue)', sub: sessions.length > 0 ? `moy. ${Math.round(totalParticipants / sessions.length)}/session` : '—' },
          { label: 'Sessions organisées', value: String(sessions.length), color: 'var(--color-text-primary)', sub: 'sur la période' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="rounded-[8px] px-[14px] py-[12px]"
            style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
            <div className="font-bold uppercase tracking-[.1em] mb-[4px]"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>{label}</div>
            <div className="font-display leading-none" style={{ fontSize: 28, color }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-[14px]" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* Graphique mensuel */}
        <div className="rounded-[10px] px-[18px] py-[16px]"
          style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
          <div className="font-bold uppercase tracking-[.1em] mb-[14px]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            Recettes mensuelles {year}
          </div>
          <div className="flex items-end gap-[6px]" style={{ height: 100 }}>
            {MONTHS.map((m, i) => {
              const val = monthlyValues[i]
              const h = (val / maxVal) * 88
              return (
                <div key={m} className="flex flex-col items-center flex-1 gap-[4px]">
                  <div className="w-full rounded-t-[3px] transition-all duration-[300ms]"
                    style={{
                      height: h || 3,
                      background: h > 0 ? 'var(--color-amber)' : 'var(--color-sep)',
                      opacity: h > 0 ? 1 : 0.4,
                    }}
                    title={val > 0 ? `${val.toLocaleString('fr-FR')} €` : '—'}
                    aria-label={`${m} : ${val > 0 ? val.toLocaleString('fr-FR') + ' €' : 'aucune session'}`}
                  />
                  <span style={{ fontSize: 9, color: 'var(--color-text-hint)' }}>{m}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Répartition paiements */}
        <div className="rounded-[10px] px-[18px] py-[16px]"
          style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
          <div className="font-bold uppercase tracking-[.1em] mb-[14px]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            Répartition paiements (données DB)
          </div>
          {sessions.length === 0 ? (
            <p style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>Aucune donnée disponible.</p>
          ) : (
            <p style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
              Agrégation par mode de paiement disponible une fois les sessions actives.
            </p>
          )}
        </div>
      </div>

      {/* Tableau par session */}
      <div className="rounded-[10px] overflow-hidden mt-[14px]"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
        <div className="font-bold uppercase tracking-[.1em] px-[16px] py-[10px]"
          style={{ fontSize: 11, color: 'var(--color-text-secondary)', borderBottom: '.5px solid var(--color-sep)' }}>
          Détail par session
        </div>
        <div className="grid font-bold uppercase tracking-[.09em] px-[16px] py-[7px]"
          style={{
            gridTemplateColumns: '1fr 110px 90px 80px 80px 90px',
            fontSize: 10, color: 'var(--color-text-hint)',
            borderBottom: '.5px solid var(--color-sep)',
          }}>
          {['Session', 'Date', 'Cartons', 'Taux', 'Partic.', 'Recettes'].map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-[32px]" style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>
            Aucune session
          </div>
        )}

        {sessions.map((r, i) => {
          const taux = r.cartonsMax > 0 ? Math.round((r.cartonsSold / r.cartonsMax) * 100) : 0
          return (
            <div key={r.id}
              className="grid items-center px-[16px] py-[10px] transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
              style={{
                gridTemplateColumns: '1fr 110px 90px 80px 80px 90px',
                borderBottom: i < sessions.length - 1 ? '.5px solid var(--color-sep)' : undefined,
              }}>
              <span className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                {r.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{formatDate(r.date)}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {r.cartonsSold} / {r.cartonsMax || '—'}
              </span>
              <span className="font-bold" style={{
                fontSize: 12,
                color: taux >= 90 ? 'var(--color-qgreen-text)' : taux >= 60 ? 'var(--color-amber)' : 'var(--color-orange)'
              }}>
                {r.cartonsMax > 0 ? `${taux} %` : '—'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{r.participants}</span>
              <span className="font-bold font-display" style={{ fontSize: 16, color: 'var(--color-amber)' }}>
                {r.recettes > 0 ? `${r.recettes.toLocaleString('fr-FR')} €` : '—'}
              </span>
            </div>
          )
        })}

        {sessions.length > 0 && (
          <div className="grid items-center px-[16px] py-[10px] font-bold"
            style={{
              gridTemplateColumns: '1fr 110px 90px 80px 80px 90px',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
            }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Total</span>
            <span />
            <span style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{totalCartons}</span>
            <span />
            <span style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{totalParticipants}</span>
            <span className="font-display" style={{ fontSize: 18, color: 'var(--color-amber)' }}>
              {totalRecettes.toLocaleString('fr-FR')} €
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
