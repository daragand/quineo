import { QueryTypes } from 'sequelize'
import { db } from '@/lib/db'
import { SessionsClient } from './Client'
import type { SessionStatus } from '@/types/session'

export default async function SessionsPage() {
  const rawSessions = await db.Session.findAll({
    attributes: ['id', 'name', 'date', 'status', 'max_cartons', 'description'],
    order: [['date', 'DESC']],
    raw: true,
  }) as unknown as Array<{
    id: string; name: string; date: string | null
    status: string; max_cartons: number | null; description: string | null
  }>

  const cartonCounts = await db.sequelize.query<{ session_id: string; count: string }>(
    `SELECT session_id, COUNT(*) AS count FROM cartons WHERE status = 'sold' GROUP BY session_id`,
    { type: QueryTypes.SELECT },
  )
  const cartonMap = new Map(cartonCounts.map(r => [r.session_id, parseInt(r.count, 10)]))

  const revenues = await db.sequelize.query<{ session_id: string; total: string }>(
    `SELECT c.session_id, COALESCE(SUM(p.amount), 0) AS total
     FROM paiements p
     JOIN paiement_cartons pc ON pc.paiement_id = p.id
     JOIN cartons c ON c.id = pc.carton_id
     WHERE p.status = 'completed'
     GROUP BY c.session_id`,
    { type: QueryTypes.SELECT },
  )
  const revenueMap = new Map(revenues.map(r => [r.session_id, parseFloat(r.total)]))

  const sessions = rawSessions.map(s => ({
    id:            s.id,
    name:          s.name,
    description:   s.description ?? undefined,
    date:          s.date ?? undefined,
    status:        s.status as SessionStatus,
    cartonsVendus: cartonMap.get(s.id) ?? 0,
    cartonsMax:    s.max_cartons ?? 0,
    recettes:      revenueMap.get(s.id) ?? 0,
  }))

  return <SessionsClient initialSessions={sessions} />
}
