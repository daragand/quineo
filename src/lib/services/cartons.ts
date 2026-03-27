/**
 * Service cartons.
 * Sécurité : la session est vérifiée via assocScope avant toute requête carton.
 */

import { Op } from 'sequelize'
import { db } from '@/lib/db'
import { assocScope } from './scope'
import type { TokenPayload } from '@/lib/auth'
import type { CartonStatus } from '@/types/session'

export interface CartonRow {
  id:          string
  serial:      string
  sessionName: string
  participant: string | null
  status:      CartonStatus
  grid?:       number[][]
}

export interface SessionOption {
  id:          string
  name:        string
  status:      string
  max_cartons: number | null
}

export interface CartonsData {
  sessions:          SessionOption[]
  session:           SessionOption | null
  cartons:           CartonRow[]
  total:             number
  counts: {
    available: number
    sold:      number
    cancelled: number
  }
}

export async function listCartons(user: TokenPayload): Promise<CartonsData> {
  const scope = assocScope(user)

  const allSessions = await db.Session.findAll({
    where:      scope,
    attributes: ['id', 'name', 'status', 'max_cartons'],
    order:      [['date', 'DESC']],
    raw:        true,
  }) as unknown as SessionOption[]

  const session =
    allSessions.find(s => s.status === 'open')    ??
    allSessions.find(s => s.status === 'draft')   ??
    allSessions.find(s => s.status === 'running') ??
    allSessions[0] ??
    null

  if (!session) {
    return { sessions: allSessions, session: null, cartons: [], total: 0, counts: { available: 0, sold: 0, cancelled: 0 } }
  }

  const rawCartons = await db.Carton.findAll({
    where:   { session_id: session.id },
    attributes: ['id', 'serial_number', 'grid', 'status'],
    include: [{
      model:      db.Participant,
      as:         'participant',
      attributes: ['first_name', 'last_name'],
      required:   false,
    }],
    order: [['serial_number', 'ASC']],
    limit: 50,
  })

  const total = await db.Carton.count({ where: { session_id: session.id } })

  const statusCounts = await db.Carton.findAll({
    where:      { session_id: session.id, status: { [Op.in]: ['available', 'sold', 'cancelled'] } },
    attributes: ['status', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
    group:      ['status'],
    raw:        true,
  }) as unknown as Array<{ status: string; count: string }>

  const countMap = Object.fromEntries(statusCounts.map(r => [r.status, parseInt(r.count, 10)]))

  const cartons: CartonRow[] = rawCartons.map(c => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = c.toJSON() as any
    const p   = raw.participant
    return {
      id:          raw.id as string,
      serial:      raw.serial_number as string,
      sessionName: session.name,
      participant: p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || null : null,
      status:      raw.status as CartonStatus,
      grid:        raw.grid as number[][] | undefined,
    }
  })

  return {
    sessions: allSessions,
    session,
    cartons,
    total,
    counts: {
      available: countMap['available'] ?? 0,
      sold:      countMap['sold']      ?? 0,
      cancelled: countMap['cancelled'] ?? 0,
    },
  }
}
