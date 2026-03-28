import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, apiError } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendOrderConfirmation } from '@/lib/mailer'

// ─────────────────────────────────────────
// POST /api/vente — vente caisse (transaction atomique, multi-forfait)
// ─────────────────────────────────────────

const VenteSchema = z.object({
  session_id:     z.string().uuid(),
  participant_id: z.string().uuid(),
  items: z.array(z.object({
    carton_pack_id: z.string().uuid(),
    quantity:       z.number().int().min(1),
  })).min(1),
  method:    z.enum(['CASH', 'EXTERNAL_TERMINAL', 'FREE']),
  amount:    z.number().nonnegative(),
  reference: z.string().optional(),  // réf TPE
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  const body   = await req.json()
  const parsed = VenteSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0].message)

  const { session_id, participant_id, items, method, amount, reference } = parsed.data

  // Vérifier session + scope association
  const session = await db.Session.findOne({
    where:   { id: session_id, association_id: user.association_id },
    include: [{ model: db.Association, as: 'association', attributes: ['name'] }],
  })
  if (!session) return apiError('Session introuvable', 404)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = session.toJSON() as any
  if (!['open', 'running'].includes(s.status as string)) {
    return apiError('Les ventes sont fermées pour cette session')
  }

  // ── Valider les packs ──────────────────────────────────────────────────────

  type PackInfo = {
    packId:        string
    cartonsNeeded: number
  }

  const packInfos: PackInfo[] = []
  let totalCartons = 0

  for (const item of items) {
    const pack = await db.CartonPack.findOne({
      where: { id: item.carton_pack_id, session_id, is_active: true },
    })
    if (!pack) return apiError(`Forfait introuvable : ${item.carton_pack_id}`, 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = pack.toJSON() as any
    const cartonsNeeded = (p.quantity as number) * item.quantity

    packInfos.push({ packId: item.carton_pack_id, cartonsNeeded })
    totalCartons += cartonsNeeded
  }

  // ── Stock global ──────────────────────────────────────────────────────────

  const available = await db.Carton.findAll({
    where: { session_id, status: 'available' },
    limit: totalCartons,
    order: [['serial_number', 'ASC']],
  })

  if (available.length < totalCartons) {
    return apiError(`Stock insuffisant : ${available.length} carton(s) disponible(s), ${totalCartons} requis`)
  }

  // ── Quota participant ─────────────────────────────────────────────────────

  const maxCartons = s.max_cartons as number | null
  if (maxCartons) {
    const alreadySold = await db.Carton.count({
      where: { session_id, participant_id, status: 'sold' },
    })
    if (alreadySold + totalCartons > maxCartons) {
      return apiError(`Quota dépassé : ${alreadySold}/${maxCartons} cartons déjà attribués`)
    }
  }

  // ── Transaction ───────────────────────────────────────────────────────────

  const result = await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
    const allCartonIds = available.map(
      (c: import('sequelize').Model) => (c.toJSON() as { id: string }).id
    )

    // Préparer les lignes paiement_carton par pack
    let cursor = 0
    const pcRows: { paiement_id: string; carton_id: string; carton_pack_id: string }[] = []

    for (const pi of packInfos) {
      const slice = allCartonIds.slice(cursor, cursor + pi.cartonsNeeded)
      cursor += pi.cartonsNeeded
      for (const cid of slice) {
        pcRows.push({ paiement_id: '', carton_id: cid, carton_pack_id: pi.packId })
      }
    }

    await db.Carton.update(
      { participant_id, status: 'sold' },
      { where: { id: allCartonIds }, transaction: t },
    )

    const paiement = await db.Paiement.create(
      { participant_id, method, amount, status: 'completed', reference, paid_at: new Date() },
      { transaction: t },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paiementId = (paiement.toJSON() as any).id as string

    await db.PaiementCarton.bulkCreate(
      pcRows.map(r => ({ ...r, paiement_id: paiementId })),
      { transaction: t },
    )

    return {
      paiement_id: paiementId,
      cartons:     available.map((c: import('sequelize').Model) =>
        c.toJSON() as { id: string; serial_number: string }
      ),
      allCartonIds,
    }
  })

  // ── Email (fire-and-forget si le participant a un email) ──────────────────

  let emailSent = false

  const participant = await db.Participant.findByPk(participant_id, {
    attributes: ['email', 'first_name', 'last_name'],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const part = participant?.toJSON() as any

  if (part?.email) {
    // Charger les grilles pour le PDF
    const cartonsForPdf = await db.Carton.findAll({
      where:      { id: result.allCartonIds },
      attributes: ['id', 'serial_number', 'grid'],
      order:      [['serial_number', 'ASC']],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cartonPdfData = cartonsForPdf.map((c: import('sequelize').Model) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cj = c.toJSON() as any
      return { id: cj.id as string, serial: cj.serial_number as string, grid: (cj.grid as number[][]) ?? [] }
    })

    emailSent = true
    sendOrderConfirmation({
      to:              part.email as string,
      firstName:       (part.first_name as string) ?? '',
      lastName:        (part.last_name  as string) ?? '',
      sessionName:     s.name           as string,
      sessionDate:     (s.date          as string | null) ?? null,
      associationName: (s.association?.name as string) ?? '',
      displayCode:     (s.display_code  as string | null) ?? null,
      cartons:         cartonPdfData,
      amount,
      paiementId:      result.paiement_id,
    }).catch((err: unknown) => console.error('[mailer] vente email failed:', err))
  }

  return NextResponse.json({
    paiement_id: result.paiement_id,
    cartons:     result.cartons,
    email_sent:  emailSent,
  }, { status: 201 })
})
