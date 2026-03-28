import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'
import { maskConfig } from '../route'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// Champs sensibles à préserver si '__MASKED__' est renvoyé
const SENSITIVE: Record<string, string[]> = {
  stripe:    ['secret_key', 'webhook_secret'],
  sumup:     ['client_secret'],
  helloasso: ['client_secret'],
  paypal:    ['client_secret'],
  other:     [],
}

function mergeConfig(
  type:     string,
  incoming: Record<string, string>,
  existing: Record<string, string>,
): Record<string, string> {
  const sensitive = SENSITIVE[type] ?? []
  const result    = { ...incoming }
  for (const field of sensitive) {
    // Si la valeur reçue est le placeholder ou vide → conserver l'existant
    if (!result[field] || result[field] === '__MASKED__') {
      if (existing[field]) result[field] = existing[field]
      else delete result[field]
    }
  }
  return result
}

// ─────────────────────────────────────────
// PATCH /api/association/providers/[id]
// ─────────────────────────────────────────

const UpdateSchema = z.object({
  name:   z.string().min(1).max(100).optional(),
  active: z.boolean().optional(),
  config: z.record(z.string(), z.string()).optional(),
})

export const PATCH = withAuth(
  withRole(['admin'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params

    const provider = await db.PaymentProvider.findOne({
      where: { id, association_id: ctx.user.association_id },
    })
    if (!provider) return apiError('Prestataire introuvable', 404)

    const body   = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = (provider.toJSON() as any)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {}
    if (parsed.data.name   !== undefined) updates.name   = parsed.data.name
    if (parsed.data.active !== undefined) updates.active = parsed.data.active
    if (parsed.data.config !== undefined) {
      updates.config = mergeConfig(
        existing.type as string,
        parsed.data.config,
        (existing.config ?? {}) as Record<string, string>,
      )
    }

    await provider.update(updates)

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
    })
  })
)

// ─────────────────────────────────────────
// DELETE /api/association/providers/[id]
// ─────────────────────────────────────────

export const DELETE = withAuth(
  withRole(['admin'], async (_req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params

    const provider = await db.PaymentProvider.findOne({
      where: { id, association_id: ctx.user.association_id },
    })
    if (!provider) return apiError('Prestataire introuvable', 404)

    await provider.destroy()
    return NextResponse.json({ ok: true })
  })
)
