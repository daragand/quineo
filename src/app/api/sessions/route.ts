import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

// ─────────────────────────────────────────
// GET /api/sessions
// ─────────────────────────────────────────

export const GET = withAuth(async (_req: NextRequest, { user }) => {
  try {
    const sessions = await db.Session.findAll({
      where:   { association_id: user.association_id },
      include: [
        { model: db.Lot,       as: 'lots',         attributes: ['id', 'name', 'status', 'order'] },
        { model: db.CartonPack, as: 'carton_packs', attributes: ['id', 'label', 'quantity', 'price'] },
      ],
      order: [['created_at', 'DESC']],
    })
    return NextResponse.json({ sessions })
  } catch (err) {
    console.error('[sessions GET]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
})

// ─────────────────────────────────────────
// POST /api/sessions
// ─────────────────────────────────────────

const CreateSchema = z.object({
  name:        z.string().min(1).max(120),
  date:        z.string().optional(),
  description: z.string().optional(),
  max_cartons: z.number().int().positive().optional(),
  status:      z.enum(['draft', 'open']).default('draft'),
})

export const POST = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, { user }) => {
    try {
      const body   = await req.json()
      const parsed = CreateSchema.safeParse(body)
      if (!parsed.success) return apiError(parsed.error.issues[0].message)

      const session = await db.Session.create({
        ...parsed.data,
        association_id: user.association_id,
      })
      return NextResponse.json({ session }, { status: 201 })
    } catch (err) {
      console.error('[sessions POST]', err)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
  })
)
