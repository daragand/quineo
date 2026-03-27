import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

async function checkSession(sessionId: string, associationId: string) {
  return db.Session.findOne({ where: { id: sessionId, association_id: associationId } })
}

// ─────────────────────────────────────────
// GET /api/sessions/[id]/partners
// ─────────────────────────────────────────

export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params
  if (!await checkSession(id, ctx.user.association_id)) return apiError('Session introuvable', 404)

  const partners = await db.Partner.findAll({
    where: { session_id: id },
    order: [['order', 'ASC']],
  })
  return NextResponse.json({ partners })
})

// ─────────────────────────────────────────
// POST /api/sessions/[id]/partners
// ─────────────────────────────────────────

const CreatePartnerSchema = z.object({
  name:        z.string().min(1).max(150),
  logo_url:    z.string().url().optional(),
  website_url: z.string().url().optional(),
  order:       z.number().int().nonnegative().default(0),
  active:      z.boolean().default(true),
})

export const POST = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params
    if (!await checkSession(id, ctx.user.association_id)) return apiError('Session introuvable', 404)

    const body   = await req.json()
    const parsed = CreatePartnerSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    const partner = await db.Partner.create({ ...parsed.data, session_id: id })
    return NextResponse.json({ partner }, { status: 201 })
  })
)
