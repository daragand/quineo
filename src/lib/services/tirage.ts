/**
 * Service tirage.
 * Sécurité : le tirage est toujours vérifié via la session (include + where association_id).
 * Un tirage sans session valide pour cette association n'est jamais retourné.
 */

import { Op } from 'sequelize'
import { db } from '@/lib/db'
import { assocScope } from './scope'
import type { TokenPayload } from '@/lib/auth'
import type { TirageData, AvailableSession } from '@/app/(app)/tirage/TirageClient'

// ─── Type pour la liste des tirages ───────────────────────────────────────────

export interface TirageListRow {
  id:            string
  status:        'pending' | 'running' | 'completed' | 'cancelled'
  session:       { id: string; name: string }
  lot:           { id: string; name: string; value: number | null }
  drawCount:     number
  startedAt:     string | null
  completedAt:   string | null
  winner:        { participantName: string; cartonSerial: string } | null
}

export async function listTirages(user: TokenPayload): Promise<TirageListRow[]> {
  const scope = assocScope(user)

  const sessions = await db.Session.findAll({
    where:      scope,
    attributes: ['id'],
    raw:        true,
  }) as unknown as Array<{ id: string }>

  if (sessions.length === 0) return []

  const sessionIds = sessions.map(s => s.id)

  const rows = await db.Tirage.findAll({
    where:   { session_id: { [Op.in]: sessionIds } },
    include: [
      { model: db.Lot,       as: 'lot',         attributes: ['id', 'name', 'value'] },
      { model: db.Session,   as: 'session',      attributes: ['id', 'name'] },
      { model: db.DrawEvent, as: 'draw_events',  attributes: ['id'] },
      {
        model:    db.Carton,
        as:       'winning_carton',
        required: false,
        include:  [{ model: db.Participant, as: 'participant', attributes: ['first_name', 'last_name'] }],
      },
    ],
    order: [['created_at', 'DESC']],
  })

  return rows.map(r => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t    = r.toJSON() as any
    const p    = t.winning_carton?.participant
    const name = p ? [p.first_name, p.last_name].filter(Boolean).join(' ') || null : null
    return {
      id:          t.id,
      status:      t.status,
      session:     { id: t.session.id, name: t.session.name },
      lot:         { id: t.lot.id, name: t.lot.name, value: t.lot.value != null ? parseFloat(t.lot.value) : null },
      drawCount:   (t.draw_events ?? []).length,
      startedAt:   t.started_at ?? null,
      completedAt: t.completed_at ?? null,
      winner:      name ? { participantName: name, cartonSerial: t.winning_carton?.serial_number ?? '' } : null,
    }
  })
}

export interface TiragePageData {
  tirage:             TirageData | null
  availableSessions:  AvailableSession[]
  associationName:    string
}

export async function getTirageData(user: TokenPayload): Promise<TiragePageData> {
  const scope = assocScope(user)

  const assoc = user.association_id
    ? await db.Association.findOne({
        where:      { id: user.association_id },
        attributes: ['name'],
        raw:        true,
      }) as { name: string } | null
    : null

  const associationName = assoc?.name ?? 'Mon Association'

  // Cherche un tirage en cours dont la session appartient à l'association
  const rawTirage = await db.Tirage.findOne({
    where: { status: 'running' },
    include: [
      { model: db.Lot,       as: 'lot',        attributes: ['id', 'name', 'value', 'order'] },
      { model: db.DrawEvent, as: 'draw_events', attributes: ['number', 'sequence'] },
      {
        model:      db.Session,
        as:         'session',
        where:      scope,
        attributes: ['id', 'name'],
      },
    ],
  })

  let tirage: TirageData | null = null

  if (rawTirage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = rawTirage.toJSON() as any
    const partners = await db.Partner.findAll({
      where:      { session_id: t.session_id, active: true },
      attributes: ['id', 'name'],
      order:      [['order', 'ASC']],
      raw:        true,
    }) as unknown as Array<{ id: string; name: string }>

    tirage = {
      id:          t.id,
      session_id:  t.session_id,
      lot:         t.lot,
      draw_events: t.draw_events ?? [],
      session:     t.session,
      partners,
    }
  }

  if (tirage) {
    return { tirage, availableSessions: [], associationName }
  }

  // Pas de tirage actif : charger les sessions disponibles
  const sessions = await db.Session.findAll({
    where: { ...scope, status: { [Op.in]: ['open', 'running'] } },
    attributes: ['id', 'name', 'status'],
    order: [['date', 'DESC']],
  })

  const availableSessions: AvailableSession[] = await Promise.all(
    sessions.map(async (s) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sv = s.toJSON() as any
      const lots = await db.Lot.findAll({
        where:      { session_id: sv.id, status: 'pending' },
        attributes: ['id', 'name', 'value', 'order'],
        order:      [['order', 'ASC']],
        raw:        true,
      }) as unknown as Array<{ id: string; name: string; value: string | null; order: number }>

      return {
        id:     sv.id,
        name:   sv.name,
        status: sv.status,
        lots:   lots.map(l => ({
          id:    l.id,
          name:  l.name,
          value: l.value != null ? parseFloat(l.value) : null,
          order: l.order,
        })),
      }
    })
  )

  return { tirage: null, availableSessions, associationName }
}
