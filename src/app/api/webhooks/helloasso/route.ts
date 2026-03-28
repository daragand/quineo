import { NextRequest, NextResponse } from 'next/server'
import { db }                        from '@/lib/db'
import { confirmPayment }            from '@/lib/payment/confirm'

// ─────────────────────────────────────────
// POST /api/webhooks/helloasso
// Reçoit les notifications HelloAsso après paiement
//
// Configuration dans HelloAsso → Paramètres → Notifications :
//   URL de notification : https://votreapp.com/api/webhooks/helloasso
// ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // HelloAsso envoie les événements : { eventType, data: { ... } }
  const eventType = body.eventType as string | undefined
  const data      = (body.data ?? {}) as Record<string, unknown>

  if (eventType !== 'Payment') return NextResponse.json({ received: true })

  // Extraire le paiement_id depuis les metadata
  const metadata   = (data.metadata ?? {}) as Record<string, string>
  const paiementId = metadata.paiement_id

  if (!paiementId) return NextResponse.json({ received: true })

  const paiement = await db.Paiement.findOne({ where: { id: paiementId } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = paiement?.toJSON() as any
  if (!p || p.status !== 'pending') return NextResponse.json({ received: true })

  const paymentState = data.state as string | undefined
  if (paymentState === 'Authorized') {
    const externalRef = data.id as string | undefined
    await confirmPayment(paiementId, externalRef ? String(externalRef) : undefined)
  }

  return NextResponse.json({ received: true })
}
