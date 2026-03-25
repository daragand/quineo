import { NextRequest, NextResponse } from 'next/server'
import { withAuth, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<{ id: string }>; user: import('@/lib/auth').TokenPayload }

// ─────────────────────────────────────────
// GET /api/sessions/[id]/cartons
// Query params : ?status=sold&page=1&limit=50&q=participant_name
// ─────────────────────────────────────────

export const GET = withAuth(async (req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params

  const session = await db.Session.findOne({ where: { id, association_id: ctx.user.association_id } })
  if (!session) return apiError('Session introuvable', 404)

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? undefined
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit  = Math.min(100, parseInt(searchParams.get('limit') ?? '50'))
  const offset = (page - 1) * limit

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { session_id: id }
  if (status) where.status = status

  const { count, rows } = await db.Carton.findAndCountAll({
    where,
    include: [{ model: db.Participant, as: 'participant', required: false }],
    order:   [['serial_number', 'ASC']],
    limit,
    offset,
  })

  return NextResponse.json({
    cartons: rows,
    total:   count,
    page,
    pages:   Math.ceil(count / limit),
  })
})
