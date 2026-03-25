import { NextRequest, NextResponse } from 'next/server'
import { withAuth, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

// ─────────────────────────────────────────
// GET /api/paiements?session_id=&status=&page=
// ─────────────────────────────────────────

export const GET = withAuth(async (req: NextRequest, { user }) => {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')
  const status    = searchParams.get('status') ?? undefined
  const page      = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit     = Math.min(100, parseInt(searchParams.get('limit') ?? '50'))
  const offset    = (page - 1) * limit

  // Si session_id fourni, vérifier qu'elle appartient à l'association
  if (sessionId) {
    const session = await db.Session.findOne({
      where: { id: sessionId, association_id: user.association_id },
    })
    if (!session) return apiError('Session introuvable', 404)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (status) where.status = status

  // Jointure via carton_packs → session si session_id fourni
  const includeCartons = sessionId
    ? [{
        model:    db.PaiementCarton,
        as:       'paiement_cartons',
        required: true,
        include:  [{
          model:    db.Carton,
          as:       'carton',
          required: true,
          where:    { session_id: sessionId },
        }],
      }]
    : []

  const { count, rows } = await db.Paiement.findAndCountAll({
    where,
    include: [
      { model: db.Participant, as: 'participant' },
      ...includeCartons,
    ],
    order:  [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  })

  return NextResponse.json({
    paiements: rows,
    total:     count,
    page,
    pages:     Math.ceil(count / limit),
  })
})
