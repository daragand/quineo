export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { getServerUser } from '@/lib/auth-server'
import ParametresClient from './ParametresClient'
import type { AssociationData, ProviderData } from './ParametresClient'
import { maskConfig } from '@/app/api/association/providers/route'

export default async function ParametresPage() {
  const user = await getServerUser()
  const assocId = user?.association_id

  const isSuperAdmin = user?.role === 'super_admin'

  const assoc = assocId
    ? await db.Association.findOne({
        where:      { id: assocId },
        attributes: ['id', 'name', 'siret', 'email', 'phone', 'address', 'require_birth_date'],
        raw:        true,
      }) as AssociationData | null
    : null

  const rawProviders = await db.PaymentProvider.findAll({
    where:      isSuperAdmin ? {} : { association_id: assocId ?? '' },
    attributes: ['id', 'name', 'type', 'active', 'config'],
    order:      [['name', 'ASC']],
    raw:        true,
  }) as unknown as Array<{ id: string; name: string; type: string; active: boolean; config: Record<string, string> | null }>

  const providers: ProviderData[] = rawProviders.map(p => ({
    id:     p.id,
    name:   p.name,
    type:   p.type,
    active: p.active,
    config: maskConfig(p.type, p.config ?? {}),
  }))

  return (
    <ParametresClient
      initialAssociation={assoc}
      initialProviders={providers}
    />
  )
}
