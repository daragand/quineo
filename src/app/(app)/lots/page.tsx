import { Op } from 'sequelize'
import { db } from '@/lib/db'
import { LotsClient } from './Client'
import type { LotStatus } from '@/types/session'

export default async function LotsPage() {
  // Session de référence : running > open > plus récente
  const session = (
    await db.Session.findOne({
      where: { status: { [Op.in]: ['running', 'open'] } },
      order: [['date', 'DESC']],
      raw: true,
    }) ??
    await db.Session.findOne({ order: [['date', 'DESC']], raw: true })
  ) as { id: string; name: string } | null

  const rawLots = session
    ? await db.Lot.findAll({
        where: { session_id: session.id },
        attributes: ['id', 'name', 'description', 'order', 'value', 'status'],
        order: [['order', 'ASC']],
        raw: true,
      }) as unknown as Array<{
        id: string; name: string; description: string | null
        order: number; value: string | null; status: string
      }>
    : []

  const lots = rawLots.map(l => ({
    id:          l.id,
    name:        l.name,
    description: l.description ?? undefined,
    order:       l.order,
    value:       l.value != null ? parseFloat(l.value) : undefined,
    status:      l.status as LotStatus,
  }))

  return (
    <LotsClient
      initialLots={lots}
      sessionName={session?.name ?? 'Aucune session active'}
    />
  )
}
