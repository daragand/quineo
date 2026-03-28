import { NextRequest, NextResponse } from 'next/server'
import { db }                        from '@/lib/db'
import { confirmPayment }            from '@/lib/payment/confirm'

// ─────────────────────────────────────────
// POST /api/webhooks/sumup
// Reçoit les notifications SumUp après paiement
//
// Configuration dans SumUp Dashboard → Intégrations → Webhooks :
//   Endpoint URL : https://votreapp.com/api/webhooks/sumup
//   Événement    : checkout.status.changed
// ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // SumUp envoie : { id, checkout_reference, status, ... }
  const checkoutId  = body.id                 as string | undefined
  const paiementId  = body.checkout_reference as string | undefined
  const status      = body.status             as string | undefined

  if (!paiementId) return NextResponse.json({ received: true })

  const paiement = await db.Paiement.findOne({ where: { id: paiementId } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = paiement?.toJSON() as any
  if (!p || p.status !== 'pending') return NextResponse.json({ received: true })

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
