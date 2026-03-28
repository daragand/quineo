import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'
import { saveLotImage, deleteLotImage } from '@/lib/lot-images'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

async function loadLot(lotId: string, sessionId: string, associationId: string) {
  const session = await db.Session.findOne({ where: { id: sessionId, association_id: associationId } })
  if (!session) return null
  return db.Lot.findOne({ where: { id: lotId, session_id: sessionId } })
}

// ─────────────────────────────────────────
// POST /api/sessions/[id]/lots/[lotId]/image
// Upload d'une image locale
// ─────────────────────────────────────────

export const POST = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id, lotId } = await ctx.params
    const lot = await loadLot(lotId, id, ctx.user.association_id)
    if (!lot) return apiError('Lot introuvable', 404)

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return apiError('Fichier manquant', 400)
    }

    const result = await saveLotImage(id, lotId, file as File)
    if (result.error) return apiError(result.error, 400)

    await lot.update({ image_url: result.url })

    return NextResponse.json({ image_url: result.url })
  })
)

// ─────────────────────────────────────────
// DELETE /api/sessions/[id]/lots/[lotId]/image
// Supprime l'image et vide image_url
// ─────────────────────────────────────────

export const DELETE = withAuth(
  withRole(['admin', 'operator'], async (_req: NextRequest, ctx: Ctx) => {
    const { id, lotId } = await ctx.params
    const lot = await loadLot(lotId, id, ctx.user.association_id)
    if (!lot) return apiError('Lot introuvable', 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentUrl = (lot.toJSON() as any).image_url as string | null
    deleteLotImage(id, lotId, currentUrl)

    await lot.update({ image_url: null })

    return NextResponse.json({ ok: true })
  })
)
