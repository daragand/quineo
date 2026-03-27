import { db } from '@/lib/db'
import { getServerUser } from '@/lib/auth-server'
import { AppShell } from '@/components/layout/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user   = await getServerUser()
  const assocId = user?.association_id

  const assoc = assocId
    ? await db.Association.findOne({
        where:      { id: assocId },
        attributes: ['name'],
        raw:        true,
      }) as { name: string } | null
    : null

  return (
    <AppShell associationName={assoc?.name ?? 'Mon Association'}>
      <div className="p-[22px]">
        {children}
      </div>
    </AppShell>
  )
}
