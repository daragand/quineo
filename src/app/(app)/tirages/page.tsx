export const dynamic = 'force-dynamic'

import { getServerUser } from '@/lib/auth-server'
import { getTirageData } from '@/lib/services/tirage'
import { listSessions } from '@/lib/services/sessions'
import { TiragesClient } from './TiragesClient'

export default async function TiragesPage() {
  const user = await getServerUser()
  if (!user) return null

  const [tirageData, sessions] = await Promise.all([
    getTirageData(user),
    listSessions(user),
  ])

  return (
    <TiragesClient
      activeTirage={tirageData.tirage}
      allSessions={sessions.map(s => ({ id: s.id, name: s.name }))}
    />
  )
}
