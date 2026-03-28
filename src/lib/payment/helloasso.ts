/**
 * helloasso.ts — Intégration HelloAsso Checkout API v5.
 * Utilise l'API REST directement, sans SDK.
 */

export interface HelloAssoConfig {
  client_id:         string
  client_secret:     string
  organization_slug: string
}

const HA_API = 'https://api.helloasso.com'

async function getAccessToken(config: HelloAssoConfig): Promise<string> {
  const res = await fetch(`${HA_API}/oauth2/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     config.client_id,
      client_secret: config.client_secret,
    }),
  })

  if (!res.ok) throw new Error(`HelloAsso auth failed: ${res.status}`)
  const data = await res.json() as { access_token: string }
  return data.access_token
}

export interface HelloAssoCheckoutResult {
  redirect_url:       string
  provider_reference: string   // HelloAsso Checkout Intent ID
}

export async function createHelloAssoCheckout(
  config:      HelloAssoConfig,
  paiementId:  string,
  amount:      number,           // en euros
  description: string,
  returnUrl:   string,
  backUrl:     string,           // URL d'annulation
  errorUrl:    string,
): Promise<HelloAssoCheckoutResult> {
  const token = await getAccessToken(config)

  const res = await fetch(
    `${HA_API}/v5/organizations/${config.organization_slug}/checkout-intents`,
    {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        totalAmount:      Math.round(amount * 100),   // en centimes
        initialAmount:    Math.round(amount * 100),
        itemName:         description,
        backUrl,
        returnUrl:        `${returnUrl}&ha_reference=${paiementId}`,
        errorUrl,
        containsDonation: false,
        metadata: { paiement_id: paiementId },
      }),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HelloAsso checkout creation failed: ${res.status} ${err}`)
  }

  const data = await res.json() as { id: string; redirectUrl: string }
  return {
    redirect_url:       data.redirectUrl,
    provider_reference: data.id,
  }
}

export async function getHelloAssoCheckoutStatus(
  config:            HelloAssoConfig,
  checkoutIntentId:  string,
): Promise<{ paid: boolean }> {
  const token = await getAccessToken(config)

  const res = await fetch(
    `${HA_API}/v5/organizations/${config.organization_slug}/checkout-intents/${checkoutIntentId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (!res.ok) throw new Error(`HelloAsso checkout status failed: ${res.status}`)
  const data = await res.json() as { order?: { id: number } }
  // Un checkout est considéré payé si un order a été créé
  return { paid: !!data.order }
}
