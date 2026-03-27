import { getServerUser } from '@/lib/auth-server'
import { getTirageData } from '@/lib/services/tirage'
import TirageClient from './TirageClient'

export default async function TiragePage() {
  const user = await getServerUser()
  const data = user
    ? await getTirageData(user)
    : { tirage: null, availableSessions: [], associationName: 'Mon Association' }

  return (
    <TirageClient
      tirage={data.tirage}
      availableSessions={data.availableSessions}
      associationName={data.associationName}
    />
  )
}
