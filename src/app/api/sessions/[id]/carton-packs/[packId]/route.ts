import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

async function checkPack(packId: string, sessionId: string, associationId: string) {
  const session = await db.Session.findOne({ where: { id: sessionId, association_id: associationId } })
  if (!session) return null
  return db.CartonPack.findOne({ where: { id: packId, session_id: sessionId } })
}

// ─────────────────────────────────────────
// PATCH /api/sessions/[id]/carton-packs/[packId]
// ─────────────────────────────────────────

const UpdatePackSchema = z.object({
  label:          z.string().min(1).max(80).optional(),
  quantity:       z.number().int().min(1).optional(),
  price:          z.number().nonnegative().optional(),
  is_active:      z.boolean().optional(),
  display_order:  z.number().int().nonnegative().optional(),
  max_per_person: z.number().int().positive().nullable().optional(),
})

export const PATCH = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id, packId } = await ctx.params
    const pack = await checkPack(packId, id, ctx.user.association_id)
    if (!pack) return apiError('Forfait introuvable', 404)

    const body   = await req.json()
    const parsed = UpdatePackSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    await pack.update(parsed.data)
    return NextResponse.json({ pack })
  })
)

// ─────────────────────────────────────────
// DELETE /api/sessions/[id]/carton-packs/[packId]
// ─────────────────────────────────────────

export const DELETE = withAuth(
  withRole(['admin', 'operator'], async (_req: NextRequest, ctx: Ctx) => {
    const { id, packId } = await ctx.params
    const pack = await checkPack(packId, id, ctx.user.association_id)
    if (!pack) return apiError('Forfait introuvable', 404)

    await pack.destroy()
    return NextResponse.json({ ok: true })
  })
)
