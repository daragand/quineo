import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

async function checkSession(sessionId: string, associationId: string) {
  return db.Session.findOne({ where: { id: sessionId, association_id: associationId } })
}

// ─────────────────────────────────────────
// GET /api/sessions/[id]/carton-packs
// ─────────────────────────────────────────

export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params
  if (!await checkSession(id, ctx.user.association_id)) return apiError('Session introuvable', 404)

  const packs = await db.CartonPack.findAll({
    where: { session_id: id },
    order: [['display_order', 'ASC']],
  })
  return NextResponse.json({ packs })
})

// ─────────────────────────────────────────
// POST /api/sessions/[id]/carton-packs
// ─────────────────────────────────────────

const CreatePackSchema = z.object({
  label:          z.string().min(1).max(80),
  quantity:       z.number().int().min(1),
  price:          z.number().nonnegative(),
  is_active:      z.boolean().default(true),
  display_order:  z.number().int().nonnegative().default(0),
  max_per_person: z.number().int().positive().optional(),
})

export const POST = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params
    if (!await checkSession(id, ctx.user.association_id)) return apiError('Session introuvable', 404)

    const body   = await req.json()
    const parsed = CreatePackSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    const pack = await db.CartonPack.create({ ...parsed.data, session_id: id })
    return NextResponse.json({ pack }, { status: 201 })
  })
)

// ─────────────────────────────────────────
// PUT /api/sessions/[id]/carton-packs — réordonner
// ─────────────────────────────────────────

const ReorderSchema = z.object({
  order: z.array(z.object({ id: z.string().uuid(), display_order: z.number().int() })),
})

export const PUT = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params
    if (!await checkSession(id, ctx.user.association_id)) return apiError('Session introuvable', 404)

    const body   = await req.json()
    const parsed = ReorderSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    await Promise.all(
      parsed.data.order.map(({ id: packId, display_order }) =>
        db.CartonPack.update({ display_order }, { where: { id: packId, session_id: id } })
      )
    )
    return NextResponse.json({ ok: true })
  })
)
