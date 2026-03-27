import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

async function findUser(id: string, associationId: string) {
  return db.User.findOne({ where: { id, association_id: associationId } })
}

// ─────────────────────────────────────────
// PATCH /api/utilisateurs/[id]
// ─────────────────────────────────────────

const UpdateUserSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name:  z.string().min(1).max(100).optional(),
  role:       z.enum(['admin', 'operator', 'viewer']).optional(),
  active:     z.boolean().optional(),
})

export const PATCH = withAuth(
  withRole(['admin'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params
    const user = await findUser(id, ctx.user.association_id)
    if (!user) return apiError('Utilisateur introuvable', 404)

    // Empêcher l'admin de se désactiver lui-même
    const body   = await req.json()
    const parsed = UpdateUserSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    if (parsed.data.active === false && id === ctx.user.sub) {
      return apiError('Vous ne pouvez pas vous désactiver vous-même')
    }

    await user.update(parsed.data)
    return NextResponse.json({ user })
  })
)

// ─────────────────────────────────────────
// DELETE /api/utilisateurs/[id]
// ─────────────────────────────────────────

export const DELETE = withAuth(
  withRole(['admin'], async (_req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params
    if (id === ctx.user.sub) return apiError('Vous ne pouvez pas supprimer votre propre compte')

    const user = await findUser(id, ctx.user.association_id)
    if (!user) return apiError('Utilisateur introuvable', 404)

    await user.destroy()
    return NextResponse.json({ success: true })
  })
)
