import { getServerUser } from '@/lib/auth-server'
import { listCartons } from '@/lib/services/cartons'
import { CartonsClient } from './Client'

export default async function CartonsPage() {
  const user = await getServerUser()
  const data = user ? await listCartons(user) : {
    sessions: [], session: null, cartons: [],
    total: 0, counts: { available: 0, sold: 0, cancelled: 0 },
  }

  return (
    <CartonsClient
      initialCartons={data.cartons}
      initialTotal={data.total}
      initialCounts={data.counts}
      sessionId={data.session?.id ?? null}
      sessionName={data.session?.name ?? 'Aucune session active'}
      sessionStatus={data.session?.status ?? null}
      sessionMaxCartons={data.session?.max_cartons ?? null}
      sessions={data.sessions}
    />
  )
}
