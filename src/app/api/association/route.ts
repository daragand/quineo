import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─────────────────────────────────────────
// GET /api/association
// ─────────────────────────────────────────

export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  const association = await db.Association.findOne({
    where: { id: ctx.user.association_id },
    attributes: ['id', 'name', 'siret', 'email', 'phone', 'address', 'logo_url', 'active'],
  })
  if (!association) return apiError('Association introuvable', 404)
  return NextResponse.json({ association })
})

// ─────────────────────────────────────────
// PATCH /api/association
// ─────────────────────────────────────────

const UpdateAssociationSchema = z.object({
  name:     z.string().min(1).max(200).optional(),
  siret:    z.string().length(14).optional(),
  email:    z.email().optional(),
  phone:    z.string().max(20).optional(),
  address:  z.string().max(300).optional(),
  logo_url: z.url().optional(),
})

export const PATCH = withAuth(
  withRole(['admin'], async (req: NextRequest, ctx: Ctx) => {
    const association = await db.Association.findOne({ where: { id: ctx.user.association_id } })
    if (!association) return apiError('Association introuvable', 404)

    const body   = await req.json()
    const parsed = UpdateAssociationSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    await association.update(parsed.data)
    return NextResponse.json({ association })
  })
)
