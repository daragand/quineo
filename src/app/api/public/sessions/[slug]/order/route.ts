import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sendOrderConfirmation } from '@/lib/mailer'

type Ctx = { params: Promise<{ slug: string }> }

const OrderSchema = z.object({
  first_name: z.string().min(1).max(80),
  last_name:  z.string().min(1).max(80),
  email:      z.string().email(),
  items: z.array(z.object({
    carton_pack_id: z.string().uuid(),
    quantity:       z.number().int().min(1).max(20),
  })).min(1),
  method: z.enum(['ONLINE']),
})

// ─────────────────────────────────────────
// POST /api/public/sessions/[slug]/order
// slug = display_code à 4 chiffres
// Commande publique (multi-forfait), sans auth.
// ─────────────────────────────────────────

export async function POST(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params

  const session = await db.Session.findOne({
    where:   { display_code: slug },
    include: [{ model: db.Association, as: 'association', attributes: ['name'] }],
  })
  if (!session) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
  }

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

  const { first_name, last_name, email, items } = parsed.data

  // ── Valider les packs et calculer le total ─────────────────────────────────

  type PackInfo = {
    pack:          import('sequelize').Model
    quantity:      number      // nb de packs commandés
    cartonsNeeded: number      // cartons à allouer
    packPrice:     number      // prix unitaire du pack
    packId:        string
  }

  const packInfos: PackInfo[] = []
  let totalCartons = 0
  let totalAmount  = 0

  for (const item of items) {
    const pack = await db.CartonPack.findOne({
      where: { id: item.carton_pack_id, session_id: s.id, is_active: true },
    })
    if (!pack) {
      return NextResponse.json(
        { error: `Forfait introuvable : ${item.carton_pack_id}` },
        { status: 404 },
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p           = pack.toJSON() as any
    const cartonsNeeded = (p.quantity as number) * item.quantity
    const packPrice     = parseFloat(p.price) * item.quantity

    packInfos.push({
      pack,
      quantity:      item.quantity,
      cartonsNeeded,
      packPrice,
      packId:        item.carton_pack_id,
    })

    totalCartons += cartonsNeeded
    totalAmount  += packPrice
  }

  // ── Vérifier le stock global ───────────────────────────────────────────────

  const available = await db.Carton.findAll({
    where: { session_id: s.id, status: 'available' },
    limit: totalCartons,
    order: [['serial_number', 'ASC']],
  })

  if (available.length < totalCartons) {
    return NextResponse.json(
      { error: `Stock insuffisant — ${available.length} carton(s) disponible(s)` },
      { status: 409 },
    )
  }

  // ── Vérifier quota max par personne ───────────────────────────────────────

  if (s.max_cartons) {
    // Chercher un participant existant avec le même email
    const existingParticipant = await db.Participant.findOne({
      where: { email },
      attributes: ['id'],
    })
    if (existingParticipant) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingParticipantId = (existingParticipant.toJSON() as any).id
      const alreadyOwned = await db.Carton.count({
        where: { session_id: s.id, participant_id: existingParticipantId, status: 'sold' },
      })
      if (alreadyOwned + totalCartons > s.max_cartons) {
        return NextResponse.json(
          { error: `Quota dépassé — vous possédez déjà ${alreadyOwned} carton(s), max autorisé : ${s.max_cartons}` },
          { status: 409 },
        )
      }
    }
  }

  // ── Transaction : assigner cartons + créer paiement ──────────────────────

  const result = await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
    const [participant] = await db.Participant.findOrCreate({
      where:        { email },
      defaults:     { first_name, last_name, email },
      transaction:  t,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const participantId = (participant.toJSON() as any).id as string

    // Pré-découper les cartons par pack
    const allCartonIds = available.map(
      (c: import('sequelize').Model) => (c.toJSON() as { id: string }).id
    )

    let cursor = 0
    const paiementCartonRows: { paiement_id: string; carton_id: string; carton_pack_id: string }[] = []
    const assignedCartons: { id: string; serial_number: string }[] = []

    for (const pi of packInfos) {
      const slice = allCartonIds.slice(cursor, cursor + pi.cartonsNeeded)
      cursor += pi.cartonsNeeded

      for (const cid of slice) {
        paiementCartonRows.push({ paiement_id: '', carton_id: cid, carton_pack_id: pi.packId })
      }

      const serials = available
        .slice(cursor - pi.cartonsNeeded, cursor)
        .map((c: import('sequelize').Model) => ({
          id:            (c.toJSON() as { id: string }).id,
          serial_number: (c.toJSON() as { serial_number: string }).serial_number,
        }))
      assignedCartons.push(...serials)
    }

    // Assigner tous les cartons au participant
    await db.Carton.update(
      { participant_id: participantId, status: 'sold' },
      { where: { id: allCartonIds }, transaction: t },
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
      { transaction: t },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paiementId = (paiement.toJSON() as any).id as string

    // Relier cartons → paiement
    await db.PaiementCarton.bulkCreate(
      paiementCartonRows.map(r => ({ ...r, paiement_id: paiementId })),
      { transaction: t },
    )

    return { participantId, paiementId, allCartonIds, assignedCartons }
  })

  // ── Email de confirmation + PDF en pièce jointe ──────────────────────────

  // Charger les grilles pour le PDF
  const cartonsForPdf = await db.Carton.findAll({
    where:      { id: result.allCartonIds },
    attributes: ['id', 'serial_number', 'grid'],
    order:      [['serial_number', 'ASC']],
  })

  const cartonPdfData = cartonsForPdf.map((c: import('sequelize').Model) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cj = c.toJSON() as any
    return {
      id:     cj.id     as string,
      serial: cj.serial_number as string,
      // grid stored as JSONB — already parsed by Sequelize
      grid:   (cj.grid as number[][]) ?? [],
    }
  })

  // Envoyer l'email (non-bloquant sur erreur : on répond quand même 201)
  sendOrderConfirmation({
    to:              email,
    firstName:       first_name,
    lastName:        last_name,
    sessionName:     s.name as string,
    sessionDate:     (s.date as string | null) ?? null,
    associationName: (s.association?.name as string) ?? '',
    displayCode:     (s.display_code as string | null) ?? null,
    cartons:         cartonPdfData,
    amount:          totalAmount,
    paiementId:      result.paiementId,
  }).catch((err: unknown) => console.error('[mailer] sendOrderConfirmation failed:', err))

  return NextResponse.json({
    paiement_id: result.paiementId,
    cartons:     result.assignedCartons,
    amount:      totalAmount,
  }, { status: 201 })
}
