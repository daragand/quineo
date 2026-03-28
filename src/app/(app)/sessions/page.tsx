export const dynamic = 'force-dynamic'

import { getServerUser } from '@/lib/auth-server'
import { listSessions } from '@/lib/services/sessions'
import { SessionsClient } from './Client'

export default async function SessionsPage() {
  const user     = await getServerUser()
  const sessions = user ? await listSessions(user) : []

  return <SessionsClient initialSessions={sessions} />
}
