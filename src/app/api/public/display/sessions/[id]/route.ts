import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ─────────────────────────────────────────
// GET /api/public/display/sessions/[id]
// Retourne le tirage en cours pour une session — sans authentification.
// Utilisé par l'écran de diffusion public.
// ─────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params

  const rawTirage = await db.Tirage.findOne({
    where:   { session_id: sessionId, status: 'running' },
    include: [
      { model: db.Lot,       as: 'lot',        attributes: ['id', 'name', 'value', 'order'], required: false },
      { model: db.DrawEvent, as: 'draw_events', attributes: ['number', 'sequence'] },
      { model: db.Session,   as: 'session',     attributes: ['id', 'name'] },
    ],
  })

  if (!rawTirage) {
    return NextResponse.json({ tirage: null })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = rawTirage.toJSON() as any

  // Lot principal via TirageLot
  const tirageLots = await db.TirageLot.findAll({
    where:   { tirage_id: t.id },
    include: [{ model: db.Lot, as: 'lot', attributes: ['id', 'name', 'value', 'order'] }],
    order:   [['order', 'ASC']],
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstLotRaw = tirageLots.length > 0 ? (tirageLots[0].toJSON() as any).lot : t.lot
  const lot = firstLotRaw
    ? {
        id:    firstLotRaw.id,
        name:  firstLotRaw.name,
        value: firstLotRaw.value != null ? parseFloat(firstLotRaw.value) : null,
        order: firstLotRaw.order ?? 0,
      }
    : null

  const partners = await db.Partner.findAll({
    where:      { session_id: sessionId, active: true },
    attributes: ['id', 'name'],
    order:      [['order', 'ASC']],
    raw:        true,
  }) as unknown as Array<{ id: string; name: string }>

  // Séquence complète de la session
  const tiragesRaw = await db.Tirage.findAll({
    where: { session_id: sessionId },
    order: [['order', 'ASC']],
    raw:   true,
  }) as unknown as Array<{ id: string; type: string | null; order: number; status: string }>

  const ids = tiragesRaw.map(tr => tr.id)
  const allTirageLots = ids.length > 0
    ? await db.TirageLot.findAll({
        where:   { tirage_id: ids },
        include: [{ model: db.Lot, as: 'lot', attributes: ['id', 'name', 'value'] }],
        order:   [['order', 'ASC']],
      })
    : []

  const lotsMap = new Map<string, Array<{ id: string; name: string; value: number | null }>>()
  for (const tl of allTirageLots) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = tl.toJSON() as any
    if (!lotsMap.has(row.tirage_id)) lotsMap.set(row.tirage_id, [])
    lotsMap.get(row.tirage_id)!.push({
      id:    row.lot.id,
      name:  row.lot.name,
      value: row.lot.value != null ? parseFloat(row.lot.value) : null,
    })
  }

  const sequence = tiragesRaw.map(tr => ({
    id:     tr.id,
    type:   (tr.type ?? 'quine') as string,
    order:  tr.order,
    status: tr.status,
    lots:   lotsMap.get(tr.id) ?? [],
  }))

  return NextResponse.json({
    tirage: {
      id:          t.id,
      session_id:  sessionId,
      type:        t.type ?? 'quine',
      lot,
      draw_events: (t.draw_events ?? []).sort(
        (a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence,
      ),
      session:     t.session,
      partners,
      sequence,
    },
  })
}
