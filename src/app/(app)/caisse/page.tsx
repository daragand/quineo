import { getServerUser } from '@/lib/auth-server'
import { getCaisseData } from '@/lib/services/caisse'
import { db } from '@/lib/db'
import CaisseClient from './CaisseClient'

export default async function CaissePage() {
  const user = await getServerUser()
  const data = user
    ? await getCaisseData(user)
    : { session: null, packs: [], cartonsAvailable: 0, cartonsTotal: 0 }

  const assoc = user?.association_id
    ? await db.Association.findOne({
        where:      { id: user.association_id },
        attributes: ['require_birth_date'],
        raw:        true,
      }) as { require_birth_date: boolean } | null
    : null

  return (
    <CaisseClient
      session={data.session}
      packs={data.packs}
      cartonsAvailable={data.cartonsAvailable}
      cartonsTotal={data.cartonsTotal}
      requireBirthDate={assoc?.require_birth_date ?? false}
    />
  )
}
