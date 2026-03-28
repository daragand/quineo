/**
 * Service lots.
 * Sécurité : les lots sont systématiquement scopés par session,
 * et la session est vérifiée via assocScope (association de l'utilisateur).
 */

import { db } from '@/lib/db'
import { assocScope } from './scope'
import { resolveRefSession } from './sessions'
import type { TokenPayload } from '@/lib/auth'
import type { LotStatus } from '@/types/session'

export interface LotRow {
  id:          string
  name:        string
  description: string | undefined
  order:       number
  value:       number | undefined
  status:      LotStatus
  image_url:   string | undefined
}

export interface LotsData {
  session: { id: string; name: string } | null
  lots:    LotRow[]
}

export async function listLots(user: TokenPayload): Promise<LotsData> {
  assocScope(user) // throw si non authentifié

  const session = await resolveRefSession(user)
  if (!session) return { session: null, lots: [] }

  const raw = await db.Lot.findAll({
    where:      { session_id: session.id },
    attributes: ['id', 'name', 'description', 'order', 'value', 'status', 'image_url'],
    order:      [['order', 'ASC']],
    raw:        true,
  }) as unknown as Array<{
    id: string; name: string; description: string | null
    order: number; value: string | null; status: string; image_url: string | null
  }>

  return {
    session,
    lots: raw.map(l => ({
      id:          l.id,
      name:        l.name,
      description: l.description ?? undefined,
      order:       l.order,
      value:       l.value != null ? parseFloat(l.value) : undefined,
      status:      l.status as LotStatus,
      image_url:   l.image_url ?? undefined,
    })),
  }
}
