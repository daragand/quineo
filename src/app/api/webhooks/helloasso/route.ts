import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual }          from 'crypto'
import { db }                        from '@/lib/db'
import { confirmPayment }            from '@/lib/payment/confirm'

function verifyBearer(header: string, expected: string): boolean {
  const provided = header.startsWith('Bearer ') ? header.slice(7) : header
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

  const eventType = body.eventType as string | undefined
  const data      = (body.data ?? {}) as Record<string, unknown>

  if (eventType !== 'Payment') return NextResponse.json({ received: true })

  const metadata   = (data.metadata ?? {}) as Record<string, string>
  const paiementId = metadata.paiement_id

  if (!paiementId) return NextResponse.json({ received: true })

  // Charger le provider de ce paiement pour vérifier le webhook_secret par-association
  const paiement = await db.Paiement.findOne({ where: { id: paiementId } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = paiement?.toJSON() as any
  if (!p || p.status !== 'pending') return NextResponse.json({ received: true })

  if (p.provider_id) {
    const provider = await db.PaymentProvider.findOne({ where: { id: p.provider_id } })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prov           = provider?.toJSON() as any
    const webhookSecret  = prov?.config?.webhook_secret as string | undefined

    if (!webhookSecret) {
      console.error('[webhook/helloasso] webhook_secret absent pour le provider', p.provider_id)
      return NextResponse.json({ error: 'Webhook non configuré' }, { status: 500 })
    }

    const auth = req.headers.get('authorization') ?? ''
    if (!auth || !verifyBearer(auth, webhookSecret)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
  }

  const paymentState = data.state as string | undefined
  if (paymentState === 'Authorized') {
    const externalRef = data.id as string | undefined
    await confirmPayment(paiementId, externalRef ? String(externalRef) : undefined)
  }

  return NextResponse.json({ received: true })
}
