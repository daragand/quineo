import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual }          from 'crypto'
import { db }                        from '@/lib/db'
import { confirmPayment }            from '@/lib/payment/confirm'
import { capturePayPalOrder }        from '@/lib/payment/paypal'

function verifyToken(provided: string, expected: string): boolean {
  try {
    const a = Buffer.from(provided)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType    = body.event_type as string
  const resource     = (body.resource ?? {}) as Record<string, unknown>

  const purchaseUnits = (resource.purchase_units ?? []) as Array<{ reference_id?: string }>
  const paiementId    = purchaseUnits[0]?.reference_id

  if (!paiementId) return NextResponse.json({ received: true })

  const paiement = await db.Paiement.findOne({ where: { id: paiementId } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = paiement?.toJSON() as any
  if (!p || p.status !== 'pending') return NextResponse.json({ received: true })

  // Authentification par token dans l'URL (?token=...) — stocké dans config.webhook_token
  // L'URL à configurer dans PayPal Dashboard est : https://app.example.com/api/webhooks/paypal?token=<webhook_token>
  if (p.provider_id) {
    const provider = await db.PaymentProvider.findOne({ where: { id: p.provider_id } })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prov         = provider?.toJSON() as any
    const webhookToken = prov?.config?.webhook_token as string | undefined

    if (!webhookToken) {
      console.error('[webhook/paypal] webhook_token absent pour le provider', p.provider_id)
      return NextResponse.json({ error: 'Webhook non configuré' }, { status: 500 })
    }

    const urlToken = req.nextUrl.searchParams.get('token') ?? ''
    if (!urlToken || !verifyToken(urlToken, webhookToken)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
  }

  if (eventType === 'CHECKOUT.ORDER.APPROVED') {
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
