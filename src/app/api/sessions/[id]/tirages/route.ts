import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { assocScope } from '@/lib/services/scope'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─── helper ───────────────────────────────────────────────────────────────────

async function checkSession(sessionId: string, user: import('@/lib/auth').TokenPayload) {
  const scope = assocScope(user)
  return db.Session.findOne({ where: { id: sessionId, ...scope } })
}

// ─────────────────────────────────────────
// GET /api/sessions/[id]/tirages
// Retourne tous les tirages planifiés pour une session
// ─────────────────────────────────────────

export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params
  if (!await checkSession(id, ctx.user)) return apiError('Session introuvable', 404)

  const tirages = await db.Tirage.findAll({
    where: { session_id: id },
    order: [['order', 'ASC']],
  })

  // Charger les lots via TirageLot (évite le belongsToMany)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tirageIds = tirages.map(t => (t.toJSON() as any).id)

  const tirageLots = tirageIds.length > 0
    ? await db.TirageLot.findAll({
        where:   { tirage_id: tirageIds },
        include: [{ model: db.Lot, as: 'lot', attributes: ['id', 'name', 'value', 'status'] }],
        order:   [['order', 'ASC']],
      })
    : []

  // Regrouper les lots par tirage_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lotsMap = new Map<string, any[]>()
  for (const tl of tirageLots) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = tl.toJSON() as any
    if (!lotsMap.has(row.tirage_id)) lotsMap.set(row.tirage_id, [])
    lotsMap.get(row.tirage_id)!.push(row.lot)
  }

  const result = tirages.map(t => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = t.toJSON() as any
    return { ...data, lots: lotsMap.get(data.id) ?? [] }
  })

  return NextResponse.json({ tirages: result })
})

// ─────────────────────────────────────────
// POST /api/sessions/[id]/tirages
// Créer un tirage planifié
// ─────────────────────────────────────────

const CreateSchema = z.object({
  type:    z.enum(['quine', 'double_quine', 'carton_plein', 'pause']),
  lot_ids: z.array(z.string().uuid()).optional().default([]),
  order:   z.number().int().min(0).optional(),
})

export const POST = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params
    if (!await checkSession(id, ctx.user)) return apiError('Session introuvable', 404)

    const body   = await req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    const { type, lot_ids, order } = parsed.data

    // Vérifier que les lots appartiennent bien à cette session
    if (lot_ids.length > 0) {
      const lots = await db.Lot.findAll({ where: { id: lot_ids, session_id: id } })
      if (lots.length !== lot_ids.length) return apiError('Un ou plusieurs lots introuvables')
    }

    // Position : après le dernier si non fournie
    let position = order
    if (position === undefined) {
      const last = await db.Tirage.findOne({
        where: { session_id: id },
        order: [['order', 'DESC']],
        raw:   true,
      }) as { order: number } | null
      position = (last?.order ?? -1) + 1
    }

    const tirage = await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
      const created = await db.Tirage.create(
        { session_id: id, type, order: position, status: 'draft' },
        { transaction: t }
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tid = (created.toJSON() as any).id
      if (lot_ids.length > 0) {
        await db.TirageLot.bulkCreate(
          lot_ids.map((lid, i) => ({ tirage_id: tid, lot_id: lid, order: i })),
          { transaction: t }
        )
      }
      return created
    })

    return NextResponse.json({ tirage }, { status: 201 })
  })
)

// ─────────────────────────────────────────
// PATCH /api/sessions/[id]/tirages/reorder
// via route dédiée — voir reorder/route.ts
// ─────────────────────────────────────────
