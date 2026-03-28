/**
 * paypal.ts — Intégration PayPal Orders API v2.
 * Utilise l'API REST directement, sans SDK.
 */

export interface PayPalConfig {
  client_id:     string
  client_secret: string
  environment:   'sandbox' | 'production'
}

const BASE = (env: string) =>
  env === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(config: PayPalConfig): Promise<string> {
  const base  = BASE(config.environment)
  const creds = Buffer.from(`${config.client_id}:${config.client_secret}`).toString('base64')

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method:  'POST',
    headers: {
      Authorization:  `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
  const data = await res.json() as { access_token: string }
  return data.access_token
}

export interface PayPalCheckoutResult {
  redirect_url:       string
  provider_reference: string   // PayPal Order ID
}

export async function createPayPalOrder(
  config:      PayPalConfig,
  paiementId:  string,
  amount:      number,
  description: string,
  returnUrl:   string,
  cancelUrl:   string,
): Promise<PayPalCheckoutResult> {
  const base  = BASE(config.environment)
  const token = await getAccessToken(config)

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: paiementId,
          description,
          amount: {
            currency_code: 'EUR',
            value:         amount.toFixed(2),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal order creation failed: ${res.status} ${err}`)
  }

  const order = await res.json() as {
    id:    string
    links: Array<{ rel: string; href: string }>
  }

  const approveLink = order.links.find(l => l.rel === 'payer-action' || l.rel === 'approve')
  if (!approveLink) throw new Error('PayPal approve link not found')

  return {
    redirect_url:       approveLink.href,
    provider_reference: order.id,
  }
}

export async function capturePayPalOrder(
  config:  PayPalConfig,
  orderId: string,
): Promise<{ paid: boolean }> {
  const base  = BASE(config.environment)
  const token = await getAccessToken(config)

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok && res.status !== 422) {
    throw new Error(`PayPal capture failed: ${res.status}`)
  }

  const data = await res.json() as { status: string }
  return { paid: data.status === 'COMPLETED' }
}

export async function getPayPalOrderStatus(
  config:  PayPalConfig,
  orderId: string,
): Promise<{ paid: boolean }> {
  const base  = BASE(config.environment)
  const token = await getAccessToken(config)

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`PayPal order status failed: ${res.status}`)
  const data = await res.json() as { status: string }
  return { paid: data.status === 'COMPLETED' }
}
