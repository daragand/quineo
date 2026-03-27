import { NextRequest, NextResponse } from 'next/server'
import { withAuth, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// ─────────────────────────────────────────
// GET /api/paiements/[id]
// ─────────────────────────────────────────

export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params

  const paiement = await db.Paiement.findOne({
    where: { id },
    include: [
      {
        model: db.PaiementCarton,
        as: 'paiementCartons',
        include: [
          { model: db.Carton, as: 'carton', attributes: ['id', 'serial_number', 'status'] },
          { model: db.CartonPack, as: 'cartonPack', attributes: ['id', 'label', 'price'] },
        ],
      },
      { model: db.Participant, as: 'participant', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
    ],
  })
  if (!paiement) return apiError('Paiement introuvable', 404)

  // Vérifier que le paiement appartient à l'association (via session du carton)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = paiement.toJSON() as any
  const cartons = p.paiementCartons ?? []
  if (cartons.length > 0) {
    const firstCarton = await db.Carton.findOne({
      where: { id: cartons[0].carton_id },
      include: [{ model: db.Session, as: 'session', where: { association_id: ctx.user.association_id }, required: true }],
    })
    if (!firstCarton) return apiError('Accès refusé', 403)
  }

  return NextResponse.json({ paiement })
})
