import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

async function findPartner(partnerId: string, sessionId: string, associationId: string) {
  const session = await db.Session.findOne({ where: { id: sessionId, association_id: associationId } })
  if (!session) return null
  return db.Partner.findOne({ where: { id: partnerId, session_id: sessionId } })
}

// ─────────────────────────────────────────
// PATCH /api/sessions/[id]/partners/[partnerId]
// ─────────────────────────────────────────

const UpdatePartnerSchema = z.object({
  name:        z.string().min(1).max(150).optional(),
  logo_url:    z.string().url().optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  order:       z.number().int().nonnegative().optional(),
  active:      z.boolean().optional(),
})

export const PATCH = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id, partnerId } = await ctx.params
    const partner = await findPartner(partnerId, id, ctx.user.association_id)
    if (!partner) return apiError('Partenaire introuvable', 404)

    const body   = await req.json()
    const parsed = UpdatePartnerSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    await partner.update(parsed.data)
    return NextResponse.json({ partner })
  })
)

// ─────────────────────────────────────────
// DELETE /api/sessions/[id]/partners/[partnerId]
// ─────────────────────────────────────────

export const DELETE = withAuth(
  withRole(['admin', 'operator'], async (_req: NextRequest, ctx: Ctx) => {
    const { id, partnerId } = await ctx.params
    const partner = await findPartner(partnerId, id, ctx.user.association_id)
    if (!partner) return apiError('Partenaire introuvable', 404)

    await partner.destroy()
    return NextResponse.json({ success: true })
  })
)
