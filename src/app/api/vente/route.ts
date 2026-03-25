import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

// ─────────────────────────────────────────
// POST /api/vente — vente caisse (transaction atomique)
// ─────────────────────────────────────────

const VenteSchema = z.object({
  session_id:     z.string().uuid(),
  participant_id: z.string().uuid(),
  carton_pack_id: z.string().uuid(),
  quantity:       z.number().int().min(1),
  method:         z.enum(['CASH', 'EXTERNAL_TERMINAL', 'FREE']),
  amount:         z.number().nonnegative(),
  reference:      z.string().optional(),  // réf TPE
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  const body   = await req.json()
  const parsed = VenteSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0].message)

  const { session_id, participant_id, carton_pack_id, quantity, method, amount, reference } = parsed.data

  // Vérifier que la session appartient à l'association
  const session = await db.Session.findOne({
    where: { id: session_id, association_id: user.association_id },
  })
  if (!session) return apiError('Session introuvable', 404)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = session.toJSON() as any
  if (!['open', 'running'].includes(s.status)) {
    return apiError('Les ventes sont fermées pour cette session')
  }

  // Vérifier le pack
  const pack = await db.CartonPack.findOne({
    where: { id: carton_pack_id, session_id, is_active: true },
  })
  if (!pack) return apiError('Forfait introuvable ou inactif', 404)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = pack.toJSON() as any
  const cartonsNeeded = p.quantity * quantity

  // Récupérer des cartons disponibles
  const available = await db.Carton.findAll({
    where:  { session_id, status: 'available' },
    limit:  cartonsNeeded,
    order:  [['serial_number', 'ASC']],
  })

  if (available.length < cartonsNeeded) {
    return apiError(`Stock insuffisant : ${available.length} carton(s) disponible(s), ${cartonsNeeded} requis`)
  }

  // Vérifier quota participant (max_cartons de la session)
  const maxCartons = s.max_cartons
  if (maxCartons) {
    const alreadySold = await db.Carton.count({
      where: { session_id, participant_id, status: 'sold' },
    })
    if (alreadySold + cartonsNeeded > maxCartons) {
      return apiError(`Quota dépassé : ${alreadySold}/${maxCartons} cartons déjà achetés`)
    }
  }

  // Transaction DB
  const result = await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
    const cartonIds = available.map((c: import('sequelize').Model) => (c.toJSON() as { id: string }).id)

    // Assigner les cartons au participant
    await db.Carton.update(
      { participant_id, status: 'sold' },
      { where: { id: cartonIds }, transaction: t }
    )

    // Créer le paiement
    const paiement = await db.Paiement.create(
      { participant_id, method, amount, status: 'completed', reference, paid_at: new Date() },
      { transaction: t }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paiementId = (paiement.toJSON() as any).id

    // Créer les lignes paiement_cartons
    await db.PaiementCarton.bulkCreate(
      cartonIds.map((cartonId: string) => ({
        paiement_id: paiementId,
        carton_id:   cartonId,
        carton_pack_id,
      })),
      { transaction: t }
    )

    return {
      paiement_id: paiementId,
      cartons:     available.map((c: import('sequelize').Model) => (c.toJSON() as { id: string; serial_number: string })),
    }
  })

  return NextResponse.json(result, { status: 201 })
})
