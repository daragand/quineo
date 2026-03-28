import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { assocScope } from '@/lib/services/scope'
import { db } from '@/lib/db'
import { getIO } from '@/lib/socket'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─────────────────────────────────────────
// POST /api/sessions/[id]/tirages/[tirageId]/start
// Démarre un tirage planifié : draft/ready → running
// ─────────────────────────────────────────

export const POST = withAuth(
  withRole(['admin', 'operator'], async (_req: NextRequest, ctx: Ctx) => {
    const { id, tirageId } = await ctx.params
    const scope = assocScope(ctx.user)

    const session = await db.Session.findOne({ where: { id, ...scope } })
    if (!session) return apiError('Session introuvable', 404)

    const tirage = await db.Tirage.findOne({ where: { id: tirageId, session_id: id } })
    if (!tirage) return apiError('Tirage introuvable', 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = tirage.toJSON() as any

    if (!['draft', 'ready'].includes(t.status)) {
      return apiError(`Ce tirage ne peut pas être démarré (statut actuel : ${t.status})`)
    }

    // Vérifier qu'aucun autre tirage n'est en cours sur cette session
    const active = await db.Tirage.findOne({ where: { session_id: id, status: 'running' } })
    if (active) return apiError('Un tirage est déjà en cours sur cette session')

    // Charger les lots associés via TirageLot
    const tirageLots = await db.TirageLot.findAll({
      where:   { tirage_id: tirageId },
      include: [{ model: db.Lot, as: 'lot', attributes: ['id', 'status'] }],
    })

    await db.sequelize.transaction(async (tx: import('sequelize').Transaction) => {
      // Marquer chaque lot comme drawn pour verrouiller le tirage
      for (const tl of tirageLots) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = tl.toJSON() as any
        if (row.lot?.status === 'pending') {
          await db.Lot.update(
            { status: 'drawn' },
            { where: { id: row.lot.id }, transaction: tx },
          )
        }
      }

      // Démarrer le tirage
      await tirage.update({ status: 'running', started_at: new Date() }, { transaction: tx })

      // Passer la session en running si elle est encore open
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sv = session.toJSON() as any
      if (sv.status === 'open') {
        await session.update({ status: 'running' }, { transaction: tx })
      }
    })

    // Notifier l'écran de diffusion
    getIO()?.to(`session:${id}`).emit('tirage:start', { tirageId })

    return NextResponse.json({ ok: true })
  }),
)
