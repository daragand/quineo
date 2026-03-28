/**
 * stripe.ts — Intégration Stripe Checkout (hosted page).
 * Utilise le SDK Stripe serveur. Aucune dépendance client-side.
 */

import Stripe from 'stripe'

export interface StripeConfig {
  secret_key:      string
  webhook_secret?: string
  publishable_key?: string
}

export interface StripeCheckoutResult {
  redirect_url: string
  provider_reference: string   // Stripe Checkout Session ID
}

export async function createStripeCheckout(
  config:      StripeConfig,
  paiementId:  string,
  amount:      number,          // en euros
  description: string,
  successUrl:  string,
  cancelUrl:   string,
): Promise<StripeCheckoutResult> {
  const stripe = new Stripe(config.secret_key, { apiVersion: '2026-02-25.clover' })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode:                 'payment',
    line_items: [
      {
        price_data: {
          currency:     'eur',
          product_data: { name: description },
          unit_amount:  Math.round(amount * 100),   // centimes
        },
        quantity: 1,
      },
    ],
    metadata: { paiement_id: paiementId },
    success_url: successUrl,
    cancel_url:  cancelUrl,
  })

  return {
    redirect_url:        session.url!,
    provider_reference:  session.id,
  }
}

export async function verifyStripeCheckout(
  config:           StripeConfig,
  checkoutSessionId: string,
): Promise<{ paid: boolean; paymentIntentId?: string }> {
  const stripe = new Stripe(config.secret_key, { apiVersion: '2026-02-25.clover' })
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId)

  return {
    paid:            session.payment_status === 'paid',
    paymentIntentId: typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id,
  }
}

export async function verifyStripeWebhook(
  config:    StripeConfig,
  body:      string,
  signature: string,
): Promise<Stripe.Event | null> {
  if (!config.webhook_secret) return null
  const stripe = new Stripe(config.secret_key, { apiVersion: '2026-02-25.clover' })
  try {
    return stripe.webhooks.constructEvent(body, signature, config.webhook_secret)
  } catch {
    return null
  }
}
