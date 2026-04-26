import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { db }                          from '@/lib/db'
import { confirmPayment }              from '@/lib/payment/confirm'

function verifySumUpSignature(rawBody: string, sigHeader: string, secret: string): boolean {
  try {
    const sig      = sigHeader.startsWith('sha256=') ? sigHeader.slice(7) : sigHeader
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    const expBuf   = Buffer.from(expected, 'hex')
    const sigBuf   = Buffer.from(sig, 'hex')
    if (expBuf.length !== sigBuf.length) return false
    return timingSafeEqual(expBuf, sigBuf)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const checkoutId  = body.id                 as string | undefined
  const paiementId  = body.checkout_reference as string | undefined
  const status      = body.status             as string | undefined

  if (!paiementId) return NextResponse.json({ received: true })

  const paiement = await db.Paiement.findOne({ where: { id: paiementId } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = paiement?.toJSON() as any
  if (!p || p.status !== 'pending') return NextResponse.json({ received: true })

  // Vérification HMAC-SHA256 via config.webhook_secret de l'association
  if (p.provider_id) {
    const provider = await db.PaymentProvider.findOne({ where: { id: p.provider_id } })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prov          = provider?.toJSON() as any
    const webhookSecret = prov?.config?.webhook_secret as string | undefined

    if (!webhookSecret) {
      console.error('[webhook/sumup] webhook_secret absent pour le provider', p.provider_id)
      return NextResponse.json({ error: 'Webhook non configuré' }, { status: 500 })
    }

    const sigHeader = req.headers.get('x-payload-signature') ?? ''
    if (!sigHeader || !verifySumUpSignature(rawBody, sigHeader, webhookSecret)) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
    }
  }

  if (status === 'PAID') {
    await confirmPayment(paiementId, checkoutId)
  } else if (status === 'FAILED') {
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

  return NextResponse.json({ received: true })
}
