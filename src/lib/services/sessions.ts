/**
 * Service sessions — toutes les requêtes DB liées aux sessions.
 * Toujours appelé avec un TokenPayload ; filtrage multi-tenant via assocScope().
 */

import { Op, QueryTypes } from 'sequelize'
import { db } from '@/lib/db'
import { assocScope } from './scope'
import type { TokenPayload } from '@/lib/auth'
import type { SessionStatus } from '@/types/session'

export interface SessionRow {
  id:            string
  name:          string
  description:   string | undefined
  date:          string | undefined
  status:        SessionStatus
  cartonsVendus: number
  cartonsMax:    number
  recettes:      number
}

export async function listSessions(user: TokenPayload): Promise<SessionRow[]> {
  const scope = assocScope(user)

  const raw = await db.Session.findAll({
    where:      scope,
    attributes: ['id', 'name', 'date', 'status', 'max_cartons', 'description'],
    order:      [['date', 'ASC']],
    raw:        true,
  }) as unknown as Array<{
    id: string; name: string; date: string | null
    status: string; max_cartons: number | null; description: string | null
  }>

  if (raw.length === 0) return []

  const sessionIds = raw.map(s => s.id)

  const cartonCounts = await db.sequelize.query<{ session_id: string; count: string }>(
    `SELECT session_id, COUNT(*) AS count
     FROM cartons
     WHERE status = 'sold' AND session_id IN (:sessionIds)
     GROUP BY session_id`,
    { type: QueryTypes.SELECT, replacements: { sessionIds } },
  )
  const cartonMap = new Map(cartonCounts.map(r => [r.session_id, parseInt(r.count, 10)]))

  const revenues = await db.sequelize.query<{ session_id: string; total: string }>(
    `SELECT c.session_id, COALESCE(SUM(p.amount), 0) AS total
     FROM paiements p
     JOIN paiement_cartons pc ON pc.paiement_id = p.id
     JOIN cartons c ON c.id = pc.carton_id
     WHERE p.status = 'completed' AND c.session_id IN (:sessionIds)
     GROUP BY c.session_id`,
    { type: QueryTypes.SELECT, replacements: { sessionIds } },
  )
  const revenueMap = new Map(revenues.map(r => [r.session_id, parseFloat(r.total)]))

  return raw.map(s => ({
    id:            s.id,
    name:          s.name,
    description:   s.description ?? undefined,
    date:          s.date ?? undefined,
    status:        s.status as SessionStatus,
    cartonsVendus: cartonMap.get(s.id) ?? 0,
    cartonsMax:    s.max_cartons ?? 0,
    recettes:      revenueMap.get(s.id) ?? 0,
  }))
}

// ─── Helper interne : résoudre la session de référence d'une association ──────
// Priorité : running > open > draft > la plus récente
const STATUS_PRIORITY: Record<string, number> = { running: 1, open: 2, draft: 3 }

export async function resolveRefSession(
  user: TokenPayload,
): Promise<{ id: string; name: string; status: string; max_cartons: number | null } | null> {
  const scope = assocScope(user)

  const toISO = (d: unknown): string => {
    if (!d) return ''
    if (d instanceof Date) return d.toISOString().slice(0, 10)
    return String(d).slice(0, 10)
  }

  const sessions = await db.Session.findAll({
    where:      { ...scope, status: { [Op.in]: ['running', 'open', 'draft'] } },
    attributes: ['id', 'name', 'status', 'max_cartons', 'date'],
    order:      [['date', 'ASC']],
    raw:        true,
  }) as unknown as Array<{ id: string; name: string; status: string; max_cartons: number | null; date: string | null }>

  if (sessions.length > 0) {
    return sessions.sort((a, b) => {
      const pDiff = (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
      if (pDiff !== 0) return pDiff
      const aISO = toISO(a.date)
      const bISO = toISO(b.date)
      return aISO < bISO ? -1 : aISO > bISO ? 1 : 0
    })[0]
  }

  // Aucune session active : prendre la prochaine quelle que soit son statut
  return db.Session.findOne({
    where:      scope,
    attributes: ['id', 'name', 'status', 'max_cartons'],
    order:      [['date', 'ASC']],
    raw:        true,
  }) as Promise<{ id: string; name: string; status: string; max_cartons: number | null } | null>
}
