export const dynamic = 'force-dynamic'

import { getServerUser } from '@/lib/auth-server'
import { getRapportsData } from '@/lib/services/rapports'
import { RapportsClient } from './Client'

export default async function RapportsPage() {
  const user = await getServerUser()
  const data = user
    ? await getRapportsData(user)
    : { sessions: [], monthly: [], associationName: 'Association', availableYears: [], currentYear: String(new Date().getFullYear()) }

  return (
    <RapportsClient
      sessions={data.sessions}
      monthly={data.monthly}
      associationName={data.associationName}
      availableYears={data.availableYears.length > 0 ? data.availableYears : [data.currentYear]}
    />
  )
}
