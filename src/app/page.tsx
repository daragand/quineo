import { AppShell } from '@/components/layout/AppShell'
import { Topbar } from '@/components/layout/Topbar'
import { PageContent } from '@/components/layout/PageContent'
import DashboardPage from './(app)/dashboard/page'

export default function Home() {
  return (
    <AppShell associationName="Amis du Quartier">
      <Topbar title="Tableau de bord" userInitiales="AD" />
      <PageContent className="p-[22px]">
        <DashboardPage />
      </PageContent>
    </AppShell>
  )
}
