'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

// ─────────────────────────────────────────
// Données de démo
// ─────────────────────────────────────────

interface SessionReport {
  id:          string
  name:        string
  date:        string
  cartonsMax:  number
  cartonsSold: number
  recettes:    number
  participants: number
  gratuits:    number
  cashPct:     number
  onlinePct:   number
  tpePct:      number
}

const SESSIONS: SessionReport[] = [
  {
    id: '1', name: 'Grand Loto Printemps 2025', date: '22 mars 2025',
    cartonsMax: 1200, cartonsSold: 847, recettes: 2541, participants: 183, gratuits: 12,
    cashPct: 42, onlinePct: 38, tpePct: 20,
  },
  {
    id: '2', name: 'Loto de Noël 2024', date: '14 déc. 2024',
    cartonsMax: 1200, cartonsSold: 1200, recettes: 3600, participants: 220, gratuits: 8,
    cashPct: 55, onlinePct: 30, tpePct: 15,
  },
  {
    id: '3', name: 'Loto d\'été 2024', date: '6 juil. 2024',
    cartonsMax: 1000, cartonsSold: 980, recettes: 2940, participants: 195, gratuits: 5,
    cashPct: 60, onlinePct: 25, tpePct: 15,
  },
  {
    id: '4', name: 'Tournoi Automne 2024', date: '19 oct. 2024',
    cartonsMax: 800, cartonsSold: 640, recettes: 1920, participants: 140, gratuits: 10,
    cashPct: 48, onlinePct: 35, tpePct: 17,
  },
]

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const MONTHLY_RECETTES = [0, 0, 2541, 0, 0, 0, 2940, 0, 0, 1920, 0, 3600]
const MAX_VAL = Math.max(...MONTHLY_RECETTES)

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function RapportsPage() {
  const [year, setYear] = useState('2025')

  const totalRecettes    = SESSIONS.reduce((s, r) => s + r.recettes, 0)
  const totalParticipants = SESSIONS.reduce((s, r) => s + r.participants, 0)
  const totalCartons     = SESSIONS.reduce((s, r) => s + r.cartonsSold, 0)
  const avgRemplissage   = Math.round(
    SESSIONS.reduce((s, r) => s + (r.cartonsSold / r.cartonsMax) * 100, 0) / SESSIONS.length
  )

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-[20px]">
        <div>
          <h1 className="font-display leading-none" style={{ fontSize: 28, color: 'var(--color-text-primary)' }}>
            Rapports
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            Vue d&apos;ensemble financière — Amis du Quartier
          </p>
        </div>
        <div className="flex gap-[8px]">
          <Select value={year} onChange={(e) => setYear(e.target.value)}
            aria-label="Année" style={{ width: 100 }}
            options={[
              { value: '2025', label: '2025' },
              { value: '2024', label: '2024' },
            ]} />
          <Button variant="secondary" size="sm">Exporter PDF</Button>
          <Button variant="primary" size="sm">Exporter CSV</Button>
        </div>
      </div>

      {/* ── KPIs globaux ── */}
      <div className="grid gap-[10px] mb-[20px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Recettes totales',   value: `${totalRecettes.toLocaleString('fr-FR')} €`, color: 'var(--color-amber)', sub: `${SESSIONS.length} sessions` },
          { label: 'Cartons vendus',     value: totalCartons.toLocaleString('fr-FR'),          color: 'var(--color-text-primary)', sub: `${avgRemplissage} % remplissage moyen` },
          { label: 'Participants uniques', value: totalParticipants.toLocaleString('fr-FR'),   color: 'var(--color-qblue)', sub: `moy. ${Math.round(totalParticipants / SESSIONS.length)}/session` },
          { label: 'Sessions organisées', value: SESSIONS.length,                              color: 'var(--color-text-primary)', sub: 'sur la période' },
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

        {/* ── Graphique barres mensuel ── */}
        <div className="rounded-[10px] px-[18px] py-[16px]"
          style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
          <div className="font-bold uppercase tracking-[.1em] mb-[14px]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            Recettes mensuelles {year}
          </div>
          <div className="flex items-end gap-[6px]" style={{ height: 100 }}>
            {MONTHS.map((m, i) => {
              const val = MONTHLY_RECETTES[i]
              const h = MAX_VAL > 0 ? (val / MAX_VAL) * 88 : 0
              return (
                <div key={m} className="flex flex-col items-center flex-1 gap-[4px]">
                  <div className="w-full rounded-t-[3px] transition-all duration-[300ms]"
                    style={{
                      height: h || 3,
                      background: h > 0 ? 'var(--color-amber)' : 'var(--color-sep)',
                      opacity: h > 0 ? 1 : 0.4,
                    }}
                    title={val > 0 ? `${val} €` : '—'}
                    aria-label={`${m} : ${val > 0 ? val + ' €' : 'aucune session'}`}
                  />
                  <span style={{ fontSize: 9, color: 'var(--color-text-hint)' }}>{m}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Répartition modes de paiement ── */}
        <div className="rounded-[10px] px-[18px] py-[16px]"
          style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
          <div className="font-bold uppercase tracking-[.1em] mb-[14px]"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            Répartition paiements (moy.)
          </div>
          {[
            { label: 'Espèces',  pct: 51, color: '#EF9F27' },
            { label: 'En ligne', pct: 32, color: '#185FA5' },
            { label: 'Carte TPE', pct: 17, color: '#534AB7' },
          ].map(({ label, pct, color }) => (
            <div key={label} className="mb-[10px]">
              <div className="flex justify-between mb-[3px]">
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{label}</span>
                <span className="font-bold" style={{ fontSize: 11, color }}>{pct} %</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 5, background: 'var(--color-sep)' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tableau par session ── */}
      <div className="rounded-[10px] overflow-hidden mt-[14px]"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>

        <div className="font-bold uppercase tracking-[.1em] px-[16px] py-[10px]"
          style={{ fontSize: 11, color: 'var(--color-text-secondary)', borderBottom: '.5px solid var(--color-sep)' }}>
          Détail par session
        </div>

        {/* Header colonnes */}
        <div className="grid font-bold uppercase tracking-[.09em] px-[16px] py-[7px]"
          style={{
            gridTemplateColumns: '1fr 90px 90px 80px 80px 80px 90px',
            fontSize: 10, color: 'var(--color-text-hint)',
            borderBottom: '.5px solid var(--color-sep)',
          }}>
          {['Session', 'Date', 'Cartons', 'Taux', 'Partic.', 'Gratuits', 'Recettes'].map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>

        {SESSIONS.map((r, i) => {
          const taux = Math.round((r.cartonsSold / r.cartonsMax) * 100)
          return (
            <div key={r.id}
              className="grid items-center px-[16px] py-[10px] transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
              style={{
                gridTemplateColumns: '1fr 90px 90px 80px 80px 80px 90px',
                borderBottom: i < SESSIONS.length - 1 ? '.5px solid var(--color-sep)' : undefined,
              }}>
              <span className="font-bold" style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                {r.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{r.date}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {r.cartonsSold} / {r.cartonsMax}
              </span>
              <span className="font-bold" style={{ fontSize: 12, color: taux >= 90 ? 'var(--color-qgreen-text)' : taux >= 60 ? 'var(--color-amber)' : 'var(--color-orange)' }}>
                {taux} %
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{r.participants}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{r.gratuits}</span>
              <span className="font-bold font-display" style={{ fontSize: 16, color: 'var(--color-amber)' }}>
                {r.recettes.toLocaleString('fr-FR')} €
              </span>
            </div>
          )
        })}

        {/* Ligne total */}
        <div className="grid items-center px-[16px] py-[10px] font-bold"
          style={{
            gridTemplateColumns: '1fr 90px 90px 80px 80px 80px 90px',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
          }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Total</span>
          <span />
          <span style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{totalCartons}</span>
          <span />
          <span style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{totalParticipants}</span>
          <span />
          <span className="font-display" style={{ fontSize: 18, color: 'var(--color-amber)' }}>
            {totalRecettes.toLocaleString('fr-FR')} €
          </span>
        </div>
      </div>
    </div>
  )
}
