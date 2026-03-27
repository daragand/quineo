import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { assocScope } from '@/lib/services/scope'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

const ReorderSchema = z.object({
  // Liste ordonnée des IDs de tirages dans le nouvel ordre
  ids: z.array(z.string().uuid()).min(1),
})

// PATCH /api/sessions/[id]/tirages/reorder
export const PATCH = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params

    const scope   = assocScope(ctx.user)
    const session = await db.Session.findOne({ where: { id, ...scope } })
    if (!session) return apiError('Session introuvable', 404)

    const body   = await req.json()
    const parsed = ReorderSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
      await Promise.all(
        parsed.data.ids.map((tirageId, index) =>
          db.Tirage.update(
            { order: index },
            { where: { id: tirageId, session_id: id }, transaction: t }
          )
        )
      )
    })

    return NextResponse.json({ ok: true })
  })
)
