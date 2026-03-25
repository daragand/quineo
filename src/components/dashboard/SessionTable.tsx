import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { Session } from '@/types/session'

// ─────────────────────────────────────────
// Types locaux
// ─────────────────────────────────────────

interface SessionRow {
  id: string
  name: string
  date?: string
  cartonsSold: number
  cartonsMax: number
  status: Session['status']
}

interface SessionTableProps {
  rows: SessionRow[]
}

// ─────────────────────────────────────────
// Label action par statut
// ─────────────────────────────────────────

function actionLabel(status: Session['status']): string {
  if (status === 'running') return 'Gérer'
  if (status === 'draft')   return 'Éditer'
  return 'Rapport'
}

function actionHref(id: string, status: Session['status']): string {
  if (status === 'draft')   return `/sessions/${id}/edit`
  if (status === 'running') return `/sessions/${id}`
  return `/sessions/${id}/rapport`
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function SessionTable({ rows }: SessionTableProps) {
  return (
    <table className="w-full border-collapse" aria-label="Sessions récentes">
      <thead>
        <tr>
          {(['Nom', 'Date', 'Cartons', 'Statut', ''] as const).map((h) => (
            <th
              key={h}
              className="pb-[8px] text-left font-bold uppercase tracking-[.1em]"
              style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td
              className="py-[7px] font-bold"
              style={{
                borderTop: '.5px solid var(--color-sep)',
                fontSize: 12,
                color: 'var(--color-text-primary)',
              }}
            >
              {row.name}
            </td>
            <td
              className="py-[7px]"
              style={{
                borderTop: '.5px solid var(--color-sep)',
                fontSize: 12,
                color: 'var(--color-text-secondary)',
              }}
            >
              {row.date
                ? new Date(row.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </td>
            <td
              className="py-[7px]"
              style={{
                borderTop: '.5px solid var(--color-sep)',
                fontSize: 12,
                color: 'var(--color-text-secondary)',
              }}
            >
              {row.cartonsSold} / {row.cartonsMax}
            </td>
            <td
              className="py-[7px]"
              style={{ borderTop: '.5px solid var(--color-sep)' }}
            >
              <Badge variant={row.status === 'open' ? 'active' : row.status as 'draft' | 'closed' | 'cancelled' | 'running'} />
            </td>
            <td
              className="py-[7px] text-right"
              style={{ borderTop: '.5px solid var(--color-sep)' }}
            >
              <Link
                href={actionHref(row.id, row.status)}
                className="font-bold hover:opacity-70 transition-opacity duration-[100ms]"
                style={{ fontSize: 11, color: 'var(--color-qblue)' }}
              >
                {actionLabel(row.status)}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
