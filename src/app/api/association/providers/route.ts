import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// Champs sensibles à masquer par type de prestataire
const SENSITIVE: Record<string, string[]> = {
  stripe:    ['secret_key', 'webhook_secret'],
  sumup:     ['client_secret'],
  helloasso: ['client_secret'],
  paypal:    ['client_secret'],
  other:     [],
}

export function maskConfig(type: string, config: Record<string, string>): Record<string, string> {
  const sensitive = SENSITIVE[type] ?? []
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(config ?? {})) {
    result[k] = sensitive.includes(k) && v ? '__MASKED__' : (v ?? '')
  }
  return result
}

// ─────────────────────────────────────────
// GET /api/association/providers
// ─────────────────────────────────────────

export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  const rows = await db.PaymentProvider.findAll({
    where:      { association_id: ctx.user.association_id },
    attributes: ['id', 'name', 'type', 'active', 'config'],
    order:      [['name', 'ASC']],
  })

  const providers = rows.map((r: import('sequelize').Model) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = r.toJSON() as any
    return {
      id:     p.id     as string,
      name:   p.name   as string,
      type:   p.type   as string,
      active: p.active as boolean,
      config: maskConfig(p.type, (p.config ?? {}) as Record<string, string>),
    }
  })

  return NextResponse.json({ providers })
})

// ─────────────────────────────────────────
// POST /api/association/providers
// ─────────────────────────────────────────

const CreateSchema = z.object({
  name:   z.string().min(1).max(100),
  type:   z.enum(['stripe', 'paypal', 'sumup', 'helloasso', 'other']),
  config: z.record(z.string(), z.string()).default({}),
})

export const POST = withAuth(
  withRole(['admin'], async (req: NextRequest, ctx: Ctx) => {
    const body   = await req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    const { name, type, config } = parsed.data

    const provider = await db.PaymentProvider.create({
      association_id: ctx.user.association_id,
      name,
      type,
      config,
      active: true,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = provider.toJSON() as any
    return NextResponse.json({
      provider: {
        id:     p.id,
        name:   p.name,
        type:   p.type,
        active: p.active,
        config: maskConfig(p.type, p.config ?? {}),
      },
    }, { status: 201 })
  })
)
