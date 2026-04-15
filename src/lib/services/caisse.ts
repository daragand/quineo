/**
 * Service caisse.
 * Sécurité : session vérifiée via assocScope, cartons et packs scopés par session_id.
 */

import { Op } from 'sequelize'
import { db } from '@/lib/db'
import { assocScope } from './scope'
import type { TokenPayload } from '@/lib/auth'
import type { Pack } from '@/components/caisse/ForfaitList'

const PACK_COLORS = ['#4A90B8', '#2BBFA4', '#534AB7', '#B84000', '#A32D2D', '#0891B2']

export interface CaisseSession {
  id:          string
  name:        string
  status:      string
  max_cartons: number | null
}

export interface CaisseData {
  session:           CaisseSession | null
  packs:             Pack[]
  cartonsAvailable:  number
  cartonsTotal:      number
}

export async function getCaisseData(user: TokenPayload): Promise<CaisseData> {
  const scope = assocScope(user)

  const sessions = await db.Session.findAll({
    where:      { ...scope, status: { [Op.in]: ['open', 'running'] } },
    attributes: ['id', 'name', 'status', 'max_cartons'],
    order:      [['date', 'DESC']],
    raw:        true,
  }) as unknown as CaisseSession[]

  const session = sessions.find(s => s.status === 'running') ?? sessions[0] ?? null

  if (!session) return { session: null, packs: [], cartonsAvailable: 0, cartonsTotal: 0 }

  const rawPacks = await db.CartonPack.findAll({
    where: { session_id: session.id, is_active: true },
    order: [['display_order', 'ASC']],
    raw:   true,
  }) as unknown as Array<{
    id: string; label: string; quantity: number
    price: string; price_unit: string | null; max_per_person: number | null
  }>

  const packs: Pack[] = rawPacks.map((p, i) => {
    const price     = parseFloat(p.price)
    const qty       = p.quantity
    const unitPrice = p.price_unit ? parseFloat(p.price_unit) : (qty > 0 ? price / qty : price)
    return {
      id:      p.id,
      qty,
      label:   p.label,
      price,
      unitPrice,
      maxPer:  p.max_per_person ?? null,
      color:   PACK_COLORS[i % PACK_COLORS.length],
    }
  })

  const counts = await db.Carton.findAll({
    where:      { session_id: session.id },
    attributes: ['status', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
    group:      ['status'],
    raw:        true,
  }) as unknown as Array<{ status: string; count: string }>

  let cartonsTotal     = 0
  let cartonsAvailable = 0
  for (const row of counts) {
    const n = parseInt(row.count, 10)
    cartonsTotal += n
    if (row.status === 'available') cartonsAvailable = n
  }

  return { session, packs, cartonsAvailable, cartonsTotal }
}
