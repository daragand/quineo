import { NextRequest, NextResponse } from 'next/server'
import { withAuth, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─────────────────────────────────────────
// GET /api/tirages/[id]
// ─────────────────────────────────────────

export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params

  const tirage = await db.Tirage.findOne({
    where:   { id },
    include: [
      { model: db.Lot,        as: 'lot' },
      { model: db.DrawEvent,  as: 'draw_events', order: [['sequence', 'ASC']] },
      { model: db.Carton,     as: 'winning_carton', required: false,
        include: [{ model: db.Participant, as: 'participant' }] },
    ],
  })

  if (!tirage) return apiError('Tirage introuvable', 404)

  // Vérifier que ce tirage appartient à la bonne association
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = tirage.toJSON() as any
  const session = await db.Session.findOne({
    where: { id: t.session_id, association_id: ctx.user.association_id },
  })
  if (!session) return apiError('Tirage introuvable', 404)

  return NextResponse.json({ tirage })
})
