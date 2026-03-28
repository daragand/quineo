import { NextRequest, NextResponse } from 'next/server'
import { db }                        from '@/lib/db'
import { confirmPayment }            from '@/lib/payment/confirm'
import { capturePayPalOrder }        from '@/lib/payment/paypal'

// ─────────────────────────────────────────
// POST /api/webhooks/paypal
// Reçoit les événements PayPal IPN / Webhooks v2
//
// Configuration dans PayPal Developer Dashboard :
//   Endpoint URL : https://votreapp.com/api/webhooks/paypal
//   Événements   : CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED
// ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType    = body.event_type as string
  const resource     = (body.resource ?? {}) as Record<string, unknown>

  // Extraire le paiement_id depuis purchase_units[0].reference_id
  const purchaseUnits = (resource.purchase_units ?? []) as Array<{ reference_id?: string }>
  const paiementId    = purchaseUnits[0]?.reference_id

  if (!paiementId) return NextResponse.json({ received: true })

  const paiement = await db.Paiement.findOne({ where: { id: paiementId } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = paiement?.toJSON() as any
  if (!p || p.status !== 'pending') return NextResponse.json({ received: true })

  if (eventType === 'CHECKOUT.ORDER.APPROVED') {
    // Charger le provider pour capturer via API
    const provider = await db.PaymentProvider.findOne({ where: { id: p.provider_id } })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prov   = provider?.toJSON() as any
    const config = (prov?.config ?? {}) as Record<string, string>

    const orderId = resource.id as string
    try {
      const { paid } = await capturePayPalOrder(
        {
          client_id:     config.client_id,
          client_secret: config.client_secret,
          environment:   (config.environment as 'sandbox' | 'production') ?? 'production',
        },
        orderId,
      )
      if (paid) await confirmPayment(paiementId, orderId)
    } catch (err) {
      console.error('[webhook/paypal] capture error:', err)
    }
  }

  if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const orderId = (resource.supplementary_data as Record<string, unknown>)?.related_ids
      ? ((resource.supplementary_data as Record<string, unknown>).related_ids as Record<string, string>).order_id
      : undefined
    await confirmPayment(paiementId, orderId)
  }

  return NextResponse.json({ received: true })
}
