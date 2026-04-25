import { NextRequest, NextResponse } from 'next/server'
import { Op } from 'sequelize'
import { db } from '@/lib/db'
import { rateLimit, getClientIp, tooManyRequests } from '@/lib/rate-limit'

// ─────────────────────────────────────────
// GET /api/public/play/[paiement_id]
// Retourne la session, les cartons (grilles) et le tirage actif.
// Pas d'authentification — l'UUID du paiement fait office de clé.
// ─────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paiement_id: string }> },
) {
  const ip    = getClientIp(req)
  const limit = await rateLimit(`play:${ip}`, { limit: 60, window: 60 })
  if (!limit.success) return tooManyRequests(limit)

  const { paiement_id } = await params

  // ── 1. Paiement ───────────────────────────
  const paiement = await db.Paiement.findOne({
    where: {
      id:     paiement_id,
      status: { [Op.in]: ['completed', 'pending'] }, // pending = reserved (paiement en cours)
    },
    attributes: ['id', 'status'],
    raw: true,
  }) as { id: string; status: string } | null

  if (!paiement) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 })
  }

  // ── 2. Cartons liés au paiement ───────────
  const paiementCartons = await db.PaiementCarton.findAll({
    where: { paiement_id },
    attributes: ['carton_id'],
    raw: true,
  }) as unknown as Array<{ carton_id: string }>

  if (!paiementCartons.length) {
    return NextResponse.json({ error: 'Aucun carton trouvé' }, { status: 404 })
  }

  const cartonIds = paiementCartons.map(pc => pc.carton_id)

  const cartons = await db.Carton.findAll({
    where:      { id: { [Op.in]: cartonIds } },
    attributes: ['id', 'serial_number', 'grid', 'session_id'],
    raw: true,
  }) as unknown as Array<{ id: string; serial_number: string; grid: number[][]; session_id: string }>

  if (!cartons.length) {
    return NextResponse.json({ error: 'Aucun carton trouvé' }, { status: 404 })
  }

  // ── 3. Session ────────────────────────────
  const sessionId = cartons[0].session_id

  const session = await db.Session.findOne({
    where:      { id: sessionId },
    attributes: ['id', 'name', 'date', 'status'],
    include:    [{ model: db.Association, as: 'association', attributes: ['name'] }],
    raw:        true,
    nest:       true,
  }) as { id: string; name: string; date: string | null; status: string; association: { name: string } } | null

  if (!session) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
  }

  // ── 4. Tirage actif ───────────────────────
  const activeTirage = await db.Tirage.findOne({
    where: {
      session_id: sessionId,
      status:     { [Op.in]: ['running', 'ready'] },
    },
    order:   [['order', 'ASC']],
    include: [
      {
        model:    db.DrawEvent,
        as:       'draw_events',
        attributes: ['number', 'sequence'],
        order:    [['sequence', 'ASC']],
      },
      {
        model:      db.TirageLot,
        as:         'tirageLots',
        required:   false,
        include:    [{ model: db.Lot, as: 'lot', attributes: ['name'] }],
      },
    ],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tj = activeTirage?.toJSON() as any | null
  const drawEvents: Array<{ number: number; sequence: number }> = tj
    ? (tj.draw_events ?? []).sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence)
    : []

  const lotName: string | null = tj?.tirageLots?.[0]?.lot?.name ?? null

  return NextResponse.json({
    session: {
      id:              session.id,
      name:            session.name,
      date:            session.date,
      status:          session.status,
      associationName: session.association?.name ?? '',
    },
    cartons: cartons.map(c => ({
      id:            c.id,
      serial_number: c.serial_number,
      grid:          c.grid,
    })),
    activeTirage: tj
      ? {
          id:           tj.id,
          type:         tj.type,
          status:       tj.status,
          lotName,
          drawnNumbers: drawEvents.map(e => e.number),
        }
      : null,
  })
}
