import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, hashPassword, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─────────────────────────────────────────
// GET /api/utilisateurs
// ─────────────────────────────────────────

export const GET = withAuth(
  withRole(['admin'], async (_req: NextRequest, ctx: Ctx) => {
    const users = await db.User.findAll({
      where: { association_id: ctx.user.association_id },
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'active', 'created_at', 'updated_at'],
      order: [['created_at', 'ASC']],
    })
    return NextResponse.json({ users })
  })
)

// ─────────────────────────────────────────
// POST /api/utilisateurs  (inviter / créer)
// ─────────────────────────────────────────

const CreateUserSchema = z.object({
  email:      z.string().email(),
  first_name: z.string().min(1).max(100).optional(),
  last_name:  z.string().min(1).max(100).optional(),
  role:       z.enum(['admin', 'operator', 'viewer']).default('operator'),
  password:   z.string().min(8).optional(),
})

export const POST = withAuth(
  withRole(['admin'], async (req: NextRequest, ctx: Ctx) => {
    const body   = await req.json()
    const parsed = CreateUserSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    const existing = await db.User.findOne({ where: { email: parsed.data.email } })
    if (existing) return apiError('Un utilisateur avec cet email existe déjà')

    const password_hash = await hashPassword(parsed.data.password ?? Math.random().toString(36).slice(2) + 'A1!')

    const user = await db.User.create({
      association_id: ctx.user.association_id,
      email:          parsed.data.email,
      first_name:     parsed.data.first_name ?? null,
      last_name:      parsed.data.last_name ?? null,
      role:           parsed.data.role,
      password_hash,
      active:         true,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = user.toJSON() as any
    return NextResponse.json({
      user: {
        id: u.id, email: u.email, first_name: u.first_name,
        last_name: u.last_name, role: u.role, active: u.active,
      },
    }, { status: 201 })
  })
)
