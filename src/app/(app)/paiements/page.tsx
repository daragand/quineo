import { getServerUser } from '@/lib/auth-server'
import { listPaiements } from '@/lib/services/paiements'
import { PaiementsClient } from './Client'

export default async function PaiementsPage() {
  const user      = await getServerUser()
  const paiements = user ? await listPaiements(user) : []

  return <PaiementsClient initialPaiements={paiements} />
}
