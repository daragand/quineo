import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'
import { savePartnerLogo, deletePartnerLogo } from '@/lib/partner-images'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

async function findPartner(partnerId: string, sessionId: string, associationId: string) {
  const session = await db.Session.findOne({ where: { id: sessionId, association_id: associationId } })
  if (!session) return null
  return db.Partner.findOne({ where: { id: partnerId, session_id: sessionId } })
}

// ─────────────────────────────────────────
// POST /api/sessions/[id]/partners/[partnerId]/logo
// Upload du logo partenaire
// ─────────────────────────────────────────

export const POST = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id, partnerId } = await ctx.params
    const partner = await findPartner(partnerId, id, ctx.user.association_id)
    if (!partner) return apiError('Partenaire introuvable', 404)

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return apiError('Fichier manquant', 400)
    }

    const result = await savePartnerLogo(id, partnerId, file as File)
    if (result.error) return apiError(result.error, 400)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prev = (partner.toJSON() as any).logo_url as string | null
    deletePartnerLogo(id, partnerId, prev)

    await partner.update({ logo_url: result.url })

    return NextResponse.json({ logo_url: result.url })
  })
)

// ─────────────────────────────────────────
// DELETE /api/sessions/[id]/partners/[partnerId]/logo
// Supprime le logo
// ─────────────────────────────────────────

export const DELETE = withAuth(
  withRole(['admin', 'operator'], async (_req: NextRequest, ctx: Ctx) => {
    const { id, partnerId } = await ctx.params
    const partner = await findPartner(partnerId, id, ctx.user.association_id)
    if (!partner) return apiError('Partenaire introuvable', 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentUrl = (partner.toJSON() as any).logo_url as string | null
    deletePartnerLogo(id, partnerId, currentUrl)

    await partner.update({ logo_url: null })

    return NextResponse.json({ ok: true })
  })
)
