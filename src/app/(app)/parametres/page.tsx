import { db } from '@/lib/db'
import { getServerUser } from '@/lib/auth-server'
import ParametresClient from './ParametresClient'
import type { AssociationData, ProviderData } from './ParametresClient'

export default async function ParametresPage() {
  const user = await getServerUser()
  const assocId = user?.association_id

  const isSuperAdmin = user?.role === 'super_admin'

  const assoc = assocId
    ? await db.Association.findOne({
        where:      { id: assocId },
        attributes: ['id', 'name', 'siret', 'email', 'phone', 'address'],
        raw:        true,
      }) as AssociationData | null
    : null

  const providers = await db.PaymentProvider.findAll({
    where:      isSuperAdmin ? {} : { association_id: assocId ?? '' },
    attributes: ['id', 'name', 'type', 'active'],
    order:      [['name', 'ASC']],
    raw:        true,
  }) as unknown as ProviderData[]

  return (
    <ParametresClient
      initialAssociation={assoc}
      initialProviders={providers}
    />
  )
}
