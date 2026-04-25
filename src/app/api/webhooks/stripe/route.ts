import { NextRequest, NextResponse } from 'next/server'
import { db }                        from '@/lib/db'
import { confirmPayment }            from '@/lib/payment/confirm'
import { verifyStripeWebhook }       from '@/lib/payment/stripe'

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let rawEvent: { type: string; data: { object: Record<string, unknown> } }
  try {
    rawEvent = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const obj        = rawEvent.data.object as Record<string, unknown>
  const metadata   = (obj.metadata ?? {}) as Record<string, string>
  const paiementId = metadata.paiement_id

  if (!paiementId) return NextResponse.json({ received: true })

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

  // webhook_secret obligatoire — rejeter si absent ou si signature manquante
  if (!webhookSecret) {
    console.error('[webhook/stripe] webhook_secret absent pour le paiement', paiementId)
    return NextResponse.json({ error: 'Webhook secret non configuré' }, { status: 500 })
  }
  if (!signature) {
    return NextResponse.json({ error: 'Signature Stripe manquante' }, { status: 400 })
  }

  const event = await verifyStripeWebhook(
    { secret_key: '', webhook_secret: webhookSecret },
    body,
    signature,
  )
  if (!event) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  switch (rawEvent.type) {
    case 'checkout.session.completed': {
      const sessionId = obj.id as string
      await confirmPayment(paiementId, sessionId)
      break
    }
    case 'payment_intent.payment_failed': {
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
