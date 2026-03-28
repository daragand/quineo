import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { releaseExpiredReservations, confirmPayment } from '@/lib/payment/confirm'
import { createStripeCheckout }    from '@/lib/payment/stripe'
import { createPayPalOrder }       from '@/lib/payment/paypal'
import { createSumUpCheckout }     from '@/lib/payment/sumup'
import { createHelloAssoCheckout } from '@/lib/payment/helloasso'

type Ctx = { params: Promise<{ slug: string }> }

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

const OrderSchema = z.object({
  first_name:  z.string().min(1).max(80),
  last_name:   z.string().min(1).max(80),
  email:       z.email(),
  birth_date:  z.string().date().optional(),
  provider_id: z.string().uuid().optional(),    // null = provider 'other' / gratuit
  items: z.array(z.object({
    carton_pack_id: z.uuid(),
    quantity:       z.number().int().min(1).max(20),
  })).min(1),
})

// ─────────────────────────────────────────
// POST /api/public/sessions/[slug]/order
// ─────────────────────────────────────────

export async function POST(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params

  const session = await db.Session.findOne({
    where:   { display_code: slug },
    include: [{ model: db.Association, as: 'association', attributes: ['id', 'name'] }],
  })
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

  const { first_name, last_name, email, birth_date, provider_id, items } = parsed.data

  // ── Résoudre le provider ───────────────────────────────────────────────

  let provider: import('sequelize').Model | null = null
  if (provider_id) {
    provider = await db.PaymentProvider.findOne({
      where: { id: provider_id, association_id: s.association_id, active: true },
    })
    if (!provider) return NextResponse.json({ error: 'Prestataire de paiement introuvable' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providerData = provider?.toJSON() as any

  // ── Valider les packs et calculer le total ─────────────────────────────

  type PackInfo = {
    pack:          import('sequelize').Model
    quantity:      number
    cartonsNeeded: number
    packPrice:     number
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
      return NextResponse.json({ error: `Forfait introuvable : ${item.carton_pack_id}` }, { status: 404 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p           = pack.toJSON() as any
    const cartonsNeeded = (p.quantity as number) * item.quantity
    const packPrice     = parseFloat(p.price) * item.quantity

    packInfos.push({ pack, quantity: item.quantity, cartonsNeeded, packPrice, packId: item.carton_pack_id })
    totalCartons += cartonsNeeded
    totalAmount  += packPrice
  }

  // ── Libérer les réservations expirées avant de vérifier le stock ───────

  await releaseExpiredReservations(s.id)

  // ── Vérifier le stock global ───────────────────────────────────────────

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

  // ── Vérifier quota max par personne ───────────────────────────────────

  if (s.max_cartons) {
    const existingParticipant = await db.Participant.findOne({ where: { email }, attributes: ['id'] })
    if (existingParticipant) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingId   = (existingParticipant.toJSON() as any).id
      const alreadyOwned = await db.Carton.count({
        where: { session_id: s.id, participant_id: existingId, status: ['sold', 'reserved'] },
      })
      if (alreadyOwned + totalCartons > s.max_cartons) {
        return NextResponse.json(
          { error: `Quota dépassé — vous possédez déjà ${alreadyOwned} carton(s), max autorisé : ${s.max_cartons}` },
          { status: 409 },
        )
      }
    }
  }

  // ── Transaction : créer participant + réserver cartons + créer paiement ─

  const result = await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
    const [participant] = await db.Participant.findOrCreate({
      where:       { email },
      defaults:    { first_name, last_name, email, birth_date: birth_date ?? null },
      transaction: t,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const participantId = (participant.toJSON() as any).id as string

    const allCartonIds = available.map(
      (c: import('sequelize').Model) => (c.toJSON() as { id: string }).id
    )

    // Réserver les cartons
    await db.Carton.update(
      { participant_id: participantId, status: 'reserved' },
      { where: { id: allCartonIds }, transaction: t },
    )

    // Créer le paiement en attente
    const paiement = await db.Paiement.create(
      {
        participant_id: participantId,
        provider_id:    providerData?.id ?? null,
        method:         'ONLINE',
        amount:         totalAmount,
        status:         'pending',
      },
      { transaction: t },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paiementId = (paiement.toJSON() as any).id as string

    // Relier cartons → paiement (par pack)
    const paiementCartonRows: { paiement_id: string; carton_id: string; carton_pack_id: string }[] = []
    let cursor = 0
    for (const pi of packInfos) {
      const slice = allCartonIds.slice(cursor, cursor + pi.cartonsNeeded)
      cursor += pi.cartonsNeeded
      for (const cid of slice) {
        paiementCartonRows.push({ paiement_id: paiementId, carton_id: cid, carton_pack_id: pi.packId })
      }
    }
    await db.PaiementCarton.bulkCreate(paiementCartonRows, { transaction: t })

    const assignedCartons = available.map((c: import('sequelize').Model) => ({
      id:            (c.toJSON() as { id: string }).id,
      serial_number: (c.toJSON() as { serial_number: string }).serial_number,
    }))

    return { participantId, paiementId, allCartonIds, assignedCartons }
  })

  // ── Cas gratuit (amount = 0) ou provider 'other' ──────────────────────

  if (totalAmount === 0 || !providerData) {
    await confirmPayment(result.paiementId)

    return NextResponse.json({
      completed:   true,
      paiement_id: result.paiementId,
      cartons:     result.assignedCartons,
      amount:      totalAmount,
    }, { status: 201 })
  }

  // ── Initier le paiement auprès du provider ────────────────────────────

  const sessionDescription = `Loto ${s.name} — ${totalCartons} carton${totalCartons > 1 ? 's' : ''}`
  const returnBase  = `${APP_URL}/paiement/retour?paiement_id=${result.paiementId}`
  const cancelUrl   = `${APP_URL}/paiement/annule?paiement_id=${result.paiementId}`
  const errorUrl    = `${APP_URL}/paiement/annule?paiement_id=${result.paiementId}&error=1`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = (providerData.config ?? {}) as Record<string, string>

  try {
    let redirectUrl:       string
    let providerReference: string

    switch (providerData.type as string) {
      case 'stripe': {
        const r = await createStripeCheckout(
          { secret_key: config.secret_key, webhook_secret: config.webhook_secret },
          result.paiementId,
          totalAmount,
          sessionDescription,
          `${returnBase}&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl,
        )
        redirectUrl       = r.redirect_url
        providerReference = r.provider_reference
        break
      }
      case 'paypal': {
        const r = await createPayPalOrder(
          {
            client_id:     config.client_id,
            client_secret: config.client_secret,
            environment:   (config.environment as 'sandbox' | 'production') ?? 'production',
          },
          result.paiementId,
          totalAmount,
          sessionDescription,
          `${returnBase}&provider=paypal`,
          cancelUrl,
        )
        redirectUrl       = r.redirect_url
        providerReference = r.provider_reference
        break
      }
      case 'sumup': {
        const r = await createSumUpCheckout(
          {
            client_id:     config.client_id,
            client_secret: config.client_secret,
            merchant_code: config.merchant_code,
          },
          result.paiementId,
          totalAmount,
          sessionDescription,
          `${returnBase}&provider=sumup`,
        )
        redirectUrl       = r.redirect_url
        providerReference = r.provider_reference
        break
      }
      case 'helloasso': {
        const r = await createHelloAssoCheckout(
          {
            client_id:         config.client_id,
            client_secret:     config.client_secret,
            organization_slug: config.organization_slug,
          },
          result.paiementId,
          totalAmount,
          sessionDescription,
          `${returnBase}&provider=helloasso`,
          cancelUrl,
          errorUrl,
        )
        redirectUrl       = r.redirect_url
        providerReference = r.provider_reference
        break
      }
      default:
        // Provider 'other' — ne devrait pas arriver ici, mais par sécurité
        await confirmPayment(result.paiementId)
        return NextResponse.json({
          completed:   true,
          paiement_id: result.paiementId,
          cartons:     result.assignedCartons,
          amount:      totalAmount,
        }, { status: 201 })
    }

    // Stocker la référence provider dans le paiement
    await db.Paiement.update(
      { reference: providerReference },
      { where: { id: result.paiementId } },
    )

    return NextResponse.json({ redirect_url: redirectUrl }, { status: 202 })

  } catch (err) {
    console.error('[order] payment initiation failed:', err)

    // Libérer les réservations si l'initiation échoue
    await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
      await db.Carton.update(
        { status: 'available', participant_id: null },
        { where: { id: result.allCartonIds, status: 'reserved' }, transaction: t },
      )
      await db.Paiement.update(
        { status: 'failed' },
        { where: { id: result.paiementId }, transaction: t },
      )
    })

    return NextResponse.json(
      { error: 'Impossible de contacter le prestataire de paiement. Veuillez réessayer.' },
      { status: 502 },
    )
  }
}
