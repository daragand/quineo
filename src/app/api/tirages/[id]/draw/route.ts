import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'
import { getIO } from '@/lib/socket'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─────────────────────────────────────────
// POST /api/tirages/[id]/draw — tirer le prochain numéro
// ─────────────────────────────────────────

export const POST = withAuth(
  withRole(['admin', 'operator'], async (_req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params

    const tirage = await db.Tirage.findOne({
      where:   { id, status: 'running' },
      include: [{ model: db.DrawEvent, as: 'draw_events' }],
    })
    if (!tirage) return apiError('Tirage introuvable ou non démarré', 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = tirage.toJSON() as any

    // Vérifier l'ownership via la session
    const session = await db.Session.findOne({
      where: { id: t.session_id, association_id: ctx.user.association_id },
    })
    if (!session) return apiError('Tirage introuvable', 404)

    const drawn: number[] = t.draw_events.map((e: { number: number }) => e.number)
    if (drawn.length >= 90) {
      return apiError('Tous les 90 numéros ont déjà été tirés')
    }

    // Choisir un numéro non encore tiré
    const remaining = Array.from({ length: 90 }, (_, i) => i + 1).filter((n) => !drawn.includes(n))
    const number    = remaining[Math.floor(Math.random() * remaining.length)]
    const sequence  = drawn.length + 1

    const event = await db.DrawEvent.create({
      tirage_id: id,
      number,
      sequence,
      drawn_at: new Date(),
    })

    // Diffusion temps réel à tous les clients de ce tirage
    getIO()?.to(`tirage:${id}`).emit('draw', { number, sequence })

    return NextResponse.json({ event, number, sequence, remaining: remaining.length - 1 })
  })
)
