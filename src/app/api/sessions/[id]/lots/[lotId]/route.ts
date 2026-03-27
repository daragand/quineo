import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

async function loadLot(lotId: string, sessionId: string, associationId: string) {
  const session = await db.Session.findOne({ where: { id: sessionId, association_id: associationId } })
  if (!session) return null
  return db.Lot.findOne({ where: { id: lotId, session_id: sessionId } })
}

// ─────────────────────────────────────────
// PATCH /api/sessions/[id]/lots/[lotId]
// ─────────────────────────────────────────

const UpdateLotSchema = z.object({
  name:        z.string().min(1).max(120).optional(),
  description: z.string().optional(),
  value:       z.number().nonnegative().optional(),
  order:       z.number().int().nonnegative().optional(),
  status:      z.enum(['pending', 'drawn', 'cancelled']).optional(),
  image_url:   z.string().url().optional(),
}).strict()

export const PATCH = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id, lotId } = await ctx.params
    const lot = await loadLot(lotId, id, ctx.user.association_id)
    if (!lot) return apiError('Lot introuvable', 404)

    const body   = await req.json()
    const parsed = UpdateLotSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    await lot.update(parsed.data)
    return NextResponse.json({ lot })
  })
)

// ─────────────────────────────────────────
// DELETE /api/sessions/[id]/lots/[lotId]
// ─────────────────────────────────────────

export const DELETE = withAuth(
  withRole(['admin'], async (_req: NextRequest, ctx: Ctx) => {
    const { id, lotId } = await ctx.params
    const lot = await loadLot(lotId, id, ctx.user.association_id)
    if (!lot) return apiError('Lot introuvable', 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((lot.toJSON() as any).status === 'drawn') {
      return apiError('Un lot déjà tiré ne peut pas être supprimé')
    }

    await lot.destroy()
    return NextResponse.json({ ok: true })
  })
)
