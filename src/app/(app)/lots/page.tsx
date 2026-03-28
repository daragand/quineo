export const dynamic = 'force-dynamic'

import { getServerUser } from '@/lib/auth-server'
import { listLots } from '@/lib/services/lots'
import { LotsClient } from './Client'

export default async function LotsPage() {
  const user = await getServerUser()
  const data = user ? await listLots(user) : { session: null, lots: [] }

  return (
    <LotsClient
      initialLots={data.lots}
      sessionId={data.session?.id ?? null}
      sessionName={data.session?.name ?? 'Aucune session active'}
    />
  )
}
