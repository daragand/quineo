import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

async function checkSession(sessionId: string, associationId: string) {
  return db.Session.findOne({ where: { id: sessionId, association_id: associationId } })
}

// ─────────────────────────────────────────
// GET /api/sessions/[id]/lots
// ─────────────────────────────────────────

export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params
  if (!await checkSession(id, ctx.user.association_id)) return apiError('Session introuvable', 404)

  const lots = await db.Lot.findAll({
    where: { session_id: id },
    include: [{ model: db.Tirage, as: 'tirage', required: false }],
    order: [['order', 'ASC']],
  })
  return NextResponse.json({ lots })
})

// ─────────────────────────────────────────
// POST /api/sessions/[id]/lots
// ─────────────────────────────────────────

const CreateLotSchema = z.object({
  name:        z.string().min(1).max(120),
  description: z.string().optional(),
  value:       z.number().nonnegative().optional(),
  order:       z.number().int().nonnegative().default(0),
})

export const POST = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params
    if (!await checkSession(id, ctx.user.association_id)) return apiError('Session introuvable', 404)

    const body   = await req.json()
    const parsed = CreateLotSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    const lot = await db.Lot.create({ ...parsed.data, session_id: id })
    return NextResponse.json({ lot }, { status: 201 })
  })
)
