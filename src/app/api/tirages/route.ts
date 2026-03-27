import { NextRequest, NextResponse } from 'next/server'
import { Op } from 'sequelize'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { assocScope } from '@/lib/services/scope'
import { db } from '@/lib/db'

// ─────────────────────────────────────────
// GET /api/tirages — liste des tirages de l'association
// ─────────────────────────────────────────

export const GET = withAuth(async (_req: NextRequest, { user }) => {
  const scope = assocScope(user)

  const sessions = await db.Session.findAll({
    where:      scope,
    attributes: ['id'],
    raw:        true,
  }) as unknown as Array<{ id: string }>

  if (sessions.length === 0) return NextResponse.json({ tirages: [] })

  const sessionIds = sessions.map(s => s.id)

  const tirages = await db.Tirage.findAll({
    where:   { session_id: { [Op.in]: sessionIds } },
    include: [
      { model: db.Lot,        as: 'lot',         attributes: ['id', 'name', 'value'] },
      { model: db.Session,    as: 'session',      attributes: ['id', 'name'] },
      { model: db.DrawEvent,  as: 'draw_events',  attributes: ['id'] },
      { model: db.Carton,     as: 'winning_carton', required: false,
        include: [{ model: db.Participant, as: 'participant', attributes: ['first_name', 'last_name'] }] },
    ],
    order: [['created_at', 'DESC']],
  })

  return NextResponse.json({ tirages })
})

// ─────────────────────────────────────────
// POST /api/tirages — démarrer un tirage
// ─────────────────────────────────────────

const StartSchema = z.object({
  session_id: z.uuid(),
  lot_id:     z.uuid(),
})

export const POST = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, { user }) => {
    const body   = await req.json()
    const parsed = StartSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    const { session_id, lot_id } = parsed.data

    // Vérifier session
    const session = await db.Session.findOne({
      where: { id: session_id, association_id: user.association_id },
    })
    if (!session) return apiError('Session introuvable', 404)

    // Vérifier lot
    const lot = await db.Lot.findOne({ where: { id: lot_id, session_id } })
    if (!lot) return apiError('Lot introuvable', 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((lot.toJSON() as any).status !== 'pending') {
      return apiError('Ce lot est déjà en tirage ou terminé')
    }

    // Vérifier qu'aucun autre tirage n'est en cours sur cette session
    const active = await db.Tirage.findOne({ where: { session_id, status: 'running' } })
    if (active) return apiError('Un tirage est déjà en cours sur cette session')

    const tirage = await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
      await lot.update({ status: 'drawn' }, { transaction: t })
      await session.update({ status: 'running' }, { transaction: t })
      return db.Tirage.create(
        { session_id, lot_id, status: 'running', started_at: new Date() },
        { transaction: t }
      )
    })

    return NextResponse.json({ tirage }, { status: 201 })
  })
)
