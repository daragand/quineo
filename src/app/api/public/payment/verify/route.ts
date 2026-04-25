import { NextRequest, NextResponse } from 'next/server'
import { db }                        from '@/lib/db'
import { confirmPayment }            from '@/lib/payment/confirm'
import { verifyStripeCheckout }      from '@/lib/payment/stripe'
import { capturePayPalOrder }        from '@/lib/payment/paypal'
import { getSumUpCheckoutStatus }    from '@/lib/payment/sumup'
import { getHelloAssoCheckoutStatus } from '@/lib/payment/helloasso'
import { verifyViewToken }           from '@/lib/auth'

// ─────────────────────────────────────────
// GET /api/public/payment/verify
// Appelé depuis la page de retour après paiement.
// Vérifie le statut auprès du provider et confirme si payé.
//
// Query params:
//  paiement_id  — UUID du paiement interne
//  provider     — stripe | paypal | sumup | helloasso
//  session_id   — Stripe Checkout Session ID (pour Stripe)
//  token        — PayPal Order ID (pour PayPal, dans l'URL de retour)
// ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  const paiementId = sp.get('paiement_id')
  const provider   = sp.get('provider')
  const viewToken  = sp.get('view_token')

  if (!paiementId) {
    return NextResponse.json({ error: 'Paramètre paiement_id manquant' }, { status: 400 })
  }

  if (!viewToken || !verifyViewToken(paiementId, viewToken)) {
    return NextResponse.json({ error: 'Lien invalide' }, { status: 403 })
  }

  // Charger le paiement
  const paiement = await db.Paiement.findOne({ where: { id: paiementId } })
  if (!paiement) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = paiement.toJSON() as any

  // Paiement déjà confirmé
  if (p.status === 'completed') {
    return NextResponse.json(await buildSuccessPayload(paiementId))
  }

  // Paiement échoué
  if (p.status === 'failed') {
    return NextResponse.json({ status: 'failed' }, { status: 402 })
  }

  // Paiement toujours en attente — vérifier auprès du provider
  if (p.status !== 'pending') {
    return NextResponse.json({ status: p.status })
  }

  // Charger la config du provider
  if (!p.provider_id) {
    // Gratuit / other — confirmer immédiatement
    await confirmPayment(paiementId)
    return NextResponse.json(await buildSuccessPayload(paiementId))
  }

  const providerRecord = await db.PaymentProvider.findOne({ where: { id: p.provider_id } })
  if (!providerRecord) {
    return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prov   = providerRecord.toJSON() as any
  const config = (prov.config ?? {}) as Record<string, string>

  try {
    let paid = false
    let providerReference: string | undefined = p.reference

    switch (provider ?? prov.type) {
      case 'stripe': {
        const sessionId = sp.get('session_id') ?? p.reference
        if (!sessionId) return NextResponse.json({ status: 'pending' })

        const res = await verifyStripeCheckout(
          { secret_key: config.secret_key },
          sessionId,
        )
        paid              = res.paid
        providerReference = sessionId
        break
      }
      case 'paypal': {
        // PayPal renvoie ?token=ORDER_ID dans l'URL de retour
        const orderId = sp.get('token') ?? p.reference
        if (!orderId) return NextResponse.json({ status: 'pending' })

        // Capturer la commande PayPal (idempotent si déjà capturée)
        const res = await capturePayPalOrder(
          {
            client_id:     config.client_id,
            client_secret: config.client_secret,
            environment:   (config.environment as 'sandbox' | 'production') ?? 'production',
          },
          orderId,
        )
        paid              = res.paid
        providerReference = orderId
        break
      }
      case 'sumup': {
        const checkoutId = p.reference
        if (!checkoutId) return NextResponse.json({ status: 'pending' })

        const res = await getSumUpCheckoutStatus(
          { client_id: config.client_id, client_secret: config.client_secret, merchant_code: config.merchant_code },
          checkoutId,
        )
        paid = res.paid
        break
      }
      case 'helloasso': {
        const checkoutIntentId = p.reference
        if (!checkoutIntentId) return NextResponse.json({ status: 'pending' })

        const res = await getHelloAssoCheckoutStatus(
          {
            client_id:         config.client_id,
            client_secret:     config.client_secret,
            organization_slug: config.organization_slug,
          },
          checkoutIntentId,
        )
        paid = res.paid
        break
      }
      default:
        return NextResponse.json({ status: 'pending' })
    }

    if (paid) {
      await confirmPayment(paiementId, providerReference)
      return NextResponse.json(await buildSuccessPayload(paiementId))
    }

    return NextResponse.json({ status: 'pending' })

  } catch (err) {
    console.error('[payment/verify]', err)
    return NextResponse.json({ error: 'Erreur lors de la vérification du paiement' }, { status: 502 })
  }
}

// ─────────────────────────────────────────
// Construit la réponse de succès avec les cartons
// ─────────────────────────────────────────

async function buildSuccessPayload(paiementId: string) {
  const paiement = await db.Paiement.findOne({ where: { id: paiementId } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = paiement?.toJSON() as any

  const participant = await db.Participant.findOne({
    where:      { id: p?.participant_id },
    attributes: ['first_name', 'last_name', 'email'],
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const part = participant?.toJSON() as any

  const pcRows = await db.PaiementCarton.findAll({
    where:      { paiement_id: paiementId },
    attributes: ['carton_id'],
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cartonIds = pcRows.map((r: import('sequelize').Model) => (r.toJSON() as any).carton_id as string)

  const cartons = await db.Carton.findAll({
    where:      { id: cartonIds },
    attributes: ['id', 'serial_number'],
    order:      [['serial_number', 'ASC']],
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cartonList = cartons.map((c: import('sequelize').Model) => (c.toJSON() as any))

  return {
    status:      'completed',
    paiement_id: paiementId,
    amount:      parseFloat(p?.amount ?? '0'),
    first_name:  part?.first_name ?? '',
    last_name:   part?.last_name ?? '',
    email:       part?.email ?? '',
    cartons:     cartonList,
  }
}
