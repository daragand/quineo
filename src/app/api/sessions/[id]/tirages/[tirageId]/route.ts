import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { assocScope } from '@/lib/services/scope'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─────────────────────────────────────────
// PATCH /api/sessions/[id]/tirages/[tirageId]
// Modifier le type, le statut ou les lots d'un tirage planifié
// ─────────────────────────────────────────

const UpdateSchema = z.object({
  type:    z.enum(['quine', 'double_quine', 'carton_plein', 'pause']).optional(),
  status:  z.enum(['draft', 'ready']).optional(),
  lot_ids: z.array(z.string().uuid()).optional(),
})

export const PATCH = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id, tirageId } = await ctx.params

    const scope   = assocScope(ctx.user)
    const session = await db.Session.findOne({ where: { id, ...scope } })
    if (!session) return apiError('Session introuvable', 404)

    const tirage = await db.Tirage.findOne({ where: { id: tirageId, session_id: id } })
    if (!tirage) return apiError('Tirage introuvable', 404)

    const body   = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    const { type, status, lot_ids } = parsed.data

    await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
      const updates: Record<string, unknown> = {}
      if (type   !== undefined) updates.type   = type
      if (status !== undefined) updates.status = status

      if (Object.keys(updates).length > 0) {
        await tirage.update(updates, { transaction: t })
      }

      if (lot_ids !== undefined) {
        // Remplacer les lots : supprimer les anciens, insérer les nouveaux
        await db.TirageLot.destroy({ where: { tirage_id: tirageId }, transaction: t })
        if (lot_ids.length > 0) {
          // Vérifier que les lots appartiennent à la session
          const lots = await db.Lot.findAll({ where: { id: lot_ids, session_id: id } })
          if (lots.length !== lot_ids.length) throw new Error('Un ou plusieurs lots introuvables')

          await db.TirageLot.bulkCreate(
            lot_ids.map((lid, i) => ({ tirage_id: tirageId, lot_id: lid, order: i })),
            { transaction: t }
          )
        }
      }
    })

    const updated = await db.Tirage.findOne({ where: { id: tirageId } })
    const tirageLots = await db.TirageLot.findAll({
      where:   { tirage_id: tirageId },
      include: [{ model: db.Lot, as: 'lot', attributes: ['id', 'name', 'value', 'status'] }],
      order:   [['order', 'ASC']],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lots = tirageLots.map(tl => (tl.toJSON() as any).lot)

    return NextResponse.json({ tirage: { ...(updated?.toJSON() ?? {}), lots } })
  })
)

// ─────────────────────────────────────────
// DELETE /api/sessions/[id]/tirages/[tirageId]
// Supprimer un tirage planifié (status draft uniquement)
// ─────────────────────────────────────────

export const DELETE = withAuth(
  withRole(['admin', 'operator'], async (_req: NextRequest, ctx: Ctx) => {
    const { id, tirageId } = await ctx.params

    const scope   = assocScope(ctx.user)
    const session = await db.Session.findOne({ where: { id, ...scope } })
    if (!session) return apiError('Session introuvable', 404)

    const tirage = await db.Tirage.findOne({ where: { id: tirageId, session_id: id } })
    if (!tirage) return apiError('Tirage introuvable', 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = tirage.toJSON() as any
    if (t.status === 'running') return apiError('Impossible de supprimer un tirage en cours', 409)

    await db.sequelize.transaction(async (tx: import('sequelize').Transaction) => {
      await db.TirageLot.destroy({ where: { tirage_id: tirageId }, transaction: tx })
      await tirage.destroy({ transaction: tx })
    })

    return NextResponse.json({ ok: true })
  })
)
