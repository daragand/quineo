/**
 * Service dashboard.
 * Sécurité : toutes les requêtes passent par assocScope.
 * Les audit_logs sont filtrés via session_id (sessions de l'association).
 */

import { Op, QueryTypes } from 'sequelize'
import { db } from '@/lib/db'
import { assocScope } from './scope'
import { resolveRefSession } from './sessions'
import type { TokenPayload } from '@/lib/auth'
import type { SessionStatus, TirageType } from '@/types/session'

export interface DashboardSession {
  id:          string
  name:        string
  date:        string | undefined
  cartonsSold: number
  cartonsMax:  number
  status:      SessionStatus
}

export interface DashboardLot {
  id:         string
  name:       string
  value:      number | undefined
  tirageType: TirageType
  status:     'pending' | 'drawn' | 'cancelled'
}

export interface DashboardProvider {
  name:   string
  sub:    string
  active: boolean
}

export interface DashboardActivity {
  id:      string
  variant: 'success' | 'info' | 'warning'
  text:    string
  time:    string
}

export interface DashboardData {
  sessions:     DashboardSession[]
  lots:         DashboardLot[]
  providers:    DashboardProvider[]
  activity:     DashboardActivity[]
  activeTirage: { lot: { name: string; order: number } | null; drawEventsCount: number } | null
  revenue:      number
  cartonsSold:  number
  cartonsMax:   number
}

function relativeTime(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime()
  const mins   = Math.floor(diffMs / 60_000)
  if (mins < 1)  return 'à l\'instant'
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

export async function getDashboardData(user: TokenPayload): Promise<DashboardData> {
  const scope = assocScope(user)
  const empty: DashboardData = {
    sessions: [], lots: [], providers: [], activity: [],
    activeTirage: null, revenue: 0, cartonsSold: 0, cartonsMax: 0,
  }

  // 1. Sessions récentes (max 4)
  const rawSessions = await db.Session.findAll({
    where:      scope,
    attributes: ['id', 'name', 'date', 'status', 'max_cartons'],
    order:      [['date', 'DESC']],
    limit:      4,
    raw:        true,
  }) as unknown as Array<{ id: string; name: string; date: string | null; status: string; max_cartons: number | null }>

  if (rawSessions.length === 0) return empty

  const sessionIds = rawSessions.map(s => s.id)

  // 2. Cartons vendus par session
  const cartonCounts = await db.sequelize.query<{ session_id: string; count: string }>(
    `SELECT session_id, COUNT(*) AS count
     FROM cartons
     WHERE status = 'sold' AND session_id IN (:sessionIds)
     GROUP BY session_id`,
    { type: QueryTypes.SELECT, replacements: { sessionIds } },
  )
  const cartonMap = new Map(cartonCounts.map(r => [r.session_id, parseInt(r.count, 10)]))

  // 3. Session de référence
  const refSession = await resolveRefSession(user)

  // 4. Lots de la session de référence (5 max)
  const rawLots = refSession
    ? await db.Lot.findAll({
        where:      { session_id: refSession.id },
        attributes: ['id', 'name', 'value', 'status'],
        order:      [['order', 'ASC']],
        limit:      5,
        raw:        true,
      }) as unknown as Array<{ id: string; name: string; value: string | null; status: string }>
    : []

  // 5. Tirage en cours
  const rawTirage = refSession
    ? await db.Tirage.findOne({
        where:   { session_id: refSession.id, status: 'running' },
        include: [{ model: db.Lot, as: 'lot', attributes: ['name', 'order'] }],
      })
    : null

  const tirageJson = rawTirage?.toJSON() as
    | { id: string; lot: { name: string; order: number } | null }
    | undefined

  const drawEventsCount = tirageJson
    ? await db.DrawEvent.count({ where: { tirage_id: tirageJson.id } })
    : 0

  // 6. Providers de paiement de l'association
  const rawProviders = await db.PaymentProvider.findAll({
    where:      scope,
    attributes: ['name', 'type', 'active'],
    raw:        true,
  }) as unknown as Array<{ name: string; type: string; active: boolean }>

  // 7. Recettes session de référence
  const revenueRows = refSession
    ? await db.sequelize.query<{ total: string }>(
        `SELECT COALESCE(SUM(p.amount), 0) AS total
         FROM paiements p
         JOIN paiement_cartons pc ON pc.paiement_id = p.id
         JOIN cartons c ON c.id = pc.carton_id
         WHERE c.session_id = :sessionId AND p.status = 'completed'`,
        { type: QueryTypes.SELECT, replacements: { sessionId: refSession.id } },
      )
    : [{ total: '0' }]

  // 8. Activité récente — audit_logs scopés via session_id
  const rawLogs = await db.AuditLog.findAll({
    where:  { session_id: { [Op.in]: sessionIds } },
    order:  [['created_at', 'DESC']],
    limit:  5,
    raw:    true,
  }) as unknown as Array<{
    id: string; action: string
    details: Record<string, unknown> | null; created_at: string
  }>

  // ─── Mise en forme ──────────────────────────────────────────

  const cartonsSold = refSession ? (cartonMap.get(refSession.id) ?? 0) : 0
  const cartonsMax  = refSession?.max_cartons ?? 0

  const activity: DashboardActivity[] = rawLogs.map(log => {
    const action = log.action
    let variant: 'success' | 'info' | 'warning' = 'info'
    if (action.includes('SOLD') || action.includes('TIRAGE_COMPLETED') || action.includes('WIN')) variant = 'success'
    else if (action.includes('WARN') || action.includes('QUOTA')) variant = 'warning'

    const d  = log.details
    let text = action
    if (d && typeof d === 'object' && 'participant_name' in d) {
      text = `<strong style="color:var(--color-text-primary);font-weight:700;">${d.participant_name}</strong> — ${action.toLowerCase().replace(/_/g, ' ')}`
    } else {
      text = action.replace(/_/g, ' ').toLowerCase()
    }
    return { id: log.id, variant, text, time: relativeTime(log.created_at) }
  })

  return {
    sessions: rawSessions.map(s => ({
      id:          s.id,
      name:        s.name,
      date:        s.date ?? undefined,
      cartonsSold: cartonMap.get(s.id) ?? 0,
      cartonsMax:  s.max_cartons ?? 0,
      status:      s.status as SessionStatus,
    })),
    lots: rawLots.map(l => ({
      id:         l.id,
      name:       l.name,
      value:      l.value != null ? parseFloat(l.value) : undefined,
      tirageType: 'quine' as TirageType,
      status:     l.status as 'pending' | 'drawn' | 'cancelled',
    })),
    providers: rawProviders.map(p => ({
      name:   p.name,
      sub:    p.type.charAt(0).toUpperCase() + p.type.slice(1),
      active: p.active,
    })),
    activity,
    activeTirage: tirageJson ? { lot: tirageJson.lot, drawEventsCount } : null,
    revenue:      parseFloat(revenueRows[0]?.total ?? '0'),
    cartonsSold,
    cartonsMax,
  }
}
