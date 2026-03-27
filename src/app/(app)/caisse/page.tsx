import { getServerUser } from '@/lib/auth-server'
import { getCaisseData } from '@/lib/services/caisse'
import CaisseClient from './CaisseClient'

export default async function CaissePage() {
  const user = await getServerUser()
  const data = user
    ? await getCaisseData(user)
    : { session: null, packs: [], cartonsAvailable: 0, cartonsTotal: 0 }

  return (
    <CaisseClient
      session={data.session}
      packs={data.packs}
      cartonsAvailable={data.cartonsAvailable}
      cartonsTotal={data.cartonsTotal}
    />
  )
}
