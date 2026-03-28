export const dynamic = 'force-dynamic'

import { getServerUser } from '@/lib/auth-server'
import { listUsers } from '@/lib/services/users'
import { UtilisateursClient } from './Client'

export default async function UtilisateursPage() {
  const user  = await getServerUser()
  const users = user ? await listUsers(user) : []

  return <UtilisateursClient initialUsers={users} />
}
