import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'
import { Op } from 'sequelize'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─────────────────────────────────────────
// GET /api/participants/[id]
// ─────────────────────────────────────────

export const GET = withAuth(async (req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  const participant = await db.Participant.findByPk(id, {
    attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
  })
  if (!participant) return apiError('Participant introuvable', 404)

  // Cartons optionnellement filtrés par session
  const cartonWhere: Record<string, unknown> = {
    participant_id: id,
    status: { [Op.ne]: 'cancelled' },
  }
  if (sessionId) cartonWhere.session_id = sessionId

  const cartons = await db.Carton.findAll({
    where: cartonWhere,
    attributes: ['id', 'serial_number', 'status', 'session_id'],
    include: [{ model: db.Session, as: 'session', where: { association_id: ctx.user.association_id }, attributes: ['id', 'name'] }],
  })

  return NextResponse.json({ participant, cartons })
})

// ─────────────────────────────────────────
// PATCH /api/participants/[id]
// ─────────────────────────────────────────

const UpdateParticipantSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name:  z.string().min(1).max(100).optional(),
  email:      z.string().email().optional(),
  phone:      z.string().max(20).optional().nullable(),
})

export const PATCH = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params

    // Vérifier que le participant a des cartons dans l'association
    const cartonInAssoc = await db.Carton.findOne({
      where: { participant_id: id },
      include: [{ model: db.Session, as: 'session', where: { association_id: ctx.user.association_id }, required: true }],
    })
    if (!cartonInAssoc) return apiError('Participant introuvable', 404)

    const participant = await db.Participant.findByPk(id)
    if (!participant) return apiError('Participant introuvable', 404)

    const body   = await req.json()
    const parsed = UpdateParticipantSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    await participant.update(parsed.data)
    return NextResponse.json({ participant })
  })
)
