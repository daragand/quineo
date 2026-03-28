import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { withAuth } from '@/lib/auth'
import { getRapportsData } from '@/lib/services/rapports'
import { RapportPdfDocument } from '@/lib/rapportPdf'

// ─────────────────────────────────────────
// GET /api/rapports/export?format=csv|pdf&year=2026
// ─────────────────────────────────────────

export const GET = withAuth(async (req: NextRequest, { user }) => {
  const { searchParams } = req.nextUrl
  const format = searchParams.get('format') ?? 'csv'
  const year   = searchParams.get('year')   ?? String(new Date().getFullYear())

  if (format !== 'csv' && format !== 'pdf') {
    return NextResponse.json({ error: 'Format invalide (csv ou pdf)' }, { status: 400 })
  }

  const data = await getRapportsData(user, year)

  // ── CSV ────────────────────────────────────────────────────────────────────

  if (format === 'csv') {
    const csv = buildCsv(data.sessions, data.monthly, data.associationName, year)
    return new NextResponse(csv, {
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rapport-${data.associationName.replace(/\s+/g, '-').toLowerCase()}-${year}.csv"`,
      },
    })
  }

  // ── PDF ────────────────────────────────────────────────────────────────────

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(RapportPdfDocument, {
      sessions:        data.sessions,
      monthly:         data.monthly,
      associationName: data.associationName,
      year,
    }) as any
  )

  return new NextResponse(Buffer.from(buffer) as unknown as BodyInit, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="rapport-${data.associationName.replace(/\s+/g, '-').toLowerCase()}-${year}.pdf"`,
    },
  })
})

// ─────────────────────────────────────────
// Builder CSV
// ─────────────────────────────────────────

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function esc(v: string | number): string {
  const s = String(v)
  if (s.includes(';') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function fmtEur(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function buildCsv(
  sessions: import('@/lib/services/rapports').SessionStat[],
  monthly:  import('@/lib/services/rapports').MonthlyPoint[],
  assoc:    string,
  year:     string,
): string {
  const rows: string[] = []

  const line = (...cols: (string | number)[]) => rows.push(cols.map(esc).join(';'))
  const blank = () => rows.push('')

  // ── En-tête document ──
  line(`Rapport financier — ${assoc} — ${year}`)
  line(`Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`)
  blank()

  // ── KPIs ──
  const totalRecettes     = sessions.reduce((s, r) => s + r.recettes, 0)
  const totalCartons      = sessions.reduce((s, r) => s + r.cartonsSold, 0)
  const totalParticipants = sessions.reduce((s, r) => s + r.participants, 0)
  const avgRemplissage    = sessions.length > 0
    ? Math.round(sessions.reduce((s, r) => s + (r.cartonsMax > 0 ? (r.cartonsSold / r.cartonsMax) * 100 : 0), 0) / sessions.length)
    : 0

  line('RÉSUMÉ')
  line('Recettes totales',    fmtEur(totalRecettes))
  line('Cartons vendus',      totalCartons)
  line('Participants uniques', totalParticipants)
  line('Sessions organisées', sessions.length)
  line('Remplissage moyen',   `${avgRemplissage} %`)
  blank()

  // ── Détail par session ──
  line('DÉTAIL PAR SESSION')
  line('Session', 'Date', 'Cartons vendus', 'Cartons max', 'Taux remplissage', 'Participants', 'Recettes')

  for (const r of sessions) {
    const taux   = r.cartonsMax > 0 ? `${Math.round((r.cartonsSold / r.cartonsMax) * 100)} %` : '—'
    const date   = r.date ? new Date(r.date).toLocaleDateString('fr-FR') : '—'
    const maxStr = r.cartonsMax > 0 ? String(r.cartonsMax) : '—'
    line(r.name, date, r.cartonsSold, maxStr, taux, r.participants, fmtEur(r.recettes))
  }

  // Ligne total
  line('TOTAL', '', totalCartons, '', `${avgRemplissage} %`, totalParticipants, fmtEur(totalRecettes))
  blank()

  // ── Recettes mensuelles ──
  line(`RECETTES MENSUELLES ${year}`)
  line('Mois', 'Recettes')

  for (let m = 1; m <= 12; m++) {
    const point = monthly.find(d => d.month === m)
    line(MONTHS_FR[m - 1], fmtEur(point?.total ?? 0))
  }

  return '\uFEFF' + rows.join('\r\n')  // BOM UTF-8 pour Excel
}
