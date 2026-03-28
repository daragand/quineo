import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

async function generateDisplayCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = String(Math.floor(1000 + Math.random() * 9000))
    const exists = await db.Session.findOne({ where: { display_code: code }, attributes: ['id'], raw: true })
    if (!exists) return code
  }
  return String(Math.floor(1000 + Math.random() * 9000))
}

// ─────────────────────────────────────────
// POST /api/sessions/[id]/display-code
// Génère ou régénère le code de diffusion à 4 chiffres.
// ─────────────────────────────────────────

export const POST = withAuth(
  withRole(['admin', 'operator'], async (_req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params

    const session = await db.Session.findOne({
      where: { id, association_id: ctx.user.association_id },
      attributes: ['id', 'display_code'],
    })

    if (!session) return apiError('Session introuvable', 404)

    const display_code = await generateDisplayCode()
    await session.update({ display_code })

    return NextResponse.json({ display_code })
  })
)
