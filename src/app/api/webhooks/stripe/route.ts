import { NextRequest, NextResponse } from 'next/server'
import { db }                        from '@/lib/db'
import { confirmPayment }            from '@/lib/payment/confirm'
import { verifyStripeWebhook }       from '@/lib/payment/stripe'

// ─────────────────────────────────────────
// POST /api/webhooks/stripe
// Reçoit les événements Stripe (checkout.session.completed, etc.)
//
// Configuration dans Stripe Dashboard :
//   Endpoint URL : https://votreapp.com/api/webhooks/stripe
//   Événements  : checkout.session.completed, payment_intent.payment_failed
// ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  // Extraire le paiement_id depuis les metadata (avant vérification signature)
  // pour pouvoir charger le bon webhook_secret per-association.
  let rawEvent: { type: string; data: { object: Record<string, unknown> } }
  try {
    rawEvent = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const obj        = rawEvent.data.object as Record<string, unknown>
  const metadata   = (obj.metadata ?? {}) as Record<string, string>
  const paiementId = metadata.paiement_id

  if (!paiementId) {
    // Événement sans paiement_id connu, ignorer silencieusement
    return NextResponse.json({ received: true })
  }

  // Charger le provider lié à ce paiement pour récupérer le webhook_secret
  const paiement = await db.Paiement.findOne({ where: { id: paiementId } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = paiement?.toJSON() as any

  let webhookSecret: string | undefined

  if (p?.provider_id) {
    const provider = await db.PaymentProvider.findOne({ where: { id: p.provider_id } })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prov     = provider?.toJSON() as any
    webhookSecret  = prov?.config?.webhook_secret
  }

  // Vérifier la signature si un webhook_secret est configuré
  if (webhookSecret && signature) {
    const event = await verifyStripeWebhook(
      { secret_key: '', webhook_secret: webhookSecret },
      body,
      signature,
    )
    if (!event) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  }

  // Traiter l'événement
  switch (rawEvent.type) {
    case 'checkout.session.completed': {
      const sessionId = obj.id as string
      await confirmPayment(paiementId, sessionId)
      break
    }
    case 'payment_intent.payment_failed': {
      // Libérer les réservations si paiement échoué
      if (p?.status === 'pending') {
        const pcRows = await db.PaiementCarton.findAll({
          where: { paiement_id: paiementId }, attributes: ['carton_id'],
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cartonIds = pcRows.map((r: import('sequelize').Model) => (r.toJSON() as any).carton_id)
        await db.Carton.update(
          { status: 'available', participant_id: null },
          { where: { id: cartonIds, status: 'reserved' } },
        )
        await db.Paiement.update({ status: 'failed' }, { where: { id: paiementId } })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
