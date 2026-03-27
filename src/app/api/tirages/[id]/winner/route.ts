import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'
import { getIO } from '@/lib/socket'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

const WinnerSchema = z.object({
  winning_carton_id: z.string().uuid(),
})

// ─────────────────────────────────────────
// POST /api/tirages/[id]/winner — déclarer le gagnant
// ─────────────────────────────────────────

export const POST = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params

    const tirage = await db.Tirage.findOne({ where: { id, status: 'running' } })
    if (!tirage) return apiError('Tirage introuvable ou non démarré', 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = tirage.toJSON() as any
    const session = await db.Session.findOne({
      where: { id: t.session_id, association_id: ctx.user.association_id },
    })
    if (!session) return apiError('Tirage introuvable', 404)

    const body   = await req.json()
    const parsed = WinnerSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    const carton = await db.Carton.findOne({
      where:   { id: parsed.data.winning_carton_id, session_id: t.session_id },
      include: [{ model: db.Participant, as: 'participant' }],
    })
    if (!carton) return apiError('Carton introuvable dans cette session', 404)

    // Vérifier qu'il ne reste pas de tirages pending sur des lots précédents
    const nextPending = await db.Lot.findOne({
      where: { session_id: t.session_id, status: 'pending' },
      order: [['order', 'ASC']],
    })

    await db.sequelize.transaction(async (tx: import('sequelize').Transaction) => {
      await tirage.update(
        { status: 'completed', winning_carton_id: parsed.data.winning_carton_id, completed_at: new Date() },
        { transaction: tx }
      )
      // Si plus de lots à tirer, clôturer la session
      if (!nextPending) {
        await session.update({ status: 'closed' }, { transaction: tx })
      }
    })

    // Diffusion temps réel à tous les clients de ce tirage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cj = carton.toJSON() as any
    const p  = cj.participant
    const participantName = p ? [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Gagnant' : 'Gagnant'
    getIO()?.to(`tirage:${id}`).emit('winner', { participantName, cartonRef: cj.serial_number })

    return NextResponse.json({
      tirage:   tirage.toJSON(),
      carton:   cj,
      session_closed: !nextPending,
    })
  })
)
