/**
 * sumup.ts — Intégration SumUp Checkouts API.
 * Utilise l'API REST directement, sans SDK.
 */

export interface SumUpConfig {
  client_id:     string
  client_secret: string
  merchant_code: string
}

const SUMUP_API = 'https://api.sumup.com'

async function getAccessToken(config: SumUpConfig): Promise<string> {
  const res = await fetch(`${SUMUP_API}/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     config.client_id,
      client_secret: config.client_secret,
    }),
  })

  if (!res.ok) throw new Error(`SumUp auth failed: ${res.status}`)
  const data = await res.json() as { access_token: string }
  return data.access_token
}

export interface SumUpCheckoutResult {
  redirect_url:       string
  provider_reference: string   // SumUp Checkout ID
}

export async function createSumUpCheckout(
  config:      SumUpConfig,
  paiementId:  string,
  amount:      number,
  description: string,
  returnUrl:   string,
): Promise<SumUpCheckoutResult> {
  const token = await getAccessToken(config)

  const res = await fetch(`${SUMUP_API}/v0.1/checkouts`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      checkout_reference: paiementId,
      amount,
      currency:      'EUR',
      merchant_code: config.merchant_code,
      description,
      return_url:    returnUrl,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`SumUp checkout creation failed: ${res.status} ${err}`)
  }

  const checkout = await res.json() as { id: string }
  return {
    redirect_url:       `https://pay.sumup.com/b2c/${checkout.id}`,
    provider_reference: checkout.id,
  }
}

export async function getSumUpCheckoutStatus(
  config:     SumUpConfig,
  checkoutId: string,
): Promise<{ paid: boolean }> {
  const token = await getAccessToken(config)

  const res = await fetch(`${SUMUP_API}/v0.1/checkouts/${checkoutId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`SumUp checkout status failed: ${res.status}`)
  const data = await res.json() as { status: string }
  return { paid: data.status === 'PAID' }
}
