import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'
import { deleteSessionImagesDir } from '@/lib/lot-images'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─── helper : charger + vérifier ownership ───────────────────────────────────

async function loadSession(id: string, associationId: string) {
  const session = await db.Session.findOne({
    where: { id, association_id: associationId },
    include: [
      { model: db.Lot,         as: 'lots',         order: [['order', 'ASC']] },
      { model: db.CartonPack,  as: 'carton_packs',  order: [['display_order', 'ASC']] },
      { model: db.Partner,     as: 'partners',      order: [['order', 'ASC']] },
    ],
  })
  return session
}

// ─────────────────────────────────────────
// GET /api/sessions/[id]
// ─────────────────────────────────────────

export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params
  const session = await loadSession(id, ctx.user.association_id)
  if (!session) return apiError('Session introuvable', 404)
  return NextResponse.json({ session })
})

// ─────────────────────────────────────────
// PATCH /api/sessions/[id]
// ─────────────────────────────────────────

const UpdateSchema = z.object({
  name:        z.string().min(1).max(120).optional(),
  date:        z.string().optional(),
  description: z.string().optional(),
  max_cartons: z.number().int().positive().optional(),
  status:      z.enum(['draft', 'open', 'running', 'closed', 'cancelled']).optional(),
}).strict()

export const PATCH = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params
    const session = await loadSession(id, ctx.user.association_id)
    if (!session) return apiError('Session introuvable', 404)

    const body   = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    await session.update(parsed.data)
    return NextResponse.json({ session })
  })
)

// ─────────────────────────────────────────
// DELETE /api/sessions/[id]
// ─────────────────────────────────────────

export const DELETE = withAuth(
  withRole(['admin'], async (_req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params
    const session = await loadSession(id, ctx.user.association_id)
    if (!session) return apiError('Session introuvable', 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session.toJSON() as any).status !== 'draft') {
      return apiError('Seules les sessions en brouillon peuvent être supprimées')
    }

    deleteSessionImagesDir(id)
    await session.destroy()
    return NextResponse.json({ ok: true })
  })
)
