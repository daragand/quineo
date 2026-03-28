import { NextRequest, NextResponse } from 'next/server'
import { Op } from 'sequelize'
import { withAuth, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─────────────────────────────────────────
// GET /api/sessions/[id]/cartons
// Query params : ?status=sold&page=1&limit=50&q=C001|Sophie
// ─────────────────────────────────────────

export const GET = withAuth(async (req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params

  const session = await db.Session.findOne({ where: { id, association_id: ctx.user.association_id } })
  if (!session) return apiError('Session introuvable', 404)

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? undefined
  const q      = (searchParams.get('q') ?? searchParams.get('serial') ?? '').trim()
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit  = Math.min(100, parseInt(searchParams.get('limit') ?? '50'))
  const offset = (page - 1) * limit

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { session_id: id }
  if (status) where.status = status

  // Recherche par numéro de série OU prénom/nom du participant (combiné ou séparé)
  if (q) {
    const like = `%${q}%`
    where[Op.or] = [
      // Série
      { serial_number: { [Op.iLike]: like } },
      // Prénom seul
      { '$participant.first_name$': { [Op.iLike]: like } },
      // Nom seul
      { '$participant.last_name$':  { [Op.iLike]: like } },
      // "Prénom Nom" combiné
      db.sequelize.where(
        db.sequelize.fn('CONCAT',
          db.sequelize.col('participant.first_name'), ' ',
          db.sequelize.col('participant.last_name'),
        ),
        { [Op.iLike]: like },
      ),
      // "Nom Prénom" combiné (ordre inversé)
      db.sequelize.where(
        db.sequelize.fn('CONCAT',
          db.sequelize.col('participant.last_name'), ' ',
          db.sequelize.col('participant.first_name'),
        ),
        { [Op.iLike]: like },
      ),
    ]
  }

  const [{ count, rows }, statusCounts] = await Promise.all([
    db.Carton.findAndCountAll({
      where,
      include: [{
        model:      db.Participant,
        as:         'participant',
        attributes: ['first_name', 'last_name'],
        required:   false,
      }],
      order:     [['serial_number', 'ASC']],
      limit,
      offset,
      subQuery:  false,  // requis pour filtrer sur colonnes du JOIN
    }),
    // Compteurs globaux (toujours sur toute la session, sans filtre)
    db.Carton.findAll({
      where:      { session_id: id },
      attributes: ['status', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
      group:      ['status'],
      raw:        true,
    }) as unknown as Promise<Array<{ status: string; count: string }>>,
  ])

  const countMap = Object.fromEntries(statusCounts.map(r => [r.status, parseInt(r.count, 10)]))

  return NextResponse.json({
    cartons: rows,
    total:   count,
    page,
    pages:   Math.ceil(count / limit),
    counts: {
      available: countMap['available'] ?? 0,
      sold:      countMap['sold']      ?? 0,
      cancelled: countMap['cancelled'] ?? 0,
    },
  })
})
