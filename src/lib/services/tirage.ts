/**
 * Service tirage.
 * Sécurité : le tirage est toujours vérifié via la session (include + where association_id).
 * Un tirage sans session valide pour cette association n'est jamais retourné.
 */

import { Op } from 'sequelize'
import { db } from '@/lib/db'
import { assocScope } from './scope'
import type { TokenPayload } from '@/lib/auth'

// ─────────────────────────────────────────
// Types exportés (utilisés dans TirageClient)
// ─────────────────────────────────────────

export type TirageType = 'quine' | 'double_quine' | 'carton_plein' | 'pause'

export interface TirageSequenceItem {
  id:     string
  type:   TirageType
  order:  number
  status: 'draft' | 'ready' | 'running' | 'completed' | 'cancelled'
  lots:   Array<{ id: string; name: string; value: number | null }>
}

export interface TirageData {
  id:          string
  session_id:  string
  type:        TirageType
  lot:         { id: string; name: string; value: number | null; order: number; image_url: string | null } | null
  draw_events: Array<{ number: number; sequence: number }>
  session:     { id: string; name: string }
  partners:    Array<{ id: string; name: string }>
  sequence:    TirageSequenceItem[]
}

export interface PendingLot {
  id:    string
  name:  string
  value: number | null
  order: number
}

export interface AvailableSession {
  id:      string
  name:    string
  status:  string
  date?:   string
  lots:    PendingLot[]
  tirages: TirageSequenceItem[]
}

// ─── Type pour la liste des tirages ───────────────────────────────────────────

export interface TirageListRow {
  id:          string
  status:      'pending' | 'running' | 'completed' | 'cancelled'
  session:     { id: string; name: string }
  lot:         { id: string; name: string; value: number | null }
  drawCount:   number
  startedAt:   string | null
  completedAt: string | null
  winner:      { participantName: string; cartonSerial: string } | null
}

// ─────────────────────────────────────────
// Helper : séquence complète d'une session
// ─────────────────────────────────────────

async function loadSessionSequence(sessionId: string): Promise<TirageSequenceItem[]> {
  const tirages = await db.Tirage.findAll({
    where: { session_id: sessionId },
    order: [['order', 'ASC']],
    raw:   true,
  }) as unknown as Array<{ id: string; type: string | null; order: number; status: string }>

  if (tirages.length === 0) return []

  const ids = tirages.map(t => t.id)

  const tirageLots = await db.TirageLot.findAll({
    where:   { tirage_id: ids },
    include: [{ model: db.Lot, as: 'lot', attributes: ['id', 'name', 'value'] }],
    order:   [['order', 'ASC']],
  })

  const lotsMap = new Map<string, Array<{ id: string; name: string; value: number | null }>>()
  for (const tl of tirageLots) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = tl.toJSON() as any
    if (!lotsMap.has(row.tirage_id)) lotsMap.set(row.tirage_id, [])
    lotsMap.get(row.tirage_id)!.push({
      id:    row.lot.id,
      name:  row.lot.name,
      value: row.lot.value != null ? parseFloat(row.lot.value) : null,
    })
  }

  return tirages.map(t => ({
    id:     t.id,
    type:   (t.type ?? 'quine') as TirageType,
    order:  t.order,
    status: t.status as TirageSequenceItem['status'],
    lots:   lotsMap.get(t.id) ?? [],
  }))
}

// ─────────────────────────────────────────
// listTirages
// ─────────────────────────────────────────

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
      lot:         { id: t.lot?.id, name: t.lot?.name, value: t.lot?.value != null ? parseFloat(t.lot.value) : null },
      drawCount:   (t.draw_events ?? []).length,
      startedAt:   t.started_at ?? null,
      completedAt: t.completed_at ?? null,
      winner:      name ? { participantName: name, cartonSerial: t.winning_carton?.serial_number ?? '' } : null,
    }
  })
}

// ─────────────────────────────────────────
// getTirageData
// ─────────────────────────────────────────

export interface TiragePageData {
  tirage:            TirageData | null
  availableSessions: AvailableSession[]
  associationName:   string
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

  // ── Tirage en cours ────────────────────────────────────────────────────────

