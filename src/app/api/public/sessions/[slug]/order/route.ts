import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

type Ctx = { params: Promise<{ slug: string }> }

const OrderSchema = z.object({
  first_name:     z.string().min(1),
  last_name:      z.string().min(1),
  email:          z.string().email(),
  carton_pack_id: z.string().uuid(),
  quantity:       z.number().int().min(1),
  method:         z.enum(['ONLINE']),
  // En production : token Stripe / SumUp / HelloAsso passé ici
  payment_token:  z.string().optional(),
})

// ─────────────────────────────────────────
// POST /api/public/sessions/[slug]/order
// Commande publique (page d'achat)
// ─────────────────────────────────────────

export async function POST(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params

  // Charger la session
  const session = await db.Session.findOne({ where: { name: slug } })
  if (!session) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = session.toJSON() as any
  if (!['open', 'running'].includes(s.status)) {
    return NextResponse.json({ error: 'Les ventes sont fermées' }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { first_name, last_name, email, carton_pack_id, quantity } = parsed.data

  // Vérifier le pack
  const pack = await db.CartonPack.findOne({
    where: { id: carton_pack_id, session_id: s.id, is_active: true },
  })
  if (!pack) return NextResponse.json({ error: 'Forfait introuvable' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = pack.toJSON() as any
  const cartonsNeeded = p.quantity * quantity
  const totalAmount   = parseFloat(p.price) * quantity

  // Vérifier le stock
  const available = await db.Carton.findAll({
    where: { session_id: s.id, status: 'available' },
    limit: cartonsNeeded,
    order: [['serial_number', 'ASC']],
  })
  if (available.length < cartonsNeeded) {
    return NextResponse.json(
      { error: `Stock insuffisant (${available.length} disponible(s))` },
      { status: 409 }
    )
  }

  // TODO: intégrer le paiement provider ici (Stripe / SumUp / HelloAsso)
  // Pour l'instant on simule le succès du paiement

  const result = await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
    // Trouver ou créer le participant
    const [participant] = await db.Participant.findOrCreate({
      where:    { email },
      defaults: { first_name, last_name, email },
      transaction: t,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const participantId = (participant.toJSON() as any).id

    const cartonIds = available.map((c: import('sequelize').Model) => (c.toJSON() as { id: string }).id)

    // Assigner les cartons
    await db.Carton.update(
      { participant_id: participantId, status: 'sold' },
      { where: { id: cartonIds }, transaction: t }
    )

    // Créer le paiement
    const paiement = await db.Paiement.create(
      {
        participant_id: participantId,
        method:         'ONLINE',
        amount:         totalAmount,
        status:         'completed',
        paid_at:        new Date(),
      },
      { transaction: t }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paiementId = (paiement.toJSON() as any).id

    await db.PaiementCarton.bulkCreate(
      cartonIds.map((cartonId: string) => ({
        paiement_id:    paiementId,
        carton_id:      cartonId,
        carton_pack_id,
      })),
      { transaction: t }
    )

    return {
      participant_id: participantId,
      paiement_id:    paiementId,
      cartons:        available.map((c: import('sequelize').Model) => ({
        id:            (c.toJSON() as { id: string }).id,
        serial_number: (c.toJSON() as { serial_number: string }).serial_number,
      })),
      amount: totalAmount,
    }
  })

  return NextResponse.json(result, { status: 201 })
}
