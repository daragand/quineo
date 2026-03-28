import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Op } from 'sequelize'
import { withAuth, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

// ─────────────────────────────────────────
// GET /api/participants?session_id=&q=
// ─────────────────────────────────────────

export const GET = withAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')
  const q         = searchParams.get('q')?.trim()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (q) {
    where[Op.or] = [
      { first_name: { [Op.iLike]: `%${q}%` } },
      { last_name:  { [Op.iLike]: `%${q}%` } },
      { email:      { [Op.iLike]: `%${q}%` } },
      { phone:      { [Op.iLike]: `%${q}%` } },
    ]
  }

  const include = sessionId
    ? [{ model: db.Carton, as: 'cartons', where: { session_id: sessionId }, required: false }]
    : []

  const participants = await db.Participant.findAll({
    where,
    include,
    limit: 30,
    order: [['last_name', 'ASC'], ['first_name', 'ASC']],
  })

  return NextResponse.json({ participants })
})

// ─────────────────────────────────────────
// POST /api/participants
// ─────────────────────────────────────────

const CreateSchema = z.object({
  first_name:  z.string().min(1).optional(),
  last_name:   z.string().min(1).optional(),
  email:       z.string().email().optional(),
  phone:       z.string().optional(),
  birth_date:  z.string().date().optional(),  // YYYY-MM-DD
})

export const POST = withAuth(async (req: NextRequest) => {
  const body   = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0].message)

  if (!parsed.data.first_name && !parsed.data.last_name && !parsed.data.email) {
    return apiError('Au moins un nom ou un email est requis')
  }

  const participant = await db.Participant.create(parsed.data)
  return NextResponse.json({ participant }, { status: 201 })
})