  const rawTirage = await db.Tirage.findOne({
    where:   { status: 'running' },
    include: [
      { model: db.Lot,       as: 'lot',        attributes: ['id', 'name', 'value', 'order', 'image_url'], required: false },
      { model: db.DrawEvent, as: 'draw_events', attributes: ['number', 'sequence'] },
      { model: db.Session,   as: 'session',     where: scope, attributes: ['id', 'name'] },
    ],
  })

  if (rawTirage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = rawTirage.toJSON() as any

    // Lot principal : d'abord via TirageLot, sinon via lot_id direct (rétrocompat.)
    const tirageLots = await db.TirageLot.findAll({
      where:   { tirage_id: t.id },
      include: [{ model: db.Lot, as: 'lot', attributes: ['id', 'name', 'value', 'order', 'image_url'] }],
      order:   [['order', 'ASC']],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstLotRaw = tirageLots.length > 0 ? (tirageLots[0].toJSON() as any).lot : t.lot

    const lot = firstLotRaw
      ? {
          id:        firstLotRaw.id,
          name:      firstLotRaw.name,
          value:     firstLotRaw.value != null ? parseFloat(firstLotRaw.value) : null,
          order:     firstLotRaw.order ?? 0,
          image_url: firstLotRaw.image_url ?? null,
        }
      : null

    const partners = await db.Partner.findAll({
      where:      { session_id: t.session_id, active: true },
      attributes: ['id', 'name'],
      order:      [['order', 'ASC']],
      raw:        true,
    }) as unknown as Array<{ id: string; name: string }>

    const sequence = await loadSessionSequence(t.session_id)

    const tirage: TirageData = {
      id:          t.id,
      session_id:  t.session_id,
      type:        (t.type ?? 'quine') as TirageType,
      lot,
      draw_events: t.draw_events ?? [],
      session:     t.session,
      partners,
      sequence,
    }

    return { tirage, availableSessions: [], associationName }
  }

  // ── Pas de tirage actif : charger les sessions disponibles ─────────────────

  const sessions = await db.Session.findAll({
    where:      { ...scope, status: { [Op.in]: ['open', 'running'] } },
    attributes: ['id', 'name', 'status', 'date'],
    order:      [['date', 'ASC']],
    raw:        true,
  }) as unknown as Array<{ id: string; name: string; status: string; date: string | null }>

  const toISO = (d: unknown): string => {
    if (!d) return ''
    if (d instanceof Date) return d.toISOString().slice(0, 10)
    return String(d).slice(0, 10)
  }

  // Ne garder que les sessions en cours ou à venir (exclure les passées)
  const todayISO = new Date().toISOString().slice(0, 10)
  const filtered = sessions.filter(s => {
    if (s.status === 'running') return true
    const iso = toISO(s.date)
    return !iso || iso >= todayISO
  })

  // Trier : running en premier, puis chronologiquement ascendant (le plus proche en haut)
  const sorted = filtered.slice().sort((a, b) => {
    if (a.status === 'running' && b.status !== 'running') return -1
    if (b.status === 'running' && a.status !== 'running') return 1
    const aISO = toISO(a.date)
    const bISO = toISO(b.date)
    if (!aISO && !bISO) return 0
    if (!aISO) return 1
    if (!bISO) return -1
    return aISO < bISO ? -1 : aISO > bISO ? 1 : 0
  })

  const availableSessions: AvailableSession[] = await Promise.all(
    sorted.map(async (sv) => {
      const lots = await db.Lot.findAll({
        where:      { session_id: sv.id, status: 'pending' },
        attributes: ['id', 'name', 'value', 'order'],
        order:      [['order', 'ASC']],
        raw:        true,
      }) as unknown as Array<{ id: string; name: string; value: string | null; order: number }>

      const tirages = await loadSessionSequence(sv.id)

      return {
        id:      sv.id,
        name:    sv.name,
        status:  sv.status,
        date:    sv.date ?? undefined,
        lots:    lots.map(l => ({
          id:    l.id,
          name:  l.name,
          value: l.value != null ? parseFloat(l.value) : null,
          order: l.order,
        })),
        tirages,
      }
    }),
  )

  return { tirage: null, availableSessions, associationName }
}
