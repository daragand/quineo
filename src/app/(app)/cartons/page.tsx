import { Op } from 'sequelize'
import { db } from '@/lib/db'
import { CartonsClient } from './Client'
import type { CartonStatus } from '@/types/session'

export default async function CartonsPage() {
  // Session de référence
  const session = (
    await db.Session.findOne({
      where: { status: { [Op.in]: ['running', 'open'] } },
      order: [['date', 'DESC']],
      raw: true,
    }) ??
    await db.Session.findOne({ order: [['date', 'DESC']], raw: true })
  ) as { id: string; name: string } | null

  const rawCartons = session
    ? await db.Carton.findAll({
        where: { session_id: session.id },
        attributes: ['id', 'serial_number', 'status'],
        include: [{
          model: db.Participant,
          as: 'participant',
          attributes: ['first_name', 'last_name'],
          required: false,
        }],
        order: [['serial_number', 'ASC']],
        limit: 100,
      })
    : []

  const total = session
    ? await db.Carton.count({ where: { session_id: session.id } })
    : 0

  const cartons = rawCartons.map((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = c.toJSON() as any
    const p = raw.participant
    return {
      id:          raw.id as string,
      ref:         raw.serial_number as string,
      sessionName: session?.name ?? '',
      participant: p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || null : null,
      status:      raw.status as CartonStatus,
    }
  })

  return (
    <CartonsClient
      initialCartons={cartons}
      sessionName={session?.name ?? 'Aucune session active'}
      total={total}
    />
  )
}
