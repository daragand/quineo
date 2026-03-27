import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// Transitions de statut autorisées
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft:     ['open', 'cancelled'],
  open:      ['running', 'cancelled'],
  running:   ['closed', 'cancelled'],
  closed:    [],
  cancelled: [],
}

const StatusSchema = z.object({
  status: z.enum(['draft', 'open', 'running', 'closed', 'cancelled']),
})

// ─────────────────────────────────────────
// PATCH /api/sessions/[id]/status
// ─────────────────────────────────────────

export const PATCH = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params

    const session = await db.Session.findOne({ where: { id, association_id: ctx.user.association_id } })
    if (!session) return apiError('Session introuvable', 404)

    const body   = await req.json()
    const parsed = StatusSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = (session.toJSON() as any).status as string
    const next    = parsed.data.status

    if (!ALLOWED_TRANSITIONS[current]?.includes(next)) {
      return apiError(`Transition de statut "${current}" → "${next}" non autorisée`)
    }

    await session.update({ status: next })
    return NextResponse.json({ session })
  })
)
