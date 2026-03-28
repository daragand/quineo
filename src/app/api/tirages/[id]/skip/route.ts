import { NextRequest, NextResponse } from 'next/server'
import { Op } from 'sequelize'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─────────────────────────────────────────
// POST /api/tirages/[id]/skip
// Annule le tirage en cours, remet les lots en pending,
// et retourne le tirage suivant dans la séquence.
// ─────────────────────────────────────────

export const POST = withAuth(
  withRole(['admin', 'operator'], async (_req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params

    const tirage = await db.Tirage.findOne({ where: { id, status: 'running' } })
    if (!tirage) return apiError('Tirage introuvable ou non démarré', 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = tirage.toJSON() as any

    // Vérifier l'ownership via la session
    const session = await db.Session.findOne({
      where: { id: t.session_id, association_id: ctx.user.association_id },
    })
    if (!session) return apiError('Tirage introuvable', 404)

    // Charger les lots associés pour les remettre en pending (sauf les pauses)
    const tirageLots = t.type !== 'pause'
      ? await db.TirageLot.findAll({
          where:   { tirage_id: id },
          include: [{ model: db.Lot, as: 'lot', attributes: ['id', 'status'] }],
        })
      : []

    // Trouver le tirage suivant dans la séquence
    const nextTirage = t.order != null
      ? await db.Tirage.findOne({
          where: {
            session_id: t.session_id,
            order:      { [Op.gt]: t.order },
            status:     { [Op.in]: ['draft', 'ready'] },
          },
          order: [['order', 'ASC']],
          raw:   true,
        }) as { id: string; type: string; order: number } | null
      : null

    await db.sequelize.transaction(async (tx: import('sequelize').Transaction) => {
      // Annuler le tirage
      await tirage.update({ status: 'cancelled' }, { transaction: tx })

      // Remettre les lots en pending pour qu'ils puissent être re-tirés
      for (const tl of tirageLots) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = tl.toJSON() as any
        if (row.lot?.status === 'drawn') {
          await db.Lot.update(
            { status: 'pending' },
            { where: { id: row.lot.id }, transaction: tx },
          )
        }
      }
    })

    return NextResponse.json({
      ok:          true,
      next_tirage: nextTirage ? { id: nextTirage.id, type: nextTirage.type } : null,
    })
  }),
)
