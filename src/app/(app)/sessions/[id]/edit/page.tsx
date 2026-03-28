export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getServerUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { EditSessionClient } from './EditClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditSessionPage({ params }: Props) {
  const { id } = await params
  const user = await getServerUser()
  if (!user) notFound()

  const session = await db.Session.findOne({
    where: { id, association_id: user.association_id },
    attributes: ['id', 'name', 'date', 'description', 'max_cartons', 'status'],
    raw: true,
  }) as {
    id: string
    name: string
    date: string | null
    description: string | null
    max_cartons: number | null
    status: string
  } | null

  if (!session) notFound()

  return (
    <EditSessionClient
      session={{
        id:          session.id,
        name:        session.name,
        date:        session.date ?? undefined,
        description: session.description ?? undefined,
        max_cartons: session.max_cartons ?? undefined,
        status:      session.status as 'draft' | 'open' | 'running' | 'closed' | 'cancelled',
      }}
    />
  )
}
